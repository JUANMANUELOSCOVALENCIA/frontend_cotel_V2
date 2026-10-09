// src/core/almacenes/pages/traspasos/TraspasoModal.jsx
// Detalle de un traspaso: recibir en destino (marcando lo que llegó) o cancelar.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoArrowForward, IoCheckmarkCircle, IoAlertCircle } from 'react-icons/io5';
import { Modal, Button, Badge, Spinner, Field, TextArea, cx } from '../../../../shared/components/ui';
import traspasosService from '../../services/traspasosService';
import { fechaHora } from '../equipos/inventarioUi';
import { EstadoTraspaso } from './traspasoUi';

const TraspasoModal = ({ id, open, puedeEditar, onClose, onCambio }) => {
    const [t, setT] = useState(null);
    const [modo, setModo] = useState(null); // 'recibir' | 'cancelar'
    const [llegaron, setLlegaron] = useState(new Set());
    const [obs, setObs] = useState('');
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    const cargar = useCallback(async () => {
        if (!id) return;
        const r = await traspasosService.obtener(id);
        if (r.success) setT(r.data);
        else { toast.error(r.error); onClose(); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    useEffect(() => { if (open) { setT(null); setModo(null); setObs(''); setError(''); cargar(); } }, [open, cargar]);

    const empezar = (m) => { setModo(m); setObs(''); setError(''); setLlegaron(new Set((t?.items || []).map((i) => i.id))); };
    const alternar = (iid) => setLlegaron((s) => { const n = new Set(s); n.has(iid) ? n.delete(iid) : n.add(iid); return n; });
    const faltan = (t?.items || []).filter((i) => !llegaron.has(i.id));

    const confirmar = async () => {
        if ((modo === 'cancelar' || faltan.length) && obs.trim().length < 5) {
            setError(modo === 'cancelar' ? 'Indica el motivo de la cancelación (mínimo 5 caracteres).' : 'Falta algo: explica qué pasó en las observaciones (mínimo 5 caracteres).');
            return;
        }
        setGuardando(true);
        const r = modo === 'cancelar'
            ? await traspasosService.cancelar(t.id, obs.trim())
            : await traspasosService.recibir(t.id, { recibidos: [...llegaron], observaciones: obs.trim() });
        setGuardando(false);
        if (!r.success) { setError(r.error); return; }
        toast.success(r.data.message, { duration: 5000 });
        setT(r.data);
        setModo(null);
        onCambio?.();
    };

    const enTransito = t?.estado?.codigo === 'EN_TRANSITO';

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            size="xl"
            title={t ? `Traspaso ${t.numero}` : 'Traspaso'}
            subtitle={t && <span className="inline-flex items-center gap-1.5">{t.origen.nombre} <IoArrowForward className="h-3.5 w-3.5" /> {t.destino.nombre}</span>}
            footer={modo ? (
                <>
                    <Button variant="ghost" onClick={() => setModo(null)} disabled={guardando}>Volver</Button>
                    {modo === 'recibir'
                        ? <Button onClick={confirmar} loading={guardando}>Confirmar recepción{faltan.length ? ` (${faltan.length} faltante/s)` : ''}</Button>
                        : <Button variant="danger" onClick={confirmar} loading={guardando}>Cancelar traspaso</Button>}
                </>
            ) : (
                <>
                    {enTransito && puedeEditar && <Button variant="ghost" className="mr-auto text-red-600" onClick={() => empezar('cancelar')}>Cancelar traspaso</Button>}
                    <Button variant="ghost" onClick={onClose}>Cerrar</Button>
                    {enTransito && puedeEditar && <Button onClick={() => empezar('recibir')}>Recibir en {t.destino.nombre}</Button>}
                </>
            )}
        >
            {!t ? <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div> : (
                <div className="space-y-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <EstadoTraspaso t={t} />
                        {t.numero_solicitud && <Badge color="gray">Solicitud {t.numero_solicitud}</Badge>}
                    </div>
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-xl border border-gray-200 p-4 sm:grid-cols-2">
                        <div><dt className="text-xs text-gray-500">Motivo</dt><dd className="text-gray-800">{t.motivo}</dd></div>
                        <div><dt className="text-xs text-gray-500">Enviado</dt><dd className="text-gray-800">{fechaHora(t.fecha_envio)} · {t.enviado_por}</dd></div>
                        {t.observaciones_envio && <div><dt className="text-xs text-gray-500">Observaciones del envío</dt><dd className="whitespace-pre-line text-gray-800">{t.observaciones_envio}</dd></div>}
                        {t.fecha_recepcion && (
                            <div>
                                <dt className="text-xs text-gray-500">{t.estado?.codigo === 'CANCELADO' ? 'Cancelado' : 'Recibido'}</dt>
                                <dd className="text-gray-800">{fechaHora(t.fecha_recepcion)} · {t.recibido_por}</dd>
                            </div>
                        )}
                        {t.observaciones_recepcion && <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Observaciones de la recepción</dt><dd className="whitespace-pre-line text-gray-800">{t.observaciones_recepcion}</dd></div>}
                    </dl>

                    {modo === 'recibir' && (
                        <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
                            Desmarca lo que <strong>no llegó</strong>. Lo que falte queda registrado como faltante y vuelve a figurar en {t.origen.nombre}.
                        </p>
                    )}
                    {modo === 'cancelar' && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-red-700">Todo vuelve a figurar en {t.origen.nombre} y el traspaso queda cancelado.</p>
                    )}

                    <div className="overflow-hidden rounded-xl border border-gray-200">
                        <table className="w-full text-left text-sm">
                            <tbody className="divide-y divide-gray-100">
                                {t.items.map((i) => (
                                    <tr key={i.id} className={cx(modo === 'recibir' && 'cursor-pointer hover:bg-gray-50', modo === 'recibir' && !llegaron.has(i.id) && 'bg-red-50/60')}
                                        onClick={() => modo === 'recibir' && alternar(i.id)}>
                                        {modo === 'recibir' && (
                                            <td className="w-10 px-4 py-2.5"><input type="checkbox" className="h-4 w-4 accent-orange-500" checked={llegaron.has(i.id)} onChange={() => alternar(i.id)} onClick={(e) => e.stopPropagation()} /></td>
                                        )}
                                        <td className="px-4 py-2.5">
                                            {i.es_unico ? (
                                                <>
                                                    <p className="font-mono text-gray-800">{i.gpon_serial || i.codigo_interno}</p>
                                                    <p className="font-mono text-xs text-gray-500">{i.mac_address}</p>
                                                </>
                                            ) : <p className="text-gray-800">{i.modelo}</p>}
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-600">{i.es_unico ? i.modelo : `${Number(i.cantidad).toLocaleString('es-BO')} ${i.unidad}`}</td>
                                        <td className="px-4 py-2.5 text-gray-500">Lote {i.lote}</td>
                                        <td className="px-4 py-2.5 text-right">
                                            {i.recibido && <span className="inline-flex items-center gap-1 text-green-700"><IoCheckmarkCircle className="h-4 w-4" />Recibido</span>}
                                            {i.faltante && <span className="inline-flex items-center gap-1 text-red-600"><IoAlertCircle className="h-4 w-4" />Faltante</span>}
                                            {!i.recibido && !i.faltante && modo !== 'recibir' && <span className="text-xs text-gray-400">{enTransito ? 'En tránsito' : '—'}</span>}
                                            {modo === 'recibir' && !llegaron.has(i.id) && <span className="text-xs font-medium text-red-600">No llegó</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {modo && (
                        <div className="space-y-2">
                            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}
                            <Field label={modo === 'cancelar' ? 'Motivo de la cancelación' : 'Observaciones'} required={modo === 'cancelar' || faltan.length > 0}>
                                <TextArea rows={2} value={obs} onChange={(e) => { setObs(e.target.value); setError(''); }} disabled={guardando}
                                    placeholder={modo === 'cancelar' ? 'Ej: se suspendió el envío' : faltan.length ? 'Ej: la caja llegó con una ONU menos' : 'Opcional'} />
                            </Field>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default TraspasoModal;
