// ======================================================
// src/core/almacenes/pages/almacenes/AlmacenDetailDialog.jsx
// ======================================================

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
    IoHomeOutline,
    IoBusinessOutline,
    IoLocationOutline,
    IoPersonOutline,
    IoArchiveOutline,
    IoTimeOutline
} from 'react-icons/io5';
import almacenesService from '../../services/almacenesService';

const AlmacenDetailDialog = ({ open, onClose, almacen }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [estadisticas, setEstadisticas] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [error, setError] = useState(null);

    // Cargar estadísticas cuando se abre el diálogo
    useEffect(() => {
        if (open && almacen?.id) {
            loadEstadisticas();
        }
    }, [open, almacen?.id]);

    const loadEstadisticas = async () => {
        setLoadingStats(true);
        setError(null);

        try {
            const result = await almacenesService.getAlmacenEstadisticas(almacen.id);
            if (result.success) {
                setEstadisticas(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar estadísticas');
        } finally {
            setLoadingStats(false);
        }
    };

    if (!almacen) return null;

    const getTipoIcon = (tipoInfo) => {
        switch (tipoInfo?.codigo) {
            case 'PRINCIPAL':
                return <IoHomeOutline className="h-5 w-5 text-blue-500" />;
            case 'REGIONAL':
                return <IoBusinessOutline className="h-5 w-5 text-green-500" />;
            case 'TEMPORAL':
                return <IoLocationOutline className="h-5 w-5 text-orange-500" />;
            default:
                return <IoBusinessOutline className="h-5 w-5 text-gray-500" />;
        }
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

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const tabsData = [
        {
            label: "Información",
            value: "info",
            icon: IoHomeOutline,
        },
        {
            label: "Inventario",
            value: "inventario",
            icon: IoArchiveOutline,
        },
        {
            label: "Estadísticas",
            value: "estadisticas",
            icon: IoTimeOutline,
        },
    ];

    return (
        <Dialog open={open} handler={onClose} size="xl">
            <DialogHeader className="flex items-center gap-3">
                {getTipoIcon(almacen.tipo_info)}
                <div>
                    <Typography variant="h5" color="blue-gray">
                        {almacen.nombre}
                    </Typography>
                    <Typography variant="small" color="gray">
                        Código: {almacen.codigo}
                    </Typography>
                </div>
                {almacen.es_principal && (
                    <Chip
                        variant="gradient"
                        color="blue"
                        size="sm"
                        value="Principal"
                        className="rounded-full"
                    />
                )}
            </DialogHeader>

            <DialogBody className="max-h-[70vh] overflow-y-auto">
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <TabsHeader>
                        {tabsData.map(({ label, value, icon }) => (
                            <Tab key={value} value={value}>
                                <div className="flex items-center gap-2">
                                    {React.createElement(icon, { className: "w-5 h-5" })}
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
                                                    Código:
                                                </Typography>
                                                <Typography variant="small" color="blue-gray" className="font-medium">
                                                    {almacen.codigo}
                                                </Typography>
                                            </div>

                                            <div className="flex justify-between">
                                                <Typography variant="small" color="gray">
                                                    Tipo:
                                                </Typography>
                                                <div className="flex items-center gap-2">
                                                    {getTipoIcon(almacen.tipo_info)}
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {almacen.tipo_info?.nombre || 'Sin tipo'}
                                                    </Typography>
                                                </div>
                                            </div>

                                            <div className="flex justify-between">
                                                <Typography variant="small" color="gray">
                                                    Ciudad:
                                                </Typography>
                                                <Typography variant="small" color="blue-gray" className="font-medium">
                                                    {almacen.ciudad}
                                                </Typography>
                                            </div>

                                            <div className="flex justify-between">
                                                <Typography variant="small" color="gray">
                                                    Estado:
                                                </Typography>
                                                {getEstadoChip(almacen.activo)}
                                            </div>

                                            <div className="flex justify-between">
                                                <Typography variant="small" color="gray">
                                                    Creado:
                                                </Typography>
                                                <Typography variant="small" color="blue-gray" className="font-medium">
                                                    {formatFecha(almacen.created_at)}
                                                </Typography>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Encargado */}
                                <Card>
                                    <CardBody>
                                        <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                                            <IoPersonOutline className="h-5 w-5" />
                                            Encargado
                                        </Typography>

                                        {almacen.encargado_info ? (
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <Typography variant="small" color="gray">
                                                        Nombre:
                                                    </Typography>
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {almacen.encargado_info.nombre_completo}
                                                    </Typography>
                                                </div>

                                                <div className="flex justify-between">
                                                    <Typography variant="small" color="gray">
                                                        Código COTEL:
                                                    </Typography>
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {almacen.encargado_info.codigo_cotel}
                                                    </Typography>
                                                </div>

                                                {almacen.encargado_info.email && (
                                                    <div className="flex justify-between">
                                                        <Typography variant="small" color="gray">
                                                            Email:
                                                        </Typography>
                                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                                            {almacen.encargado_info.email}
                                                        </Typography>
                                                    </div>
                                                )}

                                                {almacen.encargado_info.telefono && (
                                                    <div className="flex justify-between">
                                                        <Typography variant="small" color="gray">
                                                            Teléfono:
                                                        </Typography>
                                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                                            {almacen.encargado_info.telefono}
                                                        </Typography>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Typography variant="small" color="gray" className="text-center py-4">
                                                No hay encargado asignado
                                            </Typography>
                                        )}
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Dirección y Observaciones */}
                            {(almacen.direccion || almacen.observaciones) && (
                                <div className="mt-4 space-y-4">
                                    {almacen.direccion && (
                                        <Card>
                                            <CardBody>
                                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                                    Dirección
                                                </Typography>
                                                <Typography variant="small" color="gray">
                                                    {almacen.direccion}
                                                </Typography>
                                            </CardBody>
                                        </Card>
                                    )}

                                    {almacen.observaciones && (
                                        <Card>
                                            <CardBody>
                                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                                    Observaciones
                                                </Typography>
                                                <Typography variant="small" color="gray">
                                                    {almacen.observaciones}
                                                </Typography>
                                            </CardBody>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </TabPanel>

                        {/* Tab Inventario */}
                        <TabPanel value="inventario" className="p-0 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardBody className="text-center">
                                        <Typography variant="h3" color="blue-gray" className="mb-2">
                                            {almacen.total_materiales || 0}
                                        </Typography>
                                        <Typography variant="small" color="gray">
                                            Total Materiales
                                        </Typography>
                                    </CardBody>
                                </Card>

                                <Card>
                                    <CardBody className="text-center">
                                        <Typography variant="h3" color="green" className="mb-2">
                                            {almacen.materiales_disponibles || 0}
                                        </Typography>
                                        <Typography variant="small" color="gray">
                                            Disponibles
                                        </Typography>
                                    </CardBody>
                                </Card>

                                <Card>
                                    <CardBody className="text-center">
                                        <Typography variant="h3" color="orange" className="mb-2">
                                            {(almacen.total_materiales || 0) - (almacen.materiales_disponibles || 0)}
                                        </Typography>
                                        <Typography variant="small" color="gray">
                                            No Disponibles
                                        </Typography>
                                    </CardBody>
                                </Card>
                            </div>
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
                                <div className="space-y-4">
                                    <Typography variant="h6" color="blue-gray">
                                        Estadísticas Detalladas
                                    </Typography>
                                    <Card>
                                        <CardBody>
                                            <Typography variant="small" color="gray">
                                                Las estadísticas detalladas se cargarán aquí
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

export default AlmacenDetailDialog;