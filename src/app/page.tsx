"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  thought?: string;
  source?: "kb" | "web";
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      thought: "",
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = "";
        let usedWebSearch = false;
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });

          // Detect web search source marker
          if (accumulated.includes("[SOURCE:web]")) {
            usedWebSearch = true;
            accumulated = accumulated.replace(/\n?\[SOURCE:web\]\n?/g, "");
          }

          // Parse thoughts using <think> tags
          let thought = "";
          let finalContent = accumulated;
          const thoughtMatch = finalContent.match(/<think>([\s\S]*?)<\/think>/g);
          
          if (thoughtMatch) {
            // Extract all thought blocks and join them
            thought = thoughtMatch.map(t => t.replace(/<\/?think>/g, '').trim()).join('\n\n');
            // Remove thought blocks from the content directly
            finalContent = finalContent.replace(/<think>([\s\S]*?)<\/think>\n?/g, '');
          }
          
          // Also check for unclosed thought blocks if we're mid-stream
          const unclosedMatch = finalContent.match(/<think>([\s\S]*)$/);
          if (unclosedMatch) {
             thought += (thought ? "\n\n" : "") + unclosedMatch[1].trim();
             finalContent = finalContent.replace(/<think>([\s\S]*)$/, '');
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content: finalContent.replace(/^[\s\n]+/, ''), // Trim leading whitespace left over from thoughts
                    thought: thought,
                    source: usedWebSearch ? "web" : "kb",
                  }
                : msg
            )
          );
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: "Sorry, I encountered an error. Please try again.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const topics = [
    { label: "Startups", color: "#e8d5b7" },
    { label: "AI & Automation", color: "#b7d5e8" },
    { label: "Productivity", color: "#d5e8b7" },
    { label: "Remote Work", color: "#e8b7d5" },
    { label: "Growth", color: "#d5b7e8" },
  ];

  const starters = [
    "How did Zapier grow to $5B with almost no funding?",
    "What is the 90% Rule for AI?",
    "How should startups think about hiring?",
    "What makes remote culture work at Zapier?",
    "How does Wade Foster use AI personally?",
    "What is seedstrapping?",
  ];

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-content">
          {/* Brand */}
          <div className="brand">
            <span className="brand-mark">W</span>
            <div>
              <div className="brand-name">Wade Wisdom</div>
              <div className="brand-sub">Knowledge assistant</div>
            </div>
          </div>

          <button className="new-chat-btn" onClick={() => {
            setMessages([]);
            setInput("");
            setIsLoading(false);
            if (window.innerWidth <= 768) {
              setSidebarOpen(false);
            }
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Chat
          </button>

          <div className="divider" />

          {/* Bio */}
          <div className="bio">
            <div className="bio-label">About</div>
            <p className="bio-text">
              An AI assistant trained on Wade Foster&apos;s public interviews,
              blog posts, and podcasts. Wade is the co-founder &amp; CEO of
              Zapier — a company he built to a $5B valuation with just $1.3M in
              funding.
            </p>
          </div>

          <div className="divider" />

          {/* Topics */}
          <div className="topics">
            <div className="bio-label">Topics</div>
            <div className="topic-list">
              {topics.map((t) => (
                <span
                  key={t.label}
                  className="topic-tag"
                  style={
                    {
                      "--tag-color": t.color,
                    } as React.CSSProperties
                  }
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Sources */}
          <div className="sources">
            <div className="bio-label">Sources</div>
            <ul className="source-list">
              <li>Interviews &amp; podcasts</li>
              <li>Zapier blog posts</li>
              <li>Conference talks</li>
              <li>Public essays</li>
            </ul>
          </div>

          <div className="sidebar-footer">
            <span className="footer-zap">⚡</span> Built with Mastra AI
          </div>
        </div>
      </aside>

      {/* Sidebar toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          {sidebarOpen ? (
            <>
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      <button
        className="new-chat-toggle"
        onClick={() => {
          setMessages([]);
          setInput("");
          setIsLoading(false);
        }}
        aria-label="Start new chat"
        title="New Chat"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Main */}
      <main className="main">
        <div className="conversation">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-header">
                <h1 className="empty-title">
                  What would you like
                  <br />
                  to know?
                </h1>
                <p className="empty-sub">
                  Ask anything about startups, AI, productivity, or
                  building a company from Wade Foster&apos;s perspective.
                </p>
              </div>
              <div className="starters">
                {starters.map((s, i) => (
                  <button
                    key={i}
                    className="starter"
                    onClick={() => {
                      setInput(s);
                      textareaRef.current?.focus();
                    }}
                  >
                    <span className="starter-arrow">→</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`msg ${msg.role === "user" ? "msg-user" : "msg-ai"}`}
                >
                  <div className="msg-meta">
                    {msg.role === "user" ? "You" : "Wade Wisdom"}
                    {msg.role === "assistant" && msg.source === "web" && msg.content && (
                      <span className="source-badge source-web">🌐 Web Source</span>
                    )}
                    {msg.role === "assistant" && msg.source === "kb" && msg.content && (
                      <span className="source-badge source-kb">📚 Knowledge Base</span>
                    )}
                  </div>
                  <div className="msg-body">
                    {msg.role === "assistant" && msg.thought && (
                       <details className="thought-process">
                          <summary>Thought Process</summary>
                          <div className="thought-content">{msg.thought}</div>
                       </details>
                    )}
                    {msg.role === "assistant" && !msg.content && !msg.thought && isLoading ? (
                      <span className="thinking">Searching knowledge base…</span>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\ng/, "<br />") }} />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="composer">
          <form onSubmit={handleSubmit} className="composer-form">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask a question…"
              className="composer-input"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="composer-send"
              aria-label="Send message"
            >
              {isLoading ? (
                <span className="send-loading" />
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
