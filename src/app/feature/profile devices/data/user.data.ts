import { Column } from "../../../shared/layout/interfaces/Columns";

export const column: Column[] = [
  {name: "Username", field: "username", type: "text"},
  {name: "Tipo de usuario", field: "userType", type: "text"},
  {name: "Estado", field: "isActive", type: "text"},
  {name: "Roles", field: "roles", type: "text"},
  {name: "Intentos Fallidos", field: "failedAttempts", type: "number"},
  {name: "Ultimo acceso", field: "behaviorProfile", type: "text"},
];
