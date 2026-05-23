# from ultralytics import YOLO
# import os
# import json
# import sys

# video_id = sys.argv[1]

# print("Starting detection script...")

# # LOAD YOLO MODEL
# model = YOLO("yolov8n.pt")

# # PATHS
# BASE_DIR = os.path.dirname(
#     os.path.abspath(__file__)
# )

# frames_folder = os.path.join(

#     BASE_DIR,

#     "../backend/frames",

#     video_id
# )

# output_file = os.path.join(

#     BASE_DIR,

#     "../backend/detections",

#     f"{video_id}.json"
# )

# # CREATE DETECTIONS FOLDER
# os.makedirs(
#     "../backend/detections",
#     exist_ok=True
# )

# all_results = []

# # GET JPG FRAMES
# frames = sorted([

#     file
#     for file in os.listdir(frames_folder)

#     if file.endswith(".jpg")
# ])

# print(
#     "Total Frames Found:",
#     len(frames)
# )

# # LOOP FRAMES
# for index, frame in enumerate(frames):

#     frame_path = os.path.join(
#         frames_folder,
#         frame
#     )

#     print(f"\nChecking: {frame}")

#     # YOLO DETECTION
#     results = model(frame_path)

#     detected_objects = []

#     # LOOP RESULTS
#     for result in results:

#         # LOOP BOXES
#         for box in result.boxes:

#             class_id = int(
#                 box.cls[0]
#             )

#             object_name = (
#                 model.names[class_id]
#             )

#             confidence = float(
#                 box.conf[0]
#             )

#             # CONFIDENCE FILTER
#             if confidence > 0.5:

#                 # BOUNDING BOX
#                 x1, y1, x2, y2 = (
#                     box.xyxy[0]
#                 )

#                 detected_objects.append({

#                     "name": object_name,

#                     "confidence": round(
#                         confidence,
#                         2
#                     ),

#                     "bbox": {

#                         "x1": int(x1),

#                         "y1": int(y1),

#                         "x2": int(x2),

#                         "y2": int(y2),
#                     }
#                 })

#                 print(
#                     f"Detected: {object_name}"
#                 )

#     # SAVE FRAME DATA
#     all_results.append({

#         "frame": frame,

#         "timestamp": index * 2,

#         "objects": detected_objects
#     })

# print("\nSaving JSON...")

# # SAVE JSON
# with open(output_file, "w") as file:

#     json.dump(
#         all_results,
#         file,
#         indent=4
#     )

# print(
#     "Detection completed successfully!"
# )
from ultralytics import YOLO
from PIL import Image

import os
import json
import sys

from clip_helper import (
    get_image_embedding
)

video_id = sys.argv[1]

print("Starting detection script...")

# LOAD MODEL
model = YOLO("yolov8n.pt")

# BASE DIRECTORY
BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

# PATHS
frames_folder = os.path.join(

    BASE_DIR,

    "../backend/frames",

    video_id
)

output_file = os.path.join(

    BASE_DIR,

    "../backend/detections",

    f"{video_id}.json"
)

temp_folder = os.path.join(

    BASE_DIR,

    "temp_crops"
)

# CREATE FOLDERS
os.makedirs(
    temp_folder,
    exist_ok=True
)

os.makedirs(
    os.path.dirname(output_file),
    exist_ok=True
)

print(
    "Frames Folder:",
    frames_folder
)

print(
    "Folder Exists:",
    os.path.exists(
        frames_folder
    )
)

all_results = []

# GET FRAMES
frames = sorted([

    file
    for file in os.listdir(frames_folder)

    if file.endswith(".jpg")
])

print(
    "Total Frames Found:",
    len(frames)
)

# LOOP FRAMES
for index, frame in enumerate(frames):

    frame_path = os.path.join(
        frames_folder,
        frame
    )

    print(f"\nChecking: {frame}")

    # YOLO DETECTION
    results = model(frame_path)

    detected_objects = []

    # OPEN IMAGE
    image = Image.open(
        frame_path
    )

    # LOOP RESULTS
    for result in results:

        for box in result.boxes:

            class_id = int(
                box.cls[0]
            )

            object_name = (
                model.names[class_id]
            )

            confidence = float(
                box.conf[0]
            )

            # FILTER
            if confidence > 0.5:

                # BBOX
                x1, y1, x2, y2 = (
                    box.xyxy[0]
                )

                x1 = int(x1)
                y1 = int(y1)
                x2 = int(x2)
                y2 = int(y2)

                # CROP OBJECT
                cropped_image = image.crop(
                    (x1, y1, x2, y2)
                )

                # TEMP CROP PATH
                crop_path = os.path.join(

                    temp_folder,

                    f"{frame}_{object_name}.jpg"
                )

                # SAVE CROP
                cropped_image.save(
                    crop_path
                )

                # GENERATE EMBEDDING
                embedding_tensor = (
                    get_image_embedding(
                        crop_path
                    )
                )

                embedding = (
                    embedding_tensor
                    .cpu()
                    .numpy()
                    .flatten()
                    .tolist()
                )

                # DELETE TEMP FILE
                if os.path.exists(
                    crop_path
                ):

                    os.remove(
                        crop_path
                    )

                # SAVE OBJECT
                detected_objects.append({

                    "name": object_name,

                    "confidence": round(
                        confidence,
                        2
                    ),

                    "bbox": {

                        "x1": x1,

                        "y1": y1,

                        "x2": x2,

                        "y2": y2,
                    },

                    "embedding":
                        embedding
                })

                print(
                    f"Detected: {object_name}"
                )

    # SAVE FRAME
    all_results.append({

        "frame": frame,

        "timestamp": index * 2,

        "objects": detected_objects
    })

print("\nSaving JSON...")

# SAVE JSON
with open(output_file, "w") as file:

    json.dump(
        all_results,
        file,
        indent=4
    )

print(
    "Detection completed successfully!"
)