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
    IoCubeOutline,
    IoArchiveOutline,
    IoWifiOutline,
    IoReturnDownBackOutline,
    IoClipboardOutline,
    IoFlaskOutline,
    IoDocumentTextOutline,
} from 'react-icons/io5';

const ALMACEN_LEER = [{ recurso: 'almacenes', accion: 'leer' }];

export const navItems = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: IoHomeOutline,
    },
    {
        label: 'Usuarios',
        icon: IoPeopleOutline,
        permissions: [
            { recurso: 'usuarios', accion: 'leer' },
            { recurso: 'roles', accion: 'leer' },
            { recurso: 'permisos', accion: 'leer' },
            { recurso: 'logs', accion: 'leer' },
        ],
        children: [
            { label: 'Gestión de usuarios', href: '/usuarios/usuarios', icon: IoPersonOutline, permissions: [{ recurso: 'usuarios', accion: 'leer' }] },
            { label: 'Roles', href: '/usuarios/roles', icon: IoShieldCheckmarkOutline, permissions: [{ recurso: 'roles', accion: 'leer' }] },
            { label: 'Permisos', href: '/usuarios/permisos', icon: IoKeyOutline, permissions: [{ recurso: 'permisos', accion: 'leer' }] },
            { label: 'Migración', href: '/usuarios/migracion', icon: IoPersonAddOutline, permissions: [{ recurso: 'usuarios', accion: 'leer' }] },
            { label: 'Auditoría', href: '/usuarios/auditoria', icon: IoReceiptOutline, permissions: [{ recurso: 'logs', accion: 'leer' }] },
        ],
    },
    {
        label: 'Almacenes',
        icon: IoStorefrontOutline,
        permissions: ALMACEN_LEER,
        children: [
            { section: 'Catálogos' },
            { label: 'Proveedores', href: '/almacenes/proveedores', icon: IoBusinessOutline, permissions: ALMACEN_LEER },
            { label: 'Marcas', href: '/almacenes/marcas', icon: IoPricetagOutline, permissions: ALMACEN_LEER },
            { label: 'Modelos', href: '/almacenes/modelos', icon: IoHardwareChipOutline, permissions: ALMACEN_LEER },
            { label: 'Almacenes', href: '/almacenes/almacen', icon: IoCubeOutline, permissions: ALMACEN_LEER },
            { section: 'Operación' },
            { label: 'Lotes', href: '/almacenes/lotes', icon: IoArchiveOutline, permissions: ALMACEN_LEER },
            { label: 'Equipos ONU', href: '/almacenes/onus', icon: IoWifiOutline, permissions: ALMACEN_LEER },
            { label: 'Devoluciones', href: '/devoluciones/devoluciones', icon: IoReturnDownBackOutline, permissions: ALMACEN_LEER },
            { label: 'Materiales', href: '/materiales/materiales', icon: IoClipboardOutline, permissions: ALMACEN_LEER },
        ],
    },
    {
        label: 'Laboratorio',
        href: '/laboratorio/laboratorio',
        icon: IoFlaskOutline,
        permissions: [{ recurso: 'laboratorio', accion: 'leer' }],
    },
    {
        label: 'Solicitudes',
        href: '/solicitudes/nueva',
        icon: IoDocumentTextOutline,
        permissions: [{ recurso: 'usuarios', accion: 'leer' }],
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
