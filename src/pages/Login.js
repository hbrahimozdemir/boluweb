
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        try {
            if (password.trim() === 'admin123') {
                if (onLogin) onLogin(); // Call parent handler
                navigate('/admin');
            } else {
                setError('Hatali sifre! (Ipucu: admin123)');
            }
        } catch (err) {
            console.error(err);
            setError('Bir hata olustu.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Yönetici Girişi</h2>
                {error && <p className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded">{error}</p>}

                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Şifrenizi girin"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-200"
                        >
                            Giriş Yap
                        </button>
                    </div>
                </form>
                <div className="mt-4 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                    >
                        ← Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
