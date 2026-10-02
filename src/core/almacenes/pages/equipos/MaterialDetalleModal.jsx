// src/core/almacenes/pages/equipos/MaterialDetalleModal.jsx
// Ficha de un equipo (o registro de material a granel): datos, laboratorio e historial.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoCopyOutline, IoCheckmarkCircle, IoCloseCircle, IoSwapHorizontalOutline } from 'react-icons/io5';
import { Modal, Button, Badge, Spinner, Field, SelectInput, TextArea, cx } from '../../../../shared/components/ui';
import inventarioService from '../../services/inventarioService';
import { EstadoMaterialBadge, fechaHora } from './inventarioUi';
import { fecha } from '../lotes/loteUi';

const Dato = ({ label, children, mono, copiar }) => (
    <div>
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className={cx('flex items-center gap-1 text-sm text-gray-800', mono && 'font-mono')}>
            {children || '—'}
            {copiar && children && (
                <button type="button" title="Copiar" className="rounded p-0.5 text-gray-400 hover:text-orange-600"
                    onClick={() => { navigator.clipboard?.writeText(String(children)); toast.success('Copiado'); }}>
                    <IoCopyOutline className="h-3.5 w-3.5" />
                </button>
            )}
        </dd>
    </div>
);

const MaterialDetalleModal = ({ materialId, open, onClose, estados = [], puedeEditar, onCambio }) => {
    const [m, setM] = useState(null);
    const [corregir, setCorregir] = useState(null); // { estado, motivo }
    const [guardando, setGuardando] = useState(false);

    const cargar = useCallback(async () => {
        if (!materialId) return;
        const r = await inventarioService.obtener(materialId);
        if (r.success) setM(r.data);
        else { toast.error(r.error); onClose(); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [materialId]);

    useEffect(() => { if (open) { setM(null); setCorregir(null); cargar(); } }, [open, cargar]);

    const esUnico = m?.tipo_material_info?.es_unico;
    const guardarEstado = async () => {
        if (!corregir.estado) { toast.error('Elige el nuevo estado'); return; }
        if (corregir.motivo.trim().length < 5) { toast.error('Indica el motivo (mínimo 5 caracteres)'); return; }
        setGuardando(true);
        const r = await inventarioService.cambiarEstado(m.id, corregir.estado, corregir.motivo.trim());
        setGuardando(false);
        if (!r.success) { toast.error(r.error); return; }
        toast.success(r.data.message);
        setCorregir(null);
        cargar();
        onCambio?.();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title={m ? (esUnico ? m.gpon_serial || m.codigo_interno : `${m.modelo_info?.marca} ${m.modelo_info?.nombre}`) : 'Equipo'}
            subtitle={m && `${m.modelo_info?.marca} ${m.modelo_info?.nombre} · ${m.codigo_interno}`}
            footer={<Button variant="ghost" onClick={onClose}>Volver</Button>}
        >
            {!m ? <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div> : (
                <div className="space-y-6 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <EstadoMaterialBadge estado={m.estado_display} />
                        {m.es_nuevo ? <Badge color="blue">Nuevo</Badge> : <Badge color="gray">Reingresado</Badge>}
                        {m.estado_display?.codigo === 'EN_LABORATORIO' && <span className="ml-auto text-xs text-gray-500">En inspección: el resultado se registra en Laboratorio</span>}
                        {puedeEditar && !corregir && m.estado_display?.codigo !== 'EN_LABORATORIO' && (
                            <Button variant="secondary" className="ml-auto" icon={IoSwapHorizontalOutline} onClick={() => setCorregir({ estado: '', motivo: '' })}>Corregir estado</Button>
                        )}
                    </div>

                    {corregir && (
                        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                            <p className="text-amber-800">Úsalo solo para corregir errores. Queda registrado en el historial con tu usuario y el motivo.</p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Field label="Nuevo estado" required>
                                    <SelectInput value={corregir.estado} onChange={(e) => setCorregir((c) => ({ ...c, estado: e.target.value }))} disabled={guardando}>
                                        <option value="">Seleccionar…</option>
                                        {estados.filter((e) => e.codigo !== 'EN_LABORATORIO' && e.id !== m.estado_display?.id).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                    </SelectInput>
                                </Field>
                                <Field label="Motivo" required>
                                    <TextArea rows={2} value={corregir.motivo} onChange={(e) => setCorregir((c) => ({ ...c, motivo: e.target.value }))} disabled={guardando} placeholder="Ej: Se registró como disponible pero tiene el puerto PON dañado" />
                                </Field>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setCorregir(null)} disabled={guardando}>Cancelar</Button>
                                <Button onClick={guardarEstado} loading={guardando}>Guardar cambio</Button>
                            </div>
                        </div>
                    )}

                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-gray-200 p-4 md:grid-cols-3">
                        {esUnico ? (
                            <>
                                <Dato label="GPON Serial" mono copiar>{m.gpon_serial}</Dato>
                                <Dato label="MAC" mono copiar>{m.mac_address}</Dato>
                                <Dato label="D-SN (serie fabricante)" mono copiar>{m.serial_manufacturer}</Dato>
                            </>
                        ) : (
                            <Dato label="Cantidad">{Number(m.cantidad).toLocaleString('es-BO')} {m.modelo_info?.unidad_medida || ''}</Dato>
                        )}
                        <Dato label="Código interno" mono>{m.codigo_interno}</Dato>
                        <Dato label="Ítem Sprint" mono>{m.codigo_item_equipo}</Dato>
                        <Dato label="Almacén actual">{m.almacen_info?.nombre}</Dato>
                        <Dato label="Lote">{m.lote_info?.numero_lote}</Dato>
                        <Dato label="Proveedor">{m.lote_info?.proveedor_info?.nombre_comercial}</Dato>
                        <Dato label="Ingreso">{fecha(m.created_at)}{m.numero_entrega_parcial ? ` · entrega #${m.numero_entrega_parcial}` : ''}</Dato>
                        {m.observaciones && <div className="col-span-2 md:col-span-3"><Dato label="Observaciones"><span className="whitespace-pre-line">{m.observaciones}</span></Dato></div>}
                    </dl>

                    {esUnico && (
                        <section>
                            <h4 className="mb-2 font-semibold text-gray-800">Laboratorio</h4>
                            {m.inspecciones?.length ? (
                                <div className="space-y-2">
                                    {m.inspecciones.map((i) => (
                                        <div key={i.id} className="rounded-xl border border-gray-200 p-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {i.aprobado ? <Badge color="green"><IoCheckmarkCircle className="h-3.5 w-3.5" /> Aprobado</Badge> : <Badge color="red"><IoCloseCircle className="h-3.5 w-3.5" /> Rechazado</Badge>}
                                                <span className="text-gray-500">{fechaHora(i.fecha)} · informe {i.numero_informe}{i.tecnico ? ` · ${i.tecnico}` : ''}</span>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {Object.entries(i.pruebas).map(([n, ok]) => <Badge key={n} color={ok ? 'gray' : 'red'}>{ok ? '✓' : '✗'} {n}</Badge>)}
                                            </div>
                                            {!!i.fallas?.length && <p className="mt-2 text-red-700">Fallas: {i.fallas.join(', ')}</p>}
                                            {i.observaciones && <p className="mt-1 text-gray-600">{i.observaciones}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-gray-500">Sin inspecciones registradas.</p>}
                        </section>
                    )}

                    <section>
                        <h4 className="mb-2 font-semibold text-gray-800">Historial</h4>
                        {m.historial?.length ? (
                            <ol className="space-y-3 border-l-2 border-gray-200 pl-4">
                                {m.historial.map((h) => (
                                    <li key={h.id} className="relative">
                                        <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-orange-400" />
                                        <p className="font-medium text-gray-800">{h.motivo}</p>
                                        <p className="text-gray-600">
                                            {h.estado_anterior && <>{h.estado_anterior} → </>}{h.estado_nuevo}
                                            {h.almacen_anterior && h.almacen_nuevo && h.almacen_anterior !== h.almacen_nuevo && <> · {h.almacen_anterior} → {h.almacen_nuevo}</>}
                                        </p>
                                        {h.observaciones && <p className="text-gray-500">{h.observaciones}</p>}
                                        <p className="text-xs text-gray-400">{fechaHora(h.fecha_cambio)}{h.usuario ? ` · ${h.usuario}` : ''}</p>
                                    </li>
                                ))}
                            </ol>
                        ) : <p className="text-gray-500">Sin movimientos registrados desde su ingreso.</p>}
                    </section>
                </div>
            )}
        </Modal>
    );
};

export default MaterialDetalleModal;
