import React, { useState, useEffect } from 'react';
import {
    Button,
    Select,
    Option,
    Input,
    Typography,
    Chip,
} from '@material-tailwind/react';
import { IoClose } from 'react-icons/io5';

const ONUFilters = ({ opciones, filters, onApplyFilters, onClearFilters }) => {
    const [localFilters, setLocalFilters] = useState({
        lote: '',
        almacen_actual: '',
        estado_onu: '',
        modelo: '',
        es_nuevo: '',
        fecha_desde: '',
        fecha_hasta: '',
        codigo_item_equipo: '',
        ...filters
    });

    // MOVER TODAS LAS FUNCIONES AL INICIO, ANTES DE useEffect
    const getLotesSeguras = () => {
        return opciones?.lotes?.filter(lote =>
            lote && lote.id && lote.numero_lote
        ) || [];
    };

    const getAlmacenesSeguras = () => {
        return opciones?.almacenes?.filter(almacen =>
            almacen && almacen.id && almacen.codigo && almacen.nombre
        ) || [];
    };

    const getEstadosSeguras = () => {
        return opciones?.estados_material_onu?.filter(estado =>
            estado && estado.id && estado.nombre
        ) || [];
    };

    const getModelosSeguras = () => {
        return opciones?.modelos?.filter(modelo =>
            modelo &&
            modelo.id &&
            modelo.nombre &&
            modelo.tipo_material_info?.es_unico === true &&
            modelo.marca_info?.nombre
        ) || [];
    };

    const handleFilterChange = (field, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApply = () => {
        const cleanFilters = Object.fromEntries(
            Object.entries(localFilters).filter(([_, value]) => value !== '' && value !== null)
        );
        onApplyFilters(cleanFilters);
    };

    const handleClear = () => {
        setLocalFilters({
            lote: '',
            almacen_actual: '',
            estado_onu: '',
            modelo: '',
            es_nuevo: '',
            fecha_desde: '',
            fecha_hasta: '',
            codigo_item_equipo: ''
        });
        onClearFilters();
    };

    const removeFilter = (field) => {
        const newFilters = { ...localFilters };
        delete newFilters[field];
        setLocalFilters(newFilters);
        onApplyFilters(newFilters);
    };

    const getActiveFilters = () => {
        return Object.entries(localFilters).filter(([key, value]) =>
            value !== '' && value !== null && key !== 'tipo_material' && key !== 'page' && key !== 'page_size'
        );
    };

    useEffect(() => {
        setLocalFilters({
            ...localFilters,
            ...filters
        });
    }, [filters]);

    return (
        <div className="space-y-4">
            {/* Filtros activos */}
            {getActiveFilters().length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <Typography variant="small" color="gray" className="mr-2">
                        Filtros activos:
                    </Typography>
                    {getActiveFilters().map(([key, value]) => {
                        let displayValue = value;
                        let displayLabel = key;

                        if (key === 'lote') {
                            const lote = getLotesSeguras().find(l => l.id.toString() === value.toString());
                            displayValue = lote ? lote.numero_lote : value;
                            displayLabel = 'Lote';
                        } else if (key === 'almacen_actual') {
                            const almacen = getAlmacenesSeguras().find(a => a.id.toString() === value.toString());
                            displayValue = almacen ? almacen.codigo : value;
                            displayLabel = 'Almacén';
                        } else if (key === 'estado_onu') {
                            const estado = getEstadosSeguras().find(e => e.id.toString() === value.toString());
                            displayValue = estado ? estado.nombre : value;
                            displayLabel = 'Estado';
                        } else if (key === 'modelo') {
                            const modelo = getModelosSeguras().find(m => m.id.toString() === value.toString());
                            displayValue = modelo ? `${modelo.marca_info?.nombre} ${modelo.nombre}` : value;
                            displayLabel = 'Modelo';
                        } else if (key === 'es_nuevo') {
                            displayValue = value === 'true' ? 'Nuevo' : 'Reingresado';
                            displayLabel = 'Tipo';
                        }

                        return (
                            <Chip
                                key={key}
                                value={`${displayLabel}: ${displayValue}`}
                                onClose={() => removeFilter(key)}
                                icon={<IoClose className="h-3 w-3" />}
                                className="cursor-pointer"
                            />
                        );
                    })}
                </div>
            )}

            {/* Grid de filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Filtro por Lote */}
                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Lote ({getLotesSeguras().length} disponibles)
                    </Typography>
                    <Select
                        value={localFilters.lote}
                        onChange={(value) => handleFilterChange('lote', value)}
                        label="Seleccionar Lote"
                    >
                        <Option value="">Todos</Option>
                        {getLotesSeguras().map((lote) => (
                            <Option key={lote.id} value={lote.id.toString()}>
                                {lote.numero_lote}
                            </Option>
                        ))}
                    </Select>
                </div>

                {/* Resto de filtros... */}
                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Almacén
                    </Typography>
                    <Select
                        value={localFilters.almacen_actual}
                        onChange={(value) => handleFilterChange('almacen_actual', value)}
                        label="Seleccionar Almacén"
                    >
                        <Option value="">Todos</Option>
                        {getAlmacenesSeguras().map((almacen) => (
                            <Option key={almacen.id} value={almacen.id.toString()}>
                                {almacen.codigo} - {almacen.nombre}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Estado
                    </Typography>
                    <Select
                        value={localFilters.estado_onu}
                        onChange={(value) => handleFilterChange('estado_onu', value)}
                        label="Seleccionar Estado"
                    >
                        <Option value="">Todos</Option>
                        {getEstadosSeguras().map((estado) => (
                            <Option key={estado.id} value={estado.id.toString()}>
                                {estado.nombre}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Modelo
                    </Typography>
                    <Select
                        value={localFilters.modelo}
                        onChange={(value) => handleFilterChange('modelo', value)}
                        label="Seleccionar Modelo"
                    >
                        <Option value="">Todos</Option>
                        {getModelosSeguras().map((modelo) => (
                            <Option key={modelo.id} value={modelo.id.toString()}>
                                {modelo.marca_info?.nombre} {modelo.nombre}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Tipo de Ingreso
                    </Typography>
                    <Select
                        value={localFilters.es_nuevo}
                        onChange={(value) => handleFilterChange('es_nuevo', value)}
                        label="Seleccionar Tipo"
                    >
                        <Option value="">Todos</Option>
                        <Option value="true">Nuevo</Option>
                        <Option value="false">Reingresado</Option>
                    </Select>
                </div>

                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Código Item Equipo
                    </Typography>
                    <Input
                        value={localFilters.codigo_item_equipo}
                        onChange={(e) => handleFilterChange('codigo_item_equipo', e.target.value)}
                        label="Código Item"
                    />
                </div>

                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Fecha Desde
                    </Typography>
                    <Input
                        type="date"
                        value={localFilters.fecha_desde}
                        onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                        label="Fecha Desde"
                    />
                </div>

                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Fecha Hasta
                    </Typography>
                    <Input
                        type="date"
                        value={localFilters.fecha_hasta}
                        onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                        label="Fecha Hasta"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
                <Button color="blue" onClick={handleApply}>
                    Aplicar Filtros
                </Button>
                <Button variant="outlined" onClick={handleClear}>
                    Limpiar Todo
                </Button>
            </div>
        </div>
    );
};

export default ONUFilters;