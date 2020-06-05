import React from 'react';
import ReactDOM from 'react-dom'; // linkando o react com o web (árvore DOM)
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
