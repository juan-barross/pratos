---
license: apache-2.0
base_model: facebook/convnext-tiny-224
datasets:
- ethz/food101
library_name: transformers
pipeline_tag: image-classification
tags:
- transformers.js
- onnx
- food
metrics:
- accuracy
model-index:
- name: pratos-convnext-tiny-food101
  results:
  - task:
      type: image-classification
    dataset:
      name: Food-101
      type: ethz/food101
      split: validation
    metrics:
    - type: accuracy
      value: 0.8731
      name: top-1
    - type: top_5_accuracy
      value: 0.9778
      name: top-5
---

# pratos-convnext-tiny-food101

ConvNeXt-Tiny, pré-treinado no ImageNet, ajustado para reconhecer os 101 pratos do [Food-101](https://huggingface.co/datasets/ethz/food101) pela foto. É o tipo de modelo que ajuda a organizar cardápio e catálogo a partir das fotos que os restaurantes enviam.

- Demonstração no navegador: [juan1211/pratos](https://huggingface.co/spaces/juan1211/pratos)
- Código, treino e avaliação: [github.com/juan-barross/pratos](https://github.com/juan-barross/pratos)

## Avaliação

Nas 25.250 fotos de teste do Food-101, revisadas à mão pelos autores do dataset.

| Métrica | Valor |
|---|---|
| Top-1 | 87,3% (IC 95% de 86,9% a 87,7%) |
| Top-5 | 97,8% |
| Erro de calibração | 0,043 |
| Latência na CPU, uma foto (2 vCPUs) | 119 ms (p95 de 175 ms) |

Com confiança de pelo menos 0,9, o que acontece em 59% das fotos, o acerto é de 99,1%. Num fluxo de cardápio, dá para aceitar esses palpites direto e mandar o resto para revisão humana.

Os pratos mais difíceis são bife (55,6%), bisteca de porco (63,2%) e foie gras (66,4%). A confusão mais comum é bife lido como filé mignon (52 fotos), seguida de bolo e mousse de chocolate e de tartare de carne e de atum.

## Treino

3 épocas numa T4 do Colab (26,7 min), taxa de aprendizado 2e-4 com cosseno e 200 passos de aquecimento, lote de 64, fp16. No treino, recorte aleatório e espelhamento; no teste, redução e corte no centro. A cabeça de 1.000 classes do ImageNet foi trocada por uma de 101.

## ONNX para o navegador

A pasta `onnx/` tem o modelo exportado pelo PyTorch (`model.onnx`, 107 MB) e uma versão com as camadas lineares em int8 (`model_quantized.onnx`, 33 MB). Em 500 fotos de teste, a versão em fp32 dá o mesmo primeiro palpite do PyTorch em 100% delas e a int8 em 98,6%.

```js
import { pipeline } from "@huggingface/transformers";

const classificar = await pipeline("image-classification", "juan1211/pratos-convnext-tiny-food101", { dtype: "q8" });
const [palpite] = await classificar("foto.jpg", { top_k: 5 });
```

Em Python:

```python
from transformers import pipeline

classificar = pipeline("image-classification", model="juan1211/pratos-convnext-tiny-food101")
classificar("foto.jpg", top_k=5)
```

## Limitações

- Só conhece os 101 pratos do Food-101, quase todos da culinária americana, europeia e asiática. Pratos brasileiros como feijoada ou coxinha caem no mais parecido da lista.
- As fotos de treino do Food-101 têm ruído de rótulo de propósito; o teste foi revisado à mão.
- Foto com mais de um prato recebe um rótulo só.
