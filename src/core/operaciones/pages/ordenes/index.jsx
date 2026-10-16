// src/core/operaciones/pages/ordenes/index.jsx
// Órdenes de trabajo generadas desde las solicitudes.
import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IoRefreshOutline, IoConstructOutline, IoDownloadOutline } from 'react-icons/io5';
import { useUser } from '../../../auth/hooks/useAuth';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { PageHeader, Card, Button, StatCard, SearchInput, SelectInput, EmptyState, Spinner, Pager, cx } from '../../../../shared/components/ui';
import { cuadrillasService, ordenesService, zonasService } from '../../services/operacionesService';
import { TIPOS, EstadoOT, Prioridad, PlazoChip, ZonaChip, fechaCorta, serviciosTexto } from '../../components/opUi';
import OrdenModal from './OrdenModal';
import { traerTodo, reporteListado, fecha } from '../../components/pdf';

const PAGE_SIZE = 20;
const ABIERTAS = 'PENDIENTE,PROGRAMADA,EN_CAMPO,EJECUTADA,NO_EJECUTADA,VERIFICADA';
const TABS = [
    { id: 'abiertas', label: 'Abiertas', estado: ABIERTAS },
    { id: 'cerradas', label: 'Cerradas', estado: 'CERRADA' },
    { id: 'anuladas', label: 'Anuladas', estado: 'ANULADA' },
];

const Ordenes = () => {
    const { hasPermission } = usePermissions();
    const [tab, setTab] = useState('abiertas');
    const [resumen, setResumen] = useState(null);
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [params] = useSearchParams();
    // plazo: '' | 'vencidas' | 'por_vencer' (plazo ATT; se puede abrir desde el aviso de Programación)
    const [f, setF] = useState({ search: '', tipo: '', zona: '', cuadrilla: '', plazo: params.get('plazo') || '' });
    const [zonas, setZonas] = useState([]);
    const [cuadrillas, setCuadrillas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [abierta, setAbierta] = useState(null);
    const [exportando, setExportando] = useState(false);
    const { fullName } = useUser();

    useEffect(() => {
        zonasService.listar().then((r) => r.success && setZonas(r.data));
        cuadrillasService.listar().then((r) => r.success && setCuadrillas(r.data));
    }, []);

    const cargar = useCallback(async () => {
        setLoading(true);
        const estado = TABS.find((t) => t.id === tab).estado;
        const [r, s] = await Promise.all([
            ordenesService.listar({ ...f, estado, page, page_size: PAGE_SIZE }),
            ordenesService.resumen(),
        ]);
        setLoading(false);
        if (r.success) { setItems(r.data.results || []); setCount(r.data.count || 0); } else toast.error(r.error);
        if (s.success) setResumen(s.data);
    }, [f, page, tab]);
    useEffect(() => { cargar(); }, [cargar]);

    const setFiltro = (k) => (v) => { setPage(1); setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v })); };
    const exportar = async () => {
        setExportando(true);
        const t = TABS.find((x) => x.id === tab);
        const r = await traerTodo(ordenesService.listar, { ...f, estado: t.estado });
        setExportando(false);
        if (!r.success) { toast.error(r.error); return; }
        if (!r.data.length) { toast.error('No hay órdenes para exportar con estos filtros.'); return; }
        const filtros = [
            `Órdenes ${t.label.toLowerCase()}`,
            f.tipo && `Tipo: ${TIPOS.find((x) => x.codigo === f.tipo)?.corto}`,
            f.zona && `Zona: ${zonas.find((z) => String(z.id) === String(f.zona))?.nombre}`,
            f.cuadrilla && `Cuadrilla: ${cuadrillas.find((c) => String(c.id) === String(f.cuadrilla))?.nombre}`,
            f.plazo && `Plazo ATT: ${f.plazo === 'vencidas' ? 'vencidas' : 'por vencer'}`,
            f.search && `Búsqueda: "${f.search}"`,
        ].filter(Boolean).join('  ·  ');
        reporteListado({
            titulo: 'Reporte de órdenes de trabajo',
            filtros,
            usuario: fullName,
            filas: r.data,
            archivo: 'ordenes_trabajo',
            anchos: { 'Nº OT': 100, Creada: 60, 'Días': 35, Estado: 75 },
            columnas: [
                { titulo: 'Nº OT', valor: (o) => `${o.numero}\nSol. ${o.solicitud.numero}` },
                { titulo: 'Creada', valor: (o) => fecha(o.created_at) },
                { titulo: 'Trabajo', valor: (o) => [o.tipo.nombre + (o.prioridad === 'ALTA' ? ' (URGENTE)' : ''), o.solicitud.plan && `${o.solicitud.plan} · ${serviciosTexto(o.solicitud.servicios)}`].filter(Boolean).join('\n') },
                { titulo: 'Cliente', valor: (o) => `${o.cliente.nombre}\n${o.cliente.telefono || ''}` },
                { titulo: 'Dirección / zona', valor: (o) => `${o.solicitud.direccion}\n${o.zona?.nombre || 'Sin zona'}` },
                { titulo: 'Días', valor: (o) => String(o.dias) },
                { titulo: 'Plazo ATT', valor: (o) => ({ EN_PLAZO: 'En plazo', POR_VENCER: 'Por vencer', VENCIDA: 'Vencida', CUMPLIDO: 'Cumplido', INCUMPLIDO: 'Fuera de plazo' }[o.plazo?.estado] || '—') },
                { titulo: 'Estado', valor: (o) => [o.estado.nombre, o.fecha_programada && `${fecha(o.fecha_programada)}${o.cuadrilla ? ` · ${o.cuadrilla.nombre}` : ''}`].filter(Boolean).join('\n') },
            ],
            resumenes: [
                { titulo: 'Por estado', clave: (o) => o.estado.nombre },
                { titulo: 'Por tipo de trabajo', clave: (o) => o.tipo.nombre },
                { titulo: 'Por plazo ATT', clave: (o) => ({ EN_PLAZO: 'En plazo', POR_VENCER: 'Por vencer', VENCIDA: 'Vencida', CUMPLIDO: 'Cumplido', INCUMPLIDO: 'Fuera de plazo' }[o.plazo?.estado] || 'Sin plazo') },
                { titulo: 'Por zona', clave: (o) => o.zona?.nombre || 'Sin zona' },
                { titulo: 'Por cuadrilla', clave: (o) => o.cuadrilla?.nombre || 'Sin cuadrilla' },
            ],
        });
    };
    const abiertasN = resumen ? ABIERTAS.split(',').reduce((s, e) => s + (resumen[e] || 0), 0) : null;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Órdenes de trabajo"
                subtitle="Trabajos de campo generados desde las solicitudes. Urgentes primero, luego las más antiguas."
                actions={(
                    <>
                        <Button variant="secondary" icon={IoRefreshOutline} onClick={cargar} disabled={loading}>Actualizar</Button>
                        <Button variant="secondary" icon={IoDownloadOutline} onClick={exportar} loading={exportando} disabled={!count}>Exportar PDF</Button>
                    </>
                )}
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {/* No ejecutadas vuelven a programarse; no se verifican */}
                <StatCard label="Por programar" value={resumen ? (resumen.PENDIENTE || 0) + (resumen.NO_EJECUTADA || 0) : null} tone={resumen?.PENDIENTE || resumen?.NO_EJECUTADA ? 'text-amber-600' : 'text-gray-800'} />
                <StatCard label="Urgentes abiertas" value={resumen?.urgentes} tone={resumen?.urgentes ? 'text-red-600' : 'text-gray-800'} />
                <StatCard label="Programadas / en campo" value={resumen ? (resumen.PROGRAMADA || 0) + (resumen.EN_CAMPO || 0) : null} />
                <StatCard label="Por verificar" value={resumen?.EJECUTADA} />
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                    {TABS.map((t) => (
                        <button key={t.id} type="button" onClick={() => { setTab(t.id); setPage(1); }}
                            className={cx('flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium', tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                            {t.label}
                            {t.id === 'abiertas' && abiertasN > 0 && <span className={cx('rounded-full px-2 text-xs', tab === t.id ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600')}>{abiertasN}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            <Card className="flex flex-col gap-3 p-4 lg:flex-row">
                <SearchInput className="lg:flex-1" value={f.search} onChange={setFiltro('search')} delay={400} placeholder="Nº de OT o solicitud, CI, nombre o dirección" />
                <SelectInput className="lg:w-52" value={f.tipo} onChange={setFiltro('tipo')}>
                    <option value="">Todos los tipos</option>
                    {TIPOS.map((t) => <option key={t.codigo} value={t.codigo}>{t.corto}</option>)}
                </SelectInput>
                <SelectInput className="lg:w-52" value={f.zona} onChange={setFiltro('zona')}>
                    <option value="">Todas las zonas</option>
                    {zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                </SelectInput>
                <SelectInput className="lg:w-52" value={f.cuadrilla} onChange={setFiltro('cuadrilla')}>
                    <option value="">Todas las cuadrillas</option>
                    {cuadrillas.map((c) => <option key={c.id} value={c.id}>{c.nombre}{c.activo ? '' : ' (inactiva)'}</option>)}
                </SelectInput>
                <SelectInput className="lg:w-44" value={f.plazo} onChange={setFiltro('plazo')}>
                    <option value="">Todo plazo ATT</option>
                    <option value="vencidas">Vencidas</option>
                    <option value="por_vencer">Por vencer</option>
                </SelectInput>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">OT</th>
                                <th className="px-4 py-3 font-semibold">Trabajo</th>
                                <th className="px-4 py-3 font-semibold">Cliente</th>
                                <th className="px-4 py-3 font-semibold">Ubicación</th>
                                <th className="px-4 py-3 font-semibold">Antigüedad</th>
                                <th className="px-4 py-3 font-semibold">Programación</th>
                                <th className="px-4 py-3 font-semibold">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !items.length && <tr><td colSpan={7} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>}
                            {!loading && !items.length && <tr><td colSpan={7}><EmptyState icon={IoConstructOutline} title="No hay órdenes aquí" /></td></tr>}
                            {items.map((o) => {
                                const abierta = ABIERTAS.includes(o.estado.codigo);
                                return (
                                    <tr key={o.id} className="cursor-pointer align-top hover:bg-gray-50" onClick={() => setAbierta(o.id)}>
                                        <td className="px-4 py-3">
                                            <p className="font-mono font-semibold text-gray-800">{o.numero}</p>
                                            <p className="text-xs text-gray-500">Sol. {o.solicitud.numero}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="flex items-center gap-2 text-gray-800">{o.tipo.nombre} <Prioridad valor={o.prioridad} /></p>
                                            {o.solicitud.plan && <p className="text-xs text-gray-500">{o.solicitud.plan} · {serviciosTexto(o.solicitud.servicios)}</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-800">{o.cliente.nombre}</p>
                                            <p className="text-xs text-gray-500">{o.cliente.telefono}</p>
                                        </td>
                                        <td className="max-w-xs px-4 py-3">
                                            <p className="truncate text-gray-700">{o.solicitud.direccion}</p>
                                            <p className="text-xs"><ZonaChip zona={o.zona} /></p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-700">{fechaCorta(o.created_at)}</p>
                                            <p className="text-xs text-gray-500">{o.dias} día(s)</p>
                                            <p className="mt-1"><PlazoChip plazo={o.plazo} /></p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {o.fecha_programada
                                                ? (<><p className="text-gray-700">{fechaCorta(o.fecha_programada)}</p><p className="text-xs text-gray-500">{o.cuadrilla?.nombre}</p></>)
                                                : <span className="text-xs text-gray-400">Sin programar</span>}
                                        </td>
                                        <td className="px-4 py-3"><EstadoOT estado={o.estado} /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <Pager page={page} pageSize={PAGE_SIZE} count={count} onChange={setPage} />
            </Card>

            <OrdenModal
                id={abierta}
                open={!!abierta}
                zonas={zonas.filter((z) => z.activo)}
                puedeEditar={hasPermission('ordenes', 'actualizar')}
                onClose={() => setAbierta(null)}
                onCambio={cargar}
            />
        </div>
    );
};

export default Ordenes;
