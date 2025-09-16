// src/core/almacenes/pages/laboratorio/InspeccionDetalle.jsx - NUEVO
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Input,
    Textarea,
    Switch,
    Alert,
    Select,
    Option,
    Chip,
    Progress
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
    IoTimerOutline
} from 'react-icons/io5';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../../../services/api';

const InspeccionDetalle = () => {
    const [materialesDisponibles, setMaterialesDisponibles] = useState([]);
    const [materialSeleccionado, setMaterialSeleccionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [inspeccionando, setInspeccionando] = useState(false);
    const [tiempoInicio, setTiempoInicio] = useState(null);

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
            aprobado: true,
            tecnico_revisor: '',
            observaciones_tecnico: '',
            comentarios_adicionales: '',
            fallas_detectadas: []
        }
    });

    // Observar cambios en las pruebas para determinar aprobación automática
    const watchFields = watch([
        'serie_logica_ok',
        'wifi_24_ok',
        'wifi_5_ok',
        'puerto_ethernet_ok',
        'puerto_lan_ok'
    ]);

    useEffect(() => {
        loadMaterialesEnLaboratorio();
    }, []);

    useEffect(() => {
        // Auto-determinar aprobación basada en las pruebas
        const todasPruebas = watchFields.every(field => field === true);
        setValue('aprobado', todasPruebas);

        // Auto-generar fallas detectadas
        const fallas = [];
        if (!watchFields[0]) fallas.push('SERIE_LOGICA_DEFECTUOSA');
        if (!watchFields[1]) fallas.push('WIFI_24_DEFECTUOSO');
        if (!watchFields[2]) fallas.push('WIFI_5_DEFECTUOSO');
        if (!watchFields[3]) fallas.push('PUERTO_ETHERNET_DEFECTUOSO');
        if (!watchFields[4]) fallas.push('PUERTO_LAN_DEFECTUOSO');

        setValue('fallas_detectadas', fallas);
    }, [watchFields, setValue]);

    const loadMaterialesEnLaboratorio = async () => {
        try {
            setLoading(true);
            const response = await api.get('/almacenes/laboratorio/consultas/?tipo=en_laboratorio');
            setMaterialesDisponibles(response.data.materiales || []);
        } catch (error) {
            toast.error('Error al cargar materiales en laboratorio');
        } finally {
            setLoading(false);
        }
    };

    const handleSeleccionarMaterial = (material) => {
        setMaterialSeleccionado(material);
        setTiempoInicio(new Date());

        // Generar número de informe automático
        const fechaHoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const numeroInforme = `INF-${fechaHoy}-${material.codigo_interno}`;
        setValue('numero_informe', numeroInforme);

        reset({
            numero_informe: numeroInforme,
            serie_logica_ok: true,
            wifi_24_ok: true,
            wifi_5_ok: true,
            puerto_ethernet_ok: true,
            puerto_lan_ok: true,
            aprobado: true,
            tecnico_revisor: '',
            observaciones_tecnico: '',
            comentarios_adicionales: '',
            fallas_detectadas: []
        });
    };

    const calcularTiempoInspeccion = () => {
        if (!tiempoInicio) return 0;
        return Math.round((new Date() - tiempoInicio) / (1000 * 60)); // en minutos
    };

    const handleFinalizarInspeccion = async (data) => {
        if (!materialSeleccionado) {
            toast.error('Selecciona un material para inspeccionar');
            return;
        }

        try {
            setInspeccionando(true);

            const inspeccionData = {
                material_id: materialSeleccionado.id,
                numero_informe: data.numero_informe,
                serie_logica_ok: data.serie_logica_ok,
                wifi_24_ok: data.wifi_24_ok,
                wifi_5_ok: data.wifi_5_ok,
                puerto_ethernet_ok: data.puerto_ethernet_ok,
                puerto_lan_ok: data.puerto_lan_ok,
                aprobado: data.aprobado,
                observaciones_tecnico: data.observaciones_tecnico || '',
                comentarios_adicionales: data.comentarios_adicionales || '',
                fallas_detectadas: data.fallas_detectadas || [],
                tecnico_revisor: data.tecnico_revisor || '',
                tiempo_inspeccion_minutos: calcularTiempoInspeccion()
            };

            const response = await api.post('/almacenes/laboratorio/inspeccion/', inspeccionData);

            if (response.data.success) {
                toast.success(`Inspección completada: ${response.data.message}`);

                // Limpiar formulario y recargar lista
                setMaterialSeleccionado(null);
                setTiempoInicio(null);
                reset();
                loadMaterialesEnLaboratorio();
            }
        } catch (error) {
            toast.error('Error al registrar inspección');
        } finally {
            setInspeccionando(false);
        }
    };

    const getResultadoColor = (resultado) => {
        return resultado ? 'green' : 'red';
    };

    const getResultadoIcon = (resultado) => {
        return resultado ? IoCheckmarkCircle : IoClose;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel de selección de material */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <Typography variant="h6" color="blue-gray">
                            🔍 Seleccionar Equipo
                        </Typography>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        {loading ? (
                            <div className="text-center py-4">
                                <Typography color="gray">Cargando equipos...</Typography>
                            </div>
                        ) : materialesDisponibles.length === 0 ? (
                            <div className="text-center py-8">
                                <IoFlask className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <Typography color="gray">
                                    No hay equipos en laboratorio
                                </Typography>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {materialesDisponibles.map((material) => (
                                    <Card
                                        key={material.id}
                                        className={`cursor-pointer transition-colors ${
                                            materialSeleccionado?.id === material.id 
                                                ? 'bg-blue-50 border-blue-200' 
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleSeleccionarMaterial(material)}
                                    >
                                        <CardBody className="p-3">
                                            <Typography variant="small" color="blue-gray" className="font-medium">
                                                {material.codigo_interno}
                                            </Typography>
                                            <Typography variant="small" color="gray" className="font-mono">
                                                {material.mac_address}
                                            </Typography>
                                            <div className="flex items-center justify-between mt-2">
                                                <Typography variant="small" color="gray">
                                                    {material.modelo}
                                                </Typography>
                                                <Chip
                                                    size="sm"
                                                    variant="ghost"
                                                    color={material.dias_en_laboratorio > 10 ? 'red' : 'blue'}
                                                    value={`${material.dias_en_laboratorio}d`}
                                                />
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Panel de inspección */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <Typography variant="h6" color="blue-gray">
                                🔬 Inspección de Calidad
                            </Typography>
                            {tiempoInicio && (
                                <div className="flex items-center gap-2">
                                    <IoTimerOutline className="h-4 w-4 text-blue-500" />
                                    <Typography variant="small" color="blue">
                                        {calcularTiempoInspeccion()} min
                                    </Typography>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardBody>
                        {!materialSeleccionado ? (
                            <div className="text-center py-12">
                                <IoSearch className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                <Typography variant="h6" color="gray" className="mb-2">
                                    Selecciona un equipo para inspeccionar
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Elige un equipo de la lista para comenzar la inspección
                                </Typography>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(handleFinalizarInspeccion)} className="space-y-6">
                                {/* Información del equipo */}
                                <Alert color="blue">
                                    <div className="flex items-center gap-3">
                                        <IoHardwareChip className="h-5 w-5" />
                                        <div>
                                            <Typography variant="small" className="font-medium">
                                                Inspeccionando: {materialSeleccionado.codigo_interno}
                                            </Typography>
                                            <Typography variant="small">
                                                MAC: {materialSeleccionado.mac_address} | Modelo: {materialSeleccionado.modelo}
                                            </Typography>
                                        </div>
                                    </div>
                                </Alert>

                                {/* Información del informe */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Número de Informe *"
                                        {...register('numero_informe', { required: true })}
                                        error={!!errors.numero_informe}
                                    />
                                    <Input
                                        label="Técnico Revisor"
                                        {...register('tecnico_revisor')}
                                        placeholder="Código o nombre del técnico"
                                    />
                                </div>

                                {/* Pruebas técnicas */}
                                <div>
                                    <Typography variant="h6" color="blue-gray" className="mb-4">
                                        🧪 Pruebas Técnicas
                                    </Typography>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Serie Lógica */}
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <IoHardwareChip className="h-5 w-5 text-gray-600" />
                                                <div>
                                                    <Typography variant="small" className="font-medium">
                                                        Serie Lógica
                                                    </Typography>
                                                    <Typography variant="small" color="gray">
                                                        Verificar coincidencia
                                                    </Typography>
                                                </div>
                                            </div>
                                            <Controller
                                                name="serie_logica_ok"
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

                                        {/* WiFi 2.4GHz */}
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <IoWifi className="h-5 w-5 text-gray-600" />
                                                <div>
                                                    <Typography variant="small" className="font-medium">
                                                        WiFi 2.4GHz
                                                    </Typography>
                                                    <Typography variant="small" color="gray">
                                                        Conectividad y respuesta
                                                    </Typography>
                                                </div>
                                            </div>
                                            <Controller
                                                name="wifi_24_ok"
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

                                        {/* WiFi 5GHz */}
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <IoWifi className="h-5 w-5 text-gray-600" />
                                                <div>
                                                    <Typography variant="small" className="font-medium">
                                                        WiFi 5GHz
                                                    </Typography>
                                                    <Typography variant="small" color="gray">
                                                        Conectividad y respuesta
                                                    </Typography>
                                                </div>
                                            </div>
                                            <Controller
                                                name="wifi_5_ok"
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

                                        {/* Puerto Ethernet */}
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <IoHardwareChip className="h-5 w-5 text-gray-600" />
                                                <div>
                                                    <Typography variant="small" className="font-medium">
                                                        Puerto Ethernet
                                                    </Typography>
                                                    <Typography variant="small" color="gray">
                                                        Conectividad WAN
                                                    </Typography>
                                                </div>
                                            </div>
                                            <Controller
                                                name="puerto_ethernet_ok"
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

                                        {/* Puerto LAN */}
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <IoHardwareChip className="h-5 w-5 text-gray-600" />
                                                <div>
                                                    <Typography variant="small" className="font-medium">
                                                        Puerto LAN
                                                    </Typography>
                                                    <Typography variant="small" color="gray">
                                                        Puertos locales
                                                    </Typography>
                                                </div>
                                            </div>
                                            <Controller
                                                name="puerto_lan_ok"
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
                                    </div>
                                </div>

                                {/* Resultado automático */}
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <Typography variant="h6" color="blue-gray">
                                            📋 Resultado de la Inspección
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
                                        El resultado se determina automáticamente según las pruebas realizadas
                                    </Typography>
                                </div>

                                {/* Observaciones */}
                                <div className="space-y-4">
                                    <Textarea
                                        label="Observaciones del Técnico"
                                        {...register('observaciones_tecnico')}
                                        rows={3}
                                        placeholder="Detalles de las pruebas realizadas..."
                                    />
                                    <Textarea
                                        label="Comentarios Adicionales"
                                        {...register('comentarios_adicionales')}
                                        rows={2}
                                        placeholder="Información adicional relevante..."
                                    />
                                </div>

                                {/* Botones de acción */}
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outlined"
                                        color="gray"
                                        onClick={() => {
                                            setMaterialSeleccionado(null);
                                            setTiempoInicio(null);
                                            reset();
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="green"
                                        loading={inspeccionando}
                                        className="flex items-center gap-2"
                                    >
                                        <IoSave className="h-4 w-4" />
                                        Finalizar Inspección
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

export default InspeccionDetalle;