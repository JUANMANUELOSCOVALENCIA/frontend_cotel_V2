// src/core/operaciones/pages/cuadrillas/index.jsx
// Cuadrillas (vehículo + 2 o 3 técnicos) y vehículos con su equipamiento fijo.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoAddOutline, IoCarOutline, IoPeopleOutline, IoRefreshOutline } from 'react-icons/io5';
import { PageHeader, Card, Button, Badge, EmptyState, Spinner, SearchInput, cx } from '../../../../shared/components/ui';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { cuadrillasService, vehiculosService } from '../../services/operacionesService';
import { ZonaChip } from '../../components/opUi';
import CuadrillaModal from './CuadrillaModal';
import VehiculoModal from './VehiculoModal';
import KitsMaterial from './KitsMaterial';

const PESTANAS = [{ id: 'cuadrillas', label: 'Cuadrillas' }, { id: 'vehiculos', label: 'Vehículos' }, { id: 'kits', label: 'Kits de material' }];

const Th = ({ children, className }) => <th className={cx('px-4 py-3 font-semibold', className)}>{children}</th>;

const Cuadrillas = ({ puedeCrear, puedeEditar }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [soloActivas, setSoloActivas] = useState(true);
    const [abierta, setAbierta] = useState(undefined); // undefined = cerrado, null = nueva

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await cuadrillasService.listar(soloActivas ? { activas: 'true' } : {});
        setLoading(false);
        if (r.success) setItems(r.data); else toast.error(r.error);
    }, [soloActivas]);
    useEffect(() => { cargar(); }, [cargar]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={soloActivas} onChange={(e) => setSoloActivas(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                    Solo activas
                </label>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={IoRefreshOutline} onClick={cargar} disabled={loading}>Actualizar</Button>
                    {puedeCrear && <Button icon={IoAddOutline} onClick={() => setAbierta(null)}>Nueva cuadrilla</Button>}
                </div>
            </div>
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr><Th>Cuadrilla</Th><Th>Técnicos</Th><Th>Vehículo</Th><Th>Zonas</Th><Th className="text-center">OT abiertas</Th><Th>Estado</Th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !items.length && <tr><td colSpan={6} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>}
                            {!loading && !items.length && <tr><td colSpan={6}><EmptyState icon={IoPeopleOutline} title="No hay cuadrillas">{puedeCrear && 'Crea la primera con el botón "Nueva cuadrilla".'}</EmptyState></td></tr>}
                            {items.map((c) => {
                                const incompleta = c.integrantes.length < 2 || !c.integrantes.some((i) => i.es_jefe);
                                return (
                                    <tr key={c.id} className="cursor-pointer align-top hover:bg-gray-50" onClick={() => setAbierta(c)}>
                                        <td className="px-4 py-3">
                                            <p className="font-mono font-semibold text-gray-800">{c.nombre}</p>
                                            <p className="text-xs text-gray-500">{c.almacen_nombre}{c.capacidad_diaria ? ` · ${c.capacidad_diaria} OT/día` : ''}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {c.integrantes.map((i) => (
                                                <p key={i.id} className="text-gray-700">{i.usuario.nombre}{i.es_jefe && <span className="ml-1 text-xs font-medium text-orange-600">(jefe)</span>}</p>
                                            ))}
                                            {c.activo && incompleta && <Badge color="amber" className="mt-1">Incompleta</Badge>}
                                        </td>
                                        <td className="px-4 py-3">{c.vehiculo_info ? (<><p className="font-mono text-gray-800">{c.vehiculo_info.placa}</p><p className="text-xs text-gray-500">{c.vehiculo_info.descripcion}</p></>) : <span className="text-gray-400">—</span>}</td>
                                        <td className="px-4 py-3 text-xs">{c.zonas_info.length ? c.zonas_info.map((z) => <p key={z.id}><ZonaChip zona={z} /></p>) : <span className="text-gray-400">Todas</span>}</td>
                                        <td className="px-4 py-3 text-center font-medium text-gray-700">{c.ordenes_abiertas}</td>
                                        <td className="px-4 py-3">{c.activo ? <Badge color="green">Activa</Badge> : <Badge>Inactiva</Badge>}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
            <CuadrillaModal
                open={abierta !== undefined}
                cuadrilla={abierta}
                puedeCrear={puedeCrear}
                puedeEditar={puedeEditar}
                onClose={() => setAbierta(undefined)}
                onCambio={cargar}
            />
        </div>
    );
};

const Vehiculos = ({ puedeCrear, puedeEditar }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buscar, setBuscar] = useState('');
    const [abierto, setAbierto] = useState(undefined);

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await vehiculosService.listar();
        setLoading(false);
        if (r.success) setItems(r.data); else toast.error(r.error);
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    const visibles = useMemo(() => {
        const q = buscar.trim().toLowerCase();
        return q ? items.filter((x) => `${x.placa} ${x.descripcion}`.toLowerCase().includes(q)) : items;
    }, [items, buscar]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <SearchInput className="sm:w-80" value={buscar} onChange={setBuscar} placeholder="Placa o descripción" />
                <div className="flex gap-2">
                    <Button variant="secondary" icon={IoRefreshOutline} onClick={cargar} disabled={loading}>Actualizar</Button>
                    {puedeCrear && <Button icon={IoAddOutline} onClick={() => setAbierto(null)}>Nuevo vehículo</Button>}
                </div>
            </div>
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr><Th>Vehículo</Th><Th>Equipamiento</Th><Th>Cuadrilla</Th><Th>Estado</Th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !items.length && <tr><td colSpan={4} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>}
                            {!loading && !visibles.length && <tr><td colSpan={4}><EmptyState icon={IoCarOutline} title="No hay vehículos" /></td></tr>}
                            {visibles.map((x) => (
                                <tr key={x.id} className="cursor-pointer align-top hover:bg-gray-50" onClick={() => setAbierto(x)}>
                                    <td className="px-4 py-3"><p className="font-mono font-semibold text-gray-800">{x.placa}</p><p className="text-xs text-gray-500">{x.descripcion}</p></td>
                                    <td className="px-4 py-3 text-gray-700">
                                        {x.equipamiento.length
                                            ? x.equipamiento.map((e) => `${e.nombre}${e.cantidad > 1 ? ` ×${e.cantidad}` : ''}`).join(', ')
                                            : <span className="text-gray-400">Sin registrar</span>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{x.cuadrilla?.nombre || <span className="text-gray-400">Libre</span>}</td>
                                    <td className="px-4 py-3">{x.activo ? <Badge color="green">Activo</Badge> : <Badge>Inactivo</Badge>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <VehiculoModal
                open={abierto !== undefined}
                vehiculo={abierto}
                puedeEditar={abierto ? puedeEditar : puedeCrear}
                onClose={() => setAbierto(undefined)}
                onGuardado={() => { setAbierto(undefined); cargar(); }}
            />
        </div>
    );
};

const CuadrillasPage = () => {
    const { hasPermission } = usePermissions();
    const [tab, setTab] = useState('cuadrillas');
    const permisos = { puedeCrear: hasPermission('cuadrillas', 'crear'), puedeEditar: hasPermission('cuadrillas', 'actualizar') };
    return (
        <div className="space-y-6">
            <PageHeader title="Cuadrillas" subtitle="Equipos de campo: un vehículo y de 2 a 3 técnicos con rol Técnico, uno de ellos jefe." />
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                    {PESTANAS.map((t) => (
                        <button key={t.id} type="button" onClick={() => setTab(t.id)}
                            className={cx('border-b-2 px-1 pb-3 text-sm font-medium', tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                            {t.label}
                        </button>
                    ))}
                </nav>
            </div>
            {tab === 'cuadrillas' && <Cuadrillas {...permisos} />}
            {tab === 'vehiculos' && <Vehiculos {...permisos} />}
            {tab === 'kits' && <KitsMaterial puedeEditar={permisos.puedeEditar} />}
        </div>
    );
};

export default CuadrillasPage;
