import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register offline-first PWA service worker on web browsers (native Capacitor APK serves assets offline directly)
const isNativeCapacitor = Boolean(
  (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
);
if (!isNativeCapacitor) {
  registerSW({
    immediate: true,
  });
}

createRoot(document.getElementById('root')!).render(<App />);
