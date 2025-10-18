
import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Corrected import paths. No file extension needed with a proper bundler setup.
import App from './App';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
      <Toaster position="bottom-center" />
    </AppProvider>
  </React.StrictMode>
);
