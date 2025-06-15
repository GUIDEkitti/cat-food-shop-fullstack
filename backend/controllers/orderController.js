const db = require('../config/db');

exports.checkout = async (req, res) => {
    const userId = req.user.userId;
    const { shipping_address, cartItems } = req.body; // รับ cartItems จาก frontend

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. สร้าง order ใหม่
        const orderSql = 'INSERT INTO orders (user_id, shipping_address) VALUES (?, ?)';
        const [orderResult] = await connection.query(orderSql, [userId, shipping_address]);
        const orderId = orderResult.insertId;

        // 2. ย้ายสินค้าจาก cartItems ไปยัง order_items
        for (const item of cartItems) {
            const itemSql = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
            await connection.query(itemSql, [orderId, item.product_id, item.quantity, item.product_price]);

            // 3. ตัดสต็อกสินค้า
            const stockSql = 'UPDATE products SET stock = stock - ? WHERE product_id = ?';
            await connection.query(stockSql, [item.quantity, item.product_id]);
        }

        // 4. ลบสินค้าออกจากตะกร้า
        const deleteCartSql = 'DELETE FROM cart WHERE user_id = ?';
        await connection.query(deleteCartSql, [userId]);

        await connection.commit();
        res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
};

exports.getPurchaseHistory = async (req, res) => {
    const userId = req.user.userId;
    try {
        const sql = `
            SELECT 
                o.order_id, 
                o.order_date, 
                o.shipping_address, 
                oi.product_id, 
                p.product_name, 
                oi.quantity, 
                oi.price
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.user_id = ?
            ORDER BY o.order_date DESC`;
        // -----------------------------------------------------------
            
        const [history] = await db.query(sql, [userId]);
        res.json(history);
    } catch (error) {
        console.error("Error fetching purchase history:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};