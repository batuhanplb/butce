// Ekstre sayfasındaki "tarihe göre sıralama" tercihi (en yeni / en eski)
// hesabın ayarlarında tutulur; uygulamaya yeni girildiğinde oradan geri yüklenir.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";
import { describe, expect, it } from "vitest";
import * as C from "../../public/core.js";
import { formatAmountField } from "../../public/transaction-input.js";
import { incomeAmount, applyIncomeRange } from "../../public/cash-income.js";
import { changeSelected } from "../../public/transaction-bulk.js";
import { stmtRange, parseStatementLines, reconcile, pdfLines } from "../../public/statement.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const APP_SRC = readFileSync(path.join(here, "../../public/app.js"), "utf8").replace(/^import[^\n]*\n/gm, "");

// Kesim günü 1 olan bir kredi kartı ve içinde bulunduğu ekstre dönemine düşen
// üç işlem: gün 2, 5, 9.
function seedStmt(extraMeta) {
  const [s] = stmtRange(1);
  const day = n => C.ymd(new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10) + n));
  const ds = [day(2), day(5), day(9)];
  const names = ["Süt", "Kira", "Su"];
  const months = {};
  ds.forEach((d, i) => {
    const k = d.slice(0, 7);
    (months[k] = months[k] || []).push({ id: "t" + i, d, k: "e", a: 100 + i, t: names[i], cat: "c-mutfak", acc: "kart" });
  });
  return {
    meta: {
      accounts: [{ id: "kart", name: "Kart", type: "kart", color: "#0091ea", start: 0, order: 0, cut: 1 }],
      categories: [{ id: "c-mutfak", name: "Mutfak", parent: null, type: "E", color: "#93a083" }],
      ...extraMeta,
    },
    months,
    debts: {},
  };
}

function boot(seed) {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"></div><dialog class="sheet" id="sheet"><div class="sh-in" id="sheet-in"></div></dialog></body></html>',
    { url: "http://localhost/?mock#acc", runScripts: "outside-only", virtualConsole: new VirtualConsole() },
  );
  const w = dom.window;
  w.__MOCK_SEED__ = JSON.parse(JSON.stringify(seed));
  w.requestAnimationFrame = cb => w.setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = id => w.clearTimeout(id);
  w.matchMedia = q => ({ matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false });
  if (!w.crypto || !w.crypto.getRandomValues) {
    Object.defineProperty(w, "crypto", {
      configurable: true,
      value: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); return a; } },
    });
  }
  Object.assign(w, { C, incomeAmount, applyIncomeRange, changeSelected, formatAmountField, stmtRange, parseStatementLines, reconcile, pdfLines });
  const dlg = w.document.getElementById("sheet");
  if (dlg && typeof dlg.showModal !== "function") {
    dlg.showModal = () => dlg.setAttribute("open", "");
    dlg.close = () => dlg.removeAttribute("open");
  }
  w.eval(APP_SRC);
  return dom;
}

const flush = () => new Promise(r => setTimeout(r, 30));
const click = (w, sel) => w.document.querySelector(sel).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
const rows = w => [...w.document.querySelectorAll("ul.list .tx .t")].map(b => b.textContent.trim());

async function openStmt(seed) {
  const dom = boot(seed);
  const w = dom.window;
  await flush();
  click(w, '[data-act="stmt"][data-id="kart"]');
  await flush();
  return { dom, w };
}

describe("Ekstre tarih sıralaması", () => {
  it("sıralama tuşu yönü hesabın ayarlarına yazar ve listeyi tersine çevirir", async () => {
    const { dom, w } = await openStmt(seedStmt());
    expect(w.document.querySelector('[data-act="stmt-sort"]').textContent.trim()).toBe("En yeni");
    expect(rows(w)).toEqual(["Su", "Kira", "Süt"]); // en yeni tarih en üstte
    click(w, '[data-act="stmt-sort"]');
    await flush();
    expect(w.__store.meta.stmtSort).toBe("esk");
    expect(w.document.querySelector('[data-act="stmt-sort"]').textContent.trim()).toBe("En eski");
    expect(rows(w)).toEqual(["Süt", "Kira", "Su"]);
    dom.window.close();
  });

  it("yeni ziyaret kaydedilen yönü geri getirir", async () => {
    const { dom, w } = await openStmt(seedStmt({ stmtSort: "esk" }));
    expect(w.document.querySelector('[data-act="stmt-sort"]').textContent.trim()).toBe("En eski");
    expect(rows(w)).toEqual(["Süt", "Kira", "Su"]);
    dom.window.close();
  });
});
