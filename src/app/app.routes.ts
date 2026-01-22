import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default redirect to Purchase Orders (home)
  {
    path: '',
    redirectTo: 'purchase-orders',
    pathMatch: 'full',
  },

  // Purchase Orders routes (Home)
  {
    path: 'purchase-orders',
    loadComponent: () =>
      import('./features/purchase-orders/components/purchase-orders-list.component').then(
        (m) => m.PurchaseOrdersListComponent
      ),
  },
  {
    path: 'purchase-orders/new',
    loadComponent: () =>
      import('./features/purchase-orders/components/purchase-order-form.component').then(
        (m) => m.PurchaseOrderFormComponent
      ),
  },
  {
    path: 'purchase-orders/:id',
    loadComponent: () =>
      import('./features/purchase-orders/components/purchase-order-detail.component').then(
        (m) => m.PurchaseOrderDetailComponent
      ),
  },
  {
    path: 'purchase-orders/:id/edit',
    loadComponent: () =>
      import('./features/purchase-orders/components/purchase-order-form.component').then(
        (m) => m.PurchaseOrderFormComponent
      ),
  },

  // Redirect old part-numbers routes to admin
  {
    path: 'part-numbers',
    redirectTo: 'admin/part-numbers',
    pathMatch: 'full',
  },
  {
    path: 'part-numbers/**',
    redirectTo: 'admin/part-numbers',
  },

  // Admin routes
  {
    path: 'admin/part-numbers',
    loadComponent: () =>
      import('./features/admin/components/admin-part-numbers.component').then(
        (m) => m.AdminPartNumbersComponent
      ),
  },
  {
    path: 'admin/part-numbers/:id',
    loadComponent: () =>
      import('./features/part-numbers/components/part-number-detail.component').then(
        (m) => m.PartNumberDetailComponent
      ),
  },
  {
    path: 'admin/cedis',
    loadComponent: () =>
      import('./features/admin/cedis/cedis-list.component').then((m) => m.CedisListComponent),
  },
  {
    path: 'admin/locations',
    loadComponent: () =>
      import('./features/admin/locations/locations-list.component').then(
        (m) => m.LocationsListComponent
      ),
  },
  {
    path: 'admin/inventory',
    loadComponent: () =>
      import('./features/admin/inventory/inventory-management.component').then(
        (m) => m.InventoryManagementComponent
      ),
  },

  // Fallback route
  {
    path: '**',
    redirectTo: 'purchase-orders',
  },
];
