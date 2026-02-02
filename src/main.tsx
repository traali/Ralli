import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

console.log('Ralli: Starting application mount...');

const container = document.getElementById('root');
if (!container) {
  console.error('Ralli: Root container not found!');
} else {
  try {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>,
    );
    console.log('Ralli: Mount successful.');
  } catch (err) {
    console.error('Ralli: Critical initialization error:', err);
  }
}
