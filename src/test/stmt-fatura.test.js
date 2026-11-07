import { describe, it, expect } from "vitest";
import { parseStatementLines } from "../../public/statement.js";
describe("ekstre fatura ödeme", () => {
  it("FATURA ÖDEME gider, + ve teşekkür satırları alacak", () => {
    const r = parseStatementLines(["27.10.2026 367575 FATURA ÖDEME 572,41 0,00", "15.10.2026 2190 şube-otomatik ödeme-teşekkür ederiz 35.279,48+", "08.10.2026 TRENDYOL Satis Iade 105,00+"]);
    expect(r.map(x => x.credit)).toEqual([false, true, true]);
  });
});
