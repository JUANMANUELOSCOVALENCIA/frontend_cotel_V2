// src/core/almacenes/pages/laboratorio/PorEnviarTab.jsx
// Equipos NUEVOS que aún no pasaron por laboratorio, agrupados por lote y entrega.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoSendOutline, IoCubeOutline } from 'react-icons/io5';
import { Card, Button, SearchInput, EmptyState, Spinner, ConfirmModal, cx } from '../../../../shared/components/ui';
import laboratorioService from '../../services/laboratorioService';
import { fecha } from '../lotes/loteUi';

const nombreEntrega = (n) => (n ? `Entrega #${n}` : 'Recepción inicial');

const PorEnviarTab = ({ puedeEditar, onCambio }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sel, setSel] = useState(new Set());
    const [enviando, setEnviando] = useState(null); // clave de lo que se envía
    const [confirmar, setConfirmar] = useState(null); // { titulo, mensaje, accion }

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await laboratorioService.lista('pendientes_inspeccion', { search });
        setLoading(false);
        if (r.success) setItems(r.data.materiales || []);
        else toast.error(r.error);
    }, [search]);
    useEffect(() => { cargar(); setSel(new Set()); }, [cargar]);

    // lote → entregas → equipos
    const grupos = useMemo(() => {
        const mapa = new Map();
        items.forEach((m) => {
            const g = mapa.get(m.lote.id) || { lote: m.lote, entregas: new Map(), total: 0 };
            const n = m.numero_entrega_parcial || 0;
            g.entregas.set(n, [...(g.entregas.get(n) || []), m]);
            g.total += 1;
            mapa.set(m.lote.id, g);
        });
        return [...mapa.values()];
    }, [items]);

    const ejecutar = async (clave, fn) => {
        setEnviando(clave);
        const r = await fn();
        setEnviando(null);
        setConfirmar(null);
        if (!r.success) { toast.error(r.error); return; }
        toast.success(r.data.message);
        setSel(new Set());
        onCambio();
    };

    const alternar = (ids) => setSel((s) => {
        const n = new Set(s);
        const todos = ids.every((id) => n.has(id));
        ids.forEach((id) => (todos ? n.delete(id) : n.add(id)));
        return n;
    });

    return (
        <div className="space-y-4">
            <Card className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                <SearchInput className="lg:flex-1" value={search} onChange={setSearch} delay={400} placeholder="GPON, MAC, D-SN, modelo o lote" />
                {puedeEditar && (
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            icon={IoSendOutline}
                            disabled={!sel.size || !!enviando}
                            loading={enviando === 'sel'}
                            onClick={() => ejecutar('sel', () => laboratorioService.enviar([...sel]))}
                        >
                            Enviar seleccionados{sel.size ? ` (${sel.size})` : ''}
                        </Button>
                        <Button
                            icon={IoSendOutline}
                            disabled={!items.length || !!enviando || !!search}
                            title={search ? 'Quita la búsqueda para enviar todo' : undefined}
                            onClick={() => setConfirmar({
                                titulo: 'Enviar todos a laboratorio',
                                mensaje: `Se enviarán ${items.length} equipo(s) nuevos a laboratorio.`,
                                clave: 'todos',
                                fn: () => laboratorioService.enviarPendientes(),
                            })}
                        >
                            Enviar todos
                        </Button>
                    </div>
                )}
            </Card>

            {loading && !items.length && <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div>}
            {!loading && !items.length && (
                <Card><EmptyState icon={IoCubeOutline} title={search ? 'Ningún equipo coincide con la búsqueda' : 'No hay equipos nuevos esperando laboratorio'} /></Card>
            )}

            {grupos.map((g) => (
                <Card key={g.lote.id} className="overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
                        <div>
                            <p className="font-semibold text-gray-800">Lote {g.lote.numero_lote}</p>
                            <p className="text-xs text-gray-500">{g.lote.proveedor} · {g.total} equipo(s)</p>
                        </div>
                        {puedeEditar && !search && (
                            <Button
                                variant="secondary"
                                icon={IoSendOutline}
                                disabled={!!enviando}
                                loading={enviando === `l${g.lote.id}`}
                                onClick={() => ejecutar(`l${g.lote.id}`, () => laboratorioService.enviarLote(g.lote.id))}
                            >
                                Enviar lote ({g.total})
                            </Button>
                        )}
                    </div>
                    {[...g.entregas.entries()].map(([n, equipos]) => {
                        const ids = equipos.map((m) => m.id);
                        const todos = ids.every((id) => sel.has(id));
                        return (
                            <div key={n} className="border-b border-gray-100 last:border-0">
                                <div className="flex items-center justify-between gap-3 px-4 py-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        {puedeEditar && <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={todos} onChange={() => alternar(ids)} />}
                                        {nombreEntrega(n)} · {equipos.length} equipo(s) · ingreso {fecha(equipos[0].fecha_ingreso)}
                                    </label>
                                    {puedeEditar && g.entregas.size > 1 && !search && (
                                        <Button
                                            variant="ghost"
                                            disabled={!!enviando}
                                            loading={enviando === `e${g.lote.id}-${n}`}
                                            onClick={() => ejecutar(`e${g.lote.id}-${n}`, () => laboratorioService.enviarEntrega(g.lote.id, n))}
                                        >
                                            Enviar esta entrega
                                        </Button>
                                    )}
                                </div>
                                <ul className="grid grid-cols-1 gap-x-6 px-4 pb-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {equipos.map((m) => (
                                        <li key={m.id}>
                                            <label className={cx('flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm', puedeEditar && 'cursor-pointer hover:bg-gray-50')}>
                                                {puedeEditar && <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={sel.has(m.id)} onChange={() => alternar([m.id])} />}
                                                <span className="font-mono text-gray-800">{m.gpon_serial || m.codigo_interno}</span>
                                                <span className="truncate text-xs text-gray-500">{m.modelo}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </Card>
            ))}

            <ConfirmModal
                open={!!confirmar}
                onClose={() => !enviando && setConfirmar(null)}
                onConfirm={() => ejecutar(confirmar.clave, confirmar.fn)}
                title={confirmar?.titulo}
                message={confirmar?.mensaje}
                confirmText="Enviar"
                loading={!!enviando}
            />
        </div>
    );
};

export default PorEnviarTab;
