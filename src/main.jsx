import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import MentorAgent from './MentorAgent'
import Dashboard from './Dashboard'

function App() {
  var path = window.location.pathname;
  if (path === '/dashboard') return (
    <>
      <Dashboard />
      <Analytics />
    </>
  );
  return (
    <>
      <MentorAgent />
      <Analytics />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
