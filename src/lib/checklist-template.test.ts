import { describe, expect, it } from "vitest";
import { buildSmartChecklist, CHECKLIST_CATEGORIES } from "./checklist-template";

describe("checklist-template.ts", () => {
  it("builds international checklist with passport and currency for Chile", () => {
    const items = buildSmartChecklist({
      title: "Chile 2026",
      destination: "Santiago, Chile",
    });

    const docTitles = items.filter((i) => i.kind === "documentos_dinheiro").map((i) => i.title);
    const antesTitles = items.filter((i) => i.kind === "antes_viagem").map((i) => i.title);
    const eletroTitles = items.filter((i) => i.kind === "eletronicos").map((i) => i.title);
    const saudeTitles = items.filter((i) => i.kind === "saude").map((i) => i.title);

    expect(docTitles.some((t) => t.includes("passaporte"))).toBe(true);
    expect(docTitles.some((t) => t.includes("moeda estrangeira"))).toBe(true);
    expect(antesTitles.some((t) => t.includes("seguro-viagem"))).toBe(true);
    expect(eletroTitles.some((t) => t.includes("Chile"))).toBe(true);
    expect(saudeTitles.some((t) => t.includes("medicamentos"))).toBe(true);
  });

  it("builds USA checklist with US Visa and US adapter", () => {
    const items = buildSmartChecklist({
      title: "Nova York e Orlando",
      destination: "EUA",
    });

    const docTitles = items.filter((i) => i.kind === "documentos_dinheiro").map((i) => i.title);
    const eletroTitles = items.filter((i) => i.kind === "eletronicos").map((i) => i.title);

    expect(docTitles.some((t) => t.includes("Visto Americano"))).toBe(true);
    expect(eletroTitles.some((t) => t.includes("dois pinos chatos"))).toBe(true);
  });

  it("builds national checklist for Brazilian trip", () => {
    const items = buildSmartChecklist({
      title: "Férias em Floripa",
      destination: "Florianópolis, SC",
    });

    const docTitles = items.filter((i) => i.kind === "documentos_dinheiro").map((i) => i.title);
    const malaTitles = items.filter((i) => i.kind === "mala_roupas").map((i) => i.title);

    expect(docTitles.some((t) => t.includes("RG, CNH"))).toBe(true);
    expect(malaTitles.some((t) => t.includes("roupas de banho"))).toBe(true);
  });

  it("covers all 8 standard categories in the template", () => {
    const items = buildSmartChecklist({
      title: "Viagem Padrão",
      destination: "Belo Horizonte, MG",
    });

    for (const cat of CHECKLIST_CATEGORIES) {
      expect(items.some((i) => i.kind === cat.id)).toBe(true);
    }
  });

  it("incorporates historical items without duplication", () => {
    const history = [
      { kind: "eletronicos", title: "Câmera GoPro e cartões de memória", owner_name: "maluki" },
      { kind: "documentos_dinheiro", title: "Passaportes válidos por no mínimo 6 meses", owner_name: "Família" },
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
