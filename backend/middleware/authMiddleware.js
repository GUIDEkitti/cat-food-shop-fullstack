// File: backend/middleware/authMiddleware.js (เวอร์ชันที่ถูกต้อง)

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key'; // ควรเก็บเป็นความลับ

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Attach user to the request
            req.user = decoded; // decoded will have { userId, role }
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        // --- Log ที่เพิ่มเข้ามาเพื่อ Debug ---
        console.log('--- Authorize Middleware Check ---');
        console.log('Required Roles:', roles);
        console.log('User Role from Token:', req.user ? req.user.role : 'No user object on request');
        // ------------------------------------

        // เพิ่มการตรวจสอบ req.user ให้รัดกุมขึ้น
        if (!req.user || !roles.includes(req.user.role)) {
            console.log('Authorization FAILED.');
            return res.status(403).json({ message: `User role is not authorized to access this route` });
        }

        console.log('Authorization PASSED.');
        next();
    };
};

module.exports = { protect, authorize };