// src/core/permissions/pages/roles/PermisoMatriz.jsx
// Matriz recurso × acción para elegir (o solo ver) los permisos de un rol.
import React, { useMemo, useState } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { SearchInput, ACCIONES, ACCION_COLOR, cx } from '../../../../shared/components/ui';

const CHECK_ON = {
    green: 'bg-green-600 border-green-600',
    blue: 'bg-blue-600 border-blue-600',
    amber: 'bg-amber-500 border-amber-500',
    red: 'bg-red-600 border-red-600',
};

const Check = ({ checked, onChange, disabled, color, title, partial }) => (
    <button
        type="button"
        role="checkbox"
        aria-checked={partial ? 'mixed' : checked}
        title={title}
        disabled={disabled}
        onClick={onChange}
        className={cx(
            'inline-flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
            disabled ? 'cursor-not-allowed border-gray-200 bg-gray-50' :
                checked ? cx(CHECK_ON[color] || 'bg-orange-500 border-orange-500', 'text-white') :
                    partial ? 'border-orange-400 bg-orange-100' : 'border-gray-300 bg-white hover:border-gray-400'
        )}
    >
        {checked && <IoCheckmark className="h-3.5 w-3.5" />}
        {!checked && partial && <span className="h-0.5 w-2 rounded bg-orange-500" />}
    </button>
);

/**
 * permisos: todos los permisos del sistema
 * selected: Set de ids seleccionados
 * onChange(Set) — si no se pasa, la matriz es de solo lectura
 * soloAsignados: en modo lectura, mostrar solo recursos con algún permiso marcado
 */
const PermisoMatriz = ({ permisos, selected, onChange, soloAsignados = false, maxHeight = 'max-h-[45vh]' }) => {
    const [q, setQ] = useState('');
    const readOnly = !onChange;

    const { recursos, map } = useMemo(() => {
        const m = {};
        permisos.forEach((p) => { (m[p.recurso] = m[p.recurso] || {})[p.accion] = p; });
        return { recursos: Object.keys(m).sort(), map: m };
    }, [permisos]);

    const seleccionable = (p) => p && p.activo;
    const visibles = recursos.filter((r) => {
        if (q && !r.includes(q.trim().toLowerCase())) return false;
        if (soloAsignados) return Object.values(map[r]).some((p) => selected.has(p.id));
        return true;
    });

    const toggle = (ids, on) => {
        const next = new Set(selected);
        ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
        onChange(next);
    };

    const idsFila = (r) => ACCIONES.map((a) => map[r][a]).filter(seleccionable).map((p) => p.id);
    const idsColumna = (a) => visibles.map((r) => map[r][a]).filter(seleccionable).map((p) => p.id);
    const estado = (ids) => {
        const n = ids.filter((id) => selected.has(id)).length;
        return { all: ids.length > 0 && n === ids.length, some: n > 0 && n < ids.length };
    };

    const total = permisos.filter(seleccionable).length;
    const marcados = permisos.filter((p) => selected.has(p.id)).length;

    return (
        <div className="rounded-lg border border-gray-200">
            <div className="flex flex-col gap-2 border-b border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center">
                <SearchInput value={q} onChange={setQ} placeholder="Filtrar recursos…" className="sm:w-64" />
                <span className="text-sm text-gray-600 sm:ml-auto">
                    <strong className="text-gray-800">{marcados}</strong> de {total} permisos
                </span>
                {!readOnly && (
                    <div className="flex gap-1">
                        <button type="button" onClick={() => onChange(new Set(permisos.filter(seleccionable).map((p) => p.id)))} className="rounded-md px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50">Todos</button>
                        <button type="button" onClick={() => onChange(new Set(permisos.filter((p) => seleccionable(p) && p.accion === 'leer').map((p) => p.id)))} className="rounded-md px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50">Solo lectura</button>
                        <button type="button" onClick={() => onChange(new Set())} className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100">Ninguno</button>
                    </div>
                )}
            </div>
            <div className={cx('overflow-auto', maxHeight)}>
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-white text-xs uppercase tracking-wide text-gray-500 shadow-[0_1px_0_0_#e5e7eb]">
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold">Recurso</th>
                            {ACCIONES.map((a) => {
                                const st = estado(idsColumna(a));
                                return (
                                    <th key={a} className="w-24 px-2 py-2 text-center font-semibold">
                                        <div className="flex flex-col items-center gap-1">
                                            <span>{a}</span>
                                            {!readOnly && (
                                                <Check checked={st.all} partial={st.some} color={ACCION_COLOR[a]} title={`Marcar "${a}" en todos`} onChange={() => toggle(idsColumna(a), !st.all)} />
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                            {!readOnly && <th className="w-16 px-2 py-2 text-center font-semibold">Fila</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {!visibles.length && (
                            <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-400">{soloAsignados ? 'Este rol no tiene permisos' : 'Sin resultados'}</td></tr>
                        )}
                        {visibles.map((r) => {
                            const st = estado(idsFila(r));
                            return (
                                <tr key={r} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 font-mono text-[13px] text-gray-800">{r}</td>
                                    {ACCIONES.map((a) => {
                                        const p = map[r][a];
                                        if (!p) return <td key={a} className="px-2 py-2 text-center text-gray-300">—</td>;
                                        const on = selected.has(p.id);
                                        return (
                                            <td key={a} className="px-2 py-2 text-center">
                                                <Check
                                                    checked={on}
                                                    color={ACCION_COLOR[a]}
                                                    disabled={readOnly ? !on : !p.activo}
                                                    title={p.activo ? (p.descripcion || `${r}:${a}`) : 'Permiso inactivo'}
                                                    onChange={readOnly ? undefined : () => toggle([p.id], !on)}
                                                />
                                            </td>
                                        );
                                    })}
                                    {!readOnly && (
                                        <td className="px-2 py-2 text-center">
                                            <Check checked={st.all} partial={st.some} title="Marcar toda la fila" onChange={() => toggle(idsFila(r), !st.all)} />
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PermisoMatriz;
