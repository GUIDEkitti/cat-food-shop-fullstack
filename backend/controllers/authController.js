const db = require('../config/db');
const jwt = require('jsonwebtoken');

// ไม่มีการเข้ารหัส ตามเงื่อนไข
const JWT_SECRET = 'your_super_secret_key'; // ควรเก็บเป็นความลับ

exports.register = async (req, res) => {
    const { phone, username, password } = req.body;
    if (!phone || !username || !password) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
        // --- ส่วนที่เพิ่มเข้ามา: ตรวจสอบข้อมูลซ้ำ ---
        const checkSql = 'SELECT * FROM users WHERE username = ? OR phone = ?';
        const [existingUsers] = await db.query(checkSql, [username, phone]);

        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];
            if (existingUser.username === username) {
                // ใช้สถานะ 409 Conflict สำหรับข้อมูลซ้ำ
                return res.status(409).json({ message: 'Username นี้มีผู้ใช้งานแล้ว' });
            }
            if (existingUser.phone === phone) {
                return res.status(409).json({ message: 'เบอร์โทรศัพท์นี้มีผู้ใช้งานแล้ว' });
            }
        }
        // ------------------------------------------

        // ถ้าไม่ซ้ำ ก็ทำการ INSERT ตามปกติ
        const insertSql = 'INSERT INTO users (username, phone, password, role_id, approved) VALUES (?, ?, ?, ?, ?)';
        await db.query(insertSql, [username, phone, password, 1, false]);

        res.status(201).json({ message: 'ลงทะเบียนสำเร็จ รอการอนุมัติจากผู้ดูแล' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const sql = 'SELECT * FROM users JOIN roles ON users.role_id = roles.role_id WHERE username = ?';
        const [users] = await db.query(sql, [username]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        const user = users[0];

        if (password !== user.password) { // เปรียบเทียบรหัสผ่านตรงๆ
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        if (!user.approved) {
            return res.status(403).json({ message: 'บัญชีของคุณยังไม่ได้รับการอนุมัติ' });
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.role_name },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.user_id, username: user.username, role: user.role_name } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.checkAvailability = async (req, res) => {
    const { field, value } = req.query;

    // ป้องกัน SQL Injection โดยการเช็คชื่อ field
    if (!['username', 'phone'].includes(field)) {
        return res.status(400).json({ message: 'Invalid field for checking' });
    }

    try {
        const sql = `SELECT user_id FROM users WHERE ${field} = ?`;
        const [users] = await db.query(sql, [value]);

        if (users.length > 0) {
            res.json({ available: false });
        } else {
            res.json({ available: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};