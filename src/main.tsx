import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("[boot] main.tsx loaded");

const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("[boot] #root not found");
} else {
  createRoot(rootEl).render(<App />);
}
