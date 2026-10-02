// src/core/almacenes/pages/provedores/index.jsx
import React from 'react';
import { IoBusinessOutline, IoCallOutline, IoMailOutline } from 'react-icons/io5';
import CatalogoPage from '../catalogos/CatalogoPage';
import { proveedoresApi } from '../../services/catalogosService';

const CAMPOS = [
    { name: 'nombre_comercial', label: 'Nombre comercial', required: true, maxLength: 100, ancho: 'medio' },
    { name: 'codigo', label: 'Código interno', maxLength: 20, mayusculas: true, placeholder: 'Ej: PROV-004', ancho: 'medio' },
    { name: 'razon_social', label: 'Razón social', maxLength: 150 },
    { name: 'contacto_principal', label: 'Persona de contacto', maxLength: 100 },
    { name: 'telefono', label: 'Teléfono', type: 'tel', maxLength: 20, ancho: 'medio', pattern: { value: /^[0-9+\-\s()]+$/, message: 'Solo números, espacios, +, - y ()' } },
    { name: 'email', label: 'Correo', type: 'email', ancho: 'medio' },
];

const COLUMNAS = [
    {
        label: 'Proveedor',
        render: (p) => (
            <>
                <p className="font-medium text-gray-800">{p.nombre_comercial}</p>
                <p className="text-xs text-gray-500">{[p.codigo, p.razon_social].filter(Boolean).join(' · ') || '—'}</p>
            </>
        ),
    },
    {
        label: 'Contacto',
        render: (p) => (
            <div className="space-y-0.5 text-gray-600">
                {p.contacto_principal && <p className="text-gray-800">{p.contacto_principal}</p>}
                {p.telefono && <p className="flex items-center gap-1 text-xs"><IoCallOutline className="h-3.5 w-3.5" />{p.telefono}</p>}
                {p.email && <p className="flex items-center gap-1 text-xs"><IoMailOutline className="h-3.5 w-3.5" />{p.email}</p>}
                {!p.contacto_principal && !p.telefono && !p.email && <span className="text-gray-400">—</span>}
            </div>
        ),
    },
    { label: 'Lotes', className: 'text-center', render: (p) => <span className="font-medium text-gray-700">{p.lotes_count ?? 0}</span> },
];

const vacio = { nombre_comercial: '', codigo: '', razon_social: '', contacto_principal: '', telefono: '', email: '' };

const Proveedores = () => (
    <CatalogoPage
        titulo="Proveedores"
        subtitulo="Empresas que entregan materiales y equipos"
        recurso="proveedores"
        api={proveedoresApi}
        singular="proveedor"
        icono={IoBusinessOutline}
        columnas={COLUMNAS}
        campos={CAMPOS}
        nombreDe={(p) => p.nombre_comercial}
        valoresIniciales={(p) => (p ? Object.fromEntries(Object.keys(vacio).map((k) => [k, p[k] ?? ''])) : vacio)}
        preparar={(v) => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === 'string' ? x.trim() : x]))}
        textoBusqueda={(p) => [p.nombre_comercial, p.codigo, p.razon_social, p.contacto_principal, p.email].join(' ')}
    />
);

export default Proveedores;
