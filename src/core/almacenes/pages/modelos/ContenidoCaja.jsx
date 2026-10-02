// src/core/almacenes/pages/modelos/ContenidoCaja.jsx
// Editor del contenido de la caja de un modelo: [{ componente_id, cantidad }]
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
    IoAddOutline,
    IoRemoveOutline,
    IoTrashOutline,
    IoCubeOutline,
    IoAddCircleOutline,
} from 'react-icons/io5';
import almacenesService from '../../services/almacenesService';

const inputCls =
    'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:bg-gray-100';

const clamp = (n) => Math.min(999, Math.max(1, parseInt(n, 10) || 1));

const ContenidoCaja = ({ value = [], onChange, initialNames = {}, disabled = false }) => {
    const [catalogo, setCatalogo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [nuevoId, setNuevoId] = useState('');
    const [nuevaCantidad, setNuevaCantidad] = useState(1);
    const [creando, setCreando] = useState(false);
    const [nombreNuevo, setNombreNuevo] = useState('');
    const [guardandoNuevo, setGuardandoNuevo] = useState(false);

    const cargarCatalogo = useCallback(async () => {
        setLoading(true);
        const result = await almacenesService.getComponentes();
        if (result.success) {
            const data = result.data?.results || result.data || [];
            setCatalogo(Array.isArray(data) ? data : []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        cargarCatalogo();
    }, [cargarCatalogo]);

    // id -> nombre (catálogo + nombres que venían del modelo, por si el componente está inactivo)
    const nombres = useMemo(() => {
        const map = { ...initialNames };
        catalogo.forEach((c) => {
            map[c.id] = c.nombre;
        });
        return map;
    }, [catalogo, initialNames]);

    const elegidos = useMemo(() => new Set(value.map((v) => v.componente_id)), [value]);
    const disponibles = useMemo(() => catalogo.filter((c) => !elegidos.has(c.id)), [catalogo, elegidos]);
    const totalPiezas = value.reduce((acc, v) => acc + v.cantidad, 0);

    const agregar = (id, cantidad) => {
        if (!id || elegidos.has(id)) return;
        onChange([...value, { componente_id: id, cantidad: clamp(cantidad) }]);
    };

    const handleAgregar = () => {
        agregar(parseInt(nuevoId, 10), nuevaCantidad);
        setNuevoId('');
        setNuevaCantidad(1);
    };

    const cambiarCantidad = (id, cantidad) => {
        onChange(value.map((v) => (v.componente_id === id ? { ...v, cantidad: clamp(cantidad) } : v)));
    };

    const quitar = (id) => onChange(value.filter((v) => v.componente_id !== id));

    const crearYAgregar = async () => {
        const nombre = nombreNuevo.trim();
        if (nombre.length < 2) {
            toast.error('Escribe un nombre de al menos 2 caracteres');
            return;
        }
        setGuardandoNuevo(true);
        const result = await almacenesService.createComponente({ nombre });
        setGuardandoNuevo(false);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        toast.success(`Componente "${nombre}" creado`);
        setCatalogo((prev) => [...prev, result.data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        agregar(result.data.id, 1);
        setNombreNuevo('');
        setCreando(false);
    };

    // Evitar que Enter envíe el formulario del modelo
    const onEnter = (fn) => (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fn();
        }
    };

    return (
        <div className="rounded-lg border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <IoCubeOutline className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-semibold text-gray-800">Contenido de la caja</span>
                </div>
                {value.length > 0 && (
                    <span className="text-xs text-gray-500">
                        {value.length} {value.length === 1 ? 'componente' : 'componentes'} · {totalPiezas} piezas
                    </span>
                )}
            </div>

            <div className="space-y-3 p-4">
                {/* Lista actual */}
                {value.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        Sin componentes. Agrega lo que viene en la caja, por ejemplo: 1 Fuente 12V, 2 Antenas.
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                        {value.map((v) => (
                            <li key={v.componente_id} className="flex items-center gap-3 px-3 py-2">
                                <span className="flex-1 text-sm text-gray-800">
                                    {nombres[v.componente_id] || `Componente #${v.componente_id}`}
                                </span>
                                <div className="flex items-center rounded-lg border border-gray-300">
                                    <button
                                        type="button"
                                        onClick={() => cambiarCantidad(v.componente_id, v.cantidad - 1)}
                                        disabled={disabled || v.cantidad <= 1}
                                        className="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                                        aria-label="Restar"
                                    >
                                        <IoRemoveOutline className="h-4 w-4" />
                                    </button>
                                    <input
                                        type="number"
                                        min={1}
                                        max={999}
                                        value={v.cantidad}
                                        onChange={(e) => cambiarCantidad(v.componente_id, e.target.value)}
                                        onKeyDown={onEnter(() => {})}
                                        disabled={disabled}
                                        className="w-12 border-x border-gray-300 py-1 text-center text-sm focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => cambiarCantidad(v.componente_id, v.cantidad + 1)}
                                        disabled={disabled}
                                        className="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                                        aria-label="Sumar"
                                    >
                                        <IoAddOutline className="h-4 w-4" />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => quitar(v.componente_id)}
                                    disabled={disabled}
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                    aria-label="Quitar"
                                >
                                    <IoTrashOutline className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Agregar existente */}
                <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                        value={nuevoId}
                        onChange={(e) => setNuevoId(e.target.value)}
                        disabled={disabled || loading}
                        className={`${inputCls} flex-1`}
                    >
                        <option value="">
                            {loading ? 'Cargando componentes…' : disponibles.length ? 'Seleccionar componente' : 'No hay más componentes'}
                        </option>
                        {disponibles.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        min={1}
                        max={999}
                        value={nuevaCantidad}
                        onChange={(e) => setNuevaCantidad(e.target.value)}
                        onKeyDown={onEnter(handleAgregar)}
                        disabled={disabled}
                        className={`${inputCls} w-full sm:w-20`}
                        title="Cantidad"
                    />
                    <button
                        type="button"
                        onClick={handleAgregar}
                        disabled={disabled || !nuevoId}
                        className="flex items-center justify-center gap-1 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-40"
                    >
                        <IoAddOutline className="h-4 w-4" /> Agregar
                    </button>
                </div>

                {/* Crear uno nuevo sin salir */}
                {creando ? (
                    <div className="flex flex-col gap-2 rounded-lg bg-orange-50 p-3 sm:flex-row">
                        <input
                            autoFocus
                            value={nombreNuevo}
                            onChange={(e) => setNombreNuevo(e.target.value)}
                            onKeyDown={onEnter(crearYAgregar)}
                            placeholder="Nombre del nuevo componente (ej: Antena 5dBi)"
                            maxLength={100}
                            className={`${inputCls} flex-1`}
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={crearYAgregar}
                                disabled={guardandoNuevo}
                                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                            >
                                {guardandoNuevo ? 'Creando…' : 'Crear y agregar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setCreando(false); setNombreNuevo(''); }}
                                className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setCreando(true)}
                        disabled={disabled}
                        className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
                    >
                        <IoAddCircleOutline className="h-4 w-4" />
                        ¿No está en la lista? Crear componente nuevo
                    </button>
                )}
            </div>
        </div>
    );
};

export default ContenidoCaja;
