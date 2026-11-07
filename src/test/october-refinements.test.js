import { describe, expect, it } from "vitest";
import { incomeAmount, applyIncomeRange, periodsToAmts } from "../../public/cash-income.js";
import { changeSelected } from "../../public/transaction-bulk.js";
import { addM } from "../../public/core.js";
import * as C from "../../public/core.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { formatAmountField } from "../../public/transaction-input.js";
import { simMonths, simEstimate, simRemaining, simMonthlyTotals, SIM_LOOKBACK } from "../../public/cash-sim.js";

async function app() {
  const dom = new JSDOM('<div id="root"></div><dialog id="sheet"><div id="sheet-in"></div></dialog>', { url: "http://localhost/?mock#tx", runScripts: "outside-only" });
  const w = dom.window;
  w.__MOCK_SEED__ = { meta: { accounts: [], categories: [], cash: { items: [] } }, months: {}, debts: {} };
  w.matchMedia = () => ({ matches: false });
  w.scrollTo = (x, y) => { w.scrollY = y; };
  w.requestAnimationFrame = cb => w.setTimeout(cb, 0);
  w.cancelAnimationFrame = id => w.clearTimeout(id);
  w.document.getElementById("sheet").showModal = function () { this.setAttribute("open", ""); };
  w.document.getElementById("sheet").close = function () { this.removeAttribute("open"); };
  Object.assign(w, { C, incomeAmount, applyIncomeRange, periodsToAmts, changeSelected, formatAmountField, simMonths, simEstimate, simRemaining, simMonthlyTotals, SIM_LOOKBACK });
  w.eval(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../public/app.js"), "utf8").replace(/^import[^\n]*\n/gm, "") + '\nwindow.state = S; window.setDraft = c => { D = { view: "ci", ci: c }; renderSettings(); }; window.getRange = perRange; window.remember = rememberScroll; window.restore = restoreScroll;');
  await new Promise(r => setTimeout(r, 30));
  return dom;
}

describe("Gelir kaydı ve gezinme kuralları", () => {
  it("kaydetme geçmiş planı, gerçek tutarı ve gerçekleşme işaretlerini korur", async () => {
    const dom = await app(), w = dom.window;
    const cm = C.ymd(new Date()).slice(0, 7), past = addM(cm, -1);
    w.setDraft({ id: "salary", k: "inc", name: "Maaş", rep: "m", mode: "var", pers: [{ n: 6, a: 50000 }, { n: 6, a: 60000 }], start: past, a: "50.000", _orig: 50000, eff: cm, amts: [{ from: past, a: 45000 }, { from: cm, a: 50000 }, { from: addM(cm, 6), a: 60000 }], act: { [past]: 44000 }, skip: [past] });
    w.document.querySelector('[data-act="ci-save"]').click();
    await new Promise(r => setTimeout(r, 30));
    const item = w.__store.meta.cash.items[0];
    expect(item.act).toEqual({ [past]: 44000 });
    expect(item.skip).toEqual([past]);
    expect(incomeAmount(item.amts, past)).toBe(45000);
    expect(incomeAmount(item.amts, addM(cm, 6))).toBe(60000);
    w.close();
  });
  it("işlemlerde varsayılan dönem bugünden geriye 30 gündür", async () => {
    const dom = await app(), w = dom.window, from = new Date(); from.setDate(from.getDate() - 29);
    expect(w.state.per).toBe("30");
    expect(w.getRange()).toEqual([C.ymd(from), C.ymd(new Date())]);
    w.close();
  });
  it("işlemlerden dönünce önceki ekranın kaydırma konumu korunur", async () => {
    const dom = await app(), w = dom.window;
    w.state.view = "home"; w.scrollTo(0, 620); w.remember();
    w.state.view = "tx"; w.scrollTo(0, 980); w.remember();
    w.restore("home"); expect(w.scrollY).toBe(620);
    w.restore("tx"); expect(w.scrollY).toBe(980);
    w.close();
  });
});

describe("Gelecek gelir dönemleri", () => {
  it("6 aylık tutar önceki ayları değiştirmez ve sonraki plana döner", () => {
    const plan = [{ from: "2026-10", a: 50000 }, { from: "2027-07", a: 70000 }];
    const next = applyIncomeRange(plan, "2027-01", 6, 60000, addM);
    expect(incomeAmount(next, "2026-12")).toBe(50000);
    for (let i = 0; i < 6; i++) expect(incomeAmount(next, addM("2027-01", i))).toBe(60000);
    expect(incomeAmount(next, "2027-07")).toBe(70000);
    expect(plan).toEqual([{ from: "2026-10", a: 50000 }, { from: "2027-07", a: 70000 }]);
  });
  it("tek ay düzenlemesi yalnızca o ayı değiştirir", () => {
    const next = applyIncomeRange([{ from: "2026-10", a: 50000 }], "2026-12", 1, 55000, addM);
    expect(incomeAmount(next, "2026-11")).toBe(50000);
    expect(incomeAmount(next, "2026-12")).toBe(55000);
    expect(incomeAmount(next, "2027-01")).toBe(50000);
  });
});
describe("Toplu işlem düzenleme", () => {
  const tx = { id: "t1", d: "2026-10-29", a: 1250, t: "Migros", k: "e", cat: "old", acc: "cash" };
  it("seçili işlem başka kategoriye taşınır; tarih, tutar ve özel lehdar korunur", () => {
    expect(changeSelected(tx, { t1: "2026-10" }, "cat", { id: "new", type: "E" })).toEqual({ ...tx, cat: "new" });
    expect(changeSelected(tx, {}, "cat", { id: "new", type: "E" })).toBe(tx);
  });
  it("seçili işlem başka hesaba taşınır", () => {
    expect(changeSelected(tx, { t1: "2026-10" }, "acc", { id: "bank" })).toEqual({ ...tx, acc: "bank" });
  });
  it("gider işlemine gelir kategorisi verilebilir", () => {
    expect(changeSelected(tx, { t1: "2026-10" }, "cat", { id: "salary", type: "I" })).toEqual({ ...tx, cat: "salary" });
  });
  it("aynı hesaba transfer oluşturmaz", () => {
    const transfer = { ...tx, k: "tr", to: "bank" };
    expect(changeSelected(transfer, { t1: "2026-10" }, "acc", { id: "bank" })).toBe(transfer);
  });
});
import { describe as d2, it as i2, expect as e2 } from "vitest";
d2("variable income periods", () => {
  const add = (m, n) => { const [y, mo] = m.split("-").map(Number); const t = y * 12 + mo - 1 + n; return Math.floor(t / 12) + "-" + String(t % 12 + 1).padStart(2, "0"); };
  i2("6 ay 30.000 sonra 35.000 devam, geçmiş korunur", () => {
    const r = periodsToAmts([{ from: "2026-01", a: 25000 }, { from: "2026-12", a: 1 }], "2026-11", [{ n: 6, a: 30000 }, { n: 6, a: 35000 }], add);
    e2(r).toEqual([{ from: "2026-01", a: 25000 }, { from: "2026-11", a: 30000 }, { from: "2027-05", a: 35000 }]);
  });
});
