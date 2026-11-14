'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   FIT-Import: liest .fit-Dateien (Garmin, Wahoo, intervals.icu-Export …),
   auch gepackt als .zip oder .fit.gz. Läuft komplett im Browser – nichts wird
   hochgeladen. Ohne Bibliotheken, damit es auch offline und auf älteren
   iPhones funktioniert.
   ═══════════════════════════════════════════════════════════════════════════ */
const FIT = (function () {

/* ── Entpacken (Deflate, RFC 1951) ── */
const LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
const LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
const DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
const CLORD = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
function tree(len, off, n) {
  const count = new Uint16Array(16), symbol = new Uint16Array(n), offs = new Uint16Array(16);
  for (let i = 0; i < n; i++) count[len[off + i]]++;
  count[0] = 0;
  for (let i = 0, sum = 0; i < 16; i++) { offs[i] = sum; sum += count[i]; }
  for (let i = 0; i < n; i++) if (len[off + i]) symbol[offs[len[off + i]]++] = i;
  return { count, symbol };
}
let FIXL = null, FIXD = null;
function inflate(src, hint) {
  let pos = 0, buf = 0, cnt = 0, op = 0, out = new Uint8Array(hint || Math.max(1024, src.length * 4));
  const grow = n => { if (op + n > out.length) { const b = new Uint8Array(Math.max(out.length * 2, op + n)); b.set(out); out = b; } };
  const bits = n => { while (cnt < n) { if (pos >= src.length) throw new Error('Datei beschädigt'); buf |= src[pos++] << cnt; cnt += 8; } const v = buf & ((1 << n) - 1); buf >>>= n; cnt -= n; return v; };
  const sym = t => { let sum = 0, cur = 0, len = 0; do { cur = 2 * cur + bits(1); len++; if (len > 15) throw new Error('Datei beschädigt'); sum += t.count[len]; cur -= t.count[len]; } while (cur >= 0); return t.symbol[sum + cur]; };
  let last;
  do {
    last = bits(1);
    const type = bits(2);
    if (type === 0) {
      buf = 0; cnt = 0;
      const n = src[pos] | (src[pos + 1] << 8); pos += 4;
      grow(n); out.set(src.subarray(pos, pos + n), op); op += n; pos += n;
      continue;
    }
    let lt, dt;
    if (type === 1) {
      if (!FIXL) {
        const l = new Uint8Array(288); l.fill(8, 0, 144); l.fill(9, 144, 256); l.fill(7, 256, 280); l.fill(8, 280, 288);
        FIXL = tree(l, 0, 288); FIXD = tree(new Uint8Array(30).fill(5), 0, 30);
      }
      lt = FIXL; dt = FIXD;
    } else if (type === 2) {
      const hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4, cl = new Uint8Array(19), lens = new Uint8Array(hlit + hdist);
      for (let i = 0; i < hclen; i++) cl[CLORD[i]] = bits(3);
      const ct = tree(cl, 0, 19);
      for (let i = 0; i < hlit + hdist;) {
        const s = sym(ct);
        if (s < 16) lens[i++] = s;
        else if (s === 16) { const p = lens[i - 1]; for (let r = 3 + bits(2); r--;) lens[i++] = p; }
        else if (s === 17) i += 3 + bits(3);
        else i += 11 + bits(7);
      }
      lt = tree(lens, 0, hlit); dt = tree(lens, hlit, hdist);
    } else throw new Error('Datei beschädigt');
    for (;;) {
      const s = sym(lt);
      if (s < 256) { grow(1); out[op++] = s; continue; }
      if (s === 256) break;
      const len = LBASE[s - 257] + bits(LEXT[s - 257]), d = sym(dt), dist = DBASE[d] + bits(DEXT[d]);
      if (dist > op) throw new Error('Datei beschädigt');
      grow(len);
      for (let i = 0; i < len; i++, op++) out[op] = out[op - dist];
    }
  } while (!last);
  return out.subarray(0, op);
}
function gunzip(u8) {
  if (u8[0] !== 0x1f || u8[1] !== 0x8b) throw new Error('Keine gzip-Datei');
  const flg = u8[3]; let p = 10;
  if (flg & 4) p += 2 + (u8[p] | (u8[p + 1] << 8));
  if (flg & 8) { while (u8[p++]); }
  if (flg & 16) { while (u8[p++]); }
  if (flg & 2) p += 2;
  return inflate(u8.subarray(p, u8.length - 8));
}
// ZIP: Inhaltsverzeichnis am Dateiende lesen, Einträge bei Bedarf entpacken
function unzip(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let e = u8.length - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('Keine gültige ZIP-Datei');
  const n = dv.getUint16(e + 10, true), dec = new TextDecoder();
  let p = dv.getUint32(e + 16, true);
  const files = [];
  for (let i = 0; i < n && p + 46 <= u8.length; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), usize = dv.getUint32(p + 24, true);
    const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nl));
    p += 46 + nl + xl + cl;
    if (name.endsWith('/')) continue;
    files.push({
      name, size: usize,
      data() {
        const start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true), raw = u8.subarray(start, start + csize);
        if (method === 0) return raw;
        if (method === 8) return inflate(raw, usize || undefined);
        throw new Error('Packverfahren nicht unterstützt');
      }
    });
  }
  return files;
}

/* ── FIT lesen ── */
const EPOCH = 631065600; // FIT zählt Sekunden ab 31.12.1989
const WANT = {
  18: { 253: 'ts', 2: 'start', 5: 'sport', 6: 'sub', 7: 'elapsed', 8: 'timer', 9: 'dist', 11: 'kcal', 14: 'spd', 16: 'hr', 17: 'hrmax', 18: 'cad', 20: 'pw', 21: 'pwmax', 22: 'asc', 34: 'np', 35: 'tss', 36: 'if', 45: 'ftp', 48: 'work', 124: 'espd' },
  20: { 253: 'ts', 2: 'alt', 78: 'ealt', 3: 'hr', 4: 'cad', 5: 'dist', 7: 'pw' }
};
function parse(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const hs = u8[0];
  if (u8.length < 14 || String.fromCharCode(u8[8], u8[9], u8[10], u8[11]) !== '.FIT') throw new Error('Keine FIT-Datei');
  const end = Math.min(u8.length, hs + dv.getUint32(4, true));
  const defs = {}, sessions = [], recs = [];
  let p = hs, lastTs = 0;
  while (p < end) {
    const h = u8[p++];
    let local, tsOff = null;
    if (h & 0x80) { local = (h >> 5) & 3; tsOff = h & 0x1f; }
    else if (h & 0x40) {
      local = h & 0x0f;
      const le = u8[p + 1] === 0, g = dv.getUint16(p + 2, le), nf = u8[p + 4];
      const fields = []; let q = p + 5, size = 0;
      for (let i = 0; i < nf; i++, q += 3) { fields.push({ num: u8[q], size: u8[q + 1] }); size += u8[q + 1]; }
      if (h & 0x20) { const nd = u8[q++]; for (let i = 0; i < nd; i++, q += 3) size += u8[q + 1]; }
      defs[local] = { le, g, fields, size };
      p = q; continue;
    } else local = h & 0x0f;
    const d = defs[local];
    if (!d) throw new Error('FIT-Datei beschädigt');
    const want = WANT[d.g];
    if (want || tsOff != null) {
      const m = {}; let q = p;
      for (const f of d.fields) {
        const key = want && want[f.num];
        if (key || f.num === 253) {
          let v = null;
          if (f.size === 1) { v = u8[q]; if (v === 0xff) v = null; }
          else if (f.size === 2) { v = dv.getUint16(q, d.le); if (v === 0xffff) v = null; }
          else if (f.size === 4) { v = dv.getUint32(q, d.le); if (v === 0xffffffff) v = null; }
          if (f.num === 253 && v != null) lastTs = v;
          if (key && v != null) m[key] = v;
        }
        q += f.size;
      }
      if (tsOff != null) { let t = (lastTs & ~0x1f) + tsOff; if (tsOff < (lastTs & 0x1f)) t += 0x20; lastTs = t; m.ts = t; }
      if (d.g === 18) sessions.push(m); else if (d.g === 20 && m.ts != null) recs.push(m);
    }
    p += d.size;
  }
  return { sessions, recs };
}

/* ── Auswertung ── */
const SPORT = { 0: 'Aktivität', 1: 'Laufen', 4: 'Fitnessgerät', 5: 'Schwimmen', 10: 'Training', 11: 'Gehen', 12: 'Langlauf', 13: 'Ski alpin', 15: 'Rudern', 17: 'Wandern', 19: 'Paddeln', 31: 'Klettern', 37: 'Stand-up-Paddling' };
const SUB = { 6: 'Indoor-Fahrt', 7: 'Rennradfahrt', 8: 'Mountainbike', 46: 'Gravel-Fahrt', 58: 'Virtuelle Fahrt', 11: 'Cyclocross', 28: 'E-Bike' };
const r1 = (n, d) => { const f = Math.pow(10, d || 0); return Math.round(n * f) / f; };
// Sekundenraster der Leistung: kurze Lücken auffüllen, Pausen (> 10 s) auslassen
function powerSeries(recs) {
  const out = [];
  for (let i = 0; i < recs.length; i++) {
    const r = recs[i], nx = recs[i + 1], gap = nx ? nx.ts - r.ts : 1, v = r.pw == null ? 0 : r.pw;
    for (let k = 0, n = gap > 0 && gap <= 10 ? gap : 1; k < n; k++) out.push(v);
  }
  return out;
}
function bestAvg(a, win) {
  if (a.length < win) return null;
  let sum = 0, best = 0;
  for (let i = 0; i < a.length; i++) { sum += a[i]; if (i >= win) sum -= a[i - win]; if (i >= win - 1 && sum > best) best = sum; }
  return Math.round(best / win);
}
function normPower(a) {
  if (a.length < 300) return null;
  let sum = 0, acc = 0, n = 0;
  for (let i = 0; i < a.length; i++) { sum += a[i]; if (i >= 30) sum -= a[i - 30]; if (i >= 29) { const m = sum / 30; acc += m * m * m * m; n++; } }
  return Math.round(Math.pow(acc / n, 0.25));
}
// Leistungsverteilung in 20-Watt-Stufen (Sekunden) – daraus lassen sich Zonen für jeden FTP berechnen
function histogram(a) {
  const h = [];
  for (let i = 0; i < a.length; i++) { const k = Math.min(60, Math.floor(a[i] / 20)); h[k] = (h[k] || 0) + 1; }
  for (let i = 0; i < h.length; i++) if (!h[i]) h[i] = 0;
  return h;
}
// Eine FIT-Datei → Zusammenfassung (ohne Rohdaten, damit der Speicher klein bleibt)
function summarize(u8) {
  const { sessions, recs } = parse(u8);
  const s = sessions[0] || {};
  if (sessions.length > 1) sessions.slice(1).forEach(x => { if (x.sport === s.sport) ['timer', 'elapsed', 'dist', 'asc', 'work', 'kcal'].forEach(k => { if (x[k]) s[k] = (s[k] || 0) + x[k]; }); });
  const t0 = s.start != null ? s.start : recs.length ? recs[0].ts : s.ts;
  if (t0 == null) throw new Error('Keine Aktivität in der Datei');
  const tN = recs.length ? recs[recs.length - 1].ts : t0;
  const sec = s.timer ? s.timer / 1000 : s.elapsed ? s.elapsed / 1000 : (recs.length ? Math.max(0, tN - recs[0].ts) : 0);
  let dist = s.dist != null ? s.dist / 100 : 0;
  if (!dist) for (let i = recs.length - 1; i >= 0; i--) if (recs[i].dist != null) { dist = recs[i].dist / 100; break; }
  let asc = s.asc;
  if (asc == null) { asc = 0; let ref = null; recs.forEach(r => { const a = r.ealt != null ? r.ealt / 5 - 500 : r.alt != null ? r.alt / 5 - 500 : null; if (a == null) return; if (ref == null) ref = a; else if (a - ref >= 3) { asc += a - ref; ref = a; } else if (ref - a >= 3) ref = a; }); }
  const sport = s.sport == null ? (recs.some(r => r.pw != null || r.cad != null) ? 2 : 0) : s.sport;
  const isRide = sport === 2 || sport === 21;
  const out = { start: (t0 + EPOCH) * 1000, ride: isRide, name: isRide ? (sport === 21 ? 'E-Bike-Fahrt' : SUB[s.sub] || 'Radfahrt') : SPORT[sport] || 'Aktivität', min: r1(sec / 60, 1) };
  if (dist) out.km = r1(dist / 1000, 2);
  if (asc) out.hm = Math.round(asc);
  const spd = s.espd || s.spd; if (spd) out.kmh = r1(spd / 1000 * 3.6, 1); else if (dist && sec) out.kmh = r1(dist / sec * 3.6, 1);
  const mean = k => { let n = 0, sum = 0; recs.forEach(r => { if (r[k] != null) { sum += r[k]; n++; } }); return n ? sum / n : null; };
  const hr = s.hr || mean('hr'); if (hr) out.hr = Math.round(hr);
  if (s.hrmax) out.hrmax = s.hrmax;
  const cad = s.cad || mean('cad'); if (cad) out.cad = Math.round(cad);
  if (!isRide) return out;
  const hasPw = recs.some(r => r.pw != null), ps = hasPw ? powerSeries(recs) : [];
  const w = s.pw || (hasPw ? ps.reduce((a, b) => a + b, 0) / (ps.length || 1) : null);
  if (w) {
    out.w = Math.round(w);
    const np = s.np || normPower(ps); if (np) out.np = np;
    if (s.pwmax) out.wmax = s.pwmax;
    if (s.work) out.kj = Math.round(s.work / 1000); else out.kj = Math.round(w * sec / 1000);
    if (ps.length) { const pb = {}; [5, 60, 300, 1200].forEach(n => { const b = bestAvg(ps, n); if (b) pb[n] = b; }); if (Object.keys(pb).length) out.pb = pb; }
    if (ps.length) out.ph = histogram(ps);
    if (s.tss) out.tssDev = Math.round(s.tss / 10);
    if (s.ftp) out.ftpDev = s.ftp;
  }
  return out;
}

return { inflate, gunzip, unzip, parse, summarize };
})();
if (typeof module !== 'undefined') module.exports = FIT;
