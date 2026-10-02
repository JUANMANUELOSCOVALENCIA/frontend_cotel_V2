// src/core/almacenes/pages/materiales/index.jsx
// Materiales a granel (cable drop, conectores, etc.): stock por modelo y almacén,
// con el detalle de cada ingreso.
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoRefreshOutline, IoLayersOutline, IoChevronDown, IoChevronForward } from 'react-icons/io5';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { useOpcionesCompletas } from '../../hooks/useAlmacenes';
import { PageHeader, Card, Button, SearchInput, SelectInput, EmptyState, Spinner, Badge, StatCard, cx } from '../../../../shared/components/ui';
import inventarioService from '../../services/inventarioService';
import MaterialDetalleModal from '../equipos/MaterialDetalleModal';
import { EstadoMaterialBadge, cantidad } from '../equipos/inventarioUi';
import { fecha } from '../lotes/loteUi';

const Materiales = () => {
    const { hasPermission } = usePermissions();
    const { opciones } = useOpcionesCompletas();
    const [filas, setFilas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [f, setF] = useState({ search: '', almacen: '' });
    const [abierta, setAbierta] = useState(null); // 'modelo-almacen'
    const [registros, setRegistros] = useState({});
    const [detalle, setDetalle] = useState(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await inventarioService.stockGranel(f);
        setLoading(false);
        if (r.success) setFilas(r.data.results || []);
        else toast.error(r.error);
    }, [f]);
    useEffect(() => { cargar(); setAbierta(null); setRegistros({}); }, [cargar]);

    const abrir = async (fila) => {
        const clave = `${fila.modelo.id}-${fila.almacen.id}`;
        if (abierta === clave) { setAbierta(null); return; }
        setAbierta(clave);
        if (!registros[clave]) {
            const r = await inventarioService.listar({ tipo_material__es_unico: 'false', modelo: fila.modelo.id, almacen_actual: fila.almacen.id, page_size: 100 });
            if (r.success) setRegistros((x) => ({ ...x, [clave]: r.data.results || [] }));
            else toast.error(r.error);
        }
    };

    const resumen = useMemo(() => ({
        modelos: new Set(filas.map((x) => x.modelo.id)).size,
        conStock: filas.filter((x) => x.disponible > 0).length,
        sinStock: filas.filter((x) => x.disponible <= 0).length,
    }), [filas]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Materiales"
                subtitle="Stock de material a granel (cable, conectores…) por almacén"
                actions={<Button variant="secondary" icon={IoRefreshOutline} onClick={cargar} disabled={loading}>Actualizar</Button>}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Materiales distintos" value={resumen.modelos} />
                <StatCard label="Con stock disponible" value={resumen.conStock} tone="text-green-600" />
                <StatCard label="Sin stock disponible" value={resumen.sinStock} tone={resumen.sinStock ? 'text-red-600' : 'text-gray-800'} />
            </div>

            <Card className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <SearchInput className="lg:flex-1" value={f.search} onChange={(v) => setF((x) => ({ ...x, search: v }))} delay={400} placeholder="Material o marca" />
                    <SelectInput className="lg:w-56" value={f.almacen} onChange={(e) => setF((x) => ({ ...x, almacen: e.target.value }))}>
                        <option value="">Todos los almacenes</option>
                        {(opciones.almacenes || []).map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </SelectInput>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="w-10 px-2 py-3" />
                                <th className="px-4 py-3 font-semibold">Material</th>
                                <th className="px-4 py-3 font-semibold">Almacén</th>
                                <th className="px-4 py-3 text-right font-semibold">Disponible</th>
                                <th className="px-4 py-3 font-semibold">Otros estados</th>
                                <th className="px-4 py-3 text-right font-semibold">Ingresos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !filas.length && (
                                <tr><td colSpan={6} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>
                            )}
                            {!loading && !filas.length && (
                                <tr><td colSpan={6}><EmptyState icon={IoLayersOutline} title="No hay material a granel con estos filtros" /></td></tr>
                            )}
                            {filas.map((x) => {
                                const clave = `${x.modelo.id}-${x.almacen.id}`;
                                const abiertaEsta = abierta === clave;
                                const otros = Object.entries(x.por_estado).filter(([e]) => e !== 'Disponible');
                                return (
                                    <Fragment key={clave}>
                                        <tr className={cx('cursor-pointer hover:bg-gray-50', abiertaEsta && 'bg-orange-50/40')} onClick={() => abrir(x)}>
                                            <td className="px-2 py-3 text-gray-400">{abiertaEsta ? <IoChevronDown className="h-4 w-4" /> : <IoChevronForward className="h-4 w-4" />}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800">{x.modelo.marca} {x.modelo.nombre}</p>
                                                <p className="text-xs text-gray-500">{x.modelo.tipo} · código {x.modelo.codigo_modelo}</p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">{x.almacen.nombre}</td>
                                            <td className={cx('px-4 py-3 text-right text-base font-semibold', x.disponible > 0 ? 'text-gray-800' : 'text-red-600')}>{cantidad(x.disponible, x.unidad)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {otros.length ? otros.map(([e, n]) => <Badge key={e} color={e === 'Defectuoso' ? 'red' : 'gray'}>{e}: {cantidad(n, x.unidad)}</Badge>) : <span className="text-xs text-gray-400">—</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">{x.registros}</td>
                                        </tr>
                                        {abiertaEsta && (
                                            <tr>
                                                <td colSpan={6} className="bg-gray-50 px-6 py-3">
                                                    {!registros[clave] ? <div className="flex justify-center py-3 text-orange-500"><Spinner /></div> : (
                                                        <table className="w-full text-xs">
                                                            <thead className="text-gray-500"><tr><th className="py-1 text-left">Ingreso</th><th className="py-1 text-left">Lote</th><th className="py-1 text-right">Cantidad</th><th className="py-1 text-left pl-4">Estado</th><th className="py-1 text-left">Código</th></tr></thead>
                                                            <tbody className="divide-y divide-gray-200">
                                                                {registros[clave].map((m) => (
                                                                    <tr key={m.id} className="cursor-pointer hover:bg-white" onClick={() => setDetalle(m.id)}>
                                                                        <td className="py-1.5">{fecha(m.created_at)}</td>
                                                                        <td className="py-1.5">{m.lote_info?.numero_lote} · {m.lote_info?.proveedor_info?.nombre_comercial}</td>
                                                                        <td className="py-1.5 text-right font-medium">{cantidad(m.cantidad, x.unidad)}</td>
                                                                        <td className="py-1.5 pl-4"><EstadoMaterialBadge estado={m.estado_display} /></td>
                                                                        <td className="py-1.5 font-mono text-gray-500">{m.codigo_interno}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            <MaterialDetalleModal
                open={!!detalle}
                materialId={detalle}
                estados={opciones.estados_material_general || []}
                puedeEditar={hasPermission('materiales', 'actualizar')}
                onClose={() => setDetalle(null)}
                onCambio={() => { setRegistros({}); cargar(); }}
            />
        </div>
    );
};

export default Materiales;
