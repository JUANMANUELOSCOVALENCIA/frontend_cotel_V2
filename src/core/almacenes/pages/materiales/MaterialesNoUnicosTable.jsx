// src/core/almacenes/pages/materiales-no-unicos/MaterialesNoUnicosTable.jsx
import React from 'react';
import {
    Card,
    CardBody,
    Typography,
    IconButton,
    Tooltip,
    Chip,
    Button
} from '@material-tailwind/react';
import {
    IoEye,
    IoCube,
    IoArrowBack,
    IoArrowForward
} from 'react-icons/io5';

const MaterialesNoUnicosTable = ({
                                     materiales,
                                     loading,
                                     pagination,
                                     currentPage,
                                     onViewDetail,
                                     onPageChange,
                                     permissions
                                 }) => {
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
            case 'disponible':
                return 'green';
            case 'asignado':
            case 'reservado':
                return 'blue';
            case 'consumido':
            case 'agotado':
                return 'gray';
            case 'defectuoso':
            case 'dañado':
                return 'red';
            case 'en_transito':
                return 'amber';
            default:
                return 'gray';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardBody>
                    <div className="flex justify-center items-center h-32">
                        <Typography color="gray">Cargando materiales...</Typography>
                    </div>
                </CardBody>
            </Card>
        );
    }

    if (!materiales || materiales.length === 0) {
        return (
            <Card>
                <CardBody>
                    <div className="text-center py-8">
                        <IoCube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <Typography color="gray" className="mb-2">
                            No se encontraron materiales no únicos
                        </Typography>
                        <Typography variant="small" color="gray">
                            Los materiales aparecerán aquí una vez registrados
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
                                    Material
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Cantidad Disponible
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Lote Origen
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Proveedor
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Estado
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Fecha Ingreso
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
                        {materiales.map((material) => (
                            <tr key={material.id} className="even:bg-blue-gray-50/50">
                                <td className="p-4">
                                    <div>
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                            {material.modelo_info?.marca} {material.modelo_info?.nombre}
                                        </Typography>
                                        <Typography variant="small" color="gray" className="opacity-70">
                                            {material.codigo_interno}
                                        </Typography>
                                        <Typography variant="small" color="gray" className="opacity-70">
                                            {material.tipo_material_info?.nombre}
                                        </Typography>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Typography variant="h6" color="blue-gray">
                                            {material.cantidad || 0}
                                        </Typography>
                                        <Typography variant="small" color="gray">
                                            {material.modelo_info?.tipo_material?.unidad_medida?.simbolo || 'unidades'}
                                        </Typography>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                            {material.lote_info?.numero_lote}
                                        </Typography>
                                        <Typography variant="small" color="gray" className="opacity-70">
                                            {formatDate(material.lote_info?.fecha_recepcion)}
                                        </Typography>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Typography variant="small" color="blue-gray">
                                        {material.lote_info?.proveedor_info?.nombre_comercial || 'N/A'}
                                    </Typography>
                                </td>
                                <td className="p-4">
                                    <Chip
                                        size="sm"
                                        variant="gradient"
                                        color={getEstadoColor(material.estado_display?.codigo)}
                                        value={material.estado_display?.nombre || 'Sin estado'}
                                    />
                                </td>
                                <td className="p-4">
                                    <Typography variant="small" color="gray">
                                        {formatDate(material.created_at)}
                                    </Typography>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {permissions?.canView && (
                                            <Tooltip content="Ver detalles">
                                                <IconButton
                                                    variant="text"
                                                    color="blue"
                                                    size="sm"
                                                    onClick={() => onViewDetail(material)}
                                                >
                                                    <IoEye className="h-4 w-4" />
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

                {/* Paginación */}
                {pagination && pagination.count > 20 && (
                    <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray">
                            Página {currentPage} de {Math.ceil(pagination.count / 20)}
                        </Typography>
                        <div className="flex gap-2">
                            <Button
                                variant="outlined"
                                size="sm"
                                disabled={!pagination.previous}
                                onClick={() => onPageChange(currentPage - 1)}
                            >
                                <IoArrowBack className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outlined"
                                size="sm"
                                disabled={!pagination.next}
                                onClick={() => onPageChange(currentPage + 1)}
                            >
                                <IoArrowForward className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default MaterialesNoUnicosTable;