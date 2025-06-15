import { createRouter, createWebHistory } from 'vue-router'
import store from '../store' // <--- 1. Import store เข้ามาใช้งาน

// Import Views
import Home from '../views/Home.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  // --- Path ที่เพิ่มเข้ามา ---
  {
    path: '/cart',
    name: 'Cart',
    // Lazy loading component เพื่อประสิทธิภาพที่ดีขึ้น
    component: () => import('../views/Cart.vue'),
    meta: { requiresAuth: true, roles: ['user'] } // 3. กำหนด meta field
  },
  {
    path: '/history',
    name: 'PurchaseHistory',
    component: () => import('../views/UserPurchaseHistory.vue'),
    meta: { requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/seller/dashboard',
    name: 'SellerDashboard',
    component: () => import('../views/SellerDashboard.vue'),
    meta: { requiresAuth: true, roles: ['seller', 'admin'] }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 4. สร้าง Navigation Guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isLoggedIn = store.getters.isLoggedIn
  const userRole = store.getters.userRole
  const requiredRoles = to.meta.roles

  if (requiresAuth && !isLoggedIn) {
    // ถ้าหน้านั้นต้องการ login แต่ยังไม่ได้ login ให้ไปที่หน้า login
    next('/login')
  } else if (requiresAuth && isLoggedIn && requiredRoles && !requiredRoles.includes(userRole)) {
    // ถ้า login แล้ว แต่ role ไม่ถูกต้อง ให้ไปที่หน้าหลัก
    alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
    next('/')
  } else {
    // กรณีอื่นๆ ให้ไปที่หน้านั้นๆ ได้เลย
    next()
  }
})

export default router