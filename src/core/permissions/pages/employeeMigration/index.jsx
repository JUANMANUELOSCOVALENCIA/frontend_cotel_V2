// src/core/permissions/pages/employeeMigration/index.jsx
// Migración de empleados (base externa de RR.HH.) a usuarios del sistema.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoRefreshOutline, IoPersonAddOutline, IoCloudOfflineOutline, IoPeopleOutline, IoCheckmark } from 'react-icons/io5';
import permissionService from '../../services/permissionService';
import { usePermissions } from '../../hooks/usePermissions';
import {
    PageHeader, Card, Button, SearchInput, StatCard, Pager, Badge, EmptyState, Spinner, cx,
} from '../../../../shared/components/ui';
import { MigrarModal } from './migrationDialogs';

const PAGE_SIZE = 20;

const Casilla = ({ checked, partial, onChange, title }) => (
    <button
        type="button"
        role="checkbox"
        aria-checked={partial ? 'mixed' : checked}
        title={title}
        onClick={onChange}
        className={cx(
            'inline-flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
            checked ? 'border-orange-500 bg-orange-500 text-white' : partial ? 'border-orange-400 bg-orange-100' : 'border-gray-300 bg-white hover:border-gray-400'
        )}
    >
        {checked && <IoCheckmark className="h-3.5 w-3.5" />}
        {!checked && partial && <span className="h-0.5 w-2 rounded bg-orange-500" />}
    </button>
);

const EmployeeMigration = () => {
    const { hasPermission, isSuperuser } = usePermissions();
    const puedeMigrar = isSuperuser || hasPermission('usuarios', 'crear');

    const [empleados, setEmpleados] = useState([]);
    const [count, setCount] = useState(0);
    const [stats, setStats] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [seleccion, setSeleccion] = useState({}); // persona -> empleado
    const [migrar, setMigrar] = useState(null); // lista de empleados a migrar

    const loadEmpleados = useCallback(async () => {
        setLoading(true);
        const r = await permissionService.getAvailableEmployees({ page, page_size: PAGE_SIZE, search });
        if (r.success) {
            setEmpleados(r.data.results || r.data || []);
            setCount(r.data.count ?? (r.data.results || r.data || []).length);
        } else {
            toast.error(r.error || 'Error al cargar empleados');
        }
        setLoading(false);
    }, [page, search]);

    const loadStats = useCallback(async () => {
        const r = await permissionService.getMigrationStatistics();
        if (r.success) setStats(r.data);
    }, []);

    useEffect(() => { loadEmpleados(); }, [loadEmpleados]);
    useEffect(() => {
        loadStats();
        permissionService.getRoles({ page_size: 100 }).then((r) => r.success && setRoles(r.data.results || r.data || []));
    }, [loadStats]);

    const recargar = () => { loadEmpleados(); loadStats(); };

    const seleccionados = Object.values(seleccion);
    const enPagina = empleados.filter((e) => seleccion[e.persona]).length;
    const toggle = (e) => setSeleccion((s) => {
        const n = { ...s };
        if (n[e.persona]) delete n[e.persona]; else n[e.persona] = e;
        return n;
    });
    const togglePagina = () => setSeleccion((s) => {
        const n = { ...s };
        const todos = empleados.every((e) => n[e.persona]);
        empleados.forEach((e) => { if (todos) delete n[e.persona]; else n[e.persona] = e; });
        return n;
    });

    const migrarUno = useCallback(async (empleado, rolId) => {
        const r = await permissionService.migrateEmployee({ empleado_persona: empleado.persona, rol_id: rolId });
        return r.success ? { success: true } : { success: false, error: r.error || 'Error al migrar' };
    }, []);

    const fdwOk = stats ? stats.fdw_configurado !== false : true;
    const pct = stats?.porcentaje_migrado ?? 0;
    const sinConfig = !fdwOk;

    const emptyText = useMemo(() => {
        if (search) return `Ningún empleado pendiente coincide con "${search}"`;
        return 'Todos los empleados activos ya fueron migrados';
    }, [search]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Migración de empleados"
                subtitle="Crea usuarios del sistema a partir de la base de empleados de la empresa"
                actions={<Button variant="secondary" icon={IoRefreshOutline} onClick={recargar} disabled={loading}>Actualizar</Button>}
            />

            {sinConfig && (
                <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <IoCloudOfflineOutline className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
                    <div>
                        <p className="font-semibold">La base de empleados todavía no está conectada</p>
                        <p className="mt-1 text-amber-800">
                            Esta pantalla lee la tabla <code className="rounded bg-amber-100 px-1">empleados_activos_fdw</code>, que es una conexión (FDW) a la base de RR.HH.
                            Cuando se configure, los empleados aparecerán aquí automáticamente. Mientras tanto, puedes crear usuarios manuales desde <strong>Gestión de usuarios</strong>.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Empleados activos" value={stats?.total_empleados_fdw} />
                <StatCard label="Ya migrados" value={stats?.total_migrados} tone="text-green-600" />
                <StatCard label="Pendientes" value={stats?.total_disponibles} tone="text-orange-600" />
                <Card className="p-4">
                    <p className="text-sm text-gray-500">Avance</p>
                    <p className="text-2xl font-bold text-gray-800">{pct}%</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-gray-200 p-4 md:flex-row md:items-center">
                    <SearchInput
                        className="md:w-96"
                        value={search}
                        onChange={(v) => { setPage(1); setSearch(v); }}
                        delay={350}
                        placeholder="Buscar por nombre o código COTEL"
                    />
                    {seleccionados.length > 0 && (
                        <div className="flex items-center gap-3 md:ml-auto">
                            <span className="text-sm text-gray-600"><strong className="text-gray-800">{seleccionados.length}</strong> seleccionado(s)</span>
                            <button type="button" onClick={() => setSeleccion({})} className="text-sm text-gray-500 hover:text-gray-700">Quitar selección</button>
                            {puedeMigrar && <Button icon={IoPersonAddOutline} onClick={() => setMigrar(seleccionados)}>Migrar seleccionados</Button>}
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="w-12 px-4 py-3">
                                    {puedeMigrar && empleados.length > 0 && (
                                        <Casilla
                                            checked={enPagina === empleados.length}
                                            partial={enPagina > 0 && enPagina < empleados.length}
                                            onChange={togglePagina}
                                            title="Seleccionar la página"
                                        />
                                    )}
                                </th>
                                <th className="px-4 py-3 font-semibold">Empleado</th>
                                <th className="px-4 py-3 font-semibold">Código COTEL</th>
                                <th className="px-4 py-3 font-semibold">Ingreso</th>
                                <th className="px-4 py-3 font-semibold">Estado</th>
                                <th className="w-32 px-4 py-3 text-right font-semibold">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !empleados.length && (
                                <tr><td colSpan={6} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>
                            )}
                            {!loading && !empleados.length && (
                                <tr><td colSpan={6}>
                                    <EmptyState
                                        icon={sinConfig ? IoCloudOfflineOutline : IoPeopleOutline}
                                        title={sinConfig ? 'Sin conexión con la base de empleados' : emptyText}
                                    />
                                </td></tr>
                            )}
                            {empleados.map((e) => (
                                <tr key={e.persona} className={cx('hover:bg-gray-50', seleccion[e.persona] && 'bg-orange-50/40')}>
                                    <td className="px-4 py-3">
                                        {puedeMigrar && <Casilla checked={!!seleccion[e.persona]} onChange={() => toggle(e)} />}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{e.nombre_completo}</td>
                                    <td className="px-4 py-3 font-mono text-gray-600">{e.codigocotel}</td>
                                    <td className="px-4 py-3 text-gray-600">{e.fechaingreso ? new Date(`${e.fechaingreso}T00:00`).toLocaleDateString('es-BO') : '—'}</td>
                                    <td className="px-4 py-3"><Badge color={e.esta_activo ? 'green' : 'gray'}>{e.estado_texto || (e.esta_activo ? 'Activo' : 'Inactivo')}</Badge></td>
                                    <td className="px-4 py-3 text-right">
                                        {puedeMigrar && (
                                            <Button variant="secondary" className="px-3 py-1.5" icon={IoPersonAddOutline} onClick={() => setMigrar([e])}>Migrar</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pager page={page} pageSize={PAGE_SIZE} count={count} onChange={setPage} />
            </Card>

            <MigrarModal
                open={!!migrar}
                empleados={migrar || []}
                roles={roles}
                onClose={() => setMigrar(null)}
                onMigrate={migrarUno}
                onDone={(res) => {
                    const ok = res.filter((r) => r.ok);
                    if (ok.length) toast.success(`${ok.length} empleado(s) migrado(s)`);
                    setSeleccion((s) => {
                        const n = { ...s };
                        ok.forEach((r) => delete n[r.empleado.persona]);
                        return n;
                    });
                    recargar();
                }}
            />
        </div>
    );
};

export default EmployeeMigration;
