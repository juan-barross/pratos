import gradio as gr
from transformers import pipeline

MODEL = "juan1211/pratos-convnext-tiny-food101"

classify = pipeline("image-classification", model=MODEL)


def predict(image):
    return {r["label"].replace("_", " "): r["score"] for r in classify(image, top_k=5)}


demo = gr.Interface(
    fn=predict,
    inputs=gr.Image(type="pil", label="Foto do prato"),
    outputs=gr.Label(num_top_classes=5, label="Pratos mais prováveis"),
    title="Qual é o prato?",
    description=f"ConvNeXt-Tiny ajustado no Food-101 (`{MODEL}`). Reconhece 101 pratos, em inglês, a partir da foto.",
    flagging_mode="never",
)
demo.queue(max_size=16).launch()
