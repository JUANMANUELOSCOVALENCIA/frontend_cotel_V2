// src/core/operaciones/pages/programacion/DespachoModal.jsx
// Despacho del día a una cuadrilla, desde su almacén:
//   - ONU: se eligen con el buscador (como en Equipos ONU: GPON, MAC, D-SN, código o lote; filtro por modelo y
//     servicios; lector de código de barras + Enter) o con "Sugerir": el sistema propone, por orden de lote (FIFO),
//     el modelo más sencillo que cubre cada instalación que falta. Quedan a cargo de la cuadrilla;
//     se asocian a una OT recién al instalarse. Se compara con lo que necesitan las instalaciones del día
//     (TV cable → ONU con puerto CATV, telefonía → ONU con puerto POTS).
//   - Material por cantidad: sugerido con los kits por tipo de trabajo; el almacén lo ajusta.
// Si ya hubo un despacho ese día (sin rendir), lo nuevo se suma al mismo.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoAddOutline, IoBarcodeOutline, IoCheckmarkCircle, IoCloseOutline, IoSparklesOutline, IoTrashOutline, IoWarningOutline } from 'react-icons/io5';
import { Modal, Button, Field, TextInput, TextArea, SelectInput, IconButton, Spinner, Badge, Pager, cx } from '../../../../shared/components/ui';
import { despachosService } from '../../services/operacionesService';
import { fechaCorta, ServiciosChips, serviciosOnuTexto, onuSirve } from '../../components/opUi';
import { mostrarAvisos } from '../../components/ProgramarModal';

const POR_PAGINA = 8;
const SERVICIO = { '': {}, tv: { tv: true }, telefonia: { telefonia: true }, ambos: { tv: true, telefonia: true } };
const num = (n) => Number(n).toLocaleString('es-BO', { maximumFractionDigits: 2 });
const peso = (s) => Number(!!s.tv) + Number(!!s.telefonia);

// A cada instalación (las más exigentes primero) le toca la ONU compatible más sencilla
export const cubrir = (instalaciones, onus) => {
    const libres = [...onus].sort((a, b) => peso(a) - peso(b));
    const asignada = {};
    [...instalaciones].sort((a, b) => peso(b.servicios) - peso(a.servicios)).forEach((o) => {
        const i = libres.findIndex((x) => onuSirve(x, o.servicios));
        if (i >= 0) { asignada[o.id] = libres[i]; libres.splice(i, 1); }
    });
    return { asignada, sobrantes: libres };
};

const DespachoModal = ({ open, cuadrilla, fecha, onClose, onHecho }) => {
    const [req, setReq] = useState(null);
    const [onus, setOnus] = useState([]);
    const [serie, setSerie] = useState('');       // texto del buscador (o lo que escribe el lector)
    const [q, setQ] = useState('');               // texto con retardo, el que se consulta
    const [modelo, setModelo] = useState('');
    const [servicio, setServicio] = useState('');
    const [pagina, setPagina] = useState(1);
    const [res, setRes] = useState({ items: [], count: 0, cargando: false });
    const [buscando, setBuscando] = useState(false);
    const [sugiriendo, setSugiriendo] = useState(false);
    const [lineas, setLineas] = useState([]); // [{ material, cantidad, sugerido, nombre }]
    const [obs, setObs] = useState('');
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);
    const scanRef = useRef(null);

    useEffect(() => {
        if (!open || !cuadrilla) return;
        setReq(null); setOnus([]); setSerie(''); setQ(''); setModelo(''); setServicio(''); setPagina(1); setLineas([]); setObs(''); setError('');
        despachosService.requerimiento(cuadrilla.id, fecha).then((r) => {
            if (!r.success) { setError(r.error); return; }
            setReq(r.data);
            // Material sugerido por los kits: el registro (lote) más antiguo con stock suficiente
            setLineas(r.data.material.map((m) => {
                const regs = r.data.granel.filter((g) => g.modelo_id === m.modelo_id);
                const reg = regs.find((g) => g.cantidad >= m.sugerido) || regs[0];
                return { material: reg ? String(reg.id) : '', cantidad: reg ? String(Math.min(m.sugerido, reg.cantidad)) : '', sugerido: m.sugerido, nombre: m.nombre, unidad: m.unidad };
            }));
            setTimeout(() => scanRef.current?.focus(), 100);
        });
    }, [open, cuadrilla, fecha]);

    // ONU ya entregadas hoy + las que se están escaneando
    const yaEntregadas = useMemo(() => req?.despacho?.onus || [], [req]);
    const instalaciones = useMemo(() => (req?.ordenes || []).filter((o) => o.onu_obligatoria), [req]);
    const { asignada, sobrantes } = useMemo(() => cubrir(instalaciones, [...yaEntregadas, ...onus]), [instalaciones, yaEntregadas, onus]);
    const faltan = instalaciones.filter((o) => !asignada[o.id]);

    // Buscador (retardo de 300 ms al escribir; el lector de códigos llega con Enter)
    useEffect(() => { const t = setTimeout(() => { setQ(serie.trim()); setPagina(1); }, 300); return () => clearTimeout(t); }, [serie]);
    const consultar = useCallback(async () => {
        if (!open || !cuadrilla || !req) return;
        setRes((x) => ({ ...x, cargando: true }));
        const sv = SERVICIO[servicio];
        const r = await despachosService.disponibles({ cuadrilla: cuadrilla.id, search: q, modelo, tv: sv.tv ? 'true' : '', telefonia: sv.telefonia ? 'true' : '', page: pagina, page_size: POR_PAGINA });
        if (r.success) setRes({ items: r.data.results || [], count: r.data.count || 0, cargando: false });
        else { setRes({ items: [], count: 0, cargando: false }); toast.error(r.error); }
    }, [open, cuadrilla, req, q, modelo, servicio, pagina]);
    useEffect(() => { consultar(); }, [consultar]);

    const elegidas = useMemo(() => new Set([...yaEntregadas, ...onus].map((x) => x.id)), [yaEntregadas, onus]);
    const agregar = (o) => {
        if (elegidas.has(o.id)) { toast.error(`La ONU ${o.gpon_serial} ya está en la lista.`); return; }
        setOnus((l) => [...l, o]);
        setError('');
    };

    // Enter: serie exacta (lector de códigos); si no, la única coincidencia del buscador
    const escanear = async (e) => {
        e?.preventDefault();
        const s = serie.trim().toUpperCase();
        if (!s) return;
        const ya = [...yaEntregadas, ...onus].find((x) => [x.gpon_serial, x.mac, x.codigo].map((v) => (v || '').toUpperCase()).includes(s));
        if (ya) { toast.error(`La ONU ${ya.gpon_serial} ya está en la lista.`); setSerie(''); return; }
        setBuscando(true);
        const r = await despachosService.buscar(cuadrilla.id, s);
        setBuscando(false);
        if (r.success) { agregar(r.data); setSerie(''); }
        else if (q === serie.trim() && res.count === 1 && !elegidas.has(res.items[0].id)) { agregar(res.items[0]); setSerie(''); }
        else if (q === serie.trim() && res.count > 1) toast.error(`Hay ${res.count} ONU que coinciden: elige una de la lista.`);
        else toast.error(r.error);
        scanRef.current?.focus();
    };

    const sugerir = async () => {
        setSugiriendo(true);
        const r = await despachosService.sugerir(cuadrilla.id, fecha, onus.map((o) => o.id));
        setSugiriendo(false);
        if (!r.success) { toast.error(r.error); return; }
        setOnus((l) => [...l, ...r.data.onus.filter((o) => !elegidas.has(o.id))]);
        if (r.data.onus.length) toast.success(`Se agregaron ${r.data.onus.length} ONU (lote más antiguo primero).`);
        if (r.data.sin_stock) toast.error(`No hay stock compatible para ${r.data.sin_stock} instalación(es) en ${req.almacen.nombre}.`);
    };

    const setLinea = (i, k) => (e) => setLineas((l) => l.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)));

    const guardar = async () => {
        const materiales = lineas.filter((g) => g.material && Number(g.cantidad) > 0).map((g) => ({ material: Number(g.material), cantidad: Number(g.cantidad) }));
        if (!onus.length && !materiales.length) { setError('Elige al menos una ONU o agrega material.'); return; }
        const repetido = materiales.find((m, i) => materiales.findIndex((x) => x.material === m.material) !== i);
        if (repetido) { setError('Hay un mismo registro de material dos veces: júntalos en una línea.'); return; }
        setGuardando(true);
        const r = await despachosService.despachar({ cuadrilla: cuadrilla.id, fecha, onus: onus.map((o) => o.id), materiales, observaciones: obs.trim() });
        setGuardando(false);
        if (!r.success) { setError(r.error); return; }
        toast.success(r.data.message);
        mostrarAvisos(r.data.avisos);
        onHecho?.(r.data);
    };

    const bloqueado = !!req?.pendiente_previo;

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            size="xl"
            title={`Despacho a ${cuadrilla?.nombre || ''}`}
            subtitle={req ? `${fechaCorta(fecha)} · desde ${req.almacen.nombre}${req.despacho ? ` · se suma a ${req.despacho.numero}` : ''}` : fechaCorta(fecha)}
            footer={(
                <>
                    <Button variant="ghost" onClick={onClose} disabled={guardando}>Cancelar</Button>
                    <Button onClick={guardar} loading={guardando} disabled={!req || bloqueado}>Registrar despacho</Button>
                </>
            )}
        >
            {!req ? (error ? <p className="text-sm text-red-700">{error}</p> : <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div>) : (
                <div className="space-y-5 text-sm">
                    {bloqueado && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                            {cuadrilla?.nombre} tiene sin rendir el despacho {req.pendiente_previo.numero} del {fechaCorta(req.pendiente_previo.fecha)}. Registra primero su rendición.
                        </div>
                    )}
                    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}

                    {/* Lo que necesita el día */}
                    <div>
                        <p className="mb-2 font-medium text-gray-700">Trabajos del día</p>
                        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                            {!req.ordenes.length && <p className="px-3 py-3 text-gray-500">La cuadrilla no tiene OT programadas este día.</p>}
                            {req.ordenes.map((o) => {
                                const onu = asignada[o.id];
                                return (
                                    <div key={o.id} className="grid grid-cols-1 items-center gap-2 px-3 py-2 sm:grid-cols-12">
                                        <div className="min-w-0 sm:col-span-5">
                                            <p><span className="font-mono font-medium text-gray-800">{o.numero}</span> <span className="text-gray-600">{o.tipo.nombre}</span></p>
                                            <p className="truncate text-xs text-gray-500">{o.cliente} · {o.direccion}</p>
                                        </div>
                                        <div className="sm:col-span-3">{o.onu_obligatoria ? <ServiciosChips s={o.servicios} /> : null}</div>
                                        <div className="text-xs sm:col-span-4">
                                            {o.onu_obligatoria
                                                ? (onu
                                                    ? <span className="flex items-center gap-1 text-green-700"><IoCheckmarkCircle className="h-4 w-4" />Cubierta ({onu.modelo})</span>
                                                    : <span className="flex items-center gap-1 text-red-600"><IoWarningOutline className="h-4 w-4" />Falta ONU con {serviciosOnuTexto(o.servicios)}</span>)
                                                : <span className="text-gray-500">{o.lleva_onu ? 'ONU solo si hay que cambiar el equipo' : 'No lleva ONU nueva'}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ONU que salen */}
                    <div>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium text-gray-700">ONU que salen con la cuadrilla</p>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">{req.onus_disponibles} disponibles en {req.almacen.nombre}</span>
                                {faltan.length > 0 && <Button variant="secondary" icon={IoSparklesOutline} onClick={sugerir} loading={sugiriendo} disabled={bloqueado}>Sugerir para {faltan.length} instalación(es)</Button>}
                            </div>
                        </div>
                        <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                            <form onSubmit={escanear} className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                                <div className="relative sm:col-span-6">
                                    <IoBarcodeOutline className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <TextInput ref={scanRef} value={serie} onChange={(e) => setSerie(e.target.value)} className="pl-10 font-mono"
                                        placeholder="Buscar o escanear: GPON, MAC, D-SN, código o lote" disabled={bloqueado} />
                                    {buscando && <Spinner className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />}
                                </div>
                                <SelectInput className="sm:col-span-3" value={modelo} onChange={(e) => { setModelo(e.target.value); setPagina(1); }} disabled={bloqueado}>
                                    <option value="">Todos los modelos</option>
                                    {req.modelos.map((m) => <option key={m.id} value={m.id}>{m.nombre} · {serviciosOnuTexto(m)} · {m.disponibles}</option>)}
                                </SelectInput>
                                <SelectInput className="sm:col-span-3" value={servicio} onChange={(e) => { setServicio(e.target.value); setPagina(1); }} disabled={bloqueado}>
                                    <option value="">Cualquier servicio</option>
                                    <option value="tv">Con TV cable</option>
                                    <option value="telefonia">Con telefonía</option>
                                    <option value="ambos">Con TV y telefonía</option>
                                </SelectInput>
                            </form>
                            <div className="max-h-72 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-100">
                                {res.cargando && !res.items.length && <div className="flex justify-center py-6 text-orange-500"><Spinner className="h-5 w-5" /></div>}
                                {!res.cargando && !res.items.length && <p className="px-3 py-4 text-center text-gray-500">{q || modelo || servicio ? 'Ninguna ONU disponible coincide.' : `No hay ONU disponibles en ${req.almacen.nombre}.`}</p>}
                                {res.items.map((o) => {
                                    const ya = elegidas.has(o.id);
                                    return (
                                        <button key={o.id} type="button" disabled={ya || bloqueado} onClick={() => agregar(o)}
                                            className={cx('grid w-full grid-cols-12 items-center gap-2 px-3 py-2 text-left', ya ? 'bg-gray-50 text-gray-400' : 'hover:bg-orange-50')}>
                                            <span className="col-span-5 min-w-0">
                                                <span className="block font-mono text-gray-800">{o.gpon_serial}</span>
                                                <span className="block truncate font-mono text-xs text-gray-500">{o.mac}</span>
                                            </span>
                                            <span className="col-span-4 min-w-0 text-xs text-gray-600">
                                                <span className="block truncate">{o.modelo}</span>
                                                {o.lote && <span className="block truncate text-gray-400">lote {o.lote}</span>}
                                            </span>
                                            <span className="col-span-2"><ServiciosChips s={o} /></span>
                                            <span className="col-span-1 text-right text-xs font-medium text-orange-600">{ya ? 'En lista' : <IoAddOutline className="ml-auto h-5 w-5" />}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <Pager page={pagina} pageSize={POR_PAGINA} count={res.count} onChange={setPagina} />
                        </div>
                        <p className="mb-1 mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">Salen con {cuadrilla?.nombre} ({onus.length + yaEntregadas.length})</p>
                        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                            {!onus.length && !yaEntregadas.length && <p className="px-3 py-3 text-gray-500">Todavía no se eligió ninguna ONU: búscala arriba, escanéala o usa Sugerir.</p>}
                            {yaEntregadas.map((o) => (
                                <div key={o.id} className="flex items-center justify-between gap-3 bg-gray-50 px-3 py-2">
                                    <span className="font-mono text-gray-700">{o.gpon_serial}</span>
                                    <span className="flex-1 text-xs text-gray-500">{o.modelo}</span>
                                    <ServiciosChips s={o} />
                                    <Badge>Ya entregada</Badge>
                                </div>
                            ))}
                            {onus.map((o) => (
                                <div key={o.id} className={cx('flex items-center justify-between gap-3 px-3 py-2', sobrantes.includes(o) && instalaciones.length > 0 && 'bg-amber-50')}>
                                    <span className="font-mono text-gray-800">{o.gpon_serial}</span>
                                    <span className="flex-1 text-xs text-gray-500">{o.modelo}{o.mac ? ` · ${o.mac}` : ''}</span>
                                    <ServiciosChips s={o} />
                                    <IconButton icon={IoCloseOutline} tone="danger" title="Quitar" onClick={() => setOnus((l) => l.filter((x) => x.id !== o.id))} />
                                </div>
                            ))}
                        </div>
                        <p className={cx('mt-1 text-xs', faltan.length ? 'text-red-600' : 'text-gray-500')}>
                            {faltan.length
                                ? `Faltan ${faltan.length} ONU compatible(s) para las instalaciones del día.`
                                : instalaciones.length ? 'Todas las instalaciones del día tienen una ONU compatible.' : ''}
                            {sobrantes.length > 0 && instalaciones.length > 0 ? ` ${sobrantes.length} ONU de reserva (cambios de equipo o imprevistos).` : ''}
                        </p>
                    </div>

                    {/* Material */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <p className="font-medium text-gray-700">Material por cantidad</p>
                            <Button variant="secondary" icon={IoAddOutline} onClick={() => setLineas((l) => [...l, { material: '', cantidad: '' }])} disabled={!req.granel.length || bloqueado}>Agregar</Button>
                        </div>
                        {!req.granel.length && <p className="text-gray-500">No hay material por cantidad disponible en {req.almacen.nombre}.</p>}
                        {!req.material.length && req.granel.length > 0 && <p className="mb-2 text-xs text-gray-500">Sin sugerencia: configura los kits en Cuadrillas › Kits de material.</p>}
                        <div className="space-y-2">
                            {lineas.map((g, i) => {
                                const reg = req.granel.find((x) => String(x.id) === String(g.material));
                                const excede = reg && Number(g.cantidad) > reg.cantidad;
                                return (
                                    <div key={i} className="grid grid-cols-12 items-center gap-2">
                                        <SelectInput className="col-span-6" value={g.material} onChange={setLinea(i, 'material')}>
                                            <option value="">{g.nombre ? `${g.nombre}: sin stock` : 'Material…'}</option>
                                            {req.granel.map((x) => <option key={x.id} value={x.id}>{x.nombre}{x.lote ? ` · lote ${x.lote}` : ''} · hay {num(x.cantidad)} {x.unidad}</option>)}
                                        </SelectInput>
                                        <TextInput className={cx('col-span-2', excede && 'border-red-400')} type="number" min={0} step="0.01" value={g.cantidad} onChange={setLinea(i, 'cantidad')} placeholder="Cantidad" />
                                        <span className="col-span-3 text-xs text-gray-500">{reg?.unidad || g.unidad}{g.sugerido ? ` · sugerido ${num(g.sugerido)}` : ''}</span>
                                        <IconButton className="col-span-1" icon={IoTrashOutline} tone="danger" title="Quitar" onClick={() => setLineas((l) => l.filter((_, j) => j !== i))} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Field label="Observaciones">
                        <TextArea rows={2} value={obs} onChange={(e) => setObs(e.target.value)} />
                    </Field>
                </div>
            )}
        </Modal>
    );
};

export default DespachoModal;
