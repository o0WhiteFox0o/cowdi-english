import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import { UserProvider } from './hooks/useUser';
import { PetProvider } from './hooks/usePet';
import './styles/styles.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/pet.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <PetProvider>
            <App />
          </PetProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
