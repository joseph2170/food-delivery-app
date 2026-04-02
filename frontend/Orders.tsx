import { useState, useEffect } from 'react';
import axios from 'axios';

interface OrderItem {
  foodName: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: number;
  totalAmount: number;
  status: string;
  orderTime: string;
  estimatedDeliveryTime: string;
  deliveryAddress: string;
  paymentMethod: string;
  items: OrderItem[];
}

export default function Orders({ userId }: { userId: number }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (userId && userId !== 0) {
      fetchOrders();
    } else {
      setLoading(false);
      setError('Please login to view orders');
    }
  }, [userId, refreshKey]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching orders for user ID:', userId);
      
      const response = await axios.get(`http://localhost:8080/api/orders/user/${userId}`);
      console.log('Orders response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      setError(error.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = () => {
    console.log('Refreshing orders...');
    setRefreshKey(prev => prev + 1);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string; icon: string }> = {
      placed: { color: 'bg-yellow-500', text: 'Placed', icon: '📝' },
      accepted: { color: 'bg-blue-500', text: 'Accepted', icon: '✓' },
      preparing: { color: 'bg-purple-500', text: 'Preparing', icon: '🍳' },
      out_for_delivery: { color: 'bg-orange-500', text: 'Out for Delivery', icon: '🚚' },
      delivered: { color: 'bg-green-500', text: 'Delivered', icon: '✅' },
      cancelled: { color: 'bg-red-500', text: 'Cancelled', icon: '❌' }
    };
    const badge = badges[status] || { color: 'bg-gray-500', text: status, icon: '📦' };
    return (
      <span className={`${badge.color} text-white px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1`}>
        <span>{badge.icon}</span> {badge.text}
      </span>
    );
  };

  // Auto-refresh every 30 seconds for active orders
  useEffect(() => {
    const interval = setInterval(() => {
      if (orders.some(order => order.status !== 'delivered' && order.status !== 'cancelled')) {
        refreshOrders();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [orders]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-2xl font-semibold text-gray-600">Error</h3>
        <p className="text-gray-400 mt-2">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-2xl font-semibold text-gray-600">No Orders Yet</h3>
        <p className="text-gray-400 mt-2">Start ordering to see your orders here</p>
        <button
          onClick={refreshOrders}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          Refresh Orders
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
        <button
          onClick={refreshOrders}
          className="text-orange-500 hover:text-orange-600 text-sm flex items-center gap-1 transition"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.orderId} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.orderId}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.orderTime).toLocaleDateString()} at {new Date(order.orderTime).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">{item.foodName}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-800">₹{item.price}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No items found for this order
                  </div>
                )}
              </div>
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Payment: {order.paymentMethod || 'Cash on Delivery'}</p>
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">{order.deliveryAddress || 'No address provided'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-orange-500">₹{order.totalAmount}</p>
                  </div>
                </div>
                
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="mt-4 bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="animate-pulse text-xl">🚚</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-800">Estimated Delivery</p>
                        <p className="text-xs text-orange-600">By {order.estimatedDeliveryTime || '30-45 minutes'}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {order.status === 'delivered' && (
                  <div className="mt-4 bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">✅</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Order Delivered</p>
                        <p className="text-xs text-green-600">Thank you for ordering with us!</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {order.status === 'cancelled' && (
                  <div className="mt-4 bg-red-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">❌</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Order Cancelled</p>
                        <p className="text-xs text-red-600">This order has been cancelled</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}