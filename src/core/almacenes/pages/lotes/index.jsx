// src/core/almacenes/pages/lotes/index.jsx
// Lotes: lo que entrega un proveedor. Se registra el lote con sus modelos y cantidades,
// luego se cargan los equipos (Excel) o el material a granel, y al final se cierra.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
    IoAddOutline, IoRefreshOutline, IoArchiveOutline, IoEllipsisVertical, IoEyeOutline, IoCloudUploadOutline,
    IoCreateOutline, IoLockClosedOutline, IoLockOpenOutline, IoTrashOutline,
} from 'react-icons/io5';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { useOpcionesCompletas } from '../../hooks/useAlmacenes';
import {
    PageHeader, Card, Button, IconButton, SearchInput, SelectInput, Badge, Dropdown, EmptyState, Spinner,
    StatCard, ConfirmModal, cx,
} from '../../../../shared/components/ui';
import lotesService from '../../services/lotesService';
import LoteFormModal from './LoteFormModal';
import LoteDetalleModal from './LoteDetalleModal';
import ImportarEquiposModal from './ImportarEquiposModal';
import CerrarLoteDialog from './CerrarLoteDialog';
import { EstadoLoteBadge, Progreso, fecha, tipoLote } from './loteUi';

const sinAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const EN_RECEPCION = ['REGISTRADO', 'ACTIVO', 'RECEPCION_PARCIAL'];

const LotesPage = () => {
    const { hasPermission, isSuperuser } = usePermissions();
    const puede = useMemo(() => ({
        crear: hasPermission('lotes', 'crear'),
        editar: hasPermission('lotes', 'actualizar'),
        eliminar: hasPermission('lotes', 'eliminar'),
        importar: hasPermission('materiales', 'crear'),
        reabrir: isSuperuser,
    }), [hasPermission, isSuperuser]);

    const { opciones, refetchOpciones } = useOpcionesCompletas();
    const [lotes, setLotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [estado, setEstado] = useState('abiertos');
    const [proveedor, setProveedor] = useState('');

    const [form, setForm] = useState({ open: false, lote: null });
    const [detalle, setDetalle] = useState(null); // id
    const [version, setVersion] = useState(0); // fuerza recarga del detalle
    const [importar, setImportar] = useState(null);
    const [cerrar, setCerrar] = useState(null);
    const [confirmar, setConfirmar] = useState({ tipo: null, lote: null, loading: false });

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await lotesService.listar();
        if (r.success) setLotes(r.data);
        else toast.error(r.error);
        setLoading(false);
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    const refrescar = () => { cargar(); setVersion((v) => v + 1); };

    const stats = useMemo(() => ({
        total: lotes.length,
        recepcion: lotes.filter((l) => EN_RECEPCION.includes(l.estado_info?.codigo)).length,
        completos: lotes.filter((l) => l.estado_info?.codigo === 'RECEPCION_COMPLETA').length,
        cerrados: lotes.filter((l) => l.estado_info?.codigo === 'CERRADO').length,
    }), [lotes]);

    const visibles = useMemo(() => {
        const q = sinAcentos(busqueda.trim());
        return lotes.filter((l) => {
            const cod = l.estado_info?.codigo;
            if (estado === 'abiertos' && cod === 'CERRADO') return false;
            if (estado && estado !== 'abiertos' && cod !== estado) return false;
            if (proveedor && String(l.proveedor) !== proveedor) return false;
            if (!q) return true;
            const texto = [l.numero_lote, l.proveedor_info?.nombre_comercial, l.codigo_requerimiento_compra, l.codigo_nota_ingreso,
                ...(l.detalles || []).map((d) => `${d.modelo_info?.marca} ${d.modelo_info?.nombre}`)].join(' ');
            return sinAcentos(texto).includes(q);
        });
    }, [lotes, busqueda, estado, proveedor]);

    const pendienteUnico = (l) => (l.detalles || []).some((d) => d.modelo_info?.tipo_material?.es_unico && Number(d.cantidad_pendiente) > 0);

    // Acciones que pueden venir de la tabla o del detalle
    const accion = (tipo, lote) => {
        if (tipo === 'refrescar') { cargar(); return; }
        if (tipo === 'ver') setDetalle(lote.id);
        if (tipo === 'editar') setForm({ open: true, lote });
        if (tipo === 'importar') setImportar(lote);
        if (tipo === 'cerrar') setCerrar(lote);
        if (tipo === 'reabrir' || tipo === 'eliminar') setConfirmar({ tipo, lote, loading: false });
    };

    const confirmarAccion = async () => {
        const { tipo, lote } = confirmar;
        setConfirmar((c) => ({ ...c, loading: true }));
        const r = tipo === 'reabrir' ? await lotesService.reabrir(lote.id) : await lotesService.eliminar(lote.id);
        if (!r.success) {
            setConfirmar((c) => ({ ...c, loading: false }));
            toast.error(r.error, { duration: 7000 });
            return;
        }
        toast.success(tipo === 'reabrir' ? `Lote ${lote.numero_lote} reabierto` : `Lote ${lote.numero_lote} eliminado`);
        setConfirmar({ tipo: null, lote: null, loading: false });
        if (tipo === 'eliminar' && detalle === lote.id) setDetalle(null);
        refrescar();
    };

    const hayAcciones = true;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Lotes"
                subtitle="Ingresos de equipos y materiales de cada proveedor"
                actions={
                    <>
                        <Button variant="secondary" icon={IoRefreshOutline} onClick={cargar} disabled={loading}>Actualizar</Button>
                        {puede.crear && <Button icon={IoAddOutline} onClick={() => { refetchOpciones(); setForm({ open: true, lote: null }); }}>Nuevo lote</Button>}
                    </>
                }
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Lotes" value={stats.total} />
                <StatCard label="En recepción" value={stats.recepcion} tone="text-orange-600" />
                <StatCard label="Recepción completa" value={stats.completos} tone="text-green-600" />
                <StatCard label="Cerrados" value={stats.cerrados} tone="text-gray-500" />
            </div>

            <Card className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <SearchInput className="lg:flex-1" value={busqueda} onChange={setBusqueda} placeholder="Número de lote, proveedor, código Sprint o modelo" />
                    <SelectInput className="lg:w-56" value={proveedor} onChange={(e) => setProveedor(e.target.value)}>
                        <option value="">Todos los proveedores</option>
                        {(opciones.proveedores || []).map((p) => <option key={p.id} value={p.id}>{p.nombre_comercial}</option>)}
                    </SelectInput>
                    <SelectInput className="lg:w-56" value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <option value="abiertos">Sin cerrar</option>
                        <option value="">Todos los estados</option>
                        {(opciones.estados_lote || []).map((e) => <option key={e.id} value={e.codigo}>{e.nombre}</option>)}
                    </SelectInput>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="border-b border-gray-200 px-4 py-3">
                    <p className="font-semibold text-gray-800">Lotes <span className="font-normal text-gray-500">({visibles.length})</span></p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Lote</th>
                                <th className="px-4 py-3 font-semibold">Contenido</th>
                                <th className="px-4 py-3 font-semibold">Recepción</th>
                                <th className="px-4 py-3 font-semibold">Estado</th>
                                <th className="w-24 px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !lotes.length && (
                                <tr><td colSpan={5} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>
                            )}
                            {!loading && !visibles.length && (
                                <tr><td colSpan={5}><EmptyState icon={IoArchiveOutline} title={lotes.length ? 'Ningún lote coincide con los filtros' : 'Aún no hay lotes'} /></td></tr>
                            )}
                            {visibles.map((l) => {
                                const cerrado = l.estado_info?.codigo === 'CERRADO';
                                return (
                                    <tr key={l.id} className={cx('cursor-pointer align-top hover:bg-gray-50', cerrado && 'text-gray-500')} onClick={() => accion('ver', l)}>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-gray-800">{l.numero_lote}</p>
                                            <p className="text-xs text-gray-500">{l.proveedor_info?.nombre_comercial} · {fecha(l.fecha_recepcion)}</p>
                                            <p className="text-xs text-gray-400">{tipoLote(l.tipo_ingreso_info)} · {l.almacen_destino_info?.nombre}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex max-w-sm flex-wrap gap-1">
                                                {(l.detalles || []).map((d) => (
                                                    <Badge key={d.id} color={d.modelo_info?.tipo_material?.es_unico ? 'purple' : 'blue'}>
                                                        {d.cantidad} {d.modelo_info?.unidad_medida?.simbolo} · {d.modelo_info?.nombre}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><Progreso compacto recibido={l.cantidad_recibida} total={l.cantidad_total} /></td>
                                        <td className="px-4 py-3"><EstadoLoteBadge estado={l.estado_info} /></td>
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-1">
                                                <IconButton icon={IoEyeOutline} title="Ver detalle" onClick={() => accion('ver', l)} />
                                                {hayAcciones && (
                                                    <Dropdown
                                                        trigger={<IconButton icon={IoEllipsisVertical} title="Más acciones" />}
                                                        items={[
                                                            !cerrado && puede.importar && pendienteUnico(l) && { label: 'Cargar equipos (Excel)', icon: IoCloudUploadOutline, onClick: () => accion('importar', l) },
                                                            !cerrado && puede.editar && { label: 'Editar', icon: IoCreateOutline, onClick: () => accion('editar', l) },
                                                            !cerrado && puede.editar && { label: 'Cerrar lote', icon: IoLockClosedOutline, onClick: () => accion('cerrar', l) },
                                                            cerrado && puede.reabrir && { label: 'Reabrir', icon: IoLockOpenOutline, onClick: () => accion('reabrir', l) },
                                                            puede.eliminar && { divider: true },
                                                            puede.eliminar && { label: 'Eliminar', icon: IoTrashOutline, danger: true, onClick: () => accion('eliminar', l) },
                                                        ]}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            <LoteFormModal
                open={form.open}
                lote={form.lote}
                opciones={opciones}
                onClose={() => setForm({ open: false, lote: null })}
                onSaved={(l) => { setForm({ open: false, lote: null }); refrescar(); if (!form.lote) setDetalle(l.id); }}
            />
            <LoteDetalleModal open={!!detalle} loteId={detalle} version={version} puede={puede} onClose={() => setDetalle(null)} onAccion={accion} />
            <ImportarEquiposModal open={!!importar} lote={importar} onClose={() => setImportar(null)} onDone={refrescar} />
            <CerrarLoteDialog open={!!cerrar} lote={cerrar} onClose={() => setCerrar(null)} onDone={() => { setCerrar(null); refrescar(); }} />
            <ConfirmModal
                open={!!confirmar.tipo}
                danger={confirmar.tipo === 'eliminar'}
                loading={confirmar.loading}
                title={confirmar.tipo === 'reabrir' ? 'Reabrir lote' : 'Eliminar lote'}
                confirmText={confirmar.tipo === 'reabrir' ? 'Reabrir' : 'Eliminar'}
                message={confirmar.tipo === 'reabrir'
                    ? <>¿Reabrir el lote <strong>{confirmar.lote?.numero_lote}</strong>? Se podrán volver a cargar equipos y entregas.</>
                    : <>¿Eliminar el lote <strong>{confirmar.lote?.numero_lote}</strong>? Solo es posible si todavía no tiene equipos ni materiales.</>}
                onClose={() => !confirmar.loading && setConfirmar({ tipo: null, lote: null, loading: false })}
                onConfirm={confirmarAccion}
            />
        </div>
    );
};

export default LotesPage;
