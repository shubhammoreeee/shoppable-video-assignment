from clip_helper import (
    get_image_embedding
)

import torch
import sys
import json

image_path = sys.argv[1]

embedding = get_image_embedding(
    image_path
)

embedding_list = (
    embedding.cpu()
    .numpy()
    .tolist()[0]
)

print(
    json.dumps(
        embedding_list
    )
)