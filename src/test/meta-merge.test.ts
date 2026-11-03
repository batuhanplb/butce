import { describe, it, expect } from "vitest";
import { mergeMeta } from "@/cloud-store/entry";

describe("mergeMeta", () => {
  it("eski cihazın logo kaydı başka cihazda eklenen nakit gelirini silmez", () => {
    const base = { cash: { items: [{ id: "a", name: "Maaş" }] }, subLogos: {} };
    const server = { cash: { items: [{ id: "a", name: "Maaş" }, { id: "b", name: "Anne" }] }, subLogos: {} };
    const local = { cash: { items: [{ id: "a", name: "Maaş" }] }, subLogos: { spotify: "x" } };
    const m = mergeMeta(base, local, server) as typeof server & { subLogos: Record<string, string> };
    expect(m.cash.items.map((x) => x.name)).toEqual(["Maaş", "Anne"]);
    expect(m.subLogos.spotify).toBe("x");
  });
  it("bu cihazda silinen gelir geri gelmez", () => {
    const base = { cash: { items: [{ id: "a" }, { id: "b" }] } };
    const m = mergeMeta(base, { cash: { items: [{ id: "a" }] } }, base) as typeof base;
    expect(m.cash.items).toEqual([{ id: "a" }]);
  });
});
