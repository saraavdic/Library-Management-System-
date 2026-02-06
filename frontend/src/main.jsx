import React, { StrictMode } from 'react'
import * as ReactDOMClient from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import installGlobalFetchErrorHandler from './utils/fetchWrapper'


installGlobalFetchErrorHandler();

// Runtime diagnostics to help debug blank page after dependency changes
try {
  console.log('Runtime: React version =', React.version);
  // react-dom/client exposes version on the default export in some setups
  console.log('Runtime: ReactDOM (client) object keys =', Object.keys(ReactDOMClient).slice(0,10));

  const rootEl = document.getElementById('root');
  if (!rootEl) {
    console.error('Root element #root not found in DOM');
  } else {
    const root = ReactDOMClient.createRoot(rootEl);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('App mounted successfully');
  }
} catch (err) {
  // Log synchronous errors during boot
  // eslint-disable-next-line no-console
  console.error('Error mounting React app:', err);
}

// Global error handlers for runtime exceptions
window.addEventListener('error', (e) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled error event:', e.error || e.message, e);
});
window.addEventListener('unhandledrejection', (e) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled promise rejection:', e.reason || e);
});
