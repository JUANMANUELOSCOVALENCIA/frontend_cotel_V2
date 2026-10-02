// src/core/almacenes/pages/laboratorio/HistorialTab.jsx
// Inspecciones registradas (paginado), con filtros por resultado y período.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { Card, SearchInput, SelectInput, EmptyState, Spinner, Badge, Pager } from '../../../../shared/components/ui';
import laboratorioService from '../../services/laboratorioService';
import MaterialDetalleModal from '../equipos/MaterialDetalleModal';
import { fechaHora } from '../equipos/inventarioUi';

const PAGE_SIZE = 20;

const HistorialTab = () => {
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [f, setF] = useState({ search: '', aprobado: '', dias: '30' });
    const [detalle, setDetalle] = useState(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await laboratorioService.historial({ ...f, page, page_size: PAGE_SIZE });
        setLoading(false);
        if (r.success) { setItems(r.data.results || []); setCount(r.data.count || 0); }
        else toast.error(r.error);
    }, [f, page]);
    useEffect(() => { cargar(); }, [cargar]);
    const setFiltro = (k) => (v) => { setPage(1); setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v })); };

    return (
        <div className="space-y-4">
            <Card className="flex flex-col gap-3 p-4 lg:flex-row">
                <SearchInput className="lg:flex-1" value={f.search} onChange={setFiltro('search')} delay={400} placeholder="Nº de informe, GPON, MAC o lote" />
                <SelectInput className="lg:w-52" value={f.aprobado} onChange={setFiltro('aprobado')}>
                    <option value="">Todos los resultados</option>
                    <option value="true">Aprobados</option>
                    <option value="false">Rechazados</option>
                </SelectInput>
                <SelectInput className="lg:w-44" value={f.dias} onChange={setFiltro('dias')}>
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="90">Últimos 90 días</option>
                    <option value="">Todo</option>
                </SelectInput>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[880px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Fecha</th>
                                <th className="px-4 py-3 font-semibold">Informe</th>
                                <th className="px-4 py-3 font-semibold">Equipo</th>
                                <th className="px-4 py-3 font-semibold">Resultado</th>
                                <th className="px-4 py-3 font-semibold">Técnico</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !items.length && (
                                <tr><td colSpan={5} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>
                            )}
                            {!loading && !items.length && (
                                <tr><td colSpan={5}><EmptyState icon={IoDocumentTextOutline} title="No hay inspecciones con estos filtros" /></td></tr>
                            )}
                            {items.map((i) => (
                                <tr key={i.id} className="cursor-pointer align-top hover:bg-gray-50" onClick={() => setDetalle(i.material.id)}>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{fechaHora(i.fecha_inspeccion)}</td>
                                    <td className="px-4 py-3 font-mono text-gray-700">{i.numero_informe}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-mono font-medium text-gray-800">{i.material.gpon_serial || i.material.codigo_interno}</p>
                                        <p className="text-xs text-gray-500">{i.material.modelo} · lote {i.material.lote}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        {i.aprobado ? <Badge color="green">Aprobado</Badge> : <Badge color="red">Rechazado</Badge>}
                                        {!!i.fallas.length && <p className="mt-1 text-xs text-red-700">{i.fallas.join(', ')}</p>}
                                        {i.observaciones && <p className="mt-1 max-w-xs text-xs text-gray-500">{i.observaciones}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{i.tecnico || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pager page={page} pageSize={PAGE_SIZE} count={count} onChange={setPage} />
            </Card>

            <MaterialDetalleModal open={!!detalle} materialId={detalle} puedeEditar={false} onClose={() => setDetalle(null)} />
        </div>
    );
};

export default HistorialTab;
