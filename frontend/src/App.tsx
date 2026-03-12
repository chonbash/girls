import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Certificate from './pages/Certificate';
import GamePage from './pages/GamePage';
import Games from './pages/Games';
import Landing from './pages/Landing';

export default function App() {
  return (
    <BrowserRouter basename="/girls">
      <Routes>
        <Route path="/" element={<div className="app-route"><Landing /></div>} />
        <Route path="/auth" element={<div className="app-route"><Auth /></div>} />
        <Route path="/games" element={<div className="app-route"><Games /></div>} />
        <Route path="/games/:slug" element={<div className="app-route"><GamePage /></div>} />
        <Route path="/certificate/:token" element={<div className="app-route"><Certificate /></div>} />
        <Route path="/admin" element={<div className="app-route"><Admin /></div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
