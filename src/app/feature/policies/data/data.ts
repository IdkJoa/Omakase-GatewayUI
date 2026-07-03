import { Column } from "../../../shared/layout/interfaces/Columns";

export const Policies_Columns: Column[] = [
  { name: "Nombre", field: "name", type: "string" },
  { name: "Tipo", field: "type", type: "string" },
  { name: "Peso", field: "weigth", type: "number" },
  { name: "Condicion", field: "config", type: "string" },
  { name: "Creado por", field: "createdByUsername", type: "string" },
];
