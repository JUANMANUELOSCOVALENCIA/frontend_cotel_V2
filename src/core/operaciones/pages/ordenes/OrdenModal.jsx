// src/core/operaciones/pages/ordenes/OrdenModal.jsx
// Detalle de una orden de trabajo con su historial de estados.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, Button, Spinner, Field, TextArea } from '../../../../shared/components/ui';
import { IoPrintOutline } from 'react-icons/io5';
import { ordenesService } from '../../services/operacionesService';
import { useUser } from '../../../auth/hooks/useAuth';
import { imprimirOT } from '../../components/pdf';
import UbicacionMapa from '../../components/UbicacionMapa';
import { EstadoOT, Prioridad, ZonaChip, fechaHora, fechaCorta, serviciosTexto } from '../../components/opUi';

const ANULABLES = ['PENDIENTE', 'PROGRAMADA', 'NO_EJECUTADA'];

const Dato = ({ label, children, className }) => (
    <div className={className}>
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="text-gray-800">{children || '—'}</dd>
    </div>
);

const OrdenModal = ({ id, open, zonas, puedeEditar, onClose, onCambio }) => {
    const [o, setO] = useState(null);
    const [anulando, setAnulando] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);
    const { fullName } = useUser();

    const cargar = useCallback(async () => {
        const r = await ordenesService.obtener(id);
        if (r.success) setO(r.data); else { toast.error(r.error); onClose(); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    useEffect(() => { if (open && id) { setO(null); setAnulando(false); setMotivo(''); setError(''); cargar(); } }, [open, id, cargar]);

    const anular = async () => {
        if (motivo.trim().length < 5) { setError('Indica el motivo (mínimo 5 caracteres).'); return; }
        setGuardando(true);
        const r = await ordenesService.anular(o.id, motivo.trim());
        setGuardando(false);
        if (!r.success) { setError(r.error); return; }
        toast.success(r.data.message);
        setO(r.data); setAnulando(false); onCambio?.();
    };

    const sePuedeAnular = o && puedeEditar && ANULABLES.includes(o.estado.codigo);

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            size="xl"
            title={o ? `Orden de trabajo ${o.numero}` : 'Orden de trabajo'}
            subtitle={o && `${o.tipo.nombre} · solicitud ${o.solicitud.numero}`}
            footer={anulando ? (
                <>
                    <Button variant="ghost" onClick={() => setAnulando(false)} disabled={guardando}>Volver</Button>
                    <Button variant="danger" onClick={anular} loading={guardando}>Anular OT</Button>
                </>
            ) : (
                <>
                    {sePuedeAnular && <Button variant="ghost" className="mr-auto text-red-600" onClick={() => { setAnulando(true); setError(''); }}>Anular</Button>}
                    <Button variant="ghost" onClick={onClose}>Cerrar</Button>
                    {o && o.estado.codigo !== 'ANULADA' && <Button variant="secondary" icon={IoPrintOutline} onClick={() => imprimirOT(o, fullName)}>Imprimir OT</Button>}
                </>
            )}
        >
            {!o ? <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div> : (
                <div className="space-y-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <EstadoOT estado={o.estado} />
                        <Prioridad valor={o.prioridad} />
                        <span className="text-xs text-gray-500">{o.estado.codigo === 'ANULADA' || o.estado.codigo === 'CERRADA' ? `Duró ${o.dias} día(s)` : `Abierta hace ${o.dias} día(s)`}</span>
                    </div>

                    {o.ubicacion.referencia && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Referencias del domicilio</p>
                            <p className="mt-0.5 whitespace-pre-line text-gray-800">{o.ubicacion.referencia}</p>
                        </div>
                    )}

                    {anulando && (
                        <div className="space-y-2">
                            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}
                            <Field label="Motivo de la anulación" required hint={`La solicitud ${o.solicitud.numero} también queda anulada.`}>
                                <TextArea rows={2} value={motivo} onChange={(e) => { setMotivo(e.target.value); setError(''); }} autoFocus placeholder="Ej: el cliente desistió" />
                            </Field>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <dl className="grid grid-cols-2 content-start gap-x-4 gap-y-3 rounded-xl border border-gray-200 p-4">
                            <Dato label="Cliente" className="col-span-2">{o.cliente.nombre} <span className="text-gray-500">· CI {o.cliente.ci}</span></Dato>
                            <Dato label="Teléfono">{o.cliente.telefono}</Dato>
                            <Dato label="Programada para">{o.fecha_programada ? fechaCorta(o.fecha_programada) : 'Sin programar'}</Dato>
                            {o.solicitud.plan && <Dato label="Plan y servicios" className="col-span-2">{o.solicitud.plan} <span className="text-gray-500">· {serviciosTexto(o.solicitud.servicios)}</span></Dato>}
                            <Dato label="Dirección" className="col-span-2">{o.solicitud.direccion}{o.solicitud.zona_referencia ? `, ${o.solicitud.zona_referencia}` : ''}</Dato>
                            <Dato label="Zona" className="col-span-2"><ZonaChip zona={o.zona} /></Dato>
                        </dl>
                        <UbicacionMapa zonas={zonas} valor={o.ubicacion} soloLectura alto="h-64" />
                    </div>

                    <div>
                        <h4 className="mb-2 font-semibold text-gray-800">Historial</h4>
                        <ol className="relative space-y-3 border-l border-gray-200 pl-5">
                            {o.historial.map((h) => (
                                <li key={h.id} className="relative">
                                    <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-4 ring-white" />
                                    <p className="flex flex-wrap items-center gap-2 text-gray-800"><EstadoOT estado={h.estado_nuevo} /><span className="text-xs text-gray-500">{fechaHora(h.fecha)} · {h.usuario || 'Sistema'}</span></p>
                                    {h.observacion && <p className="mt-0.5 text-gray-600">{h.observacion}</p>}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default OrdenModal;
