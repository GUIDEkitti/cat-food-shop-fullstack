const db = require('../config/db');

exports.getCartItems = async (req, res) => {
    const userId = req.user.userId;
    try {
        const sql = `
            SELECT c.cart_id, p.product_id, p.product_name, p.product_price, c.quantity
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = ?`;
        const [items] = await db.query(sql, [userId]);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addToCart = async (req, res) => {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    try {
        // ตรวจสอบว่ามีสินค้านี้ในตะกร้าหรือยัง
        const checkSql = 'SELECT * FROM cart WHERE user_id = ? AND product_id = ?';
        const [existingItems] = await db.query(checkSql, [userId, productId]);

        if (existingItems.length > 0) {
            // ถ้ามี ให้อัปเดต quantity
            const updateSql = 'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?';
            await db.query(updateSql, [quantity, userId, productId]);
        } else {
            // ถ้าไม่มี ให้เพิ่มใหม่
            const insertSql = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
            await db.query(insertSql, [userId, productId, quantity]);
        }
        res.status(200).json({ message: 'Added to cart successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateCartItem = async (req, res) => {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
        // ถ้าจำนวนน้อยกว่า 1 ให้ลบทิ้ง
        return exports.removeCartItem(req, res);
    }

    try {
        const sql = 'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?';
        await db.query(sql, [quantity, userId, productId]);
        res.status(200).json({ message: 'Cart updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.removeCartItem = async (req, res) => {
    const userId = req.user.userId;
    const { productId } = req.params;
    try {
        const sql = 'DELETE FROM cart WHERE user_id = ? AND product_id = ?';
        await db.query(sql, [userId, productId]);
        res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};