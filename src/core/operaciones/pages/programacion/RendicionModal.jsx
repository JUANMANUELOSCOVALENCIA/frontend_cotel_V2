// src/core/operaciones/pages/programacion/RendicionModal.jsx
// Despacho de una cuadrilla: ver / imprimir el vale y registrar la rendición al volver.
//   - Cada ONU: instalada en una OT ejecutada y compatible, devuelta o faltante (a cargo de la cuadrilla).
//   - Material: lo usado en cada OT ejecutada (consumo real para el EOQ) y lo devuelto. La diferencia es faltante.
//   - Equipos recuperados de clientes (retiro, cambio, traslado): vuelven al almacén para laboratorio.
// Las OT se marcan ejecutadas desde la app del técnico (con las fotos); sin eso, todo vuelve o falta.
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoAddOutline, IoPrintOutline, IoTrashOutline } from 'react-icons/io5';
import { Modal, Button, Field, TextInput, TextArea, SelectInput, Spinner, Badge, IconButton, cx } from '../../../../shared/components/ui';
import { despachosService } from '../../services/operacionesService';
import { useUser } from '../../../auth/hooks/useAuth';
import { EstadoOT, ServiciosChips, fechaCorta, fechaHora, onuSirve } from '../../components/opUi';
import { imprimirValeDespacho } from '../../components/pdf';

const EJECUTADAS = ['EJECUTADA', 'VERIFICADA', 'CERRADA'];
const LLEVAN_ONU = ['INSTALACION', 'REPARACION'];
const RECUPERAN = ['RETIRO', 'REPARACION', 'TRASLADO'];
const num = (n) => Number(n || 0).toLocaleString('es-BO', { maximumFractionDigits: 2 });
const COLOR = { PENDIENTE: 'purple', INSTALADO: 'green', DEVUELTO: 'gray', FALTANTE: 'red' };

const RendicionModal = ({ open, despachoId, puedeEditar, onClose, onHecho }) => {
    const [d, setD] = useState(null);
    const [eqs, setEqs] = useState({});      // id → { resultado, orden }
    const [cons, setCons] = useState({});    // material id → { orden id → cantidad }
    const [dev, setDev] = useState({});      // material id → devuelta
    const [recup, setRecup] = useState([]);  // [{ orden, serial, observacion }]
    const [obs, setObs] = useState('');
    const [anulando, setAnulando] = useState(false);
    const [rindiendo, setRindiendo] = useState(false); // se abre en modo consulta (vale); la rendición se inicia con el botón
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);
    const { fullName } = useUser();

    useEffect(() => {
        if (!open || !despachoId) return;
        setD(null); setObs(''); setError(''); setAnulando(false); setRindiendo(false); setRecup([]); setCons({}); setDev({});
        despachosService.obtener(despachoId).then((r) => {
            if (!r.success) { setError(r.error); return; }
            setD(r.data);
            setEqs(Object.fromEntries(r.data.equipos.map((e) => [e.id, { resultado: 'DEVUELTO', orden: '' }])));
        });
    }, [open, despachoId]);

    const porRendir = d && puedeEditar && d.estado.codigo === 'ENTREGADO';
    const editable = porRendir && (rindiendo || anulando);
    const ejecutadas = useMemo(() => (d?.ordenes || []).filter((o) => EJECUTADAS.includes(o.estado.codigo)), [d]);
    const abiertas = (d?.ordenes || []).filter((o) => ['PROGRAMADA', 'EN_CAMPO'].includes(o.estado.codigo));
    const conOnu = ejecutadas.filter((o) => LLEVAN_ONU.includes(o.tipo.codigo));
    const conRecupero = ejecutadas.filter((o) => RECUPERAN.includes(o.tipo.codigo));
    const usada = (m) => Object.values(cons[m.id] || {}).reduce((s, v) => s + Number(v || 0), 0);
    const falta = (m) => m.cantidad - usada(m) - Number(dev[m.id] || 0);
    const hayFaltantes = d && (Object.values(eqs).some((e) => e.resultado === 'FALTANTE') || d.materiales.some((m) => falta(m) > 0));

    const setEq = (id, k) => (e) => { setEqs((x) => ({ ...x, [id]: { ...x[id], [k]: e.target.value } })); setError(''); };
    const setCon = (mid, oid) => (e) => setCons((x) => ({ ...x, [mid]: { ...x[mid], [oid]: e.target.value } }));

    const enviar = async () => {
        setError('');
        if (anulando) {
            if (obs.trim().length < 5) { setError('Indica el motivo (mínimo 5 caracteres).'); return; }
        } else {
            const sinOt = d.equipos.find((e) => eqs[e.id].resultado === 'INSTALADO' && !eqs[e.id].orden);
            if (sinOt) { setError(`Indica en qué OT se instaló la ONU ${sinOt.onu.gpon_serial}.`); return; }
            const ots = Object.values(eqs).filter((e) => e.resultado === 'INSTALADO').map((e) => e.orden);
            if (new Set(ots).size !== ots.length) { setError('Dos ONU no pueden instalarse en la misma OT.'); return; }
            if (d.materiales.some((m) => falta(m) < 0)) { setError('Lo usado más lo devuelto no puede superar lo entregado.'); return; }
            if (hayFaltantes && obs.trim().length < 5) { setError('Hay faltantes: explica en las observaciones qué pasó (mínimo 5 caracteres).'); return; }
        }
        setGuardando(true);
        const r = anulando
            ? await despachosService.anular(d.id, obs.trim())
            : await despachosService.rendir(d.id, {
                equipos: d.equipos.map((e) => ({ id: e.id, resultado: eqs[e.id].resultado, orden: eqs[e.id].orden || null })),
                materiales: d.materiales.map((m) => ({
                    id: m.id, devuelta: Number(dev[m.id] || 0),
                    consumos: Object.entries(cons[m.id] || {}).filter(([, v]) => Number(v) > 0).map(([orden, cantidad]) => ({ orden: Number(orden), cantidad: Number(cantidad) })),
                })),
                recuperados: recup.filter((x) => x.serial.trim()).map((x) => ({ orden: Number(x.orden), serial: x.serial.trim(), observacion: x.observacion.trim() })),
                observaciones: obs.trim(),
            });
        setGuardando(false);
        if (!r.success) { setError(r.error); return; }
        toast.success(r.data.message);
        onHecho?.(r.data);
    };

    const titulo = d ? `${rindiendo ? 'Rendición del despacho' : anulando ? 'Anular despacho' : 'Despacho'} ${d.numero}` : 'Despacho';

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            size="xl"
            title={titulo}
            subtitle={d && `${d.cuadrilla.nombre} · ${fechaCorta(d.fecha)} · ${d.almacen.nombre} · entregó ${d.entregado_por}`}
            footer={(
                <>
                    {porRendir && !editable && <Button variant="ghost" className="mr-auto text-red-600" onClick={() => { setAnulando(true); setError(''); }}>Anular despacho</Button>}
                    {editable && <Button variant="ghost" className="mr-auto" onClick={() => { setAnulando(false); setRindiendo(false); setError(''); }} disabled={guardando}>Volver</Button>}
                    <Button variant="ghost" onClick={onClose} disabled={guardando}>Cerrar</Button>
                    {d && !editable && <Button variant="secondary" icon={IoPrintOutline} onClick={() => imprimirValeDespacho(d, fullName)}>Imprimir vale</Button>}
                    {porRendir && !editable && <Button onClick={() => { setRindiendo(true); setError(''); }}>Registrar rendición</Button>}
                    {editable && <Button variant={anulando ? 'danger' : 'primary'} onClick={enviar} loading={guardando}>{anulando ? 'Anular despacho' : 'Guardar rendición'}</Button>}
                </>
            )}
        >
            {!d ? (error ? <p className="text-sm text-red-700">{error}</p> : <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div>) : (
                <div className="space-y-5 text-sm">
                    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <Badge color={d.estado.codigo === 'ENTREGADO' ? 'purple' : d.estado.codigo === 'RENDIDO' ? 'green' : 'gray'}>{d.estado.codigo === 'ENTREGADO' ? 'Por rendir' : d.estado.nombre}</Badge>
                        <span>{d.cuadrilla.integrantes.map((i) => `${i.usuario.nombre}${i.es_jefe ? ' (jefe)' : ''}`).join(', ')}</span>
                        {d.cuadrilla.vehiculo && <span>· {d.cuadrilla.vehiculo.placa}</span>}
                        {d.rendido_at && <span>· {d.estado.codigo === 'ANULADO' ? 'anulado' : 'rendido'} {fechaHora(d.rendido_at)} por {d.rendido_por}</span>}
                    </div>

                    {anulando ? (
                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                            Todo vuelve a {d.almacen.nombre} tal como salió: las ONU quedan disponibles y el material regresa a su registro.
                        </p>
                    ) : (
                        <>
                            {editable && abiertas.length > 0 && ejecutadas.length > 0 && (
                                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                                    {abiertas.map((o) => o.numero).join(', ')} {abiertas.length === 1 ? 'sigue programada' : 'siguen programadas'}: al rendir, la cuadrilla
                                    se queda sin el material de este despacho. Si no se ejecutan, quedan atrasadas para reprogramarlas o marcarlas no ejecutadas.
                                </p>
                            )}
                            {editable && !ejecutadas.length && (
                                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                                    Ninguna OT de este día está ejecutada (eso se registra desde la app del técnico, con las fotos). Por ahora todo lo entregado vuelve al almacén o queda como faltante.
                                </p>
                            )}

                            <div>
                                <p className="mb-2 font-medium text-gray-700">ONU entregadas ({d.equipos.length})</p>
                                {!d.equipos.length && <p className="text-gray-500">No se entregaron ONU.</p>}
                                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                                    {d.equipos.map((e) => {
                                        const v = eqs[e.id] || {};
                                        const usadasPorOtras = Object.entries(eqs).filter(([id, x]) => Number(id) !== e.id && x.resultado === 'INSTALADO').map(([, x]) => String(x.orden));
                                        return (
                                            <div key={e.id} className="grid grid-cols-1 items-center gap-2 px-3 py-2 sm:grid-cols-12">
                                                <div className="sm:col-span-4"><p className="font-mono text-gray-800">{e.onu.gpon_serial}</p><p className="text-xs text-gray-500">{e.onu.modelo}</p></div>
                                                <div className="sm:col-span-2"><ServiciosChips s={e.onu} /></div>
                                                {editable ? (
                                                    <>
                                                        <SelectInput className="sm:col-span-3" value={v.resultado} onChange={setEq(e.id, 'resultado')}>
                                                            <option value="INSTALADO" disabled={!conOnu.length}>Instalada</option>
                                                            <option value="DEVUELTO">Devuelta al almacén</option>
                                                            <option value="FALTANTE">Faltante</option>
                                                        </SelectInput>
                                                        {v.resultado === 'INSTALADO' ? (
                                                            <SelectInput className="sm:col-span-3" value={v.orden} onChange={setEq(e.id, 'orden')}>
                                                                <option value="">¿En qué OT?</option>
                                                                {conOnu.map((o) => (
                                                                    <option key={o.id} value={o.id} disabled={!onuSirve(e.onu, o.servicios) || usadasPorOtras.includes(String(o.id))}>
                                                                        {o.numero} · {o.cliente}{onuSirve(e.onu, o.servicios) ? '' : ' (no compatible)'}
                                                                    </option>
                                                                ))}
                                                            </SelectInput>
                                                        ) : <span className="sm:col-span-3" />}
                                                    </>
                                                ) : (
                                                    <p className="flex items-center gap-2 sm:col-span-6"><Badge color={COLOR[e.resultado.codigo]}>{e.resultado.nombre}</Badge>{e.orden && <span className="font-mono text-gray-700">{e.orden.numero}</span>}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 font-medium text-gray-700">Material por cantidad</p>
                                {!d.materiales.length && <p className="text-gray-500">No se entregó material por cantidad.</p>}
                                <div className="space-y-3">
                                    {d.materiales.map((m) => {
                                        const f = editable ? falta(m) : m.faltante;
                                        return (
                                            <div key={m.id} className="rounded-xl border border-gray-200 p-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="text-gray-800">{m.nombre}{m.lote && <span className="text-xs text-gray-500"> · lote {m.lote}</span>}</p>
                                                    <p className="text-xs text-gray-600">
                                                        Entregado {num(m.cantidad)} {m.unidad} · usado {num(editable ? usada(m) : m.usada)} · devuelto {num(editable ? dev[m.id] : m.devuelta)} ·{' '}
                                                        <span className={cx(f > 0 && 'font-semibold text-red-600', f < 0 && 'text-red-600')}>faltante {num(f)}</span>
                                                    </p>
                                                </div>
                                                {editable ? (
                                                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                        {ejecutadas.map((o) => (
                                                            <Field key={o.id} label={`Usado en ${o.numero}`}>
                                                                <TextInput type="number" min={0} step="0.01" value={cons[m.id]?.[o.id] ?? ''} onChange={setCon(m.id, o.id)} />
                                                            </Field>
                                                        ))}
                                                        <Field label="Devuelto">
                                                            <TextInput type="number" min={0} step="0.01" value={dev[m.id] ?? ''} onChange={(e) => setDev((x) => ({ ...x, [m.id]: e.target.value }))} />
                                                        </Field>
                                                    </div>
                                                ) : m.consumos.length > 0 && (
                                                    <p className="mt-1 text-xs text-gray-500">{m.consumos.map((c) => `${c.numero}: ${num(c.cantidad)} ${m.unidad}`).join(' · ')}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {(editable ? conRecupero.length > 0 : d.recuperados.length > 0) && (
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="font-medium text-gray-700">Equipos recuperados de clientes</p>
                                        {editable && <Button variant="secondary" icon={IoAddOutline} onClick={() => setRecup((l) => [...l, { orden: String(conRecupero[0].id), serial: '', observacion: '' }])}>Agregar</Button>}
                                    </div>
                                    {editable ? (
                                        <div className="space-y-2">
                                            {!recup.length && <p className="text-gray-500">Si la cuadrilla trajo equipos de un retiro o cambio, regístralos: vuelven al almacén para laboratorio.</p>}
                                            {recup.map((x, i) => (
                                                <div key={i} className="grid grid-cols-12 items-center gap-2">
                                                    <SelectInput className="col-span-4" value={x.orden} onChange={(e) => setRecup((l) => l.map((y, j) => (j === i ? { ...y, orden: e.target.value } : y)))}>
                                                        {conRecupero.map((o) => <option key={o.id} value={o.id}>{o.numero} · {o.tipo.nombre}</option>)}
                                                    </SelectInput>
                                                    <TextInput className="col-span-3 font-mono uppercase" value={x.serial} placeholder="Serie GPON / MAC" onChange={(e) => setRecup((l) => l.map((y, j) => (j === i ? { ...y, serial: e.target.value } : y)))} />
                                                    <TextInput className="col-span-4" value={x.observacion} placeholder="Estado del equipo (opcional)" onChange={(e) => setRecup((l) => l.map((y, j) => (j === i ? { ...y, observacion: e.target.value } : y)))} />
                                                    <IconButton className="col-span-1" icon={IoTrashOutline} tone="danger" title="Quitar" onClick={() => setRecup((l) => l.filter((_, j) => j !== i))} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                                            {d.recuperados.map((x) => (
                                                <p key={x.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                                                    <span className="font-mono">{x.serial}</span><span className="text-gray-500">de {x.orden.numero}</span>
                                                    {x.en_inventario ? <Badge color="amber">Reingresado</Badge> : <Badge>No registrado: ingresar por reingreso</Badge>}
                                                    {x.observacion && <span className="text-xs text-gray-500">{x.observacion}</span>}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {d.ordenes && d.ordenes.length > 0 && (
                                <div>
                                    <p className="mb-2 font-medium text-gray-700">OT del día</p>
                                    <div className="flex flex-wrap gap-2">
                                        {d.ordenes.map((o) => (
                                            <span key={o.id} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1 text-xs">
                                                <span className="font-mono">{o.numero}</span><EstadoOT estado={o.estado} />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {editable && (
                        <Field label={anulando ? 'Motivo de la anulación' : 'Observaciones'} required={anulando || hayFaltantes}
                            hint={!anulando && hayFaltantes ? 'Hay faltantes: explica qué pasó.' : undefined}>
                            <TextArea rows={2} value={obs} onChange={(e) => { setObs(e.target.value); setError(''); }} />
                        </Field>
                    )}
                    {!editable && d.observaciones_rendicion && <p className="whitespace-pre-line text-gray-700">{d.observaciones_rendicion}</p>}
                </div>
            )}
        </Modal>
    );
};

export default RendicionModal;
