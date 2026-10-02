// src/core/permissions/pages/roles/index.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
    IoAddOutline, IoRefreshOutline, IoEyeOutline, IoCreateOutline, IoEllipsisVertical,
    IoCopyOutline, IoTrashOutline, IoShieldCheckmarkOutline, IoLockClosedOutline,
    IoCheckmarkCircleOutline, IoCloseCircleOutline,
} from 'react-icons/io5';
import permissionService from '../../services/permissionService';
import { usePermissions } from '../../hooks/usePermissions';
import {
    PageHeader, Card, Button, IconButton, SearchInput, SelectInput, Badge, Dropdown, EmptyState, Spinner,
    ConfirmModal, ACCIONES, ACCION_COLOR,
} from '../../../../shared/components/ui';
import { cargarTodosLosPermisos } from '../permissions/index.jsx';
import { RoleFormModal, RoleDetalleModal } from './roleDialogs';

// Resumen de acciones que tiene el rol (cuántos permisos por acción)
const ResumenAcciones = ({ permisos }) => {
    const cuenta = ACCIONES.map((a) => [a, permisos.filter((p) => p.accion === a).length]).filter(([, n]) => n);
    if (!cuenta.length) return <span className="text-xs italic text-gray-400">Sin permisos</span>;
    return (
        <div className="flex flex-wrap gap-1">
            {cuenta.map(([a, n]) => <Badge key={a} color={ACCION_COLOR[a]}>{a} · {n}</Badge>)}
        </div>
    );
};

const Roles = () => {
    const { hasPermission, isSuperuser } = usePermissions();
    const can = useCallback((r, a) => isSuperuser || hasPermission(r, a), [isSuperuser, hasPermission]);

    const [roles, setRoles] = useState([]);
    const [permisos, setPermisos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [estado, setEstado] = useState('');

    const [form, setForm] = useState({ open: false, mode: 'create', role: null });
    const [detalle, setDetalle] = useState(null);
    const [borrar, setBorrar] = useState({ role: null, loading: false });

    const load = useCallback(async () => {
        setLoading(true);
        const [r, p] = await Promise.all([permissionService.getRoles({ page_size: 100 }), cargarTodosLosPermisos()]);
        if (r.success) setRoles(r.data.results || r.data || []);
        else toast.error(r.error || 'Error al cargar roles');
        if (p.success) setPermisos(p.data);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtrados = useMemo(() => {
        const q = search.trim().toLowerCase();
        return roles.filter((r) =>
            (!estado || String(r.activo) === estado) &&
            (!q || r.nombre.toLowerCase().includes(q) || (r.descripcion || '').toLowerCase().includes(q))
        );
    }, [roles, search, estado]);

    const guardar = async (data) => {
        const r = form.mode === 'edit'
            ? await permissionService.updateRole(form.role.id, data)
            : await permissionService.createRole(data);
        if (!r.success) {
            if (/existe un rol/i.test(r.error || '')) return 'nombre';
            toast.error(r.error || 'No se pudo guardar');
            return false;
        }
        toast.success(form.mode === 'edit' ? 'Rol actualizado' : `Rol "${data.nombre}" creado`);
        setForm({ open: false, mode: 'create', role: null });
        load();
        return true;
    };

    const cambiarEstado = async (role) => {
        const r = await permissionService.updateRole(role.id, { activo: !role.activo });
        if (r.success) {
            toast.success(`Rol ${!role.activo ? 'activado' : 'desactivado'}`);
            load();
        } else toast.error(r.error);
    };

    const eliminar = async () => {
        setBorrar((b) => ({ ...b, loading: true }));
        const r = await permissionService.deleteRole(borrar.role.id);
        setBorrar({ role: null, loading: false });
        if (r.success) {
            toast.success(r.message || 'Rol eliminado');
            load();
        } else toast.error(r.error);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Roles"
                subtitle="Agrupan permisos para asignarlos a los usuarios"
                actions={
                    <>
                        <Button variant="secondary" icon={IoRefreshOutline} onClick={load} disabled={loading}>Actualizar</Button>
                        {can('roles', 'crear') && (
                            <Button icon={IoAddOutline} onClick={() => setForm({ open: true, mode: 'create', role: null })}>Nuevo rol</Button>
                        )}
                    </>
                }
            />

            <Card className="p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <SearchInput className="md:col-span-2" value={search} onChange={setSearch} placeholder="Buscar por nombre o descripción…" />
                    <SelectInput value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <option value="">Activos e inactivos</option>
                        <option value="true">Solo activos</option>
                        <option value="false">Solo inactivos</option>
                    </SelectInput>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="border-b border-gray-200 px-4 py-3">
                    <p className="font-semibold text-gray-800">Roles <span className="font-normal text-gray-500">({filtrados.length})</span></p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Rol</th>
                                <th className="px-4 py-3 font-semibold">Permisos</th>
                                <th className="px-4 py-3 text-center font-semibold">Usuarios</th>
                                <th className="px-4 py-3 font-semibold">Estado</th>
                                <th className="w-32 px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !roles.length && (
                                <tr><td colSpan={5} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>
                            )}
                            {!loading && !filtrados.length && (
                                <tr><td colSpan={5}><EmptyState icon={IoShieldCheckmarkOutline} title={roles.length ? 'Ningún rol coincide con la búsqueda' : 'Aún no hay roles'} /></td></tr>
                            )}
                            {filtrados.map((role) => (
                                <tr key={role.id} className={`hover:bg-gray-50 ${!role.activo ? 'opacity-70' : ''}`}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => setDetalle(role)} className="font-medium text-gray-800 hover:text-orange-600">
                                                {role.nombre}
                                            </button>
                                            {role.es_sistema && <Badge color="purple"><IoLockClosedOutline className="h-3 w-3" /> Sistema</Badge>}
                                        </div>
                                        <p className="max-w-[320px] truncate text-xs text-gray-500" title={role.descripcion}>{role.descripcion || 'Sin descripción'}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="mb-1 text-xs text-gray-500">{role.cantidad_permisos} permiso(s)</p>
                                        <ResumenAcciones permisos={role.permisos || []} />
                                    </td>
                                    <td className="px-4 py-3 text-center font-medium text-gray-700">{role.cantidad_usuarios}</td>
                                    <td className="px-4 py-3">
                                        <Badge color={role.activo ? 'green' : 'gray'}>{role.activo ? 'Activo' : 'Inactivo'}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <IconButton icon={IoEyeOutline} title="Ver detalle" onClick={() => setDetalle(role)} />
                                            {can('roles', 'actualizar') && (
                                                <IconButton icon={IoCreateOutline} title="Editar" tone="primary" onClick={() => setForm({ open: true, mode: 'edit', role })} />
                                            )}
                                            <Dropdown
                                                trigger={<IconButton icon={IoEllipsisVertical} title="Más acciones" />}
                                                items={[
                                                    can('roles', 'crear') && { label: 'Duplicar', icon: IoCopyOutline, onClick: () => setForm({ open: true, mode: 'clone', role }) },
                                                    can('roles', 'actualizar') && !role.es_sistema && (role.activo
                                                        ? { label: 'Desactivar', icon: IoCloseCircleOutline, onClick: () => cambiarEstado(role) }
                                                        : { label: 'Activar', icon: IoCheckmarkCircleOutline, onClick: () => cambiarEstado(role) }),
                                                    can('roles', 'eliminar') && { divider: true },
                                                    can('roles', 'eliminar') && {
                                                        label: role.puede_eliminar ? 'Eliminar' : 'Eliminar (tiene usuarios o es del sistema)',
                                                        icon: IoTrashOutline,
                                                        danger: true,
                                                        disabled: !role.puede_eliminar,
                                                        onClick: () => setBorrar({ role, loading: false }),
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <RoleFormModal
                open={form.open}
                mode={form.mode}
                role={form.role}
                permisos={permisos}
                onClose={() => setForm({ open: false, mode: 'create', role: null })}
                onSubmit={guardar}
            />
            <RoleDetalleModal
                role={detalle}
                permisos={permisos}
                canEdit={can('roles', 'actualizar')}
                onClose={() => setDetalle(null)}
                onEdit={(role) => { setDetalle(null); setForm({ open: true, mode: 'edit', role }); }}
            />
            <ConfirmModal
                open={!!borrar.role}
                danger
                loading={borrar.loading}
                title="Eliminar rol"
                confirmText="Eliminar"
                message={<>¿Eliminar el rol <strong>{borrar.role?.nombre}</strong>? Esta acción no se puede deshacer desde esta pantalla.</>}
                onClose={() => !borrar.loading && setBorrar({ role: null, loading: false })}
                onConfirm={eliminar}
            />
        </div>
    );
};

export default Roles;
