# Qual é o prato?

Classificador de pratos por foto: o ConvNeXt-Tiny, pré-treinado no ImageNet, ajustado nas 101 classes do [Food-101](https://huggingface.co/datasets/ethz/food101). É o tipo de modelo que ajuda a organizar cardápio e catálogo a partir das fotos que os restaurantes enviam.

- Treino e avaliação: [`notebooks/treino.ipynb`](notebooks/treino.ipynb), numa T4 do Colab.
- Conversão para o navegador: [`notebooks/exportar_onnx.ipynb`](notebooks/exportar_onnx.ipynb) exporta para ONNX, quantiza as camadas lineares em int8 e confere o resultado contra o PyTorch.
- Modelo: [juan1211/pratos-convnext-tiny-food101](https://huggingface.co/juan1211/pratos-convnext-tiny-food101).
- Demonstração: [`space/`](space/), um Space estático. O modelo roda no navegador de quem visita com o Transformers.js, então não há servidor para dormir nem custo.

## Avaliação

Medida nas 25.250 fotos de teste do Food-101, revisadas à mão pelos autores do dataset.

## Publicar o Space

O modelo precisa estar público e com a pasta `onnx/`, porque o navegador baixa os pesos direto do Hugging Face.

```bash
hf repos create juan1211/pratos --type space --sdk static
hf upload juan1211/pratos space . --repo-type space
```
