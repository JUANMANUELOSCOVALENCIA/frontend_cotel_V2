// src/core/almacenes/pages/materiales-no-unicos/MaterialNoUnicoDetailModal.jsx
import React from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Card,
    CardBody,
    Chip,
    Alert,
    IconButton
} from '@material-tailwind/react';
import {
    IoClose,
    IoInformationCircle,
    IoCube,
    IoBusinessOutline,
    IoLocationOutline,
    IoCalendar,
    IoBarChart
} from 'react-icons/io5';

const MaterialNoUnicoDetailModal = ({ material, open, onClose, onSuccess }) => {
    if (!material) return null;

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
                return 'blue';
            case 'consumido':
                return 'gray';
            case 'defectuoso':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <Dialog open={open} handler={onClose} size="xl">
            <DialogHeader className="flex items-center justify-between">
                <Typography variant="h5" color="blue-gray">
                    Detalle del Material
                </Typography>
                <IconButton variant="text" color="gray" onClick={onClose}>
                    <IoClose className="h-5 w-5" />
                </IconButton>
            </DialogHeader>

            <DialogBody divider className="max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                    {/* Información Principal */}
                    <Card>
                        <CardBody>
                            <div className="flex items-center justify-between mb-4">
                                <Typography variant="h6" color="blue-gray">
                                    Información Principal
                                </Typography>
                                <Chip
                                    variant="gradient"
                                    color={getEstadoColor(material.estado_display?.codigo)}
                                    value={material.estado_display?.nombre || 'Sin estado'}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Typography variant="small" color="gray" className="mb-1">
                                        Código Interno
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {material.codigo_interno}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant="small" color="gray" className="mb-1">
                                        Modelo
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {material.modelo_info?.marca} {material.modelo_info?.nombre}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant="small" color="gray" className="mb-1">
                                        Tipo de Material
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {material.tipo_material_info?.nombre}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant="small" color="gray" className="mb-1">
                                        Cantidad Disponible
                                    </Typography>
                                    <div className="flex items-center gap-2">
                                        <Typography variant="h6" color="blue-gray">
                                            {material.cantidad || 0}
                                        </Typography>
                                        <Typography variant="small" color="gray">
                                            {material.modelo_info?.unidad_medida?.simbolo || 'unidades'}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Información del Lote */}
                    <Card>
                        <CardBody>
                            <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                                <IoCube className="h-5 w-5" />
                                Información del Lote
                            </Typography>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Typography variant="small" color="gray" className="mb-1">
                                        Número de Lote
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {material.lote_info?.numero_lote}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant="small" color="gray" className="mb-1">
                                        Fecha de Recepción
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {formatDate(material.lote_info?.fecha_recepcion)}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant="small" color="gray" className="mb-1">
                                        Tipo de Ingreso
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {material.lote_info?.tipo_ingreso || 'N/A'}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant="small" color="gray" className="mb-1">
                                        Estado del Lote
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {material.lote_info?.estado || 'N/A'}
                                    </Typography>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Información del Proveedor */}
                    {material.lote_info?.proveedor_info && (
                        <Card>
                            <CardBody>
                                <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                                    <IoBusinessOutline className="h-5 w-5" />
                                    Información del Proveedor
                                </Typography>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Typography variant="small" color="gray" className="mb-1">
                                            Proveedor
                                        </Typography>
                                        <Typography color="blue-gray" className="font-medium">
                                            {material.lote_info.proveedor_info.nombre_comercial}
                                        </Typography>
                                    </div>

                                    <div>
                                        <Typography variant="small" color="gray" className="mb-1">
                                            Código
                                        </Typography>
                                        <Typography color="blue-gray" className="font-medium">
                                            {material.lote_info.proveedor_info.codigo || 'N/A'}
                                        </Typography>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Información del Almacén */}
                    <Card>
                        <CardBody>
                            <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                                <IoLocationOutline className="h-5 w-5" />
                                Ubicación Actual
                            </Typography>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Typography variant="small" color="gray" className="mb-1">
                                        Almacén
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {material.almacen_info?.nombre}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant="small" color="gray" className="mb-1">
                                        Código
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {material.almacen_info?.codigo || 'N/A'}
                                    </Typography>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Códigos y Referencias */}
                    <Card>
                        <CardBody>
                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                Códigos de Referencia
                            </Typography>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Typography variant="small" color="gray" className="mb-1">
                                        Código Item Equipo
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium font-mono">
                                        {material.codigo_item_equipo || 'N/A'}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant="small" color="gray" className="mb-1">
                                        Fecha de Registro
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {formatDate(material.created_at)}
                                    </Typography>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Observaciones */}
                    {material.observaciones && (
                        <Card>
                            <CardBody>
                                <Typography variant="h6" color="blue-gray" className="mb-4">
                                    Observaciones
                                </Typography>
                                <Typography color="blue-gray">
                                    {material.observaciones}
                                </Typography>
                            </CardBody>
                        </Card>
                    )}

                    {/* Información Adicional */}
                    <Alert color="blue">
                        <div className="flex items-start gap-3">
                            <IoInformationCircle className="h-5 w-5 flex-shrink-0 mt-1" />
                            <div>
                                <Typography variant="small" className="font-medium mb-1">
                                    Tipo de Material No Único
                                </Typography>
                                <Typography variant="small">
                                    Este material se gestiona por cantidad total disponible.
                                    Para asignar a contratos o proyectos, se descontará de la
                                    cantidad disponible según el consumo realizado.
                                </Typography>
                            </div>
                        </div>
                    </Alert>
                </div>
            </DialogBody>

            <DialogFooter>
                <Button variant="text" color="gray" onClick={onClose}>
                    Cerrar
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default MaterialNoUnicoDetailModal;