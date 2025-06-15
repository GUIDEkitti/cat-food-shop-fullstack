// File: backend/routes/seller.js (เวอร์ชัน Base64)
const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// เพิ่ม JSON parser เข้ามา และเพิ่ม limit ขนาดเผื่อ Base64 string ที่อาจจะยาว
router.use(express.json({ limit: '10mb' }));
router.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware ตรวจสอบสิทธิ์
router.use(protect, authorize('seller', 'admin'));

// --- Product Management Routes (ไม่ต้องใช้ multer แล้ว) ---
router.post('/products', sellerController.addProduct);
router.post('/products/:productId', sellerController.updateProduct);
router.delete('/products/:productId', sellerController.deleteProduct);

// --- Route อื่นๆ ยังคงเหมือนเดิม ---
router.get('/manageable-users', sellerController.getManageableUsers);
router.put('/approvals/:userId', sellerController.approveUser);
router.put('/users/:userId', sellerController.updateUser);
router.delete('/users/:userId', sellerController.deleteUser);
router.get('/find-customer', sellerController.findCustomer);
router.post('/checkout', sellerController.sellerCheckout);
router.get('/orders', sellerController.getAllOrders);
router.get('/customers', sellerController.getCustomersForFilter);

module.exports = router;