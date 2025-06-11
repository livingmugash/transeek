# Voice Cloning & TTS Agent Design

This agent is responsible for the most innovative feature of the platform: real-time voice mimicry.

## Core Responsibilities

-   **Real-time Voice Capture**: Continuously capture a small sample of the speaker's voice.
-   **Voiceprint Extraction**: Create a "voiceprint" that encapsulates the unique characteristics of the speaker's voice.
-   **Text-to-Speech Synthesis**: Convert the translated text into speech using the cloned voice.

## Vertex AI Integration (and Free-Tier Workarounds)

-   **API**: `Vertex AI Text-to-Speech (TTS) API`.
-   **Challenge**: The free tier of Vertex AI TTS does not support real-time voice cloning.
-   **Workaround**:
    1.  **Initial Voice Sample**: During the "onboarding" or the first few seconds of a call, the system will capture a 5-10 second audio sample of each speaker.
    2.  **Voice Model Creation (Conceptual)**: This sample would ideally be used to fine-tune a TTS model for that speaker. Since this is not free, we will simulate this by selecting the closest available pre-existing voice from the Vertex AI gallery and modifying its pitch and speed to match the speaker's.
    3.  **Real-time Synthesis**: The translated text is then synthesized using this "pseudo-cloned" voice.

## Natural Prosody and Intonation

-   **Prosody Transfer**: The agent will receive metadata from the NMT & Context Agent about the emotional tone and intent. [cite_start]This information will be used to adjust the prosody (rhythm, stress, intonation) of the synthesized speech to make it sound more natural and expressive.

This agent is the key to creating a truly seamless and personal communication experience.
