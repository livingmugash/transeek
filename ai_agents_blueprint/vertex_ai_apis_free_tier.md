# Leveraging Vertex AI APIs (Free Tier)

This project is designed to utilize the free tier of Google Cloud's Vertex AI for its core AI functionalities.

## Free Tier Strategy

-   **Speech-to-Text (ASR)**: The free tier typically includes a monthly quota for streaming speech recognition, which is sufficient for development and initial trials.
-   **Translation (NMT)**: The Translation API also offers a free monthly quota for character translation, suitable for the text volumes in this project's development phase.
-   **Text-to-Speech (TTS)**: The TTS API provides a free quota for character synthesis. While the free tier does not support custom voice cloning, we will use it to select the closest matching standard or WaveNet voice and modify its prosody to simulate the voice mimicry feature.

By staying within these free tier limits, the core AI pipeline can be developed and tested without incurring costs.
