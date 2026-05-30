const express = require("express");

const cors = require("cors");

const fs = require("fs");

const path = require("path");

const multer = require("multer");

const ffmpeg = require("fluent-ffmpeg");

const ffmpegPath =
  require("@ffmpeg-installer/ffmpeg").path;

const { exec } =
  require("child_process");

ffmpeg.setFfmpegPath(
  ffmpegPath
);

const app = express();

app.use(cors());

app.use(express.json());

/* --------------------------------
   STATIC FOLDERS
-------------------------------- */

app.use(
  "/uploads",
  express.static("uploads")
);

app.use(
  "/product_images",
  express.static(
    "product_images"
  )
);

/* --------------------------------
   CREATE REQUIRED FOLDERS
-------------------------------- */

const requiredFolders = [

  "uploads",

  "frames",

  "detections",

  "products",

  "product_images",
];

requiredFolders.forEach(
  (folder) => {

    if (
      !fs.existsSync(folder)
    ) {

      fs.mkdirSync(folder, {
        recursive: true,
      });
    }
  }
);

/* --------------------------------
   MULTER STORAGE
-------------------------------- */

const storage =
  multer.diskStorage({

    destination: function (
      req,
      file,
      cb
    ) {

      if (
        file.fieldname ===
        "video"
      ) {

        cb(
          null,
          "uploads/"
        );
      }

      else {

        cb(
          null,
          "product_images/"
        );
      }
    },

    filename: function (
      req,
      file,
      cb
    ) {

      cb(

        null,

        Date.now() +

          path.extname(
            file.originalname
          )
      );
    },
  });

const upload = multer({
  storage,
});

/* --------------------------------
   EXTRACT FRAMES
-------------------------------- */

const extractFrames = (
  videoPath
) => {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const videoId =
        path.parse(
          videoPath
        ).name;

      const outputFolder =
        path.join(

          __dirname,

          "frames",

          videoId
        );

      if (
        !fs.existsSync(
          outputFolder
        )
      ) {

        fs.mkdirSync(
          outputFolder,
          {
            recursive: true,
          }
        );
      }

      ffmpeg(videoPath)

        .output(
          `${outputFolder}/frame_%03d.jpg`
        )

        .outputOptions(
          "-vf fps=1/2"
        )

        .on(
          "start",

          (
            commandLine
          ) => {

            console.log(

              "FFmpeg Started:",

              commandLine
            );
          }
        )

        .on(
          "end",

          () => {

            console.log(
              "Frames Extracted"
            );

            resolve();
          }
        )

        .on(
          "error",

          (err) => {

            console.log(
              err
            );

            reject(err);
          }
        )

        .run();
    }
  );
};

/* --------------------------------
   RUN DETECTION
-------------------------------- */

const runObjectDetection =
  (videoId) => {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        const aiFolderPath =
          path.join(
            __dirname,
            "../ai"
          );

        exec(

          `python detect.py ${videoId}`,

          {
            cwd:
              aiFolderPath,
          },

          (
            error,
            stdout,
            stderr
          ) => {

            if (
              error
            ) {

              console.log(
                error
              );

              reject(
                error
              );

              return;
            }

            console.log(
              stdout
            );

            resolve();
          }
        );
      }
    );
  };

/* --------------------------------
   GENERATE PRODUCT EMBEDDING
-------------------------------- */

const generateEmbedding =
  (imagePath) => {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        const aiFolderPath =
          path.join(
            __dirname,
            "../ai"
          );

        exec(

          `python generate_embedding.py "${imagePath}"`,

          {
            cwd:
              aiFolderPath,
          },

          (
            error,
            stdout,
            stderr
          ) => {

            if (
              error
            ) {

              console.log(
                error
              );

              reject(
                error
              );

              return;
            }

            try {

              const embedding =
                JSON.parse(
                  stdout
                );

              resolve(
                embedding
              );

            } catch (
              err
            ) {

              console.log(
                err
              );

              reject(
                err
              );
            }
          }
        );
      }
    );
  };

/* --------------------------------
   COSINE SIMILARITY
-------------------------------- */

const cosineSimilarity = (

  vecA,

  vecB

) => {

  let dot = 0;

  let magA = 0;

  let magB = 0;

  for (
    let i = 0;
    i < vecA.length;
    i++
  ) {

    dot +=
      vecA[i] *
      vecB[i];

    magA +=
      vecA[i] *
      vecA[i];

    magB +=
      vecB[i] *
      vecB[i];
  }

  magA =
    Math.sqrt(magA);

  magB =
    Math.sqrt(magB);

  return (
    dot /
    (magA * magB)
  );
};

/* --------------------------------
   CREATE VIDEO API
-------------------------------- */

app.post(

  "/create-video",

  upload.any(),

  async (
    req,
    res
  ) => {

    try {

      /* VIDEO */

      const videoFile =
        req.files.find(
          (file) =>
            file.fieldname ===
            "video"
        );

      if (
        !videoFile
      ) {

        return res
          .status(400)
          .json({

            error:
              "Video missing",
          });
      }

      const videoPath =
        videoFile.path;

      const videoId =
        path.parse(
          videoPath
        ).name;

      console.log(
        "VIDEO:",
        videoPath
      );

      /* PRODUCTS */

      const products =
        JSON.parse(
          req.body.products
        );

      /* STEP 1
         EXTRACT FRAMES */

      await extractFrames(
        videoPath
      );

      /* STEP 2
         YOLO + CLIP */

      await runObjectDetection(
        videoId
      );

      /* STEP 3
         PRODUCT EMBEDDINGS */

      const productFilePath =
        `./products/${videoId}.json`;

      const productData = [];

      for (
        let index = 0;
        index <
        products.length;
        index++
      ) {

        const product =
          products[index];

        const imageFile =
          req.files.find(
            (file) =>
              file.fieldname ===
              `productImage_${index}`
          );

        let embedding = [];

        let imageUrl = "";

        if (
          imageFile
        ) {

          const absoluteImagePath =
            path.join(

              __dirname,

              imageFile.path
            );

          embedding =
            await generateEmbedding(
              absoluteImagePath
            );

          imageUrl =
            `http://192.168.29.235:5000/${imageFile.path.replace(
              /\\/g,
              "/"
            )}`;
        }

        productData.push({

          id:
            Date.now() +
            Math.random(),

          videoId,

          name:
            product.name,

          price:
            Number(
              product.price
            ),

          image:
            imageUrl,

          embedding,

          buyLink:
            product.buyLink,

          tags:
            product.tags
              .split(",")

              .map(
                (tag) =>
                  tag.trim()
              ),
        });
      }

      fs.writeFileSync(

        productFilePath,

        JSON.stringify(
          productData,
          null,
          2
        )
      );

      /* STEP 4
         SAVE VIDEO */

      const videosFile =
        "./videos.json";

      let videos = [];

      if (
        fs.existsSync(
          videosFile
        )
      ) {

        const rawData =
          fs.readFileSync(
            videosFile,
            "utf-8"
          );

        if (
          rawData.trim()
        ) {

          videos =
            JSON.parse(
              rawData
            );
        }
      }

      videos.push({

        id: videoId,

        videoPath,

        detectionFile:
          `detections/${videoId}.json`,

        productFile:
          `products/${videoId}.json`,
      });

      fs.writeFileSync(

        videosFile,

        JSON.stringify(
          videos,
          null,
          2
        )
      );

      return res.json({

        success: true,

        videoId,

        message:
          "Video Created Successfully",
      });

    } catch (
      error
    ) {

      console.log(
        error
      );

      return res
        .status(500)
        .json({

          error:
            "Video creation failed",
        });
    }
  }
);

/* --------------------------------
   FETCH VIDEOS
-------------------------------- */

app.get(
  "/videos",

  (
    req,
    res
  ) => {

    try {

      const videosFile =
        "./videos.json";

      let videos = [];

      if (
        fs.existsSync(
          videosFile
        )
      ) {

        const rawData =
          fs.readFileSync(
            videosFile,
            "utf-8"
          );

        if (
          rawData.trim()
        ) {

          videos =
            JSON.parse(
              rawData
            );
        }
      }

      const updatedVideos =
        videos.map(
          (
            video
          ) => {

            return {

              ...video,

              videoUrl:
                `http://192.168.29.235:5000/${video.videoPath.replace(
                  /\\/g,
                  "/"
                )}`,
            };
          }
        );

      return res.json(
        updatedVideos
      );

    } catch (
      error
    ) {

      console.log(
        error
      );

      return res
        .status(500)
        .json({

          error:
            "Failed to fetch videos",
        });
    }
  }
);

/* --------------------------------
   FETCH DETECTIONS
-------------------------------- */

app.get(
  "/videos/:videoId/detections",
  (req, res) => {
    try {
      const { videoId } = req.params;
      const detectionPath = `./detections/${videoId}.json`;
      if (fs.existsSync(detectionPath)) {
        const data = JSON.parse(
          fs.readFileSync(detectionPath, "utf-8")
        );
        // Map to get unique timestamps that have non-empty objects list
        const timestamps = data
          .filter(
            (frame) =>
              frame.objects &&
              frame.objects.length > 0
          )
          .map((frame) => frame.timestamp);
        return res.json(timestamps);
      }
      return res
        .status(404)
        .json({ error: "Detections not found" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Failed to load detections" });
    }
  }
);

/* --------------------------------
   FETCH PRODUCTS
-------------------------------- */

app.get(
  "/videos/:videoId/products",
  (req, res) => {
    try {
      const { videoId } = req.params;
      const productsPath = `./products/${videoId}.json`;
      if (fs.existsSync(productsPath)) {
        const data = JSON.parse(
          fs.readFileSync(productsPath, "utf-8")
        );
        // Strip heavy embeddings
        const products = data.map(({ embedding, ...p }) => p);
        return res.json(products);
      }
      return res
        .status(404)
        .json({ error: "Products not found" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Failed to load products" });
    }
  }
);

/* --------------------------------
   PAUSE API
-------------------------------- */

app.post(

  "/pause",

  async (
    req,
    res
  ) => {

    try {

      const {
        currentTime,
        videoId,
      } = req.body;

      /* DETECTIONS */

      const detectionPath =
        `./detections/${videoId}.json`;

      let detectionData =
        [];

      if (
        fs.existsSync(
          detectionPath
        )
      ) {

        detectionData =
          JSON.parse(

            fs.readFileSync(
              detectionPath,
              "utf-8"
            )
          );
      }

      /* PRODUCTS */

      const productsPath =
        `./products/${videoId}.json`;

      let productsData =
        [];

      if (
        fs.existsSync(
          productsPath
        )
      ) {

        productsData =
          JSON.parse(

            fs.readFileSync(
              productsPath,
              "utf-8"
            )
          );
      }

      if (
        !detectionData.length
      ) {

        return res
          .status(404)
          .json({

            error:
              "No detections found",
          });
      }

      /* FIND NEAREST FRAME */

      let nearestFrame =
        detectionData[0];

      let smallestDifference =
        Math.abs(

          currentTime -

          nearestFrame.timestamp
        );

      detectionData.forEach(
        (
          frameData
        ) => {

          const difference =
            Math.abs(

              currentTime -

              frameData.timestamp
            );

          if (
            difference <
            smallestDifference
          ) {

            smallestDifference =
              difference;

            nearestFrame =
              frameData;
          }
        }
      );

      /* MATCH PRODUCTS */

      const matchedProductsMap =
        new Map();

      for (
        const detectedObject
        of nearestFrame.objects
      ) {

        const objectEmbedding =
          detectedObject.embedding;

        if (
          !objectEmbedding ||
          !objectEmbedding.length
        ) {

          continue;
        }

        for (
          const product
          of productsData
        ) {

          if (

            !product.embedding ||

            !product.embedding.length
          ) {

            continue;
          }

          const similarity =
            cosineSimilarity(

              objectEmbedding,

              product.embedding
            );

          console.log(
  "PRODUCT:",
  product.name,

  "SIMILARITY:",
  similarity
);
          let finalSimilarity =
  similarity;

/* TAG BOOST */

if (
  product.tags.includes(
    detectedObject.name
  )
) {

  finalSimilarity += 0.15;
}

/* TAG PENALTY */

else {

  finalSimilarity -= 0.22;
}
          if (finalSimilarity > 0.45){

            const existing =
              matchedProductsMap.get(
                product.id
              );

            if (

              !existing ||

              similarity >
                existing.similarity
            ) {

              matchedProductsMap.set(

                product.id,

                {

                  ...product,

                  similarity:
  Number(
    finalSimilarity.toFixed(2)
  ),
                }
              );
            }
          }
        }
      }

      const matchedProducts =
        Array.from(
          matchedProductsMap.values()
        );

      matchedProducts.sort(

        (a, b) =>

          b.similarity -

          a.similarity
      );

      return res.json({

        frame:
          nearestFrame.frame,

        timestamp:
          nearestFrame.timestamp,

        detectedObjects:
          nearestFrame.objects,

        matchedProducts,
      });

    } catch (
      error
    ) {

      console.log(
        error
      );

      return res
        .status(500)
        .json({

          error:
            "Pause detection failed",
        });
    }
  }
);

/* --------------------------------
   START SERVER
-------------------------------- */

app.listen(
  5000,

  () => {

    console.log(
      "Server Running On Port 5000"
    );
  }
);