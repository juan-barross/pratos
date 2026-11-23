import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { PRATOS } from "../space/pratos.js";

const ler = (caminho) => readFileSync(new URL(caminho, import.meta.url), "utf8");
const relatorio = JSON.parse(ler("../reports/avaliacao_teste.json"));
const readme = ler("../README.md");
const porcento = (fracao) => `${(fracao * 100).toFixed(1).replace(".", ",")}%`;

test("a demo traduz exatamente os 101 rótulos avaliados", () => {
  assert.deepEqual(Object.keys(PRATOS).sort(), Object.keys(relatorio.acerto_por_prato).sort());
});

test("nenhum prato fica sem nome nem com nome repetido", () => {
  const nomes = Object.values(PRATOS);
  assert.ok(nomes.every((nome) => nome.trim().length > 0));
  assert.equal(new Set(nomes).size, nomes.length);
});

test("o README cita o top-1 e o top-5 do relatório", () => {
  assert.ok(readme.includes(porcento(relatorio.teste.top1.valor)));
  assert.ok(readme.includes(porcento(relatorio.teste.top5.valor)));
});
