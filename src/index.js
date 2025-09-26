// filepath: c:\repositories\pokemon\pokemon_game\src\index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Select from './pages/select';
import Game from './pages/game';
import Character from './pages/character';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/select" element={<Select />} />
      <Route path="/game" element={<Game />} />
      <Route path="/character" element={<Character />} />
    </Routes>
  </BrowserRouter>
);