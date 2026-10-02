// src/core/almacenes/pages/laboratorio/EnLaboratorioTab.jsx
// Equipos en laboratorio: escanear/seleccionar y registrar el resultado.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoFlaskOutline, IoBarcodeOutline, IoCheckmarkDoneOutline } from 'react-icons/io5';
import { Card, Button, SearchInput, EmptyState, Spinner, Badge, inputCls, cx } from '../../../../shared/components/ui';
import laboratorioService from '../../services/laboratorioService';
import InspeccionModal from './InspeccionModal';

const norm = (s) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const EnLaboratorioTab = ({ puedeEditar, diasLimite, onCambio }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sel, setSel] = useState(new Set());
    const [inspeccionar, setInspeccionar] = useState(null); // lista de equipos
    const [codigo, setCodigo] = useState('');
    const scanRef = useRef(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await laboratorioService.lista('en_laboratorio');
        setLoading(false);
        if (r.success) setItems(r.data.materiales || []);
        else toast.error(r.error);
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    const visibles = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter((m) => [m.gpon_serial, m.mac_address, m.serial_manufacturer, m.codigo_interno, m.modelo, m.lote.numero_lote]
            .some((v) => (v || '').toLowerCase().includes(q)));
    }, [items, search]);

    // Lector de código de barras / escritura: GPON, MAC o D-SN + Enter → selecciona el equipo
    const escanear = (e) => {
        e.preventDefault();
        const c = norm(codigo);
        if (!c) return;
        const m = items.find((x) => [x.gpon_serial, x.mac_address, x.serial_manufacturer, x.codigo_interno].some((v) => norm(v) === c));
        if (!m) { toast.error(`${codigo} no está en laboratorio`); }
        else if (sel.has(m.id)) { toast(`${m.gpon_serial} ya estaba seleccionado`); }
        else { setSel((s) => new Set(s).add(m.id)); toast.success(`${m.gpon_serial} seleccionado`); }
        setCodigo('');
        scanRef.current?.focus();
    };

    const alternar = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const todosVisibles = visibles.length > 0 && visibles.every((m) => sel.has(m.id));
    const alternarVisibles = () => setSel((s) => {
        const n = new Set(s);
        visibles.forEach((m) => (todosVisibles ? n.delete(m.id) : n.add(m.id)));
        return n;
    });
    const seleccionados = items.filter((m) => sel.has(m.id));

    const terminado = () => { setInspeccionar(null); setSel(new Set()); onCambio(); };

    return (
        <div className="space-y-4">
            <Card className="space-y-3 p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    {puedeEditar && (
                        <form onSubmit={escanear} className="relative lg:w-80">
                            <IoBarcodeOutline className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={scanRef}
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                placeholder="Escanear GPON, MAC o D-SN y Enter"
                                className={cx(inputCls, 'h-10 pl-9 font-mono')}
                            />
                        </form>
                    )}
                    <SearchInput className="lg:flex-1" value={search} onChange={setSearch} placeholder="Filtrar por serie, modelo o lote" />
                    {puedeEditar && (
                        <Button icon={IoCheckmarkDoneOutline} disabled={!sel.size} onClick={() => setInspeccionar(seleccionados)}>
                            Registrar resultado{sel.size ? ` (${sel.size})` : ''}
                        </Button>
                    )}
                </div>
                {sel.size > 0 && (
                    <p className="text-sm text-gray-600">
                        {sel.size} seleccionado(s) · <button type="button" className="text-orange-600 hover:underline" onClick={() => setSel(new Set())}>quitar selección</button>
                    </p>
                )}
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                {puedeEditar && (
                                    <th className="w-10 px-4 py-3">
                                        <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={todosVisibles} onChange={alternarVisibles} aria-label="Seleccionar todos" />
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
                            {!loading && !visibles.length && (
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
