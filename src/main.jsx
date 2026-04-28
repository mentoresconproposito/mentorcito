import React from 'react'
import ReactDOM from 'react-dom/client'
import MentorAgent from './MentorAgent'
import Dashboard from './Dashboard'

function App() {
  var path = window.location.pathname;
  if (path === '/dashboard') return <Dashboard />;
  return <MentorAgent />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
