// src/core/almacenes/pages/modelos/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { IoHardwareChipOutline } from 'react-icons/io5';
import CatalogoPage from '../catalogos/CatalogoPage';
import CampoForm from '../catalogos/CampoForm';
import ContenidoCaja from './ContenidoCaja';
import { Badge, Field, Toggle } from '../../../../shared/components/ui';
import { modelosApi, marcasApi, opcionesApi } from '../../services/catalogosService';
import { PRUEBAS_LAB, TODAS_LAS_PRUEBAS, pruebasDeModelo } from '../laboratorio/pruebas';

const vacio = {
    nombre: '', codigo_modelo: '', marca: '', tipo_material: '', unidad_medida: '',
    descripcion: '', requiere_inspeccion_inicial: false, componentes: [], pruebas_laboratorio: TODAS_LAS_PRUEBAS,
};

const Modelos = () => {
    const [marcas, setMarcas] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [unidades, setUnidades] = useState([]);

    useEffect(() => {
        marcasApi.listar().then((r) => r.success && setMarcas(r.data));
        opcionesApi.tiposMaterial().then((r) => r.success && setTipos(r.data));
        opcionesApi.unidadesMedida().then((r) => r.success && setUnidades(r.data));
    }, []);

    const tipoPorId = useMemo(() => Object.fromEntries(tipos.map((t) => [String(t.id), t])), [tipos]);

    const columnas = useMemo(() => [
        {
            label: 'Modelo',
            render: (m) => (
                <>
                    <p className="font-medium text-gray-800">{m.nombre}</p>
                    <p className="text-xs text-gray-500">Código {m.codigo_modelo} · {m.marca_info?.nombre}</p>
                </>
            ),
        },
        {
            label: 'Tipo',
            render: (m) => (
                <div className="space-y-1">
                    <Badge color={m.tipo_material_info?.es_unico ? 'purple' : 'blue'}>{m.tipo_material_info?.nombre}</Badge>
                    <p className="text-xs text-gray-500">Unidad: {m.unidad_medida_info?.simbolo || m.unidad_medida_info?.nombre}</p>
                    {m.requiere_inspeccion_inicial && (
                        <div>
                            <Badge color="amber">Va a laboratorio</Badge>
                            {m.tipo_material_info?.es_unico && (
                                <p className="mt-1 text-xs text-gray-500">{pruebasDeModelo(m.pruebas_laboratorio).length} de {PRUEBAS_LAB.length} pruebas</p>
                            )}
                        </div>
                    )}
                </div>
            ),
        },
        {
            label: 'Contenido de la caja',
            render: (m) => (m.componentes?.length ? (
                <div className="flex max-w-xs flex-wrap gap-1">
                    {m.componentes.map((c) => <Badge key={c.id} color="orange">{c.cantidad}× {c.componente_info?.nombre}</Badge>)}
                </div>
            ) : <span className="text-xs text-gray-400">—</span>),
        },
        {
            label: 'Inventario',
            render: (m) => (
                <>
                    <p className="text-gray-800">{m.materiales_count ?? 0} en total</p>
                    <p className="text-xs text-green-700">{m.materiales_disponibles ?? 0} disponibles</p>
                </>
            ),
        },
    ], []);

    const filtros = useMemo(() => [
        { key: 'marca', label: 'Todas las marcas', opciones: marcas.map((m) => ({ value: String(m.id), label: m.nombre })), aplicar: (m, v) => String(m.marca) === v },
        { key: 'tipo', label: 'Todos los tipos', opciones: tipos.map((t) => ({ value: String(t.id), label: t.nombre })), aplicar: (m, v) => String(m.tipo_material) === v },
    ], [marcas, tipos]);

    const renderFormulario = ({ valores, set, errores, item, disabled }) => {
        const marcasOpc = marcas.filter((m) => m.activo || String(m.id) === String(valores.marca));
        const tipo = tipoPorId[valores.tipo_material];
        const elegirTipo = (v) => {
            set('tipo_material', v);
            const t = tipoPorId[v];
            if (t) {
                // Al crear, se propone lo que define el tipo (las ONU van a laboratorio)
                if (!item) set('requiere_inspeccion_inicial', Boolean(t.requiere_inspeccion_inicial));
                if (!valores.unidad_medida && t.unidad_medida_default) set('unidad_medida', String(t.unidad_medida_default));
            }
        };
        const campo = (c) => <CampoForm key={c.name} campo={c} valor={valores[c.name]} error={errores[c.name]} onChange={(v) => set(c.name, v)} disabled={disabled} />;
        return (
            <>
                {campo({ name: 'nombre', label: 'Nombre del modelo', required: true, maxLength: 100, ancho: 'medio', placeholder: 'Ej: HG8245H' })}
                {campo({ name: 'codigo_modelo', label: 'Código', required: true, type: 'number', min: 1, ancho: 'medio', hint: 'Número único del modelo' })}
                {campo({ name: 'marca', label: 'Marca', required: true, type: 'select', ancho: 'medio', opciones: marcasOpc.map((m) => ({ value: String(m.id), label: m.nombre })) })}
                <Field label="Tipo de material" required error={errores.tipo_material}>
                    <select
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 pr-8 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        value={valores.tipo_material}
                        disabled={disabled}
                        onChange={(e) => elegirTipo(e.target.value)}
                    >
                        <option value="">Seleccionar…</option>
                        {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}{t.es_unico ? ' (con serie)' : ''}</option>)}
                    </select>
                </Field>
                {campo({ name: 'unidad_medida', label: 'Unidad de medida', required: true, type: 'select', ancho: 'medio', opciones: unidades.map((u) => ({ value: String(u.id), label: `${u.nombre} (${u.simbolo})` })) })}
                <div className="sm:col-span-1 flex items-end pb-2">
                    <Toggle
                        checked={valores.requiere_inspeccion_inicial}
                        onChange={(v) => set('requiere_inspeccion_inicial', v)}
                        disabled={disabled}
                        label="Enviar a laboratorio al ingresar"
                    />
                </div>
                {campo({ name: 'descripcion', label: 'Descripción', type: 'textarea', rows: 2 })}
                {tipo?.es_unico && valores.requiere_inspeccion_inicial && (
                    <div className="sm:col-span-2">
                        <Field label="Pruebas de laboratorio" required error={errores.pruebas_laboratorio} hint="Marca solo lo que tiene este equipo (por ejemplo, sin CATV ni telefonía si no trae esos puertos).">
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {PRUEBAS_LAB.map((p) => {
                                    const marcada = valores.pruebas_laboratorio.includes(p.campo);
                                    return (
                                        <label key={p.campo} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${marcada ? 'border-orange-300 bg-orange-50 text-gray-800' : 'border-gray-200 text-gray-500'}`}>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 accent-orange-500"
                                                checked={marcada}
                                                disabled={disabled}
                                                onChange={() => set('pruebas_laboratorio', marcada
                                                    ? valores.pruebas_laboratorio.filter((c) => c !== p.campo)
                                                    : TODAS_LAS_PRUEBAS.filter((c) => c === p.campo || valores.pruebas_laboratorio.includes(c)))}
                                            />
                                            {p.nombre}
                                        </label>
                                    );
                                })}
                            </div>
                        </Field>
                    </div>
                )}
                {(!tipo || tipo.es_unico) && (
                    <div className="sm:col-span-2">
                        <ContenidoCaja
                            value={valores.componentes}
                            onChange={(v) => set('componentes', v)}
                            initialNames={Object.fromEntries((item?.componentes || []).map((c) => [c.componente, c.componente_info?.nombre]))}
                            disabled={disabled}
                        />
                    </div>
                )}
            </>
        );
    };

    return (
        <CatalogoPage
            titulo="Modelos"
            subtitulo="Modelos de equipos y materiales, y lo que trae cada caja"
            recurso="modelos"
            api={modelosApi}
            singular="modelo"
            icono={IoHardwareChipOutline}
            anchoModal="lg"
            columnas={columnas}
            filtros={filtros}
            renderFormulario={renderFormulario}
            nombreDe={(m) => `${m.marca_info?.nombre ?? ''} ${m.nombre}`.trim()}
            valoresIniciales={(m) => (m ? {
                nombre: m.nombre, codigo_modelo: String(m.codigo_modelo ?? ''), marca: String(m.marca), tipo_material: String(m.tipo_material),
                unidad_medida: String(m.unidad_medida), descripcion: m.descripcion ?? '', requiere_inspeccion_inicial: !!m.requiere_inspeccion_inicial,
                componentes: (m.componentes || []).map((c) => ({ componente_id: c.componente, cantidad: c.cantidad })),
                pruebas_laboratorio: pruebasDeModelo(m.pruebas_laboratorio),
            } : vacio)}
            validar={(v) => ({
                nombre: !v.nombre.trim() ? 'El nombre es obligatorio' : v.nombre.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined,
                codigo_modelo: !String(v.codigo_modelo).trim() ? 'El código es obligatorio' : !/^\d+$/.test(String(v.codigo_modelo).trim()) ? 'Solo números' : undefined,
                marca: !v.marca ? 'Elige la marca' : undefined,
                tipo_material: !v.tipo_material ? 'Elige el tipo' : undefined,
                unidad_medida: !v.unidad_medida ? 'Elige la unidad' : undefined,
                pruebas_laboratorio: tipoPorId[v.tipo_material]?.es_unico && v.requiere_inspeccion_inicial && !v.pruebas_laboratorio.length ? 'Marca al menos una prueba' : undefined,
            })}
            preparar={(v) => {
                const t = tipoPorId[v.tipo_material];
                return {
                    nombre: v.nombre.trim(),
                    codigo_modelo: parseInt(v.codigo_modelo, 10),
                    marca: parseInt(v.marca, 10),
                    tipo_material: parseInt(v.tipo_material, 10),
                    unidad_medida: parseInt(v.unidad_medida, 10),
                    descripcion: v.descripcion.trim(),
                    requiere_inspeccion_inicial: !!v.requiere_inspeccion_inicial,
                    componentes: t && !t.es_unico ? [] : v.componentes,
                    // todas marcadas = lista vacía (aplican todas, incluidas las que se agreguen en el futuro)
                    pruebas_laboratorio: !t?.es_unico || v.pruebas_laboratorio.length === TODAS_LAS_PRUEBAS.length ? [] : v.pruebas_laboratorio,
                };
            }}
            textoBusqueda={(m) => `${m.nombre} ${m.codigo_modelo} ${m.marca_info?.nombre} ${m.tipo_material_info?.nombre} ${m.descripcion}`}
        />
    );
};

export default Modelos;
