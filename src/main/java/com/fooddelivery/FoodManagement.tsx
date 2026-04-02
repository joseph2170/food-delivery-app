import { useState, useEffect } from 'react';
import axios from 'axios';

interface FoodItem {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
}

interface FoodManagementProps {
    adminId: number;
}

export default function FoodManagement({ adminId }: FoodManagementProps) {
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Veg',
        image: null as File | null
    });

    useEffect(() => {
        fetchFoods();
    }, []);

    const fetchFoods = async () => {
        try {
            const res = await axios.post('http://localhost:8080/api/admin/foods', {
                userId: adminId
            });
            setFoods(res.data);
        } catch (error) {
            console.error('Failed to fetch foods:', error);
            alert('Failed to load food items');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formDataToSend = new FormData();
        formDataToSend.append('userId', adminId.toString());
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('category', formData.category);
        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        try {
            if (editingFood) {
                await axios.put(
                    `http://localhost:8080/api/admin/foods/update/${editingFood.id}`,
                    formDataToSend
                );
                alert('Food item updated successfully!');
            } else {
                await axios.post('http://localhost:8080/api/admin/foods/add', formDataToSend);
                alert('Food item added successfully!');
            }
            
            fetchFoods();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save food:', error);
            alert('Failed to save food item');
        }
    };

    const handleDelete = async (foodId: number) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`http://localhost:8080/api/admin/foods/delete/${foodId}`, {
                    data: { userId: adminId }
                });
                alert('Food item deleted successfully!');
                fetchFoods();
            } catch (error) {
                console.error('Failed to delete food:', error);
                alert('Failed to delete food item');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Veg',
            image: null
        });
        setEditingFood(null);
    };

    const openEditModal = (food: FoodItem) => {
        setEditingFood(food);
        setFormData({
            name: food.name,
            description: food.description,
            price: food.price.toString(),
            category: food.category,
            image: null
        });
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading food items...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Food Items Management</h2>
                    <p className="text-gray-600 mt-1">Manage your restaurant menu</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <span className="text-xl">+</span>
                    Add New Food Item
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600">Total Items</p>
                    <p className="text-2xl font-bold text-blue-700">{foods.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600">Veg Items</p>
                    <p className="text-2xl font-bold text-green-700">
                        {foods.filter(f => f.category === 'Veg').length}
                    </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-600">Non-Veg Items</p>
                    <p className="text-2xl font-bold text-red-700">
                        {foods.filter(f => f.category === 'Non-Veg').length}
                    </p>
                </div>
            </div>

            {/* Food Items Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {foods.map((food) => (
                                <tr key={food.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{food.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {food.imageUrl ? (
                                            <img
                                                src={`http://localhost:8080${food.imageUrl}`}
                                                alt={food.name}
                                                className="w-12 h-12 object-cover rounded"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'http://localhost:8080/images/default.jpg';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-2xl">🍽️</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{food.name}</div>
                                        <div className="text-sm text-gray-500">{food.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            food.category === 'Veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {food.category === 'Veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{food.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => openEditModal(food)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                        <button onClick={() => handleDelete(food.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Veg">Vegetarian 🟢</option>
                                    <option value="Non-Veg">Non-Vegetarian 🔴</option>
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                                <input
                                    type="file"
                                    onChange={(e) => setFormData({...formData, image: e.target.files?.[0] || null})}
                                    accept="image/*"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Optional: Upload an image for the food item</p>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    {editingFood ? 'Update' : 'Add'} Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}