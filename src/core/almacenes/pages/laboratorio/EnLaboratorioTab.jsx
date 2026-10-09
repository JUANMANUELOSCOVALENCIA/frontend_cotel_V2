// src/core/almacenes/pages/laboratorio/EnLaboratorioTab.jsx
// Equipos en laboratorio: buscar (o escanear), seleccionar y registrar el resultado.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoFlaskOutline, IoSearchOutline, IoCloseOutline, IoCheckmarkDoneOutline } from 'react-icons/io5';
import { Card, Button, EmptyState, Spinner, Badge, Pager, usePaginado, inputCls, cx } from '../../../../shared/components/ui';
import laboratorioService from '../../services/laboratorioService';
import InspeccionModal from './InspeccionModal';

const norm = (s) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const EnLaboratorioTab = ({ puedeEditar, diasLimite, onCambio }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [soloSel, setSoloSel] = useState(false);
    const [sel, setSel] = useState(new Set());
    const [inspeccionar, setInspeccionar] = useState(null); // lista de equipos
    const buscarRef = useRef(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await laboratorioService.lista('en_laboratorio');
        setLoading(false);
        if (r.success) setItems(r.data.materiales || []);
        else toast.error(r.error);
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    // Filtra mientras escribes (serie, MAC, D-SN, modelo o lote)
    const filtrados = useMemo(() => {
        const q = search.trim().toLowerCase();
        const qn = norm(search);
        return items.filter((m) => {
            if (soloSel && !sel.has(m.id)) return false;
            if (!q) return true;
            return [m.gpon_serial, m.mac_address, m.serial_manufacturer, m.codigo_interno, m.modelo, m.lote.numero_lote]
                .some((v) => (v || '').toLowerCase().includes(q) || (qn.length >= 4 && norm(v).includes(qn)));
        });
    }, [items, search, soloSel, sel]);
    const { page, setPage, visibles, count, pageSize } = usePaginado(filtrados, 25, `${search}|${soloSel}`);

    // Enter: si la serie coincide exacto con un equipo (lector de código de barras), se marca y se limpia el campo
    const alEnter = (e) => {
        e.preventDefault();
        const c = norm(search);
        if (!c) return;
        const m = items.find((x) => [x.gpon_serial, x.mac_address, x.serial_manufacturer, x.codigo_interno].some((v) => norm(v) === c));
        if (!m) {
            if (!filtrados.length) toast.error(`${search} no está en laboratorio`);
            return; // sin coincidencia exacta: se queda como filtro
        }
        if (!sel.has(m.id)) setSel((s) => new Set(s).add(m.id));
        toast.success(`${m.gpon_serial || m.codigo_interno} seleccionado`);
        setSearch('');
        buscarRef.current?.focus();
    };

    const alternar = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const todosFiltrados = filtrados.length > 0 && filtrados.every((m) => sel.has(m.id));
    const alternarFiltrados = () => setSel((s) => {
        const n = new Set(s);
        filtrados.forEach((m) => (todosFiltrados ? n.delete(m.id) : n.add(m.id)));
        return n;
    });
    const seleccionados = items.filter((m) => sel.has(m.id));

    const terminado = () => { setInspeccionar(null); setSel(new Set()); setSoloSel(false); onCambio(); };

    return (
        <div className="space-y-4">
            <Card className="space-y-3 p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <form onSubmit={alEnter} className="relative lg:flex-1">
                        <IoSearchOutline className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            ref={buscarRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={puedeEditar ? 'Buscar o escanear: GPON, MAC, D-SN, modelo o lote' : 'Buscar: GPON, MAC, D-SN, modelo o lote'}
                            className={cx(inputCls, 'h-10 pl-9 pr-9')}
                        />
                        {search && (
                            <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600" aria-label="Limpiar">
                                <IoCloseOutline className="h-4 w-4" />
                            </button>
                        )}
                    </form>
                    {puedeEditar && (
                        <Button icon={IoCheckmarkDoneOutline} disabled={!sel.size} onClick={() => setInspeccionar(seleccionados)}>
                            Registrar resultado{sel.size ? ` (${sel.size})` : ''}
                        </Button>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>{search || soloSel ? `${filtrados.length} de ${items.length} equipos` : `${items.length} equipos en laboratorio`}</span>
                    {puedeEditar && <span className="text-xs text-gray-400">Con lector de código de barras: escanea y el equipo queda marcado.</span>}
                    {sel.size > 0 && (
                        <span className="ml-auto flex items-center gap-3">
                            <button type="button" className={cx('rounded-full border px-3 py-0.5', soloSel ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-300 hover:bg-gray-50')} onClick={() => setSoloSel((v) => !v)}>
                                {soloSel ? 'Ver todos' : `Ver solo seleccionados (${sel.size})`}
                            </button>
                            <button type="button" className="text-orange-600 hover:underline" onClick={() => { setSel(new Set()); setSoloSel(false); }}>quitar selección</button>
                        </span>
                    )}
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                {puedeEditar && (
                                    <th className="w-10 px-4 py-3">
                                        <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={todosFiltrados} onChange={alternarFiltrados} title={`Seleccionar los ${filtrados.length} equipos${search ? ' filtrados' : ''}`} aria-label="Seleccionar todos" />
                                    </th>
                                )}
                                <th className="px-4 py-3 font-semibold">Equipo</th>
                                <th className="px-4 py-3 font-semibold">Modelo</th>
                                <th className="px-4 py-3 font-semibold">Lote</th>
                                <th className="px-4 py-3 font-semibold">En laboratorio</th>
                                {puedeEditar && <th className="w-32 px-4 py-3" />}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !items.length && (
                                <tr><td colSpan={6} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>
                            )}
                            {!loading && !filtrados.length && (
                                <tr><td colSpan={6}><EmptyState icon={IoFlaskOutline} title={items.length ? 'Ningún equipo coincide con el filtro' : 'No hay equipos en laboratorio'} /></td></tr>
                            )}
                            {visibles.map((m) => {
                                const demorado = m.dias_en_laboratorio >= diasLimite;
                                return (
                                    <tr key={m.id} className={cx(puedeEditar && 'cursor-pointer hover:bg-gray-50', sel.has(m.id) && 'bg-orange-50/50')} onClick={() => puedeEditar && alternar(m.id)}>
                                        {puedeEditar && (
                                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={sel.has(m.id)} onChange={() => alternar(m.id)} />
                                            </td>
                                        )}
                                        <td className="px-4 py-3">
                                            <p className="font-mono font-medium text-gray-800">{m.gpon_serial || m.codigo_interno}</p>
                                            <p className="font-mono text-xs text-gray-500">{m.mac_address}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {m.modelo}
                                            {m.inspecciones_previas > 0 && <Badge color="orange" className="ml-2">Re-prueba</Badge>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{m.lote.numero_lote}</td>
                                        <td className="px-4 py-3">
                                            <span className={cx('font-medium', demorado ? 'text-red-600' : 'text-gray-700')}>
                                                {m.dias_en_laboratorio === 0 ? 'Hoy' : `${m.dias_en_laboratorio} día(s)`}
                                            </span>
                                        </td>
                                        {puedeEditar && (
                                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" onClick={() => setInspeccionar([m])}>Inspeccionar</Button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <Pager page={page} pageSize={pageSize} count={count} onChange={setPage} />
            </Card>

            <InspeccionModal
                open={!!inspeccionar}
                equipos={inspeccionar || []}
                onClose={() => setInspeccionar(null)}
                onGuardado={terminado}
            />
        </div>
    );
};

export default EnLaboratorioTab;
