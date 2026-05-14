import { useState, useEffect, useRef } from "react";

const API_KEY_STORAGE = "atg_api_key";

const SYSTEM_PROMPT = `You are an expert QA automation engineer. Your task is to analyze a webpage and generate Playwright (Python) test code.

The user will provide:
1. The URL of a webpage
2. Basic HTML structure / visible elements of the page (scraped content)

Your job is to generate a complete, runnable Playwright Python test file that:
- Uses pytest as the test runner
- Imports from playwright.sync_api
- Tests key user interactions (navigation, forms, buttons, links)
- Includes meaningful assertions
- Has descriptive test function names (test_*)
- Includes a brief comment above each test explaining what it tests
- Uses page.goto() to navigate to the URL
- Is practical and reflects real QA thinking

Respond ONLY with the Python code — no explanation, no markdown fences, no preamble. Start directly with import statements.`;

function TerminalLine({ text, type = "output", delay = 0 }) {
  const [visible, setVisible] = useState(delay === 0);
  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);

  const colors = {
    output: "#c8d3f5",
    success: "#c3e88d",
    error: "#ff757f",
    info: "#86e1fc",
    dim: "#636da6",
    prompt: "#ffc777",
  };

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
        color: colors[type] || colors.output,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: "13px",
        lineHeight: "1.7",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {text}
    </div>
  );
}

function Spinner() {
  const [frame, setFrame] = useState(0);
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  useEffect(() => {
    const i = setInterval(() => setFrame((f) => (f + 1) % frames.length), 80);
    return () => clearInterval(i);
  }, []);
  return (
    <span style={{ color: "#86e1fc", fontFamily: "monospace" }}>
      {frames[frame]}
    </span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? "#1a2a1a" : "#1a1f3a",
        border: `1px solid ${copied ? "#c3e88d44" : "#3d4466"}`,
        color: copied ? "#c3e88d" : "#636da6",
        padding: "6px 14px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "'JetBrains Mono', monospace",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {copied ? "✓ skopiowano" : "⎘ kopiuj"}
    </button>
  );
}

function DownloadButton({code, url}) {
  const handleDownload = () => {
    const hostname = (() => {
      try { return new URL(url).hostname.replace(/\./g, "_"); }
      catch { return "page"; }
    })();
    const type = ".py";

    const newName = `${hostname}${type}`;
    console.log(newName);

    const blob = new Blob([code], { type: "text/plain" });
    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.style.display = 'none';
    a.download = newName; 
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);

  };
  return (
    <button
      onClick={handleDownload}
      style={{
        background: "#0f1a0f",
        border: "1px solid #c3e88d44",
        color: "#c3e88d",
        padding: "6px 14px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "'JetBrains Mono', monospace",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {"↓ pobierz .py"}
    </button>
  ); 
}

function CodeBlock({ code, url }) {
  const lines = code.split("\n");
  return (
    <div
      style={{
        background: "#0d1117",
        border: "1px solid #2a2f52",
        borderRadius: "10px",
        overflow: "hidden",
        marginTop: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          background: "#161b2e",
          borderBottom: "1px solid #2a2f52",
        }}
      >
        <span
          style={{
            color: "#636da6",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          test_generated.py
        </span>
        <CopyButton text={code} />
        <DownloadButton code={code} url={url} />
      </div>
      <div
        style={{
          padding: "16px",
          maxHeight: "500px",
          overflowY: "auto",
          display: "flex",
          gap: "16px",
        }}
      >
        <div style={{ userSelect: "none", minWidth: "32px" }}>
          {lines.map((_, i) => (
            <div
              key={i}
              style={{
                color: "#3d4466",
                fontSize: "12px",
                fontFamily: "monospace",
                lineHeight: "1.7",
                textAlign: "right",
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {lines.map((line, i) => {
            let color = "#c8d3f5";
            if (line.trim().startsWith("#")) color = "#636da6";
            else if (
              line.trim().startsWith("import") ||
              line.trim().startsWith("from")
            )
              color = "#c099ff";
            else if (line.trim().startsWith("def test_")) color = "#82aaff";
            else if (line.includes("assert")) color = "#ffc777";
            else if (line.includes('"""') || line.includes("'''"))
              color = "#c3e88d";
            else if (line.includes('"') || line.includes("'")) color = "#c3e88d";
            return (
              <div
                key={i}
                style={{
                  color,
                  fontSize: "13px",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  lineHeight: "1.7",
                  whiteSpace: "pre",
                }}
              >
                {line || " "}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | scraping | generating | done | error
  const [generatedCode, setGeneratedCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const logsEndRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [tokenUsage, setTokenUsage] = useState(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (text, type = "output") => {
    setLogs((prev) => [...prev, { text, type, id: Date.now() + Math.random() }]);
  };

  const scrapePageContent = async (targetUrl) => {
    // Use a CORS proxy to fetch page content
    addLog(`→ Pobieranie zawartości: ${targetUrl}`, "info");
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl);
      const data = await res.json();
      const html = data.contents;

      // Extract meaningful text content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Remove scripts and styles
      doc.querySelectorAll("script, style, noscript").forEach((el) => el.remove());

      const title = doc.title || "No title";
      const headings = Array.from(doc.querySelectorAll("h1,h2,h3"))
        .slice(0, 10)
        .map((h) => `${h.tagName}: ${h.textContent.trim()}`)
        .join("\n");
      const inputs = Array.from(doc.querySelectorAll("input,textarea,select"))
        .slice(0, 15)
        .map((el) => {
          const attrs = [];
          if (el.type) attrs.push(`type="${el.type}"`);
          if (el.name) attrs.push(`name="${el.name}"`);
          if (el.id) attrs.push(`id="${el.id}"`);
          if (el.placeholder) attrs.push(`placeholder="${el.placeholder}"`);
          return `<${el.tagName.toLowerCase()} ${attrs.join(" ")}>`;
        })
        .join("\n");
      const buttons = Array.from(doc.querySelectorAll("button,input[type=submit],[role=button]"))
        .slice(0, 10)
        .map((el) => el.textContent.trim() || el.value || el.getAttribute("aria-label") || "button")
        .filter(Boolean)
        .join(", ");
      const links = Array.from(doc.querySelectorAll("a[href]"))
        .slice(0, 10)
        .map((a) => `${a.textContent.trim()} → ${a.href}`)
        .filter((l) => l.length > 3)
        .join("\n");
      const forms = Array.from(doc.querySelectorAll("form"))
        .slice(0, 5)
        .map((f, i) => {
          const action = f.action || "no action";
          const method = f.method || "GET";
          return `Form ${i + 1}: action="${action}" method="${method}"`;
        })
        .join("\n");

      const summary = `URL: ${targetUrl}
Title: ${title}

=== HEADINGS ===
${headings || "none"}

=== FORMS ===
${forms || "none"}

=== INPUTS ===
${inputs || "none"}

=== BUTTONS ===
${buttons || "none"}

=== LINKS (sample) ===
${links || "none"}`;

      addLog(`✓ Strona pobrana: "${title}"`, "success");
      addLog(`  Znaleziono: ${doc.querySelectorAll("input,select,textarea").length} pól, ${doc.querySelectorAll("button,[role=button]").length} przycisków, ${doc.querySelectorAll("a").length} linków`, "dim");
      return summary;
    } catch (err) {
      throw new Error(`Nie udało się pobrać strony: ${err.message}`);
    }
  };

  const generateTests = async () => {
    if (!url.trim()) return;

    setStatus("scraping");
    setLogs([]);
    setGeneratedCode("");
    setErrorMsg("");

    try {
      addLog("▶ Uruchamianie generatora testów AI", "prompt");
      addLog("", "dim");

      let pageContent;
      try {
        pageContent = await scrapePageContent(url.trim());
      } catch (scrapeErr) {
        addLog(`⚠ Nie udało się pobrać strony przez proxy`, "error");
        addLog(`  Generuję testy na podstawie samego URL...`, "dim");
        pageContent = `URL: ${url.trim()}\n\nUwaga: Nie udało się pobrać zawartości strony. Wygeneruj testy bazując na URL i typowych wzorcach dla tego rodzaju strony.`;
      }

      setStatus("generating");
      addLog("", "dim");
      addLog("⚡ Wysyłam do Gemini API...", "info");

      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          page_content: pageContent,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `HTTP ${response.status}`);
      }

        const data = await response.json();
        const code = (data.code || "")
          .replace(/^```python\n?/, "")
          .replace(/\n?```$/, "")
          .trim();

      addLog("", "dim");
      addLog("✓ Generowanie zakończone!", "success");

      const testCount = (code.match(/^def test_/gm) || []).length;
      addLog(`  Wygenerowano ${testCount} testów`, "dim");
      addLog("", "dim");
      addLog("Jak uruchomić (Ubuntu):", "info");
      addLog("  sudo apt update && sudo apt install -y python3-pip", "dim");
      addLog("  pip3 install playwright pytest pytest-playwright", "dim");
      addLog("  playwright install chromium", "dim");
      addLog("  playwright install-deps chromium", "dim");
      addLog("  pytest test_generated.py -v", "dim");

      setGeneratedCode(code);
      setTokenUsage({
        prompt: data.prompt_tokens,
        completion: data.completion_tokens,
        total: data.total_tokens,
      });
      setStatus("done");
    } catch (err) {
      addLog("", "dim");
      addLog(`✗ Błąd: ${err.message}`, "error");
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  const isLoading = status === "scraping" || status === "generating";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e1a",
        color: "#c8d3f5",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        padding: "0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(#1a2040 1px, transparent 1px), linear-gradient(90deg, #1a2040 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />

      {/* Glow */}
      <div
        style={{
          position: "fixed",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          background: "radial-gradient(ellipse, #3d5af122 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: "860px",
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#131929",
              border: "1px solid #2a2f52",
              borderRadius: "6px",
              padding: "4px 12px",
              marginBottom: "20px",
              fontSize: "11px",
              color: "#636da6",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: "#c3e88d" }}>●</span> AI QA Engineer
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: "800",
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            Test
            <span
              style={{
                background: "linear-gradient(135deg, #82aaff, #c099ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Gen
            </span>
          </h1>
          <p style={{ color: "#4a5180", fontSize: "14px", margin: 0 }}>
            Podaj URL → AI analizuje stronę → generuje testy Playwright (Python)
          </p>
          <p style={{ color: "#ffc777", fontSize: "12px", margin: "8px 0 0" }}>
            ⚠ Aplikacja korzysta z darmowych API — jeśli generowanie się nie powiedzie, spróbuj ponownie.
          </p>
        </div>

        {/* URL Input */}
        <div
          style={{
            background: "#0f1526",
            border: `1px solid ${isLoading ? "#3d5af1" : "#2a2f52"}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            transition: "border-color 0.3s",
          }}
        >
          <label
            style={{
              fontSize: "11px",
              color: "#636da6",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              display: "block",
              marginBottom: "8px",
            }}
          >
            URL do przeanalizowania
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && generateTests()}
              placeholder="https://example.com/login"
              disabled={isLoading}
              style={{
                flex: 1,
                background: "#0a0e1a",
                border: "1px solid #2a2f52",
                borderRadius: "8px",
                padding: "12px 16px",
                color: "#c8d3f5",
                fontSize: "14px",
                fontFamily: "monospace",
                outline: "none",
                opacity: isLoading ? 0.6 : 1,
              }}
            />
            <button
              onClick={generateTests}
              disabled={isLoading || !url.trim()}
              style={{
                background: isLoading
                  ? "#161b2e"
                  : "linear-gradient(135deg, #3d5af1, #6b46c1)",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                color: isLoading ? "#636da6" : "#ffffff",
                fontSize: "14px",
                fontFamily: "monospace",
                cursor: isLoading || !url.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {isLoading ? (
                <>
                  <Spinner /> generuję...
                </>
              ) : (
                "▶ generuj testy"
              )}
            </button>
          </div>
        </div>

        {/* Terminal */}
        {logs.length > 0 && (
          <div
            style={{
              background: "#060b14",
              border: "1px solid #1e2440",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: "#0d1526",
                borderBottom: "1px solid #1e2440",
              }}
            >
              {["#ff5f57", "#ffbd2e", "#28c840"].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: c,
                    opacity: 0.8,
                  }}
                />
              ))}
              <span
                style={{ color: "#3d4466", fontSize: "12px", marginLeft: "8px" }}
              >
                terminal — testgen
              </span>
              {isLoading && (
                <span style={{ marginLeft: "auto" }}>
                  <Spinner />
                </span>
              )}
            </div>
            <div style={{ padding: "16px", maxHeight: "240px", overflowY: "auto" }}>
              {logs.map((log) => (
                <TerminalLine key={log.id} text={log.text} type={log.type} />
              ))}
              {isLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <Spinner />
                  <span style={{ color: "#3d4466", fontSize: "13px" }}>
                    {status === "scraping" ? "analizuję stronę..." : "Gemini generuje testy..."}
                  </span>
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* Generated Code */}
        {generatedCode && (
          <div
            style={{
              animation: "fadeIn 0.4s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "#c3e88d",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                ✓ Wygenerowane testy
              </span>
              {tokenUsage && (
                <span style={{ fontSize: "11px", color: "#636da6" }}>
                  prompt: {tokenUsage.prompt} | completion: {tokenUsage.completion} | total: {tokenUsage.total}
                </span>
              )}
            </div>
            <CodeBlock code={generatedCode} url={url}/>
          </div>
        )}

        {/* Error */}
        {status === "error" && errorMsg && (
          <div
            style={{
              background: "#1a0a0a",
              border: "1px solid #ff757f44",
              borderRadius: "10px",
              padding: "16px",
              color: "#ff757f",
              fontSize: "13px",
            }}
          >
            ✗ {errorMsg}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid #1e2440",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "#2a2f52",
          }}
        >
          <span>TestGen v0.1 — portfolio project</span>
          <span>Playwright · Python · Gemini API</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input:focus {
          border-color: #3d5af1 !important;
          box-shadow: 0 0 0 2px #3d5af122;
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0a0e1a; }
        ::-webkit-scrollbar-thumb { background: #2a2f52; border-radius: 3px; }
      `}</style>
    </div>
  );
}
