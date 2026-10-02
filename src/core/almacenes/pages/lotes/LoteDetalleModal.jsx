// src/core/almacenes/pages/lotes/LoteDetalleModal.jsx
// Detalle de un lote: datos, avance por modelo, entregas del proveedor y acciones.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    IoCloudUploadOutline, IoFlaskOutline, IoLayersOutline, IoLockClosedOutline, IoLockOpenOutline,
    IoCreateOutline, IoTrashOutline, IoAddOutline,
} from 'react-icons/io5';
import { Modal, Button, Badge, Spinner, IconButton, Field, TextInput, ConfirmModal, cx } from '../../../../shared/components/ui';
import lotesService from '../../services/lotesService';
import { EstadoLoteBadge, Progreso, fecha, hoyLocal, tipoLote } from './loteUi';

const Dato = ({ label, children }) => (
    <div>
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-800">{children || '—'}</dd>
    </div>
);

const LoteDetalleModal = ({ loteId, open, puede, onClose, onAccion, version }) => {
    const [lote, setLote] = useState(null);
    const [resumen, setResumen] = useState(null);
    const [entregas, setEntregas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState('');
    const [nueva, setNueva] = useState(null); // formulario de entrega
    const [borrarEntrega, setBorrarEntrega] = useState(null);

    const cargar = useCallback(async () => {
        if (!loteId) return;
        setLoading(true);
        const [l, r, e] = await Promise.all([lotesService.obtener(loteId), lotesService.resumen(loteId), lotesService.entregas(loteId)]);
        setLoading(false);
        if (!l.success) { toast.error(l.error); onClose(); return; }
        setLote(l.data);
        if (r.success) setResumen(r.data);
        if (e.success) setEntregas(e.data.entregas || []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loteId]);

    useEffect(() => { if (open) { setNueva(null); cargar(); } else { setLote(null); setResumen(null); } }, [open, cargar, version]);

    const cerrado = lote?.estado_info?.codigo === 'CERRADO';
    const modelos = resumen?.detalles_por_modelo || [];
    const granelPendiente = modelos.some((m) => !m.es_unico && m.cantidad_pendiente > 0);
    const conPendienteUnico = modelos.some((m) => m.es_unico && m.cantidad_pendiente > 0);
    // Solo si hay equipos nuevos de modelos que pasan por laboratorio y aún no se enviaron
    const vaALab = modelos.some((m) => m.requiere_inspeccion && (m.estados_materiales?.Nuevo || 0) > 0);

    const ejecutar = async (clave, fn, ok) => {
        setBusy(clave);
        const r = await fn();
        setBusy('');
        if (!r.success) { toast.error(r.error, { duration: 6000 }); return; }
        toast.success(r.data?.message || ok);
        cargar();
        onAccion('refrescar');
    };

    const guardarEntrega = async () => {
        const cant = parseInt(nueva.cantidad_entregada, 10);
        if (!nueva.fecha_entrega || !(cant >= 1)) { toast.error('Indica la fecha y una cantidad mayor a 0'); return; }
        await ejecutar('entrega', () => lotesService.agregarEntrega(lote.id, { ...nueva, cantidad_entregada: cant }), 'Entrega registrada');
        setNueva(null);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="xl"
            title={lote ? `Lote ${lote.numero_lote}` : 'Lote'}
            subtitle={lote && `${lote.proveedor_info?.nombre_comercial} · recibido el ${fecha(lote.fecha_recepcion)}`}
            footer={<Button variant="ghost" onClick={onClose}>Volver a la lista</Button>}
        >
            {(!lote || (loading && !resumen)) && <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div>}
            {lote && (
                <div className="space-y-6">
                    {/* Acciones */}
                    <div className="flex flex-wrap items-center gap-2">
                        <EstadoLoteBadge estado={lote.estado_info} />
                        <div className="ml-auto flex flex-wrap gap-2">
                            {!cerrado && puede.importar && conPendienteUnico && (
                                <Button variant="secondary" icon={IoCloudUploadOutline} onClick={() => onAccion('importar', lote)}>Cargar equipos</Button>
                            )}
                            {!cerrado && puede.editar && granelPendiente && (
                                <Button variant="secondary" icon={IoLayersOutline} loading={busy === 'granel'} onClick={() => ejecutar('granel', () => lotesService.completarGranel(lote.id), 'Material registrado')}>
                                    Registrar material a granel
                                </Button>
                            )}
                            {!cerrado && puede.editar && vaALab && (
                                <Button variant="secondary" icon={IoFlaskOutline} loading={busy === 'lab'} onClick={() => ejecutar('lab', () => lotesService.enviarLaboratorio(lote.id), 'Enviado a laboratorio')}>
                                    Enviar a laboratorio
                                </Button>
                            )}
                            {!cerrado && puede.editar && <Button variant="secondary" icon={IoCreateOutline} onClick={() => onAccion('editar', lote)}>Editar</Button>}
                            {!cerrado && puede.editar && <Button variant="dark" icon={IoLockClosedOutline} onClick={() => onAccion('cerrar', lote)}>Cerrar lote</Button>}
                            {cerrado && puede.reabrir && <Button variant="secondary" icon={IoLockOpenOutline} onClick={() => onAccion('reabrir', lote)}>Reabrir</Button>}
                        </div>
                    </div>

                    {/* Datos */}
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-gray-200 p-4 md:grid-cols-4">
                        <Dato label="Tipo">{tipoLote(lote.tipo_ingreso_info)}</Dato>
                        <Dato label="Almacén donde se recibe">{lote.almacen_destino_info?.nombre}</Dato>
                        <Dato label="Sector que lo solicitó">{lote.sector_solicitante_info?.nombre}</Dato>
                        <Dato label="Req. de compra (Sprint)">{lote.codigo_requerimiento_compra}</Dato>
                        <Dato label="Nota de ingreso (Sprint)">{lote.codigo_nota_ingreso}</Dato>
                        <Dato label="Garantía">{fecha(lote.fecha_inicio_garantia)} – {fecha(lote.fecha_fin_garantia)}</Dato>
                        <Dato label="Registrado por">{lote.created_by_nombre}</Dato>
                        {lote.observaciones && <div className="col-span-2 md:col-span-4"><Dato label="Observaciones"><span className="whitespace-pre-line">{lote.observaciones}</span></Dato></div>}
                    </dl>

                    {/* Avance por modelo */}
                    <section>
                        <div className="mb-2 flex items-end justify-between">
                            <h4 className="font-semibold text-gray-800">Avance de la recepción</h4>
                            <div className="w-56"><Progreso recibido={lote.cantidad_recibida} total={lote.cantidad_total} /></div>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr><th className="px-4 py-2">Modelo</th><th className="px-4 py-2 text-right">Esperado</th><th className="px-4 py-2 text-right">Recibido</th><th className="px-4 py-2 text-right">Falta</th><th className="w-40 px-4 py-2">Estado de los equipos</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {modelos.map((m) => (
                                        <tr key={m.modelo_id}>
                                            <td className="px-4 py-2">
                                                <p className="font-medium text-gray-800">{m.modelo_nombre}</p>
                                                <p className="flex flex-wrap items-center gap-1 text-xs text-gray-500">{m.tipo_material}{m.requiere_inspeccion && <Badge color="amber">Laboratorio</Badge>}</p>
                                            </td>
                                            <td className="px-4 py-2 text-right text-gray-700">{m.cantidad_esperada} {m.unidad_medida}</td>
                                            <td className="px-4 py-2 text-right font-medium text-gray-800">{m.cantidad_recibida}</td>
                                            <td className={cx('px-4 py-2 text-right', m.cantidad_pendiente ? 'font-medium text-amber-700' : 'text-green-700')}>{m.cantidad_pendiente || '✓'}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.entries(m.estados_materiales || {}).map(([e, n]) => <Badge key={e} color={e === 'Disponible' ? 'green' : e === 'Defectuoso' ? 'red' : 'gray'}>{n} {e}</Badge>)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Entregas */}
                    <section>
                        <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800">Entregas del proveedor <span className="font-normal text-gray-500">({entregas.length})</span></h4>
                            {!cerrado && puede.editar && !nueva && (
                                <Button variant="ghost" className="px-2 py-1 text-xs" icon={IoAddOutline} onClick={() => setNueva({ fecha_entrega: hoyLocal(), cantidad_entregada: '', observaciones: '' })}>
                                    Registrar entrega
                                </Button>
                            )}
                        </div>
                        {nueva && (
                            <div className="mb-3 grid grid-cols-1 items-end gap-3 rounded-xl border border-orange-200 bg-orange-50/50 p-3 sm:grid-cols-4">
                                <Field label="Fecha"><TextInput type="date" value={nueva.fecha_entrega} onChange={(e) => setNueva((x) => ({ ...x, fecha_entrega: e.target.value }))} /></Field>
                                <Field label="Cantidad"><TextInput type="number" min={1} value={nueva.cantidad_entregada} onChange={(e) => setNueva((x) => ({ ...x, cantidad_entregada: e.target.value }))} /></Field>
                                <Field label="Observaciones"><TextInput value={nueva.observaciones} onChange={(e) => setNueva((x) => ({ ...x, observaciones: e.target.value }))} /></Field>
                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => setNueva(null)} disabled={busy === 'entrega'}>Cancelar</Button>
                                    <Button onClick={guardarEntrega} loading={busy === 'entrega'}>Guardar</Button>
                                </div>
                            </div>
                        )}
                        {entregas.length ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr><th className="px-4 py-2">#</th><th className="px-4 py-2">Fecha</th><th className="px-4 py-2 text-right">Cantidad</th><th className="px-4 py-2 text-right">Cargados</th><th className="px-4 py-2">Observaciones</th><th className="w-12 px-4 py-2" /></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {entregas.map((x) => (
                                            <tr key={x.id}>
                                                <td className="px-4 py-2 font-medium text-gray-800">{x.numero_entrega}</td>
                                                <td className="px-4 py-2 text-gray-700">{fecha(x.fecha_entrega)}</td>
                                                <td className="px-4 py-2 text-right text-gray-700">{x.cantidad_entregada}</td>
                                                <td className="px-4 py-2 text-right text-gray-700">{x.materiales_count}</td>
                                                <td className="max-w-xs truncate px-4 py-2 text-xs text-gray-500" title={x.observaciones}>{x.observaciones || '—'}</td>
                                                <td className="px-4 py-2">
                                                    {!cerrado && puede.editar && (
                                                        <IconButton
                                                            icon={IoTrashOutline}
                                                            tone="danger"
                                                            title={x.materiales_count ? 'Tiene equipos cargados: no se puede quitar' : 'Quitar entrega'}
                                                            disabled={!!x.materiales_count}
                                                            onClick={() => setBorrarEntrega(x)}
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">Aún no hay entregas. Se registran solas al cargar equipos desde Excel.</p>}
                    </section>
                </div>
            )}

            <ConfirmModal
                open={!!borrarEntrega}
                danger
                loading={busy === 'borrar'}
                title="Quitar entrega"
                confirmText="Quitar"
                message={<>¿Quitar la entrega #{borrarEntrega?.numero_entrega} del {fecha(borrarEntrega?.fecha_entrega)}?</>}
                onClose={() => setBorrarEntrega(null)}
                onConfirm={async () => { await ejecutar('borrar', () => lotesService.eliminarEntrega(lote.id, borrarEntrega.id), 'Entrega quitada'); setBorrarEntrega(null); }}
            />
        </Modal>
    );
};

export default LoteDetalleModal;
