import { env, pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1";

import { PRATOS } from "./pratos.js";

const MODEL = "juan1211/pratos-convnext-tiny-food101";
const TOP = 5;

const input = document.querySelector("#foto");
const area = document.querySelector("#area");
const progress = document.querySelector("#progresso");
const status = document.querySelector("#estado");
const preview = document.querySelector("#previa");
const result = document.querySelector("#resultado");
const bars = document.querySelector("#barras");
const summary = document.querySelector("#resumo");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const percent = (score) => `${(score * 100).toFixed(1).replace(".", ",")}%`;
const dishName = (label) => PRATOS[label] ?? label.replaceAll("_", " ");

env.allowLocalModels = false;

function item(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function trackDownload(event) {
  if (event.status === "progress" && event.file.endsWith(".onnx")) progress.value = event.progress;
}

function render(predictions) {
  bars.replaceChildren(
    ...predictions.map(({ label, score }) => {
      const row = document.createElement("li");
      const name = item("span", "dish", "");
      name.append(item("span", "", dishName(label)), item("small", "label", label));
      const fill = item("span", "fill", "");
      fill.style.width = `${(score * 100).toFixed(1)}%`;
      const track = item("span", "track", "");
      track.setAttribute("aria-hidden", "true");
      track.append(fill);
      row.append(name, track, item("span", "value", percent(score)));
      return row;
    }),
  );
  const [best] = predictions;
  summary.replaceChildren("Mais provável: ", item("strong", "dish-name", dishName(best.label)), ` com ${percent(best.score)}.`);
}

async function classify(classifier, file) {
  if (!file?.type.startsWith("image/")) {
    status.textContent = "Escolha um arquivo de imagem.";
    return;
  }
  URL.revokeObjectURL(preview.src);
  preview.src = URL.createObjectURL(file);
  preview.alt = `Foto enviada: ${file.name}`;
  preview.hidden = false;
  status.textContent = "Analisando a foto…";
  const start = performance.now();
  const predictions = await classifier(preview.src, { top_k: TOP });
  render(predictions);
  status.textContent = `Rodou em ${Math.round(performance.now() - start)} ms no seu navegador.`;
  result.hidden = false;
  result.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
}

function enable(classifier) {
  progress.hidden = true;
  input.disabled = false;
  status.textContent = "Modelo pronto.";
  input.addEventListener("change", () => classify(classifier, input.files[0]));
  area.addEventListener("dragover", (event) => {
    event.preventDefault();
    area.classList.add("over");
  });
  area.addEventListener("dragleave", () => area.classList.remove("over"));
  area.addEventListener("drop", (event) => {
    event.preventDefault();
    area.classList.remove("over");
    classify(classifier, event.dataTransfer.files[0]);
  });
}

pipeline("image-classification", MODEL, { dtype: "q8", device: "wasm", progress_callback: trackDownload })
  .then(enable)
  .catch(() => {
    progress.hidden = true;
    status.textContent = "Não foi possível carregar o modelo. Recarregue a página para tentar de novo.";
  });
