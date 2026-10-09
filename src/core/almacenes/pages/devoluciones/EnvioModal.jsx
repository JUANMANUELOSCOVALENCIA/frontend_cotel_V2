// src/core/almacenes/pages/devoluciones/EnvioModal.jsx
// Detalle de un envío a garantía y registro de la respuesta del proveedor por equipo.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoSwapHorizontalOutline, IoConstructOutline, IoTrashBinOutline } from 'react-icons/io5';
import { Modal, Button, Badge, Spinner, Field, TextInput, TextArea, cx } from '../../../../shared/components/ui';
import garantiasService from '../../services/garantiasService';
import { fecha } from '../lotes/loteUi';
import { fechaHora } from '../equipos/inventarioUi';
import { GarantiaLote } from './PorEnviarTab';

const COLOR = { PENDIENTE: 'amber', REEMPLAZADO: 'green', REPARADO: 'blue', SIN_REPOSICION: 'gray' };

const OPCIONES = [
    { id: 'REEMPLAZADO', icon: IoSwapHorizontalOutline, titulo: 'Lo cambió por otro equipo', texto: 'Se registra el equipo nuevo; el enviado queda Reemplazado.' },
    { id: 'REPARADO', icon: IoConstructOutline, titulo: 'Devolvió el mismo, reparado', texto: 'El mismo equipo vuelve como Nuevo y pasa por laboratorio.' },
    { id: 'SIN_REPOSICION', icon: IoTrashBinOutline, titulo: 'No lo repone', texto: 'El equipo queda Dado de baja. Indica el motivo.' },
];

const Respuesta = ({ envioId, detalle, onListo, onCancelar }) => {
    const [v, setV] = useState({ resultado: '', mac_address: '', gpon_serial: '', serial_manufacturer: '', observaciones: '' });
    const [errores, setErrores] = useState({});
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);
    const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); setErrores((x) => ({ ...x, [k]: undefined })); setError(''); };

    const guardar = async () => {
        const err = {};
        if (!v.resultado) { setError('Elige qué respondió el proveedor.'); return; }
        if (v.resultado === 'REEMPLAZADO') {
            if (!v.mac_address.trim()) err.mac_address = 'Obligatoria';
            if (v.gpon_serial.trim().length < 8) err.gpon_serial = 'Mínimo 8 caracteres';
        }
        if (v.resultado === 'SIN_REPOSICION' && v.observaciones.trim().length < 5) err.observaciones = 'Indica el motivo (mínimo 5 caracteres)';
        setErrores(err);
        if (Object.keys(err).length) return;
        setGuardando(true);
        const r = await garantiasService.resolver(envioId, { detalle: detalle.id, ...v });
        setGuardando(false);
        if (!r.success) { setError(r.error); setErrores(r.fieldErrors || {}); return; }
        toast.success(r.data.message, { duration: 5000 });
        onListo(r.data);
    };

    return (
        <div className="space-y-3 rounded-xl border border-orange-200 bg-orange-50/40 p-4">
            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {OPCIONES.map((o) => (
                    <button
                        key={o.id}
                        type="button"
                        onClick={() => { setV((x) => ({ ...x, resultado: o.id })); setError(''); }}
                        className={cx('rounded-lg border p-3 text-left', v.resultado === o.id ? 'border-orange-500 bg-white ring-2 ring-orange-500/20' : 'border-gray-200 bg-white hover:border-gray-300')}
                    >
                        <p className="flex items-center gap-2 font-medium text-gray-800"><o.icon className="h-4 w-4 text-orange-500" />{o.titulo}</p>
                        <p className="mt-1 text-xs text-gray-500">{o.texto}</p>
                    </button>
                ))}
            </div>
            {v.resultado === 'REEMPLAZADO' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field label="MAC del equipo nuevo" required error={errores.mac_address} hint="Con o sin separadores">
                        <TextInput value={v.mac_address} onChange={set('mac_address')} error={errores.mac_address} className="font-mono" disabled={guardando} />
                    </Field>
                    <Field label="GPON serial" required error={errores.gpon_serial}>
                        <TextInput value={v.gpon_serial} onChange={set('gpon_serial')} error={errores.gpon_serial} className="font-mono" disabled={guardando} />
                    </Field>
                    <Field label="D-SN" error={errores.serial_manufacturer}>
                        <TextInput value={v.serial_manufacturer} onChange={set('serial_manufacturer')} className="font-mono" disabled={guardando} />
                    </Field>
                </div>
            )}
            {v.resultado && (
                <Field label={v.resultado === 'SIN_REPOSICION' ? 'Motivo' : 'Observaciones'} required={v.resultado === 'SIN_REPOSICION'} error={errores.observaciones}>
                    <TextArea rows={2} value={v.observaciones} onChange={set('observaciones')} disabled={guardando}
                        placeholder={v.resultado === 'SIN_REPOSICION' ? 'Ej: garantía vencida, el proveedor no reconoce la falla' : 'Opcional'} />
                </Field>
            )}
            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onCancelar} disabled={guardando}>Cancelar</Button>
                <Button onClick={guardar} loading={guardando} disabled={!v.resultado}>Guardar respuesta</Button>
            </div>
        </div>
    );
};

const EnvioModal = ({ envioId, open, puedeEditar, onClose, onCambio }) => {
    const [e, setE] = useState(null);
    const [respondiendo, setRespondiendo] = useState(null); // id del detalle

    const cargar = useCallback(async () => {
        if (!envioId) return;
        const r = await garantiasService.obtener(envioId);
        if (r.success) setE(r.data);
        else { toast.error(r.error); onClose(); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [envioId]);
    useEffect(() => { if (open) { setE(null); setRespondiendo(null); cargar(); } }, [open, cargar]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="xl"
            title={e ? `${e.numero} · ${e.proveedor.nombre}` : 'Envío a garantía'}
            subtitle={e && `Enviado el ${fecha(e.fecha_envio)}${e.referencia ? ` · ${e.referencia}` : ''}${e.area_tramite ? ` · trámite: ${e.area_tramite.nombre}` : ''}`}
            footer={<Button variant="ghost" onClick={onClose}>Cerrar</Button>}
        >
            {!e ? <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div> : (
                <div className="space-y-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        {e.cerrado ? <Badge color="green">Cerrado en {e.dias} día(s)</Badge> : <Badge color="amber">Esperando respuesta · {e.pendientes} de {e.total} pendiente(s)</Badge>}
                        <span className="text-xs text-gray-500">Registrado por {e.creado_por}</span>
                    </div>
                    {e.observaciones && <p className="whitespace-pre-line text-gray-600">{e.observaciones}</p>}

                    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                        {e.detalles.map((d) => (
                            <div key={d.id} className="space-y-3 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="font-mono font-semibold text-gray-800">{d.material.gpon_serial || d.material.codigo_interno}</p>
                                        <p className="font-mono text-xs text-gray-500">{d.material.mac_address}{d.material.serial_manufacturer ? ` · ${d.material.serial_manufacturer}` : ''}</p>
                                        <p className="text-xs text-gray-500">{d.material.modelo} · lote {d.material.lote.numero_lote}</p>
                                        <div className="mt-1"><GarantiaLote lote={d.material.lote} /></div>
                                    </div>
                                    <div className="max-w-sm text-right">
                                        <Badge color={COLOR[d.resultado]}>{d.resultado_display}</Badge>
                                        {d.falla && <p className="mt-1 text-xs text-red-700">Falla: {d.falla}</p>}
                                    </div>
                                </div>

                                {d.resultado !== 'PENDIENTE' && (
                                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                                        {d.reposicion && <p>Equipo nuevo: <span className="font-mono text-gray-800">{d.reposicion.gpon_serial}</span> · <span className="font-mono">{d.reposicion.mac_address}</span></p>}
                                        {d.observaciones && <p>{d.observaciones}</p>}
                                        <p className="text-gray-400">{fechaHora(d.fecha_respuesta)}{d.respondido_por ? ` · ${d.respondido_por}` : ''}</p>
                                    </div>
                                )}

                                {d.resultado === 'PENDIENTE' && puedeEditar && (
                                    respondiendo === d.id ? (
                                        <Respuesta
                                            envioId={e.id}
                                            detalle={d}
                                            onCancelar={() => setRespondiendo(null)}
                                            onListo={(nuevo) => { setE(nuevo); setRespondiendo(null); onCambio?.(); }}
                                        />
                                    ) : (
                                        <Button variant="secondary" onClick={() => setRespondiendo(d.id)}>Registrar respuesta del proveedor</Button>
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default EnvioModal;
