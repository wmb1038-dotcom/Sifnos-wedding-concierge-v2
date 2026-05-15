import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { LocaleProvider } from './i18n/index.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </React.StrictMode>,
)
