import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './packages/tokens/build/css/tokens.css'
import './packages/tokens/build/css/theme-light.css'
import './packages/tokens/build/css/theme-dark.css'
import './packages/tokens/build/css/component.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
