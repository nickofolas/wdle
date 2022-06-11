import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import WdleRoot from './wdle';

const root = ReactDOM.createRoot(document.getElementById('wdleRoot'));
root.render(
  <React.StrictMode>
    <WdleRoot />
  </React.StrictMode>
);
