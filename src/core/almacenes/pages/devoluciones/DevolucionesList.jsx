// src/core/almacenes/pages/devoluciones/DevolucionesList.jsx - NUEVO
import React, { useState } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Input,
    Select,
    Option,
    Chip,
    IconButton,
    Tooltip,
    Alert
} from '@material-tailwind/react';
import {
    IoSearch,
    IoEye,
    IoSend,
    IoBusiness,
    IoCalendar,
    IoFilter,
    IoRefresh,
    IoArrowForward,
    IoWarning,
    IoCheckmarkCircle,
    IoTime
} from 'react-icons/io5';

const DevolucionesList = ({
                              devoluciones,
                              loading,
                              onView,
                              onReingreso,
                              permissions,
                              filtros = {},
                              setFiltros,
                              showFilters = true,
                              title,
                              subtitle
                          }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const getEstadoColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'pendiente': return 'amber';
            case 'enviado': return 'blue';
            case 'confirmado': return 'green';
            case 'rechazado': return 'red';
            default: return 'gray';
        }
    };

    const getEstadoIcon = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'pendiente': return IoTime;
            case 'enviado': return IoSend;
            case 'confirmado': return IoCheckmarkCircle;
            case 'rechazado': return IoWarning;
            default: return IoWarning;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    const filteredDevoluciones = devoluciones.filter(devolucion => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            devolucion.numero_devolucion?.toLowerCase().includes(searchLower) ||
            devolucion.proveedor_info?.nombre_comercial?.toLowerCase().includes(searchLower) ||
            devolucion.lote_info?.numero_lote?.toLowerCase().includes(searchLower) ||
            devolucion.numero_informe_laboratorio?.toLowerCase().includes(searchLower)
        );
    });

    const canCreateReingreso = (devolucion) => {
        return devolucion.estado_info?.codigo === 'CONFIRMADO' &&
            devolucion.respuesta_proveedor_info?.codigo === 'REPOSICION';
    };

    if (loading) {
        return (
            <Card>
                <CardBody className="flex justify-center items-center h-32">
                    <Typography color="gray">Cargando devoluciones...</Typography>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header personalizable */}
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && (
                        <Typography variant="h6" color="blue-gray" className="mb-1">
                            {title}
                        </Typography>
                    )}
                    {subtitle && (
                        <Typography variant="small" color="gray">
                            {subtitle}
                        </Typography>
                    )}
                </div>
            )}

            {/* Filtros */}
            {showFilters && (
                <Card>
                    <CardBody>
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    label="Buscar devoluciones..."
                                    icon={<IoSearch className="h-5 w-5" />}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <Select
                                label="Estado"
                                value={filtros?.estado || ''}
                                onChange={(value) => setFiltros?.({ ...filtros, estado: value })}
                            >
                                <Option value="">Todos los estados</Option>
                                <Option value="PENDIENTE">Pendiente</Option>
                                <Option value="ENVIADO">Enviado</Option>
                                <Option value="CONFIRMADO">Confirmado</Option>
                                <Option value="RECHAZADO">Rechazado</Option>
                            </Select>

                            <Select
                                label="Proveedor"
                                value={filtros?.proveedor || ''}
                                onChange={(value) => setFiltros?.({ ...filtros, proveedor: value })}
                            >
                                <Option value="">Todos los proveedores</Option>
                                {/* Aquí irían los proveedores desde opciones */}
                            </Select>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Lista de devoluciones */}
            <Card>
                <CardBody className="px-0">
                    {filteredDevoluciones.length === 0 ? (
                        <div className="text-center py-8">
                            <IoArrowForward className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <Typography color="gray" className="mb-2">
                                No hay devoluciones {title ? 'en esta categoría' : 'registradas'}
                            </Typography>
                            <Typography variant="small" color="gray">
                                {title
                                    ? 'Las devoluciones aparecerán aquí según su estado'
                                    : 'Crea tu primera devolución para equipos defectuosos'
                                }
                            </Typography>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max table-auto text-left">
                                <thead>
                                <tr>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Devolución
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Proveedor
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Lote Origen
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Estado
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Equipos
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Fecha
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
                                {filteredDevoluciones.map((devolucion) => {
                                    const EstadoIcon = getEstadoIcon(devolucion.estado_info?.codigo);

                                    return (
                                        <tr key={devolucion.id} className="even:bg-blue-gray-50/50">
                                            <td className="p-4">
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {devolucion.numero_devolucion}
                                                    </Typography>
                                                    <Typography variant="small" color="gray" className="opacity-70">
                                                        Informe: {devolucion.numero_informe_laboratorio}
                                                    </Typography>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <IoBusiness className="h-4 w-4 text-gray-400" />
                                                    <Typography variant="small" color="blue-gray">
                                                        {devolucion.proveedor_info?.nombre_comercial || 'N/A'}
                                                    </Typography>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Typography variant="small" color="blue-gray">
                                                    {devolucion.lote_info?.numero_lote || 'N/A'}
                                                </Typography>
                                            </td>
                                            <td className="p-4">
                                                <Chip
                                                    size="sm"
                                                    variant="gradient"
                                                    color={getEstadoColor(devolucion.estado_info?.codigo)}
                                                    value={devolucion.estado_info?.nombre || 'Sin estado'}
                                                    icon={<EstadoIcon className="h-3 w-3" />}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {devolucion.cantidad_materiales || 0}
                                                    </Typography>
                                                    <Typography variant="small" color="gray">
                                                        equipos
                                                    </Typography>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <IoCalendar className="h-4 w-4 text-gray-400" />
                                                    <Typography variant="small" color="blue-gray">
                                                        {formatDate(devolucion.fecha_creacion)}
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
                                                                onClick={() => onView(devolucion)}
                                                            >
                                                                <IoEye className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}

                                                    {canCreateReingreso(devolucion) && permissions?.canCreate && (
                                                        <Tooltip content="Registrar reposición">
                                                            <IconButton
                                                                variant="text"
                                                                color="green"
                                                                size="sm"
                                                                onClick={() => onReingreso(devolucion)}
                                                            >
                                                                <IoArrowForward className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Información adicional */}
            {filteredDevoluciones.length > 0 && (
                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <Typography variant="small" color="gray">
                                Total de devoluciones: {filteredDevoluciones.length}
                            </Typography>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <IoTime className="h-4 w-4 text-amber-500" />
                                    <Typography variant="small" color="gray">
                                        {filteredDevoluciones.filter(d => d.estado_info?.codigo === 'PENDIENTE').length} pendientes
                                    </Typography>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IoCheckmarkCircle className="h-4 w-4 text-green-500" />
                                    <Typography variant="small" color="gray">
                                        {filteredDevoluciones.filter(d => d.estado_info?.codigo === 'CONFIRMADO').length} confirmadas
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Alertas según contexto */}
            {title === "📋 Devoluciones Pendientes" && filteredDevoluciones.length > 0 && (
                <Alert color="amber">
                    <IoWarning className="h-5 w-5" />
                    <strong>Acción requerida:</strong> Estas devoluciones están pendientes de envío al proveedor.
                </Alert>
            )}

            {title === "📤 Devoluciones Enviadas" && filteredDevoluciones.length > 0 && (
                <Alert color="blue">
                    <IoSend className="h-5 w-5" />
                    <strong>En espera:</strong> Estas devoluciones han sido enviadas y están esperando respuesta del proveedor.
                </Alert>
            )}
        </div>
    );
};

export default DevolucionesList;