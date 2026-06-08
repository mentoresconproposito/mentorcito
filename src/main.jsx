import React from 'react'
import ReactDOM from 'react-dom/client'
import MentorAgent from './MentorAgent'
import Dashboard from './Dashboard'
import Privacidad from './Privacidad'
import EmpresaAgent from './EmpresaAgent'
import EmpresaDashboard from './EmpresaDashboard'

function App() {
  var path = window.location.pathname;
  if (path === '/dashboard')             return <Dashboard />;
  if (path === '/privacidad')            return <Privacidad />;
  if (path.startsWith('/empresa/'))      return <EmpresaDashboard />;
  // Modo empresa en el agente: ?empresa=slug&token=xxx
  var params = new URLSearchParams(window.location.search);
  if (params.get('empresa') && params.get('token')) return <EmpresaAgent />;
  return <MentorAgent />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
