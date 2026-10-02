// src/core/almacenes/pages/lotes/LoteFormModal.jsx
// Crear / editar lote: datos generales, modelos con cantidades, códigos Sprint y fechas.
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoAddOutline, IoTrashOutline } from 'react-icons/io5';
import { Modal, Button, Field, TextInput, TextArea, SelectInput, IconButton } from '../../../../shared/components/ui';
import lotesService from '../../services/lotesService';
import { hoyLocal } from './loteUi';

const hoy = hoyLocal;
const masUnAnio = (f) => `${Number(f.slice(0, 4)) + 1}${f.slice(4)}`;

const Seccion = ({ titulo, children, accion }) => (
    <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-1">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{titulo}</h4>
            {accion}
        </div>
        {children}
    </section>
);

const LoteFormModal = ({ open, lote, opciones, onClose, onSaved }) => {
    const editando = !!lote;
    const [v, setV] = useState({});
    const [filas, setFilas] = useState([]);
    const [err, setErr] = useState({});
    const [guardando, setGuardando] = useState(false);
    const [proximo, setProximo] = useState('');

    // Un lote es lo que entrega el proveedor: compra o reposición por garantía
    const tiposIngreso = (opciones.tipos_ingreso || []).filter((t) => ['NUEVO', 'REPOSICION'].includes(t.codigo));
    const nombreTipo = (t) => (t.codigo === 'NUEVO' ? 'Compra' : t.nombre);
    const almacenes = (opciones.almacenes || []).filter((a) => a.activo !== false);
    const principal = almacenes.find((a) => a.es_principal);
    const modelos = useMemo(() => (opciones.modelos || []).filter((m) => m.activo !== false), [opciones.modelos]);
    const modeloPorId = useMemo(() => Object.fromEntries(modelos.map((m) => [String(m.id), m])), [modelos]);

    useEffect(() => {
        if (!open) return;
        setErr({});
        if (lote) {
            setV({
                tipo_ingreso: String(lote.tipo_ingreso ?? ''), proveedor: String(lote.proveedor ?? ''),
                almacen_destino: String(lote.almacen_destino ?? ''),
                sector_solicitante: lote.sector_solicitante ? String(lote.sector_solicitante) : '',
                codigo_requerimiento_compra: lote.codigo_requerimiento_compra ?? '', codigo_nota_ingreso: lote.codigo_nota_ingreso ?? '',
                fecha_recepcion: lote.fecha_recepcion ?? '', fecha_inicio_garantia: lote.fecha_inicio_garantia ?? '',
                fecha_fin_garantia: lote.fecha_fin_garantia ?? '', observaciones: lote.observaciones ?? '',
            });
            setFilas((lote.detalles || []).map((d) => ({ modelo: String(d.modelo), cantidad: String(d.cantidad), recibido: Number(d.cantidad_recibida) || 0 })));
        } else {
            const nuevo = tiposIngreso.find((t) => t.codigo === 'NUEVO');
            setV({
                tipo_ingreso: nuevo ? String(nuevo.id) : '', proveedor: '', almacen_destino: principal ? String(principal.id) : '',
                sector_solicitante: '', codigo_requerimiento_compra: '', codigo_nota_ingreso: '',
                fecha_recepcion: hoy(), fecha_inicio_garantia: hoy(), fecha_fin_garantia: masUnAnio(hoy()), observaciones: '',
            });
            setFilas([{ modelo: '', cantidad: '1', recibido: 0 }]);
            lotesService.proximoNumero().then((r) => r.success && setProximo(r.data.proximo_numero));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, lote?.id]);

    const set = (k) => (e) => {
        const valor = e?.target ? e.target.value : e;
        setV((x) => {
            const n = { ...x, [k]: valor };
            // Garantía por defecto: 1 año desde el inicio
            if (k === 'fecha_inicio_garantia' && valor && (!x.fecha_fin_garantia || x.fecha_fin_garantia <= valor)) n.fecha_fin_garantia = masUnAnio(valor);
            return n;
        });
        setErr((x) => ({ ...x, [k]: undefined }));
    };

    const setFila = (i, k, valor) => { setFilas((f) => f.map((x, j) => (j === i ? { ...x, [k]: valor } : x))); setErr((x) => ({ ...x, detalles: undefined })); };
    const elegidos = new Set(filas.map((f) => f.modelo).filter(Boolean));

    const validar = () => {
        const e = {};
        ['tipo_ingreso', 'proveedor', 'almacen_destino', 'fecha_recepcion', 'fecha_inicio_garantia', 'fecha_fin_garantia']
            .forEach((k) => { if (!v[k]) e[k] = 'Obligatorio'; });
        ['codigo_requerimiento_compra', 'codigo_nota_ingreso'].forEach((k) => {
            if (!/^\d{6,10}$/.test((v[k] || '').trim())) e[k] = 'De 6 a 10 dígitos';
        });
        if (v.fecha_inicio_garantia && v.fecha_fin_garantia && v.fecha_fin_garantia <= v.fecha_inicio_garantia) e.fecha_fin_garantia = 'Debe ser posterior al inicio';
        const validas = filas.filter((f) => f.modelo);
        if (!validas.length) e.detalles = 'Agrega al menos un modelo';
        else if (validas.some((f) => !(parseInt(f.cantidad, 10) >= 1))) e.detalles = 'Las cantidades deben ser mayores a 0';
        else if (validas.some((f) => parseInt(f.cantidad, 10) < f.recibido)) e.detalles = 'Una cantidad es menor a lo ya recibido';
        return e;
    };

    const guardar = async () => {
        const e = validar();
        if (Object.keys(e).length) { setErr(e); return; }
        const datos = {
            ...v,
            codigo_requerimiento_compra: v.codigo_requerimiento_compra.trim(),
            codigo_nota_ingreso: v.codigo_nota_ingreso.trim(),
            observaciones: v.observaciones.trim(),
            detalles: filas.filter((f) => f.modelo).map((f) => ({ modelo: parseInt(f.modelo, 10), cantidad: parseInt(f.cantidad, 10) })),
        };
        ['tipo_ingreso', 'proveedor', 'almacen_destino'].forEach((k) => { datos[k] = parseInt(datos[k], 10); });
        datos.sector_solicitante = datos.sector_solicitante ? parseInt(datos.sector_solicitante, 10) : null;
        setGuardando(true);
        const r = editando ? await lotesService.actualizar(lote.id, datos) : await lotesService.crear(datos);
        setGuardando(false);
        if (!r.success) {
            setErr(r.fieldErrors || {});
            toast.error(r.error, { duration: 6000 });
            return;
        }
        toast.success(editando ? `Lote ${r.data.numero_lote} actualizado` : `Lote ${r.data.numero_lote} creado. Ahora puedes registrar los equipos.`);
        onSaved?.(r.data);
    };

    const sel = (k, label, items, render, extra = {}) => (
        <Field label={label} required={!extra.opcional} error={err[k]} hint={extra.hint}>
            <SelectInput value={v[k] ?? ''} onChange={set(k)} disabled={guardando || extra.disabled}>
                <option value="">{extra.opcional ? 'Ninguno' : 'Seleccionar…'}</option>
                {items.map((o) => <option key={o.id} value={o.id}>{render(o)}</option>)}
            </SelectInput>
        </Field>
    );
    const txt = (k, label, props = {}) => (
        <Field label={label} required={props.required} error={err[k]} hint={props.hint}>
            <TextInput value={v[k] ?? ''} onChange={set(k)} disabled={guardando} error={err[k]} {...props} />
        </Field>
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            size="xl"
            title={editando ? `Editar lote ${lote.numero_lote}` : 'Nuevo lote'}
            subtitle={editando ? `${lote.proveedor_info?.nombre_comercial} · ${lote.estado_info?.nombre}` : proximo && `Se registrará como ${proximo}`}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={guardando}>Cancelar</Button>
                    <Button onClick={guardar} loading={guardando}>{editando ? 'Guardar cambios' : 'Crear lote'}</Button>
                </>
            }
        >
            <div className="space-y-6">
                <Seccion titulo="Datos del lote">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {sel('tipo_ingreso', 'Tipo', tiposIngreso, nombreTipo)}
                        {sel('proveedor', 'Proveedor', (opciones.proveedores || []).filter((p) => p.activo !== false || String(p.id) === v.proveedor), (p) => p.nombre_comercial)}
                        {sel('almacen_destino', 'Almacén donde se recibe', almacenes, (a) => `${a.nombre}${a.es_principal ? ' (principal)' : ''}`)}
                        {sel('sector_solicitante', 'Sector que lo solicitó', (opciones.sectores_solicitantes || []).filter((s) => s.activo !== false), (s) => s.nombre, { opcional: true })}
                    </div>
                </Seccion>

                <Seccion
                    titulo="Modelos y cantidades"
                    accion={<Button variant="ghost" className="px-2 py-1 text-xs" icon={IoAddOutline} onClick={() => setFilas((f) => [...f, { modelo: '', cantidad: '1', recibido: 0 }])} disabled={guardando}>Agregar modelo</Button>}
                >
                    <div className="space-y-2">
                        {filas.map((f, i) => {
                            const m = modeloPorId[f.modelo];
                            return (
                                <div key={i} className="flex items-start gap-2">
                                    <SelectInput className="flex-1" value={f.modelo} onChange={(e) => setFila(i, 'modelo', e.target.value)} disabled={guardando || f.recibido > 0}>
                                        <option value="">Seleccionar modelo…</option>
                                        {modelos.filter((x) => !elegidos.has(String(x.id)) || String(x.id) === f.modelo).map((x) => (
                                            <option key={x.id} value={x.id}>{x.marca_info?.nombre} {x.nombre} · {x.tipo_material_info?.nombre}</option>
                                        ))}
                                    </SelectInput>
                                    <div className="w-36">
                                        <div className="relative">
                                            <TextInput type="number" min={Math.max(1, f.recibido)} value={f.cantidad} onChange={(e) => setFila(i, 'cantidad', e.target.value)} disabled={guardando} className="pr-12" />
                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{m?.unidad_medida_info?.simbolo}</span>
                                        </div>
                                        {f.recibido > 0 && <p className="mt-0.5 text-[11px] text-gray-500">Recibido: {f.recibido}</p>}
                                    </div>
                                    <IconButton icon={IoTrashOutline} tone="danger" title={f.recibido > 0 ? 'Ya tiene material recibido' : 'Quitar'} disabled={guardando || f.recibido > 0 || filas.length === 1} onClick={() => setFilas((x) => x.filter((_, j) => j !== i))} />
                                </div>
                            );
                        })}
                        {err.detalles && <p className="text-xs text-red-600">{err.detalles}</p>}
                        <p className="text-xs text-gray-500">Después de crear el lote, los equipos con serie (ONU) se cargan desde Excel y los materiales a granel se registran con un clic.</p>
                    </div>
                </Seccion>

                <Seccion titulo="Códigos Sprint y fechas">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {txt('codigo_requerimiento_compra', 'Requerimiento de compra', { required: true, inputMode: 'numeric', maxLength: 10, placeholder: '6 a 10 dígitos' })}
                        {txt('codigo_nota_ingreso', 'Nota de ingreso', { required: true, inputMode: 'numeric', maxLength: 10, placeholder: '6 a 10 dígitos' })}
                        {txt('fecha_recepcion', 'Fecha de recepción', { required: true, type: 'date' })}
                        {txt('fecha_inicio_garantia', 'Inicio de garantía', { required: true, type: 'date' })}
                        {txt('fecha_fin_garantia', 'Fin de garantía', { required: true, type: 'date' })}
                    </div>
                    <Field label="Observaciones">
                        <TextArea rows={2} value={v.observaciones ?? ''} onChange={set('observaciones')} disabled={guardando} />
                    </Field>
                </Seccion>
            </div>
        </Modal>
    );
};

export default LoteFormModal;
