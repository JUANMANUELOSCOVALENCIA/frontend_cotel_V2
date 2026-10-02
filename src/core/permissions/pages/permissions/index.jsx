// src/core/permissions/pages/permissions/index.jsx
// Permisos = recurso × acción. Se muestran como matriz; búsqueda y filtros son locales (sin recargar).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoAddOutline, IoRefreshOutline, IoKeyOutline, IoAdd, IoCheckmark } from 'react-icons/io5';
import permissionService from '../../services/permissionService';
import { usePermissions } from '../../hooks/usePermissions';
import {
    PageHeader, Card, Button, SearchInput, SelectInput, StatCard, EmptyState, Spinner, Badge,
    ACCIONES, ACCION_COLOR, cx,
} from '../../../../shared/components/ui';
import { PermisoFormModal, PermisoDetalleModal } from './permissionDialogs';

// Trae todos los permisos (el backend pagina de a 100 como máximo)
export const cargarTodosLosPermisos = async () => {
    let page = 1;
    const all = [];
    for (;;) {
        const r = await permissionService.getPermissions({ page, page_size: 100 });
        if (!r.success) return r;
        const data = r.data.results || r.data || [];
        all.push(...data);
        if (!r.data.next || !data.length) break;
        page += 1;
    }
    return { success: true, data: all };
};

const CELL_ON = {
    green: 'bg-green-50 text-green-700 ring-green-600/30 hover:bg-green-100',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/30 hover:bg-blue-100',
    amber: 'bg-amber-50 text-amber-800 ring-amber-600/30 hover:bg-amber-100',
    red: 'bg-red-50 text-red-700 ring-red-600/30 hover:bg-red-100',
};

const Permissions = () => {
    const { hasPermission, isSuperuser } = usePermissions();
    const can = useCallback((r, a) => isSuperuser || hasPermission(r, a), [isSuperuser, hasPermission]);

    const [permisos, setPermisos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [estado, setEstado] = useState('');
    const [uso, setUso] = useState('');

    const [form, setForm] = useState({ open: false, mode: 'create', permiso: null, preset: null });
    const [detalle, setDetalle] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        const r = await cargarTodosLosPermisos();
        if (r.success) setPermisos(r.data);
        else toast.error(r.error || 'Error al cargar permisos');
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const recursos = useMemo(() => [...new Set(permisos.map((p) => p.recurso))].sort(), [permisos]);

    // Filas de la matriz
    const filas = useMemo(() => {
        const q = search.trim().toLowerCase();
        const pasa = (p) =>
            (!estado || String(p.activo) === estado) &&
            (!uso || String(!!p.esta_en_uso) === uso);
        const map = {};
        permisos.forEach((p) => {
            (map[p.recurso] = map[p.recurso] || {})[p.accion] = p;
        });
        return recursos
            .filter((r) => {
                const ps = Object.values(map[r]);
                const coincide = !q || r.includes(q) || ps.some((p) => (p.descripcion || '').toLowerCase().includes(q));
                return coincide && ps.some(pasa);
            })
            .map((r) => ({ recurso: r, celdas: map[r], pasa }));
    }, [permisos, recursos, search, estado, uso]);

    const stats = useMemo(() => ({
        total: permisos.length,
        recursos: recursos.length,
        enUso: permisos.filter((p) => p.esta_en_uso).length,
        inactivos: permisos.filter((p) => !p.activo).length,
    }), [permisos, recursos]);

    const guardar = async (data) => {
        const r = form.mode === 'edit'
            ? await permissionService.updatePermission(form.permiso.id, data)
            : await permissionService.createPermission(data);
        if (!r.success) {
            toast.error(r.error || 'No se pudo guardar');
            return false;
        }
        toast.success(form.mode === 'edit' ? 'Permiso actualizado' : `Permiso ${data.recurso}:${data.accion} creado`);
        setForm({ open: false, mode: 'create', permiso: null, preset: null });
        load();
        return true;
    };

    const eliminar = async (p) => {
        const r = await permissionService.deletePermission(p.id);
        if (r.success) {
            toast.success(r.message || 'Permiso eliminado');
            setDetalle(null);
            load();
        } else {
            toast.error(r.error);
        }
    };

    const hayFiltros = search || estado || uso;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Permisos"
                subtitle="Qué acciones se pueden realizar sobre cada recurso del sistema"
                actions={
                    <>
                        <Button variant="secondary" icon={IoRefreshOutline} onClick={load} disabled={loading}>Actualizar</Button>
                        {can('permisos', 'crear') && (
                            <Button icon={IoAddOutline} onClick={() => setForm({ open: true, mode: 'create', permiso: null, preset: null })}>
                                Nuevo permiso
                            </Button>
                        )}
                    </>
                }
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Permisos" value={stats.total} />
                <StatCard label="Recursos" value={stats.recursos} />
                <StatCard label="Asignados a algún rol" value={stats.enUso} tone="text-orange-600" />
                <StatCard label="Inactivos" value={stats.inactivos} tone="text-gray-500" />
            </div>

            <Card className="p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <SearchInput className="md:col-span-2" value={search} onChange={setSearch} placeholder="Buscar recurso o descripción…" />
                    <SelectInput value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <option value="">Activos e inactivos</option>
                        <option value="true">Solo activos</option>
                        <option value="false">Solo inactivos</option>
                    </SelectInput>
                    <SelectInput value={uso} onChange={(e) => setUso(e.target.value)}>
                        <option value="">En uso y sin usar</option>
                        <option value="true">Asignados a roles</option>
                        <option value="false">Sin asignar</option>
                    </SelectInput>
                </div>
                {hayFiltros && (
                    <button type="button" onClick={() => { setSearch(''); setEstado(''); setUso(''); }} className="mt-3 text-sm font-medium text-orange-600 hover:text-orange-700">
                        Limpiar filtros
                    </button>
                )}
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Recurso</th>
                                {ACCIONES.map((a) => <th key={a} className="w-32 px-2 py-3 text-center font-semibold">{a}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !permisos.length && (
                                <tr><td colSpan={5} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>
                            )}
                            {!loading && !filas.length && (
                                <tr><td colSpan={5}><EmptyState icon={IoKeyOutline} title={permisos.length ? 'Ningún permiso coincide con los filtros' : 'Aún no hay permisos'} /></td></tr>
                            )}
                            {filas.map(({ recurso, celdas, pasa }) => (
                                <tr key={recurso} className="hover:bg-gray-50/60">
                                    <td className="px-4 py-2.5 font-mono text-[13px] font-medium text-gray-800">{recurso}</td>
                                    {ACCIONES.map((accion) => {
                                        const p = celdas[accion];
                                        if (!p) {
                                            return (
                                                <td key={accion} className="px-2 py-2 text-center">
                                                    {can('permisos', 'crear') ? (
                                                        <button
                                                            type="button"
                                                            title={`Crear ${recurso}:${accion}`}
                                                            onClick={() => setForm({ open: true, mode: 'create', permiso: null, preset: { recurso, accion } })}
                                                            className="inline-flex h-7 w-16 items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-300 hover:border-orange-400 hover:text-orange-500"
                                                        >
                                                            <IoAdd className="h-4 w-4" />
                                                        </button>
                                                    ) : <span className="text-gray-300">—</span>}
                                                </td>
                                            );
                                        }
                                        const atenuado = !pasa(p);
                                        return (
                                            <td key={accion} className="px-2 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setDetalle(p)}
                                                    title={p.descripcion || `${recurso}:${accion}`}
                                                    className={cx(
                                                        'relative inline-flex h-7 w-16 items-center justify-center rounded-md ring-1 ring-inset transition-colors',
                                                        p.activo ? CELL_ON[ACCION_COLOR[accion]] : 'bg-gray-50 text-gray-400 ring-gray-300 hover:bg-gray-100',
                                                        atenuado && 'opacity-30'
                                                    )}
                                                >
                                                    <IoCheckmark className="h-4 w-4" />
                                                    {p.esta_en_uso && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-500" />}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="inline-flex h-4 w-6 items-center justify-center rounded bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/30"><IoCheckmark className="h-3 w-3" /></span> Permiso activo</span>
                    <span className="flex items-center gap-1.5"><span className="inline-flex h-4 w-6 items-center justify-center rounded bg-gray-50 text-gray-400 ring-1 ring-inset ring-gray-300"><IoCheckmark className="h-3 w-3" /></span> Inactivo</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Asignado a algún rol</span>
                    <span className="flex items-center gap-1.5"><span className="inline-flex h-4 w-6 items-center justify-center rounded border border-dashed border-gray-300 text-gray-300"><IoAdd className="h-3 w-3" /></span> No existe (clic para crear)</span>
                    <span className="ml-auto flex gap-1">{ACCIONES.map((a) => <Badge key={a} color={ACCION_COLOR[a]}>{a}</Badge>)}</span>
                </div>
            </Card>

            <PermisoFormModal
                open={form.open}
                mode={form.mode}
                permiso={form.permiso}
                preset={form.preset}
                recursos={recursos}
                existentes={permisos}
                onClose={() => setForm({ open: false, mode: 'create', permiso: null, preset: null })}
                onSubmit={guardar}
            />
            <PermisoDetalleModal
                permiso={detalle}
                canEdit={can('permisos', 'actualizar')}
                canDelete={can('permisos', 'eliminar')}
                onClose={() => setDetalle(null)}
                onEdit={(p) => { setDetalle(null); setForm({ open: true, mode: 'edit', permiso: p, preset: null }); }}
                onDelete={eliminar}
            />
        </div>
    );
};

export default Permissions;
