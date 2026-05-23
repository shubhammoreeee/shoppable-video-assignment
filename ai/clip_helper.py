import clip
import torch
from PIL import Image

# DEVICE
device = (
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

# LOAD MODEL
model, preprocess = clip.load(
    "ViT-B/32",
    device=device
)

# IMAGE EMBEDDING
def get_image_embedding(
    image_path
):

    image = preprocess(
        Image.open(image_path)
    ).unsqueeze(0).to(device)

    with torch.no_grad():

        embedding = model.encode_image(image)

    return embedding