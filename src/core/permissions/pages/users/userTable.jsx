// src/core/permissions/pages/users/userTable.jsx
import React from 'react';
import {
    IoCreateOutline,
    IoEllipsisVertical,
    IoCheckmarkCircleOutline,
    IoCloseCircleOutline,
    IoKeyOutline,
    IoLockOpenOutline,
    IoTrashOutline,
    IoReloadOutline,
    IoPeopleOutline,
    IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import { Badge, IconButton, Dropdown, EmptyState, Spinner } from '../../../../shared/components/ui';

export const estadoUsuario = (u) => {
    if (u.eliminado) return { text: 'Eliminado', color: 'gray' };
    if (!u.is_active) return { text: 'Inactivo', color: 'red' };
    if (u.esta_bloqueado) return { text: 'Bloqueado', color: 'orange' };
    if (u.estado_password === 'reset_requerido') return { text: 'Reset de contraseña', color: 'amber' };
    if (u.estado_password === 'cambio_requerido') return { text: 'Debe cambiar contraseña', color: 'amber' };
    return { text: 'Activo', color: 'green' };
};

const fecha = (v) => (v ? new Date(v).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' }) : 'Nunca');

const UserTable = ({ users, roles, loading, can, onEdit, onAction, onChangeRole, emptyText }) => {
    const acciones = (u) => {
        if (u.eliminado) {
            return [can('usuarios', 'actualizar') && { label: 'Restaurar', icon: IoReloadOutline, onClick: () => onAction('restore', u) }];
        }
        const roleItems = can('usuarios', 'actualizar')
            ? [
                  { header: 'Cambiar rol' },
                  ...roles
                      .filter((r) => r.activo)
                      .map((r) => ({
                          label: r.nombre,
                          icon: IoShieldCheckmarkOutline,
                          active: r.id === u.rol_id,
                          disabled: r.id === u.rol_id,
                          onClick: () => onChangeRole(u, r),
                      })),
                  { divider: true },
              ]
            : [];
        return [
            ...roleItems,
            can('usuarios', 'actualizar') &&
                (u.is_active
                    ? { label: 'Desactivar', icon: IoCloseCircleOutline, onClick: () => onAction('deactivate', u) }
                    : { label: 'Activar', icon: IoCheckmarkCircleOutline, onClick: () => onAction('activate', u) }),
            can('usuarios', 'actualizar') && { label: 'Resetear contraseña', icon: IoKeyOutline, onClick: () => onAction('resetPassword', u) },
            can('usuarios', 'actualizar') && u.esta_bloqueado && { label: 'Desbloquear', icon: IoLockOpenOutline, onClick: () => onAction('unlock', u) },
            can('usuarios', 'eliminar') && { divider: true },
            can('usuarios', 'eliminar') && { label: 'Eliminar', icon: IoTrashOutline, danger: true, onClick: () => onAction('delete', u) },
        ];
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Usuario</th>
                        <th className="px-4 py-3 font-semibold">Rol</th>
                        <th className="px-4 py-3 font-semibold">Tipo</th>
                        <th className="px-4 py-3 font-semibold">Estado</th>
                        <th className="px-4 py-3 font-semibold">Último acceso</th>
                        <th className="w-24 px-4 py-3 text-right font-semibold">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading && users.length === 0 && (
                        <tr><td colSpan={6} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>
                    )}
                    {!loading && users.length === 0 && (
                        <tr><td colSpan={6}><EmptyState icon={IoPeopleOutline} title={emptyText} /></td></tr>
                    )}
                    {users.map((u) => {
                        const est = estadoUsuario(u);
                        return (
                            <tr key={u.id} className={`hover:bg-gray-50 ${u.eliminado ? 'opacity-60' : ''}`}>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-800">{u.nombre_completo}</p>
                                    <p className="text-xs text-gray-500">Código COTEL: {u.codigocotel}</p>
                                </td>
                                <td className="px-4 py-3">
                                    {u.rol_nombre ? <Badge color="orange">{u.rol_nombre}</Badge> : <span className="text-xs italic text-gray-400">Sin rol</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge color={u.tipo_usuario === 'manual' ? 'gray' : 'blue'}>{u.tipo_usuario === 'manual' ? 'Manual' : 'Migrado'}</Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge color={est.color}>{est.text}</Badge>
                                    {u.intentos_login_fallidos > 0 && !u.eliminado && (
                                        <p className="mt-1 text-xs text-red-600">{u.intentos_login_fallidos} intento(s) fallido(s)</p>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{fecha(u.last_login)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        {!u.eliminado && can('usuarios', 'actualizar') && (
                                            <IconButton icon={IoCreateOutline} title="Editar" tone="primary" onClick={() => onEdit(u)} />
                                        )}
                                        <Dropdown trigger={<IconButton icon={IoEllipsisVertical} title="Más acciones" />} items={acciones(u)} />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
