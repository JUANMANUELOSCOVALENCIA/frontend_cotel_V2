// src/core/almacenes/pages/lotes/EntregasParcialesDialog.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Input,
    Textarea,
    Select,
    Option,
    Alert,
    Card,
    CardBody,
    Chip,
    IconButton,
    Tooltip
} from '@material-tailwind/react';
import {
    IoAdd,
    IoEye,
    IoCalendar,
    IoCheckmarkCircle,
    IoClose,
    IoInformationCircle
} from 'react-icons/io5';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../../../services/api';

const EntregasParcialesDialog = ({
                                     open = false,           // ← VALOR POR DEFECTO
                                     onClose = () => {},     // ← VALOR POR DEFECTO
                                     lote = null,            // ← VALOR POR DEFECTO
                                     opciones = {},          // ← VALOR POR DEFECTO
                                     onSuccess = () => {}    // ← VALOR POR DEFECTO
                                 }) => {
    const [entregas, setEntregas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm();

    useEffect(() => {
        if (open && lote?.id) {  // ← VERIFICAR QUE LOTE TENGA ID
            loadEntregas();
        }
    }, [open, lote]);

    const loadEntregas = async () => {
        if (!lote?.id) return; // ← VERIFICACIÓN ADICIONAL

        try {
            setLoading(true);
            const response = await api.get(`/almacenes/lotes/${lote.id}/resumen/`);
            if (response.data.entregas_parciales) {
                setEntregas(response.data.entregas_parciales);
            }
        } catch (error) {
            console.error('Error al cargar entregas:', error);
            toast.error('Error al cargar entregas');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEntrega = async (data) => {
        if (!lote?.id) {
            toast.error('No se ha seleccionado un lote válido');
            return;
        }

        try {
            setLoading(true);

            // 🔍 AGREGAR LOGS PARA DEBUG
            console.log('📦 Datos del formulario:', data);
            console.log('📦 Lote ID:', lote.id);

            const entregaData = {
                fecha_entrega: data.fecha_entrega,
                cantidad_entregada: parseInt(data.cantidad_entregada),
                estado_entrega: parseInt(data.estado_entrega),
                observaciones: data.observaciones || ''
            };

            // 🔍 VERIFICAR DATOS ANTES DE ENVIAR
            console.log('📦 Datos a enviar:', entregaData);

            // Verificar que los campos requeridos estén presentes
            if (!entregaData.fecha_entrega) {
                toast.error('La fecha de entrega es requerida');
                return;
            }

            if (!entregaData.cantidad_entregada || entregaData.cantidad_entregada <= 0) {
                toast.error('La cantidad debe ser mayor a 0');
                return;
            }

            if (!entregaData.estado_entrega) {
                toast.error('Debe seleccionar un estado');
                return;
            }

            const response = await api.post(
                `/almacenes/lotes/${lote.id}/agregar_entrega_parcial/`,
                entregaData
            );

            if (response.data) {
                toast.success(`Entrega parcial registrada exitosamente`);
                reset();
                setShowCreateForm(false);
                loadEntregas();
                onSuccess();
            }
        } catch (error) {
            console.error('❌ Error completo:', error);
            console.error('❌ Response data:', error.response?.data);
            console.error('❌ Status:', error.response?.status);

            toast.error(error.response?.data?.error || 'Error al crear entrega');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    const getEstadoColor = (estado) => {
        const codigo = estado?.codigo?.toLowerCase();
        switch (codigo) {
            case 'recepcion_parcial': return 'amber';
            case 'recepcion_completa': return 'green';
            case 'pendiente': return 'blue';
            default: return 'gray';
        }
    };

    // ← NO RENDERIZAR SI NO HAY LOTE
    if (!lote) {
        return null;
    }

    return (
        <Dialog open={open} handler={onClose} size="xl">
            <DialogHeader className="flex items-center justify-between">
                <div>
                    <Typography variant="h5" color="blue-gray">
                        Entregas Parciales - Lote {lote?.numero_lote}
                    </Typography>
                    <Typography color="gray">
                        Gestión de entregas parciales del proveedor
                    </Typography>
                </div>
                <div className="flex items-center gap-2">
                    {!showCreateForm && (
                        <Button
                            size="sm"
                            color="green"
                            className="flex items-center gap-2"
                            onClick={() => setShowCreateForm(true)}
                        >
                            <IoAdd className="h-4 w-4" />
                            Nueva Entrega
                        </Button>
                    )}
                    <IconButton variant="text" color="gray" onClick={onClose}>
                        <IoClose className="h-5 w-5" />
                    </IconButton>
                </div>
            </DialogHeader>

            <DialogBody divider className="max-h-[70vh] overflow-y-auto space-y-4">
                {/* Resumen del lote */}
                <Alert color="blue">
                    <div className="flex items-center gap-2">
                        <IoInformationCircle className="h-5 w-5" />
                        <div>
                            <Typography variant="small" className="font-medium">
                                Progreso del Lote: {lote?.cantidad_recibida || 0} / {lote?.cantidad_total || 0} equipos
                            </Typography>
                            <Typography variant="small">
                                Completado: {lote?.porcentaje_recibido || 0}%
                            </Typography>
                        </div>
                    </div>
                </Alert>

                {/* Formulario para nueva entrega */}
                {showCreateForm && (
                    <Card>
                        <CardBody>
                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                📦 Registrar Nueva Entrega Parcial
                            </Typography>

                            <form onSubmit={handleSubmit(handleCreateEntrega)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Input
                                            type="date"
                                            label="Fecha de Entrega *"
                                            {...register('fecha_entrega', {
                                                required: 'La fecha es obligatoria'
                                            })}
                                            error={!!errors.fecha_entrega}
                                        />
                                        {errors.fecha_entrega && (
                                            <Typography variant="small" color="red" className="mt-1">
                                                {errors.fecha_entrega.message}
                                            </Typography>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            type="number"
                                            label="Cantidad Entregada *"
                                            min="1"
                                            {...register('cantidad_entregada', {
                                                required: 'La cantidad es obligatoria',
                                                min: { value: 1, message: 'Mínimo 1' }
                                            })}
                                            error={!!errors.cantidad_entregada}
                                        />
                                        {errors.cantidad_entregada && (
                                            <Typography variant="small" color="red" className="mt-1">
                                                {errors.cantidad_entregada.message}
                                            </Typography>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Controller
                                        name="estado_entrega"
                                        control={control}
                                        rules={{ required: 'El estado es obligatorio' }}
                                        render={({ field }) => (
                                            <Select
                                                label="Estado de la Entrega *"
                                                value={field.value}
                                                onChange={(value) => field.onChange(value)}
                                                error={!!errors.estado_entrega}
                                            >
                                                {opciones?.estados_lote?.map((estado) => (
                                                    <Option key={estado.id} value={estado.id.toString()}>
                                                        {estado.nombre}
                                                    </Option>
                                                )) || []}
                                            </Select>
                                        )}
                                    />
                                    {errors.estado_entrega && (
                                        <Typography variant="small" color="red" className="mt-1">
                                            {errors.estado_entrega.message}
                                        </Typography>
                                    )}
                                </div>

                                <Textarea
                                    label="Observaciones"
                                    {...register('observaciones')}
                                    rows={3}
                                />

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        color="green"
                                        loading={loading}
                                        className="flex items-center gap-2"
                                    >
                                        <IoCheckmarkCircle className="h-4 w-4" />
                                        Registrar Entrega
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        color="gray"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            reset();
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                )}

                {/* Lista de entregas existentes */}
                <div>
                    <Typography variant="h6" color="blue-gray" className="mb-3">
                        📋 Entregas Registradas ({entregas.length})
                    </Typography>

                    {entregas.length === 0 ? (
                        <Card>
                            <CardBody className="text-center py-8">
                                <IoCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <Typography color="gray">
                                    No hay entregas parciales registradas
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Registra la primera entrega para comenzar el seguimiento
                                </Typography>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {entregas.map((entrega) => (
                                <Card key={entrega.id}>
                                    <CardBody>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                                                    <Typography variant="small" color="blue" className="font-bold">
                                                        #{entrega.numero_entrega}
                                                    </Typography>
                                                </div>
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                        {entrega.cantidad_entregada} equipos entregados
                                                    </Typography>
                                                    <Typography variant="small" color="gray">
                                                        {formatDate(entrega.fecha_entrega)}
                                                    </Typography>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Chip
                                                    size="sm"
                                                    variant="gradient"
                                                    color={getEstadoColor(entrega.estado_entrega_info)}
                                                    value={entrega.estado_entrega_info?.nombre || 'Sin estado'}
                                                />
                                                <Tooltip content="Ver materiales de esta entrega">
                                                    <IconButton variant="text" color="blue" size="sm">
                                                        <IoEye className="h-4 w-4" />
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        {entrega.observaciones && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <Typography variant="small" color="gray">
                                                    {entrega.observaciones}
                                                </Typography>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}
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

export default EntregasParcialesDialog;