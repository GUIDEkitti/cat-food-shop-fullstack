import axios from 'axios';

// 1. สร้าง Axios instance
const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// 2. สร้าง Interceptor ที่จะทำงานก่อนทุก request
apiClient.interceptors.request.use(
    (config) => {
        // ดึง token จาก localStorage
        const token = localStorage.getItem('token');

        // ถ้ามี token, ให้เพิ่ม Authorization header เข้าไปใน request
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config; // คืนค่า config ที่มี header แล้วกลับไป
    },
    (error) => {
        // ทำอะไรบางอย่างถ้าเกิด error
        return Promise.reject(error);
    }
);

// 3. Export object ที่มี method ต่างๆ เหมือนเดิม
export default {
    getProducts(params) {
        return apiClient.get('/products', { params });
    },
    getProduct(id) {
        return apiClient.get(`/products/${id}`);
    },
    login(credentials) {
        return apiClient.post('/auth/login', credentials);
    },
    register(data) {
        return apiClient.post('/auth/register', data);
    },
    getCart() {
        return apiClient.get('/cart');
    },
    addToCart(item) {
        return apiClient.post('/cart', item);
    },
    checkout(orderData) {
        return apiClient.post('/orders/checkout', orderData);
    },
    getPurchaseHistory() {
        return apiClient.get('/orders/history');
    },

    // Seller APIs
    getPendingApprovals() {
        return apiClient.get('/seller/approvals');
    },
    approveUser(userId) {
        return apiClient.put(`/seller/approvals/${userId}`);
    },
    addProduct(productData) {
        return apiClient.post('/seller/products', productData);
    },
    updateProduct(productId, productData) {
        return apiClient.post(`/seller/products/${productId}`, productData);
    },
    deleteProduct(productId) {
        return apiClient.delete(`/seller/products/${productId}`);
    },

    // Admin APIs
    getAllUsers() {
        return apiClient.get('/admin/users');
    },
    addUserByAdmin(userData) {
        return apiClient.post('/admin/users', userData);
    },
    updateUserByAdmin(userId, userData) {
        return apiClient.put(`/admin/users/${userId}`, userData);
    },
    deleteUserByAdmin(userId) {
        return apiClient.delete(`/admin/users/${userId}`);
    },
    //cart
    updateCartItem(productId, quantity) {
        return apiClient.put(`/cart/${productId}`, { quantity });
    },
    removeCartItem(productId) {
        return apiClient.delete(`/cart/${productId}`);
    },
    checkAvailability(field, value) {
        return apiClient.get(`/auth/check-availability`, { params: { field, value } });
    },
    findCustomer(query) {
        return apiClient.get('/seller/find-customer', { params: { query } });
    },
    sellerCheckout(payload) { // payload will be { targetUserId, cartItems }
        return apiClient.post('/seller/checkout', payload);
    },
    getSellerOrders(filters = {}) { // filters can be { userId, productId }
        return apiClient.get('/seller/orders', { params: filters });
    },
    getSellerCustomers() {
        return apiClient.get('/seller/customers');
    },
    getManageableUsers() {
        return apiClient.get('/seller/manageable-users');
    },
    updateUserBySeller(userId, userData) {
        return apiClient.put(`/seller/users/${userId}`, userData);
    },
    deleteUserBySeller(userId) {
        return apiClient.delete(`/seller/users/${userId}`);
    },
};