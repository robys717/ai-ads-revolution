import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Nessun elemento con id 'root' trovato in index.html");
} else {
  console.log("✅ main.jsx caricato correttamente (versione BASE)");
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

