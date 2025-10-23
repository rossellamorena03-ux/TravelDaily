import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
//import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

/*const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Nuova versione disponibile');
  },
  onOfflineReady() {
    console.log('App pronta per funzionare offline!');
  },
});*/

if (navigator.serviceWorker) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
  .register("/server-worker.js")
  .then((reg) => console.log("✅ SW registrato con scope:", reg.scope))
  .catch((err) => console.error("❌ Errore registrazione SW:", err));
  });

}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);



