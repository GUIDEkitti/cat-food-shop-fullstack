// backend/middleware/uploadMiddleware.js
const multer = require('multer');

// ตั้งค่าให้ multer เก็บไฟล์ไว้ใน memory ชั่วคราวในรูปแบบ Buffer
// ซึ่งเหมาะกับการนำไปเก็บในฐานข้อมูลแบบ BLOB
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

module.exports = upload;