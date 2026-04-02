import { useState } from 'react';
import axios from 'axios';
import type { FoodItem } from './types';

interface CheckoutProps {
  cart: FoodItem[];
  total: number;
  customerId: number;
  onClose: () => void;
  onOrderPlaced: () => void;
}

export default function Checkout({ cart, total, customerId, onClose, onOrderPlaced }: CheckoutProps) {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async () => {
    // Validate
    if (!customerId || customerId === 0) {
      setError('Please login again');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Please enter delivery address');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    // Prepare order data - MATCH THE WORKING FORMAT
    const orderData = {
      customerId: Number(customerId),
      items: cart.map(item => ({
        foodId: Number(item.food_id),
        quantity: 1,
        price: Number(item.price),
        name: item.name
      })),
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod: paymentMethod
    };

    console.log('Sending order:', orderData);

    try {
      const response = await axios.post('http://localhost:8080/api/orders/create', orderData);
      console.log('Order response:', response.data);

      if (response.data.success) {
        alert(`✅ Order #${response.data.orderId} placed successfully!\nEstimated delivery: ${response.data.estimatedDeliveryTime}`);
        onOrderPlaced();
        onClose();
      } else {
        setError(response.data.message || 'Order failed');
      }
    } catch (err: any) {
      console.error('Order error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold">📋 Checkout</h2>
          <button onClick={onClose} className="text-white text-2xl">×</button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Order Summary */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                  <span>{item.name} x1</span>
                  <span>₹{item.price}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-2 border-t font-bold">
                <span>Total</span>
                <span className="text-orange-500">₹{total}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Delivery Address</h3>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your full delivery address"
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-orange-400"
              rows={3}
              required
            />
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-orange-50">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Cash on Delivery</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-orange-50">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Credit/Debit Card</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-orange-50">
                <input
                  type="radio"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>UPI</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : 'Place Order →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}