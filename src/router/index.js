import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import OrdersView from '../views/OrdersView.vue';
import NftView from '../views/NftView.vue';
import TeamView from '../views/TeamView.vue';
import AdminPerformanceView from '../views/AdminPerformanceView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import { walletState } from '../services/wallet';
import { ADMIN_PERFORMANCE_ALLOWED_ADDRESSES } from '../services/environment';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/orders',
    name: 'Orders',
    component: OrdersView,
  },
  {
    path: '/nft',
    name: 'NFT',
    component: NftView,
  },
  {
    path: '/team',
    name: 'Team',
    component: TeamView,
  },
  {
    path: '/admin-performance',
    name: 'AdminPerformance',
    component: AdminPerformanceView,
    beforeEnter: (to, from, next) => {
      const address = walletState.address?.toLowerCase();
      if (address && ADMIN_PERFORMANCE_ALLOWED_ADDRESSES.includes(address)) {
        next();
        return;
      }
      next('/404');
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

export default router;
