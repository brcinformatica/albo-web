import React from 'react';
import { Routes, Route } from "react-router-dom";

import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';

import Atti from "./pages/Atti";
import Errore from "./pages/Errore";

const App = () => {
  return (
    <Routes>
      <Route path="/:codCli" element={<Atti />} />
      <Route path="/" element={<Errore />} />
    </Routes>
  );
}

export default App;