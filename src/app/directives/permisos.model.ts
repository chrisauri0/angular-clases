export const PermisoTicket = [
 "tickets:ver",
 "tickets:crear",
 "tickets:editar",
 "tickets:eliminar"

];

export const PermisoGrupo = [
    "grupos:ver",
    "grupos:crear",
    "grupos:editar",
    "grupos:eliminar"
];

export const PermisoUsuario = [
    "usuarios:ver",
    "usuarios:crear",
    "usuarios:editar",
    "usuarios:eliminar"
];

export const PermisoBase = [
    "tickets:ver",
    "grupos:ver",
    "usuarios:ver",
    "usuarios:editar",
    "tickets:crear",
];

export const PermisoAdmin = [
    ...PermisoTicket,
    ...PermisoGrupo,
    ...PermisoUsuario
];

