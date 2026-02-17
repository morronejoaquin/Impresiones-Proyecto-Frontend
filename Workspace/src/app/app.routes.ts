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
import { UserEditPage } from './pages/Users/user-edit-page/user-edit-page';
import { permissionGuard } from './guards/permission-guard';
import { CartPaymentPage } from './pages/Cart/cart-payment-page/cart-payment-page';
import { OrderReceivedPage } from './pages/Cart/order-received-page/order-received-page';
import { AdminRecordPage } from './pages/Admin/admin-record-page/admin-record-page';
import { AdminDashboardComponent } from './pages/Admin/admin-dashboard/admin-dashboard.component';

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
    data: { allowedRoles: ['cliente', 'administrador'] }
  },
  {
    path: 'user-edit',
    component: UserEditPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente', 'administrador'] }
  },

  {
    path: 'make-order',
    component: MakeOrderPage,
  },
  {
    path: 'my-orders',
    component: MyOrdersPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente', 'administrador'] }
  },
  {
    path: 'make-order/:orderId',
    component: MakeOrderPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente', 'administrador'] }
  },
  {
    path: 'cart',
    component: ShowCartPage,
  },
  {
    path: 'cart-payment',
    component: CartPaymentPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente', 'administrador'] }
  },
  {
    path: 'order-received',
    component: OrderReceivedPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['cliente', 'administrador'] }
  },
  {
    path: 'price-calculator',
    component: PriceCalculatorPage
    // Ruta pública - no requiere autenticación
  },
  {
    path: 'contact',
    component: WherePage,
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/Admin/admin-page/admin-page').then(m => m.AdminPage),
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador'] }
  }, {
    path: 'admin/order/:id',
    loadComponent: () =>
      import('./pages/Admin/admin-order-detail/admin-order-detail').then(m => m.AdminOrderDetailPage),
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador'] }
  },{
    path: 'admin/prices',
    loadComponent: () =>
      import('./pages/Admin/price-admin/price-admin').then(m => m.PriceAdminComponent),
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador'] }
  },
  {
    path: 'admin/record',
    component: AdminRecordPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador']}
  },
  {
    path: 'admin/orders',
    loadComponent: () =>
      import('./pages/Admin/admin-orders/admin-orders').then(m => m.AdminOrdersComponent),
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador']}
  },
  {
    path: 'admin/history',
    loadComponent: () =>
      import('./pages/Admin/admin-history/admin-history').then(m => m.AdminHistoryComponent),
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador']}
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['administrador']}
  },
  { path: '**', redirectTo: 'home' }
];
