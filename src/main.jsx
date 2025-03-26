import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import App from './App.jsx';
import './index.css';
Modal.setAppElement('#root');

if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
  window.addEventListener('load', () => {
    const swScript = import.meta.env.MODE === 'development' ? '/dev-sw.js' : '/sw.js';
    navigator.serviceWorker
      .register(swScript)
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
