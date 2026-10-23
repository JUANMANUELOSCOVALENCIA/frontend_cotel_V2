// src/core/operaciones/pages/campo/OtCampoModal.jsx
// Una OT en el celular del técnico:
//   Programada → "Llegué al domicilio" (GPS) → En campo → foto de la ONU (cámara en vivo, se valida
//   distancia y duplicados en el servidor) → "Registrar trabajo" (ONU instalada + material) → Ejecutada.
//   En cualquier momento antes: "No se pudo realizar" con su motivo.
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoCallOutline, IoCameraOutline, IoNavigateOutline, IoCheckmarkCircle, IoAlertCircleOutline } from 'react-icons/io5';
import { Modal, Button, Field, TextInput, TextArea, SelectInput, Badge } from '../../../../shared/components/ui';
import { campoService } from '../../services/operacionesService';
import { EstadoOT, PlazoChip, Prioridad, ServiciosChips, onuSirve } from '../../components/opUi';
import { Camara, FotoEvidencia, obtenerUbicacion } from '../../components/campoUi';

const OtCampoModal = ({ ot, datos, onClose, onCambio }) => {
    const [ocupado, setOcupado] = useState('');
    const [camara, setCamara] = useState(null); // 'ONU' | 'ADICIONAL'
    const [modo, setModo] = useState('');       // '' | 'no'
    const [f, setF] = useState({ onu: '', serial: '', obs: '', motivo: '', detalle: '', mat: {} });

    useEffect(() => { setModo(''); setF({ onu: '', serial: '', obs: '', motivo: '', detalle: '', mat: {} }); }, [ot?.id]);

    const onus = useMemo(() => (datos?.onus || []).filter((o) => ot && onuSirve(o, ot.servicios)), [datos, ot]);
    if (!ot) return null;
    const estado = ot.estado.codigo;
    const s = ot.solicitud;
    const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
    const resultado = (r, ok) => {
        setOcupado('');
        if (!r.success) { toast.error(r.error); return false; }
        if (ok !== false) toast.success(r.data.message);
        onCambio(r.data.orden);
        return true;
    };
    const conGps = async () => {
        try { return await obtenerUbicacion(); } catch (e) { toast.error(e.message); setOcupado(''); return null; }
    };

    const iniciar = async () => {
        setOcupado('iniciar');
        const gps = await conGps();
        if (!gps) return;
        resultado(await campoService.iniciar(ot.id, gps));
    };

    const subirFoto = async (blob) => {
        const tipo = camara;
        setCamara(null);
        setOcupado('foto');
        const gps = await conGps();
        if (!gps) return;
        const fd = new FormData();
        fd.append('imagen', blob, `${ot.numero}.jpg`);
        fd.append('lat', gps.lat); fd.append('lng', gps.lng); fd.append('precision', gps.precision); fd.append('tipo', tipo);
        const r = await campoService.evidencia(ot.id, fd);
        if (resultado(r, false)) {
            if (r.data.evidencia.estado.codigo === 'RECHAZADA') toast.error(r.data.message, { duration: 6000 });
            else toast.success(r.data.message);
        }
    };

    const registrar = async () => {
        if (ot.onu_obligatoria && !f.onu) { toast.error('Elige la ONU que instalaste.'); return; }
        setOcupado('ejecutar');
        let gps = null;
        try { gps = await obtenerUbicacion(); } catch { gps = null; }
        const materiales = Object.entries(f.mat).filter(([, v]) => Number(v) > 0).map(([id, cantidad]) => ({ id: Number(id), cantidad: Number(cantidad) }));
        resultado(await campoService.ejecutar(ot.id, {
            onu: f.onu || null, materiales, serial_recuperado: f.serial.trim(), observaciones: f.obs.trim(), ...(gps || {}),
        }));
    };

    const noSePudo = async () => {
        if (!f.motivo) { toast.error('Elige el motivo.'); return; }
        setOcupado('no');
        if (resultado(await campoService.noSePudo(ot.id, { motivo: f.motivo, detalle: f.detalle.trim() }))) setModo('');
    };

    const abierta = ['PROGRAMADA', 'EN_CAMPO'].includes(estado);
    const footer = modo === 'no' ? (
        <>
            <Button variant="ghost" onClick={() => setModo('')} disabled={!!ocupado}>Volver</Button>
            <Button variant="danger" onClick={noSePudo} loading={ocupado === 'no'}>Registrar</Button>
        </>
    ) : (
        <>
            {abierta && <Button variant="ghost" className="mr-auto text-red-600" onClick={() => setModo('no')} disabled={!!ocupado}>No se pudo realizar</Button>}
            {estado === 'PROGRAMADA' && <Button icon={IoNavigateOutline} onClick={iniciar} loading={ocupado === 'iniciar'}>Llegué al domicilio</Button>}
            {estado === 'EN_CAMPO' && <Button onClick={registrar} loading={ocupado === 'ejecutar'} disabled={!ot.foto_onu}>Registrar trabajo</Button>}
            {!abierta && <Button variant="ghost" onClick={onClose}>Cerrar</Button>}
        </>
    );

    return (
        <>
            <Modal open={!!ot} onClose={onClose} busy={!!ocupado} title={`${ot.numero} · ${ot.tipo.nombre}`}
                subtitle={`${ot.cliente.nombre}`} footer={footer}>
                <div className="space-y-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2"><EstadoOT estado={ot.estado} /><Prioridad valor={ot.prioridad} /><PlazoChip plazo={ot.plazo} /></div>

                    <div className="space-y-1">
                        <p className="text-gray-800">{s.direccion}</p>
                        {(s.referencia || ot.referencia) && <p className="text-xs text-gray-500">{s.referencia || ot.referencia}</p>}
                        {s.plan && <div className="flex flex-wrap items-center gap-2 pt-1"><span className="text-gray-700">{s.plan}</span><ServiciosChips s={ot.servicios} /></div>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`} target="_blank" rel="noreferrer"
                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50">
                            <IoNavigateOutline className="h-5 w-5 text-orange-500" />Cómo llegar
                        </a>
                        {ot.cliente.telefono ? (
                            <a href={`tel:${ot.cliente.telefono}`} className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50">
                                <IoCallOutline className="h-5 w-5 text-orange-500" />Llamar
                            </a>
                        ) : <span className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">Sin teléfono</span>}
                    </div>

                    {modo === 'no' ? (
                        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50/40 p-3">
                            <Field label="¿Por qué no se pudo realizar?" required>
                                <SelectInput value={f.motivo} onChange={set('motivo')}>
                                    <option value="">Elige el motivo…</option>
                                    {(datos?.motivos || []).map((m) => <option key={m.codigo} value={m.codigo}>{m.nombre}</option>)}
                                </SelectInput>
                            </Field>
                            <Field label="Detalle" required={f.motivo === 'OTRO'}><TextArea rows={2} value={f.detalle} onChange={set('detalle')} /></Field>
                        </div>
                    ) : (
                        <>
                            {estado === 'PROGRAMADA' && (
                                <p className="rounded-lg bg-blue-50 px-3 py-2 text-blue-800">Al llegar al domicilio, toca <b>Llegué al domicilio</b>: se registra la hora y tu ubicación.</p>
                            )}

                            {(estado === 'EN_CAMPO' || ot.evidencias.length > 0) && (
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="font-medium text-gray-700">Fotos</p>
                                        {ot.foto_onu
                                            ? <span className="flex items-center gap-1 text-xs text-green-700"><IoCheckmarkCircle className="h-4 w-4" />Foto de la ONU lista</span>
                                            : estado === 'EN_CAMPO' && <span className="flex items-center gap-1 text-xs text-amber-700"><IoAlertCircleOutline className="h-4 w-4" />Falta la foto de la ONU</span>}
                                    </div>
                                    <div className="space-y-2">
                                        {ot.evidencias.map((e) => <FotoEvidencia key={e.id} ev={e} cargar={() => campoService.foto(e.id)} />)}
                                    </div>
                                    {estado === 'EN_CAMPO' && (
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <Button icon={IoCameraOutline} onClick={() => setCamara('ONU')} loading={ocupado === 'foto'}>Foto de la ONU</Button>
                                            <Button variant="secondary" icon={IoCameraOutline} onClick={() => setCamara('ADICIONAL')} disabled={ocupado === 'foto'}>Foto adicional</Button>
                                        </div>
                                    )}
                                    {estado === 'EN_CAMPO' && <p className="mt-1 text-xs text-gray-500">Se toma en el domicilio (hasta {datos?.radio_m} m). No se aceptan fotos repetidas.</p>}
                                </div>
                            )}

                            {estado === 'EN_CAMPO' && (
                                <div className="space-y-3 border-t border-gray-100 pt-3">
                                    <p className="font-medium text-gray-700">Trabajo realizado</p>
                                    {ot.lleva_onu && (
                                        <Field label={ot.onu_obligatoria ? 'ONU instalada' : 'ONU nueva (solo si cambiaste el equipo)'} required={ot.onu_obligatoria}
                                            hint={!onus.length ? 'No tienes a cargo una ONU con los servicios de este plan.' : undefined}>
                                            <SelectInput value={f.onu} onChange={set('onu')}>
                                                <option value="">{ot.onu_obligatoria ? 'Elige la ONU…' : 'No cambié la ONU'}</option>
                                                {onus.map((o) => <option key={o.id} value={o.id}>{o.gpon_serial} · {o.modelo}</option>)}
                                            </SelectInput>
                                        </Field>
                                    )}
                                    {ot.recupera && (
                                        <Field label="Equipo recuperado del cliente (serie GPON o MAC)" hint="Si retiraste o cambiaste un equipo">
                                            <TextInput value={f.serial} onChange={set('serial')} className="font-mono uppercase" />
                                        </Field>
                                    )}
                                    {(datos?.materiales || []).filter((m) => m.disponible > 0).length > 0 && (
                                        <div>
                                            <p className="mb-1 text-xs font-medium text-gray-600">Material usado</p>
                                            <div className="space-y-2">
                                                {datos.materiales.filter((m) => m.disponible > 0).map((m) => (
                                                    <div key={m.id} className="grid grid-cols-12 items-center gap-2">
                                                        <span className="col-span-7 text-gray-700">{m.nombre}<span className="block text-xs text-gray-400">te quedan {m.disponible} {m.unidad}</span></span>
                                                        <TextInput className="col-span-3" type="number" inputMode="decimal" min={0} step="0.5" value={f.mat[m.id] ?? ''}
                                                            onChange={(e) => setF((x) => ({ ...x, mat: { ...x.mat, [m.id]: e.target.value } }))} />
                                                        <span className="col-span-2 text-xs text-gray-500">{m.unidad}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <Field label="Observaciones"><TextArea rows={2} value={f.obs} onChange={set('obs')} placeholder="Ej.: potencia óptica, detalles de la instalación" /></Field>
                                    {!ot.foto_onu && <p className="text-xs text-amber-700">Para registrar el trabajo primero toma la foto de la ONU.</p>}
                                </div>
                            )}

                            {ot.reporte && (
                                <div className="rounded-lg bg-green-50 px-3 py-2 text-green-800">
                                    <p className="font-medium">Trabajo registrado</p>
                                    {ot.reporte.onu && <p className="text-xs">ONU {ot.reporte.onu.gpon_serial} · {ot.reporte.onu.modelo}</p>}
                                    {ot.reporte.serial_recuperado && <p className="text-xs">Recuperado: {ot.reporte.serial_recuperado}</p>}
                                    {ot.reporte.observaciones && <p className="text-xs">{ot.reporte.observaciones}</p>}
                                </div>
                            )}
                            {estado === 'NO_EJECUTADA' && <Badge color="red">Registrada como no ejecutada</Badge>}
                        </>
                    )}
                </div>
            </Modal>
            <Camara open={!!camara} titulo={camara === 'ONU' ? `Foto de la ONU · ${ot.numero}` : `Foto adicional · ${ot.numero}`}
                onClose={() => setCamara(null)} onFoto={subirFoto} />
        </>
    );
};

export default OtCampoModal;
