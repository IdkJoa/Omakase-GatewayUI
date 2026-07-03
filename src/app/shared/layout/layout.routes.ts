import { Routes } from "@angular/router";


export const LayoutRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./components/layout.component/layout.component"),
    children: [
      {
        path: "dashboard",
        loadComponent: () => import("../../feature/dashboard/components/dashboard.component/dashboard.component")
          .then(m => m.DashboardComponent)
      },
      {
        path: "audit-forense",
        loadComponent: () => import("../../feature/audit forense/components/audit-forense.component/audit-forense.component")
          .then(m => m.AuditForenseComponent)
      },
      {
        path: "policies",
        loadComponent: () => import("../../feature/policies/components/policies.component/policies.component")
          .then(m => m.PoliciesComponent)
      },
      {
        path: "profile-devices",
        loadComponent: () => import("../../feature/profile devices/components/profile-devices.component/profile-devices.component")
          .then(m => m.ProfileDevicesComponent)
      },
      {
        path: "services-inventory",
        loadComponent: () => import("../../feature/services inventory/components/services-inventory.component/services-inventory.component")
          .then(m => m.ServicesInventoryComponent)
      },
      {
        path: "roles",
        loadComponent: () => import('../../feature/roles/component/roles.component/roles.component').then(m => m.RolesComponent)
      },
      {
        path: "**",
        redirectTo: "dashboard"
      }
    ]
  },
]
