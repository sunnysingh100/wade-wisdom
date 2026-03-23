# Wade Wisdom

Wade Wisdom is an AI-powered knowledge assistant trained on Wade Foster's (co-founder & CEO of Zapier) public interviews, blog posts, essays, and podcasts. Built to share insights on startups, AI & automation, productivity, remote work, and company growth, this interactive chatbot emulates Wade's perspective — leveraging the latest Mistral models and a custom Retrieval-Augmented Generation (RAG) pipeline.

## 🚀 Key Features

- **Interactive Chat Interface**: A modern, responsive chat UI supporting natural language queries.
- **Thought Process Streaming**: Transparency into the AI's reasoning, rendering the model's `<think>` tags directly in the UI as collapsible elements.
- **RAG & Knowledge Base**: Uses Mastra (`@mastra/core`, `@mastra/rag`) to retrieve contextually relevant insights from a vector knowledge base hosted on Upstash (`@mastra/upstash`).
- **Autonomous Web Discovery**: Built-in cron jobs (`/api/cron/discover`) and ingestion scripts (`npm run discover`, `npm run ingest`) to automatically crawl, analyze, and absorb new content from the web into the knowledge base.
- **Transparent Sourcing**: Automatically identifies and badges responses as either sourced from the internal "Knowledge Base" (📚) or gathered via a live "Web Source" (🌐) fallback search.
- **Rich Markdown Rendering**: Leverages `react-markdown` and `remark-gfm` to beautifully render complex responses, including tables, lists, and formatted code blocks.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **AI Models & Tooling**: [Mistral AI SDK](https://sdk.vercel.ai/providers/ai-sdk-providers/mistral), [Vercel AI SDK](https://sdk.vercel.ai/docs), [Mastra AI](https://mastra.ai/)
- **Styling**: Tailwind CSS v4 & custom CSS (`globals.css`)
- **Vector Database**: Upstash Vector for hosting and querying embeddings.
- **Utilities**: `dotenv` for environment management, `linkedom` & `@mozilla/readability` for scraping web content.

## 📦 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm, yarn, pnpm, or bun

### 1. Installation

Clone the repository and install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Variables

Create a `.env` or `.env.local` file in the root directory. You'll need to set the required API keys for Mistral and other relevant services configured in the project.

```env
# Example .env file content
MISTRAL_API_KEY="your-mistral-api-key"
UPSTASH_VECTOR_REST_URL="your-upstash-url"
UPSTASH_VECTOR_REST_TOKEN="your-upstash-token"
```

### 3. Running the Development Server

Start the local server. The app should be accessible at [http://localhost:3000](http://localhost:3000).

```bash
npm run dev
```

### 4. Knowledge Base Operations

To manually trigger the ingestion or discovery of new knowledge base documents, you can use the built-in npm scripts:

- **Ingest explicit content**:
  ```bash
  npm run ingest
  ```
- **Run automated web discovery**:
  ```bash
  npm run discover
  ```

## 📂 Project Structure

- `src/app/`: Next.js App Router containing the main `page.tsx`, layout, and API routes (`/api/chat`, `/api/cron/discover`).
- `src/content/`: Pre-defined source material or scraped data waiting to be ingested.
- `src/mastra/`: Mastra agent configurations, workflows, and RAG definitions.
- `src/scripts/`: Automation scripts like `discover.ts` and `ingest.ts`.
- `public/`: Public static assets.

## 💡 Customization

You can start modifying the UI by editing `src/app/page.tsx` and the core styles in `src/app/globals.css`. The application features a custom stream parser designed specifically to intercept sentinels and `thought` tags from the Mistral models, avoiding false-positive triggers and ensuring smooth frontend streaming.

## 📝 License

This project is open-source and available for configuration or further innovation under standard OSS guidelines.
