import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MarkdownContent, AssistantMessageCard } from "./MarkdownContent";

describe("MarkdownContent", () => {
  it("renders markdown headings, lists, bold text and paragraphs properly", () => {
    const markdown = `# Estimativa de viagem para a China

Não há uma viagem selecionada no app.

## Faixas de custo
**Passagens aéreas**
- Econômica: **R$ 5.000 a R$ 8.000**
- Em alta temporada: R$ 9.000`;

    const html = renderToString(<MarkdownContent content={markdown} />);

    // Deve conter tag <h1> e <h2> sem os caracteres literais #
    expect(html).toContain("<h1");
    expect(html).toContain("Estimativa de viagem para a China</h1>");
    expect(html).not.toContain("# Estimativa");

    expect(html).toContain("<h2");
    expect(html).toContain("Faixas de custo</h2>");
    expect(html).not.toContain("## Faixas");

    // Deve conter negrito <strong>
    expect(html).toContain(">Passagens aéreas</strong>");
    expect(html).toContain(">R$ 5.000 a R$ 8.000</strong>");

    // Deve conter lista <ul> e itens <li>
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
  });

  it("AssistantMessageCard displays header and copy button", () => {
    const html = renderToString(<AssistantMessageCard content="Dicas para sua viagem em família." />);

    expect(html).toContain("Assistente de Viagens");
    expect(html).toContain("Dicas para sua viagem em família.");
    expect(html).toContain("Copiar");
  });
});
