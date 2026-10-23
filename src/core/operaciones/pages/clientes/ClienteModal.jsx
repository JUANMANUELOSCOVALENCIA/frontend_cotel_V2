// src/core/operaciones/pages/clientes/ClienteModal.jsx
// Ficha del cliente: datos de contacto (editables), contratos con su deuda y solicitudes.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoCreateOutline, IoAlertCircle, IoCheckmarkCircle } from 'react-icons/io5';
import { Modal, Button, Badge, Spinner, Field, TextInput, cx } from '../../../../shared/components/ui';
import { clientesService } from '../../services/operacionesService';
import { EstadoSolicitud, EstadoOT, fechaCorta } from '../../components/opUi';

export const bs = (n) => `Bs ${Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const CAMPOS = ['nombres', 'apellidos', 'telefono', 'telefono_alternativo', 'email', 'direccion', 'zona', 'ciudad'];

export const Situacion = ({ valor }) => ({
    bloqueado: <Badge color="red">Bloqueado por deuda</Badge>,
    deuda: <Badge color="amber">Con deuda</Badge>,
    al_dia: <Badge color="green">Al día</Badge>,
}[valor] || null);

const Dato = ({ label, children, className }) => (
    <div className={className}>
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="text-gray-800">{children || '—'}</dd>
    </div>
);

const Seccion = ({ titulo, extra, children }) => (
    <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-gray-800">{titulo}</h4>
            {extra}
        </div>
        {children}
    </section>
);

const ClienteModal = ({ id, puedeEditar, onClose, onCambio }) => {
    const [c, setC] = useState(null);
    const [editando, setEditando] = useState(false);
    const [v, setV] = useState({});
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);

    const cargar = useCallback(async () => {
        const r = await clientesService.obtener(id);
        if (r.success) setC(r.data); else { toast.error(r.error); onClose(); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    useEffect(() => { if (id) { setC(null); setEditando(false); cargar(); } }, [id, cargar]);

    const editar = () => { setV(Object.fromEntries(CAMPOS.map((k) => [k, c[k] || '']))); setErrores({}); setEditando(true); };
    const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); setErrores((x) => ({ ...x, [k]: '' })); };

    const guardar = async () => {
        setGuardando(true);
        const r = await clientesService.editar(c.id, Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x.trim()])));
        setGuardando(false);
        if (!r.success) { setErrores(r.fieldErrors || {}); if (!Object.keys(r.fieldErrors || {}).length) toast.error(r.error); return; }
        toast.success(r.data.message);
        setC(r.data); setEditando(false); onCambio?.();
    };

    const d = c?.deuda;
    const situacion = d?.bloquea ? 'bloqueado' : d?.facturas ? 'deuda' : 'al_dia';

    return (
        <Modal
            open={!!id}
            onClose={onClose}
            busy={guardando}
            size="xl"
            title={c ? c.nombre : 'Cliente'}
            subtitle={c && `CI ${c.ci}${c.fecha_registro ? ` · registrado ${fechaCorta(c.fecha_registro)}` : ''}`}
            footer={editando ? (
                <>
                    <Button variant="ghost" onClick={() => setEditando(false)} disabled={guardando}>Cancelar</Button>
                    <Button onClick={guardar} loading={guardando}>Guardar</Button>
                </>
            ) : <Button variant="ghost" onClick={onClose}>Cerrar</Button>}
        >
            {!c ? <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div> : (
                <div className="space-y-6 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <Situacion valor={situacion} />
                    </div>

                    {d && d.facturas > 0 && (
                        <div className={cx('flex items-start gap-2 rounded-lg px-3 py-2', d.bloquea ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800')}>
                            <IoAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                            <span>{d.mensaje}{d.fecha_corte ? ` (datos al ${fechaCorta(d.fecha_corte)})` : ''}</span>
                        </div>
                    )}

                    <Seccion
                        titulo="Datos del cliente"
                        extra={puedeEditar && !editando && <Button variant="ghost" icon={IoCreateOutline} className="h-8 py-0" onClick={editar}>Editar</Button>}
                    >
                        {editando ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Field label="Nombres" required error={errores.nombres}><TextInput value={v.nombres} onChange={set('nombres')} maxLength={100} error={errores.nombres} /></Field>
                                <Field label="Apellidos" required error={errores.apellidos}><TextInput value={v.apellidos} onChange={set('apellidos')} maxLength={100} error={errores.apellidos} /></Field>
                                <Field label="Teléfono" required error={errores.telefono}><TextInput value={v.telefono} onChange={set('telefono')} maxLength={20} error={errores.telefono} /></Field>
                                <Field label="Teléfono alternativo" error={errores.telefono_alternativo}><TextInput value={v.telefono_alternativo} onChange={set('telefono_alternativo')} maxLength={20} error={errores.telefono_alternativo} /></Field>
                                <Field label="Correo" error={errores.email}><TextInput type="email" value={v.email} onChange={set('email')} error={errores.email} /></Field>
                                <Field label="Ciudad"><TextInput value={v.ciudad} onChange={set('ciudad')} maxLength={100} /></Field>
                                <Field label="Dirección" className="sm:col-span-2"><TextInput value={v.direccion} onChange={set('direccion')} /></Field>
                                <Field label="Zona"><TextInput value={v.zona} onChange={set('zona')} maxLength={100} /></Field>
                            </div>
                        ) : (
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-gray-200 p-4 sm:grid-cols-3">
                                <Dato label="Teléfono">{c.telefono}</Dato>
                                <Dato label="Teléfono alternativo">{c.telefono_alternativo}</Dato>
                                <Dato label="Correo">{c.email}</Dato>
                                <Dato label="Dirección" className="col-span-2">{c.direccion}</Dato>
                                <Dato label="Zona / ciudad">{[c.zona, c.ciudad].filter(Boolean).join(', ')}</Dato>
                            </dl>
                        )}
                    </Seccion>

                    <Seccion titulo="Deuda en COTEL">
                        {!c.contratos.length ? <p className="text-gray-500">Sin contratos registrados en COTEL.</p> : (
                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-3 py-2">Contrato</th>
                                            <th className="px-3 py-2 text-center">Facturas impagas</th>
                                            <th className="px-3 py-2 text-right">Deuda</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {c.contratos.map((k) => (
                                            <tr key={k.id} className={cx(k.bloquea && 'bg-red-50/50')}>
                                                <td className="px-3 py-2 font-mono text-gray-800">{k.numero}</td>
                                                <td className="px-3 py-2 text-center text-gray-700">{k.facturas || '—'}</td>
                                                <td className="px-3 py-2 text-right">
                                                    {k.facturas > 0
                                                        ? <span className={cx('font-medium', k.bloquea ? 'text-red-700' : 'text-amber-700')}>{bs(k.monto)}</span>
                                                        : <span className="inline-flex items-center gap-1 text-green-700"><IoCheckmarkCircle className="h-4 w-4" />Al día</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Seccion>

                    <Seccion titulo={`Solicitudes (${c.solicitudes.length})`}>
                        {!c.solicitudes.length ? <p className="text-gray-500">Todavía no tiene solicitudes en el sistema.</p> : (
                            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                                {c.solicitudes.map((s) => (
                                    <li key={s.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                                        <span className="font-mono font-semibold text-gray-800">{s.numero}</span>
                                        <span className="text-gray-700">{s.tipo.nombre}{s.plan ? ` · ${s.plan.nombre}` : ''}</span>
                                        <span className="text-xs text-gray-500">{fechaCorta(s.created_at)}</span>
                                        <span className="ml-auto flex items-center gap-2">
                                            {s.orden && <><span className="font-mono text-xs text-gray-600">{s.orden.numero}</span><EstadoOT estado={s.orden.estado} /></>}
                                            <EstadoSolicitud estado={s.estado} />
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Seccion>
                </div>
            )}
        </Modal>
    );
};

export default ClienteModal;
