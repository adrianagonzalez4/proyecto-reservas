import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import amplifyconfig from './amplifyconfiguration.json'
import App from './App.jsx'
import './index.css'

Amplify.configure(amplifyconfig)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)