// src/core/almacenes/pages/laboratorio/InspeccionMasiva.jsx - NUEVO
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Input,
    Textarea,
    Switch,
    Alert,
    Chip,
    Checkbox,
    IconButton,
    Tooltip
} from '@material-tailwind/react';
import {
    IoCheckmarkCircle,
    IoClose,
    IoWarning,
    IoSearch,
    IoSave,
    IoFlask,
    IoWifi,
    IoHardwareChip,
    IoPersonCircle,
    IoRefresh,
    IoTv,
    IoCall,
    IoExtensionPuzzle,
    IoCheckbox,
    IoSquare,
    IoTrash,
    IoSpeedometer
} from 'react-icons/io5';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLaboratorio } from '../../hooks/useLaboratorio';
import { useAuth } from '../../../auth/context/AuthContext';

const InspeccionMasiva = () => {
    const { user } = useAuth();
    const [materialesDisponibles, setMaterialesDisponibles] = useState([]);
    const [materialesSeleccionados, setMaterialesSeleccionados] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [todosMarcados, setTodosMarcados] = useState(false);

    const {
        loading,
        error,
        getMaterialesPorTipo,
        registrarInspeccionMasiva,
        clearError
    } = useLaboratorio();

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        defaultValues: {
            serie_logica_ok: true,
            wifi_24_ok: true,
            wifi_5_ok: true,
            puerto_ethernet_ok: true,
            puerto_lan_ok: true,
            puerto_catv_ok: true,
            puerto_telefonia_rf_ok: true,
            otros_ok: true,
            aprobado: true,
            tecnico_revisor: user?.codigocotel || '',
            observaciones_tecnico: '',
            comentarios_adicionales: '',
            fallas_detectadas: [],
            tiempo_inspeccion_minutos: 5
        }
    });

    const watchFields = watch([
        'serie_logica_ok',
        'wifi_24_ok',
        'wifi_5_ok',
        'puerto_ethernet_ok',
        'puerto_lan_ok',
        'puerto_catv_ok',
        'puerto_telefonia_rf_ok',
        'otros_ok'
    ]);

    useEffect(() => {
        loadMaterialesEnLaboratorio();
    }, []);

    useEffect(() => {
        const todasPruebas = watchFields.every(field => field === true);
        setValue('aprobado', todasPruebas);

        const fallas = [];
        if (!watchFields[0]) fallas.push('SERIE_LOGICA_DEFECTUOSA');
        if (!watchFields[1]) fallas.push('WIFI_24_DEFECTUOSO');
        if (!watchFields[2]) fallas.push('WIFI_5_DEFECTUOSO');
        if (!watchFields[3]) fallas.push('PUERTO_ETHERNET_DEFECTUOSO');
        if (!watchFields[4]) fallas.push('PUERTO_LAN_DEFECTUOSO');
        if (!watchFields[5]) fallas.push('PUERTO_CATV_DEFECTUOSO');
        if (!watchFields[6]) fallas.push('PUERTO_TELEFONIA_RF_DEFECTUOSO');
        if (!watchFields[7]) fallas.push('OTROS_DEFECTUOSOS');

        setValue('fallas_detectadas', fallas);
    }, [watchFields, setValue]);

    const loadMaterialesEnLaboratorio = async () => {
        try {
            const result = await getMaterialesPorTipo('en_laboratorio');
            if (result.success) {
                setMaterialesDisponibles(result.data.materiales || result.data || []);
            } else {
                toast.error(result.error);
                setMaterialesDisponibles([]);
            }
        } catch (error) {
            console.error('Error al cargar materiales:', error);
            toast.error('Error al cargar materiales en laboratorio');
            setMaterialesDisponibles([]);
        }
    };

    const materialesFiltrados = materialesDisponibles.filter(material => {
        const searchLower = searchTerm.toLowerCase();
        return (
            material.codigo_interno?.toLowerCase().includes(searchLower) ||
            material.mac_address?.toLowerCase().includes(searchLower) ||
            material.gpon_serial?.toLowerCase().includes(searchLower) ||
            material.modelo?.toLowerCase().includes(searchLower)
        );
    });

    // Funciones de selección
    const handleToggleMaterial = (materialId) => {
        const nuevaSeleccion = new Set(materialesSeleccionados);
        if (nuevaSeleccion.has(materialId)) {
            nuevaSeleccion.delete(materialId);
        } else {
            nuevaSeleccion.add(materialId);
        }
        setMaterialesSeleccionados(nuevaSeleccion);

        // Actualizar estado de "todos marcados"
        setTodosMarcados(nuevaSeleccion.size === materialesFiltrados.length && materialesFiltrados.length > 0);
    };

    const handleToggleTodos = () => {
        if (todosMarcados) {
            setMaterialesSeleccionados(new Set());
            setTodosMarcados(false);
        } else {
            const todosMateriales = new Set(materialesFiltrados.map(m => m.id));
            setMaterialesSeleccionados(todosMateriales);
            setTodosMarcados(true);
        }
    };

    const handleLimpiarSeleccion = () => {
        setMaterialesSeleccionados(new Set());
        setTodosMarcados(false);
    };

    const handleInspeccionMasiva = async (data) => {
        if (materialesSeleccionados.size < 2) {
            toast.error('Selecciona al menos 2 equipos para inspección masiva');
            return;
        }

        try {
            const inspeccionData = {
                materiales_ids: Array.from(materialesSeleccionados),
                serie_logica_ok: data.serie_logica_ok,
                wifi_24_ok: data.wifi_24_ok,
                wifi_5_ok: data.wifi_5_ok,
                puerto_ethernet_ok: data.puerto_ethernet_ok,
                puerto_lan_ok: data.puerto_lan_ok,
                puerto_catv_ok: data.puerto_catv_ok,
                puerto_telefonia_rf_ok: data.puerto_telefonia_rf_ok,
                otros_ok: data.otros_ok,
                aprobado: data.aprobado,
                observaciones_tecnico: data.observaciones_tecnico || '',
                comentarios_adicionales: data.comentarios_adicionales || '',
                fallas_detectadas: data.fallas_detectadas || [],
                tecnico_revisor: user?.codigocotel || '',
                tiempo_inspeccion_minutos: data.tiempo_inspeccion_minutos || 5
            };

            console.log('📤 Enviando inspección masiva:', inspeccionData);

            const result = await registrarInspeccionMasiva(inspeccionData);

            if (result.success) {
                toast.success(`${result.data.message} - ${result.data.inspecciones_creadas} equipos procesados`);

                // Limpiar selección y recargar
                setMaterialesSeleccionados(new Set());
                setTodosMarcados(false);
                reset({
                    serie_logica_ok: true,
                    wifi_24_ok: true,
                    wifi_5_ok: true,
                    puerto_ethernet_ok: true,
                    puerto_lan_ok: true,
                    puerto_catv_ok: true,
                    puerto_telefonia_rf_ok: true,
                    otros_ok: true,
                    aprobado: true,
                    tecnico_revisor: user?.codigocotel || '',
                    observaciones_tecnico: '',
                    comentarios_adicionales: '',
                    tiempo_inspeccion_minutos: 5
                });
                loadMaterialesEnLaboratorio();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error('Error al registrar inspección masiva:', error);
            toast.error('Error al registrar inspección masiva');
        }
    };

    const pruebasTecnicas = [
        {
            key: 'serie_logica_ok',
            label: 'Serie Lógica',
            descripcion: 'Verificar coincidencia',
            icon: IoHardwareChip,
            color: 'gray'
        },
        {
            key: 'puerto_ethernet_ok',
            label: 'Puerto Ethernet',
            descripcion: 'Conectividad WAN',
            icon: IoHardwareChip,
            color: 'gray'
        },
        {
            key: 'puerto_lan_ok',
            label: 'Puerto LAN',
            descripcion: 'Puertos locales',
            icon: IoHardwareChip,
            color: 'gray'
        },
        {
            key: 'wifi_24_ok',
            label: 'WiFi 2.4GHz',
            descripcion: 'Conectividad y respuesta',
            icon: IoWifi,
            color: 'blue'
        },
        {
            key: 'wifi_5_ok',
            label: 'WiFi 5GHz',
            descripcion: 'Conectividad y respuesta',
            icon: IoWifi,
            color: 'blue'
        },
        {
            key: 'puerto_catv_ok',
            label: 'Puerto CATV',
            descripcion: 'TV por cable',
            icon: IoTv,
            color: 'purple'
        },
        {
            key: 'puerto_telefonia_rf_ok',
            label: 'Telefonía RF',
            descripcion: 'Puerto POTS/FXS',
            icon: IoCall,
            color: 'green'
        },
        {
            key: 'otros_ok',
            label: 'Otras Pruebas',
            descripcion: 'Pruebas adicionales',
            icon: IoExtensionPuzzle,
            color: 'amber'
        }
    ];


    const aplicarPreset = (preset) => {
        Object.entries(preset.valores).forEach(([key, value]) => {
            setValue(key, value);
        });
        toast.success(`Preset aplicado: ${preset.nombre}`);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Error handling */}
            {error && (
                <div className="lg:col-span-3">
                    <Alert color="red" className="border border-red-200">
                        <div className="flex items-start gap-3">
                            <IoWarning className="h-5 w-5 mt-0.5" />
                            <div>
                                <Typography variant="small" className="font-bold text-red-800 mb-1">
                                    Error en inspección masiva
                                </Typography>
                                <Typography variant="small" className="text-red-700">
                                    {error}
                                </Typography>
                                <Button size="sm" color="red" variant="outlined" onClick={clearError} className="mt-2">
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </Alert>
                </div>
            )}

            {/* Panel de selección de materiales */}
            <div className="lg:col-span-1">
                <Card>
                    <CardBody className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <Typography variant="h6" color="blue-gray">
                                Seleccionar Equipos
                            </Typography>
                            <Button
                                size="sm"
                                variant="outlined"
                                color="blue"
                                onClick={loadMaterialesEnLaboratorio}
                                disabled={loading}
                                className="flex items-center gap-1"
                            >
                                <IoRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>

                        {/* Controles de selección */}
                        <div className="space-y-3">
                            <Input
                                label="Buscar equipos"
                                icon={<IoSearch className="h-5 w-5" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <div className="flex items-center justify-between">
                                <Chip
                                    variant="ghost"
                                    color="blue"
                                    value={`${materialesSeleccionados.size} de ${materialesFiltrados.length} seleccionados`}
                                    className="text-xs"
                                />
                                <div className="flex gap-1">
                                    <Tooltip content="Seleccionar todos">
                                        <IconButton
                                            size="sm"
                                            variant="outlined"
                                            color="blue"
                                            onClick={handleToggleTodos}
                                        >
                                            {todosMarcados ? <IoCheckbox className="h-4 w-4" /> : <IoSquare className="h-4 w-4" />}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip content="Limpiar selección">
                                        <IconButton
                                            size="sm"
                                            variant="outlined"
                                            color="red"
                                            onClick={handleLimpiarSeleccion}
                                            disabled={materialesSeleccionados.size === 0}
                                        >
                                            <IoTrash className="h-4 w-4" />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        {/* Lista de materiales con checkbox */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {materialesFiltrados.map((material) => (
                                <Card
                                    key={material.id}
                                    className={`cursor-pointer transition-colors border ${
                                        materialesSeleccionados.has(material.id)
                                            ? 'bg-blue-50 border-blue-200 border-2'
                                            : 'hover:bg-gray-50 border-gray-200'
                                    }`}
                                    onClick={() => handleToggleMaterial(material.id)}
                                >
                                    <CardBody className="p-3">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={materialesSeleccionados.has(material.id)}
                                                onChange={() => handleToggleMaterial(material.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                                                    {material.codigo_interno}
                                                </Typography>
                                                <div className="space-y-1">
                                                    <Typography variant="small" color="gray" className="font-mono text-xs">
                                                        MAC: {material.mac_address}
                                                    </Typography>
                                                    <Typography variant="small" color="gray" className="font-mono text-xs">
                                                        GPON: {material.gpon_serial}
                                                    </Typography>
                                                    <Typography variant="small" color="gray" className="text-xs">
                                                        {material.modelo}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>

                        {materialesFiltrados.length === 0 && (
                            <div className="text-center py-8">
                                <IoFlask className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <Typography color="gray">
                                    No hay equipos en laboratorio
                                </Typography>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Panel de inspección masiva */}
            <div className="lg:col-span-2">
                <Card>
                    <CardBody>
                        <div className="mb-6">
                            <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
                                <IoSpeedometer className="h-5 w-5" />
                                Inspección Masiva
                            </Typography>
                            <Typography variant="small" color="gray">
                                Inspeccionar múltiples equipos con el mismo resultado
                            </Typography>
                        </div>

                        {materialesSeleccionados.size === 0 ? (
                            <div className="text-center py-12">
                                <IoSearch className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                <Typography variant="h6" color="gray" className="mb-2">
                                    Selecciona equipos para inspección masiva
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Mínimo 2 equipos requeridos
                                </Typography>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(handleInspeccionMasiva)} className="space-y-6">
                                {/* Información de la inspección masiva */}
                                <Alert color="green">
                                    <div className="flex items-center gap-3">
                                        <IoSpeedometer className="h-5 w-5" />
                                        <div>
                                            <Typography variant="small" className="font-medium">
                                                Inspección Masiva: {materialesSeleccionados.size} equipos
                                            </Typography>
                                            <Typography variant="small">
                                                Todos tendrán el mismo resultado de inspección
                                            </Typography>
                                        </div>
                                    </div>
                                </Alert>

                                {/* Pruebas técnicas */}
                                <div>
                                    <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                                        Resultado de Pruebas <Chip size="sm" value="8 pruebas" color="blue" variant="ghost" />
                                    </Typography>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pruebasTecnicas.map((prueba) => {
                                            const IconComponent = prueba.icon;
                                            return (
                                                <div key={prueba.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg bg-${prueba.color}-50`}>
                                                            <IconComponent className={`h-5 w-5 text-${prueba.color}-600`} />
                                                        </div>
                                                        <div>
                                                            <Typography variant="small" className="font-medium">
                                                                {prueba.label}
                                                            </Typography>
                                                            <Typography variant="small" color="gray">
                                                                {prueba.descripcion}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                    <Controller
                                                        name={prueba.key}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Switch
                                                                checked={field.value}
                                                                onChange={field.onChange}
                                                                color={field.value ? 'green' : 'red'}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Resultado automático */}
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <Typography variant="h6" color="blue-gray">
                                            Resultado General
                                        </Typography>
                                        <Controller
                                            name="aprobado"
                                            control={control}
                                            render={({ field }) => (
                                                <Chip
                                                    size="lg"
                                                    variant="gradient"
                                                    color={field.value ? 'green' : 'red'}
                                                    value={field.value ? 'APROBADO' : 'RECHAZADO'}
                                                    icon={field.value ?
                                                        <IoCheckmarkCircle className="h-4 w-4" /> :
                                                        <IoClose className="h-4 w-4" />
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    <Typography variant="small" color="gray" className="mt-2">
                                        Este resultado se aplicará a todos los equipos seleccionados
                                    </Typography>
                                </div>

                                {/* Observaciones */}
                                <div className="space-y-4">
                                    <Textarea
                                        label="Observaciones del Técnico"
                                        {...register('observaciones_tecnico')}
                                        rows={3}
                                    />
                                    <Textarea
                                        label="Comentarios Adicionales"
                                        {...register('comentarios_adicionales')}
                                        rows={2}
                                    />
                                </div>

                                {/* Técnico revisor */}
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <IoPersonCircle className="h-6 w-6 text-blue-600" />
                                    <div className="flex-1">
                                        <Typography variant="small" color="blue-gray" className="font-bold">
                                            Técnico: {user?.codigocotel || 'Sin código'} - {user?.nombres || 'Usuario actual'}
                                        </Typography>
                                        <Typography variant="small" color="gray" className="text-xs">
                                            Responsable de la inspección masiva
                                        </Typography>
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outlined"
                                        color="gray"
                                        onClick={handleLimpiarSeleccion}
                                    >
                                        Limpiar Selección
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="green"
                                        loading={loading}
                                        className="flex items-center gap-2"
                                        disabled={materialesSeleccionados.size < 2}
                                    >
                                        <IoSave className="h-4 w-4" />
                                        Procesar {materialesSeleccionados.size} Equipos
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default InspeccionMasiva;