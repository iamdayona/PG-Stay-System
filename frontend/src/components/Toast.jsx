import { useState, useCallback, useRef } from "react";

const TOAST_CSS = `
  @keyframes toastIn  { from { opacity:0; transform:translateY(20px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes toastOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(10px) scale(.95); } }

  .toast-container {
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    display: flex; flex-direction: column; gap: 10px; pointer-events: none;
  }
  .toast {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,.92); backdrop-filter: blur(18px);
    border: 2px solid rgba(255,255,255,.9); border-radius: 18px;
    padding: 14px 18px; min-width: 280px; max-width: 380px;
    box-shadow: 0 8px 32px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.95);
    animation: toastIn .3s cubic-bezier(.34,1.56,.64,1) both;
    pointer-events: all; position: relative; overflow: hidden;
    font-family: 'Poppins', sans-serif;
  }
  .toast.removing { animation: toastOut .25s ease forwards; }
  .toast::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 3px; border-radius: 18px 18px 0 0;
  }
  .toast.success::before { background: linear-gradient(90deg,#66bb6a,#a5d6a7); }
  .toast.error::before   { background: linear-gradient(90deg,#ef9a9a,#e53935); }
  .toast.info::before    { background: linear-gradient(90deg,#42a5f5,#90caf9); }
  .toast.warning::before { background: linear-gradient(90deg,#ffe082,#ffd54f); }
  .toast-icon {
    width: 36px; height: 36px; border-radius: 11px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 1rem;
    border: 1.5px solid rgba(255,255,255,.9);
  }
  .toast.success .toast-icon { background: linear-gradient(135deg,#c8e6c9,#e8f5e9); }
  .toast.error   .toast-icon { background: linear-gradient(135deg,#ffcdd2,#fce4ec); }
  .toast.info    .toast-icon { background: linear-gradient(135deg,#bbdefb,#e3f2fd); }
  .toast.warning .toast-icon { background: linear-gradient(135deg,#ffe0b2,#fff8e1); }
  .toast-message { flex: 1; font-size: .85rem; font-weight: 500; color: #2d2d4e; line-height: 1.4; }
  .toast-close {
    background: none; border: none; cursor: pointer; font-size: 1rem;
    color: #aaa; padding: 0; line-height: 1; flex-shrink: 0;
    transition: color .15s;
  }
  .toast-close:hover { color: #666; }
`;

const ICONS = {
  success: "✅",
  error:   "❌",
  info:    "ℹ️",
  warning: "⚠️",
};

let _addToast = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 260);
  }, []);

  _addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, removing: false }]);
    timers.current[id] = setTimeout(() => remove(id), duration);
  }, [remove]);

  return (
    <>
      <style>{TOAST_CSS}</style>
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type} ${t.removing ? "removing" : ""}`}>
            <div className="toast-icon">{ICONS[t.type] || "ℹ️"}</div>
            <div className="toast-message">{t.message}</div>
            <button
              className="toast-close"
              onClick={() => {
                clearTimeout(timers.current[t.id]);
                remove(t.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

// Global toast function — call from anywhere
export const toast = {
  success: (msg, duration) => _addToast?.(msg, "success", duration),
  error:   (msg, duration) => _addToast?.(msg, "error",   duration),
  info:    (msg, duration) => _addToast?.(msg, "info",    duration),
  warning: (msg, duration) => _addToast?.(msg, "warning", duration),
};
