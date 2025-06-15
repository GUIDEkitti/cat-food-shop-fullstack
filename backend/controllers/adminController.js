// File: backend/controllers/adminController.js
const db = require('../config/db');

/**
 * ดึงข้อมูลผู้ใช้ทั้งหมดทุก Role สำหรับ Admin
 */
exports.getAllUsers = async (req, res) => {
    try {
        const sql = `
            SELECT u.user_id, u.username, u.phone, u.approved, r.role_id, r.role_name 
            FROM users u 
            JOIN roles r ON u.role_id = r.role_id
            ORDER BY u.user_id ASC`;
        const [users] = await db.query(sql);
        res.json(users);
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * เพิ่มผู้ใช้ใหม่โดย Admin (พร้อมเช็คข้อมูลซ้ำ)
 */
exports.addUserByAdmin = async (req, res) => {
    const { username, phone, password, role_id, approved } = req.body;
    if (!username || !phone || !password || !role_id) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
        const checkSql = 'SELECT username, phone FROM users WHERE username = ? OR phone = ?';
        const [existingUsers] = await db.query(checkSql, [username, phone]);

        if (existingUsers.length > 0) {
            if (existingUsers[0].username === username) {
                return res.status(409).json({ message: 'Username นี้มีผู้ใช้งานแล้ว' });
            }
            if (existingUsers[0].phone === phone) {
                return res.status(409).json({ message: 'เบอร์โทรศัพท์นี้มีผู้ใช้งานแล้ว' });
            }
        }

        const sql = 'INSERT INTO users (username, phone, password, role_id, approved) VALUES (?, ?, ?, ?, ?)';
        await db.query(sql, [username, phone, password, role_id, approved ? 1 : 0]);
        res.status(201).json({ message: 'User created successfully by admin.' });
    } catch (error) {
        console.error("Add User by Admin Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * แก้ไขข้อมูลและ Role ของผู้ใช้โดย Admin (ป้องกันการแก้ไขตัวเอง)
 */
exports.updateUserByAdmin = async (req, res) => {
    const loggedInAdminId = req.user.userId;
    const { userId } = req.params;
    const { username, phone, role_id, approved } = req.body;

    if (Number(loggedInAdminId) === Number(userId)) {
        return res.status(403).json({ message: "Forbidden: Admins cannot edit their own account." });
    }

    try {
        const sql = "UPDATE users SET username = ?, phone = ?, role_id = ?, approved = ? WHERE user_id = ?";
        await db.query(sql, [username, phone, role_id, approved ? 1 : 0, userId]);
        res.json({ message: `User ${userId} updated successfully by admin.` });
    } catch (error) {
        console.error("Update User by Admin Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * ลบผู้ใช้โดย Admin (ป้องกันการลบตัวเอง และจัดการ Foreign Key)
 */
exports.deleteUserByAdmin = async (req, res) => {
    const loggedInAdminId = req.user.userId;
    const { userIdToDelete } = req.params;

    if (Number(loggedInAdminId) === Number(userIdToDelete)) {
        return res.status(403).json({ message: "Forbidden: Admins cannot delete themselves." });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const checkOrderSql = "SELECT COUNT(*) as orderCount FROM orders WHERE user_id = ?";
        const [orderResult] = await connection.query(checkOrderSql, [userIdToDelete]);
        if (orderResult[0].orderCount > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "ไม่สามารถลบผู้ใช้นี้ได้ เนื่องจากมีประวัติการสั่งซื้ออยู่" });
        }

        const deleteCartSql = "DELETE FROM cart WHERE user_id = ?";
        await connection.query(deleteCartSql, [userIdToDelete]);

        const deleteUserSql = "DELETE FROM users WHERE user_id = ?";
        await connection.query(deleteUserSql, [userIdToDelete]);

        await connection.commit();
        res.json({ message: `User ${userIdToDelete} deleted successfully.` });
    } catch (error) {
        await connection.rollback();
        console.error("Delete User by Admin Error:", error);
        res.status(500).json({ message: "Server Error" });
    } finally {
        connection.release();
    }
};