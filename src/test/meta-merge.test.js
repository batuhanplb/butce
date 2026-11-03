import { describe, it, expect, vi } from "vitest";
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({}) }));
vi.mock("@lovable.dev/cloud-auth-js", () => ({ createLovableAuth: () => ({}) }));
globalThis.__SB_URL__ = "x"; globalThis.__SB_KEY__ = "y";
const { mergeMeta } = await import("../cloud-store/entry");

describe("mergeMeta", () => {
  it("eski cihazın logo kaydı başka cihazda eklenen nakit gelirini silmez", () => {
    const base = { cash: { items: [{ id: "a", name: "Maaş" }] }, subLogos: {} };
    const server = { cash: { items: [{ id: "a", name: "Maaş" }, { id: "b", name: "Anne" }] }, subLogos: {} };
    const local = { cash: { items: [{ id: "a", name: "Maaş" }] }, subLogos: { spotify: "x" } };
    const m = mergeMeta(base, local, server);
    expect(m.cash.items.map(x => x.name)).toEqual(["Maaş", "Anne"]);
    expect(m.subLogos.spotify).toBe("x");
  });
  it("bu cihazda silinen gelir geri gelmez", () => {
    const base = { cash: { items: [{ id: "a" }, { id: "b" }] } };
    const m = mergeMeta(base, { cash: { items: [{ id: "a" }] } }, base);
    expect(m.cash.items).toEqual([{ id: "a" }]);
  });
});
