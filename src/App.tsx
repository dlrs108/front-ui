import { useState, useRef, useCallback } from "react";

// 配置
const API_URL = "https://你的worker地址/api/send";
const TOKEN = "固定令牌";
const MAX_LENGTH = 200;

type Status = "idle" | "sending" | "success" | "error";

export default function App() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) {
      setContent(value);
    }
  };

  const handleSend = useCallback(async () => {
    if (!content.trim()) return;
    if (status === "sending") return;

    setStatus("sending");

    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          token: TOKEN,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setContent("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }

    // 3秒后状态消失
    timerRef.current = setTimeout(() => {
      setStatus("idle");
      timerRef.current = null;
    }, 3000);
  }, [content, status]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* 标题 */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h1 style={styles.title}>发送通知</h1>
          <p style={styles.subtitle}>输入通知内容，一键发送</p>
        </div>

        {/* 输入区域 */}
        <div style={styles.inputSection}>
          <label style={styles.label}>通知内容</label>
          <div style={styles.textareaWrapper}>
            <textarea
              style={styles.textarea}
              placeholder="请输入要发送的通知内容..."
              value={content}
              onChange={handleChange}
              rows={6}
            />
            <div style={styles.charCount}>
              <span
                style={{
                  color: content.length >= MAX_LENGTH ? "#ef4444" : "#94a3b8",
                }}
              >
                {content.length}
              </span>
              <span style={{ color: "#94a3b8" }}>/{MAX_LENGTH}</span>
            </div>
          </div>
        </div>

        {/* 状态提示 */}
        {status !== "idle" && (
          <div
            style={{
              ...styles.statusBar,
              ...(status === "sending"
                ? styles.statusSending
                : status === "success"
                ? styles.statusSuccess
                : styles.statusError),
            }}
          >
            {status === "sending" && (
              <>
                <span style={styles.spinner} />
                <span>发送中…</span>
              </>
            )}
            {status === "success" && (
              <>
                <span style={styles.statusIcon}>✓</span>
                <span>发送成功</span>
              </>
            )}
            {status === "error" && (
              <>
                <span style={styles.statusIcon}>✕</span>
                <span>发送失败，请重试</span>
              </>
            )}
          </div>
        )}

        {/* 发送按钮 */}
        <button
          style={{
            ...styles.button,
            ...(content.trim() === "" || status === "sending"
              ? styles.buttonDisabled
              : {}),
          }}
          onClick={handleSend}
          disabled={content.trim() === "" || status === "sending"}
        >
          {status === "sending" ? "发送中…" : "发送通知"}
        </button>

        {/* 底部提示 */}
        <p style={styles.footer}>发送后通知将立即推送到所有接收端</p>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        textarea::placeholder {
          color: #94a3b8;
        }
        textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        button:active:not(:disabled) {
          transform: scale(0.97);
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "20px 16px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  container: {
    width: "100%",
    maxWidth: "480px",
    marginTop: "20px",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "32px",
  },
  iconWrapper: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
  },
  inputSection: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "15px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "8px",
  },
  textareaWrapper: {
    position: "relative" as const,
  },
  textarea: {
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    lineHeight: "1.6",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    resize: "none" as const,
    color: "#1e293b",
    background: "#ffffff",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  charCount: {
    position: "absolute" as const,
    bottom: "12px",
    right: "14px",
    fontSize: "13px",
    display: "flex",
    gap: "1px",
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "500",
    marginBottom: "20px",
    animation: "fadeIn 0.3s ease",
  },
  statusSending: {
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
  },
  statusSuccess: {
    background: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
  },
  statusError: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid #bfdbfe",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  statusIcon: {
    fontSize: "16px",
    fontWeight: "700",
  },
  button: {
    width: "100%",
    padding: "18px 24px",
    fontSize: "18px",
    fontWeight: "700",
    color: "#ffffff",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "transform 0.1s, opacity 0.2s",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
    letterSpacing: "1px",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  footer: {
    textAlign: "center" as const,
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "24px",
  },
};
