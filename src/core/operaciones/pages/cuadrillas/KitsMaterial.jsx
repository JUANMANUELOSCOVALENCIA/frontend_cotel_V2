// src/core/operaciones/pages/cuadrillas/KitsMaterial.jsx
// Material estándar por tipo de trabajo. Con esto el despacho sugiere cuánto material
// lleva cada cuadrilla según sus OT del día (y se compara con lo que realmente se usó).
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoAddOutline, IoTrashOutline, IoLayersOutline } from 'react-icons/io5';
import { Card, Button, SelectInput, TextInput, IconButton, EmptyState, Spinner, Badge } from '../../../../shared/components/ui';
import { kitsService } from '../../services/operacionesService';
import { TIPOS } from '../../components/opUi';

const CONDICIONES = [
    { codigo: 'SIEMPRE', nombre: 'Siempre' },
    { codigo: 'TV', nombre: 'Si incluye TV cable' },
    { codigo: 'TELEFONIA', nombre: 'Si incluye telefonía' },
];
const vacio = { tipo: 'INSTALACION', condicion: 'SIEMPRE', modelo: '', cantidad: '' };

const KitsMaterial = ({ puedeEditar }) => {
    const [items, setItems] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevo, setNuevo] = useState(vacio);
    const [guardando, setGuardando] = useState(false);

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await kitsService.listar();
        setLoading(false);
        if (r.success) setItems(r.data); else toast.error(r.error);
    }, []);
    useEffect(() => {
        cargar();
        kitsService.materiales().then((r) => r.success && setMateriales(r.data));
    }, [cargar]);

    const agregar = async () => {
        if (!nuevo.modelo || !(Number(nuevo.cantidad) > 0)) { toast.error('Elige el material y una cantidad mayor a 0.'); return; }
        setGuardando(true);
        const r = await kitsService.crear({ ...nuevo, modelo: Number(nuevo.modelo), cantidad: Number(nuevo.cantidad) });
        setGuardando(false);
        if (!r.success) { toast.error(r.error); return; }
        setNuevo((x) => ({ ...x, modelo: '', cantidad: '' }));
        cargar();
    };
    const cambiarCantidad = async (k, valor) => {
        if (Number(valor) === Number(k.cantidad)) return;
        if (!(Number(valor) > 0)) { toast.error('La cantidad debe ser mayor a 0.'); cargar(); return; }
        const r = await kitsService.actualizar(k.id, { cantidad: Number(valor) });
        if (!r.success) toast.error(r.error);
        cargar();
    };
    const quitar = async (k) => {
        const r = await kitsService.eliminar(k.id);
        if (!r.success) { toast.error(r.error); return; }
        cargar();
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500">
                Material que lleva cada tipo de trabajo. Al despachar se suma el kit de cada OT del día y el almacén ajusta las cantidades.
                Las ONU no van aquí: se escanean una por una según los servicios de cada instalación.
            </p>
            {puedeEditar && (
                <Card className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-12">
                    <SelectInput className="sm:col-span-2" value={nuevo.tipo} onChange={(e) => setNuevo((x) => ({ ...x, tipo: e.target.value }))}>
                        {TIPOS.map((t) => <option key={t.codigo} value={t.codigo}>{t.corto}</option>)}
                    </SelectInput>
                    <SelectInput className="sm:col-span-3" value={nuevo.condicion} onChange={(e) => setNuevo((x) => ({ ...x, condicion: e.target.value }))}>
                        {CONDICIONES.map((c) => <option key={c.codigo} value={c.codigo}>{c.nombre}</option>)}
                    </SelectInput>
                    <SelectInput className="sm:col-span-4" value={nuevo.modelo} onChange={(e) => setNuevo((x) => ({ ...x, modelo: e.target.value }))}>
                        <option value="">{materiales.length ? 'Material…' : 'No hay materiales por cantidad registrados'}</option>
                        {materiales.map((m) => <option key={m.id} value={m.id}>{m.nombre} ({m.unidad})</option>)}
                    </SelectInput>
                    <TextInput className="sm:col-span-1" type="number" min={0} step="0.01" value={nuevo.cantidad} placeholder="Cant." onChange={(e) => setNuevo((x) => ({ ...x, cantidad: e.target.value }))} />
                    <Button className="sm:col-span-2" icon={IoAddOutline} onClick={agregar} loading={guardando}>Agregar</Button>
                </Card>
            )}
            {loading && !items.length && <div className="flex justify-center py-12 text-orange-500"><Spinner className="h-6 w-6" /></div>}
            {!loading && !items.length && <Card><EmptyState icon={IoLayersOutline} title="Sin kits configurados">Ejecuta el comando cargar_materiales_gpon o agrégalos aquí.</EmptyState></Card>}
            {TIPOS.map((t) => {
                const filas = items.filter((k) => k.tipo === t.codigo);
                if (!filas.length) return null;
                return (
                    <Card key={t.codigo} className="overflow-hidden">
                        <p className="border-b border-gray-100 px-4 py-2.5 font-semibold text-gray-800">{t.nombre}</p>
                        <div className="divide-y divide-gray-100">
                            {filas.map((k) => (
                                <div key={k.id} className="grid grid-cols-12 items-center gap-2 px-4 py-2 text-sm">
                                    <span className="col-span-6 text-gray-800">{k.modelo_nombre}</span>
                                    <span className="col-span-3">{k.condicion === 'SIEMPRE' ? <span className="text-gray-500">Siempre</span> : <Badge color={k.condicion === 'TV' ? 'purple' : 'amber'}>{k.condicion_nombre}</Badge>}</span>
                                    <span className="col-span-2 flex items-center gap-1">
                                        {puedeEditar
                                            ? <TextInput key={`${k.id}-${k.cantidad}`} type="number" min={0} step="0.01" defaultValue={Number(k.cantidad)} className="h-8 w-24" onBlur={(e) => cambiarCantidad(k, e.target.value)} />
                                            : <span>{Number(k.cantidad)}</span>}
                                        <span className="text-xs text-gray-500">{k.unidad}</span>
                                    </span>
                                    <span className="col-span-1 text-right">{puedeEditar && <IconButton icon={IoTrashOutline} tone="danger" title="Quitar" onClick={() => quitar(k)} />}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default KitsMaterial;
