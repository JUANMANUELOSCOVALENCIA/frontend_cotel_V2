// ======================================================
// src/core/almacenes/components/almacenesComponents.jsx
// Componentes reutilizables para el módulo de almacenes
// ======================================================

import React from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Button,
    Chip,
    IconButton,
    Tooltip,
    Spinner,
} from '@material-tailwind/react';
import {
    FaWarehouse,
    FaBuilding,
    FaMapMarkerAlt,
    FaUser,
    FaEdit,
    FaTrash,
    FaEye,
    FaBox,
    FaBarcode,
    FaTags,
    FaCog,
    FaToggleOn,
    FaToggleOff
} from 'react-icons/fa';

// ========== CARD DE ALMACÉN ==========

export const AlmacenCard = ({
                                almacen,
                                onEdit,
                                onDelete,
                                onView,
                                onViewEstadisticas,
                                loading = false
                            }) => {
    const estadoColor = almacen.activo ? 'green' : 'red';
    const estadoText = almacen.activo ? 'Activo' : 'Inactivo';

    return (
        <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader
                color={almacen.es_principal ? 'blue' : 'blue-gray'}
                className="relative h-16 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <FaWarehouse className="h-6 w-6 text-white" />
                    <div>
                        <Typography variant="h6" color="white" className="font-semibold">
                            {almacen.codigo}
                        </Typography>
                        <Typography variant="small" color="white" className="opacity-80">
                            {almacen.es_principal ? 'Principal' : 'Regional'}
                        </Typography>
                    </div>
                </div>

                <Chip
                    variant="ghost"
                    color={estadoColor}
                    size="sm"
                    value={estadoText}
                    className="text-xs"
                />
            </CardHeader>

            <CardBody className="p-4">
                <div className="space-y-3">
                    {/* Nombre del almacén */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="font-semibold">
                            {almacen.nombre}
                        </Typography>
                    </div>

                    {/* Información de ubicación */}
                    <div className="flex items-center gap-2 text-gray-600">
                        <FaMapMarkerAlt className="h-4 w-4" />
                        <Typography variant="small">
                            {almacen.ciudad}
                        </Typography>
                    </div>

                    {/* Tipo de almacén */}
                    <div className="flex items-center gap-2 text-gray-600">
                        <FaBuilding className="h-4 w-4" />
                        <Typography variant="small">
                            {almacen.tipo_info?.nombre || 'Sin tipo'}
                        </Typography>
                    </div>

                    {/* Encargado */}
                    {almacen.encargado_info && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <FaUser className="h-4 w-4" />
                            <Typography variant="small">
                                {almacen.encargado_info.nombre_completo}
                            </Typography>
                        </div>
                    )}

                    {/* Estadísticas */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <div className="text-center">
                            <Typography variant="h6" color="blue" className="font-bold">
                                {almacen.total_materiales || 0}
                            </Typography>
                            <Typography variant="small" color="gray">
                                Total Materiales
                            </Typography>
                        </div>
                        <div className="text-center">
                            <Typography variant="h6" color="green" className="font-bold">
                                {almacen.materiales_disponibles || 0}
                            </Typography>
                            <Typography variant="small" color="gray">
                                Disponibles
                            </Typography>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <div className="flex gap-1">
                            <Tooltip content="Ver detalles">
                                <IconButton
                                    variant="text"
                                    color="blue"
                                    size="sm"
                                    onClick={() => onView?.(almacen)}
                                    disabled={loading}
                                >
                                    <FaEye className="h-4 w-4" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip content="Editar">
                                <IconButton
                                    variant="text"
                                    color="amber"
                                    size="sm"
                                    onClick={() => onEdit?.(almacen)}
                                    disabled={loading}
                                >
                                    <FaEdit className="h-4 w-4" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip content="Eliminar">
                                <IconButton
                                    variant="text"
                                    color="red"
                                    size="sm"
                                    onClick={() => onDelete?.(almacen)}
                                    disabled={loading}
                                >
                                    <FaTrash className="h-4 w-4" />
                                </IconButton>
                            </Tooltip>
                        </div>

                        <Button
                            size="sm"
                            variant="outlined"
                            color="blue"
                            onClick={() => onViewEstadisticas?.(almacen)}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <FaBox className="h-3 w-3" />
                            Estadísticas
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

// ========== CARD DE MARCA ==========

export const MarcaCard = ({
                              marca,
                              onEdit,
                              onDelete,
                              onToggleActivo,
                              loading = false
                          }) => {
    const estadoColor = marca.activo ? 'green' : 'red';

    return (
        <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardBody className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FaTags className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <Typography variant="h6" color="blue-gray" className="font-semibold">
                                {marca.nombre}
                            </Typography>
                            <Typography variant="small" color="gray">
                                {marca.modelos_count || 0} modelos • {marca.materiales_count || 0} materiales
                            </Typography>
                        </div>
                    </div>

                    <Chip
                        variant="ghost"
                        color={estadoColor}
                        size="sm"
                        value={marca.activo ? 'Activa' : 'Inactiva'}
                        className="text-xs"
                    />
                </div>

                {/* Descripción */}
                {marca.descripcion && (
                    <Typography variant="small" color="gray" className="mb-3">
                        {marca.descripcion}
                    </Typography>
                )}

                {/* Botones de acción */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div className="flex gap-1">
                        <Tooltip content="Editar">
                            <IconButton
                                variant="text"
                                color="amber"
                                size="sm"
                                onClick={() => onEdit?.(marca)}
                                disabled={loading}
                            >
                                <FaEdit className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip content="Eliminar">
                            <IconButton
                                variant="text"
                                color="red"
                                size="sm"
                                onClick={() => onDelete?.(marca)}
                                disabled={loading}
                            >
                                <FaTrash className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>
                    </div>

                    <Tooltip content={marca.activo ? 'Desactivar' : 'Activar'}>
                        <IconButton
                            variant="text"
                            color={marca.activo ? 'red' : 'green'}
                            size="sm"
                            onClick={() => onToggleActivo?.(marca)}
                            disabled={loading}
                        >
                            {marca.activo ?
                                <FaToggleOn className="h-5 w-5" /> :
                                <FaToggleOff className="h-5 w-5" />
                            }
                        </IconButton>
                    </Tooltip>
                </div>
            </CardBody>
        </Card>
    );
};

// ========== CARD DE MODELO ==========

export const ModeloCard = ({
                               modelo,
                               onEdit,
                               onDelete,
                               onView,
                               loading = false
                           }) => {
    const estadoColor = modelo.activo ? 'green' : 'red';

    return (
        <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardBody className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <FaBox className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <Typography variant="h6" color="blue-gray" className="font-semibold">
                                {modelo.nombre}
                            </Typography>
                            <Typography variant="small" color="gray">
                                {modelo.marca_info?.nombre} • Código: {modelo.codigo_modelo}
                            </Typography>
                        </div>
                    </div>

                    <Chip
                        variant="ghost"
                        color={estadoColor}
                        size="sm"
                        value={modelo.activo ? 'Activo' : 'Inactivo'}
                        className="text-xs"
                    />
                </div>

                {/* Información del tipo de material */}
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <FaCog className="h-4 w-4 text-gray-500" />
                        <Typography variant="small" color="gray">
                            Tipo: {modelo.tipo_material_info?.nombre || 'Sin definir'}
                        </Typography>
                    </div>

                    <div className="flex items-center gap-2">
                        <FaBarcode className="h-4 w-4 text-gray-500" />
                        <Typography variant="small" color="gray">
                            Unidad: {modelo.unidad_medida_info?.nombre || 'Sin definir'}
                        </Typography>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="flex justify-between items-center mb-3 pt-2 border-t border-gray-200">
                    <div className="text-center">
                        <Typography variant="h6" color="blue" className="font-bold">
                            {modelo.materiales_count || 0}
                        </Typography>
                        <Typography variant="small" color="gray">
                            Total Materiales
                        </Typography>
                    </div>
                    <div className="text-center">
                        <Typography variant="h6" color="green" className="font-bold">
                            {modelo.materiales_disponibles || 0}
                        </Typography>
                        <Typography variant="small" color="gray">
                            Disponibles
                        </Typography>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div className="flex gap-1">
                        <Tooltip content="Ver detalles">
                            <IconButton
                                variant="text"
                                color="blue"
                                size="sm"
                                onClick={() => onView?.(modelo)}
                                disabled={loading}
                            >
                                <FaEye className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip content="Editar">
                            <IconButton
                                variant="text"
                                color="amber"
                                size="sm"
                                onClick={() => onEdit?.(modelo)}
                                disabled={loading}
                            >
                                <FaEdit className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip content="Eliminar">
                            <IconButton
                                variant="text"
                                color="red"
                                size="sm"
                                onClick={() => onDelete?.(modelo)}
                                disabled={loading}
                            >
                                <FaTrash className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>
                    </div>

                    <Typography variant="small" color="gray" className="text-xs">
                        Requiere inspección: {modelo.requiere_inspeccion_inicial ? 'Sí' : 'No'}
                    </Typography>
                </div>
            </CardBody>
        </Card>
    );
};

// ========== COMPONENTE DE ESTADÍSTICAS ==========

export const EstadisticasCard = ({ titulo, valor, icono, color = "blue", descripcion }) => {
    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardBody className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Typography variant="small" color="gray" className="font-medium">
                            {titulo}
                        </Typography>
                        <Typography variant="h3" color={color} className="font-bold">
                            {valor}
                        </Typography>
                        {descripcion && (
                            <Typography variant="small" color="gray">
                                {descripcion}
                            </Typography>
                        )}
                    </div>
                    <div className={`p-3 bg-${color}-50 rounded-lg`}>
                        {icono}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

// ========== COMPONENTE DE LOADING ==========

export const LoadingCard = ({ mensaje = "Cargando..." }) => {
    return (
        <Card className="w-full shadow-md">
            <CardBody className="p-8 text-center">
                <Spinner className="h-8 w-8 mx-auto mb-4" />
                <Typography variant="small" color="gray">
                    {mensaje}
                </Typography>
            </CardBody>
        </Card>
    );
};

// ========== COMPONENTE DE ESTADO VACÍO ==========

export const EmptyState = ({
                               titulo = "Sin datos",
                               descripcion = "No hay información para mostrar",
                               icono,
                               action
                           }) => {
    return (
        <Card className="w-full shadow-md">
            <CardBody className="p-8 text-center">
                <div className="mb-4 text-gray-400">
                    {icono || <FaBox className="h-12 w-12 mx-auto" />}
                </div>
                <Typography variant="h6" color="gray" className="mb-2">
                    {titulo}
                </Typography>
                <Typography variant="small" color="gray" className="mb-4">
                    {descripcion}
                </Typography>
                {action && action}
            </CardBody>
        </Card>
    );
};

// ========== COMPONENTE DE FILTROS ==========

export const FilterBar = ({
                              onSearch,
                              onFilter,
                              searchPlaceholder = "Buscar...",
                              filters = [],
                              actions = []
                          }) => {
    return (
        <Card className="mb-6">
            <CardBody className="p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Búsqueda */}
                    <div className="flex-1 min-w-64">
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            onChange={(e) => onSearch?.(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Filtros */}
                    <div className="flex gap-2">
                        {filters.map((filter, index) => (
                            <div key={index}>
                                {filter}
                            </div>
                        ))}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                        {actions.map((action, index) => (
                            <div key={index}>
                                {action}
                            </div>
                        ))}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};