// src/core/operaciones/components/ServiciosSolicitud.jsx
// Plan de internet + adicionales (TV cable / telefonía con cantidad) y el total referencial.
// El cálculo es el mismo que hace el backend (operaciones.models.cotizar).
import React from 'react';
import { Field, SelectInput, TextInput, cx } from '../../../shared/components/ui';

const n = (x) => Number(x || 0);
export const bs = (x) => `Bs ${n(x).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const UNIDAD = { TV: ['televisor', 'televisores'], TELEFONIA: ['línea', 'líneas'] };
const unidad = (tipo, c) => `${c} ${UNIDAD[tipo][c === 1 ? 0 : 1]}`;

export const cotizar = (plan, tv, cantTv, tel, cantLineas) => {
    const detalle = [];
    if (plan) detalle.push({ concepto: `Internet ${plan.nombre}${plan.velocidad_descarga ? ` · ${plan.velocidad_descarga} Mbps` : ''}`, mensual: n(plan.precio_mensual), instalacion: n(plan.precio_instalacion) });
    [[tv, cantTv], [tel, cantLineas]].forEach(([ad, cant]) => {
        if (!ad) return;
        const extra = Math.max(cant - ad.unidades_incluidas, 0);
        detalle.push({
            concepto: `${ad.tipo_nombre} ${ad.nombre} · ${unidad(ad.tipo, cant)}${extra ? ` (${ad.unidades_incluidas} incluido(s) + ${extra} × ${bs(ad.precio_unidad_extra)})` : ''}`,
            mensual: n(ad.precio_mensual) + n(ad.precio_unidad_extra) * extra,
            instalacion: n(ad.costo_instalacion),
        });
    });
    return { detalle, mensual: detalle.reduce((s, d) => s + d.mensual, 0), instalacion: detalle.reduce((s, d) => s + d.instalacion, 0) };
};

const Adicional = ({ titulo, tipo, opciones, idSel, cantidad, onPlan, onCantidad, error }) => {
    const sel = opciones.find((o) => String(o.id) === String(idSel));
    return (
        <div className="grid grid-cols-[1fr_7rem] gap-2">
            <Field label={titulo} error={error}>
                <SelectInput value={idSel} onChange={(e) => onPlan(e.target.value, opciones.find((o) => String(o.id) === e.target.value))}>
                    <option value="">Sin {titulo.toLowerCase()}</option>
                    {opciones.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.nombre} · {bs(o.precio_mensual)}/mes · incluye {unidad(tipo, o.unidades_incluidas)}
                        </option>
                    ))}
                </SelectInput>
            </Field>
            <Field label={tipo === 'TV' ? 'Televisores' : 'Líneas'}>
                <TextInput type="number" min={1} max={sel?.maximo_unidades || 1} disabled={!sel}
                    value={sel ? cantidad : ''} onChange={(e) => onCantidad(Math.max(1, Math.min(Number(e.target.value) || 1, sel?.maximo_unidades || 1)))} />
            </Field>
            {sel && sel.precio_unidad_extra > 0 && (
                <p className="col-span-2 -mt-1 text-xs text-gray-500">
                    Cada {UNIDAD[tipo][0]} adicional: {bs(sel.precio_unidad_extra)}/mes (máximo {sel.maximo_unidades})
                </p>
            )}
        </div>
    );
};

const ServiciosSolicitud = ({ planes, adicionales, v, set, errores }) => {
    const tvs = adicionales.filter((a) => a.tipo === 'TV');
    const tels = adicionales.filter((a) => a.tipo === 'TELEFONIA');
    const plan = planes.find((p) => String(p.id) === String(v.plan));
    const tv = tvs.find((a) => String(a.id) === String(v.plan_tv));
    const tel = tels.find((a) => String(a.id) === String(v.plan_telefonia));
    const c = cotizar(plan, tv, v.cantidad_tv, tel, v.cantidad_lineas);

    return (
        <div className="space-y-3">
            <Field label="Plan de internet" required error={errores.plan} hint={!planes.length ? 'No hay planes vigentes: regístralos en Operaciones › Planes.' : undefined}>
                <SelectInput value={v.plan} onChange={set('plan')}>
                    <option value="">Elegir plan…</option>
                    {planes.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.nombre}{p.velocidad_descarga ? ` · ${p.velocidad_descarga} Mbps` : ''}{p.precio_mensual ? ` · ${bs(p.precio_mensual)}/mes` : ''}
                        </option>
                    ))}
                </SelectInput>
            </Field>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <Adicional titulo="TV cable" tipo="TV" opciones={tvs} idSel={v.plan_tv} cantidad={v.cantidad_tv} error={errores.plan_tv || errores.cantidad_tv}
                    onPlan={(id, ad) => { set('plan_tv')(id); set('cantidad_tv')(ad?.unidades_incluidas || 0); }} onCantidad={set('cantidad_tv')} />
                <Adicional titulo="Telefonía" tipo="TELEFONIA" opciones={tels} idSel={v.plan_telefonia} cantidad={v.cantidad_lineas} error={errores.plan_telefonia || errores.cantidad_lineas}
                    onPlan={(id, ad) => { set('plan_telefonia')(id); set('cantidad_lineas')(ad?.unidades_incluidas || 0); }} onCantidad={set('cantidad_lineas')} />
            </div>
            {plan && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500"><tr><th className="pb-1 text-left font-medium">Concepto</th><th className="pb-1 text-right font-medium">Mensual</th><th className="pb-1 text-right font-medium">Instalación</th></tr></thead>
                        <tbody>
                            {c.detalle.map((d) => (
                                <tr key={d.concepto}><td className="py-0.5 text-gray-700">{d.concepto}</td><td className="text-right text-gray-700">{bs(d.mensual)}</td><td className="text-right text-gray-700">{d.instalacion ? bs(d.instalacion) : '—'}</td></tr>
                            ))}
                            <tr className={cx('border-t border-gray-200 font-semibold text-gray-900')}>
                                <td className="pt-1">Total referencial</td><td className="pt-1 text-right">{bs(c.mensual)}/mes</td><td className="pt-1 text-right">{bs(c.instalacion)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="mt-1 text-xs text-gray-500">Solo informativo para el cliente; no genera cobros.</p>
                </div>
            )}
        </div>
    );
};

export default ServiciosSolicitud;
