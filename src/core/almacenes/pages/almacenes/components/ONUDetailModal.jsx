import React, { useState } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Button,
    Chip,
    Card,
    CardBody,
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
    Select,
    Option,
    IconButton,
    Tooltip,
} from '@material-tailwind/react';
import {
    IoClose,
    IoCopy,
    IoLocationOutline,
    IoCalendarOutline,
    IoSwapHorizontal,
    IoDocument,
    IoTime,
    IoSettings,
} from 'react-icons/io5';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

const ONUDetailModal = ({ open, onClose, material, opciones, onChangeState, canEdit }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [showChangeState, setShowChangeState] = useState(false);
    const [selectedNewState, setSelectedNewState] = useState('');
    const [changingState, setChangingState] = useState(false);

    if (!material) return null;

    const getEstadoColor = (estado) => {
        if (!estado) return 'gray';

        const colorMap = {
            'NUEVO': 'gray',
            'DISPONIBLE': 'green',
            'RESERVADO': 'amber',
            'ASIGNADO': 'blue',
            'INSTALADO': 'purple',
            'EN_LABORATORIO': 'orange',
            'DEFECTUOSO': 'red',
            'DEVUELTO_PROVEEDOR': 'gray',
            'REINGRESADO': 'cyan',
            'DADO_DE_BAJA': 'black'
        };

        return colorMap[estado.nombre] || 'gray';
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copiado al portapapeles`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No definido';
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    };

    const handleChangeState = async () => {
        if (!selectedNewState) {
            toast.error('Selecciona un nuevo estado');
            return;
        }

        setChangingState(true);
        try {
            const result = await onChangeState(material.id, selectedNewState);
            if (result.success) {
                setShowChangeState(false);
                setSelectedNewState('');
                // El modal se actualizará automáticamente con los nuevos datos
            }
        } catch (error) {
            toast.error('Error al cambiar estado');
        } finally {
            setChangingState(false);
        }
    };

    const tabsData = [
        {
            label: "General",
            value: "general",
            icon: IoDocument,
        },
        {
            label: "Historial",
            value: "historial",
            icon: IoTime,
        },
        {
            label: "Técnico",
            value: "tecnico",
            icon: IoSettings,
        },
    ];

    return (
        <Dialog open={open} handler={onClose} size="xl" className="bg-transparent">
            <Card className="w-full max-w-6xl mx-auto">
                <DialogHeader className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Typography variant="h4" color="blue-gray">
                            Detalle ONU
                        </Typography>
                        <Chip
                            size="lg"
                            value={material.estado_display?.nombre || 'Sin estado'}
                            color={getEstadoColor(material.estado_display)}
                        />
                    </div>
                    <IconButton variant="text" onClick={onClose}>
                        <IoClose className="h-5 w-5" />
                    </IconButton>
                </DialogHeader>

                <DialogBody className="overflow-y-auto max-h-[70vh]">
                    <Tabs value={activeTab} onChange={setActiveTab}>
                        <TabsHeader>
                            {tabsData.map(({ label, value, icon: Icon }) => (
                                <Tab key={value} value={value}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </div>
                                </Tab>
                            ))}
                        </TabsHeader>

                        <TabsBody>
                            {/* Tab General */}
                            <TabPanel value="general" className="p-0 pt-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Información básica */}
                                    <Card>
                                        <CardBody>
                                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                                Información Básica
                                            </Typography>

                                            <div className="space-y-3">
                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        Código Interno
                                                    </Typography>
                                                    <div className="flex items-center gap-2">
                                                        <Typography variant="h6" color="blue-gray">
                                                            {material.codigo_interno}
                                                        </Typography>
                                                        <Tooltip content="Copiar código">
                                                            <IconButton
                                                                size="sm"
                                                                variant="text"
                                                                onClick={() => copyToClipboard(material.codigo_interno, 'Código')}
                                                            >
                                                                <IoCopy className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        Estado Actual
                                                    </Typography>
                                                    <div className="flex items-center gap-2">
                                                        <Chip
                                                            value={material.estado_display?.nombre || 'Sin estado'}
                                                            color={getEstadoColor(material.estado_display)}
                                                        />
                                                        {canEdit && (
                                                            <Button
                                                                size="sm"
                                                                variant="text"
                                                                onClick={() => setShowChangeState(true)}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <IoSwapHorizontal className="h-4 w-4" />
                                                                Cambiar
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        Tipo de Ingreso
                                                    </Typography>
                                                    <Chip
                                                        size="sm"
                                                        value={material.es_nuevo ? 'Nuevo' : 'Reingresado'}
                                                        color={material.es_nuevo ? 'green' : 'blue'}
                                                        variant="ghost"
                                                    />
                                                </div>

                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        Código Item Equipo
                                                    </Typography>
                                                    <Typography color="blue-gray" className="font-mono">
                                                        {material.codigo_item_equipo || 'No definido'}
                                                    </Typography>
                                                </div>

                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        Cantidad
                                                    </Typography>
                                                    <Typography color="blue-gray">
                                                        {material.cantidad} unidad(es)
                                                    </Typography>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    {/* Información de conectividad */}
                                    <Card>
                                        <CardBody>
                                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                                Conectividad
                                            </Typography>

                                            <div className="space-y-3">
                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        MAC Address
                                                    </Typography>
                                                    <div className="flex items-center gap-2">
                                                        <Typography color="blue-gray" className="font-mono text-lg">
                                                            {material.mac_address}
                                                        </Typography>
                                                        <Tooltip content="Copiar MAC">
                                                            <IconButton
                                                                size="sm"
                                                                variant="text"
                                                                onClick={() => copyToClipboard(material.mac_address, 'MAC')}
                                                            >
                                                                <IoCopy className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        GPON Serial
                                                    </Typography>
                                                    <div className="flex items-center gap-2">
                                                        <Typography color="blue-gray" className="font-mono text-lg">
                                                            {material.gpon_serial}
                                                        </Typography>
                                                        <Tooltip content="Copiar GPON">
                                                            <IconButton
                                                                size="sm"
                                                                variant="text"
                                                                onClick={() => copyToClipboard(material.gpon_serial, 'GPON')}
                                                            >
                                                                <IoCopy className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        D-SN (Manufacturer Serial)
                                                    </Typography>
                                                    <div className="flex items-center gap-2">
                                                        <Typography color="blue-gray" className="font-mono text-lg">
                                                            {material.serial_manufacturer}
                                                        </Typography>
                                                        <Tooltip content="Copiar D-SN">
                                                            <IconButton
                                                                size="sm"
                                                                variant="text"
                                                                onClick={() => copyToClipboard(material.serial_manufacturer, 'D-SN')}
                                                            >
                                                                <IoCopy className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    {/* Información del modelo */}
                                    <Card>
                                        <CardBody>
                                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                                Modelo y Especificaciones
                                            </Typography>

                                            <div className="space-y-3">
                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        Marca y Modelo
                                                    </Typography>
                                                    <Typography color="blue-gray" className="text-lg">
                                                        {material.modelo_info.marca} {material.modelo_info.nombre}
                                                    </Typography>
                                                </div>

                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        Código del Modelo
                                                    </Typography>
                                                    <Typography color="blue-gray" className="font-mono">
                                                        {material.modelo_info.codigo_modelo}
                                                    </Typography>
                                                </div>

                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        Tipo de Equipo
                                                    </Typography>
                                                    <Typography color="blue-gray">
                                                        {material.modelo_info.tipo_equipo}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    {/* Información de ubicación */}
                                    <Card>
                                        <CardBody>
                                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                                Ubicación y Origen
                                            </Typography>

                                            <div className="space-y-3">
                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        Almacén Actual
                                                    </Typography>
                                                    <div className="flex items-center gap-2">
                                                        <IoLocationOutline className="h-4 w-4 text-gray-500" />
                                                        <Typography color="blue-gray">
                                                            {material.almacen_info.codigo} - {material.almacen_info.nombre}
                                                        </Typography>
                                                    </div>
                                                    <Typography variant="small" color="gray">
                                                        {material.almacen_info.ciudad}
                                                    </Typography>
                                                </div>

                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        Lote de Origen
                                                    </Typography>
                                                    <Typography color="blue-gray">
                                                        {material.lote_info.numero_lote}
                                                    </Typography>
                                                    <Typography variant="small" color="gray">
                                                        Proveedor: {material.lote_info.proveedor}
                                                    </Typography>
                                                </div>

                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        Fecha de Ingreso
                                                    </Typography>
                                                    <div className="flex items-center gap-2">
                                                        <IoCalendarOutline className="h-4 w-4 text-gray-500" />
                                                        <Typography color="blue-gray">
                                                            {formatDate(material.created_at)}
                                                        </Typography>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Typography variant="small" color="gray" className="font-medium">
                                                        Última Actualización
                                                    </Typography>
                                                    <Typography color="blue-gray">
                                                        {formatDate(material.updated_at)}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                            </TabPanel>

                            {/* Tab Historial */}
                            <TabPanel value="historial" className="p-0 pt-4">
                                <Card>
                                    <CardBody>
                                        <Typography variant="h6" color="blue-gray" className="mb-4">
                                            Historial de Movimientos
                                        </Typography>

                                        {material.historial && material.historial.length > 0 ? (
                                            <div className="space-y-4">
                                                {material.historial.map((evento, index) => (
                                                    <div key={evento.id || index} className="border-l-2 border-blue-gray-100 pl-4">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                                                {evento.motivo}
                                                            </Typography>
                                                            <Typography variant="small" color="gray">
                                                                {formatDate(evento.fecha_cambio)}
                                                            </Typography>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            {evento.estado_anterior && evento.estado_nuevo && (
                                                                <div>
                                                                    <Typography variant="small" color="gray">Estado:</Typography>
                                                                    <Typography variant="small" color="blue-gray">
                                                                        {evento.estado_anterior} → {evento.estado_nuevo}
                                                                    </Typography>
                                                                </div>
                                                            )}

                                                            {evento.almacen_anterior && evento.almacen_nuevo && (
                                                                <div>
                                                                    <Typography variant="small" color="gray">Almacén:</Typography>
                                                                    <Typography variant="small" color="blue-gray">
                                                                        {evento.almacen_anterior} → {evento.almacen_nuevo}
                                                                    </Typography>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {evento.usuario && (
                                                            <Typography variant="small" color="gray" className="mt-2">
                                                                Por: {evento.usuario}
                                                            </Typography>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <Typography color="gray" className="text-center py-8">
                                                No hay historial de movimientos disponible
                                            </Typography>
                                        )}
                                    </CardBody>
                                </Card>
                            </TabPanel>

                            {/* Tab Técnico */}
                            <TabPanel value="tecnico" className="p-0 pt-4">
                                <Card>
                                    <CardBody>
                                        <Typography variant="h6" color="blue-gray" className="mb-4">
                                            Información Técnica
                                        </Typography>

                                        {material.especificaciones_tecnicas ? (
                                            <div className="space-y-4">
                                                {Object.entries(material.especificaciones_tecnicas).map(([key, value]) => (
                                                    <div key={key} className="border-b border-gray-200 pb-2">
                                                        <Typography variant="small" color="gray" className="font-medium capitalize">
                                                            {key.replace(/_/g, ' ')}
                                                        </Typography>
                                                        <Typography color="blue-gray">
                                                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                                                        </Typography>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <Typography color="gray" className="text-center py-8">
                                                No hay especificaciones técnicas disponibles
                                            </Typography>
                                        )}

                                        {/* Información adicional */}
                                        <div className="mt-6 pt-6 border-t">
                                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                                Información Adicional
                                            </Typography>

                                            <div className="space-y-3">
                                                {material.observaciones && (
                                                    <div>
                                                        <Typography variant="small" color="gray" className="font-medium">
                                                            Observaciones
                                                        </Typography>
                                                        <Typography color="blue-gray">
                                                            {material.observaciones}
                                                        </Typography>
                                                    </div>
                                                )}

                                                {material.fecha_envio_laboratorio && (
                                                    <div>
                                                        <Typography variant="small" color="gray" className="font-medium">
                                                            Fecha Envío a Laboratorio
                                                        </Typography>
                                                        <Typography color="blue-gray">
                                                            {formatDate(material.fecha_envio_laboratorio)}
                                                        </Typography>
                                                    </div>
                                                )}

                                                {material.fecha_retorno_laboratorio && (
                                                    <div>
                                                        <Typography variant="small" color="gray" className="font-medium">
                                                            Fecha Retorno de Laboratorio
                                                        </Typography>
                                                        <Typography color="blue-gray">
                                                            {formatDate(material.fecha_retorno_laboratorio)}
                                                        </Typography>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </TabPanel>
                        </TabsBody>
                    </Tabs>
                </DialogBody>

                <DialogFooter>
                    <Button variant="text" onClick={onClose}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </Card>

            {/* Modal para cambio de estado */}
            <Dialog open={showChangeState} handler={() => setShowChangeState(false)} size="sm">
                <DialogHeader>
                    <Typography variant="h5">
                        Cambiar Estado de ONU
                    </Typography>
                </DialogHeader>
                <DialogBody>
                    <div className="space-y-4">
                        <div>
                            <Typography variant="small" color="gray" className="mb-2">
                                Estado Actual
                            </Typography>
                            <Chip
                                value={material.estado_display?.nombre || 'Sin estado'}
                                color={getEstadoColor(material.estado_display)}
                            />
                        </div>

                        <div>
                            <Typography variant="small" color="gray" className="mb-2">
                                Nuevo Estado
                            </Typography>
                            <Select
                                value={selectedNewState}
                                onChange={setSelectedNewState}
                                label="Seleccionar nuevo estado"
                            >
                                {opciones.estados_material_onu?.map((estado) => (
                                    <Option key={estado.id} value={estado.id.toString()}>
                                        {estado.nombre}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="text"
                        onClick={() => setShowChangeState(false)}
                        className="mr-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleChangeState}
                        loading={changingState}
                        disabled={!selectedNewState}
                    >
                        Cambiar Estado
                    </Button>
                </DialogFooter>
            </Dialog>
        </Dialog>
    );
};

export default ONUDetailModal;