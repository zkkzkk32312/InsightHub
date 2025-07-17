import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './ChatWidget.jsx';

// Store roots by container ID to handle multiple widgets on the same page
const roots = new Map();

/**
 * Renders the ChatWidget component into a DOM element.
 * @param {string} containerId - The ID of the DOM element to render the widget into.
 * @param {object} props - Props to pass to the ChatWidget component.
 */
const render = (containerId, props = {}) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`ChatWidget Error: Container with id "${containerId}" not found.`);
    return;
  }

  // Use existing root or create a new one
  let root = roots.get(containerId);
  if (!root) {
    root = ReactDOM.createRoot(container);
    roots.set(containerId, root);
  }

  root.render(<ChatWidget {...props} />);
};

export { render };