// src/core/almacenes/pages/devoluciones/EnviosTab.jsx
// Envíos a garantía: abiertos (esperando respuesta) o cerrados (historial).
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoFileTrayFullOutline } from 'react-icons/io5';
import { Card, SearchInput, EmptyState, Spinner, Pager, cx } from '../../../../shared/components/ui';
import garantiasService from '../../services/garantiasService';
import { fecha } from '../lotes/loteUi';

const PAGE_SIZE = 20;

const Progreso = ({ e }) => {
    const hechos = e.total - e.pendientes;
    return (
        <div className="w-40">
            <div className="flex h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="bg-green-500" style={{ width: `${(e.reemplazados / e.total) * 100}%` }} />
                <div className="bg-blue-500" style={{ width: `${(e.reparados / e.total) * 100}%` }} />
                <div className="bg-gray-400" style={{ width: `${(e.sin_reposicion / e.total) * 100}%` }} />
            </div>
            <p className="mt-1 text-xs text-gray-500">{hechos} de {e.total} con respuesta</p>
        </div>
    );
};

const EnviosTab = ({ cerrado, diasAlerta, onAbrir }) => {
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await garantiasService.listar({ cerrado: cerrado ? 'true' : 'false', search, page, page_size: PAGE_SIZE });
        setLoading(false);
        if (r.success) { setItems(r.data.results || []); setCount(r.data.count || 0); }
        else toast.error(r.error);
    }, [cerrado, search, page]);
    useEffect(() => { cargar(); }, [cargar]);

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <SearchInput value={search} onChange={(v) => { setPage(1); setSearch(v); }} delay={400} placeholder="Nº de envío, referencia, GPON o MAC" />
            </Card>
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Envío</th>
                                <th className="px-4 py-3 font-semibold">Proveedor</th>
                                <th className="px-4 py-3 font-semibold">Enviado</th>
                                <th className="px-4 py-3 font-semibold">{cerrado ? 'Resultado' : 'Avance'}</th>
                                <th className="px-4 py-3 font-semibold">Referencia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !items.length && <tr><td colSpan={5} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>}
                            {!loading && !items.length && (
                                <tr><td colSpan={5}><EmptyState icon={IoFileTrayFullOutline} title={search ? 'Ningún envío coincide' : cerrado ? 'Aún no hay envíos cerrados' : 'No hay equipos esperando respuesta del proveedor'} /></td></tr>
                            )}
                            {items.map((e) => {
                                const demorado = !e.cerrado && e.dias > diasAlerta;
                                return (
                                    <tr key={e.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onAbrir(e.id)}>
                                        <td className="px-4 py-3">
                                            <p className="font-mono font-semibold text-gray-800">{e.numero}</p>
                                            <p className="text-xs text-gray-500">{e.total} equipo(s)</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{e.proveedor.nombre}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-700">{fecha(e.fecha_envio)}</p>
                                            <p className={cx('text-xs', demorado ? 'font-semibold text-red-600' : 'text-gray-500')}>
                                                {e.cerrado ? `cerrado en ${e.dias} día(s)` : `hace ${e.dias} día(s)`}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {cerrado ? (
                                                <p className="text-xs text-gray-600">
                                                    {[e.reemplazados && `${e.reemplazados} cambiados`, e.reparados && `${e.reparados} reparados`, e.sin_reposicion && `${e.sin_reposicion} de baja`].filter(Boolean).join(' · ')}
                                                </p>
                                            ) : <Progreso e={e} />}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-700">{e.referencia || '—'}</p>
                                            {e.area_tramite && <p className="text-xs text-gray-500">{e.area_tramite.nombre}</p>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <Pager page={page} pageSize={PAGE_SIZE} count={count} onChange={setPage} />
            </Card>
        </div>
    );
};

export default EnviosTab;
