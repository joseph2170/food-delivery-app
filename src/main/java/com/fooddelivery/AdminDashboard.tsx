import { useState, useEffect } from 'react';
import axios from 'axios';
import FoodManagement from './FoodManagement';
import AdminStats from './AdminStats';
import AdminLogs from './AdminLogs';

interface AdminDashboardProps {
    admin: any;
    onLogout: () => void;
}

export default function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        totalFoods: 0,
        totalOrders: 0,
        totalUsers: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/admin/stats', {
                params: { userId: admin.id }
            });
            setStats(res.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="text-2xl font-bold text-blue-600">SmartBite Admin</div>
                            <div className="ml-10 flex space-x-4">
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        activeTab === 'dashboard'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => setActiveTab('foods')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        activeTab === 'foods'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Food Management
                                </button>
                                <button
                                    onClick={() => setActiveTab('logs')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        activeTab === 'logs'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Activity Logs
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                Welcome, {admin.name}
                            </span>
                            <button
                                onClick={onLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' && <AdminStats stats={stats} />}
                {activeTab === 'foods' && <FoodManagement adminId={admin.id} />}
                {activeTab === 'logs' && <AdminLogs adminId={admin.id} />}
            </div>
        </div>
    );
}