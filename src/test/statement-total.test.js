import { describe, it, expect } from "vitest";
import * as statement from "../../public/statement.js";

describe("Ekstre dönem borcu", () => {
  it("işlem toplamı yerine PDF'deki 95.526,09 TL dönem borcunu alır", () => {
    const lines = ["Dönem Borcu TL : 95.526,09 TL Sonraki Hesap Kesim Tarihi : 05.12.2026", "Dönem Borcu USD : 0,00 USD"];
    expect(statement.statementTotal(lines, [{ a: 96669.58, credit: false }])).toBe(95526.09);
  });
  it("borç başlığı yoksa iadeleri düşer, önceki borcun ödemesini düşmez", () => {
    const rows = statement.parseStatementLines([
      "06.10.2026 MARKET 96.367,92 0,00",
      "08.10.2026 TRENDYOL Satis Iade 105,00+",
      "22.10.2026 FILE MARKET 736,83+",
      "15.10.2026 otomatik ödeme teşekkür ederiz 35.279,48+",
      "15.10.2026 hesaptan ödeme teşekkür ederiz 52.919,21+",
    ]);
    expect(statement.statementTotal([], rows)).toBe(95526.09);
  });
});