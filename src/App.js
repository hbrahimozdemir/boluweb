
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(
        localStorage.getItem('isAdmin') === 'true'
    );

    const handleLogin = () => {
        localStorage.setItem('isAdmin', 'true');
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <div className="App min-h-screen bg-gray-50">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route
                        path="/admin"
                        element={isAuthenticated ? <AdminPanel onLogout={handleLogout} /> : <Navigate to="/login" />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
