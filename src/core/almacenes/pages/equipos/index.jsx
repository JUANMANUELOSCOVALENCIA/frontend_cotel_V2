// src/core/almacenes/pages/equipos/index.jsx
// Equipos ONU: inventario de equipos con serie (GPON, MAC, D-SN).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoRefreshOutline, IoWifiOutline, IoEyeOutline } from 'react-icons/io5';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { useOpcionesCompletas } from '../../hooks/useAlmacenes';
import { PageHeader, Card, Button, IconButton, SearchInput, SelectInput, EmptyState, Spinner, Pager, cx } from '../../../../shared/components/ui';
import inventarioService from '../../services/inventarioService';
import MaterialDetalleModal from './MaterialDetalleModal';
import { EstadoMaterialBadge, COLOR_ESTADO_MATERIAL } from './inventarioUi';
import { fecha } from '../lotes/loteUi';

const PAGE_SIZE = 20;
const CHIP = {
    green: 'border-green-200 bg-green-50 text-green-700', blue: 'border-blue-200 bg-blue-50 text-blue-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700', amber: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-red-200 bg-red-50 text-red-700', orange: 'border-orange-200 bg-orange-50 text-orange-700',
    gray: 'border-gray-200 bg-gray-50 text-gray-600',
};

const EquiposONU = () => {
    const { hasPermission } = usePermissions();
    const puedeEditar = hasPermission('materiales', 'actualizar');
    const { opciones } = useOpcionesCompletas();

    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [f, setF] = useState({ search: '', estado_onu: '', almacen_actual: '', modelo: '' });
    const [detalle, setDetalle] = useState(null);

    const estados = opciones.estados_material_onu || [];
    const modelosONU = useMemo(() => (opciones.modelos || []).filter((m) => m.tipo_material_info?.es_unico), [opciones.modelos]);

    const cargar = useCallback(async () => {
        setLoading(true);
        const base = { tipo_material: 'ONU', search: f.search, almacen_actual: f.almacen_actual, modelo: f.modelo };
        const [r, s] = await Promise.all([
            inventarioService.listar({ ...base, estado_onu: f.estado_onu, page, page_size: PAGE_SIZE }),
            inventarioService.estadisticas(base),
        ]);
        setLoading(false);
        if (r.success) { setItems(r.data.results || []); setCount(r.data.count || 0); }
        else toast.error(r.error);
        if (s.success) setStats(s.data);
    }, [f, page]);

    useEffect(() => { cargar(); }, [cargar]);
    const setFiltro = (k) => (v) => { setPage(1); setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v })); };

    // Contadores por estado (para los botones de filtro rápido)
    const chips = estados
        .map((e) => ({ ...e, n: stats?.por_estado?.[e.nombre] || 0 }))
        .filter((e) => e.n > 0 || String(e.id) === f.estado_onu);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Equipos ONU"
                subtitle="Inventario de equipos con serie: dónde están y en qué estado"
                actions={<Button variant="secondary" icon={IoRefreshOutline} onClick={cargar} disabled={loading}>Actualizar</Button>}
            />

            <Card className="space-y-3 p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <SearchInput className="lg:flex-1" value={f.search} onChange={setFiltro('search')} delay={400} placeholder="GPON, MAC, D-SN, código interno o lote" />
                    <SelectInput className="lg:w-52" value={f.almacen_actual} onChange={setFiltro('almacen_actual')}>
                        <option value="">Todos los almacenes</option>
                        {(opciones.almacenes || []).map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </SelectInput>
                    <SelectInput className="lg:w-52" value={f.modelo} onChange={setFiltro('modelo')}>
                        <option value="">Todos los modelos</option>
                        {modelosONU.map((m) => <option key={m.id} value={m.id}>{m.marca_info?.nombre} {m.nombre}</option>)}
                    </SelectInput>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setFiltro('estado_onu')('')}
                        className={cx('rounded-full border px-3 py-1 text-sm', !f.estado_onu ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}
                    >
                        Todos <strong>{stats?.total ?? '—'}</strong>
                    </button>
                    {chips.map((e) => {
                        const activo = String(e.id) === f.estado_onu;
                        return (
                            <button
                                key={e.id}
                                type="button"
                                onClick={() => setFiltro('estado_onu')(activo ? '' : String(e.id))}
                                className={cx('rounded-full border px-3 py-1 text-sm', CHIP[COLOR_ESTADO_MATERIAL[e.codigo] || 'gray'], activo && 'ring-2 ring-offset-1 ring-gray-800')}
                            >
                                {e.nombre} <strong>{e.n}</strong>
                            </button>
                        );
                    })}
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Equipo</th>
                                <th className="px-4 py-3 font-semibold">Modelo</th>
                                <th className="px-4 py-3 font-semibold">Almacén</th>
                                <th className="px-4 py-3 font-semibold">Lote</th>
                                <th className="px-4 py-3 font-semibold">Estado</th>
                                <th className="w-16 px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !items.length && (
                                <tr><td colSpan={6} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>
                            )}
                            {!loading && !items.length && (
                                <tr><td colSpan={6}><EmptyState icon={IoWifiOutline} title={count === 0 && !f.search && !f.estado_onu ? 'Aún no hay equipos' : 'Ningún equipo coincide con los filtros'} /></td></tr>
                            )}
                            {items.map((m) => (
                                <tr key={m.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setDetalle(m.id)}>
                                    <td className="px-4 py-3">
                                        <p className="font-mono font-medium text-gray-800">{m.gpon_serial || '—'}</p>
                                        <p className="font-mono text-xs text-gray-500">{m.mac_address}{m.serial_manufacturer ? ` · ${m.serial_manufacturer}` : ''}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{m.modelo_info?.marca} {m.modelo_info?.nombre}</td>
                                    <td className="px-4 py-3 text-gray-700">{m.almacen_info?.nombre}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-gray-700">{m.lote_info?.numero_lote}</p>
                                        <p className="text-xs text-gray-500">{fecha(m.created_at)}</p>
                                    </td>
                                    <td className="px-4 py-3"><EstadoMaterialBadge estado={m.estado_display} /></td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <IconButton icon={IoEyeOutline} title="Ver ficha" onClick={() => setDetalle(m.id)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pager page={page} pageSize={PAGE_SIZE} count={count} onChange={setPage} />
            </Card>

            <MaterialDetalleModal
                open={!!detalle}
                materialId={detalle}
                estados={estados}
                puedeEditar={puedeEditar}
                onClose={() => setDetalle(null)}
                onCambio={cargar}
            />
        </div>
    );
};

export default EquiposONU;
