// src/core/operaciones/pages/ordenes/OrdenModal.jsx
// Detalle de una orden de trabajo con su historial de estados.
// Programar / reprogramar / desasignar / no ejecutada; EN CAMPO y EJECUTADA llegan desde la app del técnico.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, Button, Spinner, Field, TextArea } from '../../../../shared/components/ui';
import { IoPrintOutline } from 'react-icons/io5';
import { ordenesService } from '../../services/operacionesService';
import { useUser } from '../../../auth/hooks/useAuth';
import { imprimirOT } from '../../components/pdf';
import UbicacionMapa from '../../components/UbicacionMapa';
import { EstadoOT, PlazoChip, Prioridad, ZonaChip, fechaHora, fechaCorta, serviciosTexto } from '../../components/opUi';
import ProgramarModal from '../../components/ProgramarModal';

const ANULABLES = ['PENDIENTE', 'PROGRAMADA', 'NO_EJECUTADA'];
const PROGRAMABLES = ['PENDIENTE', 'PROGRAMADA', 'NO_EJECUTADA'];
const DESASIGNABLES = ['PROGRAMADA', 'NO_EJECUTADA'];
const NO_EJECUTABLES = ['PROGRAMADA', 'EN_CAMPO'];

// Acciones que piden motivo
const MODOS = {
    anular: { titulo: 'Motivo de la anulación', boton: 'Anular OT', variant: 'danger', placeholder: 'Ej: el cliente desistió' },
    desasignar: { titulo: 'Motivo para desasignar', boton: 'Desasignar', variant: 'primary', placeholder: 'Ej: falta material para este trabajo', hint: 'La OT vuelve a pendientes, sin cuadrilla ni fecha.' },
    no_ejecutada: { titulo: 'Motivo por el que no se ejecutó', boton: 'Registrar', variant: 'primary', placeholder: 'Ej: cliente ausente', hint: 'La OT aparece en Programación para reprogramarla.' },
};

const Dato = ({ label, children, className }) => (
    <div className={className}>
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="text-gray-800">{children || '—'}</dd>
    </div>
);

const OrdenModal = ({ id, open, zonas, puedeEditar, onClose, onCambio }) => {
    const [o, setO] = useState(null);
    const [modo, setModo] = useState(null); // 'anular' | 'desasignar' | 'no_ejecutada'
    const [programando, setProgramando] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);
    const { fullName } = useUser();

    const cargar = useCallback(async () => {
        const r = await ordenesService.obtener(id);
        if (r.success) setO(r.data); else { toast.error(r.error); onClose(); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    useEffect(() => { if (open && id) { setO(null); setModo(null); setMotivo(''); setError(''); cargar(); } }, [open, id, cargar]);

    const confirmar = async () => {
        if (motivo.trim().length < 5) { setError('Indica el motivo (mínimo 5 caracteres).'); return; }
        setGuardando(true);
        const accion = { anular: ordenesService.anular, desasignar: ordenesService.desasignar, no_ejecutada: ordenesService.noEjecutada }[modo];
        const r = await accion(o.id, motivo.trim());
        setGuardando(false);
        if (!r.success) { setError(r.error); return; }
        toast.success(r.data.message);
        setO(r.data); setModo(null); setMotivo(''); onCambio?.();
    };
    const empezar = (m) => { setModo(m); setMotivo(''); setError(''); };

    const estado = o?.estado.codigo;
    const sePuedeAnular = o && puedeEditar && ANULABLES.includes(estado);
    const sePuedeProgramar = o && puedeEditar && PROGRAMABLES.includes(estado);
    const m = modo && MODOS[modo];

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            size="xl"
            title={o ? `Orden de trabajo ${o.numero}` : 'Orden de trabajo'}
            subtitle={o && `${o.tipo.nombre} · solicitud ${o.solicitud.numero}`}
            footer={m ? (
                <>
                    <Button variant="ghost" onClick={() => setModo(null)} disabled={guardando}>Volver</Button>
                    <Button variant={m.variant} onClick={confirmar} loading={guardando}>{m.boton}</Button>
                </>
            ) : (
                <>
                    {sePuedeAnular && <Button variant="ghost" className="mr-auto text-red-600" onClick={() => empezar('anular')}>Anular</Button>}
                    {puedeEditar && NO_EJECUTABLES.includes(estado) && <Button variant="ghost" onClick={() => empezar('no_ejecutada')}>No ejecutada</Button>}
                    {puedeEditar && DESASIGNABLES.includes(estado) && <Button variant="ghost" onClick={() => empezar('desasignar')}>Desasignar</Button>}
                    <Button variant="ghost" onClick={onClose}>Cerrar</Button>
                    {o && estado !== 'ANULADA' && <Button variant="secondary" icon={IoPrintOutline} onClick={() => imprimirOT(o, fullName)}>Imprimir OT</Button>}
                    {sePuedeProgramar && <Button onClick={() => setProgramando(true)}>{estado === 'PROGRAMADA' ? 'Reprogramar' : 'Programar'}</Button>}
                </>
            )}
        >
            {!o ? <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div> : (
                <div className="space-y-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <EstadoOT estado={o.estado} />
                        <Prioridad valor={o.prioridad} />
                        <span className="text-xs text-gray-500">{o.estado.codigo === 'ANULADA' || o.estado.codigo === 'CERRADA' ? `Duró ${o.dias} día(s)` : `Abierta hace ${o.dias} día(s)`}</span>
                        <PlazoChip plazo={o.plazo} />
                    </div>

                    {o.ubicacion.referencia && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Referencias del domicilio</p>
                            <p className="mt-0.5 whitespace-pre-line text-gray-800">{o.ubicacion.referencia}</p>
                        </div>
                    )}

                    {m && (
                        <div className="space-y-2">
                            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}
                            <Field label={m.titulo} required hint={modo === 'anular' ? `La solicitud ${o.solicitud.numero} también queda anulada.` : m.hint}>
                                <TextArea rows={2} value={motivo} onChange={(e) => { setMotivo(e.target.value); setError(''); }} autoFocus placeholder={m.placeholder} />
                            </Field>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <dl className="grid grid-cols-2 content-start gap-x-4 gap-y-3 rounded-xl border border-gray-200 p-4">
                            <Dato label="Cliente" className="col-span-2">{o.cliente.nombre} <span className="text-gray-500">· CI {o.cliente.ci}</span></Dato>
                            <Dato label="Teléfono">{o.cliente.telefono}</Dato>
                            <Dato label="Programada para">{o.fecha_programada ? `${fechaCorta(o.fecha_programada)}${o.cuadrilla ? ` · ${o.cuadrilla.nombre}` : ''}` : 'Sin programar'}</Dato>
                            {o.cuadrilla && (
                                <Dato label="Cuadrilla" className="col-span-2">
                                    {o.cuadrilla.integrantes.map((i) => `${i.usuario.nombre}${i.es_jefe ? ' (jefe)' : ''}`).join(', ') || 'Sin técnicos'}
                                    {o.cuadrilla.vehiculo && <span className="text-gray-500"> · {o.cuadrilla.vehiculo.placa} {o.cuadrilla.vehiculo.descripcion}</span>}
                                </Dato>
                            )}
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
            <ProgramarModal
                open={programando}
                ordenes={o ? [o] : []}
                onClose={() => setProgramando(false)}
                onHecho={() => { setProgramando(false); cargar(); onCambio?.(); }}
            />
        </Modal>
    );
};

export default OrdenModal;
