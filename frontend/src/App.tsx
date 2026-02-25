import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Games from './pages/Games';
import GameStub from './pages/GameStub';
import Certificate from './pages/Certificate';
import Admin from './pages/Admin';
import './App.css';

export default function App() {
  return (
    <BrowserRouter basename="/girls">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:slug" element={<GameStub />} />
        <Route path="/certificate/:token" element={<Certificate />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
