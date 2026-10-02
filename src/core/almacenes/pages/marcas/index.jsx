// src/core/almacenes/pages/marcas/index.jsx
import React from 'react';
import { IoPricetagOutline } from 'react-icons/io5';
import CatalogoPage from '../catalogos/CatalogoPage';
import { marcasApi } from '../../services/catalogosService';

const CAMPOS = [
    { name: 'nombre', label: 'Nombre', required: true, maxLength: 100, placeholder: 'Ej: Huawei' },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
];

const COLUMNAS = [
    {
        label: 'Marca',
        render: (m) => (
            <>
                <p className="font-medium text-gray-800">{m.nombre}</p>
                {m.descripcion && <p className="max-w-md truncate text-xs text-gray-500" title={m.descripcion}>{m.descripcion}</p>}
            </>
        ),
    },
    { label: 'Modelos activos', className: 'text-center', render: (m) => <span className="font-medium text-gray-700">{m.modelos_count ?? 0}</span> },
    { label: 'Equipos / materiales', className: 'text-center', render: (m) => <span className="font-medium text-gray-700">{m.materiales_count ?? 0}</span> },
];

const Marcas = () => (
    <CatalogoPage
        titulo="Marcas"
        subtitulo="Fabricantes de los equipos y materiales"
        recurso="marcas"
        api={marcasApi}
        singular="marca"
        genero="a"
        icono={IoPricetagOutline}
        columnas={COLUMNAS}
        campos={CAMPOS}
        valoresIniciales={(m) => ({ nombre: m?.nombre ?? '', descripcion: m?.descripcion ?? '' })}
        preparar={(v) => ({ nombre: v.nombre.trim(), descripcion: v.descripcion.trim() })}
        textoBusqueda={(m) => `${m.nombre} ${m.descripcion}`}
    />
);

export default Marcas;
