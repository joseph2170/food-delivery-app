import { useState } from "react";
import axios from "axios";
import type { FoodItem } from "./types";

interface FoodDetailsProps {
  food: FoodItem;
  onAddToCart: (food: FoodItem, qty: number) => void;
  onClose: () => void;
  customerId?: number;
}

export default function FoodDetails({ food, onAddToCart, onClose, customerId }: FoodDetailsProps) {
  const [qty, setQty] = useState(1);
  const [showAddress, setShowAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const getImageUrl = () => {
    const imagePath = food.image_url || food.imageUrl;
    if (imagePath) {
      if (imagePath.startsWith('http')) return imagePath;
      if (imagePath.startsWith('/')) return `http://localhost:8080${imagePath}`;
      return `http://localhost:8080/images/${imagePath}`;
    }
    return "http://localhost:8080/images/default.jpg";
  };

  const handleDirectBuy = async () => {
    if (!customerId) {
      alert('Please login to continue');
      return;
    }
    setShowAddress(true);
  };

  const submitOrder = async () => {
    if (!deliveryAddress.trim()) {
      alert('Please enter delivery address');
      return;
    }

    setLoading(true);
    
    const items = [{
      foodId: food.food_id,
      quantity: qty,
      price: food.price,
      name: food.name
    }];

    try {
      const response = await axios.post('http://localhost:8080/api/orders/create', {
        customerId,
        items,
        deliveryAddress,
        paymentMethod
      });

      if (response.data.success) {
        alert(`Order placed successfully!\nOrder ID: ${response.data.orderId}\nEstimated delivery: ${response.data.estimatedDeliveryTime}`);
        onClose();
      } else {
        alert('Failed to place order');
      }
    } catch (error) {
      console.error('Order failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showAddress) {
    return (
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Complete Your Order</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your full delivery address"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
                rows={3}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
              >
                <option value="cash">Cash on Delivery</option>
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Order Summary:</p>
              <p className="font-bold text-gray-800">{food.name} x{qty}</p>
              <p className="text-xl font-bold text-orange-500">Total: ₹{food.price * qty}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddress(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={submitOrder}
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-md text-sm"
        >
          ✕
        </button>

        <div className="relative h-48 rounded-t-2xl overflow-hidden bg-gradient-to-r from-orange-400 to-red-500">
          <img
            src={getImageUrl()}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "http://localhost:8080/images/default.jpg";
            }}
            className="w-full h-full object-cover"
            alt={food.name}
          />
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-lg ${
              food.category === "Veg" || food.category === "veg"
                ? "bg-green-500 text-white" 
                : "bg-red-500 text-white"
            }`}>
              {food.category === "Veg" || food.category === "veg" ? "VEG" : "NON-VEG"}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-1">{food.name}</h2>
          <p className="text-gray-600 text-sm mb-3 leading-relaxed">
            {food.description || "A delicious food item prepared with fresh ingredients."}
          </p>
          
          <div className="border-t border-gray-100 my-3"></div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold hover:bg-orange-600 transition"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-800 min-w-[40px] text-center">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold hover:bg-orange-600 transition"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="text-xl font-bold text-orange-500">₹{food.price * qty}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onAddToCart(food, qty)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition text-sm"
            >
              Add to Cart
            </button>
            <button
              onClick={handleDirectBuy}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition text-sm"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}