// src/core/almacenes/pages/traspasos/NuevoTraspasoModal.jsx
// Armar y enviar un traspaso: almacenes, motivo, equipos (buscar/escanear) y material a granel por cantidad.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoSendOutline, IoCloseOutline, IoSearchOutline } from 'react-icons/io5';
import { Modal, Button, Field, TextInput, TextArea, SelectInput, Spinner, Pager, inputCls, cx } from '../../../../shared/components/ui';
import traspasosService from '../../services/traspasosService';
import { EstadoMaterialBadge } from '../equipos/inventarioUi';

const VACIO = { almacen_origen: '', almacen_destino: '', motivo: '', numero_solicitud: '', observaciones: '' };
const norm = (s) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const NuevoTraspasoModal = ({ open, almacenes, onClose, onEnviado }) => {
    const [v, setV] = useState(VACIO);
    const [errores, setErrores] = useState({});
    const [error, setError] = useState('');
    const [tab, setTab] = useState('onu');
    const [equipos, setEquipos] = useState(new Map()); // id → equipo elegido
    const [granel, setGranel] = useState({}); // material_id → { ...material, cantidad }
    const [lista, setLista] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [buscar, setBuscar] = useState('');
    const [stock, setStock] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const buscarRef = useRef(null);

    useEffect(() => {
        if (open) { setV(VACIO); setErrores({}); setError(''); setEquipos(new Map()); setGranel({}); setBuscar(''); setPage(1); setTab('onu'); }
    }, [open]);

    const origen = v.almacen_origen;
    // Cambiar el origen vacía lo elegido (pertenece a otro almacén)
    const setOrigen = (id) => { setV((x) => ({ ...x, almacen_origen: id })); setEquipos(new Map()); setGranel({}); setPage(1); };

    const cargarEquipos = useCallback(async () => {
        if (!origen || !open) return;
        setCargando(true);
        const r = await traspasosService.disponibles({ almacen: origen, search: buscar, page, page_size: 15 });
        setCargando(false);
        if (r.success) { setLista(r.data.results || []); setCount(r.data.count || 0); }
    }, [origen, buscar, page, open]);
    useEffect(() => { if (tab === 'onu') cargarEquipos(); }, [cargarEquipos, tab]);

    useEffect(() => {
        if (!origen || !open || tab !== 'granel') return;
        traspasosService.disponibles({ almacen: origen, tipo: 'granel' }).then((r) => r.success && setStock(r.data.results || []));
    }, [origen, open, tab]);

    const alternar = (e) => setEquipos((m) => { const n = new Map(m); n.has(e.id) ? n.delete(e.id) : n.set(e.id, e); return n; });

    // Enter: si la búsqueda es una serie exacta, se agrega y se limpia (lector de código de barras)
    const alEnter = async (ev) => {
        ev.preventDefault();
        const c = norm(buscar);
        if (!c) return;
        const r = await traspasosService.disponibles({ almacen: origen, search: buscar, page_size: 5 });
        const exacto = (r.data?.results || []).find((e) => [e.gpon_serial, e.mac_address, e.serial_manufacturer].some((x) => norm(x) === c));
        if (!exacto) { toast.error(`${buscar} no está disponible en este almacén`); return; }
        setEquipos((m) => new Map(m).set(exacto.id, exacto));
        toast.success(`${exacto.gpon_serial} agregado`);
        setBuscar('');
        buscarRef.current?.focus();
    };

    const setCant = (m, valor) => setGranel((g) => {
        const n = { ...g };
        if (valor === '' || Number(valor) <= 0) delete n[m.id];
        else n[m.id] = { ...m, cantidad: valor };
        return n;
    });

    const lineas = Object.values(granel);
    const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); setErrores((x) => ({ ...x, [k]: undefined })); setError(''); };

    const enviar = async () => {
        const err = {};
        if (!v.almacen_origen) err.almacen_origen = 'Elige el origen';
        if (!v.almacen_destino) err.almacen_destino = 'Elige el destino';
        else if (v.almacen_destino === v.almacen_origen) err.almacen_destino = 'Debe ser distinto del origen';
        if (v.motivo.trim().length < 5) err.motivo = 'Mínimo 5 caracteres';
        if (v.numero_solicitud && !/^\d{6,10}$/.test(v.numero_solicitud.trim())) err.numero_solicitud = 'Entre 6 y 10 dígitos';
        const excedidos = lineas.filter((l) => Number(l.cantidad) > l.cantidad_disponible);
        setErrores(err);
        if (Object.keys(err).length) return;
        if (!equipos.size && !lineas.length) { setError('Agrega al menos un equipo o una cantidad de material.'); return; }
        if (excedidos.length) { setError(`${excedidos[0].modelo}: la cantidad supera lo disponible.`); return; }
        setEnviando(true);
        const r = await traspasosService.enviar({
            almacen_origen: v.almacen_origen, almacen_destino: v.almacen_destino,
            motivo: v.motivo.trim(), numero_solicitud: v.numero_solicitud.trim(), observaciones: v.observaciones.trim(),
            equipos: [...equipos.keys()],
            granel: lineas.map((l) => ({ material_id: l.id, cantidad: l.cantidad })),
        });
        setEnviando(false);
        if (!r.success) { setError(r.error); setErrores(r.fieldErrors || {}); return; }
        toast.success(r.data.message);
        onEnviado(r.data);
    };

    const nombreAlmacen = (id) => almacenes.find((a) => String(a.id) === String(id))?.nombre || '';

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={enviando}
            size="xl"
            title="Nuevo traspaso"
            subtitle="Lo enviado queda en tránsito hasta que el almacén destino confirme la recepción"
            footer={(
                <>
                    <span className="mr-auto self-center text-sm text-gray-600">
                        {equipos.size} equipo(s){lineas.length ? ` · ${lineas.length} material(es)` : ''}
                        {v.almacen_origen && v.almacen_destino && ` · ${nombreAlmacen(v.almacen_origen)} → ${nombreAlmacen(v.almacen_destino)}`}
                    </span>
                    <Button variant="ghost" onClick={onClose} disabled={enviando}>Cancelar</Button>
                    <Button icon={IoSendOutline} onClick={enviar} loading={enviando}>Enviar traspaso</Button>
                </>
            )}
        >
            <div className="space-y-5 text-sm">
                {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Desde (origen)" required error={errores.almacen_origen}>
                        <SelectInput value={v.almacen_origen} onChange={(e) => { setOrigen(e.target.value); setErrores((x) => ({ ...x, almacen_origen: undefined })); }} disabled={enviando}>
                            <option value="">Seleccionar…</option>
                            {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                        </SelectInput>
                    </Field>
                    <Field label="Hacia (destino)" required error={errores.almacen_destino}>
                        <SelectInput value={v.almacen_destino} onChange={set('almacen_destino')} disabled={enviando}>
                            <option value="">Seleccionar…</option>
                            {almacenes.filter((a) => String(a.id) !== String(v.almacen_origen)).map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                        </SelectInput>
                    </Field>
                    <Field label="Motivo" required error={errores.motivo} className="lg:col-span-2">
                        <TextInput value={v.motivo} onChange={set('motivo')} disabled={enviando} placeholder="Ej: reposición de stock para instalaciones" />
                    </Field>
                    <Field label="Nº de solicitud" error={errores.numero_solicitud} hint="Opcional">
                        <TextInput value={v.numero_solicitud} onChange={set('numero_solicitud')} inputMode="numeric" maxLength={10} disabled={enviando} />
                    </Field>
                    <Field label="Observaciones" className="sm:col-span-1 lg:col-span-3">
                        <TextInput value={v.observaciones} onChange={set('observaciones')} disabled={enviando} placeholder="Opcional: transporte, responsable, etc." />
                    </Field>
                </div>

                {!origen ? (
                    <p className="rounded-lg bg-gray-50 px-3 py-6 text-center text-gray-500">Elige el almacén de origen para ver lo que se puede enviar.</p>
                ) : (
                    <div className="rounded-xl border border-gray-200">
                        <div className="flex gap-4 border-b border-gray-200 px-4">
                            {[['onu', `Equipos ONU${equipos.size ? ` (${equipos.size})` : ''}`], ['granel', `Material a granel${lineas.length ? ` (${lineas.length})` : ''}`]].map(([id, label]) => (
                                <button key={id} type="button" onClick={() => setTab(id)}
                                    className={cx('-mb-px border-b-2 py-2.5 text-sm font-medium', tab === id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        {tab === 'onu' && (
                            <div className="space-y-3 p-4">
                                <form onSubmit={alEnter} className="relative">
                                    <IoSearchOutline className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input ref={buscarRef} value={buscar} onChange={(e) => { setBuscar(e.target.value); setPage(1); }}
                                        placeholder="Buscar o escanear: GPON, MAC, D-SN o lote" className={cx(inputCls, 'h-10 pl-9')} />
                                </form>
                                {equipos.size > 0 && (
                                    <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto rounded-lg bg-orange-50/60 p-2">
                                        {[...equipos.values()].map((e) => (
                                            <span key={e.id} className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 font-mono text-xs text-gray-700 ring-1 ring-orange-200">
                                                {e.gpon_serial}
                                                <button type="button" onClick={() => alternar(e)} className="text-gray-400 hover:text-red-600" aria-label="Quitar"><IoCloseOutline className="h-3.5 w-3.5" /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="overflow-hidden rounded-lg border border-gray-100">
                                    <table className="w-full text-left text-sm">
                                        <tbody className="divide-y divide-gray-100">
                                            {cargando && !lista.length && <tr><td className="py-8"><div className="flex justify-center text-orange-500"><Spinner /></div></td></tr>}
                                            {!cargando && !lista.length && <tr><td className="py-6 text-center text-gray-500">{buscar ? 'Ningún equipo coincide' : 'No hay equipos disponibles para traspaso en este almacén'}</td></tr>}
                                            {lista.map((e) => (
                                                <tr key={e.id} className={cx('cursor-pointer hover:bg-gray-50', equipos.has(e.id) && 'bg-orange-50/50')} onClick={() => alternar(e)}>
                                                    <td className="w-10 px-3 py-2"><input type="checkbox" className="h-4 w-4 accent-orange-500" checked={equipos.has(e.id)} onChange={() => alternar(e)} onClick={(x) => x.stopPropagation()} /></td>
                                                    <td className="px-3 py-2">
                                                        <p className="font-mono text-gray-800">{e.gpon_serial}</p>
                                                        <p className="font-mono text-xs text-gray-500">{e.mac_address}</p>
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-700">{e.modelo}</td>
                                                    <td className="px-3 py-2 text-gray-500">Lote {e.lote}</td>
                                                    <td className="px-3 py-2"><EstadoMaterialBadge estado={e.estado} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <Pager page={page} pageSize={15} count={count} onChange={setPage} />
                                </div>
                            </div>
                        )}

                        {tab === 'granel' && (
                            <div className="p-4">
                                {!stock.length ? <p className="py-6 text-center text-gray-500">No hay material a granel disponible en este almacén.</p> : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-xs uppercase text-gray-500"><tr><th className="py-2">Material</th><th className="py-2">Lote</th><th className="py-2 text-right">Disponible</th><th className="w-40 py-2 pl-4">Enviar</th></tr></thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {stock.map((m) => {
                                                const elegido = granel[m.id];
                                                const excede = elegido && Number(elegido.cantidad) > m.cantidad;
                                                return (
                                                    <tr key={m.id}>
                                                        <td className="py-2 text-gray-800">{m.modelo}</td>
                                                        <td className="py-2 text-gray-500">{m.lote}</td>
                                                        <td className="py-2 text-right text-gray-700">{m.cantidad.toLocaleString('es-BO')} {m.unidad}</td>
                                                        <td className="py-2 pl-4">
                                                            <div className="flex items-center gap-2">
                                                                <TextInput type="number" min="0" step="any" value={elegido?.cantidad || ''} placeholder="0"
                                                                    onChange={(e) => setCant({ ...m, cantidad_disponible: m.cantidad }, e.target.value)}
                                                                    error={excede} className="h-9 w-24" disabled={enviando} />
                                                                <span className="text-xs text-gray-500">{m.unidad}</span>
                                                            </div>
                                                            {excede && <p className="text-xs text-red-600">Máximo {m.cantidad}</p>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default NuevoTraspasoModal;
