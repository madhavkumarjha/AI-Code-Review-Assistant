import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Register PWA Service Worker for offline caching and home screen installation
if ('serviceWorker' in navigator && (import.meta.env.PROD || window.location.protocol === 'https:')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('⚡ PWA Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('PWA Service Worker registration notice:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
