import { describe, it, expect } from "vitest";
import { isValidUrl, isValidCode, RESERVED_CODES } from "../src/validators.js";

describe("isValidUrl", () => {
  it("aceita URLs http válidas", () => {
    expect(isValidUrl("http://exemplo.com")).toBe(true);
  });

  it("aceita URLs https válidas", () => {
    expect(isValidUrl("https://exemplo.com/caminho?query=1")).toBe(true);
  });

  it("rejeita URLs sem protocolo", () => {
    expect(isValidUrl("exemplo.com")).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(isValidUrl("")).toBe(false);
  });

  it("rejeita valores undefined", () => {
    expect(isValidUrl(undefined)).toBe(false);
  });

  it("rejeita protocolos não http(s)", () => {
    expect(isValidUrl("ftp://exemplo.com")).toBe(false);
  });
});

describe("isValidCode", () => {
  it("aceita códigos alfanuméricos com hífen", () => {
    expect(isValidCode("aula-nuvem")).toBe(true);
  });

  it("rejeita códigos muito curtos", () => {
    expect(isValidCode("ab")).toBe(false);
  });

  it("rejeita códigos muito longos", () => {
    expect(isValidCode("a".repeat(21))).toBe(false);
  });

  it("rejeita caracteres especiais", () => {
    expect(isValidCode("codigo@123")).toBe(false);
  });

  it("rejeita valores vazios", () => {
    expect(isValidCode("")).toBe(false);
  });
});

describe("RESERVED_CODES", () => {
  it("contém as rotas internas da aplicação", () => {
    expect(RESERVED_CODES).toContain("api");
    expect(RESERVED_CODES).toContain("stats");
  });
});
