# NMT & Context Agent Design

This agent is the "brain" of the translation process, responsible for accurate translation and understanding the nuances of the conversation.

## Core Responsibilities

-   **Neural Machine Translation**: Translate transcribed text into the target language.
-   **Contextual Understanding**: Maintain a dynamic understanding of the conversation to handle idioms, slang, and cultural nuances.
-   **Emotional Tone Analysis**: Analyze the text to infer the emotional tone and intent of the speaker.

## Vertex AI Integration

-   **API**: `Vertex AI Translation API` for high-quality NMT.
-   **Dynamic Context**: Implement a "context window" that stores the last few conversational turns. [cite_start]This context is provided to the Translation API to improve accuracy for ambiguous words and phrases.

## "Hard-to-Copy" Feature: Contextual and Cultural Adaptation

-   **Idiom and Slang Detection**: A custom module will pre-process the text to identify idiomatic expressions. [cite_start]If an idiom is detected, it will be replaced with its contextual meaning before being sent to the NMT agent.
-   [cite_start]**Cultural Nuance Agent**: A specialized sub-agent will analyze the text for cultural references and adjust the translation to be culturally appropriate for the target audience.
-   [cite_start]**Emotional Consistency**: The agent will pass metadata about the emotional tone to the TTS agent to ensure the synthesized voice matches the speaker's intent.

This agent goes beyond literal translation to provide a more natural and human-like conversational experience.
