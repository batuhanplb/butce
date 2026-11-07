// Tanıtım (giriş öncesi) ekranı: "Neler yapabilirsin" maddelerinin her birinin
// altında ilgili sayfanın küçük bir örneği (.ld-mini) durur. Örnekler renklerini
// yalnızca tema değişkenlerinden alır; böylece uygulamanın görsel dili değişince
// tanıtım ekranındaki görseller de aynı görünümü izler.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";
import { describe, expect, it } from "vitest";
import * as C from "../../public/core.js";
import { simMonths, simEstimate, simRemaining, simMonthlyTotals, SIM_LOOKBACK } from "../../public/cash-sim.js";
import { formatAmountField } from "../../public/transaction-input.js";
import { incomeAmount, applyIncomeRange } from "../../public/cash-income.js";
import { changeSelected } from "../../public/transaction-bulk.js";

const here = path.dirname(fileURLToPath(import.meta.url));
// app.js bir ES modülüdür; jsdom modül çalıştıramadığı için import satırları
// silinir ve karşılıkları window'a elle verilir. Sona eklenen köprü, oturumu
// kapatıp giriş öncesi ekranı çizer (S modül kapsamında kaldığı için dışarıdan
// doğrudan erişilemez).
const APP_SRC = readFileSync(path.join(here, "../../public/app.js"), "utf8").replace(/^import[^\n]*\n/gm, "") +
  "\n;window.__showLanding = function(){ S.user = null; render(); };";

// Tanıtım ekranındaki özellik başlıkları; yeni bir madde eklenirse buraya da
// yazılmalı, böylece örneksiz madde yayına çıkmaz.
const FEATURES = [
  "Nakit akışı",
  "Değişken tutarlar",
  "Kart kesim uyarısı",
  "Borç takvimi",
  "Düzenli ve abonelik",
  "Aylık rapor",
  "Günlük harcama",
  "Toplu işlem",
  "Kendi ana sayfan",
  "Paylaşım linki",
  "Kolay geçiş",
];

function boot() {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"></div><dialog class="sheet" id="sheet"><div class="sh-in" id="sheet-in"></div></dialog></body></html>',
    { url: "http://localhost/?mock", runScripts: "outside-only", virtualConsole: new VirtualConsole() },
  );
  const w = dom.window;
  w.__MOCK_SEED__ = { meta: { accounts: [], categories: [] }, months: {}, debts: {} };
  w.matchMedia = q => ({ matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false });
  w.requestAnimationFrame = cb => w.setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = id => w.clearTimeout(id);
  if (!w.crypto || !w.crypto.getRandomValues) {
    Object.defineProperty(w, "crypto", {
      configurable: true,
      value: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); return a; } },
    });
  }
  Object.assign(w, { C, incomeAmount, applyIncomeRange, changeSelected, formatAmountField, simMonths, simEstimate, simRemaining, simMonthlyTotals, SIM_LOOKBACK });
  const dlg = w.document.getElementById("sheet");
  if (dlg && typeof dlg.showModal !== "function") {
    dlg.showModal = () => dlg.setAttribute("open", "");
    dlg.close = () => dlg.removeAttribute("open");
  }
  w.eval(APP_SRC);
  return dom;
}

const flush = () => new Promise(r => setTimeout(r, 20));
const txt = el => (el ? el.textContent.replace(/\s+/g, " ").trim() : "");

// Giriş yapılmamış hâl: mock mağaza kullanıcı döndürdüğü için oturum elle kapatılır.
async function landing() {
  const dom = boot();
  await flush();
  dom.window.__showLanding();
  await flush();
  return dom;
}

describe("Tanıtım ekranı özellik örnekleri", () => {
  it("her özelliğin altında bir örnek görsel var", async () => {
    const dom = await landing();
    const doc = dom.window.document;
    const cards = [...doc.querySelectorAll(".ld-feat > div")];
    expect(cards.map(c => txt(c.querySelector(":scope > b")))).toEqual(FEATURES);
    cards.forEach(card => {
      const mini = card.querySelector(".ld-mini");
      expect(mini).not.toBeNull();
      // Örnek boş kabuk olmasın: en az bir başlık ve bir satır içermeli.
      expect(mini.innerHTML.trim().length).toBeGreaterThan(120);
      expect(mini.querySelector(".m-top, .m-cap, .m-r, .m-spark, .m-grid")).not.toBeNull();
    });
    dom.window.close();
  });

  it("örnekler renklerini yalnızca tema değişkenlerinden alır", async () => {
    const dom = await landing();
    const minis = [...dom.window.document.querySelectorAll(".ld-mini")];
    expect(minis.length).toBe(FEATURES.length);
    minis.forEach(mini => {
      // Sert kodlanmış renk yok: tema değişince örnek de birlikte değişir.
      expect(mini.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(mini.innerHTML).not.toMatch(/style="[^"]*(?:color|background|border-color)/i);
    });
    dom.window.close();
  });

  it("örnekler gerçek sayfa adlarını ve tutarları gösterir", async () => {
    const dom = await landing();
    const doc = dom.window.document;
    const heads = [...doc.querySelectorAll(".ld-mini .m-top span:first-child")].map(txt);
    ["Nakit akışı", "Elektrik", "Öneri ve dikkat", "Borç takvimi", "Abonelikler", "Ekim raporu", "Günlük harcama", "Paylaşım", "İçe aktar"].forEach(h => {
      expect(heads).toContain(h);
    });
    // Tutarlar tabular hizalı ve kırılmaz satırlarda gösterilir.
    const values = doc.querySelectorAll(".ld-mini .m-v b").length;
    expect(values).toBeGreaterThan(20);
    dom.window.close();
  });
});
