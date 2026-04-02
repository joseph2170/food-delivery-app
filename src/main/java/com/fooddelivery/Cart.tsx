import { useState } from 'react';
import type { FoodItem } from './types';
import Checkout from './Checkout';

interface CartProps {
  cart: FoodItem[];
  onRemove: (index: number) => void;
  onClose: () => void;
  customerId: number;
  onOrderPlaced: () => void;
}

export default function Cart({ cart, onRemove, onClose, customerId, onOrderPlaced }: CartProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Helper function to get image URL
  const getImageUrl = (item: FoodItem) => {
    const imagePath = item.image_url || item.imageUrl;
    if (imagePath) {
      if (imagePath.startsWith('http')) return imagePath;
      if (imagePath.startsWith('/')) return `http://localhost:8080${imagePath}`;
      return `http://localhost:8080/images/${imagePath}`;
    }
    return "http://localhost:8080/images/default.jpg";
  };

  if (showCheckout) {
    return (
      <Checkout
        cart={cart}
        total={total}
        customerId={customerId}
        onClose={() => setShowCheckout(false)}
        onOrderPlaced={onOrderPlaced}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🛒</span> Your Cart
          </h2>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-2">Add some delicious items to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-3 items-center bg-white p-3 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <img
                    src={getImageUrl(item)}
                    className="w-16 h-16 object-cover rounded-lg"
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "http://localhost:8080/images/default.jpg";
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-orange-500 font-bold text-lg">₹{item.price}</p>
                  </div>
                  <button
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-full"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 bg-white">
            <div className="flex justify-between mb-4 pb-3 border-b">
              <span className="font-semibold text-gray-600">Total Items:</span>
              <span className="font-semibold text-gray-800">{cart.length}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg font-bold text-gray-800">Total Amount:</span>
              <span className="text-2xl font-bold text-orange-500">₹{total}</span>
            </div>
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <span>🚚</span> Free delivery on orders above ₹200
              </p>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-md"
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}