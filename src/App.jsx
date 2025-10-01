import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import MainApp from "./components/MainApp.js";
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <MainApp />
    </AuthProvider>
);

export default function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}