import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/chatbot/ask", {
        query: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { user: userMessage, bot: res.data.response || res.data },
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      
      let fallbackResponse = "I'm having trouble connecting. Please try again later.";
      
      const lowerQuery = userMessage.toLowerCase();
      if (lowerQuery.includes("veg")) {
        fallbackResponse = "Vegetarian Items:\n• Margherita Pizza - ₹180\n• Veg Burger - ₹80\n• Paneer Butter Masala - ₹120\n• Masala Dosa - ₹60\n• Veg Biryani - ₹100";
      } else if (lowerQuery.includes("non-veg") || lowerQuery.includes("chicken")) {
        fallbackResponse = "Non-Vegetarian Items:\n• Chicken Biryani - ₹150\n• Butter Chicken - ₹170\n• Chicken Tikka - ₹160\n• Fish Fry - ₹180\n• Mutton Biryani - ₹250";
      } else if (lowerQuery.includes("menu") || lowerQuery.includes("list")) {
        fallbackResponse = "Our Menu:\n\nVeg Items:\n• Margherita Pizza - ₹180\n• Veg Burger - ₹80\n• Paneer Butter Masala - ₹120\n• Masala Dosa - ₹60\n\nNon-Veg Items:\n• Chicken Biryani - ₹150\n• Butter Chicken - ₹170\n• Chicken Tikka - ₹160\n• Fish Fry - ₹180";
      } else if (lowerQuery.includes("delivery")) {
        fallbackResponse = "Delivery Information:\n• Free delivery on orders above ₹200\n• Delivery time: 30-45 minutes\n• Cash, Card, and UPI accepted\n• Track your order in real-time";
      } else if (lowerQuery.includes("help")) {
        fallbackResponse = "I can help you with:\n• Menu items (veg/non-veg)\n• Prices\n• Delivery information\n• Popular dishes\n\nJust type your question!";
      } else if (lowerQuery.includes("price") || lowerQuery.includes("cost")) {
        fallbackResponse = "Our items range from ₹50 to ₹300.\nMost popular:\n• Chicken Biryani - ₹150\n• Margherita Pizza - ₹180\n• Butter Chicken - ₹170\n• Veg Burger - ₹80";
      } else {
        fallbackResponse = "I can help you with:\n• 'Show me veg items'\n• 'List non-veg items'\n• 'Menu'\n• 'Delivery info'\n• 'Help'\n\nWhat would you like to know?";
      }
      
      setMessages((prev) => [
        ...prev,
        { user: userMessage, bot: fallbackResponse },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const openChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          user: "",
          bot: `Welcome to SmartBite! 🍔

I'm your food assistant. I can help you with:

Menu Information
• Type "veg" for vegetarian items
• Type "non-veg" for non-vegetarian items
• Type "menu" to see all items

Order Help
• Type "delivery" for delivery information
• Type "help" for all commands

Try asking:
• "Show me veg items"
• "What non-veg items do you have?"
• "Popular dishes"
• "Price of biryani"

How can I help you today?`,
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl z-50 flex items-center gap-2 px-5 py-3"
        style={{
          fontFamily: "sans-serif",
        }}
      >
        <span className="text-2xl">💬</span>
        <span className="font-semibold text-sm">Food Assistant</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🍔
              </div>
              <div>
                <h3 className="font-bold text-lg">SmartBite Assistant</h3>
                <p className="text-xs opacity-90">Online | Ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                {/* User Message */}
                {msg.user && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-2 shadow-sm">
                      <p className="text-sm">{msg.user}</p>
                    </div>
                  </div>
                )}
                
                {/* Bot Message */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-orange-500">Assistant</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">just now</span>
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.bot}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-5 py-2 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">
                Powered by SmartBite AI
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </>
  );
};

export default Chatbot;