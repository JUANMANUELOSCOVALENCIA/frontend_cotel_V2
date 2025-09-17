// src/core/almacenes/pages/laboratorio/InspeccionDetalle.jsx - USANDO API REAL
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
    IoTimerOutline,
    IoPersonCircle,
} from 'react-icons/io5';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLaboratorio } from '../../hooks/useLaboratorio';
import { useAuth } from '../../../auth/context/AuthContext';

const InspeccionDetalle = () => {
    const { user } = useAuth();
    const [materialesDisponibles, setMaterialesDisponibles] = useState([]);
    const [materialSeleccionado, setMaterialSeleccionado] = useState(null);
    const [tiempoInicio, setTiempoInicio] = useState(null);

    // ✅ Usar hook real de laboratorio
    const {
        loading,
        error,
        getMaterialesPorTipo,
        registrarInspeccion,
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
            aprobado: true,
            tecnico_revisor: user?.codigocotel || '',
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
            tecnico_revisor: user?.codigocotel || '',
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
                tecnico_revisor: user?.codigocotel || '',
                tiempo_inspeccion_minutos: calcularTiempoInspeccion()
            };

            const result = await registrarInspeccion(inspeccionData);

            if (result.success) {
                toast.success(result.data.message || 'Inspección completada correctamente');

                // Limpiar formulario y recargar lista
                setMaterialSeleccionado(null);
                setTiempoInicio(null);
                reset({
                    tecnico_revisor: user?.codigocotel || '',
                });
                loadMaterialesEnLaboratorio();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error('Error al registrar inspección:', error);
            toast.error('Error al registrar inspección');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ✅ Error handling */}
            {error && (
                <div className="lg:col-span-3">
                    <Alert color="red" className="border border-red-200">
                        <div className="flex items-start gap-3">
                            <IoWarning className="h-5 w-5 mt-0.5" />
                            <div>
                                <Typography variant="small" className="font-bold text-red-800 mb-1">
                                    Error en el laboratorio
                                </Typography>
                                <Typography variant="small" className="text-red-700">
                                    {error}
                                </Typography>
                                <Button
                                    size="sm"
                                    color="red"
                                    variant="outlined"
                                    onClick={clearError}
                                    className="mt-2"
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </Alert>
                </div>
            )}

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
                                            <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                                                {material.codigo_interno}
                                            </Typography>
                                            {/* ✅ MODIFICAR: Mostrar MAC y GPON */}
                                            <div className="space-y-1 mb-2">
                                                <Typography variant="small" color="gray" className="font-mono text-xs">
                                                    MAC: {material.mac_address}
                                                </Typography>
                                                <Typography variant="small" color="gray" className="font-mono text-xs">
                                                    GPON: {material.gpon_serial}
                                                </Typography>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <Typography variant="small" color="gray">
                                                    {material.modelo}
                                                </Typography>
                                                <Chip
                                                    size="sm"
                                                    variant="ghost"
                                                    color={material.dias_en_laboratorio > 10 ? 'red' : 'blue'}
                                                    value={`${material.dias_en_laboratorio || 0}d`}
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
                                            <div className="flex flex-col gap-1 mt-1">
                                                <Typography variant="small">
                                                    MAC: {materialSeleccionado.mac_address}
                                                </Typography>
                                                <Typography variant="small">
                                                    GPON: {materialSeleccionado.gpon_serial} | Modelo: {materialSeleccionado.modelo}
                                                </Typography>
                                            </div>
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

                                    {/* ✅ CAMPO MEJORADO: Mostrar código + nombre completo */}
                                    <div>
                                        <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                                            Técnico Revisor
                                        </Typography>
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="p-2 bg-blue-100 rounded-full">
                                                <IoPersonCircle className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <Typography variant="small" color="blue-gray" className="font-bold">
                                                    {user?.codigocotel || 'Sin código'} - {user?.nombres || 'Usuario actual'}
                                                </Typography>
                                                <Typography variant="small" color="gray" className="text-xs">
                                                    Técnico responsable de la inspección
                                                </Typography>
                                            </div>
                                            <div className="bg-green-100 px-2 py-1 rounded-full">
                                                <Typography variant="small" color="green" className="text-xs font-medium">
                                                    Auto-asignado
                                                </Typography>
                                            </div>
                                        </div>
                                        {/* Campo oculto para el formulario */}
                                        <input
                                            type="hidden"
                                            {...register('tecnico_revisor')}
                                            value={user?.codigocotel || ''}
                                        />
                                    </div>
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
                                        loading={loading}
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