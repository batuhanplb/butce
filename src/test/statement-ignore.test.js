import { describe, it, expect } from "vitest";
import { ignoreStatementRows, statementRowKey } from "../../public/statement.js";

describe("Ekstre yoksay", () => {
  const b = { d: "2026-11-04", a: 368.95, t: "KARGO" };
  const t = { id: "tx1", d: "2026-11-04", a: 339.82 };
  const result = { missing: [], diff: [{ b, t }], extra: [], ok: [], bankTot: 95526.09 };
  it("tutar farkını gizler, işlemi ve dönem borcunu değiştirmez", () => {
    const next = ignoreStatementRows(result, [statementRowKey("diff", b, t)]);
    expect(next.diff).toEqual([]);
    expect(next.ignored[0].t.a).toBe(339.82);
    expect(next.bankTot).toBe(95526.09);
    expect(result.diff).toHaveLength(1);
  });
  it("yoksay kaydı kaldırılınca işlem tekrar karşılaştırmada görünür", () => {
    expect(ignoreStatementRows(result, []).diff).toEqual([{ b, t }]);
  });
  it("eksik, fazla ve tarih farkı olan satırları ayrı ayrı yoksayar", () => {
    const r = { ...result, diff: [], missing: [b], extra: [t], ok: [{ b, t }] };
    const keys = [statementRowKey("miss", b, null), statementRowKey("extra", null, t), statementRowKey("ok", b, t)];
    const next = ignoreStatementRows(r, keys);
    expect(next.ignored).toHaveLength(3);
    expect(next.missing.length + next.extra.length + next.ok.length).toBe(0);
  });
});