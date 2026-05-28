# Shoppable Video OTT Platform

## Overview

Shoppable Video is an AI-powered OTT style video streaming platform built using React Native CLI, Node.js, and Python AI services. The platform allows users to upload videos, process them through an AI pipeline, detect products from scenes, and display interactive shoppable products directly inside the video player.

The project combines:

* OTT style video streaming
* AI powered object detection
* Product similarity matching
* X-Ray shopping experience
* Interactive mobile UI
* Custom gesture driven player system

---

# Features

## OTT Video Player

* Custom React Native video player
* Play/Pause controls
* Double tap seek
* Gesture based controls
* Auto hide controls
* Fullscreen landscape mode
* Picture in Picture mode
* Brightness & volume swipe gestures
* Playback speed support
* Continue watching section

---

## AI Product Detection

* Video frame extraction
* Object detection using YOLOv8
* Product embedding generation using CLIP
* Cosine similarity based matching
* Timestamp wise product detection

---

## X-Ray Shopping Experience

* Pause video to open shopping panel
* Product recommendations based on current scene
* Landscape side shopping panel
* Portrait bottom sheet shopping panel
* Buy product links

---

# Tech Stack

| Layer               | Technology                    |
| ------------------- | ----------------------------- |
| Frontend            | React Native CLI + TypeScript |
| Navigation          | React Navigation              |
| Animations          | React Native Reanimated       |
| Gestures            | React Native Gesture Handler  |
| Video Engine        | react-native-video            |
| Backend             | Node.js + Express             |
| Upload Handling     | Multer                        |
| AI                  | Python                        |
| Object Detection    | YOLOv8                        |
| Embeddings          | OpenAI CLIP                   |
| Similarity Matching | Scikit-learn                  |
| Image Processing    | Pillow                        |

---

# Project Structure

```txt
shoppable-video/
├── shoppableOTT/
├── backend/
├── ai/
```

---

# How The Project Works

## Step 1 — Upload Video

User uploads:

* video
* product images
* product details

through frontend upload screen.

---

## Step 2 — Backend Processing

Backend:

* stores uploaded files
* extracts frames using FFmpeg
* runs Python AI scripts

---

## Step 3 — AI Detection

AI pipeline:

* detects objects using YOLOv8
* crops detected objects
* generates embeddings using CLIP
* compares embeddings with uploaded products

---

## Step 4 — Detection JSON

AI generates timestamp wise detection metadata.

Example:

```json
[
  {
    "timestamp": 24,
    "objects": [
      {
        "name": "shoe",
        "confidence": 0.91
      }
    ]
  }
]
```

---

## Step 5 — Frontend X-Ray Shopping

When user pauses video:

* current timestamp checked
* matching products loaded
* X-Ray shopping panel opened

---

# Frontend Overview

Frontend is built using modular architecture.

Main systems:

* Navigation system
* OTT player engine
* Gesture system
* X-Ray UI
* Upload system
* Watch history system

---

# Backend Overview

Backend responsibilities:

* upload handling
* frame extraction
* AI communication
* detection APIs
* product APIs

---

# AI Overview

AI responsibilities:

* object detection
* embedding generation
* product matching
* similarity comparison

---

# APIs

## Fetch Videos

```txt
GET /videos
```

---

## Fetch Detections

```txt
GET /videos/:videoId/detections
```

---

## Fetch Products

```txt
GET /videos/:videoId/products
```

---

## Upload Video

```txt
POST /create-video
```

---

# OTT UX Features

## Gesture Controls

* single tap
* double tap seek
* long press 2x playback
* brightness swipe
* volume swipe

---

## Infinite Hero Carousel

Uses virtual list looping strategy to create infinite horizontal scrolling effect.

---

## Continue Watching

Stores:

* current playback time
* progress
* thumbnail
* duration

---

# Current Limitations

* Fashion detection can be improved
* Local JSON storage only
* No authentication system
* Synchronous AI processing

---

# Future Improvements

## AI

* Florence-2
* Grounding DINO
* Fashion specialized models
* Better apparel segmentation

---

## Backend

* Database integration
* Queue systems
* AI microservices
* WebSocket progress tracking

---

## Frontend

* Adaptive streaming
* Offline downloads
* Chromecast support
* TV support

---

# Performance Optimizations

## Frontend

* memo()
* shared values
* UI thread animations
* FlatList virtualization

---

## Backend

* async processing
* optimized frame extraction

---

## AI

* GPU acceleration
* lightweight YOLO models
* embedding caching

---

# Conclusion

This project demonstrates:

* advanced React Native architecture
* custom OTT player implementation
* AI powered commerce integration
* gesture based video UX
* Python AI + Node.js backend integration
* real time scene based shopping experience
