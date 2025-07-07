import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './src/ChatWidget';
import './src/index.css';

window.ChatWidget = {
  render: (containerId) => {
    const root = ReactDOM.createRoot(document.getElementById(containerId));
    root.render(
      <React.StrictMode>
        <ChatWidget />
      </React.StrictMode>
    );
  }
};