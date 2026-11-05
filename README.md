# Qual é o prato?

Classificador de pratos por foto: o ConvNeXt-Tiny, pré-treinado no ImageNet, ajustado nas 101 classes do [Food-101](https://huggingface.co/datasets/ethz/food101). É o tipo de modelo que ajuda a organizar cardápio e catálogo a partir das fotos que os restaurantes enviam.

- Treino e avaliação: [`notebooks/treino.ipynb`](notebooks/treino.ipynb), numa T4 do Colab.
- Modelo: [juan1211/pratos-convnext-tiny-food101](https://huggingface.co/juan1211/pratos-convnext-tiny-food101).
- Demonstração: [`space/`](space/), publicada como Space do Hugging Face.

## Avaliação

Medida nas 25.250 fotos de teste do Food-101, revisadas à mão pelos autores do dataset.

## Publicar o Space

```bash
hf upload juan1211/pratos space . --repo-type space
```
