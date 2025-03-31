import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {HeroUIProvider} from '@heroui/react'
import { AuthProvider } from './store/auth.jsx'; // auth.jsx
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import './index.css';
import AppWrapper from './App.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <StrictMode>
      <HeroUIProvider>
        <AppWrapper />
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          bodyClassName="toastBody"
        />
      </HeroUIProvider>
    </StrictMode>
  </AuthProvider>
);
