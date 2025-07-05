import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './src/ChatWidget'; // Path to your ChatWidget component
import './src/index.css'; // <--- ADD THIS LINE to import your main CSS file!

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