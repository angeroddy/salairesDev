import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// For default weight and style
import "@fontsource/funnel-display";
import "@fontsource/funnel-display/300.css"; // Light
import "@fontsource/funnel-display/400.css"; // Regular
import "@fontsource/funnel-display/500.css"; // Medium
import "@fontsource/funnel-display/700.css"; // Bold
import "@fontsource/funnel-display/800.css"; // ExtraBold


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
