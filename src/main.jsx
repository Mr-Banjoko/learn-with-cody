// Clear legacy campaign / placement cache
["cody_placement_result", "cody_album"].forEach((k) => localStorage.removeItem(k));

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