// src/core/operaciones/pages/planes/index.jsx
// Planes comerciales que se ofrecen en las solicitudes de instalación.
import React, { useMemo, useState } from 'react';
import { cx } from '../../../../shared/components/ui';
import { IoPricetagsOutline } from 'react-icons/io5';
import CatalogoPage from '../../../almacenes/pages/catalogos/CatalogoPage';
import { planesApi } from '../../services/operacionesService';
import Adicionales from './Adicionales';

const bs = (n) => (n === null || n === undefined || n === '' ? null : `Bs ${Number(n).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);

const COLUMNAS = [
    {
        label: 'Plan',
        render: (p) => (
            <>
                <p className="font-medium text-gray-800">{p.nombre}</p>
                <p className="font-mono text-xs text-gray-500">{p.codigo_plan}</p>
            </>
        ),
    },
    {
        label: 'Velocidad',
        render: (p) => (p.velocidad_descarga
            ? <span className="text-gray-700">{p.velocidad_descarga}{p.velocidad_subida ? ` / ${p.velocidad_subida}` : ''} Mbps</span>
            : <span className="text-gray-400">—</span>),
    },
    {
        label: 'Precio',
        render: (p) => (
            <div className="text-gray-700">
                {bs(p.precio_mensual) ? <p>{bs(p.precio_mensual)} / mes</p> : <p className="text-gray-400">—</p>}
                {bs(p.precio_instalacion) && <p className="text-xs text-gray-500">Instalación {bs(p.precio_instalacion)}</p>}
            </div>
        ),
    },
    { label: 'Solicitudes', className: 'text-center', render: (p) => <span className="font-medium text-gray-700">{p.solicitudes_count ?? 0}</span> },
];

const vacio = { nombre: '', codigo_plan: '', velocidad_descarga: '', velocidad_subida: '', precio_mensual: '', precio_instalacion: '', descripcion: '' };
const NUMEROS = ['velocidad_descarga', 'velocidad_subida', 'precio_mensual', 'precio_instalacion'];

const PlanesInternet = () => {
    const campos = useMemo(() => [
        { name: 'nombre', label: 'Nombre', required: true, maxLength: 100, ancho: 'medio', placeholder: 'Ej: Fibra Hogar 100' },
        { name: 'codigo_plan', label: 'Código', required: true, maxLength: 50, mayusculas: true, ancho: 'medio', placeholder: 'Ej: FH-100' },
        { name: 'velocidad_descarga', label: 'Velocidad de bajada (Mbps)', type: 'number', min: 1, required: true, ancho: 'medio' },
        { name: 'velocidad_subida', label: 'Velocidad de subida (Mbps)', type: 'number', min: 0, ancho: 'medio' },
        { name: 'precio_mensual', label: 'Precio mensual (Bs)', type: 'number', min: 0, step: '0.01', ancho: 'medio' },
        { name: 'precio_instalacion', label: 'Costo de instalación (Bs)', type: 'number', min: 0, step: '0.01', ancho: 'medio' },
        { name: 'descripcion', label: 'Descripción', type: 'textarea', rows: 2 },
    ], []);

    return (
        <CatalogoPage
            titulo="Planes de internet"
            subtitulo="Velocidad y precio de los planes de internet"
            recurso="planes"
            api={planesApi}
            singular="plan"
            icono={IoPricetagsOutline}
            columnas={COLUMNAS}
            campos={campos}
            valoresIniciales={(p) => (p
                ? Object.fromEntries(Object.keys(vacio).map((k) => [k, p[k] === null || p[k] === undefined ? '' : String(p[k])]))
                : vacio)}
            preparar={(v) => Object.fromEntries(Object.entries(v).map(([k, x]) => {
                const t = typeof x === 'string' ? x.trim() : x;
                if (NUMEROS.includes(k)) return [k, t === '' ? null : Number(t)];
                return [k, t];
            }))}
            textoBusqueda={(p) => [p.nombre, p.codigo_plan, p.descripcion].join(' ')}
        />
    );
};

const PESTANAS = [{ id: 'internet', label: 'Internet' }, { id: 'adicionales', label: 'TV cable y telefonía' }];

const Planes = () => {
    const [tab, setTab] = useState('internet');
    return (
        <div className="space-y-4">
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
            {tab === 'internet' ? <PlanesInternet /> : <Adicionales />}
        </div>
    );
};

export default Planes;
