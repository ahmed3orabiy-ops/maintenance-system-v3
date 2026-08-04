import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// شاشة عرض الخطأ — بتظهر بدل الشاشة البيضاء الفاضية لو حصل أي كسر،
// عشان يبقى ممكن تاخد صورة للرسالة وتبعتها بدل ما تفضل الصفحة فاضية.
function renderErrorScreen(title, detail) {
  const root = document.getElementById("root");
  if (!root) return;
  root.innerHTML = `
    <div dir="rtl" style="
      font-family: 'Cairo', Tahoma, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F6F4EE;
      padding: 24px;
      box-sizing: border-box;
    ">
      <div style="
        max-width: 640px;
        width: 100%;
        background: #FFFFFF;
        border: 1px solid #E3DDCE;
        border-right: 4px solid #AC4238;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 10px 30px -10px rgba(16,26,46,0.2);
      ">
        <div style="font-weight: 800; font-size: 18px; color: #181F2E; margin-bottom: 8px;">
          حصل خطأ منع الموقع من الفتح
        </div>
        <div style="font-size: 13px; color: #5B6579; margin-bottom: 16px; line-height: 1.7;">
          صوّر الصفحة دي كاملة وابعتها في الشات عشان يتم تحديد المشكلة وإصلاحها.
        </div>
        <div style="
          background: #FAEAE8;
          border: 1px solid #f0c9c4;
          border-radius: 10px;
          padding: 14px;
          font-size: 13px;
          color: #AC4238;
          font-weight: 700;
          margin-bottom: 10px;
          word-break: break-word;
        ">${title}</div>
        <pre style="
          background: #F6F4EE;
          border: 1px solid #E3DDCE;
          border-radius: 10px;
          padding: 14px;
          font-size: 11px;
          color: #181F2E;
          white-space: pre-wrap;
          word-break: break-word;
          direction: ltr;
          text-align: left;
          max-height: 320px;
          overflow: auto;
          margin: 0;
        ">${detail}</pre>
      </div>
    </div>
  `;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    renderErrorScreen(
      String(error && error.message ? error.message : error),
      String((error && error.stack) || "") + "\n\n" + String((info && info.componentStack) || "")
    );
  }
  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}

window.addEventListener("error", (event) => {
  renderErrorScreen(
    String((event.error && event.error.message) || event.message || "خطأ غير معروف"),
    String((event.error && event.error.stack) || `${event.filename || ""}:${event.lineno || ""}:${event.colno || ""}`)
  );
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  renderErrorScreen(
    String((reason && reason.message) || reason || "خطأ غير متوقع"),
    String((reason && reason.stack) || "")
  );
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
