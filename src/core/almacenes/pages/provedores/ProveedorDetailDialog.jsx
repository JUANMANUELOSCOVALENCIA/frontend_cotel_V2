// src/core/almacenes/pages/proveedores/ProveedorDetailDialog.jsx
import React, { useState, useEffect } from 'react';
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
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
    Spinner,
    Alert
} from '@material-tailwind/react';
import {
    IoClose,
    IoBusinessOutline,
    IoPersonOutline,
    IoMailOutline,
    IoCallOutline,
    IoCalendarOutline,
    IoDocumentTextOutline,
    IoStatsChartOutline,
    IoPencilOutline
} from 'react-icons/io5';
import almacenesService from '../../services/almacenesService';

const ProveedorDetailDialog = ({ open, proveedor, onClose, onEdit }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [estadisticas, setEstadisticas] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [error, setError] = useState(null);

    // Cargar estadísticas cuando se abre el diálogo
    useEffect(() => {
        if (open && proveedor?.id) {
            loadEstadisticas();
        }
    }, [open, proveedor?.id]);

    const loadEstadisticas = async () => {
        setLoadingStats(true);
        setError(null);

        try {
            // Aquí puedes agregar una llamada al backend para obtener estadísticas
            // const result = await almacenesService.getProveedorEstadisticas(proveedor.id);
            // if (result.success) {
            //     setEstadisticas(result.data);
            // }

            // Por ahora, estadísticas simuladas
            setEstadisticas({
                total_lotes: 5,
                lotes_activos: 2,
                total_materiales: 150,
                ultimo_lote: '2025-09-01'
            });
        } catch (err) {
            setError('Error al cargar estadísticas');
        } finally {
            setLoadingStats(false);
        }
    };

    if (!proveedor) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoChip = (activo) => {
        return (
            <Chip
                variant="ghost"
                color={activo ? "green" : "red"}
                size="sm"
                value={activo ? "Activo" : "Inactivo"}
                icon={
                    <span
                        className={`mx-auto mt-1 block h-2 w-2 rounded-full ${
                            activo ? 'bg-green-900' : 'bg-red-900'
                        } content-['']`}
                    />
                }
            />
        );
    };

    const tabsData = [
        {
            label: "Información",
            value: "info",
            icon: IoDocumentTextOutline,
        },
        {
            label: "Estadísticas",
            value: "estadisticas",
            icon: IoStatsChartOutline,
        },
    ];

    return (
        <Dialog open={open} handler={onClose} size="xl">
            <DialogHeader className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <IoBusinessOutline className="h-6 w-6 text-blue-500" />
                    <div>
                        <Typography variant="h5" color="blue-gray">
                            {proveedor.nombre_comercial}
                        </Typography>
                        {proveedor.codigo && (
                            <Typography variant="small" color="gray">
                                Código: {proveedor.codigo}
                            </Typography>
                        )}
                    </div>
                    {getEstadoChip(proveedor.activo)}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="text" color="gray" onClick={onClose} className="p-2">
                        <IoClose className="h-5 w-5" />
                    </Button>
                </div>
            </DialogHeader>

            <DialogBody className="max-h-[70vh] overflow-y-auto">
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <TabsHeader>
                        {tabsData.map(({ label, value, icon: Icon }) => (
                            <Tab key={value} value={value}>
                                <div className="flex items-center gap-2">
                                    <Icon className="w-5 h-5" />
                                    {label}
                                </div>
                            </Tab>
                        ))}
                    </TabsHeader>

                    <TabsBody>
                        {/* Tab Información */}
                        <TabPanel value="info" className="p-0 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Información General */}
                                <Card>
                                    <CardBody>
                                        <Typography variant="h6" color="blue-gray" className="mb-4">
                                            Información General
                                        </Typography>

                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <Typography variant="small" color="gray">
                                                    Nombre Comercial:
                                                </Typography>
                                                <Typography variant="small" color="blue-gray" className="font-medium">
                                                    {proveedor.nombre_comercial}
                                                </Typography>
                                            </div>

                                            {proveedor.razon_social && (
                                                <div className="flex justify-between">
                                                    <Typography variant="small" color="gray">
                                                        Razón Social:
                                                    </Typography>
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {proveedor.razon_social}
                                                    </Typography>
                                                </div>
                                            )}

                                            {proveedor.codigo && (
                                                <div className="flex justify-between">
                                                    <Typography variant="small" color="gray">
                                                        Código:
                                                    </Typography>
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {proveedor.codigo}
                                                    </Typography>
                                                </div>
                                            )}

                                            <div className="flex justify-between">
                                                <Typography variant="small" color="gray">
                                                    Estado:
                                                </Typography>
                                                {getEstadoChip(proveedor.activo)}
                                            </div>

                                            <div className="flex justify-between">
                                                <Typography variant="small" color="gray">
                                                    Registrado:
                                                </Typography>
                                                <Typography variant="small" color="blue-gray" className="font-medium">
                                                    {formatDate(proveedor.created_at)}
                                                </Typography>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Información de Contacto */}
                                <Card>
                                    <CardBody>
                                        <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                                            <IoPersonOutline className="h-5 w-5" />
                                            Información de Contacto
                                        </Typography>

                                        <div className="space-y-3">
                                            {proveedor.contacto_principal && (
                                                <div className="flex justify-between">
                                                    <Typography variant="small" color="gray">
                                                        Contacto Principal:
                                                    </Typography>
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {proveedor.contacto_principal}
                                                    </Typography>
                                                </div>
                                            )}

                                            {proveedor.telefono && (
                                                <div className="flex items-center gap-2">
                                                    <IoCallOutline className="h-4 w-4 text-blue-500" />
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {proveedor.telefono}
                                                    </Typography>
                                                </div>
                                            )}

                                            {proveedor.email && (
                                                <div className="flex items-center gap-2">
                                                    <IoMailOutline className="h-4 w-4 text-blue-500" />
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {proveedor.email}
                                                    </Typography>
                                                </div>
                                            )}

                                            {!proveedor.contacto_principal && !proveedor.telefono && !proveedor.email && (
                                                <Typography variant="small" color="gray" className="text-center py-4">
                                                    No hay información de contacto disponible
                                                </Typography>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Auditoría */}
                            <Card className="mt-4">
                                <CardBody>
                                    <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                                        <IoCalendarOutline className="h-5 w-5" />
                                        Información de Auditoría
                                    </Typography>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Typography variant="small" color="gray">
                                                Fecha de Creación:
                                            </Typography>
                                            <Typography variant="small" color="blue-gray" className="font-medium">
                                                {formatDate(proveedor.created_at)}
                                            </Typography>
                                        </div>

                                        <div>
                                            <Typography variant="small" color="gray">
                                                Última Actualización:
                                            </Typography>
                                            <Typography variant="small" color="blue-gray" className="font-medium">
                                                {formatDate(proveedor.updated_at)}
                                            </Typography>
                                        </div>

                                        {proveedor.created_by_nombre && (
                                            <div className="md:col-span-2">
                                                <Typography variant="small" color="gray">
                                                    Creado por:
                                                </Typography>
                                                <Typography variant="small" color="blue-gray" className="font-medium">
                                                    {proveedor.created_by_nombre}
                                                </Typography>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </TabPanel>

                        {/* Tab Estadísticas */}
                        <TabPanel value="estadisticas" className="p-0 mt-4">
                            {loadingStats ? (
                                <div className="flex justify-center items-center h-32">
                                    <Spinner className="h-8 w-8" />
                                </div>
                            ) : error ? (
                                <Alert color="red">
                                    {error}
                                </Alert>
                            ) : estadisticas ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Card>
                                        <CardBody className="text-center">
                                            <Typography variant="h3" color="blue-gray" className="mb-2">
                                                {estadisticas.total_lotes}
                                            </Typography>
                                            <Typography variant="small" color="gray">
                                                Total Lotes
                                            </Typography>
                                        </CardBody>
                                    </Card>

                                    <Card>
                                        <CardBody className="text-center">
                                            <Typography variant="h3" color="green" className="mb-2">
                                                {estadisticas.lotes_activos}
                                            </Typography>
                                            <Typography variant="small" color="gray">
                                                Lotes Activos
                                            </Typography>
                                        </CardBody>
                                    </Card>

                                    <Card>
                                        <CardBody className="text-center">
                                            <Typography variant="h3" color="blue" className="mb-2">
                                                {estadisticas.total_materiales}
                                            </Typography>
                                            <Typography variant="small" color="gray">
                                                Total Materiales
                                            </Typography>
                                        </CardBody>
                                    </Card>

                                    <Card>
                                        <CardBody className="text-center">
                                            <Typography variant="small" color="gray" className="mb-2">
                                                Último Lote
                                            </Typography>
                                            <Typography variant="small" color="blue-gray" className="font-medium">
                                                {estadisticas.ultimo_lote}
                                            </Typography>
                                        </CardBody>
                                    </Card>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Typography variant="small" color="gray">
                                        No hay estadísticas disponibles
                                    </Typography>
                                </div>
                            )}
                        </TabPanel>
                    </TabsBody>
                </Tabs>
            </DialogBody>

            <DialogFooter>
                <Button variant="text" color="gray" onClick={onClose}>
                    Cerrar
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default ProveedorDetailDialog;