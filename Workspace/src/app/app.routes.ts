import { Routes } from '@angular/router';
import { HomePage } from './pages/AboutUs/home-page/home-page';
import { MakeOrderPage } from './pages/Orders/make-order-page/make-order-page';
import { MyOrdersPage } from './pages/Orders/my-orders-page/my-orders-page';
import { PriceCalculatorPage } from './pages/AboutUs/price-calculator-page/price-calculator-page';
import { WherePage } from './pages/AboutUs/where-page/where-page';
import { ShowCartPage } from './pages/Cart/show-cart-page/show-cart-page';
import { UserLoginPage } from './pages/Users/user-login-page/user-login-page';
import { UserRegisterPage } from './pages/Users/user-register-page/user-register-page';
import { AccountPage } from './pages/Users/account-page/account-page';
import { permissionGuard } from './guards/permission-guard';
import { CartPaymentPage } from './pages/Cart/cart-payment-page/cart-payment-page';
import { OrderReceivedPage } from './pages/Cart/order-received-page/order-received-page';
import { AdminRecordPage } from './pages/Admin/admin-record-page/admin-record-page';
import { AdminDashboardComponent } from './pages/Admin/admin-dashboard/admin-dashboard.component';
import { PaymentReconciliationComponent } from './pages/Admin/payment-reconciliation/payment-reconciliation';
import { PriceHistoryAdmin } from './pages/Admin/price-history-admin/price-history-admin';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'user-login', component: UserLoginPage },
  { path: 'user-register', component: UserRegisterPage },

  {
    path: 'home',
    component: HomePage,
  },
  {
    path: 'account',
    component: AccountPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente', 'administrador'] },
  },
  {
    path: 'make-order',
    component: MakeOrderPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente'] },
  },
  {
    path: 'my-orders',
    component: MyOrdersPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente'] },
  },
  {
    path: 'my-orders/:id',
    component: MyOrdersPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente'] },
  },
  {
    path: 'make-order/:orderId',
    component: MakeOrderPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente'] },
  },
  {
    path: 'cart',
    component: ShowCartPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente'] },
  },
  {
    path: 'cart-payment',
    component: CartPaymentPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente'] },
  },
  {
    path: 'order-received',
    component: OrderReceivedPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente'] },
  },
  {
    path: 'price-calculator',
    component: PriceCalculatorPage,
    // Ruta pública - no requiere autenticación
  },
  {
    path: 'contact',
    component: WherePage,
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/Admin/admin-page/admin-page').then((m) => m.AdminPage),
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador'] },
  },
  {
    path: 'admin/order/:id',
    loadComponent: () =>
      import('./pages/Admin/admin-order-detail/admin-order-detail').then(
        (m) => m.AdminOrderDetailPage,
      ),
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador'] },
  },
  {
    path: 'admin/prices',
    loadComponent: () =>
      import('./pages/Admin/price-admin/price-admin').then((m) => m.PriceAdminComponent),
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador'] },
  },
  {
    path: 'admin/prices-history',
    component: PriceHistoryAdmin,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador'] },
  },
  {
    path: 'admin/record',
    component: AdminRecordPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador'] },
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador'] },
  },
  {
    path: 'admin/reconciliation',
    component: PaymentReconciliationComponent,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador'] },
  },
  { path: '**', redirectTo: 'home' },
];
