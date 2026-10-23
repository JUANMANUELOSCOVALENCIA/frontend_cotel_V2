// src/core/operaciones/pages/solicitudes/index.jsx
// Solicitudes de clientes (instalación, traslado, reparación, retiro).
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoAddOutline, IoRefreshOutline, IoDocumentTextOutline, IoDownloadOutline } from 'react-icons/io5';
import { useUser } from '../../../auth/hooks/useAuth';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { PageHeader, Card, Button, SearchInput, SelectInput, EmptyState, Spinner, Pager, cx } from '../../../../shared/components/ui';
import { solicitudesService, zonasService } from '../../services/operacionesService';
import { TIPOS, EstadoSolicitud, EstadoOT, Prioridad, ZonaChip, fechaHora, serviciosTexto } from '../../components/opUi';
import NuevaSolicitudModal from './NuevaSolicitudModal';
import SolicitudModal from './SolicitudModal';
import OrdenModal from '../ordenes/OrdenModal';
import { traerTodo, reporteListado, fechaHora as fh } from '../../components/pdf';

const PAGE_SIZE = 20;
const TABS = [
    { id: 'EN_CURSO', label: 'En curso' },
    { id: 'SIN_COBERTURA', label: 'Sin cobertura' },
    { id: 'ATENDIDA', label: 'Atendidas' },
    { id: 'ANULADA', label: 'Anuladas' },
    { id: '', label: 'Todas' },
];

const Solicitudes = () => {
    const { hasPermission } = usePermissions();
    const puedeCrear = hasPermission('solicitudes', 'crear');
    const puedeEditar = hasPermission('solicitudes', 'actualizar');
    const puedeVerOT = hasPermission('ordenes', 'leer');
    const [tab, setTab] = useState('EN_CURSO');
    const [resumen, setResumen] = useState({});
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [f, setF] = useState({ search: '', tipo: '', zona: '' });
    const [zonas, setZonas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nueva, setNueva] = useState(false);
    const [abierta, setAbierta] = useState(null);
    const [orden, setOrden] = useState(null);
    const [recarga, setRecarga] = useState(0);
    const [exportando, setExportando] = useState(false);
    const { fullName } = useUser();

    useEffect(() => { zonasService.listar().then((r) => r.success && setZonas(r.data)); }, []);

    const cargar = useCallback(async () => {
        setLoading(true);
        const [r, s] = await Promise.all([
            solicitudesService.listar({ ...f, estado: tab, page, page_size: PAGE_SIZE }),
            solicitudesService.resumen(),
        ]);
        setLoading(false);
        if (r.success) { setItems(r.data.results || []); setCount(r.data.count || 0); } else toast.error(r.error);
        if (s.success) setResumen(s.data);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [f, page, tab, recarga]);
    useEffect(() => { cargar(); }, [cargar]);

    const setFiltro = (k) => (v) => { setPage(1); setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v })); };
    const zonasActivas = zonas.filter((z) => z.activo);

    const exportar = async () => {
        setExportando(true);
        const r = await traerTodo(solicitudesService.listar, { ...f, estado: tab });
        setExportando(false);
        if (!r.success) { toast.error(r.error); return; }
        if (!r.data.length) { toast.error('No hay solicitudes para exportar con estos filtros.'); return; }
        const filtros = [
            `Estado: ${TABS.find((t) => t.id === tab).label}`,
            f.tipo && `Tipo: ${TIPOS.find((t) => t.codigo === f.tipo)?.corto}`,
            f.zona && `Zona: ${zonas.find((z) => String(z.id) === String(f.zona))?.nombre}`,
            f.search && `Búsqueda: "${f.search}"`,
        ].filter(Boolean).join('  ·  ');
        reporteListado({
            titulo: 'Reporte de solicitudes',
            filtros,
            usuario: fullName,
            filas: r.data,
            archivo: 'solicitudes',
            anchos: { 'Nº': 70, Fecha: 70, Estado: 70 },
            columnas: [
                { titulo: 'Nº', valor: (s) => s.numero },
                { titulo: 'Fecha', valor: (s) => fh(s.created_at) },
                { titulo: 'Cliente', valor: (s) => `${s.cliente.nombre}\nCI ${s.cliente.ci}` },
                { titulo: 'Teléfono', valor: (s) => s.cliente.telefono || '' },
                { titulo: 'Pedido', valor: (s) => [s.tipo.nombre + (s.prioridad === 'ALTA' ? ' (URGENTE)' : ''), s.plan && `${s.plan.nombre} · ${serviciosTexto(s.servicios)}`].filter(Boolean).join('\n') },
                { titulo: 'Dirección / zona', valor: (s) => `${s.direccion}\n${s.zona?.nombre || 'Sin cobertura'}` },
                { titulo: 'OT', valor: (s) => (s.orden ? `${s.orden.numero}\n${s.orden.estado.nombre}` : 'Sin OT') },
                { titulo: 'Estado', valor: (s) => s.estado.nombre },
            ],
            resumenes: [
                { titulo: 'Por estado', clave: (s) => s.estado.nombre },
                { titulo: 'Por tipo', clave: (s) => s.tipo.nombre },
                { titulo: 'Por zona', clave: (s) => s.zona?.nombre || 'Sin cobertura' },
            ],
        });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Solicitudes"
                subtitle="Pedidos de los clientes; cada una con cobertura genera su OT"
                actions={(
                    <>
                        <Button variant="secondary" icon={IoRefreshOutline} onClick={cargar} disabled={loading}>Actualizar</Button>
                        <Button variant="secondary" icon={IoDownloadOutline} onClick={exportar} loading={exportando} disabled={!count}>Exportar PDF</Button>
                        {puedeCrear && <Button icon={IoAddOutline} onClick={() => setNueva(true)}>Nueva solicitud</Button>}
                    </>
                )}
            />

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6 overflow-x-auto">
                    {TABS.map((t) => (
                        <button key={t.id || 'todas'} type="button" onClick={() => { setTab(t.id); setPage(1); }}
                            className={cx('flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium',
                                tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                            {t.label}
                            {t.id && resumen[t.id] > 0 && (
                                <span className={cx('rounded-full px-2 text-xs', t.id === 'SIN_COBERTURA' ? 'bg-amber-100 text-amber-800' : tab === t.id ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600')}>{resumen[t.id]}</span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <Card className="flex flex-col gap-3 p-4 lg:flex-row">
                <SearchInput className="lg:flex-1" value={f.search} onChange={setFiltro('search')} delay={400} placeholder="Nº de solicitud u OT, CI, nombre o dirección" />
                <SelectInput className="lg:w-52" value={f.tipo} onChange={setFiltro('tipo')}>
                    <option value="">Todos los tipos</option>
                    {TIPOS.map((t) => <option key={t.codigo} value={t.codigo}>{t.corto}</option>)}
                </SelectInput>
                <SelectInput className="lg:w-52" value={f.zona} onChange={setFiltro('zona')}>
                    <option value="">Todas las zonas</option>
                    {zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                </SelectInput>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[960px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Solicitud</th>
                                <th className="px-4 py-3 font-semibold">Cliente</th>
                                <th className="px-4 py-3 font-semibold">Pedido</th>
                                <th className="px-4 py-3 font-semibold">Ubicación</th>
                                <th className="px-4 py-3 font-semibold">Orden de trabajo</th>
                                <th className="px-4 py-3 font-semibold">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !items.length && <tr><td colSpan={6} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>}
                            {!loading && !items.length && (
                                <tr><td colSpan={6}>
                                    <EmptyState icon={IoDocumentTextOutline} title="No hay solicitudes aquí">
                                        {tab === 'SIN_COBERTURA' ? 'Cuando alguien pida servicio fuera de las zonas, aparecerá en esta lista.' : null}
                                    </EmptyState>
                                </td></tr>
                            )}
                            {items.map((s) => (
                                <tr key={s.id} className="cursor-pointer align-top hover:bg-gray-50" onClick={() => setAbierta(s.id)}>
                                    <td className="px-4 py-3">
                                        <p className="font-mono font-semibold text-gray-800">{s.numero}</p>
                                        <p className="text-xs text-gray-500">{fechaHora(s.created_at)}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-gray-800">{s.cliente.nombre}</p>
                                        <p className="text-xs text-gray-500">CI {s.cliente.ci} · {s.cliente.telefono}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="flex items-center gap-2 text-gray-800">{s.tipo.nombre} <Prioridad valor={s.prioridad} /></p>
                                        {s.plan && <p className="text-xs text-gray-500">{s.plan.nombre} · {serviciosTexto(s.servicios)}</p>}
                                    </td>
                                    <td className="max-w-xs px-4 py-3">
                                        <p className="truncate text-gray-700">{s.direccion}</p>
                                        <p className="text-xs"><ZonaChip zona={s.zona} /></p>
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => { if (s.orden && puedeVerOT) { e.stopPropagation(); setOrden(s.orden.id); } }}>
                                        {s.orden ? (
                                            <span className="inline-flex flex-col gap-1 hover:opacity-80">
                                                <span className="font-mono text-xs font-semibold text-gray-700">{s.orden.numero}</span>
                                                <EstadoOT estado={s.orden.estado} />
                                            </span>
                                        ) : <span className="text-xs text-gray-400">Sin OT</span>}
                                    </td>
                                    <td className="px-4 py-3"><EstadoSolicitud estado={s.estado} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pager page={page} pageSize={PAGE_SIZE} count={count} onChange={setPage} />
            </Card>

            <NuevaSolicitudModal
                open={nueva}
                zonas={zonasActivas}
                onClose={() => setNueva(false)}
                onRegistrada={(s) => { setNueva(false); setTab(s.estado.codigo); setPage(1); setRecarga((n) => n + 1); }}
            />
            <SolicitudModal
                id={abierta}
                open={!!abierta}
                zonas={zonasActivas}
                puedeEditar={puedeEditar}
                onClose={() => setAbierta(null)}
                onCambio={cargar}
                onVerOrden={puedeVerOT ? (id) => { setAbierta(null); setOrden(id); } : null}
            />
            <OrdenModal
                id={orden}
                open={!!orden}
                zonas={zonasActivas}
                puedeEditar={hasPermission('ordenes', 'actualizar')}
                onClose={() => setOrden(null)}
                onCambio={cargar}
            />
        </div>
    );
};

export default Solicitudes;
