// File: backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// เพิ่ม Middleware สำหรับอ่าน JSON body
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/check-availability', authController.checkAvailability);

module.exports = router;