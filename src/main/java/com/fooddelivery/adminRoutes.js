const express = require('express');
const router = express.Router();
const db = require('./db'); // Your database connection
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './public/uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const [users] = await db.execute(
            'SELECT * FROM users WHERE user_id = ? AND role = "admin"',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        req.admin = users[0];
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin Login
router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND role = "admin"',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }
        
        const admin = users[0];
        
        // In production, use proper password hashing
        if (password !== admin.password) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        // Log admin login
        await db.execute(
            'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
            [admin.user_id, 'LOGIN', `Admin logged in at ${new Date().toISOString()}`]
        );
        
        res.json({
            success: true,
            admin: {
                id: admin.user_id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all food items (admin view)
router.post('/admin/foods', verifyAdmin, async (req, res) => {
    try {
        const [foods] = await db.execute(
            'SELECT * FROM food_items ORDER BY food_id DESC'
        );
        res.json(foods);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new food item
router.post('/admin/foods/add', verifyAdmin, upload.single('image'), async (req, res) => {
    const { name, description, price, category, restaurant_id } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
        const [result] = await db.execute(
            `INSERT INTO food_items (name, description, price, category, image_url, restaurant_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, description, price, category, imageUrl, restaurant_id || 1]
        );
        
        // Log admin action
        await db.execute(
            'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
            [req.admin.user_id, 'ADD_FOOD', `Added food item: ${name}`]
        );
        
        res.json({
            success: true,
            message: 'Food item added successfully',
            foodId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update food item
router.put('/admin/foods/update/:id', verifyAdmin, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
        let query = 'UPDATE food_items SET name=?, description=?, price=?, category=?';
        let params = [name, description, price, category];
        
        if (imageUrl) {
            query += ', image_url=?';
            params.push(imageUrl);
        }
        
        query += ' WHERE food_id=?';
        params.push(id);
        
        await db.execute(query, params);
        
        // Log admin action
        await db.execute(
            'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
            [req.admin.user_id, 'UPDATE_FOOD', `Updated food item ID: ${id}`]
        );
        
        res.json({
            success: true,
            message: 'Food item updated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete food item
router.delete('/admin/foods/delete/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    
    try {
        // Get food details for logging
        const [foods] = await db.execute('SELECT name FROM food_items WHERE food_id = ?', [id]);
        
        await db.execute('DELETE FROM food_items WHERE food_id = ?', [id]);
        
        // Log admin action
        await db.execute(
            'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
            [req.admin.user_id, 'DELETE_FOOD', `Deleted food item: ${foods[0]?.name || 'Unknown'} (ID: ${id})`]
        );
        
        res.json({
            success: true,
            message: 'Food item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get dashboard statistics
router.get('/admin/stats', verifyAdmin, async (req, res) => {
    try {
        const [totalFoods] = await db.execute('SELECT COUNT(*) as count FROM food_items');
        const [totalOrders] = await db.execute('SELECT COUNT(*) as count FROM orders');
        const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
        const [recentOrders] = await db.execute(
            'SELECT * FROM orders ORDER BY order_id DESC LIMIT 5'
        );
        
        res.json({
            totalFoods: totalFoods[0].count,
            totalOrders: totalOrders[0].count,
            totalUsers: totalUsers[0].count,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get admin logs
router.get('/admin/logs', verifyAdmin, async (req, res) => {
    try {
        const [logs] = await db.execute(
            `SELECT al.*, u.name as admin_name 
             FROM admin_logs al 
             JOIN users u ON al.admin_id = u.user_id 
             ORDER BY al.created_at DESC 
             LIMIT 50`
        );
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;