// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
// ใช้ Middleware นี้กับทุก Route ของ Admin
router.use(protect, authorize('admin'));

// Route สำหรับจัดการ User ทั้งหมด (CRUD)
router.route('/users')
    .get(adminController.getAllUsers)
    .post(adminController.addUserByAdmin);

router.route('/users/:userId')
    .put(adminController.updateUserByAdmin);

router.route('/users/:userIdToDelete')
    .delete(adminController.deleteUserByAdmin);

module.exports = router;