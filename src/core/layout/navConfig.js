// src/core/layout/navConfig.js
// Menú principal del sistema. Para agregar una pantalla nueva, agrégala aquí.
import {
    IoHomeOutline,
    IoPeopleOutline,
    IoPersonOutline,
    IoShieldCheckmarkOutline,
    IoKeyOutline,
    IoPersonAddOutline,
    IoReceiptOutline,
    IoStorefrontOutline,
    IoBusinessOutline,
    IoPricetagOutline,
    IoHardwareChipOutline,
    IoExtensionPuzzleOutline,
    IoCubeOutline,
    IoArchiveOutline,
    IoWifiOutline,
    IoSwapHorizontalOutline,
    IoReturnDownBackOutline,
    IoClipboardOutline,
    IoFlaskOutline,
    IoDocumentTextOutline,
    IoBriefcaseOutline,
    IoConstructOutline,
    IoMapOutline,
    IoPricetagsOutline,
    IoPeopleCircleOutline,
    IoCalendarOutline,
    IoCarOutline,
    IoPhonePortraitOutline,
} from 'react-icons/io5';

// Cada pantalla se muestra si el rol puede LEER su recurso (el backend valida igual)
const leer = (...recursos) => recursos.map((recurso) => ({ recurso, accion: 'leer' }));

export const navItems = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: IoHomeOutline,
    },
    {
        // App de campo: la ve quien tiene el permiso `campo` (rol Técnico)
        label: 'Mis trabajos',
        href: '/campo',
        icon: IoPhonePortraitOutline,
        permissions: leer('campo'),
    },
    {
        label: 'Usuarios',
        icon: IoPeopleOutline,
        permissions: [
            { recurso: 'usuarios', accion: 'leer' },
            { recurso: 'roles', accion: 'leer' },
            { recurso: 'permisos', accion: 'leer' },
            { recurso: 'logs', accion: 'leer' },
            { recurso: 'migraciones', accion: 'leer' },
        ],
        children: [
            { label: 'Gestión de usuarios', href: '/usuarios/usuarios', icon: IoPersonOutline, permissions: [{ recurso: 'usuarios', accion: 'leer' }] },
            { label: 'Roles', href: '/usuarios/roles', icon: IoShieldCheckmarkOutline, permissions: [{ recurso: 'roles', accion: 'leer' }] },
            { label: 'Permisos', href: '/usuarios/permisos', icon: IoKeyOutline, permissions: [{ recurso: 'permisos', accion: 'leer' }] },
            { label: 'Migración', href: '/usuarios/migracion', icon: IoPersonAddOutline, permissions: [{ recurso: 'migraciones', accion: 'leer' }] },
            { label: 'Auditoría', href: '/usuarios/auditoria', icon: IoReceiptOutline, permissions: [{ recurso: 'logs', accion: 'leer' }] },
        ],
    },
    {
        label: 'Almacenes',
        icon: IoStorefrontOutline,
        permissions: leer('proveedores', 'marcas', 'modelos', 'componentes', 'almacenes', 'lotes', 'materiales'),
        children: [
            { section: 'Catálogos' },
            { label: 'Proveedores', href: '/almacenes/proveedores', icon: IoBusinessOutline, permissions: leer('proveedores') },
            { label: 'Marcas', href: '/almacenes/marcas', icon: IoPricetagOutline, permissions: leer('marcas') },
            { label: 'Modelos', href: '/almacenes/modelos', icon: IoHardwareChipOutline, permissions: leer('modelos') },
            { label: 'Componentes', href: '/almacenes/componentes', icon: IoExtensionPuzzleOutline, permissions: leer('componentes') },
            { label: 'Almacenes', href: '/almacenes/almacen', icon: IoCubeOutline, permissions: leer('almacenes') },
            { section: 'Operación' },
            { label: 'Lotes', href: '/almacenes/lotes', icon: IoArchiveOutline, permissions: leer('lotes') },
            { label: 'Equipos ONU', href: '/almacenes/onus', icon: IoWifiOutline, permissions: leer('materiales') },
            { label: 'Traspasos', href: '/almacenes/traspasos', icon: IoSwapHorizontalOutline, permissions: leer('traspasos') },
            { label: 'Garantías', href: '/devoluciones/devoluciones', icon: IoReturnDownBackOutline, permissions: leer('materiales') },
            { label: 'Materiales', href: '/materiales/materiales', icon: IoClipboardOutline, permissions: leer('materiales') },
        ],
    },
    {
        label: 'Laboratorio',
        href: '/laboratorio/laboratorio',
        icon: IoFlaskOutline,
        permissions: [{ recurso: 'laboratorio', accion: 'leer' }],
    },
    {
        label: 'Operaciones',
        icon: IoBriefcaseOutline,
        permissions: leer('solicitudes', 'ordenes', 'clientes', 'cobertura', 'planes', 'cuadrillas'),
        children: [
            { label: 'Solicitudes', href: '/operaciones/solicitudes', icon: IoDocumentTextOutline, permissions: leer('solicitudes') },
            { label: 'Órdenes de trabajo', href: '/operaciones/ordenes', icon: IoConstructOutline, permissions: leer('ordenes') },
            { label: 'Programación', href: '/operaciones/programacion', icon: IoCalendarOutline, permissions: leer('ordenes') },
            { label: 'Clientes', href: '/operaciones/clientes', icon: IoPeopleCircleOutline, permissions: leer('clientes', 'solicitudes') },
            { section: 'Configuración' },
            { label: 'Cobertura', href: '/operaciones/cobertura', icon: IoMapOutline, permissions: leer('cobertura') },
            { label: 'Cuadrillas', href: '/operaciones/cuadrillas', icon: IoCarOutline, permissions: leer('cuadrillas') },
            { label: 'Planes', href: '/operaciones/planes', icon: IoPricetagsOutline, permissions: leer('planes') },
        ],
    },
];

// Busca el título de la ruta actual (para la barra superior)
export const findRouteInfo = (pathname) => {
    for (const item of navItems) {
        if (item.href === pathname) return { title: item.label, parent: null };
        for (const child of item.children || []) {
            if (child.href === pathname) return { title: child.label, parent: item.label };
        }
    }
    const extras = {
        '/profile': { title: 'Mi perfil', parent: null },
        '/change-password': { title: 'Cambiar contraseña', parent: null },
    };
    return extras[pathname] || { title: '', parent: null };
};
