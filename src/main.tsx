import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { registerSW } from 'virtual:pwa-register';

// Registrasi Service Worker PWA dengan autoUpdate
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Versi baru portal tersedia.');
  },
  onOfflineReady() {
    console.log('Portal siap dibuka secara offline.');
  },
});

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
