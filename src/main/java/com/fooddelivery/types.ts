// types.ts
export interface FoodItem {
  food_id: number;
  name: string;
  price: number;
  image_url?: string;
  imageUrl?: string;
  description?: string;
  category?: string;
  restaurant_id?: number;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  contact?: string;
}