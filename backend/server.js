// // const express = require("express");
// // const cors = require("cors");
// // const fs = require("fs");
// // const { exec } = require("child_process");
// // const multer = require("multer"); //-->added
// // const ffmpeg = require("fluent-ffmpeg");  //-->added
// // const path = require("path"); //-->added
// // const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;  //-->added

// // ffmpeg.setFfmpegPath(ffmpegPath);

// // const storage = multer.diskStorage({

// //   destination: function (
// //   req,
// //   file,
// //   cb
// // ) {

// //   if (
// //     file.fieldname === "video"
// //   ) {

// //     cb(null, "uploads/");
// //   }

// //   else {

// //     cb(
// //       null,
// //       "product_images/"
// //     );
// //   }
// // },

// //   filename: function (req, file, cb) {

// //     cb(
// //       null,
// //       Date.now() + path.extname(file.originalname)
// //     );
// //   },
// // });

// // const upload = multer({ storage });

// // const app = express();

// // app.use(cors());
// // app.use(express.json());
// // app.use(
// //   "/uploads",
// //   express.static("uploads")
// // );
// // app.use(
// //   "/product_images",
// //   express.static("product_images")
// // );


// // if (!fs.existsSync("frames")) {
// //   fs.mkdirSync("frames");
// // }

// // app.post("/pause", (req, res) => {

// //   try {

// //     const {
// //       currentTime,
// //       videoId,
// //     } = req.body;

// //     // LOAD DETECTION FILE
// //     const detectionPath =
// //       `./detections/${videoId}.json`;

// //     let detectionData = [];

// //     if (fs.existsSync(detectionPath)) {

// //       detectionData = JSON.parse(
// //         fs.readFileSync(
// //           detectionPath,
// //           "utf-8"
// //         )
// //       );
// //     }

// //     // LOAD PRODUCTS FILE
// //     const productsPath =
// //       `./products/${videoId}.json`;

// //     let productsData = [];

// //     if (fs.existsSync(productsPath)) {

// //       productsData = JSON.parse(
// //         fs.readFileSync(
// //           productsPath,
// //           "utf-8"
// //         )
// //       );
// //     }

// //     // Find nearest frame
// //     let nearestFrame = detectionData[0];

// //     let smallestDifference =
// //       Math.abs(
// //         currentTime -
// //         nearestFrame.timestamp
// //       );

// //     detectionData.forEach((frameData) => {

// //       const difference =
// //         Math.abs(
// //           currentTime -
// //           frameData.timestamp
// //         );

// //       if (
// //         difference <
// //         smallestDifference
// //       ) {

// //         smallestDifference =
// //           difference;

// //         nearestFrame = frameData;
// //       }
// //     });

// //     // Get detected object names
// //     const detectedNames =
// //       nearestFrame.objects.map(
// //         (obj) => obj.name
// //       );

// //     // Match products
// //     const matchedProducts = [];

// // for (
// //   const detectedObject
// //   of nearestFrame.objects
// // ) {

// //   if (
// //     !detectedObject.bbox
// //   ) continue;

// //   // FRAME IMAGE
// //   const framePath =
// //     path.join(

// //       __dirname,

// //       "frames",

// //       nearestFrame.frame
// //     );

// //   // CROP PATH
// //   const cropPath =
// //     path.join(

// //       __dirname,

// //       "temp_crop.jpg"
// //     );

// //   // CROP OBJECT
// //   await cropImage(

// //     framePath,

// //     detectedObject.bbox,

// //     cropPath
// //   );

// //   // GENERATE EMBEDDING
// //   const objectEmbedding =
// //     await generateEmbedding(
// //       cropPath
// //     );

// //   // COMPARE PRODUCTS
// //   for (
// //     const product
// //     of productsData
// //   ) {

// //     if (
// //       !product.embedding
// //         ?.length
// //     ) continue;

// //     const similarity =
// //       cosineSimilarity(

// //         objectEmbedding,

// //         product.embedding
// //       );

// //     console.log(
// //       product.name,
// //       similarity
// //     );

// //     // THRESHOLD
// //     if (
// //       similarity > 0.75
// //     ) {

// //       matchedProducts.push({

// //         ...product,

// //         similarity,
// //       });
// //     }
// //   }
// // }

// //     // Final response
// //     return res.json({

// //       frame: nearestFrame.frame,

// //       timestamp:
// //         nearestFrame.timestamp,

// //       detectedObjects:
// //         nearestFrame.objects,

// //       matchedProducts,
// //     });

// //   } catch (error) {

// //     console.log(error);

// //     return res.status(500).json({

// //       error: "Pause detection failed",
// //     });
// //   }
// // });

// // const extractFrames = (videoPath) => {

// //   return new Promise((resolve, reject) => {

// //     const outputFolder = path.join(
// //       __dirname,
// //       "frames"
// //     );

// //     ffmpeg(videoPath)

// //       .output(
// //         `${outputFolder}/frame_%03d.jpg`
// //       )

// //       .outputOptions("-vf fps=1/2")

// //       .on("start", (commandLine) => {

// //         console.log(
// //           "FFmpeg Started:",
// //           commandLine
// //         );
// //       })

// //       .on("end", () => {

// //         console.log(
// //           "Frames extracted successfully"
// //         );

// //         resolve();
// //       })

// //       .on("error", (err) => {

// //         console.log(
// //           "FFmpeg Error:",
// //           err
// //         );

// //         reject(err);
// //       })

// //       .run();
// //   });
// // };

// // const runObjectDetection = (videoId) => {

// //   return new Promise((resolve, reject) => {

// //     const aiFolderPath = path.join(
// //       __dirname,
// //       "../ai"
// //     );

// //     exec(

// //       `python detect.py ${videoId}`,

// //       {
// //         cwd: aiFolderPath,
// //       },

// //       (error, stdout, stderr) => {

// //         if (error) {

// //           console.log(
// //             "Python Error:",
// //             error
// //           );

// //           reject(error);

// //           return;
// //         }

// //         if (stderr) {

// //           console.log(
// //             "Python STDERR:",
// //             stderr
// //           );
// //         }

// //         console.log(
// //           "Python Output:",
// //           stdout
// //         );

// //         resolve();
// //       }
// //     );
// //   });
// // };

// // const generateEmbedding = (
// //   imagePath
// // ) => {

// //   return new Promise(
// //     (
// //       resolve,
// //       reject
// //     ) => {

// //       const aiFolderPath =
// //         path.join(
// //           __dirname,
// //           "../ai"
// //         );

// //       exec(

// //         `python generate_embedding.py "${imagePath}"`,

// //         {
// //           cwd:
// //             aiFolderPath,
// //         },

// //         (
// //           error,
// //           stdout,
// //           stderr
// //         ) => {

// //           if (error) {

// //             console.log(error);

// //             reject(error);

// //             return;
// //           }

// //           try {

// //             const embedding =
// //               JSON.parse(
// //                 stdout
// //               );

// //             resolve(
// //               embedding
// //             );

// //           } catch (err) {

// //             console.log(
// //               "Embedding Parse Error:",
// //               err
// //             );

// //             reject(err);
// //           }
// //         }
// //       );
// //     }
// //   );
// // };

// // const cropImage = (

// //   imagePath,

// //   bbox,

// //   outputPath

// // ) => {

// //   return new Promise(
// //     (
// //       resolve,
// //       reject
// //     ) => {

// //       const aiFolderPath =
// //         path.join(
// //           __dirname,
// //           "../ai"
// //         );

// //       exec(

// //         `python crop_object.py "${imagePath}" ${bbox.x1} ${bbox.y1} ${bbox.x2} ${bbox.y2} "${outputPath}"`,

// //         {
// //           cwd:
// //             aiFolderPath,
// //         },

// //         (
// //           error,
// //           stdout,
// //           stderr
// //         ) => {

// //           if (error) {

// //             reject(error);

// //             return;
// //           }

// //           resolve();
// //         }
// //       );
// //     }
// //   );
// // };

// // const cosineSimilarity = (
// //   vecA,
// //   vecB
// // ) => {

// //   let dot = 0;

// //   let magA = 0;

// //   let magB = 0;

// //   for (
// //     let i = 0;
// //     i < vecA.length;
// //     i++
// //   ) {

// //     dot +=
// //       vecA[i] * vecB[i];

// //     magA +=
// //       vecA[i] * vecA[i];

// //     magB +=
// //       vecB[i] * vecB[i];
// //   }

// //   magA = Math.sqrt(magA);

// //   magB = Math.sqrt(magB);

// //   return (
// //     dot /
// //     (magA * magB)
// //   );
// // };

// // // app.post(
// // //   "/create-video",

// // //   upload.any(),

// // //   async (req, res) => {

// // //     try {

// // //       // VIDEO FILE
// // //       const videoFile =
// // //   req.files.find(
// // //     (file) =>
// // //       file.fieldname === "video"
// // //   );

// // // const videoPath =
// // //   videoFile.path;

// // //       // UNIQUE VIDEO ID
// // //       const videoId =
// // //         Date.now().toString();

// // //       // MULTIPLE PRODUCTS
// // //       const products =
// // //         JSON.parse(
// // //           req.body.products
// // //         );

// // //       console.log(
// // //         "Uploaded Video:",
// // //         videoPath
// // //       );

// // //       // STEP 1
// // //       // EXTRACT FRAMES

// // //       await extractFrames(
// // //         videoPath
// // //       );

// // //       console.log(
// // //         "Frames Extracted"
// // //       );

// // //       // STEP 2
// // //       // RUN AI DETECTION

// // //       await runObjectDetection(
// // //         videoId
// // //       );

// // //       console.log(
// // //         "AI Detection Completed"
// // //       );

// // //       // STEP 3
// // //       // SAVE PRODUCTS

// // //       const productFilePath =
// // //         `./products/${videoId}.json`;

// // //         const imageFile =
// // //   req.files.find(
// // //     (file) =>
// // //       file.fieldname ===
// // //       `productImage_${index}`
// // //   );

// // // const embedding =
// // //   await generateEmbedding(
// // //     imageFile.path
// // //   );

// // //       const productData =
// // //         products.map(
// // //           (product) => {

// // //             return {

// // //               id:
// // //                 Date.now() +
// // //                 Math.random(),

// // //               videoId,

// // //               name:
// // //                 product.name,

// // //               price:
// // //                 Number(
// // //                   product.price
// // //                 ),

// // //               image:
// // //                 imageFile.path,

// // //               embedding,

// // //               buyLink:
// // //                 product.buyLink,

// // //               tags:
// // //                 product.tags
// // //                   .split(",")

// // //                   .map(
// // //                     (tag) =>
// // //                       tag.trim()
// // //                   ),
// // //             };
// // //           }
// // //         );

// // //       fs.writeFileSync(

// // //         productFilePath,

// // //         JSON.stringify(
// // //           productData,
// // //           null,
// // //           2
// // //         )
// // //       );

// // //       // STEP 4
// // //       // SAVE VIDEO METADATA

// // //       const videosFile =
// // //         "./videos.json";

// // //       let videos = [];

// // //       if (
// // //         fs.existsSync(
// // //           videosFile
// // //         )
// // //       ) {

// // //         const rawData =
// // //           fs.readFileSync(
// // //             videosFile,
// // //             "utf-8"
// // //           );

// // //         if (
// // //           rawData.trim()
// // //         ) {

// // //           videos =
// // //             JSON.parse(
// // //               rawData
// // //             );
// // //         }
// // //       }

// // //       // ADD VIDEO ENTRY

// // //       videos.push({

// // //         id: videoId,

// // //         videoPath,

// // //         detectionFile:
// // //           `detections/${videoId}.json`,

// // //         productFile:
// // //           `products/${videoId}.json`,
// // //       });

// // //       // SAVE VIDEOS

// // //       fs.writeFileSync(

// // //         videosFile,

// // //         JSON.stringify(
// // //           videos,
// // //           null,
// // //           2
// // //         )
// // //       );

// // //       // RESPONSE

// // //       return res.json({

// // //         success: true,

// // //         videoId,

// // //         message:
// // //           "Video created successfully",
// // //       });

// // //     } catch (error) {

// // //       console.log(error);

// // //       return res.status(500).json({

// // //         error:
// // //           "Video creation failed",
// // //       });
// // //     }
// // //   }
// // // );
// // app.post(

// //   "/create-video",

// //   upload.any(),

// //   async (req, res) => {

// //     try {

// //       // VIDEO FILE
// //       const videoFile =
// //         req.files.find(
// //           (file) =>
// //             file.fieldname ===
// //             "video"
// //         );

// //       if (!videoFile) {

// //         return res.status(400).json({

// //           error:
// //             "Video file missing",
// //         });
// //       }

// //       const videoPath =
// //         videoFile.path;

// //       // VIDEO ID
// //       const videoId =
// //         Date.now().toString();

// //       // PRODUCTS
// //       const products =
// //         JSON.parse(
// //           req.body.products
// //         );

// //       console.log(
// //         "Uploaded Video:",
// //         videoPath
// //       );

// //       // EXTRACT FRAMES
// //       await extractFrames(
// //         videoPath
// //       );

// //       console.log(
// //         "Frames Extracted"
// //       );

// //       // RUN AI
// //       await runObjectDetection(
// //         videoId
// //       );

// //       console.log(
// //         "AI Detection Completed"
// //       );

// //       // PRODUCTS FILE
// //       const productFilePath =
// //         `./products/${videoId}.json`;

// //       // FINAL PRODUCT ARRAY
// //       const productData = [];

// //       // LOOP PRODUCTS
// //       for (
// //         let index = 0;
// //         index <
// //         products.length;
// //         index++
// //       ) {

// //         const product =
// //           products[index];

// //         // PRODUCT IMAGE
// //         const imageFile =
// //           req.files.find(
// //             (file) =>
// //               file.fieldname ===
// //               `productImage_${index}`
// //           );

// //         let embedding = [];

// //         if (imageFile) {

// //           const absoluteImagePath =
// //   path.join(
// //     __dirname,
// //     imageFile.path
// //   );

// //           embedding =
// //             await generateEmbedding(
// //   absoluteImagePath
// // );
// //         }

// //         productData.push({

// //           id:
// //             Date.now() +
// //             Math.random(),

// //           videoId,

// //           name:
// //             product.name,

// //           price:
// //             Number(
// //               product.price
// //             ),

// //           image:
// //   imageFile

// //     ? `http://192.168.29.235:5000/${imageFile.path.replace(
// //         /\\/g,
// //         "/"
// //       )}`

// //     : "",

// //           embedding,

// //           buyLink:
// //             product.buyLink,

// //           tags:
// //             product.tags
// //               .split(",")

// //               .map(
// //                 (tag) =>
// //                   tag.trim()
// //               ),
// //         });
// //       }

// //       // SAVE PRODUCTS
// //       fs.writeFileSync(

// //         productFilePath,

// //         JSON.stringify(
// //           productData,
// //           null,
// //           2
// //         )
// //       );

// //       // VIDEOS FILE
// //       const videosFile =
// //         "./videos.json";

// //       let videos = [];

// //       if (
// //         fs.existsSync(
// //           videosFile
// //         )
// //       ) {

// //         const rawData =
// //           fs.readFileSync(
// //             videosFile,
// //             "utf-8"
// //           );

// //         if (
// //           rawData.trim()
// //         ) {

// //           videos =
// //             JSON.parse(
// //               rawData
// //             );
// //         }
// //       }

// //       // ADD VIDEO
// //       videos.push({

// //         id: videoId,

// //         videoPath,

// //         detectionFile:
// //           `detections/${videoId}.json`,

// //         productFile:
// //           `products/${videoId}.json`,
// //       });

// //       // SAVE VIDEOS
// //       fs.writeFileSync(

// //         videosFile,

// //         JSON.stringify(
// //           videos,
// //           null,
// //           2
// //         )
// //       );

// //       return res.json({

// //         success: true,

// //         videoId,

// //         message:
// //           "Video created successfully",
// //       });

// //     } catch (error) {

// //       console.log(error);

// //       return res.status(500).json({

// //         error:
// //           "Video creation failed",
// //       });
// //     }
// //   }
// // );

// // app.get("/videos", (req, res) => {

// //   try {

// //     const videosFile =
// //       "./videos.json";

// //     let videos = [];

// //     if (
// //       fs.existsSync(videosFile)
// //     ) {

// //       const rawData =
// //         fs.readFileSync(
// //           videosFile,
// //           "utf-8"
// //         );

// //       if (
// //         rawData.trim()
// //       ) {

// //         videos =
// //           JSON.parse(
// //             rawData
// //           );
// //       }
// //     }

// //     // ADD FULL VIDEO URL
// //     const updatedVideos =
// //       videos.map((video) => {

// //         return {

// //           ...video,

// //           videoUrl:
// //             `http://192.168.29.235:5000/${video.videoPath.replace(
// //               /\\/g,
// //               "/"
// //             )}`,
// //         };
// //       });

// //     return res.json(
// //       updatedVideos
// //     );

// //   } catch (error) {

// //     console.log(error);

// //     return res.status(500).json({

// //       error:
// //         "Failed to fetch videos",
// //     });
// //   }
// // });

// // app.listen(5000, () => {
// //   console.log("Server running on port 5000");
// // });
// const express = require("express");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");

// const multer = require("multer");

// const ffmpeg = require("fluent-ffmpeg");

// const ffmpegPath =
//   require("@ffmpeg-installer/ffmpeg").path;

// const { exec } =
//   require("child_process");

// ffmpeg.setFfmpegPath(
//   ffmpegPath
// );

// const app = express();

// app.use(cors());

// app.use(express.json());

// /* -----------------------------
//    STATIC FOLDERS
// ----------------------------- */

// app.use(
//   "/uploads",
//   express.static("uploads")
// );

// app.use(
//   "/product_images",
//   express.static(
//     "product_images"
//   )
// );

// /* -----------------------------
//    CREATE REQUIRED FOLDERS
// ----------------------------- */

// const requiredFolders = [

//   "uploads",

//   "frames",

//   "detections",

//   "products",

//   "product_images",
// ];

// requiredFolders.forEach(
//   (folder) => {

//     if (
//       !fs.existsSync(folder)
//     ) {

//       fs.mkdirSync(folder, {
//         recursive: true,
//       });
//     }
//   }
// );

// /* -----------------------------
//    MULTER STORAGE
// ----------------------------- */

// const storage =
//   multer.diskStorage({

//     destination: function (
//       req,
//       file,
//       cb
//     ) {

//       if (
//         file.fieldname ===
//         "video"
//       ) {

//         cb(null, "uploads/");
//       }

//       else {

//         cb(
//           null,
//           "product_images/"
//         );
//       }
//     },

//     filename: function (
//       req,
//       file,
//       cb
//     ) {

//       cb(

//         null,

//         Date.now() +
//           path.extname(
//             file.originalname
//           )
//       );
//     },
//   });

// const upload = multer({
//   storage,
// });

// /* -----------------------------
//    EXTRACT FRAMES
// ----------------------------- */

// const extractFrames = (
//   videoPath
// ) => {

//   return new Promise(
//     (
//       resolve,
//       reject
//     ) => {

//       const videoId =
//         path.basename(
//           videoPath,
//           path.extname(
//             videoPath
//           )
//         );

//       const outputFolder =
//         path.join(

//           __dirname,

//           "frames",

//           videoId
//         );

//       if (
//         !fs.existsSync(
//           outputFolder
//         )
//       ) {

//         fs.mkdirSync(
//           outputFolder,
//           {
//             recursive: true,
//           }
//         );
//       }

//       ffmpeg(videoPath)

//         .output(
//           `${outputFolder}/frame_%03d.jpg`
//         )

//         .outputOptions(
//           "-vf fps=1/2"
//         )

//         .on(
//           "start",

//           (
//             commandLine
//           ) => {

//             console.log(

//               "FFmpeg Started:",

//               commandLine
//             );
//           }
//         )

//         .on(
//           "end",

//           () => {

//             console.log(
//               "Frames Extracted"
//             );

//             resolve();
//           }
//         )

//         .on(
//           "error",

//           (err) => {

//             console.log(
//               err
//             );

//             reject(err);
//           }
//         )

//         .run();
//     }
//   );
// };

// /* -----------------------------
//    RUN YOLO DETECTION
// ----------------------------- */

// const runObjectDetection =
//   (videoId) => {

//     return new Promise(
//       (
//         resolve,
//         reject
//       ) => {

//         const aiFolderPath =
//           path.join(
//             __dirname,
//             "../ai"
//           );

//         exec(

//           `python detect.py ${videoId}`,

//           {
//             cwd:
//               aiFolderPath,
//           },

//           (
//             error,
//             stdout,
//             stderr
//           ) => {

//             if (
//               error
//             ) {

//               console.log(
//                 error
//               );

//               reject(
//                 error
//               );

//               return;
//             }

//             console.log(
//               stdout
//             );

//             resolve();
//           }
//         );
//       }
//     );
//   };

// /* -----------------------------
//    GENERATE EMBEDDING
// ----------------------------- */

// const generateEmbedding =
//   (imagePath) => {

//     return new Promise(
//       (
//         resolve,
//         reject
//       ) => {

//         const aiFolderPath =
//           path.join(
//             __dirname,
//             "../ai"
//           );

//         exec(

//           `python generate_embedding.py "${imagePath}"`,

//           {
//             cwd:
//               aiFolderPath,
//           },

//           (
//             error,
//             stdout,
//             stderr
//           ) => {

//             if (
//               error
//             ) {

//               console.log(
//                 error
//               );

//               reject(
//                 error
//               );

//               return;
//             }

//             try {

//               const embedding =
//                 JSON.parse(
//                   stdout
//                 );

//               resolve(
//                 embedding
//               );

//             } catch (
//               err
//             ) {

//               console.log(
//                 err
//               );

//               reject(
//                 err
//               );
//             }
//           }
//         );
//       }
//     );
//   };

// /* -----------------------------
//    CROP IMAGE
// ----------------------------- */

// const cropImage = (

//   imagePath,

//   bbox,

//   outputPath

// ) => {

//   return new Promise(
//     (
//       resolve,
//       reject
//     ) => {

//       const aiFolderPath =
//         path.join(
//           __dirname,
//           "../ai"
//         );

//       exec(

//         `python crop_object.py "${imagePath}" ${bbox.x1} ${bbox.y1} ${bbox.x2} ${bbox.y2} "${outputPath}"`,

//         {
//           cwd:
//             aiFolderPath,
//         },

//         (
//           error,
//           stdout,
//           stderr
//         ) => {

//           if (
//             error
//           ) {

//             reject(
//               error
//             );

//             return;
//           }

//           resolve();
//         }
//       );
//     }
//   );
// };

// /* -----------------------------
//    COSINE SIMILARITY
// ----------------------------- */

// const cosineSimilarity = (

//   vecA,

//   vecB

// ) => {

//   let dot = 0;

//   let magA = 0;

//   let magB = 0;

//   for (
//     let i = 0;
//     i < vecA.length;
//     i++
//   ) {

//     dot +=
//       vecA[i] *
//       vecB[i];

//     magA +=
//       vecA[i] *
//       vecA[i];

//     magB +=
//       vecB[i] *
//       vecB[i];
//   }

//   magA =
//     Math.sqrt(magA);

//   magB =
//     Math.sqrt(magB);

//   return (
//     dot /
//     (magA * magB)
//   );
// };

// /* -----------------------------
//    CREATE VIDEO API
// ----------------------------- */

// app.post(

//   "/create-video",

//   upload.any(),

//   async (
//     req,
//     res
//   ) => {

//     try {

//       /* VIDEO FILE */

//       const videoFile =
//         req.files.find(
//           (file) =>
//             file.fieldname ===
//             "video"
//         );

//       if (
//         !videoFile
//       ) {

//         return res
//           .status(400)
//           .json({

//             error:
//               "Video missing",
//           });
//       }

//       const videoPath =
//         videoFile.path;

//       const videoId =
//         path.basename(
//           videoPath,
//           path.extname(
//             videoPath
//           )
//         );

//       /* PRODUCTS */

//       const products =
//         JSON.parse(
//           req.body.products
//         );

//       console.log(
//         "VIDEO:",
//         videoPath
//       );

//       /* EXTRACT FRAMES */

//       await extractFrames(
//         videoPath
//       );

//       /* AI DETECTION */

//       await runObjectDetection(
//         videoId
//       );

//       /* PRODUCT FILE */

//       const productFilePath =
//         `./products/${videoId}.json`;

//       const productData = [];

//       /* LOOP PRODUCTS */

//       for (
//         let index = 0;
//         index <
//         products.length;
//         index++
//       ) {

//         const product =
//           products[index];

//         /* PRODUCT IMAGE */

//         const imageFile =
//           req.files.find(
//             (file) =>
//               file.fieldname ===
//               `productImage_${index}`
//           );

//         let embedding = [];

//         let imageUrl = "";

//         if (
//           imageFile
//         ) {

//           const absoluteImagePath =
//             path.join(

//               __dirname,

//               imageFile.path
//             );

//           embedding =
//             await generateEmbedding(
//               absoluteImagePath
//             );

//           imageUrl =
//             `http://192.168.29.235:5000/${imageFile.path.replace(
//               /\\/g,
//               "/"
//             )}`;
//         }

//         productData.push({

//           id:
//             Date.now() +
//             Math.random(),

//           videoId,

//           name:
//             product.name,

//           price:
//             Number(
//               product.price
//             ),

//           image:
//             imageUrl,

//           embedding,

//           buyLink:
//             product.buyLink,

//           tags:
//             product.tags
//               .split(",")

//               .map(
//                 (tag) =>
//                   tag.trim()
//               ),
//         });
//       }

//       /* SAVE PRODUCTS */

//       fs.writeFileSync(

//         productFilePath,

//         JSON.stringify(
//           productData,
//           null,
//           2
//         )
//       );

//       /* VIDEOS JSON */

//       const videosFile =
//         "./videos.json";

//       let videos = [];

//       if (
//         fs.existsSync(
//           videosFile
//         )
//       ) {

//         const rawData =
//           fs.readFileSync(
//             videosFile,
//             "utf-8"
//           );

//         if (
//           rawData.trim()
//         ) {

//           videos =
//             JSON.parse(
//               rawData
//             );
//         }
//       }

//       videos.push({

//         id: videoId,

//         videoPath,

//         detectionFile:
//           `detections/${videoId}.json`,

//         productFile:
//           `products/${videoId}.json`,
//       });

//       fs.writeFileSync(

//         videosFile,

//         JSON.stringify(
//           videos,
//           null,
//           2
//         )
//       );

//       return res.json({

//         success: true,

//         videoId,

//         message:
//           "Video Created Successfully",
//       });

//     } catch (
//       error
//     ) {

//       console.log(
//         error
//       );

//       return res
//         .status(500)
//         .json({

//           error:
//             "Video creation failed",
//         });
//     }
//   }
// );

// /* -----------------------------
//    FETCH VIDEOS
// ----------------------------- */

// app.get(
//   "/videos",

//   (
//     req,
//     res
//   ) => {

//     try {

//       const videosFile =
//         "./videos.json";

//       let videos = [];

//       if (
//         fs.existsSync(
//           videosFile
//         )
//       ) {

//         const rawData =
//           fs.readFileSync(
//             videosFile,
//             "utf-8"
//           );

//         if (
//           rawData.trim()
//         ) {

//           videos =
//             JSON.parse(
//               rawData
//             );
//         }
//       }

//       const updatedVideos =
//         videos.map(
//           (
//             video
//           ) => {

//             return {

//               ...video,

//               videoUrl:
//                 `http://192.168.29.235:5000/${video.videoPath.replace(
//                   /\\/g,
//                   "/"
//                 )}`,
//             };
//           }
//         );

//       return res.json(
//         updatedVideos
//       );

//     } catch (
//       error
//     ) {

//       console.log(
//         error
//       );

//       return res
//         .status(500)
//         .json({

//           error:
//             "Failed to fetch videos",
//         });
//     }
//   }
// );

// /* -----------------------------
//    PAUSE API
// ----------------------------- */

// app.post(

//   "/pause",

//   async (
//     req,
//     res
//   ) => {

//     try {

//       const {
//         currentTime,
//         videoId,
//       } = req.body;

//       /* DETECTIONS */

//       const detectionPath =
//         `./detections/${videoId}.json`;

//       let detectionData =
//         [];

//       if (
//         fs.existsSync(
//           detectionPath
//         )
//       ) {

//         detectionData =
//           JSON.parse(

//             fs.readFileSync(
//               detectionPath,
//               "utf-8"
//             )
//           );
//       }

//       /* PRODUCTS */

//       const productsPath =
//         `./products/${videoId}.json`;

//       let productsData =
//         [];

//       if (
//         fs.existsSync(
//           productsPath
//         )
//       ) {

//         productsData =
//           JSON.parse(

//             fs.readFileSync(
//               productsPath,
//               "utf-8"
//             )
//           );
//       }

//       if (
//         !detectionData.length
//       ) {

//         return res
//           .status(404)
//           .json({

//             error:
//               "No detections found",
//           });
//       }

//       /* FIND FRAME */

//       let nearestFrame =
//         detectionData[0];

//       let smallestDifference =
//         Math.abs(

//           currentTime -

//           nearestFrame.timestamp
//         );

//       detectionData.forEach(
//         (
//           frameData
//         ) => {

//           const difference =
//             Math.abs(

//               currentTime -

//               frameData.timestamp
//             );

//           if (
//             difference <
//             smallestDifference
//           ) {

//             smallestDifference =
//               difference;

//             nearestFrame =
//               frameData;
//           }
//         }
//       );

//       /* MATCHED PRODUCTS */

//       const matchedProductsMap =
//         new Map();

//       /* LOOP OBJECTS */

//       for (
//         const detectedObject
//         of nearestFrame.objects
//       ) {

//         if (
//           !detectedObject.bbox
//         ) {

//           continue;
//         }

//         /* FRAME PATH */

//         const framePath =
//           path.join(

//             __dirname,

//             "frames",

//             videoId,

//             nearestFrame.frame
//           );

//         /* TEMP CROP */

//         const cropPath =
//           path.join(

//             __dirname,

//             `temp_crop_${Date.now()}_${Math.random()}.jpg`
//           );

//         /* CROP */

//         await cropImage(

//           framePath,

//           detectedObject.bbox,

//           cropPath
//         );

//         /* EMBEDDING */

//         const objectEmbedding =
//           await generateEmbedding(
//             cropPath
//           );

//         /* DELETE TEMP */

//         if (
//           fs.existsSync(
//             cropPath
//           )
//         ) {

//           fs.unlinkSync(
//             cropPath
//           );
//         }

//         /* COMPARE PRODUCTS */

//         for (
//           const product
//           of productsData
//         ) {

//           if (

//             !product.embedding ||

//             !product.embedding.length
//           ) {

//             continue;
//           }

//           const similarity =
//             cosineSimilarity(

//               objectEmbedding,

//               product.embedding
//             );

//           console.log(

//             product.name,

//             similarity
//           );

//           if (
//             similarity > 0.28
//           ) {

//             const existing =
//               matchedProductsMap.get(
//                 product.id
//               );

//             if (

//               !existing ||

//               similarity >
//                 existing.similarity
//             ) {

//               matchedProductsMap.set(

//                 product.id,

//                 {

//                   ...product,

//                   similarity:
//                     Number(
//                       similarity.toFixed(
//                         2
//                       )
//                     ),
//                 }
//               );
//             }
//           }
//         }
//       }

//       const matchedProducts =
//         Array.from(
//           matchedProductsMap.values()
//         );

//       matchedProducts.sort(

//         (a, b) =>

//           b.similarity -

//           a.similarity
//       );

//       return res.json({

//         frame:
//           nearestFrame.frame,

//         timestamp:
//           nearestFrame.timestamp,

//         detectedObjects:
//           nearestFrame.objects,

//         matchedProducts,
//       });

//     } catch (
//       error
//     ) {

//       console.log(
//         error
//       );

//       return res
//         .status(500)
//         .json({

//           error:
//             "Pause detection failed",
//         });
//     }
//   }
// );

// /* -----------------------------
//    START SERVER
// ----------------------------- */

// app.listen(
//   5000,

//   () => {

//     console.log(
//       "Server Running On Port 5000"
//     );
//   }
// );
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

  finalSimilarity -= 0.35;
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