// File: backend/controllers/sellerController.js
const db = require('../config/db');

// ===================================
// ==     User/Customer Management    ==
// ===================================

exports.getManageableUsers = async (req, res) => {
    try {
        const sql = "SELECT user_id, username, phone, created_at, approved FROM users WHERE role_id = 1 ORDER BY approved ASC, created_at DESC";
        const [users] = await db.query(sql);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.approveUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const sql = "UPDATE users SET approved = TRUE WHERE user_id = ?";
        await db.query(sql, [userId]);
        res.json({ message: `User ${userId} has been approved.` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateUser = async (req, res) => {
    const { userId } = req.params;
    const { username, phone } = req.body;
    try {
        const [users] = await db.query("SELECT role_id FROM users WHERE user_id = ?", [userId]);
        if (users.length === 0 || users[0].role_id !== 1) {
            return res.status(403).json({ message: "Forbidden: Cannot edit this user." });
        }
        const sql = "UPDATE users SET username = ?, phone = ? WHERE user_id = ?";
        await db.query(sql, [username, phone, userId]);
        res.json({ message: `User ${userId} updated successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [users] = await connection.query("SELECT role_id FROM users WHERE user_id = ?", [userId]);
        if (users.length === 0 || users[0].role_id !== 1) {
            await connection.rollback();
            return res.status(403).json({ message: "Forbidden: Cannot delete this user." });
        }

        const checkOrderSql = "SELECT COUNT(*) as orderCount FROM orders WHERE user_id = ?";
        const [orderResult] = await connection.query(checkOrderSql, [userId]);
        if (orderResult[0].orderCount > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "ไม่สามารถลบผู้ใช้นี้ได้ เนื่องจากมีประวัติการสั่งซื้ออยู่" });
        }

        const deleteCartSql = "DELETE FROM cart WHERE user_id = ?";
        await connection.query(deleteCartSql, [userId]);

        const deleteUserSql = "DELETE FROM users WHERE user_id = ?";
        await connection.query(deleteUserSql, [userId]);

        await connection.commit();
        res.json({ message: `User ${userId} deleted successfully.` });
    } catch (error) {
        await connection.rollback();
        console.error("Delete User by Seller Error:", error);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};


// ===================================
// ==      Product Management       ==
// ===================================

exports.addProduct = async (req, res) => {
    // รับ productImageBase64 มาจาก req.body โดยตรง
    const { product_name, product_price, product_type, description, stock, productImageBase64 } = req.body;

    let imageBuffer = null;
    // ตรวจสอบว่ามีข้อมูล Base64 ส่งมาหรือไม่
    if (productImageBase64) {
        // แปลง Base64 กลับเป็น Buffer
        const base64Data = productImageBase64.replace(/^data:image\/\w+;base64,/, "");
        imageBuffer = Buffer.from(base64Data, 'base64');
    }

    try {
        const sql = 'INSERT INTO products (product_name, product_image, product_price, product_type, description, stock) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(sql, [product_name, imageBuffer, product_price, product_type, description, stock]);
        res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
        console.error("Add product error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- ฟังก์ชันที่แก้ไขใหม่: แก้ไขสินค้า (Base64) ---
exports.updateProduct = async (req, res) => {
    const { productId } = req.params;
    const { product_name, product_price, product_type, description, stock, productImageBase64 } = req.body;

    try {
        // ดึงข้อมูลรูปภาพเก่ามาก่อน เผื่อกรณีที่ไม่ได้ส่งรูปใหม่มา
        const [oldProduct] = await db.query("SELECT product_image FROM products WHERE product_id = ?", [productId]);
        let imageBuffer = oldProduct.length > 0 ? oldProduct[0].product_image : null;

        // ถ้ามีการส่งรูปใหม่มา (Base64 string) ให้แปลงและใช้รูปใหม่
        if (productImageBase64) {
            const base64Data = productImageBase64.replace(/^data:image\/\w+;base64,/, "");
            imageBuffer = Buffer.from(base64Data, 'base64');
        }

        const sql = `UPDATE products SET product_name = ?, product_image = ?, product_price = ?, product_type = ?, description = ?, stock = ? WHERE product_id = ?`;
        await db.query(sql, [product_name, imageBuffer, product_price, product_type, description, stock, productId]);

        res.json({ message: `Product ${productId} updated successfully` });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteProduct = async (req, res) => {
    const { productId } = req.params;
    let connection; // <-- 1. ประกาศตัวแปรไว้นอก try

    try {
        connection = await db.getConnection(); // <-- 2. ย้ายการขอ connection มาไว้ใน try
        await connection.beginTransaction();

        // ตรวจสอบว่าสินค้าอยู่ในประวัติการสั่งซื้อ (order_items) หรือไม่
        const checkOrderSql = "SELECT COUNT(*) as count FROM order_items WHERE product_id = ?";
        const [orderResult] = await connection.query(checkOrderSql, [productId]);
        if (orderResult[0].count > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({ message: "ไม่สามารถลบสินค้านี้ได้ เนื่องจากมีอยู่ในประวัติการสั่งซื้อ" });
        }

        // ตรวจสอบตาราง product_logs
        const checkLogSql = "SELECT COUNT(*) as count FROM product_logs WHERE product_id = ?";
        const [logResult] = await connection.query(checkLogSql, [productId]);
        if (logResult[0].count > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({ message: "ไม่สามารถลบสินค้านี้ได้ เนื่องจากมีประวัติการเปลี่ยนแปลงสต็อก" });
        }

        // ตรวจสอบตาราง purchase_history
        const checkHistorySql = "SELECT COUNT(*) as count FROM purchase_history WHERE product_id = ?";
        const [historyResult] = await connection.query(checkHistorySql, [productId]);
        if (historyResult[0].count > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({ message: "ไม่สามารถลบสินค้านี้ได้ เนื่องจากมีอยู่ในประวัติการซื้อ" });
        }

        // เคลียร์ออกจากตะกร้า
        const deleteCartSql = "DELETE FROM cart WHERE product_id = ?";
        await connection.query(deleteCartSql, [productId]);

        // ทำการลบสินค้า
        const deleteProductSql = "DELETE FROM products WHERE product_id = ?";
        await connection.query(deleteProductSql, [productId]);

        await connection.commit();
        res.json({ message: `Product ${productId} deleted successfully.` });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Delete Product Error:", error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        if (connection) connection.release();
    }
};

// ===================================
// ==      In-store Sale & Orders   ==
// ===================================

exports.findCustomer = async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query is required' });
    try {
        const sql = "SELECT user_id, username, phone FROM users WHERE (username = ? OR phone = ?) AND role_id = 1";
        const [users] = await db.query(sql, [query, query]);
        if (users.length > 0) res.json(users[0]);
        else res.status(404).json({ message: 'Customer not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.sellerCheckout = async (req, res) => {
    const { targetUserId, cartItems } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const orderSql = 'INSERT INTO orders (user_id, shipping_address) VALUES (?, ?)';
        const [orderResult] = await connection.query(orderSql, [targetUserId, 'ซื้อที่ร้าน']);
        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            const itemSql = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
            await connection.query(itemSql, [orderId, item.product_id, item.quantity, item.product_price]);
            const stockSql = 'UPDATE products SET stock = stock - ? WHERE product_id = ?';
            await connection.query(stockSql, [item.quantity, item.product_id]);
        }
        await connection.commit();
        res.status(201).json({ message: 'Checkout successful', orderId });
    } catch (error) {
        await connection.rollback();
        console.error("Seller Checkout Error:", error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const { userId, productId } = req.query;
        let baseQuery = `
            SELECT o.order_id, o.order_date, o.shipping_address, u.user_id, u.username,
                   p.product_id, p.product_name, oi.quantity, oi.price
            FROM orders AS o
            LEFT JOIN users AS u ON o.user_id = u.user_id
            LEFT JOIN order_items AS oi ON o.order_id = oi.order_id
            LEFT JOIN products AS p ON oi.product_id = p.product_id`;
        const whereClauses = [];
        const params = [];

        if (userId) {
            whereClauses.push("o.user_id = ?");
            params.push(userId);
        }
        if (productId) {
            whereClauses.push("o.order_id IN (SELECT order_id FROM order_items WHERE product_id = ?)");
            params.push(productId);
        }
        if (whereClauses.length > 0) {
            baseQuery += " WHERE " + whereClauses.join(" AND ");
        }
        baseQuery += " ORDER BY o.order_date DESC";
        const [orders] = await db.query(baseQuery, params);
        res.json(orders);
    } catch (error) {
        console.error("Get All Orders Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getCustomersForFilter = async (req, res) => {
    try {
        const sql = "SELECT user_id, username FROM users WHERE role_id = 1 AND approved = TRUE ORDER BY username ASC";
        const [customers] = await db.query(sql);
        res.json(customers);
    } catch (error) {
        console.error("Get Customers Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};