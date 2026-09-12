import { describe, expect, it } from "bun:test";
import { extrairMencoes } from "./mencao.util";

describe("Extração de menções (@usuario)", () => {
  const mockUsuarios = [
    { id: "u-1", nome_completo: "Ana Paula Ribeiro", email: "ana.paula.ribeiro@cosmos.com" },
    { id: "u-2", nome_completo: "Carlos Menezes", email: "carlos.menezes@cosmos.com" },
    { id: "u-3", nome_completo: "Beatriz Nogueira", email: "beatriz.nogueira@cosmos.com" },
  ];

  it("deve extrair menção por nome completo", () => {
    const texto = "Olá @Ana Paula Ribeiro, pode revisar este item?";
    const mencoes = extrairMencoes(texto, mockUsuarios);
    expect(mencoes).toEqual(["u-1"]);
  });

  it("deve extrair menção por primeiro nome", () => {
    const texto = "Favor conferir @Carlos!";
    const mencoes = extrairMencoes(texto, mockUsuarios);
    expect(mencoes).toEqual(["u-2"]);
  });

  it("deve extrair menção por prefixo de email ou email", () => {
    const texto1 = "Cc: @beatriz.nogueira";
    expect(extrairMencoes(texto1, mockUsuarios)).toEqual(["u-3"]);

    const texto2 = "Cc: @beatriz.nogueira@cosmos.com";
    expect(extrairMencoes(texto2, mockUsuarios)).toEqual(["u-3"]);
  });

  it("deve extrair múltiplas menções no mesmo texto", () => {
    const texto = "Aviso para @Ana Paula Ribeiro e também para @Carlos Menezes.";
    const mencoes = extrairMencoes(texto, mockUsuarios);
    expect(mencoes).toContain("u-1");
    expect(mencoes).toContain("u-2");
    expect(mencoes.length).toBe(2);
  });

  it("deve ignorar quando não há menções com @", () => {
    const texto = "Ana Paula Ribeiro e Carlos estavam na reunião.";
    expect(extrairMencoes(texto, mockUsuarios)).toEqual([]);
  });

  it("deve ignorar menções a usuários que não existem", () => {
    const texto = "Aviso para @JoaoDaSilva";
    expect(extrairMencoes(texto, mockUsuarios)).toEqual([]);
  });
});
