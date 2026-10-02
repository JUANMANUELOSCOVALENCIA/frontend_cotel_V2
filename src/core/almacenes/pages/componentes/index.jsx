// src/core/almacenes/pages/componentes/index.jsx
// Catálogo de piezas que vienen dentro de la caja de un modelo (fuente, antenas, cables…)
import React from 'react';
import { IoExtensionPuzzleOutline } from 'react-icons/io5';
import CatalogoPage from '../catalogos/CatalogoPage';
import { componentesApi } from '../../services/catalogosService';

const CAMPOS = [
    { name: 'nombre', label: 'Nombre', required: true, maxLength: 100, placeholder: 'Ej: Fuente de poder 12V' },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
];

const COLUMNAS = [
    {
        label: 'Componente',
        render: (c) => (
            <>
                <p className="font-medium text-gray-800">{c.nombre}</p>
                {c.descripcion && <p className="max-w-md truncate text-xs text-gray-500" title={c.descripcion}>{c.descripcion}</p>}
            </>
        ),
    },
    { label: 'Usado en modelos', className: 'text-center', render: (c) => <span className="font-medium text-gray-700">{c.modelos_usando ?? 0}</span> },
];

const Componentes = () => (
    <CatalogoPage
        titulo="Componentes"
        subtitulo="Piezas que vienen en la caja de cada modelo"
        recurso="componentes"
        api={componentesApi}
        singular="componente"
        icono={IoExtensionPuzzleOutline}
        columnas={COLUMNAS}
        campos={CAMPOS}
        valoresIniciales={(c) => ({ nombre: c?.nombre ?? '', descripcion: c?.descripcion ?? '' })}
        preparar={(v) => ({ nombre: v.nombre.trim(), descripcion: v.descripcion.trim() })}
        textoBusqueda={(c) => `${c.nombre} ${c.descripcion}`}
    />
);

export default Componentes;
