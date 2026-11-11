import { describe, expect, it } from "vitest";
import { buildSmartChecklist } from "./checklist-template";

describe("checklist-template.ts", () => {
  it("builds international checklist with passport and currency for Chile", () => {
    const items = buildSmartChecklist({
      title: "Chile 2026",
      destination: "Santiago, Chile",
    });

    const preparoTitles = items.filter((i) => i.kind === "preparo").map((i) => i.title);
    const bagagemTitles = items.filter((i) => i.kind === "bagagem").map((i) => i.title);

    expect(preparoTitles.some((t) => t.includes("Passaporte"))).toBe(true);
    expect(preparoTitles.some((t) => t.includes("Seguro Viagem"))).toBe(true);
    expect(bagagemTitles.some((t) => t.includes("Adaptador"))).toBe(true);
    expect(bagagemTitles.some((t) => t.includes("Farmacinha"))).toBe(true);
  });

  it("builds USA checklist with US Visa and US adapter", () => {
    const items = buildSmartChecklist({
      title: "Nova York e Orlando",
      destination: "EUA",
    });

    const preparoTitles = items.filter((i) => i.kind === "preparo").map((i) => i.title);
    const bagagemTitles = items.filter((i) => i.kind === "bagagem").map((i) => i.title);

    expect(preparoTitles.some((t) => t.includes("Visto Americano"))).toBe(true);
    expect(bagagemTitles.some((t) => t.includes("dois pinos chatos"))).toBe(true);
  });

  it("builds national checklist for Brazilian trip", () => {
    const items = buildSmartChecklist({
      title: "Férias em Floripa",
      destination: "Florianópolis, SC",
    });

    const preparoTitles = items.filter((i) => i.kind === "preparo").map((i) => i.title);
    const bagagemTitles = items.filter((i) => i.kind === "bagagem").map((i) => i.title);

    expect(preparoTitles.some((t) => t.includes("Documentos com foto"))).toBe(true);
    expect(bagagemTitles.some((t) => t.includes("Roupas de banho"))).toBe(true);
  });

  it("incorporates historical items without duplication", () => {
    const history = [
      { kind: "bagagem", title: "Câmera GoPro e cartões de memória", owner_name: "maluki" },
      { kind: "preparo", title: "Passaportes válidos por no mínimo 6 meses", owner_name: "Família" },
    ];

    const items = buildSmartChecklist({
      title: "Viagem Europa",
      destination: "Paris, França",
      previousItems: history,
    });

    const titles = items.map((i) => i.title);
    expect(titles).toContain("Câmera GoPro e cartões de memória");
  });
});

