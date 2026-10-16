// src/core/operaciones/pages/programacion/index.jsx
// Programación del día: OT por programar (pendientes y no ejecutadas, urgentes primero)
// y las cuadrillas con lo que tienen asignado para la fecha elegida.
// Se seleccionan OT y se asignan a una cuadrilla; reprogramar o desasignar se hace desde el detalle de la OT.
// Luego el almacén despacha a cada cuadrilla sus ONU (a su cargo) y el material, y al volver se rinde.
// Excepciones del día (las controla el sistema):
//   - Cuadrilla con OT y sin despacho: aviso "Sin despacho" en su tarjeta.
//   - Despacho de un día anterior sin rendir: aviso arriba; bloquea el siguiente despacho de esa cuadrilla.
//   - OT atrasadas: programadas para un día que ya pasó, sin ejecución registrada. El sistema no les
//     cambia el estado (la PWA puede sincronizar tarde); se avisan para reprogramarlas o marcarlas
//     no ejecutadas, con su motivo, desde el detalle de la OT.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { IoAlertCircleOutline, IoArrowDownOutline, IoArrowUpOutline, IoCalendarOutline, IoPrintOutline, IoRefreshOutline, IoChevronBack, IoChevronForward, IoCubeOutline, IoClipboardOutline } from 'react-icons/io5';
import { PageHeader, Card, Button, Badge, EmptyState, Spinner, SearchInput, SelectInput, TextInput, IconButton, Pager, cx } from '../../../../shared/components/ui';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { useUser } from '../../../auth/hooks/useAuth';
import { cuadrillasService, ordenesService, zonasService } from '../../services/operacionesService';
import { TIPOS, EstadoOT, Prioridad, PlazoChip, ZonaChip, fechaCorta, fechaLarga, hoyISO, sumarDias, integrantesTexto } from '../../components/opUi';
import { mostrarAvisos } from '../../components/ProgramarModal';
import { imprimirHojaDia } from '../../components/pdf';
import OrdenModal from '../ordenes/OrdenModal';
import DespachoModal from './DespachoModal';
import RendicionModal from './RendicionModal';

const PAGE_SIZE = 30;
const POR_PROGRAMAR = 'PENDIENTE,NO_EJECUTADA';
const OCUPAN = ['PROGRAMADA', 'EN_CAMPO', 'EJECUTADA'];

// ---------- Columna izquierda: OT por programar ----------
const OtFila = ({ o, marcada, onMarcar, onAbrir, seleccionable }) => (
    <div className={cx('flex gap-3 px-4 py-3', marcada && 'bg-orange-50')}>
        {seleccionable && (
            <input type="checkbox" checked={marcada} onChange={onMarcar} aria-label={`Seleccionar ${o.numero}`}
                className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
        )}
        <button type="button" onClick={onAbrir} className="min-w-0 flex-1 text-left">
            <p className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-semibold text-gray-800">{o.numero}</span>
                <span className="text-gray-700">{o.tipo.nombre}</span>
                <Prioridad valor={o.prioridad} />
                {o.estado.codigo === 'NO_EJECUTADA' && <Badge color="red">Reprogramar</Badge>}
            </p>
            <p className="truncate text-xs text-gray-600">{o.cliente.nombre} · {o.solicitud.direccion}</p>
            <p className="flex items-center gap-3 text-xs">
                <ZonaChip zona={o.zona} />
                <PlazoChip plazo={o.plazo} />
                {o.estado.codigo === 'NO_EJECUTADA' && o.cuadrilla && <span className="text-gray-500">antes: {o.cuadrilla.nombre}</span>}
            </p>
        </button>
    </div>
);

// ---------- Columna derecha: una cuadrilla en el día ----------
const CuadrillaDia = ({ c, fecha, seleccionadas, puedeEditar, puedeDespachar, ocupado, onAsignar, onMover, onAbrir, onDespachar, onRendicion, usuario }) => {
    const sobre = c.capacidad_diaria && c.carga > c.capacidad_diaria;
    const movibles = c.ordenes.filter((o) => OCUPAN.includes(o.estado.codigo));
    const d = c.despacho;
    const puedeAgregar = puedeDespachar && fecha >= hoyISO() && movibles.length > 0 && (!d || d.estado.codigo === 'ENTREGADO');
    const sinDespacho = !d && fecha >= hoyISO() && c.ordenes.some((o) => o.estado.codigo === 'PROGRAMADA');
    return (
        <Card className="overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 px-4 py-3">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold text-gray-800">
                        {c.nombre}
                        <Badge color={sobre ? 'red' : c.carga ? 'blue' : 'gray'}>{c.carga}{c.capacidad_diaria ? ` / ${c.capacidad_diaria}` : ''} OT</Badge>
                        {!c.lista_para_programar && <Badge color="amber">Incompleta</Badge>}
                        {sinDespacho && <Badge color={fecha === hoyISO() ? 'red' : 'amber'}>Sin despacho</Badge>}
                    </p>
                    <p className="text-xs text-gray-500">{integrantesTexto(c.integrantes) || 'Sin técnicos'}{c.vehiculo ? ` · ${c.vehiculo.placa}` : ''}</p>
                    {c.zonas.length > 0 && <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs">{c.zonas.map((z) => <ZonaChip key={z.id} zona={z} />)}</p>}
                    {d && (
                        <button type="button" onClick={() => onRendicion(d.id)} className="mt-1 flex items-center gap-1.5 text-xs text-gray-600 hover:text-orange-600">
                            <IoClipboardOutline className="h-3.5 w-3.5" />Despacho {d.numero} · {d.onus} ONU
                            <Badge color={d.estado.codigo === 'RENDIDO' ? 'green' : 'purple'}>{d.estado.codigo === 'ENTREGADO' ? 'Por rendir' : d.estado.nombre}</Badge>
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {puedeAgregar && <Button variant="secondary" icon={IoCubeOutline} onClick={() => onDespachar(c)} disabled={ocupado}>Despachar</Button>}
                    <Button variant="secondary" icon={IoPrintOutline} disabled={!movibles.length} onClick={() => imprimirHojaDia(c, fecha, usuario)}>Hoja del día</Button>
                    {puedeEditar && (
                        <Button onClick={() => onAsignar(c)} disabled={!seleccionadas || !c.lista_para_programar || ocupado}>
                            Asignar {seleccionadas ? `(${seleccionadas})` : ''}
                        </Button>
                    )}
                </div>
            </div>
            {!c.ordenes.length ? <p className="px-4 py-3 text-sm text-gray-400">Sin OT para este día.</p> : (
                <ol className="divide-y divide-gray-100">
                    {c.ordenes.map((o) => {
                        const i = movibles.findIndex((x) => x.id === o.id);
                        return (
                            <li key={o.id} className="flex items-center gap-2 px-4 py-2">
                                <span className="w-5 text-center text-xs font-semibold text-gray-400">{i >= 0 ? i + 1 : '—'}</span>
                                <button type="button" onClick={() => onAbrir(o.id)} className="min-w-0 flex-1 text-left text-sm">
                                    <p className="flex flex-wrap items-center gap-2"><span className="font-mono font-medium text-gray-800">{o.numero}</span><span className="text-gray-600">{o.tipo.nombre}</span><Prioridad valor={o.prioridad} /></p>
                                    <p className="truncate text-xs text-gray-500">{o.cliente.nombre} · {o.solicitud.direccion}</p>
                                    {['VENCIDA', 'POR_VENCER'].includes(o.plazo?.estado) && <p className="mt-0.5"><PlazoChip plazo={o.plazo} /></p>}
                                </button>
                                {o.onu && <span className="hidden font-mono text-xs text-green-700 sm:inline" title="ONU instalada">{o.onu}</span>}
                                <EstadoOT estado={o.estado} />
                                {puedeEditar && i >= 0 && movibles.length > 1 && (
                                    <div className="flex">
                                        <IconButton icon={IoArrowUpOutline} title="Subir" disabled={i === 0 || ocupado} onClick={() => onMover(c, movibles, i, -1)} />
                                        <IconButton icon={IoArrowDownOutline} title="Bajar" disabled={i === movibles.length - 1 || ocupado} onClick={() => onMover(c, movibles, i, 1)} />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}
        </Card>
    );
};

const Programacion = () => {
    const { hasPermission } = usePermissions();
    const { fullName } = useUser();
    const puedeEditar = hasPermission('ordenes', 'actualizar');
    const puedeDespachar = hasPermission('despachos', 'crear');
    const puedeRendir = hasPermission('despachos', 'actualizar');
    const [despachando, setDespachando] = useState(null); // cuadrilla del tablero
    const [rindiendo, setRindiendo] = useState(null); // id del despacho

    const [fecha, setFecha] = useState(() => sumarDias(hoyISO(), 1));
    const [almacen, setAlmacen] = useState('');
    const [almacenes, setAlmacenes] = useState([]);
    const [zonas, setZonas] = useState([]);
    const [tablero, setTablero] = useState([]);
    const [sinRendir, setSinRendir] = useState([]); // despachos de días anteriores sin rendir
    const [atrasadas, setAtrasadas] = useState([]); // OT programadas de días pasados sin ejecución
    const [plazos, setPlazos] = useState(null); // plazo ATT de las OT en curso: { vencidas, por_vencer }
    const [cargandoTablero, setCargandoTablero] = useState(true);

    const [f, setF] = useState({ search: '', tipo: '', zona: '' });
    const [pendientes, setPendientes] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [cargandoPend, setCargandoPend] = useState(true);
    const [marcadas, setMarcadas] = useState({}); // id → OT
    const [ocupado, setOcupado] = useState(false);
    const [abierta, setAbierta] = useState(null);

    useEffect(() => {
        zonasService.listar().then((r) => r.success && setZonas(r.data));
        cuadrillasService.almacenes().then((r) => r.success && setAlmacenes(r.data));
    }, []);

    const cargarTablero = useCallback(async () => {
        setCargandoTablero(true);
        const r = await ordenesService.programacion({ fecha, almacen });
        setCargandoTablero(false);
        if (r.success) { setTablero(r.data.cuadrillas); setSinRendir(r.data.sin_rendir || []); setAtrasadas(r.data.atrasadas || []); setPlazos(r.data.plazos || null); } else toast.error(r.error);
    }, [fecha, almacen]);

    const cargarPendientes = useCallback(async () => {
        setCargandoPend(true);
        const r = await ordenesService.listar({ ...f, estado: POR_PROGRAMAR, page, page_size: PAGE_SIZE });
        setCargandoPend(false);
        if (r.success) { setPendientes(r.data.results || []); setCount(r.data.count || 0); } else toast.error(r.error);
    }, [f, page]);

    useEffect(() => { cargarTablero(); }, [cargarTablero]);
    useEffect(() => { cargarPendientes(); }, [cargarPendientes]);

    const recargar = () => { cargarTablero(); cargarPendientes(); };
    const setFiltro = (k) => (v) => { setPage(1); setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v })); };
    const marcar = (o) => setMarcadas((m) => { const n = { ...m }; if (n[o.id]) delete n[o.id]; else n[o.id] = o; return n; });
    const seleccion = Object.values(marcadas);
    const todasMarcadas = pendientes.length > 0 && pendientes.every((o) => marcadas[o.id]);
    const marcarTodas = () => setMarcadas((m) => {
        const n = { ...m };
        pendientes.forEach((o) => { if (todasMarcadas) delete n[o.id]; else n[o.id] = o; });
        return n;
    });

    const asignar = async (c) => {
        if (fecha < hoyISO()) { toast.error('No se puede programar en una fecha pasada.'); return; }
        setOcupado(true);
        const r = await ordenesService.programarVarias({ cuadrilla: c.id, fecha, ordenes: seleccion.map((o) => o.id) });
        setOcupado(false);
        if (!r.success) { toast.error(r.error); return; }
        toast.success(r.data.message);
        mostrarAvisos(r.data.avisos);
        setMarcadas({});
        recargar();
    };

    const mover = async (c, lista, i, paso) => {
        const ids = lista.map((o) => o.id);
        [ids[i], ids[i + paso]] = [ids[i + paso], ids[i]];
        setOcupado(true);
        const r = await ordenesService.ordenarVisitas({ cuadrilla: c.id, fecha, ordenes: ids });
        setOcupado(false);
        if (!r.success) toast.error(r.error);
        cargarTablero();
    };

    const totalDia = useMemo(() => tablero.reduce((s, c) => s + c.carga, 0), [tablero]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Programación"
                subtitle="Asigna las OT pendientes a una cuadrilla y una fecha. Urgentes primero, luego las más antiguas."
                actions={<Button variant="secondary" icon={IoRefreshOutline} onClick={recargar} disabled={cargandoTablero || cargandoPend}>Actualizar</Button>}
            />

            <Card className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                <div className="flex items-center gap-1">
                    <IconButton icon={IoChevronBack} title="Día anterior" onClick={() => setFecha((d) => sumarDias(d, -1))} />
                    <TextInput type="date" className="w-44" value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} />
                    <IconButton icon={IoChevronForward} title="Día siguiente" onClick={() => setFecha((d) => sumarDias(d, 1))} />
                </div>
                <p className="flex flex-wrap items-center gap-2 text-sm text-gray-700 lg:flex-1">
                    <IoCalendarOutline className="h-4 w-4 text-gray-400" />{fechaLarga(fecha)}
                    <span className="text-gray-500">· {totalDia} OT programadas</span>
                    {fecha < hoyISO() && <Badge color="amber">Fecha pasada: solo consulta</Badge>}
                </p>
                <SelectInput className="lg:w-56" value={almacen} onChange={(e) => setAlmacen(e.target.value)}>
                    <option value="">Todos los almacenes</option>
                    {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </SelectInput>
            </Card>

            {sinRendir.length > 0 && (
                <div role="alert" className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center">
                    <IoAlertCircleOutline className="h-5 w-5 shrink-0" />
                    <p className="flex-1">
                        {sinRendir.length === 1 ? 'Hay un despacho' : `Hay ${sinRendir.length} despachos`} de días anteriores sin rendir.
                        Esas cuadrillas no pueden recibir otro despacho hasta rendirlo.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {sinRendir.map((d) => (
                            <button key={d.id} type="button" onClick={() => setRindiendo(d.id)}
                                className="rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100">
                                {d.cuadrilla} · {d.numero} · {fechaCorta(d.fecha)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {plazos && (plazos.vencidas > 0 || plazos.por_vencer > 0) && (
                <div role="alert" className="flex flex-col gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-gray-700 sm:flex-row sm:items-center">
                    <IoAlertCircleOutline className="h-5 w-5 shrink-0 text-red-600" />
                    <p className="flex-1">Plazo de atención ATT (instalación y traslado 7 días, reparación 24 horas):</p>
                    <div className="flex flex-wrap gap-2">
                        {plazos.vencidas > 0 && <Link to="/operaciones/ordenes?plazo=vencidas" className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100">{plazos.vencidas} OT vencida(s)</Link>}
                        {plazos.por_vencer > 0 && <Link to="/operaciones/ordenes?plazo=por_vencer" className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100">{plazos.por_vencer} por vencer</Link>}
                    </div>
                </div>
            )}

            {atrasadas.length > 0 && (
                <div role="alert" className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center">
                    <IoAlertCircleOutline className="h-5 w-5 shrink-0" />
                    <p className="flex-1">
                        {atrasadas.length === 1 ? 'Una OT programada para un día que ya pasó no tiene' : `${atrasadas.length} OT programadas para días que ya pasaron no tienen`} ejecución registrada.
                        Ábrela para reprogramarla o marcarla no ejecutada, con su motivo.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {atrasadas.map((o) => (
                            <button key={o.id} type="button" onClick={() => setAbierta(o.id)}
                                className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100">
                                {o.numero} · {o.cuadrilla} · {fechaCorta(o.fecha)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                <div className="space-y-3 xl:col-span-2">
                    <Card className="overflow-hidden">
                        <div className="space-y-2 border-b border-gray-100 p-4">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-800">Por programar <span className="font-normal text-gray-500">({count})</span></p>
                                {puedeEditar && seleccion.length > 0 && (
                                    <button type="button" className="text-xs text-gray-500 hover:text-gray-700" onClick={() => setMarcadas({})}>Quitar selección ({seleccion.length})</button>
                                )}
                            </div>
                            <SearchInput value={f.search} onChange={setFiltro('search')} delay={400} placeholder="OT, cliente, CI o dirección" />
                            <div className="flex gap-2">
                                <SelectInput value={f.zona} onChange={setFiltro('zona')}>
                                    <option value="">Todas las zonas</option>
                                    {zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                                </SelectInput>
                                <SelectInput value={f.tipo} onChange={setFiltro('tipo')}>
                                    <option value="">Todos los tipos</option>
                                    {TIPOS.map((t) => <option key={t.codigo} value={t.codigo}>{t.corto}</option>)}
                                </SelectInput>
                            </div>
                            {puedeEditar && pendientes.length > 0 && (
                                <label className="flex items-center gap-2 text-xs text-gray-600">
                                    <input type="checkbox" checked={todasMarcadas} onChange={marcarTodas} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                                    Seleccionar las de esta página
                                </label>
                            )}
                        </div>
                        {cargandoPend && !pendientes.length && <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div>}
                        {!cargandoPend && !pendientes.length && <EmptyState icon={IoCalendarOutline} title="No hay OT por programar" />}
                        <div className="divide-y divide-gray-100">
                            {pendientes.map((o) => (
                                <OtFila key={o.id} o={o} marcada={!!marcadas[o.id]} seleccionable={puedeEditar}
                                    onMarcar={() => marcar(o)} onAbrir={() => setAbierta(o.id)} />
                            ))}
                        </div>
                        <Pager page={page} pageSize={PAGE_SIZE} count={count} onChange={setPage} />
                    </Card>
                </div>

                <div className="space-y-4 xl:col-span-3">
                    {cargandoTablero && !tablero.length && <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div>}
                    {!cargandoTablero && !tablero.length && (
                        <Card><EmptyState icon={IoCalendarOutline} title="No hay cuadrillas activas">Regístralas en Operaciones › Cuadrillas.</EmptyState></Card>
                    )}
                    {tablero.map((c) => (
                        <CuadrillaDia key={c.id} c={c} fecha={fecha} usuario={fullName}
                            seleccionadas={fecha >= hoyISO() ? seleccion.length : 0}
                            puedeEditar={puedeEditar} puedeDespachar={puedeDespachar} ocupado={ocupado}
                            onAsignar={asignar} onMover={mover} onAbrir={setAbierta}
                            onDespachar={setDespachando} onRendicion={setRindiendo} />
                    ))}
                </div>
            </div>

            <DespachoModal
                open={!!despachando}
                cuadrilla={despachando}
                fecha={fecha}
                onClose={() => setDespachando(null)}
                onHecho={(des) => { setDespachando(null); cargarTablero(); setRindiendo(des.id); }}
            />
            <RendicionModal
                open={!!rindiendo}
                despachoId={rindiendo}
                puedeEditar={puedeRendir}
                onClose={() => setRindiendo(null)}
                onHecho={() => { setRindiendo(null); recargar(); }}
            />

            <OrdenModal
                id={abierta}
                open={!!abierta}
                zonas={zonas.filter((z) => z.activo)}
                puedeEditar={puedeEditar}
                onClose={() => setAbierta(null)}
                onCambio={() => { setMarcadas({}); recargar(); }}
            />
        </div>
    );
};

export default Programacion;
