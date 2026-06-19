import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: "",
    loadChildren: () => import("./shared/layout/layout.routes").then((m) => m.LayoutRoutes)
  }
];
