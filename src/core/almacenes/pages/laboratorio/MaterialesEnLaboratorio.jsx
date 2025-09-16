// src/core/almacenes/pages/laboratorio/MaterialesEnLaboratorio.jsx - NUEVO
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Input,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    Spinner
} from '@material-tailwind/react';
import {
    IoSearch,
    IoFlask,
    IoCheckmarkCircle,
    IoWarning,
    IoTime,
    IoEye,
    IoPlay,
    IoRefresh,
    IoSend
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { api } from '../../../../services/api';

const MaterialesEnLaboratorio = ({ tipo = 'en_laboratorio' }) => {
    const [materiales, setMateriales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMaterials, setSelectedMaterials] = useState([]);

    useEffect(() => {
        loadMateriales();
    }, [tipo]);

    const loadMateriales = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/almacenes/laboratorio/consultas/?tipo=${tipo}`);
            setMateriales(response.data.materiales || []);
        } catch (error) {
            toast.error('Error al cargar materiales');
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarLaboratorio = async (materialId) => {
        try {
            const response = await api.post('/almacenes/laboratorio/', {
                material_id: materialId,
                accion: 'enviar'
            });

            if (response.data.success) {
                toast.success(response.data.message);
                loadMateriales();
            }
        } catch (error) {
            toast.error('Error al enviar a laboratorio');
        }
    };

    const handleEnviarMasivo = async () => {
        if (selectedMaterials.length === 0) {
            toast.warning('Selecciona al menos un material');
            return;
        }

        try {
            const response = await api.post('/almacenes/laboratorio/masivo/', {
                accion: 'enviar_pendientes'
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setSelectedMaterials([]);
                loadMateriales();
            }
        } catch (error) {
            toast.error('Error en envío masivo');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    const getAlertaColor = (dias) => {
        if (dias > 15) return 'red';
        if (dias > 10) return 'amber';
        return 'blue';
    };

    const filteredMateriales = materiales.filter(material =>
        material.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTitleAndIcon = () => {
        switch (tipo) {
            case 'pendientes_inspeccion':
                return {
                    title: '⏳ Equipos Pendientes de Inspección',
                    subtitle: 'Equipos nuevos que requieren inspección inicial',
                    icon: IoTime,
                    color: 'amber'
                };
            case 'en_laboratorio':
                return {
                    title: '🔬 Equipos en Laboratorio',
                    subtitle: 'Equipos actualmente siendo inspeccionados',
                    icon: IoFlask,
                    color: 'blue'
                };
            case 'tiempo_excesivo':
                return {
                    title: '⚠️ Equipos con Tiempo Excesivo',
                    subtitle: 'Equipos que llevan más de 15 días en laboratorio',
                    icon: IoWarning,
                    color: 'red'
                };
            default:
                return {
                    title: '📋 Lista de Equipos',
                    subtitle: '',
                    icon: IoEye,
                    color: 'gray'
                };
        }
    };

    const { title, subtitle, icon: TitleIcon, color } = getTitleAndIcon();

    if (loading) {
        return (
            <Card>
                <CardBody className="flex justify-center items-center h-32">
                    <Spinner className="h-8 w-8" />
                    <Typography color="gray" className="ml-2">
                        Cargando equipos...
                    </Typography>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header con búsqueda */}
            <Card>
                <CardHeader className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TitleIcon className={`h-6 w-6 text-${color}-500`} />
                        <div>
                            <Typography variant="h6" color="blue-gray">
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography variant="small" color="gray">
                                    {subtitle}
                                </Typography>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {tipo === 'pendientes_inspeccion' && (
                            <Button
                                size="sm"
                                color="green"
                                className="flex items-center gap-2"
                                onClick={handleEnviarMasivo}
                                disabled={selectedMaterials.length === 0}
                            >
                                <IoSend className="h-4 w-4" />
                                Enviar Todos a Lab
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="outlined"
                            color="blue"
                            className="flex items-center gap-2"
                            onClick={loadMateriales}
                        >
                            <IoRefresh className="h-4 w-4" />
                            Actualizar
                        </Button>
                    </div>
                </CardHeader>

                <CardBody>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                            <Input
                                label="Buscar equipos..."
                                icon={<IoSearch className="h-5 w-5" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Typography variant="small" color="gray">
                            {filteredMateriales.length} equipos encontrados
                        </Typography>
                    </div>

                    {/* Alertas según el tipo */}
                    {tipo === 'tiempo_excesivo' && filteredMateriales.length > 0 && (
                        <Alert color="red" className="mb-4">
                            <IoWarning className="h-5 w-5" />
                            <strong>Atención:</strong> Estos equipos llevan más de 15 días en laboratorio.
                            Revisar para agilizar el proceso.
                        </Alert>
                    )}

                    {tipo === 'pendientes_inspeccion' && filteredMateriales.length > 0 && (
                        <Alert color="blue" className="mb-4">
                            <IoTime className="h-5 w-5" />
                            <strong>Inspección requerida:</strong> Estos equipos nuevos requieren inspección inicial
                            antes de estar disponibles para asignación.
                        </Alert>
                    )}
                </CardBody>
            </Card>

            {/* Lista de materiales */}
            <Card>
                <CardBody className="px-0">
                    {filteredMateriales.length === 0 ? (
                        <div className="text-center py-8">
                            <TitleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <Typography color="gray" className="mb-2">
                                No hay equipos en esta categoría
                            </Typography>
                            <Typography variant="small" color="gray">
                                {tipo === 'pendientes_inspeccion'
                                    ? 'Todos los equipos nuevos han sido enviados a laboratorio'
                                    : 'No hay equipos actualmente en laboratorio'
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
                                            Equipo
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Modelo
                                        </Typography>
                                    </th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Lote
                                        </Typography>
                                    </th>
                                    {tipo === 'en_laboratorio' && (
                                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                                Días en Lab
                                            </Typography>
                                        </th>
                                    )}
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                            Almacén
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
                                {filteredMateriales.map((material) => (
                                    <tr key={material.id} className="even:bg-blue-gray-50/50">
                                        <td className="p-4">
                                            <div>
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {material.codigo_interno}
                                                </Typography>
                                                <Typography variant="small" color="gray" className="opacity-70 font-mono">
                                                    {material.mac_address}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {material.modelo}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {material.lote}
                                            </Typography>
                                        </td>
                                        {tipo === 'en_laboratorio' && (
                                            <td className="p-4">
                                                <Chip
                                                    size="sm"
                                                    variant="ghost"
                                                    color={getAlertaColor(material.dias_en_laboratorio)}
                                                    value={`${material.dias_en_laboratorio} días`}
                                                />
                                            </td>
                                        )}
                                        <td className="p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {material.almacen}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Tooltip content="Ver detalles">
                                                    <IconButton variant="text" color="blue" size="sm">
                                                        <IoEye className="h-4 w-4" />
                                                    </IconButton>
                                                </Tooltip>

                                                {tipo === 'pendientes_inspeccion' && (
                                                    <Tooltip content="Enviar a laboratorio">
                                                        <IconButton
                                                            variant="text"
                                                            color="green"
                                                            size="sm"
                                                            onClick={() => handleEnviarLaboratorio(material.id)}
                                                        >
                                                            <IoPlay className="h-4 w-4" />
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
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default MaterialesEnLaboratorio;