import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AuthProvider } from './contexts/AuthContext';
import AuthCard from './components/AuthCard';

function App() {
  return (
    <AuthProvider>
      <AuthCard />
    </AuthProvider>
  );
}

export default App
