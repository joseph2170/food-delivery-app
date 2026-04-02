import { useState } from 'react';
import axios from 'axios';

interface AdminLoginProps {
    onLogin: (admin: any) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:8080/api/admin/login', {
                email,
                password
            });

            if (res.data.success) {
                localStorage.setItem('adminToken', JSON.stringify(res.data.admin));
                onLogin(res.data.admin);
            } else {
                setError(res.data.error || 'Login failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Check console for details.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">👨‍💼</div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Portal</h1>
                    <p className="text-gray-600 mt-2">SmartBite Restaurant Management</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="admin@smartbite.com"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="admin123"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </form>

                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold">Demo Credentials:</p>
                    <p className="text-sm text-gray-600">Email: admin@smartbite.com</p>
                    <p className="text-sm text-gray-600">Password: admin123</p>
                </div>
            </div>
        </div>
    );
}