const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
        const { search, product_type } = req.query;

        let sql = 'SELECT * FROM products WHERE 1=1'; // ดึงทุก field มาก่อน
        const params = [];

        if (search) {
            sql += ' AND (product_name LIKE ? OR product_id = ?)';
            params.push(`%${search}%`, search);
        }

        if (product_type) {
            sql += ' AND product_type = ?';
            params.push(product_type);
        }

        const [products] = await db.query(sql, params);

        // --- ส่วนที่เพิ่มเข้ามา ---
        // ใช้ .map เพื่อวน loop สร้าง array ใหม่ที่แปลงรูปภาพแล้ว
        const productsWithImages = products.map(product => {
            let imageDataUrl = null;
            // ตรวจสอบว่ามีข้อมูลรูปภาพหรือไม่
            if (product.product_image) {
                // แปลง Buffer เป็น Base64 String
                const imageBase64 = product.product_image.toString('base64');
                imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
            }

            // คืนค่า object ใหม่ที่มี imageDataUrl และลบข้อมูล BLOB ดิบออก
            return {
                ...product,
                imageDataUrl: imageDataUrl,
                product_image: undefined // ไม่ต้องส่งข้อมูล BLOB ดิบไปให้ Frontend
            };
        });
        // ------------------------

        res.json(productsWithImages); // ส่ง array ที่แปลงรูปแล้วกลับไป

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// backend/controllers/productController.js
exports.getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        const sql = 'SELECT * FROM products WHERE product_id = ?';
        const [products] = await db.query(sql, [productId]);

        if (products.length > 0) {
            const product = products[0];

            // --- เพิ่ม console.log เพื่อ Debug ---
            console.log('--- Product data from DB ---');
            console.log(product); // 1. ดูข้อมูลดิบจาก DB

            console.log('--- Checking product_image field ---');
            console.log(product.product_image); // 2. ดูข้อมูลในฟิลด์รูปภาพโดยเฉพาะ

            if (product.product_image) {
                console.log('Image data exists, attempting to convert...'); // 3. เช็คว่าเข้าเงื่อนไข if หรือไม่
                const imageBase64 = product.product_image.toString('base64');
                product.imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
            } else {
                console.log('No image data found for this product.'); // 4. เช็คว่าเข้าเงื่อนไข else หรือไม่
            }

            delete product.product_image;

            console.log('--- Final product object to be sent ---');
            console.log(product); // 5. ดูข้อมูลสุดท้ายก่อนส่ง

            res.json(product);
        } else {
            res.status(404).json({ message: 'ไม่พบสินค้า' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};