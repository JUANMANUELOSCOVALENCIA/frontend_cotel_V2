// src/core/almacenes/pages/traspasos/index.jsx
// Traspasos entre almacenes: enviar equipos/material, recibir en destino y seguimiento.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoAddOutline, IoRefreshOutline, IoSwapHorizontalOutline, IoArrowForward } from 'react-icons/io5';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { useOpcionesCompletas } from '../../hooks/useAlmacenes';
import { PageHeader, Card, Button, StatCard, SearchInput, SelectInput, EmptyState, Spinner, Pager, cx } from '../../../../shared/components/ui';
import traspasosService from '../../services/traspasosService';
import { fechaHora } from '../equipos/inventarioUi';
import NuevoTraspasoModal from './NuevoTraspasoModal';
import TraspasoModal from './TraspasoModal';
import { EstadoTraspaso } from './traspasoUi';

const PAGE_SIZE = 20;
const contenido = (t) => [t.equipos && `${t.equipos} equipo(s)`, t.lineas_granel && `${t.lineas_granel} material(es)`].filter(Boolean).join(' · ');

const Traspasos = () => {
    const { hasPermission } = usePermissions();
    const puedeEditar = hasPermission('traspasos', 'actualizar');
    const { opciones } = useOpcionesCompletas();
    const [tab, setTab] = useState('transito');
    const [resumen, setResumen] = useState(null);
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [f, setF] = useState({ search: '', almacen: '' });
    const [loading, setLoading] = useState(true);
    const [nuevo, setNuevo] = useState(false);
    const [abierto, setAbierto] = useState(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        const [r, s] = await Promise.all([
            traspasosService.listar({ ...f, estado: tab === 'transito' ? 'EN_TRANSITO' : 'RECIBIDO,CANCELADO', page, page_size: PAGE_SIZE }),
            traspasosService.resumen(),
        ]);
        setLoading(false);
        if (r.success) { setItems(r.data.results || []); setCount(r.data.count || 0); }
        else toast.error(r.error);
        if (s.success) setResumen(s.data);
    }, [f, page, tab]);
    useEffect(() => { cargar(); }, [cargar]);

    const setFiltro = (k) => (v) => { setPage(1); setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v })); };
    const tabs = [{ id: 'transito', label: 'En tránsito', n: resumen?.en_transito }, { id: 'historial', label: 'Historial' }];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Traspasos"
                subtitle="Movimiento de equipos y material entre almacenes"
                actions={(
                    <>
                        <Button variant="secondary" icon={IoRefreshOutline} onClick={cargar} disabled={loading}>Actualizar</Button>
                        {puedeEditar && <Button icon={IoAddOutline} onClick={() => setNuevo(true)}>Nuevo traspaso</Button>}
                    </>
                )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Traspasos en tránsito" value={resumen?.en_transito} tone={resumen?.en_transito ? 'text-amber-600' : 'text-gray-800'} />
                <StatCard label="Equipos en tránsito" value={resumen?.equipos_en_transito} />
                <StatCard label="Traspasos con faltantes" value={resumen?.con_faltantes} tone={resumen?.con_faltantes ? 'text-red-600' : 'text-gray-800'} />
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                    {tabs.map((t) => (
                        <button key={t.id} type="button" onClick={() => { setTab(t.id); setPage(1); }}
                            className={cx('flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium', tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                            {t.label}
                            {t.n > 0 && <span className={cx('rounded-full px-2 text-xs', tab === t.id ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600')}>{t.n}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            <Card className="flex flex-col gap-3 p-4 lg:flex-row">
                <SearchInput className="lg:flex-1" value={f.search} onChange={setFiltro('search')} delay={400} placeholder="Nº de traspaso, solicitud, motivo, GPON o MAC" />
                <SelectInput className="lg:w-60" value={f.almacen} onChange={setFiltro('almacen')}>
                    <option value="">Todos los almacenes</option>
                    {(opciones.almacenes || []).map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </SelectInput>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[880px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Traspaso</th>
                                <th className="px-4 py-3 font-semibold">Recorrido</th>
                                <th className="px-4 py-3 font-semibold">Contenido</th>
                                <th className="px-4 py-3 font-semibold">Enviado</th>
                                <th className="px-4 py-3 font-semibold">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !items.length && <tr><td colSpan={5} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>}
                            {!loading && !items.length && (
                                <tr><td colSpan={5}><EmptyState icon={IoSwapHorizontalOutline} title={tab === 'transito' ? 'No hay traspasos en tránsito' : 'Aún no hay traspasos terminados'} /></td></tr>
                            )}
                            {items.map((t) => (
                                <tr key={t.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setAbierto(t.id)}>
                                    <td className="px-4 py-3">
                                        <p className="font-mono font-semibold text-gray-800">{t.numero}</p>
                                        {t.numero_solicitud && <p className="text-xs text-gray-500">Solicitud {t.numero_solicitud}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="flex items-center gap-1.5 text-gray-800">{t.origen.nombre} <IoArrowForward className="h-3.5 w-3.5 text-gray-400" /> {t.destino.nombre}</p>
                                        <p className="max-w-xs truncate text-xs text-gray-500">{t.motivo}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{contenido(t)}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-gray-700">{fechaHora(t.fecha_envio)}</p>
                                        <p className={cx('text-xs', t.estado?.codigo === 'EN_TRANSITO' && t.dias_transito >= 3 ? 'font-semibold text-red-600' : 'text-gray-500')}>
                                            {t.estado?.codigo === 'EN_TRANSITO' ? `hace ${t.dias_transito} día(s) · ` : ''}{t.enviado_por}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3"><EstadoTraspaso t={t} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pager page={page} pageSize={PAGE_SIZE} count={count} onChange={setPage} />
            </Card>

            <NuevoTraspasoModal
                open={nuevo}
                almacenes={opciones.almacenes || []}
                onClose={() => setNuevo(false)}
                onEnviado={(t) => { setNuevo(false); setTab('transito'); cargar(); setAbierto(t.id); }}
            />
            <TraspasoModal
                id={abierto}
                open={!!abierto}
                puedeEditar={puedeEditar}
                onClose={() => setAbierto(null)}
                onCambio={cargar}
            />
        </div>
    );
};

export default Traspasos;
