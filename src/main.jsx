import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { registerServiceWorker, prefetchCoreImages } from '@/lib/registerSW'

registerServiceWorker();
prefetchCoreImages();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)