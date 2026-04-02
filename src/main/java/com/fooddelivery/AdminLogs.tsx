import { useState, useEffect } from 'react';
import axios from 'axios';

interface Log {
    logId: number;
    action: string;
    details: string;
    createdAt: string;
    adminName?: string;
}

interface AdminLogsProps {
    adminId: number;
}

export default function AdminLogs({ adminId }: AdminLogsProps) {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/admin/logs', {
                params: { userId: adminId }
            });
            setLogs(res.data);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action: string) => {
        const badges: Record<string, string> = {
            'LOGIN': 'bg-blue-100 text-blue-800',
            'ADD_FOOD': 'bg-green-100 text-green-800',
            'UPDATE_FOOD': 'bg-yellow-100 text-yellow-800',
            'DELETE_FOOD': 'bg-red-100 text-red-800'
        };
        return badges[action] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="text-center py-8">Loading logs...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Activity Logs</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                            <tr key={log.logId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadge(log.action)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}