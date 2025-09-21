import React from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Chip,
    Progress,
    IconButton,
    Tooltip,
    Alert
} from '@material-tailwind/react';
import {
    IoAdd,
    IoEye,
    IoCreate,
    IoTrash,
    IoClose,
    IoCheckmarkCircle,
    IoTime,
    IoCube,
    IoDocument,
    IoCloudUpload,
    IoWarning,
    IoInformationCircle,
    IoCalendar,
    IoBusinessOutline,
    IoLocationOutline,
    IoPlay,
    IoRefresh,
    IoCheckmark,
    IoGitBranch
} from 'react-icons/io5';

// ========== TABLA DE LOTES ==========
export const LotesTable = ({
                               lotes,
                               loading,
                               onView,
                               onEdit,
                               onDelete,
                               onImport,
                               onEntregas,
                               permissions
                           }) => {
    const getEstadoColor = (estado) => {
        const estadoLower = estado?.toLowerCase() || '';
        switch (estadoLower) {
            case 'activo':
            case 'registrado':
                return 'blue';
            case 'recepcion_parcial':
                return 'amber';
            case 'recepcion_completa':
                return 'green';
            case 'cerrado':
                return 'gray';
            default:
                return 'gray';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('es-ES');
        } catch {
            return 'N/A';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardBody>
                    <div className="flex justify-center items-center h-32">
                        <Typography color="gray">Cargando lotes...</Typography>
                    </div>
                </CardBody>
            </Card>
        );
    }

    if (!lotes || lotes.length === 0) {
        return (
            <Card>
                <CardBody>
                    <div className="text-center py-8">
                        <IoCube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <Typography color="gray" className="mb-2">
                            No hay lotes registrados
                        </Typography>
                        <Typography variant="small" color="gray">
                            Comienza creando tu primer lote
                        </Typography>
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card>
            <CardBody className="px-0">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max table-auto text-left">
                        <thead>
                        <tr>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Lote
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Proveedor
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Tipo
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Estado
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Progreso
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Garantía
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Acciones
                                </Typography>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {lotes.map((lote) => (
                            <tr key={lote.id} className="even:bg-blue-gray-50/50">
                                <td className="p-4">
                                    <div>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {lote.numero_lote}
                                        </Typography>
                                        <Typography variant="small" color="gray" className="opacity-70">
                                            {formatDate(lote.fecha_recepcion)}
                                        </Typography>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {lote.proveedor_info?.nombre_comercial || 'N/A'}
                                        </Typography>
                                        <Typography variant="small" color="gray" className="opacity-70">
                                            {lote.proveedor_info?.codigo || ''}
                                        </Typography>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Chip
                                        size="sm"
                                        variant="ghost"
                                        value={lote.tipo_ingreso_info?.nombre || 'N/A'}
                                        color="blue"
                                    />
                                </td>
                                <td className="p-4">
                                    <Chip
                                        size="sm"
                                        variant="gradient"
                                        color={getEstadoColor(lote.estado_info?.codigo)}
                                        value={lote.estado_info?.nombre || 'Sin estado'}
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="w-max">
                                        <Typography variant="small" color="gray" className="mb-1">
                                            {lote.cantidad_recibida || 0}/{lote.cantidad_total || 0}
                                        </Typography>
                                        <Progress
                                            value={lote.porcentaje_recibido || 0}
                                            color={lote.porcentaje_recibido === 100 ? 'green' : lote.porcentaje_recibido > 0 ? 'amber' : 'gray'}
                                            size="sm"
                                        />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <Typography variant="small" color="gray" className="opacity-70">
                                            Hasta: {formatDate(lote.fecha_fin_garantia)}
                                        </Typography>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {permissions?.canView && (
                                            <Tooltip content="Ver detalles">
                                                <IconButton
                                                    variant="text"
                                                    color="blue"
                                                    size="sm"
                                                    onClick={() => onView(lote)}
                                                >
                                                    <IoEye className="h-4 w-4" />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        {permissions?.canImport && lote.estado_info?.codigo !== 'CERRADO' && (
                                            <Tooltip content="Importar materiales">
                                                <IconButton
                                                    variant="text"
                                                    color="green"
                                                    size="sm"
                                                    onClick={() => onImport(lote)}
                                                >
                                                    <IoCloudUpload className="h-4 w-4" />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        {permissions?.canEdit && lote.estado_info?.codigo !== 'CERRADO' && (
                                            <Tooltip content="Entregas Parciales">
                                                <IconButton
                                                    variant="text"
                                                    color="amber"
                                                    size="sm"
                                                    onClick={() => onEntregas(lote)}
                                                >
                                                    <IoGitBranch className="h-4 w-4" />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        {permissions?.canEdit && lote.estado_info?.codigo !== 'CERRADO' && (
                                            <Tooltip content="Editar">
                                                <IconButton
                                                    variant="text"
                                                    color="orange"
                                                    size="sm"
                                                    onClick={() => onEdit(lote)}
                                                >
                                                    <IoCreate className="h-4 w-4" />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        {permissions?.canDelete && lote.estado_info?.codigo === 'REGISTRADO' && (
                                            <Tooltip content="Eliminar">
                                                <IconButton
                                                    variant="text"
                                                    color="red"
                                                    size="sm"
                                                    onClick={() => onDelete(lote)}
                                                >
                                                    <IoTrash className="h-4 w-4" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </CardBody>
        </Card>
    );
};

// ========== CARD DE ESTADÍSTICAS ==========
export const LoteStatsCard = ({
                                  icon: Icon,
                                  title,
                                  value,
                                  color = "blue",
                                  trend,
                                  subtitle
                              }) => {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-500'
        },
        green: {
            bg: 'bg-green-50',
            text: 'text-green-500'
        },
        teal: {
            bg: 'bg-teal-50',
            text: 'text-teal-500'
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-500'
        },
        red: {
            bg: 'bg-red-50',
            text: 'text-red-500'
        },
        gray: {
            bg: 'bg-gray-50',
            text: 'text-gray-500'
        }
    };

    const currentColor = colorClasses[color] || colorClasses.blue;

    return (
        <Card>
            <CardBody className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Typography color="gray" className="mb-1 text-sm">
                            {title}
                        </Typography>
                        <Typography variant="h4" color="blue-gray">
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="small" color="gray" className="opacity-70">
                                {subtitle}
                            </Typography>
                        )}
                    </div>
                    <div className={`rounded-full p-3 ${currentColor.bg}`}>
                        {Icon && typeof Icon === 'function' && (
                            <Icon className={`h-6 w-6 ${currentColor.text}`} />
                        )}
                    </div>
                </div>
                {trend && (
                    <div className="mt-2">
                        <Typography variant="small" color={trend.positive ? "green" : "red"}>
                            {trend.value} {trend.label}
                        </Typography>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

// ========== DETALLE DE LOTE (SIMPLIFICADO) ==========

export const LoteDetailCard = ({ lote, onClose, onImport, permissions }) => {
    if (!lote) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('es-ES');
        } catch {
            return 'N/A';
        }
    };

    const getEstadoColor = (estado) => {
        const estadoLower = estado?.toLowerCase() || '';
        switch (estadoLower) {
            case 'activo':
            case 'registrado':
                return 'blue';
            case 'recepcion_parcial':
                return 'amber';
            case 'recepcion_completa':
                return 'green';
            case 'cerrado':
                return 'gray';
            default:
                return 'gray';
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Typography variant="h4" color="blue-gray" className="font-semibold">
                            Lote #{lote.numero_lote}
                        </Typography>
                        <Typography color="gray" className="text-base">
                            {lote.proveedor_info?.nombre_comercial}
                        </Typography>
                    </div>
                    <Chip
                        variant="gradient"
                        color={getEstadoColor(lote.estado_info?.codigo)}
                        value={lote.estado_info?.nombre || 'Sin estado'}
                        className="font-medium"
                    />
                </div>
            </CardHeader>

            <CardBody className="px-6 py-8">
                <div className="space-y-8">
                    {/* Progreso de Recepción */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <Typography variant="h6" color="blue-gray" className="font-semibold">
                                Progreso de Recepción
                            </Typography>
                            <div className="text-right">
                                <Typography variant="h5" color="blue-gray" className="font-bold">
                                    {lote.porcentaje_recibido || 0}%
                                </Typography>
                                <Typography variant="small" color="gray">
                                    {lote.cantidad_recibida || 0} de {lote.cantidad_total || 0} unidades
                                </Typography>
                            </div>
                        </div>
                        <Progress
                            value={lote.porcentaje_recibido || 0}
                            color={lote.porcentaje_recibido === 100 ? 'green' : lote.porcentaje_recibido > 0 ? 'blue' : 'gray'}
                            className="h-2"
                        />
                    </div>

                    {/* Información General */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <Typography variant="h6" color="blue-gray" className="font-semibold mb-3 border-b border-gray-200 pb-2">
                                Tipo de Ingreso
                            </Typography>
                            <Chip
                                variant="ghost"
                                color="blue"
                                value={lote.tipo_ingreso_info?.nombre || 'N/A'}
                                className="w-fit"
                            />
                        </div>

                        <div>
                            <Typography variant="h6" color="blue-gray" className="font-semibold mb-3 border-b border-gray-200 pb-2">
                                Almacén Destino
                            </Typography>
                            <Typography color="blue-gray" className="font-medium text-lg">
                                {lote.almacen_destino_info?.nombre || 'N/A'}
                            </Typography>
                        </div>

                        {/* ✅ NUEVO: Sector Solicitante */}
                        <div>
                            <Typography variant="h6" color="blue-gray" className="font-semibold mb-3 border-b border-gray-200 pb-2">
                                Sector Solicitante
                            </Typography>
                            <div className="flex items-center gap-2">
                                <IoBusinessOutline className="h-5 w-5 text-purple-500" />
                                <Typography color="blue-gray" className="font-medium text-lg">
                                    {lote.sector_solicitante_info?.nombre || 'No asignado'}
                                </Typography>
                            </div>
                            {lote.sector_solicitante_info?.nombre && (
                                <Typography variant="small" color="gray" className="mt-1">
                                    Responsable de solicitar estos materiales
                                </Typography>
                            )}
                        </div>

                        <div>
                            <Typography variant="h6" color="blue-gray" className="font-semibold mb-3 border-b border-gray-200 pb-2">
                                Tipo de Servicio
                            </Typography>
                            <div className="flex items-center gap-2">
                                <IoCube className="h-5 w-5 text-blue-500" />
                                <Typography color="blue-gray" className="font-medium text-lg">
                                    {lote.tipo_servicio_info?.nombre || 'N/A'}
                                </Typography>
                            </div>
                        </div>
                    </div>

                    {/* Información de Fechas */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="font-semibold mb-6 border-b border-gray-200 pb-2">
                            Fechas Importantes
                        </Typography>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                <IoCalendar className="h-6 w-6 text-blue-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                        Fecha de Recepción
                                    </Typography>
                                    <Typography color="gray" className="mt-1">
                                        {formatDate(lote.fecha_recepcion)}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                                <IoCheckmarkCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                        Inicio de Garantía
                                    </Typography>
                                    <Typography color="gray" className="mt-1">
                                        {formatDate(lote.fecha_inicio_garantia)}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                                <IoWarning className="h-6 w-6 text-amber-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                        Fin de Garantía
                                    </Typography>
                                    <Typography color="gray" className="mt-1">
                                        {formatDate(lote.fecha_fin_garantia)}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ✅ NUEVO: Información del Sector (si existe) */}
                    {lote.sector_solicitante_info && (
                        <div>
                            <Typography variant="h6" color="blue-gray" className="font-semibold mb-4 border-b border-gray-200 pb-2">
                                Información del Sector
                            </Typography>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <IoBusinessOutline className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <Typography className="font-semibold text-purple-800">
                                            {lote.sector_solicitante_info.nombre}
                                        </Typography>
                                        <Typography variant="small" className="text-purple-700 mt-1">
                                            Este sector es responsable de solicitar y gestionar los materiales de este lote.
                                            En caso de equipos defectuosos, se coordinarán las devoluciones con este sector.
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Códigos Sprint */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="font-semibold mb-4 border-b border-gray-200 pb-2">
                            Códigos Sistema Sprint
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
                                    Código Requerimiento Compra
                                </Typography>
                                <Typography className="font-mono text-lg">
                                    {lote.codigo_requerimiento_compra || 'N/A'}
                                </Typography>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
                                    Código Nota Ingreso
                                </Typography>
                                <Typography className="font-mono text-lg">
                                    {lote.codigo_nota_ingreso || 'N/A'}
                                </Typography>
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    {lote.observaciones && (
                        <div>
                            <Typography variant="h6" color="blue-gray" className="font-semibold mb-4 border-b border-gray-200 pb-2">
                                Observaciones
                            </Typography>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <Typography color="blue-gray" className="leading-relaxed">
                                    {lote.observaciones}
                                </Typography>
                            </div>
                        </div>
                    )}

                    {/* Alertas */}
                    {(lote.estado_info?.codigo === 'CERRADO' || lote.cantidad_pendiente > 0) && (
                        <div className="space-y-4">
                            {lote.estado_info?.codigo === 'CERRADO' && (
                                <Alert color="gray" className="bg-gray-50 border border-gray-300">
                                    <div className="flex items-start gap-3">
                                        <IoInformationCircle className="h-5 w-5 mt-1 flex-shrink-0" />
                                        <div>
                                            <Typography className="font-semibold text-gray-800">
                                                Lote Cerrado
                                            </Typography>
                                            <Typography className="text-sm text-gray-600 mt-1">
                                                Este lote está cerrado. No se pueden realizar más operaciones.
                                            </Typography>
                                        </div>
                                    </div>
                                </Alert>
                            )}

                            {lote.cantidad_pendiente > 0 && (
                                <Alert color="amber" className="bg-amber-50 border border-amber-300">
                                    <div className="flex items-start gap-3">
                                        <IoWarning className="h-5 w-5 mt-1 flex-shrink-0" />
                                        <div>
                                            <Typography className="font-semibold text-amber-800">
                                                Materiales Pendientes
                                            </Typography>
                                            <Typography className="text-sm text-amber-700 mt-1">
                                                Este lote tiene {lote.cantidad_pendiente} materiales pendientes de recepción.
                                                Sector responsable: <strong>{lote.sector_solicitante_info?.nombre || 'No asignado'}</strong>
                                            </Typography>
                                        </div>
                                    </div>
                                </Alert>
                            )}
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

// ========== FILTROS DE LOTES ==========
export const LoteFilters = ({
                                filtros,
                                onFiltroChange,
                                opciones,
                                onLimpiarFiltros
                            }) => (
    <Card>
        <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Estado
                    </Typography>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={filtros?.estado || ''}
                        onChange={(e) => onFiltroChange('estado', e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        {opciones?.estados_lote?.map((estado) => (
                            <option key={estado.id} value={estado.id}>
                                {estado.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Proveedor
                    </Typography>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={filtros?.proveedor || ''}
                        onChange={(e) => onFiltroChange('proveedor', e.target.value)}
                    >
                        <option value="">Todos los proveedores</option>
                        {opciones?.proveedores?.map((proveedor) => (
                            <option key={proveedor.id} value={proveedor.id}>
                                {proveedor.nombre_comercial}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Tipo Ingreso
                    </Typography>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={filtros?.tipo_ingreso || ''}
                        onChange={(e) => onFiltroChange('tipo_ingreso', e.target.value)}
                    >
                        <option value="">Todos los tipos</option>
                        {opciones?.tipos_ingreso?.map((tipo) => (
                            <option key={tipo.id} value={tipo.id}>
                                {tipo.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-end">
                    <Button
                        variant="outlined"
                        size="sm"
                        onClick={onLimpiarFiltros}
                        className="w-full"
                    >
                        Limpiar Filtros
                    </Button>
                </div>
            </div>
        </CardBody>
    </Card>
);