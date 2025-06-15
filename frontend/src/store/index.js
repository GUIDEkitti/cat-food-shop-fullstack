import { createStore } from 'vuex';
import ApiService from '../services/ApiService';

export default createStore({
    // เปรียบเสมือน 'คลังข้อมูลกลาง' ของแอป
    state: {
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null,
        cart: []
    },

    // เป็นฟังก์ชันเดียวที่สามารถเปลี่ยนแปลงค่าใน state ได้โดยตรง
    mutations: {
        SET_AUTH(state, { token, user }) {
            state.token = token;
            state.user = user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        },
        CLEAR_AUTH(state) {
            state.token = null;
            state.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        SET_CART(state, cartItems) {
            state.cart = cartItems;
        },
        CLEAR_CART(state) {
            state.cart = [];
        }
    },

    // ใช้สำหรับทำงานที่ซับซ้อนหรือ Asynchronous
    actions: {
        // VVV ฟังก์ชันนี้คือตัวที่ขาดไปครับ VVV
        async login({ commit }, credentials) {
            const response = await ApiService.login(credentials);
            commit('SET_AUTH', response.data);
        },

        logout({ commit }) {
            commit('CLEAR_AUTH');
            commit('CLEAR_CART'); // เพิ่มการล้างตะกร้าตอน Logout ด้วย
        },

        async fetchCart({ commit, state }) {
            // เพิ่มเงื่อนไข && state.user?.role === 'user' เข้าไป
            if (state.token && state.user?.role === 'user') {
                try {
                    const response = await ApiService.getCart();
                    commit('SET_CART', response.data);
                } catch (error) {
                    console.error("Failed to fetch cart for user:", error);
                    commit('SET_CART', []);
                }
            }
        },

        clearCart({ commit }) {
            commit('CLEAR_CART');
        }
    },

    // ใช้สำหรับดึงข้อมูลจาก state ไปใช้งาน
    getters: {
        isLoggedIn: state => !!state.token,
        userRole: state => (state.user ? state.user.role : null),
        user: state => state.user,
        cart: state => state.cart,
        cartItemCount: state => state.cart.length
    },

    modules: {}
});