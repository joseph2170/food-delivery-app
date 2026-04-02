import { useEffect, useState } from "react";
import axios from "axios";

interface FoodItem {
  food_id: number;
  name: string;
  total_orders?: number;
  price?: number;
  image_url?: string;
  description?: string;
  category?: string;
}

export default function Recommendations() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the correct endpoint
      const response = await axios.get("http://localhost:8080/api/recommendation/top");
      
      console.log("Recommendations response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setFoods(response.data);
      } else {
        setFoods([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch recommendations:", err);
      
      if (err.response?.status === 404) {
        setError("Recommendation endpoint not found. Please check if /api/recommendation/top exists.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Cannot connect to backend. Please make sure Spring Boot is running on port 8080");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (food: FoodItem): string => {
    if (food.image_url) {
      if (food.image_url.startsWith('http')) {
        return food.image_url;
      }
      if (food.image_url.startsWith('/')) {
        return `http://localhost:8080${food.image_url}`;
      }
      return `http://localhost:8080/images/${food.image_url}`;
    }
    return "http://localhost:8080/images/default.jpg";
  };

  const handleImageError = (foodId: number) => {
    setImageErrors(prev => new Set(prev).add(foodId));
  };

  const getPlaceholderImage = (foodName: string) => {
    const bgColors: Record<string, string> = {
      Pizza: "from-red-400 to-red-600",
      Burger: "from-yellow-400 to-yellow-600",
      Biryani: "from-orange-400 to-orange-600",
      Pasta: "from-green-400 to-green-600",
      Dosa: "from-amber-400 to-amber-600",
      default: "from-purple-400 to-purple-600"
    };

    let gradient = bgColors.default;
    for (const [key, value] of Object.entries(bgColors)) {
      if (foodName.includes(key)) {
        gradient = value;
        break;
      }
    }

    return (
      <div className={`w-full h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-4xl mb-2">
            {foodName.includes("Pizza") && "🍕"}
            {foodName.includes("Burger") && "🍔"}
            {foodName.includes("Biryani") && "🍚"}
            {foodName.includes("Pasta") && "🍝"}
            {!foodName.match(/Pizza|Burger|Biryani|Pasta/) && "🍽️"}
          </div>
          <div className="text-white text-sm font-semibold px-2 py-1 bg-black bg-opacity-50 rounded">
            {foodName}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="my-12">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          🔥 Recommended for You
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-12 text-center py-12 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-2xl font-semibold text-gray-600">Connection Error</h3>
        <p className="text-gray-500 mt-2">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (foods.length === 0) {
    return (
      <div className="my-12 text-center py-12 bg-gradient-to-r from-gray-50 to-orange-50 rounded-2xl">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-2xl font-semibold text-gray-600">No recommendations yet</h3>
        <p className="text-gray-500 mt-2">Check back later for personalized suggestions!</p>
      </div>
    );
  }

  return (
    <div className="my-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            🔥 Recommended for You
          </h2>
          <p className="text-gray-600 mt-1">Based on your preferences and trending items</p>
        </div>
        <button
          onClick={fetchRecommendations}
          className="text-orange-500 hover:text-orange-600 text-sm font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {foods.map((food) => (
          <div
            key={food.food_id}
            className="group bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative overflow-hidden bg-gray-100">
              {!imageErrors.has(food.food_id) ? (
                <img
                  src={getImageUrl(food)}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={() => handleImageError(food.food_id)}
                  alt={food.name}
                />
              ) : (
                getPlaceholderImage(food.name)
              )}
              
              {food.category && (
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                    food.category === "Veg" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}>
                    {food.category === "Veg" ? "🟢 VEG" : "🔴 NON-VEG"}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
                {food.name}
              </h3>
              
              {food.description && (
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                  {food.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  {food.price && (
                    <span className="text-2xl font-bold text-orange-500">₹{food.price}</span>
                  )}
                </div>
                
                <button
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold transform transition-all duration-300 hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Ordering ${food.name}`);
                  }}
                >
                  Order Now →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}