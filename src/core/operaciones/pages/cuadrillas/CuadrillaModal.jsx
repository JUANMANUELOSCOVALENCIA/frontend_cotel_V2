// src/core/operaciones/pages/cuadrillas/CuadrillaModal.jsx
// Cuadrilla: almacén, vehículo, zonas, capacidad y sus técnicos, en un solo formulario.
// El código (CUA-01, CUA-02…) lo asigna el sistema. Solo pueden integrarla usuarios con rol Técnico.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoPersonAddOutline } from 'react-icons/io5';
import { Modal, Button, Badge, Field, TextInput, TextArea, SelectInput, ConfirmModal, cx } from '../../../../shared/components/ui';
import { cuadrillasService, vehiculosService, zonasService } from '../../services/operacionesService';
import { fechaCorta, ServiciosChips } from '../../components/opUi';

const vacio = { almacen: '', vehiculo: '', zonas: [], capacidad_diaria: '', observaciones: '' };

const CuadrillaModal = ({ open, cuadrilla: inicial, puedeCrear, puedeEditar, onClose, onCambio }) => {
    const [c, setC] = useState(null); // cuadrilla guardada (null = nueva)
    const [v, setV] = useState(vacio);
    const [almacenes, setAlmacenes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [zonas, setZonas] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [nuevoTec, setNuevoTec] = useState({ usuario: '', jefe: false });
    const [elegidos, setElegidos] = useState([]); // al crear: ids de técnicos (el primero o el marcado es jefe)
    const [jefe, setJefe] = useState(null);
    const [errores, setErrores] = useState({});
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [confirmar, setConfirmar] = useState(null); // { titulo, mensaje, accion }
    const [poder, setPoder] = useState(null); // ONU y material a cargo de la cuadrilla

    const nueva = !c;
    const editable = nueva ? puedeCrear : puedeEditar && c.activo;

    const cargarTecnicos = useCallback(() => {
        cuadrillasService.tecnicos().then((r) => r.success && setTecnicos(r.data));
    }, []);

    useEffect(() => {
        if (!open) return;
        setC(inicial || null);
        setV(inicial ? {
            almacen: String(inicial.almacen), vehiculo: inicial.vehiculo ? String(inicial.vehiculo) : '',
            zonas: inicial.zonas.map(String), capacidad_diaria: inicial.capacidad_diaria ? String(inicial.capacidad_diaria) : '',
            observaciones: inicial.observaciones || '',
        } : vacio);
        setErrores({}); setError(''); setNuevoTec({ usuario: '', jefe: false }); setElegidos([]); setJefe(null);
        cuadrillasService.almacenes().then((r) => r.success && setAlmacenes(r.data));
        vehiculosService.listar({ activos: 'true' }).then((r) => r.success && setVehiculos(r.data));
        zonasService.listar({ activas: 'true' }).then((r) => r.success && setZonas(r.data));
        cargarTecnicos();
        setPoder(null);
        if (inicial) cuadrillasService.enPoder(inicial.id).then((r) => r.success && setPoder(r.data));
    }, [open, inicial, cargarTecnicos]);

    const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); setErrores((x) => ({ ...x, [k]: '' })); setError(''); };
    const toggleZona = (id) => setV((x) => ({ ...x, zonas: x.zonas.includes(id) ? x.zonas.filter((z) => z !== id) : [...x.zonas, id] }));

    const actualizado = (r) => { setC(r.data); onCambio?.(); };

    const elegir = (id) => {
        setErrores((x) => ({ ...x, tecnicos: '' }));
        setElegidos((l) => {
            if (l.includes(id)) { if (jefe === id) setJefe(null); return l.filter((x) => x !== id); }
            if (l.length >= 3) { toast.error('Máximo 3 técnicos por cuadrilla.'); return l; }
            return [...l, id];
        });
    };

    const guardar = async () => {
        const e = {};
        if (!v.almacen) e.almacen = 'Elige el almacén.';
        if (nueva && (elegidos.length < 2 || elegidos.length > 3)) e.tecnicos = 'Elige de 2 a 3 técnicos.';
        setErrores(e);
        if (Object.keys(e).length) return;
        setGuardando(true);
        const datos = {
            almacen: Number(v.almacen), vehiculo: v.vehiculo ? Number(v.vehiculo) : null,
            zonas: v.zonas.map(Number), capacidad_diaria: v.capacidad_diaria ? Number(v.capacidad_diaria) : null,
            observaciones: v.observaciones.trim(),
            ...(nueva ? { tecnicos: elegidos, jefe: jefe || elegidos[0] } : {}),
        };
        const r = nueva ? await cuadrillasService.crear(datos) : await cuadrillasService.actualizar(c.id, datos);
        setGuardando(false);
        if (!r.success) { setErrores(r.fieldErrors || {}); setError(r.error); return; }
        toast.success(r.data.message || 'Cuadrilla guardada.');
        actualizado(r);
        if (nueva) cargarTecnicos();
    };

    const accion = async (promesa) => {
        setGuardando(true);
        const r = await promesa;
        setGuardando(false);
        setConfirmar(null);
        if (!r.success) { toast.error(r.error); return; }
        toast.success(r.data.message);
        actualizado(r);
        cargarTecnicos();
    };

    const agregarTecnico = () => {
        if (!nuevoTec.usuario) { toast.error('Elige el técnico.'); return; }
        accion(cuadrillasService.agregarTecnico(c.id, Number(nuevoTec.usuario), nuevoTec.jefe || !c.integrantes.length));
        setNuevoTec({ usuario: '', jefe: false });
    };

    // El vehículo actual de la cuadrilla aparece aunque esté ocupado por ella misma
    const vehiculosLibres = vehiculos.filter((x) => !x.cuadrilla || (c && x.cuadrilla.id === c.id));
    const integrantes = c?.integrantes || [];
    const sinJefe = c && integrantes.length > 0 && !integrantes.some((i) => i.es_jefe);

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            size="lg"
            title={nueva ? 'Nueva cuadrilla' : `Cuadrilla ${c.nombre}`}
            subtitle={nueva ? 'El código (CUA-01, CUA-02…) se asigna automáticamente' : `${c.almacen_nombre}${c.activo ? '' : ' · inactiva'}`}
            footer={(
                <>
                    {!nueva && puedeEditar && (c.activo
                        ? <Button variant="ghost" className="mr-auto text-red-600" onClick={() => setConfirmar({ titulo: 'Desactivar cuadrilla', mensaje: 'Sus técnicos quedan libres para otra cuadrilla. No se puede si tiene OT programadas o en campo.', accion: () => cuadrillasService.desactivar(c.id) })}>Desactivar</Button>
                        : <Button variant="ghost" className="mr-auto" onClick={() => accion(cuadrillasService.activar(c.id))}>Activar</Button>)}
                    <Button variant="ghost" onClick={onClose} disabled={guardando}>Cerrar</Button>
                    {editable && <Button onClick={guardar} loading={guardando}>{nueva ? 'Crear cuadrilla' : 'Guardar datos'}</Button>}
                </>
            )}
        >
            <div className="space-y-5 text-sm">
                {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Almacén" required error={errores.almacen} hint="De aquí sale su material">
                        <SelectInput value={v.almacen} onChange={set('almacen')} disabled={!editable}>
                            <option value="">Elige…</option>
                            {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                        </SelectInput>
                    </Field>
                    <Field label="Vehículo" error={errores.vehiculo}>
                        <SelectInput value={v.vehiculo} onChange={set('vehiculo')} disabled={!editable}>
                            <option value="">Sin vehículo</option>
                            {vehiculosLibres.map((x) => <option key={x.id} value={x.id}>{x.placa} · {x.descripcion}</option>)}
                        </SelectInput>
                    </Field>
                    <Field label="Capacidad diaria" error={errores.capacidad_diaria} hint="OT por día; al pasarla solo se avisa">
                        <TextInput type="number" min={1} value={v.capacidad_diaria} onChange={set('capacidad_diaria')} placeholder="Sin límite" disabled={!editable} />
                    </Field>
                </div>

                <Field label="Zonas que atiende de preferencia" hint="Al programar se avisa si la OT está fuera de estas zonas">
                    <div className="flex flex-wrap gap-2">
                        {zonas.map((z) => {
                            const sel = v.zonas.includes(String(z.id));
                            return (
                                <button key={z.id} type="button" disabled={!editable} onClick={() => toggleZona(String(z.id))}
                                    className={cx('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs', sel ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50', !editable && 'cursor-default')}>
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: z.color }} />{z.nombre}
                                </button>
                            );
                        })}
                        {!zonas.length && <span className="text-gray-400">No hay zonas activas.</span>}
                    </div>
                </Field>

                {nueva && (
                    <Field label="Técnicos" required error={errores.tecnicos} hint="Elige de 2 a 3. El jefe es el primero que elijas o el que marques.">
                        {!tecnicos.length ? (
                            <p className="rounded-lg border border-dashed border-gray-300 px-3 py-3 text-gray-500">
                                No hay técnicos libres. Asigna el rol Técnico a quienes salen a campo en Usuarios › Gestión de usuarios.
                            </p>
                        ) : (
                            <div className="max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200">
                                {tecnicos.map((t) => {
                                    const sel = elegidos.includes(t.id);
                                    const esJefe = sel && (jefe ? jefe === t.id : elegidos[0] === t.id);
                                    return (
                                        <div key={t.id} className={cx('flex items-center justify-between gap-3 px-3 py-2', sel && 'bg-orange-50')}>
                                            <label className="flex flex-1 cursor-pointer items-center gap-3">
                                                <input type="checkbox" checked={sel} onChange={() => elegir(t.id)} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                                                <span className="text-gray-800">{t.nombre}</span>
                                                <span className="text-xs text-gray-500">Cód. {t.codigocotel}</span>
                                            </label>
                                            {sel && (esJefe
                                                ? <Badge color="orange">Jefe</Badge>
                                                : <button type="button" className="text-xs text-gray-500 hover:text-orange-600" onClick={() => setJefe(t.id)}>Hacer jefe</button>)}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Field>
                )}

                <Field label="Observaciones">
                    <TextArea rows={2} value={v.observaciones} onChange={set('observaciones')} disabled={!editable} />
                </Field>

                {!nueva && (
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <p className="font-medium text-gray-700">Técnicos <span className="text-gray-400">({integrantes.length} de 3)</span></p>
                            {integrantes.length < 2 && <Badge color="amber">Necesita al menos 2 para recibir OT</Badge>}
                            {sinJefe && <Badge color="amber">Sin jefe</Badge>}
                        </div>
                        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                            {!integrantes.length && <p className="px-4 py-3 text-gray-500">Todavía no tiene técnicos.</p>}
                            {integrantes.map((i) => (
                                <div key={i.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                                    <div>
                                        <p className="flex items-center gap-2 text-gray-800">{i.usuario.nombre} {i.es_jefe && <Badge color="orange">Jefe</Badge>}</p>
                                        <p className="text-xs text-gray-500">Cód. {i.usuario.codigocotel} · desde {fechaCorta(i.desde)}</p>
                                    </div>
                                    {puedeEditar && c.activo && (
                                        <div className="flex gap-1">
                                            {!i.es_jefe && <Button variant="ghost" onClick={() => accion(cuadrillasService.marcarJefe(c.id, i.usuario.id))} disabled={guardando}>Hacer jefe</Button>}
                                            <Button variant="ghost" className="text-red-600" disabled={guardando}
                                                onClick={() => setConfirmar({ titulo: 'Retirar técnico', mensaje: `${i.usuario.nombre} deja la cuadrilla desde hoy. Su paso por ella queda registrado.`, accion: () => cuadrillasService.retirarTecnico(c.id, i.usuario.id) })}>
                                                Retirar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {puedeEditar && c.activo && integrantes.length < 3 && (
                            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                                <SelectInput className="sm:flex-1" value={nuevoTec.usuario} onChange={(e) => setNuevoTec((x) => ({ ...x, usuario: e.target.value }))}>
                                    <option value="">{tecnicos.length ? 'Técnico disponible…' : 'No hay técnicos libres (rol Técnico)'}</option>
                                    {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre} · {t.codigocotel}</option>)}
                                </SelectInput>
                                {integrantes.length > 0 && (
                                    <label className="flex items-center gap-2 text-gray-700">
                                        <input type="checkbox" checked={nuevoTec.jefe} onChange={(e) => setNuevoTec((x) => ({ ...x, jefe: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                                        Es el jefe
                                    </label>
                                )}
                                <Button variant="secondary" icon={IoPersonAddOutline} onClick={agregarTecnico} disabled={guardando || !nuevoTec.usuario}>Agregar</Button>
                            </div>
                        )}
                                            </div>
                )}
            </div>

            {poder && (poder.onus.length > 0 || poder.materiales.length > 0) && (
                <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50/50 p-3 text-sm">
                    <p className="mb-1 font-medium text-purple-900">A cargo de la cuadrilla (sin rendir)</p>
                    {poder.onus.map((o) => (
                        <p key={o.id} className="flex flex-wrap items-center gap-2 text-gray-700">
                            <span className="font-mono">{o.gpon_serial}</span><span className="text-xs text-gray-500">{o.modelo} · {o.despacho}</span><ServiciosChips s={o} />
                        </p>
                    ))}
                    {poder.materiales.map((m) => (
                        <p key={`${m.despacho}-${m.nombre}`} className="text-gray-700">{m.nombre}: {Number(m.cantidad).toLocaleString('es-BO')} {m.unidad} <span className="text-xs text-gray-500">· {m.despacho}</span></p>
                    ))}
                </div>
            )}

            <ConfirmModal
                open={!!confirmar}
                onClose={() => setConfirmar(null)}
                onConfirm={() => accion(confirmar.accion())}
                title={confirmar?.titulo}
                message={confirmar?.mensaje}
                confirmText="Confirmar"
                danger
                loading={guardando}
            />
        </Modal>
    );
};

export default CuadrillaModal;
