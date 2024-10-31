import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NextUIProvider } from '@nextui-org/react'
import { AuthProvider } from "./store/auth";

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <StrictMode>
      <NextUIProvider>
        <App />
      </NextUIProvider>
    </StrictMode>
  </AuthProvider>
);
