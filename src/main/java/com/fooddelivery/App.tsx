import { useState, useEffect } from "react";
import axios from "axios";
import FoodDetails from "./FoodDetails";
import Cart from "./Cart";
import type { FoodItem, User } from "./types";
import Recommendations from "./Recommendations";
import Chatbot from "./Chatbot";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import Orders from "./Orders";

export default function App() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [cart, setCart] = useState<FoodItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [activeTab, setActiveTab] = useState<"menu" | "orders">("menu");
  const [orderRefreshTrigger, setOrderRefreshTrigger] = useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Admin mode states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    if (isLoggedIn) {
      axios
        .get("http://localhost:8080/api/foods")
        .then((res) => setFoods(res.data))
        .catch(console.error);
    }
  }, [isLoggedIn]);

  // Check for existing admin session
  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminToken');
    if (savedAdmin) {
      const adminData = JSON.parse(savedAdmin);
      setAdmin(adminData);
      setIsAdminMode(true);
    }
  }, []);

  // ---------------- AUTH ----------------
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/users/login", { email, password });
      if (res.data) {
        console.log("Login response:", res.data);
        const userData = {
          user_id: res.data.user_id || res.data.userId,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          contact: res.data.contact
        };
        console.log("Setting loggedInUser:", userData);
        setIsLoggedIn(true);
        setLoggedInUser(userData);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login error - Invalid credentials");
    }
  };

  const handleSignUp = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/users/signup", {
        name,
        email,
        password,
        role: "customer",
      });
      alert(res.data);
      setIsSignUp(false);
    } catch {
      alert("Signup error");
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    setIsAdminMode(false);
  };

  const getCategory = (name: string) => {
    const nonVegKeywords = ["chicken", "mutton", "fish", "egg"];
    return nonVegKeywords.some((word) => name.toLowerCase().includes(word)) ? "non-veg" : "veg";
  };

  // ---------------- CART ----------------
  const handleAddToCart = (food: FoodItem, qty: number) => {
    setCart((prev) => [...prev, ...Array(qty).fill(food)]);
    alert(`✅ ${food.name} x${qty} added to cart`);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOrderPlaced = () => {
    setCart([]);
    setOrderRefreshTrigger(prev => prev + 1);
    setActiveTab("orders");
    alert("Order placed successfully! Check your orders for tracking.");
  };

  const getImageUrl = (food: FoodItem) => {
    const imagePath = food.image_url || food.imageUrl;
    if (imagePath) {
      if (imagePath.startsWith('http')) return imagePath;
      if (imagePath.startsWith('/')) return `http://localhost:8080${imagePath}`;
      return `http://localhost:8080/images/${imagePath}`;
    }
    return "http://localhost:8080/images/default.jpg";
  };

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
    const foodCategory = getCategory(food.name);
    if (categoryFilter === "all") return matchesSearch;
    if (categoryFilter === "veg") return matchesSearch && foodCategory === "veg";
    if (categoryFilter === "non-veg") return matchesSearch && foodCategory === "non-veg";
    return false;
  });

  // ---------------- ADMIN PORTAL ----------------
  if (isAdminMode && admin) {
    return <AdminDashboard admin={admin} onLogout={handleAdminLogout} />;
  }

  if (isAdminMode) {
    return <AdminLogin onLogin={(adminData) => {
      setAdmin(adminData);
      setIsAdminMode(true);
    }} />;
  }

  // ---------------- LOGIN PAGE ----------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-red-400 to-pink-500">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <button
          onClick={() => setIsAdminMode(true)}
          className="fixed top-4 right-4 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg z-50 transition duration-300 flex items-center gap-2"
        >
          👨‍💼 Admin Login
        </button>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="text-7xl mb-4 animate-bounce">🍔</div>
            <h1 className="text-5xl font-bold text-white mb-2">SmartBite</h1>
            <p className="text-white text-opacity-90">Delicious food delivered to your door</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform transition-all duration-500 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-8">
              {isSignUp ? "Create Account" : "Welcome Back!"}
            </h2>

            <div className="space-y-4">
              {isSignUp && (
                <div>
                  <input
                    placeholder="Full Name"
                    className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <input
                  placeholder="Email Address"
                  className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                onClick={isSignUp ? handleSignUp : handleLogin}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-xl font-semibold transform transition-all duration-300 hover:scale-105 shadow-lg"
              >
                {isSignUp ? "Sign Up" : "Login"}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-orange-600 font-semibold py-2 rounded-xl hover:bg-orange-50 transition-colors duration-300"
              >
                {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- MAIN PAGE ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <header className="bg-white shadow-lg sticky top-0 z-50 backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="text-3xl animate-bounce">🍔</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                SmartBite
              </h1>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setActiveTab("menu")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === "menu"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Menu
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === "orders"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                My Orders
              </button>
            </div>

            <div className="flex-1 text-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Welcome back, <span className="text-orange-500">{loggedInUser?.name}</span>! 🎉
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full hover:shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                🛒 Cart
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsLoggedIn(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full transition-colors duration-300"
              >
                Logout
              </button>

              <button
                onClick={() => setIsAdminMode(true)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-full transition-colors duration-300 flex items-center gap-2"
              >
                👨‍💼 Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "menu" ? (
          <>
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔍</span>
                    </div>
                    <input
                      placeholder="Search for delicious food..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                      categoryFilter === "all"
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setCategoryFilter("veg")}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                      categoryFilter === "veg"
                        ? "bg-green-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    🟢 Veg
                  </button>
                  <button
                    onClick={() => setCategoryFilter("non-veg")}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                      categoryFilter === "non-veg"
                        ? "bg-red-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    🔴 Non-Veg
                  </button>
                </div>
              </div>
            </div>

            {filteredFoods.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-2xl font-semibold text-gray-600">No food items found</h3>
                <p className="text-gray-500 mt-2">Try searching for something else</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFoods.map((food, index) => (
                  <div
                    key={food.food_id}
                    onClick={() => setSelectedFood(food)}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={getImageUrl(food)}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => (e.currentTarget.src = "http://localhost:8080/images/default.jpg")}
                        alt={food.name}
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          getCategory(food.name) === "veg" 
                            ? "bg-green-500 text-white" 
                            : "bg-red-500 text-white"
                        }`}>
                          {getCategory(food.name) === "veg" ? "VEG" : "NON-VEG"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
                        {food.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-orange-500">₹{food.price}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(food, 1);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full text-sm transition-colors duration-300"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-12">
              <Recommendations />
            </div>
          </>
        ) : (
          <Orders 
            key={orderRefreshTrigger}
            userId={loggedInUser?.user_id || 0} 
          />
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <Chatbot />
      </div>

      {selectedFood && (
        <FoodDetails
          food={selectedFood}
          onAddToCart={handleAddToCart}
          onClose={() => setSelectedFood(null)}
          customerId={loggedInUser?.user_id || 0}
        />
      )}

      {showCart && (
        <Cart 
          cart={cart} 
          onRemove={removeFromCart} 
          onClose={() => setShowCart(false)}
          customerId={loggedInUser?.user_id || 0}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
    </div>
  );
}