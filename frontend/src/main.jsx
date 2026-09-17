import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { TurfProvider } from './context/TurfContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TurfProvider>
          <App />
        </TurfProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
