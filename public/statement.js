// Kredi kartı ekstresi: dönem hesabı, PDF metin ayrıştırma ve işlem eşleştirme.
// Tamamen cihazda çalışır; yapay zekâ / sunucu kullanılmaz.
const pad = n => String(n).padStart(2, "0");
const ymd = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const dim = (y, m) => new Date(y, m + 1, 0).getDate();

// Kesim günü c olan kartın, `now` tarihine göre son kesilen (off=0) ekstre dönemi [başlangıç, bitiş].
// Kesim günü o ekstreye dahildir; sonraki gün yeni döneme girer.
export function stmtRange(cut, now = new Date(), off = 0) {
  const c = Math.max(1, Math.min(31, Number(cut) || 1));
  let y = now.getFullYear(), m = now.getMonth();
  if (now.getDate() < Math.min(c, dim(y, m))) m--;
  m += off;
  const e = new Date(y, m, 1), s = new Date(y, m - 1, 1);
  const end = new Date(e.getFullYear(), e.getMonth(), Math.min(c, dim(e.getFullYear(), e.getMonth())));
  const st = new Date(s.getFullYear(), s.getMonth(), Math.min(c, dim(s.getFullYear(), s.getMonth())) + 1);
  return [ymd(st), ymd(end)];
}

// "1.234,56" / "1234,56" / "-45,00" / "45,00-" → sayı
export function parseTrAmount(s) {
  s = String(s).replace(/\s|TL|₺/g, "");
  const neg = /^-|-$/.test(s) || /^\(.*\)$/.test(s);
  s = s.replace(/[()+-]/g, "").replace(/\./g, "").replace(",", ".");
  const v = Number(s);
  return isFinite(v) ? (neg ? -v : v) : NaN;
}

const DATE_RE = /(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/;
const AMT_RE = /[-(]?\d{1,3}(?:\.\d{3})*,\d{2}\)?-?|[-(]?\d+,\d{2}\)?-?/g;

// Dönem borcu işlem toplamı değildir: devir, ödemeler ve iadeleri banka hesaplar.
export function statementTotal(lines, rows) {
  const LBL = /(?:d[öo]nem borcu|toplam d[öo]nem borcu|toplam bor[çc]|yeni bor[çc]|d[öo]nem toplam)/i;
  const MONEY = /-?\d{1,3}(?:\.\d{3})*,\d{2}/;
  const txt = lines.map(raw => raw.replace(/\s+/g, " ").trim());
  for (let i = 0; i < txt.length; i++) {
    if (!LBL.test(txt[i])) continue;
    // etiket + para birimi + tutar (aynı satır)
    let m = txt[i].match(/(?:d[öo]nem borcu|toplam d[öo]nem borcu|toplam bor[çc]|yeni bor[çc]|d[öo]nem toplam)\s*(?:TL|₺|TRY)\s*:?\s*([-\d.,]+)/i);
    if (m) { const a = parseTrAmount(m[1]); if (Number.isFinite(a)) return a; }
    // etiketle aynı satırda kuruşlu tutar
    m = txt[i].match(MONEY);
    if (m) { const a = parseTrAmount(m[0]); if (Number.isFinite(a)) return a; }
    // etiketin altındaki 1-3 satırda kuruşlu tutar
    for (let j = 1; j <= 3 && i + j < txt.length; j++) {
      m = txt[i + j].match(MONEY);
      if (m) { const a = parseTrAmount(m[0]); if (Number.isFinite(a)) return a; }
    }
  }
  // Başlık bulunamazsa önceki borç ödemelerini değil, yalnızca iadeleri düş.
  const total = rows.reduce((sum, row) => sum + (!row.credit ? row.a : /teşekkür|tesekkur/i.test(row.t) ? 0 : -row.a), 0);
  return Math.round(total * 100) / 100;
}

// PDF'den çıkarılmış satırlardan işlem listesi: {d, a, t, credit}
export function parseStatementLines(lines) {
  const out = [];
  for (const raw of lines) {
    const line = raw.replace(/\s+/g, " ").trim();
    const dm = line.match(DATE_RE);
    if (!dm || dm.index > 6) continue;
    let yy = Number(dm[3]); if (yy < 100) yy += 2000;
    const mo = Number(dm[2]), dd = Number(dm[1]);
    if (mo < 1 || mo > 12 || dd < 1 || dd > 31) continue;
    const rest = line.slice(dm.index + dm[0].length);
    const amts = rest.match(AMT_RE);
    if (!amts) continue;
    // Taksitli satırlarda ilk tutar genelde bu ayki taksittir; tek tutar varsa onu al.
    const first = amts[0];
    const a = parseTrAmount(first);
    if (!isFinite(a) || a === 0) continue;
    const t = rest.slice(0, rest.indexOf(first)).replace(DATE_RE, "").replace(/\s+/g, " ").trim();
    if (/önceki dönem|toplam|asgari|son ödeme|dönem borcu/i.test(t)) continue;
    const plus = rest.charAt(rest.indexOf(first) + first.length) === "+";
    // "FATURA ÖDEME" gibi harcamalar gider; kart ödemeleri "+" veya "teşekkür" ile gelir.
    const credit = a < 0 || plus || /iade|iptal|teşekkür|tesekkur/i.test(t);
    out.push({ d: yy + "-" + pad(mo) + "-" + pad(dd), a: Math.abs(a), t, credit });
  }
  return out;
}

const dayDiff = (a, b) => Math.abs((new Date(a) - new Date(b)) / 864e5);

// Açıklama benzerliği: Türkçe normalizasyon + token (Jaccard) + alt dize.
const norm = s => (s || "").toLocaleLowerCase("tr").replace(/[^a-zçğıöşü0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
function sim(a, b) {
  const A = norm(a), B = norm(b);
  if (!A || !B) return 0;
  if (A === B) return 1;
  if (A.includes(B) || B.includes(A)) return 0.9;
  const ta = new Set(A.split(" ").filter(w => w.length > 1));
  const tb = new Set(B.split(" ").filter(w => w.length > 1));
  if (!ta.size || !tb.size) return 0;
  let inter = 0; ta.forEach(w => { if (tb.has(w)) inter++; });
  return inter / new Set([...ta, ...tb]).size;
}
const txDesc = t => norm((t.t || "") + " " + (t.n || ""));
const isRefund = c => /iade|iptal|iadeler/i.test(c.t || "");

// Ekstre satırlarını uygulamadaki işlemlerle karşılaştırır.
// ok: yüksek güven eşleşme (elle / birebir / bölünmüş / iade-net);
// suggest: muhtemel ama onay bekleyen (açıklama zayıf, iade-net, kayma);
// diff: aynı gün ama tutar farklı; missing: bankada var bizde yok;
// extra: bizde var bankada yok; credits: ekstrenin iade/ödeme satırları.
export function reconcile(bank, mine, links = []) {
  const used = new Set(), ok = [], suggest = [], diff = [], missing = [];
  const debits = bank.filter(b => !b.credit);
  const creditRows = bank.filter(b => b.credit);
  const idx = new Map(mine.map((t, i) => [t.id, i]));
  const near = (t, b, n) => dayDiff(t.d, b.d) <= n;

  // 0) Kullanıcının elle eşleştirdikleri (iade-net dahil)
  const rest = [];
  for (const b of debits) {
    const L = links.find(l => l.d === b.d && Math.abs(l.a - b.a) < 0.01 && l.ids.every(id => idx.has(id) && !used.has(idx.get(id))));
    if (L) {
      const ts = L.ids.map(id => mine[idx.get(id)]);
      L.ids.forEach(id => used.add(idx.get(id)));
      if (L.ref) {
        const ci = creditRows.findIndex(c => c.d === L.ref.d && Math.abs(c.a - L.ref.a) < 0.01);
        const refund = ci >= 0 ? creditRows.splice(ci, 1)[0] : L.ref;
        ok.push({ b, t: ts[0], ts, manual: true, net: true, refund });
      } else ok.push({ b, t: ts[0], ts, manual: true });
    } else rest.push(b);
  }

  // 1) Birebir: tutar aynı, tarih ±5 gün; açıklama uyumluysa kesin, değilse öneri
  const still = [];
  for (const b of rest) {
    let best = null;
    mine.forEach((t, i) => {
      if (used.has(i)) return;
      if (Math.abs(t.a - b.a) >= 0.01) return;
      if (!near(t, b, 5)) return;
      const s = { i, dd: dayDiff(t.d, b.d), sc: sim(b.t, txDesc(t)) };
      if (!best || s.sc > best.sc + 0.001 || (Math.abs(s.sc - best.sc) <= 0.001 && s.dd < best.dd)) best = s;
    });
    if (best) {
      used.add(best.i);
      const item = { b, t: mine[best.i], ts: [mine[best.i]] };
      const db = norm(b.t), dm = txDesc(mine[best.i]);
      const sure = best.sc >= 0.35 || (best.dd === 0 && (!db || !dm));
      (sure ? ok : suggest).push(item);
    } else still.push(b);
  }

  // 2) Bölünmüş: ±5 gündeki 2-3 işlemin toplamı ekstre satırına eşit
  const left = [];
  for (const b of still) {
    const c = mine.map((t, i) => i).filter(i => !used.has(i) && near(mine[i], b, 5) && mine[i].a < b.a + 0.01);
    let hit = null;
    for (let x = 0; x < c.length && !hit; x++) for (let y = x + 1; y < c.length && !hit; y++) {
      const s2 = mine[c[x]].a + mine[c[y]].a;
      if (Math.abs(s2 - b.a) < 0.01) { hit = [c[x], c[y]]; break; }
      for (let z = y + 1; z < c.length; z++) if (Math.abs(s2 + mine[c[z]].a - b.a) < 0.01) { hit = [c[x], c[y], c[z]]; break; }
    }
    if (hit) { hit.forEach(i => used.add(i)); ok.push({ b, t: mine[hit[0]], ts: hit.map(i => mine[i]), split: true }); }
    else left.push(b);
  }

  // 3) İade-net: gider A + iade R net olarak yazılmışsa öner (ör. 1000 gider, 150 iade → 850)
  const left2 = [];
  for (const b of left) {
    const ref = creditRows.find(c => c.d >= b.d && dayDiff(c.d, b.d) <= 3 && c.a < b.a && (isRefund(c) || sim(b.t, c.t) >= 0.35));
    let best = null;
    if (ref) {
      const net = Math.round((b.a - ref.a) * 100) / 100;
      mine.forEach((t, i) => {
        if (used.has(i)) return;
        if (Math.abs(t.a - net) >= 0.01) return;
        if (!near(t, b, 5)) return;
        if (!best || dayDiff(t.d, b.d) < best.dd) best = { i };
      });
    }
    if (best) {
      used.add(best.i);
      creditRows.splice(creditRows.indexOf(ref), 1);
      suggest.push({ b, t: mine[best.i], ts: [mine[best.i]], net: true, refund: ref });
    } else left2.push(b);
  }

  // 4) Tutar farkı: aynı gün (±2) kalan işlemle
  const still2 = [];
  for (const b of left2) {
    let best = null;
    mine.forEach((t, i) => { if (!used.has(i) && near(t, b, 2)) { const r = Math.abs(t.a - b.a) / Math.max(t.a, b.a); if (r < 0.5 && (!best || r < best.r)) best = { i, r }; } });
    if (best) { used.add(best.i); diff.push({ b, t: mine[best.i] }); } else still2.push(b);
  }

  const extra = mine.filter((_, i) => !used.has(i));
  return { ok, suggest, diff, missing: still2, extra, credits: creditRows };
}

export function statementRowKey(kind, b, t) {
  return JSON.stringify([kind, b ? [b.d, b.a, b.t, !!b.credit] : null, t?.id || null]);
}

// Yoksay yalnızca karşılaştırma sonucunu filtreler; tutarlara ve işlemlere dokunmaz.
export function ignoreStatementRows(result, keys = []) {
  const hidden = new Set(keys), ignored = [];
  const filter = (list, kind) => list.filter(value => {
    const b = kind === "miss" ? value : kind === "extra" ? null : value.b;
    const t = kind === "extra" ? value : kind === "miss" ? null : value.t;
    const key = statementRowKey(kind, b, t);
    if (!hidden.has(key)) return true;
    ignored.push({ b, t, key });
    return false;
  });
  return { ...result, missing: filter(result.missing, "miss"), diff: filter(result.diff, "diff"), extra: filter(result.extra, "extra"), ok: filter(result.ok, "ok"), suggest: filter(result.suggest || [], "suggest"), ignored };
}

// pdf.js ile PDF'i satırlara çevirir (yalnızca tarayıcıda).
export async function pdfLines(file) {
  const pdfjs = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const tc = await (await doc.getPage(p)).getTextContent();
    const rows = new Map();
    for (const it of tc.items) {
      if (!it.str || !it.str.trim()) continue;
      const y = Math.round(it.transform[5] / 3);
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y).push([it.transform[4], it.str]);
    }
    [...rows.entries()].sort((a, b) => b[0] - a[0]).forEach(([, r]) => lines.push(r.sort((a, b) => a[0] - b[0]).map(x => x[1]).join(" ")));
  }
  return lines;
}
