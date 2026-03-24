# Wade Wisdom - Gemini Context

This document provides instructional context and development guidelines for the Wade Wisdom project.

## Project Overview

Wade Wisdom is an AI-powered knowledge assistant designed to emulate the perspective and insights of Wade Foster (co-founder & CEO of Zapier). It leverages a custom Retrieval-Augmented Generation (RAG) pipeline to provide accurate, source-backed answers on topics such as startups, automation, productivity, and remote work.

### Core Technologies
- **Framework**: Next.js 16 (App Router, React 19)
- **AI Orchestration**: [Mastra](https://mastra.ai/) (`@mastra/core`, `@mastra/rag`)
- **LLM & Embeddings**: [Mistral AI](https://mistral.ai/) (via `@ai-sdk/mistral`)
- **Vector Database**: [Upstash Vector](https://upstash.com/) (`@mastra/upstash`)
- **Streaming & UI**: [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`, `@ai-sdk/react`)
- **Styling**: Tailwind CSS v4

## Architecture & Workflows

### 1. Agentic System (`src/mastra/`)
The core intelligence resides in the `wade-wisdom-agent`.
- **Identity**: Channels Wade Foster's knowledgeable, practical, and approachable persona.
- **Thought Process**: Mandatory `<think>` tags for reasoning before the final response.
- **Tools**:
    - `wade-kb-search`: Primary tool for searching the curated Upstash knowledge base.
    - `wade-web-search`: Fallback tool for searching the web (via Serper.dev or DuckDuckGo).
- **Strategy**: Always search the KB first. Fall back to web search only if KB results are insufficient.

### 2. Knowledge Ingestion (`src/scripts/ingest.ts`)
A Mastra workflow that processes static source material from `src/content/wade-knowledge.ts`.
- **Workflow**: `chunk-documents` -> `embed-and-upsert`.
- **Embeddings**: Uses `mistral-embed` (1024 dimensions).

### 3. Web Discovery (`src/scripts/discover.ts`)
An autonomous script for expanding the knowledge base.
- **Process**: Search -> Fetch (Readability) -> Relevance Filter -> Deduplicate (Hash) -> Chunk -> Embed -> Upsert.
- **Trigger**: Can be run manually or via a cron job at `/api/cron/discover`.

## Key Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Webpack. |
| `npm run build` | Builds the application for production. |
| `npm run start` | Starts the production server. |
| `npm run ingest` | Runs the RAG ingestion workflow for core knowledge. |
| `npm run discover` | Triggers the autonomous web discovery script. |
| `npm run lint` | Runs ESLint for code quality checks. |

## Development Conventions

### AI & Agent Implementation
- **Mastra First**: All agent definitions, tools, and workflows should use Mastra's core library.
- **Source Transparency**: Responses must distinguish between Knowledge Base (📚) and Web (🌐) sources.
- **Strict Adherence**: The agent must not hallucinate or guess if no information is found in sources.

### UI/UX Standards
- **Streaming**: The frontend ( `src/app/page.tsx`) uses a custom parser to handle Mistral's `<think>` tags and stream them as collapsible elements.
- **Styling**: Adhere to Tailwind CSS v4 conventions. Global styles are managed in `src/app/globals.css`.

### Testing & Validation
- **Environment**: Ensure `.env` is configured with `MISTRAL_API_KEY`, `UPSTASH_VECTOR_REST_URL`, and `UPSTASH_VECTOR_REST_TOKEN`.
- **Scripts**: Always validate ingestion and discovery scripts in a local environment before deploying cron jobs.

## Directory Map

- `src/app/`: Next.js pages and API routes (Chat, Discovery Cron).
- `src/mastra/`: Central hub for agents, tools, and vector store configuration.
- `src/scripts/`: Backend automation for data pipelines.
- `src/content/`: Source data and discovery logs.
