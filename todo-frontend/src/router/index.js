import { route } from 'quasar/wrappers';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import routes from './routes.js';
import { getAccessToken } from '../utils/auth';

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER ? createMemoryHistory : (process.env.VITE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VITE_ROUTER_BASE),
  });

  Router.beforeEach((to, from, next) => {
    const token = getAccessToken();
    const isLoginPage = to.path === '/login' || to.path === '';

    // If on login page and already has token, go to home
    if (isLoginPage && token) {
      return next('/');
    }

    // If trying to access protected route without token, go to login
    if (to.meta.requiresAuth && !token) {
      return next('/login');
    }

    next();
  });

  return Router;
});
