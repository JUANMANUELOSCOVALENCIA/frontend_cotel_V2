// src/core/almacenes/pages/almacenes/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { IoCubeOutline, IoStar } from 'react-icons/io5';
import CatalogoPage from '../catalogos/CatalogoPage';
import CampoForm from '../catalogos/CampoForm';
import { Badge, Toggle } from '../../../../shared/components/ui';
import { almacenesApi, opcionesApi } from '../../services/catalogosService';

const vacio = {
    codigo: '', nombre: '', ciudad: '', tipo: '', direccion: '',
    codigo_cotel_encargado: '', es_principal: false, observaciones: '',
};

const COLUMNAS = [
    {
        label: 'Almacén',
        render: (a) => (
            <>
                <p className="flex items-center gap-1.5 font-medium text-gray-800">
                    {a.nombre}
                    {a.es_principal && <Badge color="orange"><IoStar className="h-3 w-3" /> Principal</Badge>}
                </p>
                <p className="text-xs text-gray-500">{a.codigo}</p>
            </>
        ),
    },
    {
        label: 'Tipo y ubicación',
        render: (a) => (
            <>
                <p className="text-gray-800">{a.tipo_info?.nombre || '—'}</p>
                <p className="max-w-xs truncate text-xs text-gray-500" title={a.direccion}>{[a.ciudad, a.direccion].filter(Boolean).join(' · ')}</p>
            </>
        ),
    },
    {
        label: 'Encargado',
        render: (a) => (a.encargado_info ? (
            <>
                <p className="text-gray-800">{a.encargado_info.nombre_completo}</p>
                <p className="text-xs text-gray-500">Cód. COTEL {a.encargado_info.codigo_cotel}</p>
            </>
        ) : <span className="text-xs text-gray-400">Sin asignar</span>),
    },
    {
        label: 'Inventario',
        render: (a) => (
            <>
                <p className="text-gray-800">{a.total_materiales ?? 0} en total</p>
                <p className="text-xs text-green-700">{a.materiales_disponibles ?? 0} disponibles</p>
            </>
        ),
    },
];

const Almacenes = () => {
    const [tipos, setTipos] = useState([]);
    useEffect(() => { opcionesApi.tiposAlmacen().then((r) => r.success && setTipos(r.data)); }, []);

    const filtros = useMemo(() => [
        { key: 'tipo', label: 'Todos los tipos', opciones: tipos.map((t) => ({ value: String(t.id), label: t.nombre })), aplicar: (a, v) => String(a.tipo) === v },
    ], [tipos]);

    const renderFormulario = ({ valores, set, errores, disabled }) => {
        const campo = (c) => <CampoForm key={c.name} campo={c} valor={valores[c.name]} error={errores[c.name]} onChange={(v) => set(c.name, v)} disabled={disabled} />;
        return (
            <>
                {campo({ name: 'codigo', label: 'Código', required: true, maxLength: 10, mayusculas: true, ancho: 'medio', placeholder: 'Ej: ALM-004' })}
                {campo({ name: 'nombre', label: 'Nombre', required: true, maxLength: 100, ancho: 'medio' })}
                {campo({ name: 'tipo', label: 'Tipo', required: true, type: 'select', ancho: 'medio', opciones: tipos.map((t) => ({ value: String(t.id), label: t.nombre })) })}
                {campo({ name: 'ciudad', label: 'Ciudad', required: true, maxLength: 50, ancho: 'medio' })}
                {campo({ name: 'direccion', label: 'Dirección', type: 'textarea', rows: 2 })}
                {campo({ name: 'codigo_cotel_encargado', label: 'Encargado (código COTEL)', ancho: 'medio', maxLength: 20, placeholder: 'Opcional', hint: 'Debe ser un usuario del sistema' })}
                <div className="flex items-end pb-6 sm:col-span-1">
                    <Toggle checked={valores.es_principal} onChange={(v) => set('es_principal', v)} disabled={disabled} label="Es el almacén principal" />
                </div>
                {errores.es_principal && <p className="-mt-3 text-xs text-red-600 sm:col-span-2">{errores.es_principal}</p>}
                {campo({ name: 'observaciones', label: 'Observaciones', type: 'textarea', rows: 2 })}
            </>
        );
    };

    return (
        <CatalogoPage
            titulo="Almacenes"
            subtitulo="Lugares donde se guardan los equipos y materiales"
            recurso="almacenes"
            api={almacenesApi}
            singular="almacén"
            icono={IoCubeOutline}
            anchoModal="lg"
            columnas={COLUMNAS}
            filtros={filtros}
            renderFormulario={renderFormulario}
            nombreDe={(a) => `${a.codigo} · ${a.nombre}`}
            valoresIniciales={(a) => (a ? {
                codigo: a.codigo ?? '', nombre: a.nombre ?? '', ciudad: a.ciudad ?? '', tipo: a.tipo ? String(a.tipo) : '',
                direccion: a.direccion ?? '', codigo_cotel_encargado: a.codigo_cotel_encargado ?? '',
                es_principal: !!a.es_principal, observaciones: a.observaciones ?? '',
            } : vacio)}
            validar={(v) => ({
                codigo_cotel_encargado: v.codigo_cotel_encargado && !/^\d+$/.test(v.codigo_cotel_encargado.trim()) ? 'Solo números' : undefined,
            })}
            preparar={(v) => ({
                codigo: v.codigo.trim().toUpperCase(),
                nombre: v.nombre.trim(),
                ciudad: v.ciudad.trim(),
                tipo: parseInt(v.tipo, 10),
                direccion: v.direccion.trim(),
                codigo_cotel_encargado: v.codigo_cotel_encargado.trim() || null,
                es_principal: !!v.es_principal,
                observaciones: v.observaciones.trim(),
            })}
            textoBusqueda={(a) => `${a.codigo} ${a.nombre} ${a.ciudad} ${a.tipo_info?.nombre} ${a.encargado_info?.nombre_completo ?? ''}`}
        />
    );
};

export default Almacenes;
