// src/core/operaciones/pages/planes/Adicionales.jsx
// TV cable y telefonía: precio base que incluye N televisores / líneas + precio por cada uno extra.
import React from 'react';
import { IoTvOutline } from 'react-icons/io5';
import CatalogoPage from '../../../almacenes/pages/catalogos/CatalogoPage';
import { Badge } from '../../../../shared/components/ui';
import { adicionalesApi } from '../../services/operacionesService';
import { bs } from '../../components/ServiciosSolicitud';

const UNIDAD = { TV: ['televisor', 'televisores'], TELEFONIA: ['línea', 'líneas'] };
const unidad = (tipo, n) => `${n} ${UNIDAD[tipo]?.[n === 1 ? 0 : 1] || ''}`;

const COLUMNAS = [
    {
        label: 'Adicional',
        render: (a) => (
            <>
                <p className="font-medium text-gray-800">{a.nombre}</p>
                <Badge color={a.tipo === 'TV' ? 'purple' : 'blue'}>{a.tipo_nombre}</Badge>
            </>
        ),
    },
    {
        label: 'Precio',
        render: (a) => (
            <div className="text-gray-700">
                <p>{bs(a.precio_mensual)} / mes</p>
                {Number(a.costo_instalacion) > 0 && <p className="text-xs text-gray-500">Instalación {bs(a.costo_instalacion)}</p>}
            </div>
        ),
    },
    { label: 'Incluye', render: (a) => <span className="text-gray-700">{unidad(a.tipo, a.unidades_incluidas)}</span> },
    {
        label: 'Adicionales',
        render: (a) => (a.maximo_unidades > a.unidades_incluidas
            ? <span className="text-gray-700">{bs(a.precio_unidad_extra)} c/u · hasta {unidad(a.tipo, a.maximo_unidades)}</span>
            : <span className="text-gray-400">No permite más</span>),
    },
    { label: 'Solicitudes', className: 'text-center', render: (a) => <span className="font-medium text-gray-700">{a.solicitudes_count ?? 0}</span> },
];

const CAMPOS = [
    { name: 'tipo', label: 'Tipo', type: 'select', required: true, ancho: 'medio', opciones: [{ value: 'TV', label: 'TV cable' }, { value: 'TELEFONIA', label: 'Telefonía' }] },
    { name: 'nombre', label: 'Nombre', required: true, maxLength: 100, ancho: 'medio', placeholder: 'Ej: TV Básica, Línea fija' },
    { name: 'precio_mensual', label: 'Precio mensual (Bs)', type: 'number', min: 0, step: '0.01', required: true, ancho: 'medio' },
    { name: 'costo_instalacion', label: 'Costo de instalación (Bs)', type: 'number', min: 0, step: '0.01', ancho: 'medio' },
    { name: 'unidades_incluidas', label: 'Incluye (televisores / líneas)', type: 'number', min: 1, required: true, ancho: 'medio', hint: 'Cuántos vienen con el precio mensual' },
    { name: 'maximo_unidades', label: 'Máximo permitido', type: 'number', min: 1, required: true, ancho: 'medio' },
    { name: 'precio_unidad_extra', label: 'Precio por cada adicional (Bs/mes)', type: 'number', min: 0, step: '0.01', ancho: 'medio', hint: 'Se cobra por cada uno que pase de lo incluido' },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', rows: 2, placeholder: 'Ej: 80 canales, incluye canales HD' },
];

const vacio = { tipo: 'TV', nombre: '', precio_mensual: '', costo_instalacion: '', unidades_incluidas: '1', maximo_unidades: '1', precio_unidad_extra: '', descripcion: '' };
const NUMEROS = ['precio_mensual', 'costo_instalacion', 'precio_unidad_extra', 'unidades_incluidas', 'maximo_unidades'];

const Adicionales = () => (
    <CatalogoPage
        titulo="TV cable y telefonía"
        subtitulo="Se suman al plan de internet en la solicitud. El precio incluye cierta cantidad de televisores o líneas; cada uno extra se cobra aparte."
        recurso="planes"
        api={adicionalesApi}
        singular="adicional"
        icono={IoTvOutline}
        columnas={COLUMNAS}
        campos={CAMPOS}
        filtros={[{ key: 'tipo', label: 'TV y telefonía', opciones: [{ value: 'TV', label: 'TV cable' }, { value: 'TELEFONIA', label: 'Telefonía' }], aplicar: (a, v) => a.tipo === v }]}
        validar={(v) => (Number(v.maximo_unidades) < Number(v.unidades_incluidas) ? { maximo_unidades: 'No puede ser menor a lo incluido' } : {})}
        valoresIniciales={(a) => (a
            ? Object.fromEntries(Object.keys(vacio).map((k) => [k, a[k] === null || a[k] === undefined ? '' : String(a[k])]))
            : vacio)}
        preparar={(v) => Object.fromEntries(Object.entries(v).map(([k, x]) => {
            const t = typeof x === 'string' ? x.trim() : x;
            if (NUMEROS.includes(k)) return [k, t === '' ? 0 : Number(t)];
            return [k, t];
        }))}
        textoBusqueda={(a) => [a.nombre, a.tipo_nombre, a.descripcion].join(' ')}
    />
);

export default Adicionales;
