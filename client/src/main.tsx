import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { fixPWAInputs, enablePWAKeyboard } from "./lib/pwaUtils";

// Initialize PWA input fixes
document.addEventListener('DOMContentLoaded', () => {
  fixPWAInputs();
  enablePWAKeyboard();
});

createRoot(document.getElementById("root")!).render(<App />);
