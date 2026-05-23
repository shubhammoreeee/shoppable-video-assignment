from PIL import Image
import sys

image_path = sys.argv[1]

x1 = int(sys.argv[2])
y1 = int(sys.argv[3])
x2 = int(sys.argv[4])
y2 = int(sys.argv[5])

output_path = sys.argv[6]

image = Image.open(image_path)

cropped = image.crop(
    (x1, y1, x2, y2)
)

cropped.save(output_path)

print("Crop Saved")