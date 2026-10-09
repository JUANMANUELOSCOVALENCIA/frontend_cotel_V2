// src/core/operaciones/pages/solicitudes/SolicitudModal.jsx
// Detalle de una solicitud: datos, ubicación, su OT; corregir ubicación/contacto o anular.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, Button, Badge, Spinner, Field, TextInput, TextArea } from '../../../../shared/components/ui';
import { IoPrintOutline } from 'react-icons/io5';
import { solicitudesService } from '../../services/operacionesService';
import { useUser } from '../../../auth/hooks/useAuth';
import { imprimirSolicitud } from '../../components/pdf';
import UbicacionMapa from '../../components/UbicacionMapa';
import { zonaDe } from '../../components/mapa';
import { EstadoSolicitud, EstadoOT, Prioridad, ZonaChip, fechaHora, serviciosTexto } from '../../components/opUi';

const EDITABLES_OT = ['PENDIENTE', 'PROGRAMADA'];

const Dato = ({ label, children, className }) => (
    <div className={className}>
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="text-gray-800">{children || '—'}</dd>
    </div>
);

const SolicitudModal = ({ id, open, zonas, puedeEditar, onClose, onCambio, onVerOrden }) => {
    const [s, setS] = useState(null);
    const [modo, setModo] = useState(null); // 'editar' | 'anular'
    const [v, setV] = useState({});
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);
    const { fullName } = useUser();

    const cargar = useCallback(async () => {
        const r = await solicitudesService.obtener(id);
        if (r.success) setS(r.data); else { toast.error(r.error); onClose(); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    useEffect(() => { if (open && id) { setS(null); setModo(null); setError(''); cargar(); } }, [open, id, cargar]);

    const editable = s && ['EN_CURSO', 'SIN_COBERTURA'].includes(s.estado.codigo) && (!s.orden || EDITABLES_OT.includes(s.orden.estado.codigo));
    const zonaNueva = useMemo(() => (v.ubicacion ? zonaDe(zonas, v.ubicacion.lat, v.ubicacion.lng) : null), [zonas, v.ubicacion]);

    const empezar = (m) => {
        setError('');
        setModo(m);
        setV(m === 'editar'
            ? { telefono_contacto: s.telefono_contacto, direccion: s.direccion, zona_referencia: s.zona_referencia, referencia: s.referencia, ubicacion: s.ubicacion }
            : { motivo: '' });
    };
    const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); setError(''); };

    const guardar = async () => {
        setGuardando(true);
        let r;
        if (modo === 'anular') {
            if ((v.motivo || '').trim().length < 5) { setGuardando(false); setError('Indica el motivo (mínimo 5 caracteres).'); return; }
            r = await solicitudesService.anular(s.id, v.motivo.trim());
        } else {
            const movida = v.ubicacion.lat !== s.ubicacion.lat || v.ubicacion.lng !== s.ubicacion.lng;
            r = await solicitudesService.editar(s.id, {
                telefono_contacto: v.telefono_contacto.trim(), direccion: v.direccion.trim(),
                zona_referencia: v.zona_referencia.trim(), referencia: v.referencia.trim(),
                ...(movida ? { latitud: v.ubicacion.lat.toFixed(6), longitud: v.ubicacion.lng.toFixed(6) } : {}),
            });
        }
        setGuardando(false);
        if (!r.success) { setError(r.error); return; }
        toast.success(r.data.message);
        setS(r.data); setModo(null); onCambio?.();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            size="xl"
            title={s ? `Solicitud ${s.numero}` : 'Solicitud'}
            subtitle={s && `${s.tipo.nombre} · registrada ${fechaHora(s.created_at)}${s.creado_por ? ` por ${s.creado_por}` : ''}`}
            footer={modo ? (
                <>
                    <Button variant="ghost" onClick={() => setModo(null)} disabled={guardando}>Volver</Button>
                    <Button variant={modo === 'anular' ? 'danger' : 'primary'} onClick={guardar} loading={guardando}>{modo === 'anular' ? 'Anular solicitud' : 'Guardar cambios'}</Button>
                </>
            ) : (
                <>
                    {editable && puedeEditar && <Button variant="ghost" className="mr-auto text-red-600" onClick={() => empezar('anular')}>Anular</Button>}
                    <Button variant="ghost" onClick={onClose}>Cerrar</Button>
                    {s && <Button variant="secondary" icon={IoPrintOutline} onClick={() => imprimirSolicitud(s, fullName)}>Imprimir</Button>}
                    {editable && puedeEditar && <Button variant="secondary" onClick={() => empezar('editar')}>Corregir datos</Button>}
                </>
            )}
        >
            {!s ? <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div> : (
                <div className="space-y-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <EstadoSolicitud estado={s.estado} />
                        <Prioridad valor={s.prioridad} />
                        {s.orden && (
                            <button type="button" onClick={() => onVerOrden?.(s.orden.id)} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-0.5 hover:bg-gray-50">
                                <span className="font-mono text-xs font-semibold text-gray-700">{s.orden.numero}</span><EstadoOT estado={s.orden.estado} />
                            </button>
                        )}
                        {!s.orden && s.estado.codigo === 'SIN_COBERTURA' && <Badge color="amber">Sin OT: fuera de cobertura</Badge>}
                    </div>

                    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}

                    {modo === 'anular' && (
                        <Field label="Motivo de la anulación" required>
                            <TextArea rows={2} value={v.motivo} onChange={set('motivo')} placeholder="Ej: el cliente desistió" autoFocus />
                            {s.orden && <p className="mt-1 text-xs text-gray-500">También se anula la {s.orden.numero}.</p>}
                        </Field>
                    )}

                    {modo === 'editar' ? (
                        <div className="space-y-3">
                            <UbicacionMapa zonas={zonas} valor={v.ubicacion} alto="h-64" onChange={(lat, lng) => setV((x) => ({ ...x, ubicacion: { lat, lng } }))} />
                            <p className="text-xs text-gray-600">Zona: <ZonaChip zona={zonaNueva} /></p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Field label="Dirección" className="sm:col-span-2"><TextInput value={v.direccion} onChange={set('direccion')} maxLength={255} /></Field>
                                <Field label="Zona / barrio"><TextInput value={v.zona_referencia} onChange={set('zona_referencia')} maxLength={100} /></Field>
                                <Field label="Teléfono de contacto"><TextInput value={v.telefono_contacto} onChange={set('telefono_contacto')} maxLength={20} /></Field>
                                <Field label="Referencias del domicilio" className="sm:col-span-2"><TextArea rows={2} value={v.referencia} onChange={set('referencia')} placeholder="Ej: casa de 2 pisos, garaje color café" /></Field>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <dl className="grid grid-cols-2 content-start gap-x-4 gap-y-3 rounded-xl border border-gray-200 p-4">
                                <Dato label="Cliente" className="col-span-2">{s.cliente.nombre_completo} <span className="text-gray-500">· CI {s.cliente.ci}</span></Dato>
                                <Dato label="Teléfono">{s.telefono_contacto || s.cliente.telefono}</Dato>
                                <Dato label="Correo">{s.cliente.email}</Dato>
                                {s.plan && <Dato label="Plan y servicios" className="col-span-2">{s.plan.nombre} <span className="text-gray-500">· {serviciosTexto(s.servicios)}</span></Dato>}
                                <Dato label="Dirección" className="col-span-2">{s.direccion}{s.zona_referencia ? `, ${s.zona_referencia}` : ''}</Dato>
                                <Dato label="Referencias del domicilio" className="col-span-2"><span className="whitespace-pre-line">{s.referencia}</span></Dato>
                                {s.monto_mensual_ref && <Dato label="Monto referencial informado" className="col-span-2">Bs {Number(s.monto_mensual_ref).toLocaleString('es-BO', { minimumFractionDigits: 2 })}/mes · instalación Bs {Number(s.monto_instalacion_ref || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</Dato>}
                                <Dato label="Zona de cobertura" className="col-span-2"><ZonaChip zona={s.zona} /></Dato>
                                {s.observaciones && <Dato label="Observaciones" className="col-span-2"><span className="whitespace-pre-line">{s.observaciones}</span></Dato>}
                                {s.motivo_anulacion && <Dato label="Motivo de anulación" className="col-span-2"><span className="text-red-700">{s.motivo_anulacion}</span></Dato>}
                            </dl>
                            <UbicacionMapa zonas={zonas} valor={s.ubicacion} soloLectura alto="h-72" />
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default SolicitudModal;
