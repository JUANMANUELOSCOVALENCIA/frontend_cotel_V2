// src/core/layout/pages/Dashboard.jsx
// Panel principal: indicadores de OT y plazo ATT, e inventario con el modelo EOQ
// (cuánto pedir y cuándo, con el consumo real registrado en las OT). Todo se exporta en PDF.
import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IoRefreshOutline, IoDownloadOutline, IoSettingsOutline, IoAlertCircle } from 'react-icons/io5';
import { useUser } from '../../auth/hooks/useAuth';
import { usePermissions } from '../../permissions/hooks/usePermissions';
import { PageHeader, Card, Button, StatCard, Badge, Spinner, Modal, Field, TextInput, cx } from '../../../shared/components/ui';
import { inventarioService, ordenesService } from '../../operaciones/services/operacionesService';
import { reporteEOQ } from '../../operaciones/components/pdf';

const num = (n, dec = 0) => (n === null || n === undefined ? '—' : Number(n).toLocaleString('es-BO', { maximumFractionDigits: dec }));
const mesNombre = (clave) => new Date(`${clave}-01T00:00:00`).toLocaleDateString('es-BO', { month: 'short' });

const ParametrosModal = ({ fila, defecto, onClose, onGuardado }) => {
    const [v, setV] = useState({});
    const [guardando, setGuardando] = useState(false);
    useEffect(() => {
        if (fila === undefined) return;
        const p = fila?.parametros || defecto || {};
        setV({ S: p.S ?? '', H: p.H ?? '', L: p.L ?? '', D: p.D_estimada ?? '' });
    }, [fila, defecto]);
    if (fila === undefined) return null;
    const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
    const guardar = async () => {
        setGuardando(true);
        const r = await inventarioService.parametros({ modelo: fila?.modelo.id || null, S: v.S, H: v.H, L: v.L, D_estimada: v.D || null });
        setGuardando(false);
        if (!r.success) { toast.error(r.error); return; }
        toast.success(r.data.message);
        onGuardado(r.data);
    };
    return (
        <Modal open onClose={onClose} busy={guardando} size="sm"
            title={fila ? `Parámetros EOQ · ${fila.modelo.nombre}` : 'Parámetros EOQ por defecto (ONU)'}
            subtitle={fila ? `Unidad: ${fila.modelo.unidad}` : 'Se aplican a los modelos de ONU sin parámetros propios'}
            footer={<><Button variant="ghost" onClick={onClose} disabled={guardando}>Cancelar</Button><Button onClick={guardar} loading={guardando}>Guardar</Button></>}>
            <div className="grid grid-cols-2 gap-3">
                <Field label="S · costo por pedido (Bs)" required><TextInput type="number" min={0} step="0.01" value={v.S} onChange={set('S')} /></Field>
                <Field label="H · mantener 1 unidad al año (Bs)" required><TextInput type="number" min={0} step="0.01" value={v.H} onChange={set('H')} /></Field>
                <Field label="L · días de entrega" required><TextInput type="number" min={1} value={v.L} onChange={set('L')} /></Field>
                <Field label="D estimada (por año)" hint="Solo si aún no hay consumo"><TextInput type="number" min={1} value={v.D} onChange={set('D')} /></Field>
            </div>
        </Modal>
    );
};

const Dashboard = () => {
    const { user, fullName } = useUser();
    const { hasPermission } = usePermissions();
    const verOT = hasPermission('ordenes', 'leer');
    const verInv = hasPermission('materiales', 'leer') || verOT;
    const editarInv = hasPermission('materiales', 'actualizar');
    const [ind, setInd] = useState(null);
    const [eoq, setEoq] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [editando, setEditando] = useState(undefined); // undefined = cerrado, null = por defecto, fila = un modelo

    const cargar = useCallback(async () => {
        setCargando(true);
        const [a, b] = await Promise.all([verOT ? ordenesService.indicadores() : null, verInv ? inventarioService.eoq() : null]);
        setCargando(false);
        if (a) { if (a.success) setInd(a.data); else toast.error(a.error); }
        if (b) { if (b.success) setEoq(b.data); else toast.error(b.error); }
    }, [verOT, verInv]);
    useEffect(() => { cargar(); }, [cargar]);

    // El técnico (solo app de campo) entra directo a sus trabajos
    if (hasPermission('campo', 'leer') && !verOT) return <Navigate to="/campo" replace />;

    const pedir = (eoq?.filas || []).filter((f) => f.pedir);
    const maxMes = Math.max(1, ...(eoq?.consumo_mensual || []).map((m) => m.onu));
    const pct = (k) => (ind?.att[k].porcentaje === null || ind?.att[k].porcentaje === undefined ? '—' : `${ind.att[k].porcentaje} %`);
    const tono = (k) => (ind?.att[k].porcentaje === null ? 'text-gray-800' : ind.att[k].porcentaje >= 85 ? 'text-green-600' : 'text-red-600');

    return (
        <div className="space-y-6">
            <PageHeader
                subtitle={`Bienvenido, ${user?.nombres || ''}`}
                actions={(verOT || verInv) && (
                    <>
                        <Button variant="secondary" icon={IoRefreshOutline} onClick={cargar} disabled={cargando}>Actualizar</Button>
                        {eoq && <Button variant="secondary" icon={IoDownloadOutline} onClick={() => reporteEOQ(eoq, ind, fullName)}>Exportar PDF</Button>}
                    </>
                )}
            />

            {!verOT && !verInv && (
                <Card className="p-6 text-sm text-gray-600">Usa el menú de la izquierda para entrar a los módulos que tienes habilitados.</Card>
            )}

            {cargando && !ind && !eoq && <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div>}

            {ind && (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    <StatCard label="OT abiertas" value={num(ind.abiertas)} />
                    <StatCard label="Por programar" value={num((ind.por_estado.PENDIENTE || 0) + (ind.por_estado.NO_EJECUTADA || 0))} tone="text-amber-600" />
                    <Link to="/operaciones/ordenes?plazo=vencidas" className="block">
                        <StatCard label="Plazo ATT vencido / por vencer" value={`${ind.plazos.vencidas} / ${ind.plazos.por_vencer}`} tone={ind.plazos.vencidas ? 'text-red-600' : 'text-gray-800'} />
                    </Link>
                    <StatCard label="Instalaciones en 7 días (TIS, meta 85 %)" value={pct('TIS')} tone={tono('TIS')} />
                    <StatCard label="Reparaciones en 24 h (TRF, meta 85 %)" value={pct('TRF')} tone={tono('TRF')} />
                </div>
            )}

            {eoq && (
                <Card className="overflow-hidden">
                    <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-semibold text-gray-800">Inventario · cuánto y cuándo pedir (EOQ)</p>
                            <p className="text-xs text-gray-500">
                                D = consumo de los últimos {eoq.periodo_dias} días llevado a un año (sin consumo: D estimada) · EOQ = √(2·D·S / H) · Reorden = d × L
                            </p>
                        </div>
                        {editarInv && <Button variant="ghost" icon={IoSettingsOutline} onClick={() => setEditando(null)}>Parámetros por defecto</Button>}
                    </div>
                    {pedir.length > 0 && (
                        <div className="flex items-start gap-2 border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-800">
                            <IoAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                            <span>Hay que pedir: {pedir.map((f) => `${f.modelo.nombre} (${num(f.eoq)} ${f.modelo.unidad})`).join(', ')}. El stock ya llegó al punto de reorden.</span>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[960px] text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Modelo</th>
                                    <th className="px-4 py-3 text-right font-semibold">Stock</th>
                                    <th className="px-4 py-3 text-right font-semibold">Consumo {eoq.periodo_dias} d</th>
                                    <th className="px-4 py-3 text-right font-semibold">D anual</th>
                                    <th className="px-4 py-3 text-right font-semibold">EOQ</th>
                                    <th className="px-4 py-3 text-right font-semibold">Reorden</th>
                                    <th className="px-4 py-3 text-right font-semibold">Cobertura</th>
                                    <th className="px-4 py-3 font-semibold">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {!eoq.filas.length && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Todavía no hay equipos ni consumo registrados.</td></tr>}
                                {eoq.filas.map((f) => (
                                    <tr key={f.modelo.id} className={cx(editarInv && 'cursor-pointer hover:bg-gray-50', f.pedir && 'bg-red-50/40')} onClick={() => editarInv && setEditando(f)}>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-800">{f.modelo.nombre}</p>
                                            <p className="text-xs text-gray-500">{f.parametros ? `S ${num(f.parametros.S, 2)} · H ${num(f.parametros.H, 2)} · L ${f.parametros.L} d${f.parametros.propios ? '' : ' (por defecto)'}` : 'Sin parámetros'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right" title={Object.entries(f.stock_almacenes).map(([a, n]) => `${a}: ${num(n, 2)}`).join('\n')}>{num(f.stock, 2)} <span className="text-xs text-gray-400">{f.modelo.unidad}</span></td>
                                        <td className="px-4 py-3 text-right">{num(f.consumo_periodo, 2)}</td>
                                        <td className="px-4 py-3 text-right">
                                            {num(f.demanda_anual, 1)}
                                            {f.fuente && <p className="text-xs text-gray-400">{f.fuente === 'CONSUMO' ? 'consumo real' : 'estimada'}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-800">{num(f.eoq)}</td>
                                        <td className="px-4 py-3 text-right">{num(f.rop)}</td>
                                        <td className="px-4 py-3 text-right">{f.cobertura_dias === null ? '—' : `${num(f.cobertura_dias, 1)} d`}</td>
                                        <td className="px-4 py-3">
                                            {f.eoq === null ? <Badge>Sin parámetros</Badge> : f.pedir ? <Badge color="red">Pedir ahora</Badge> : <Badge color="green">Stock suficiente</Badge>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {eoq.consumo_mensual.length > 0 && (
                        <div className="border-t border-gray-100 px-4 py-4">
                            <p className="mb-3 text-sm font-medium text-gray-700">ONU instaladas por mes</p>
                            <div className="flex h-32 items-end gap-3">
                                {eoq.consumo_mensual.map((m) => (
                                    <div key={m.mes} className="flex flex-1 flex-col items-center gap-1">
                                        <span className="text-xs text-gray-600">{num(m.onu)}</span>
                                        <div className="w-full max-w-[48px] rounded-t bg-orange-400" style={{ height: `${Math.max(2, (m.onu / maxMes) * 88)}px` }} />
                                        <span className="text-xs capitalize text-gray-500">{mesNombre(m.mes)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            )}

            <ParametrosModal fila={editando} defecto={eoq?.defecto} onClose={() => setEditando(undefined)}
                onGuardado={(datos) => { setEoq(datos); setEditando(undefined); }} />
        </div>
    );
};

export default Dashboard;
