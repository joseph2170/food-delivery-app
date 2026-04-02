interface AdminStatsProps {
    stats: {
        totalFoods: number;
        totalOrders: number;
        totalUsers: number;
    };
}

export default function AdminStats({ stats }: AdminStatsProps) {
    const statCards = [
        { title: 'Total Food Items', value: stats.totalFoods, icon: '🍔', color: 'bg-blue-500' },
        { title: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'bg-green-500' },
        { title: 'Total Customers', value: stats.totalUsers, icon: '👥', color: 'bg-purple-500' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">{card.title}</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
                            </div>
                            <div className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}