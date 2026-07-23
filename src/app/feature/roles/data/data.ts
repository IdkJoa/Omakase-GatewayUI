import { Column } from "../../../shared/layout/interfaces/Columns";

export const ROLES_COLUMN: Column[] = [
  {name: "Nombre", field: "name", type: "text"},
  {name: "Descripción", field: "description", type: "text"},
  {name: "Usuarios en el rol", field: "userCount", type: "number"}
];
