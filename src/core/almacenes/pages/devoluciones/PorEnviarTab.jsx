// src/core/almacenes/pages/devoluciones/PorEnviarTab.jsx
// Equipos defectuosos agrupados por proveedor, listos para enviar a garantía.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoSendOutline, IoCheckmarkDoneCircleOutline } from 'react-icons/io5';
import { Card, Button, Badge, EmptyState, Spinner, Modal, Field, TextInput, TextArea, SelectInput, cx } from '../../../../shared/components/ui';
import garantiasService from '../../services/garantiasService';
import { fecha, hoyLocal } from '../lotes/loteUi';

export const GarantiaLote = ({ lote }) => {
    if (lote?.garantia_vigente == null) return null;
    return lote.garantia_vigente
        ? <Badge color="green">Garantía hasta {fecha(lote.fecha_fin_garantia)}</Badge>
        : <Badge color="red">Garantía vencida {fecha(lote.fecha_fin_garantia)}</Badge>;
};

const EnviarModal = ({ grupo, equipos, open, onClose, onEnviado }) => {
    const [v, setV] = useState({ fecha_envio: '', referencia: '', area_tramite: '', observaciones: '' });
    const [areas, setAreas] = useState([]);
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (!open) return;
        setV({ fecha_envio: hoyLocal(), referencia: '', area_tramite: '', observaciones: '' });
        setError('');
        garantiasService.areas().then((r) => r.success && setAreas((r.data.results || r.data || []).filter((a) => a.activo)));
    }, [open]);

    const vencidos = equipos.filter((e) => e.lote.garantia_vigente === false).length;
    const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));

    const enviar = async () => {
        setGuardando(true);
        const r = await garantiasService.enviar({
            proveedor: grupo.id,
            materiales_ids: equipos.map((e) => e.id),
            fecha_envio: v.fecha_envio,
            referencia: v.referencia.trim(),
            area_tramite: v.area_tramite || null,
            observaciones: v.observaciones.trim(),
        });
        setGuardando(false);
        if (!r.success) { setError(r.error); return; }
        toast.success(r.data.message);
        onEnviado(r.data);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            title={`Enviar a garantía · ${grupo?.nombre || ''}`}
            subtitle={`${equipos.length} equipo(s) quedarán como "En garantía" hasta que el proveedor responda`}
            footer={<><Button variant="ghost" onClick={onClose} disabled={guardando}>Cancelar</Button><Button icon={IoSendOutline} onClick={enviar} loading={guardando}>Enviar</Button></>}
        >
            <div className="space-y-4 text-sm">
                {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}
                {vencidos > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                        {vencidos} equipo(s) tienen la garantía del lote vencida. Puedes enviarlos igual si el proveedor lo acepta.
                    </div>
                )}
                <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto rounded-lg bg-gray-50 p-2">
                    {equipos.map((e) => <span key={e.id} className="rounded bg-white px-2 py-0.5 font-mono text-xs text-gray-700 ring-1 ring-gray-200">{e.gpon_serial || e.codigo_interno}</span>)}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Fecha de envío" required>
                        <TextInput type="date" value={v.fecha_envio} max={hoyLocal()} onChange={set('fecha_envio')} disabled={guardando} />
                    </Field>
                    <Field label="Referencia" hint="Nota, carta o nº de trámite con el proveedor">
                        <TextInput value={v.referencia} onChange={set('referencia')} maxLength={100} disabled={guardando} placeholder="Ej: Nota 045/2026" />
                    </Field>
                </div>
                <Field label="Área que lleva el trámite" hint="Opcional: el área de COTEL que gestiona la garantía con el proveedor">
                    <SelectInput value={v.area_tramite} onChange={set('area_tramite')} disabled={guardando}>
                        <option value="">Sin indicar</option>
                        {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </SelectInput>
                </Field>
                <Field label="Observaciones">
                    <TextArea rows={2} value={v.observaciones} onChange={set('observaciones')} disabled={guardando} />
                </Field>
            </div>
        </Modal>
    );
};

const PorEnviarTab = ({ puedeEditar, onEnviado }) => {
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sel, setSel] = useState(new Set());
    const [enviar, setEnviar] = useState(null); // { grupo, equipos }
    const [completos, setCompletos] = useState(new Set()); // proveedores mostrados completos

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await garantiasService.porEnviar();
        setLoading(false);
        if (r.success) setEquipos(r.data.equipos || []);
        else toast.error(r.error);
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    const grupos = useMemo(() => {
        const mapa = new Map();
        equipos.forEach((e) => {
            const g = mapa.get(e.proveedor.id) || { ...e.proveedor, equipos: [] };
            g.equipos.push(e);
            mapa.set(e.proveedor.id, g);
        });
        return [...mapa.values()];
    }, [equipos]);

    const alternar = (ids) => setSel((s) => {
        const n = new Set(s);
        const todos = ids.every((id) => n.has(id));
        ids.forEach((id) => (todos ? n.delete(id) : n.add(id)));
        return n;
    });

    if (loading && !equipos.length) return <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div>;
    if (!equipos.length) {
        return <Card><EmptyState icon={IoCheckmarkDoneCircleOutline} title="No hay equipos defectuosos pendientes">Los equipos que laboratorio rechace aparecerán aquí.</EmptyState></Card>;
    }

    return (
        <div className="space-y-4">
            {grupos.map((g) => {
                const ids = g.equipos.map((e) => e.id);
                const elegidos = g.equipos.filter((e) => sel.has(e.id));
                const todos = ids.every((id) => sel.has(id));
                return (
                    <Card key={g.id} className="overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <label className="flex items-center gap-3">
                                {puedeEditar && <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={todos} onChange={() => alternar(ids)} />}
                                <span>
                                    <span className="block font-semibold text-gray-800">{g.nombre || 'Sin proveedor'}</span>
                                    <span className="text-xs text-gray-500">{g.equipos.length} equipo(s) defectuoso(s)</span>
                                </span>
                            </label>
                            {puedeEditar && (
                                <Button icon={IoSendOutline} disabled={!elegidos.length} onClick={() => setEnviar({ grupo: g, equipos: elegidos })}>
                                    Enviar a garantía{elegidos.length ? ` (${elegidos.length})` : ''}
                                </Button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <tbody className="divide-y divide-gray-100">
                                    {(completos.has(g.id) ? g.equipos : g.equipos.slice(0, 20)).map((e) => (
                                        <tr key={e.id} className={cx(puedeEditar && 'cursor-pointer hover:bg-gray-50', sel.has(e.id) && 'bg-orange-50/50')} onClick={() => puedeEditar && alternar([e.id])}>
                                            {puedeEditar && (
                                                <td className="w-10 px-4 py-3" onClick={(x) => x.stopPropagation()}>
                                                    <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={sel.has(e.id)} onChange={() => alternar([e.id])} />
                                                </td>
                                            )}
                                            <td className="px-4 py-3">
                                                <p className="font-mono font-medium text-gray-800">{e.gpon_serial || e.codigo_interno}</p>
                                                <p className="font-mono text-xs text-gray-500">{e.mac_address}</p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">{e.modelo}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-gray-700">Lote {e.lote.numero_lote}</p>
                                                <GarantiaLote lote={e.lote} />
                                            </td>
                                            <td className="max-w-xs px-4 py-3">
                                                <p className="text-red-700">{e.falla || 'Sin detalle de la falla'}</p>
                                                {e.fecha_rechazo && <p className="text-xs text-gray-500">Rechazado el {new Date(e.fecha_rechazo).toLocaleDateString('es-BO')}</p>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {g.equipos.length > 20 && !completos.has(g.id) && (
                            <button type="button" className="w-full border-t border-gray-100 py-2 text-sm text-orange-600 hover:bg-gray-50"
                                onClick={() => setCompletos((x) => new Set(x).add(g.id))}>
                                Ver los {g.equipos.length - 20} restantes
                            </button>
                        )}
                    </Card>
                );
            })}

            <EnviarModal
                open={!!enviar}
                grupo={enviar?.grupo}
                equipos={enviar?.equipos || []}
                onClose={() => setEnviar(null)}
                onEnviado={(envio) => { setEnviar(null); setSel(new Set()); onEnviado(envio); }}
            />
        </div>
    );
};

export default PorEnviarTab;
