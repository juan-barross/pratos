import { env, pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1";

import { PRATOS } from "./pratos.js";

const MODELO = "juan1211/pratos-convnext-tiny-food101";
const TOP = 5;

const entrada = document.querySelector("#foto");
const area = document.querySelector("#area");
const progresso = document.querySelector("#progresso");
const estado = document.querySelector("#estado");
const previa = document.querySelector("#previa");
const resultado = document.querySelector("#resultado");
const barras = document.querySelector("#barras");
const resumo = document.querySelector("#resumo");
const poucoMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

const porcentagem = (nota) => `${(nota * 100).toFixed(1).replace(".", ",")}%`;
const nomeDoPrato = (rotulo) => PRATOS[rotulo] ?? rotulo.replaceAll("_", " ");

let analisando = false;

env.allowLocalModels = false;

function elemento(tag, classe, texto) {
  const novo = document.createElement(tag);
  novo.className = classe;
  novo.textContent = texto;
  return novo;
}

function acompanharDownload(evento) {
  if (evento.status === "progress" && evento.file.endsWith(".onnx")) progresso.value = evento.progress;
}

function mostrar(palpites) {
  barras.replaceChildren(
    ...palpites.map(({ label, score }) => {
      const linha = document.createElement("li");
      const nome = elemento("span", "dish", "");
      nome.append(elemento("span", "", nomeDoPrato(label)), elemento("small", "label", label));
      const cheio = elemento("span", "fill", "");
      cheio.style.width = `${(score * 100).toFixed(1)}%`;
      const trilho = elemento("span", "track", "");
      trilho.setAttribute("aria-hidden", "true");
      trilho.append(cheio);
      linha.append(nome, trilho, elemento("span", "value", porcentagem(score)));
      return linha;
    }),
  );
  const [melhor] = palpites;
  resumo.replaceChildren(
    "Mais provável: ",
    elemento("strong", "dish-name", nomeDoPrato(melhor.label)),
    ` com ${porcentagem(melhor.score)}.`,
  );
}

async function classificar(classificador, arquivo) {
  if (analisando) return;
  if (!arquivo?.type.startsWith("image/")) {
    estado.textContent = "Escolha um arquivo de imagem.";
    return;
  }
  analisando = true;
  URL.revokeObjectURL(previa.src);
  previa.src = URL.createObjectURL(arquivo);
  previa.alt = `Foto enviada: ${arquivo.name}`;
  previa.hidden = false;
  estado.textContent = "Analisando a foto…";
  try {
    const inicio = performance.now();
    mostrar(await classificador(previa.src, { top_k: TOP }));
    estado.textContent = `Rodou em ${Math.round(performance.now() - inicio)} ms no seu navegador.`;
    resultado.hidden = false;
    resultado.scrollIntoView({ behavior: poucoMovimento.matches ? "auto" : "smooth", block: "start" });
  } catch (erro) {
    console.error(erro);
    resultado.hidden = true;
    estado.textContent = "Não consegui ler essa imagem. Tente outra foto.";
  } finally {
    analisando = false;
    entrada.value = "";
  }
}

function habilitar(classificador) {
  progresso.hidden = true;
  entrada.disabled = false;
  estado.textContent = "Modelo pronto.";
  entrada.addEventListener("change", () => classificar(classificador, entrada.files[0]));
  area.addEventListener("dragover", (evento) => {
    evento.preventDefault();
    area.classList.add("over");
  });
  area.addEventListener("dragleave", () => area.classList.remove("over"));
  area.addEventListener("drop", (evento) => {
    evento.preventDefault();
    area.classList.remove("over");
    classificar(classificador, evento.dataTransfer.files[0]);
  });
}

pipeline("image-classification", MODELO, { dtype: "q8", device: "wasm", progress_callback: acompanharDownload })
  .then(habilitar)
  .catch((erro) => {
    console.error(erro);
    progresso.hidden = true;
    estado.textContent = "Não foi possível carregar o modelo. Recarregue a página para tentar de novo.";
  });
