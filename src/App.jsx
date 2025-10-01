import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CompleteOffersAdmin from './components/CompleteOffersAdmin';

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import MainApp from "./components/MainApp.js";   // ← important

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

export default function App() {
    return <MainApp />;
}