import { Column } from "../../../shared/layout/interfaces/Columns";


export const Services_Columns: Column[] = [
  {name: "Nombre", field: "name", type: "text"},
  {name: "URL del Servicio", field: "upstreamUrl", type: "text"},
  {name: "Autenticación", field: "requiresAuth", type: "boolean"},
  {name: "Activo", field: "isActive", type: "boolean"},
  {name: "Politicas asociados", field: "associatedPoliciesCount", type: "number"},
]
