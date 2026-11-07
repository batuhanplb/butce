// Lehdarlar sayfasındaki sıralama tercihi (ölçüt + yön) hesabın ayarlarında
// tutulur; uygulamaya yeni girildiğinde oradan geri yüklenir.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";
import { describe, expect, it } from "vitest";
import * as C from "../../public/core.js";
import { formatAmountField } from "../../public/transaction-input.js";
import { incomeAmount, applyIncomeRange } from "../../public/cash-income.js";
import { changeSelected } from "../../public/transaction-bulk.js";

const here = path.dirname(fileURLToPath(import.meta.url));
// app.js bir ES modülüdür; jsdom modül çalıştıramadığı için import satırları
// silinir ve karşılıkları window'a elle verilir.
const APP_SRC = readFileSync(path.join(here, "../../public/app.js"), "utf8").replace(/^import[^\n]*\n/gm, "");

const SEED = {
  meta: {
    accounts: [{ id: "nakit", name: "Nakit", type: "nakit", color: "#0091ea", start: 0, order: 0 }],
    categories: [{ id: "c-mutfak", name: "Mutfak", parent: null, type: "E", color: "#93a083" }],
  },
  months: {
    "2026-10": [
      { id: "t1", d: "2026-10-05", k: "e", a: 100, t: "Market", cat: "c-mutfak", acc: "nakit" },
      { id: "t2", d: "2026-10-06", k: "e", a: 200, t: "Market", cat: "c-mutfak", acc: "nakit" },
      { id: "t3", d: "2026-10-07", k: "e", a: 500, t: "Benzin", cat: "c-mutfak", acc: "nakit" },
      { id: "t4", d: "2026-10-08", k: "e", a: 300, t: "Kira", cat: "c-mutfak", acc: "nakit" },
    ],
  },
  debts: {},
};

function boot(seed) {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"></div><dialog class="sheet" id="sheet"><div class="sh-in" id="sheet-in"></div></dialog></body></html>',
    { url: "http://localhost/?mock#pay", runScripts: "outside-only", virtualConsole: new VirtualConsole() },
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
  Object.assign(w, { C, incomeAmount, applyIncomeRange, changeSelected, formatAmountField });
  const dlg = w.document.getElementById("sheet");
  if (dlg && typeof dlg.showModal !== "function") {
    dlg.showModal = () => dlg.setAttribute("open", "");
    dlg.close = () => dlg.removeAttribute("open");
  }
  w.eval(APP_SRC);
  return dom;
}

const flush = () => new Promise(r => setTimeout(r, 30));
const rows = w => [...w.document.querySelectorAll(".catrow button.grow")].map(b => b.firstChild.textContent.trim());

describe("Lehdar sıralama tercihi", () => {
  it("sıralama tuşu ölçütü ve yönü hesabın ayarlarına yazar", async () => {
    const dom = boot(SEED);
    const w = dom.window;
    await flush();
    expect(w.document.querySelector('[data-act="pay-sort"]').textContent.trim()).toBe("İsme göre");
    w.document.querySelector('[data-act="pay-sort"]').dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    await flush();
    expect(w.__store.meta.paySort).toBe("n");
    expect(w.__store.meta.payDir).toBe("cok");
    expect(rows(w)[0]).toBe("Market"); // en çok işlem gören lehdar en başta
    dom.window.close();
  });

  it("yön tuşu da seçilen yönü kaydeder", async () => {
    const dom = boot({ ...SEED, meta: { ...SEED.meta, paySort: "n", payDir: "cok" } });
    const w = dom.window;
    await flush();
    w.document.querySelector('[data-act="pay-dir"]').dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    await flush();
    expect(w.__store.meta.paySort).toBe("n");
    expect(w.__store.meta.payDir).toBe("az");
    expect(w.document.querySelector('[data-act="pay-dir"]').getAttribute("title")).toBe("Azdan çoka");
    dom.window.close();
  });

  it("yeni ziyaret kaydedilen ölçütü ve yönü geri getirir", async () => {
    const dom = boot({ ...SEED, meta: { ...SEED.meta, paySort: "a", payDir: "cok" } });
    const w = dom.window;
    await flush();
    expect(w.document.querySelector('[data-act="pay-sort"]').textContent.trim()).toBe("Hacim");
    expect(w.document.querySelector('[data-act="pay-dir"]').getAttribute("title")).toBe("Çoktan aza");
    expect(rows(w)).toEqual(["Benzin", "Market", "Kira"]); // hacme göre azalan
    dom.window.close();
  });
});
