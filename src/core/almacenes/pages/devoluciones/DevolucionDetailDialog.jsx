// src/core/almacenes/pages/devoluciones/DevolucionDetailDialog.jsx - NUEVO
import React, { useState } from 'react';
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
    CardHeader,
    Chip,
    IconButton,
    Progress,
    Stepper,
    Step
} from '@material-tailwind/react';
import {
    IoClose,
    IoSend,
    IoCheckmarkCircle,
    IoWarning,
    IoCalendar,
    IoBusiness,
    IoDocument,
    IoArrowForward,
    IoTime,
    IoInformationCircle
} from 'react-icons/io5';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useDevolucion } from '../../hooks/useDevolucion';

const DevolucionDetailDialog = ({ open, onClose, devolucion, opciones, onSuccess, onReingreso }) => {
    const { updateEstadoDevolucion, loading } = useDevolucion();
    const [activeStep, setActiveStep] = useState(0);
    const [showEnvioForm, setShowEnvioForm] = useState(false);
    const [showConfirmacionForm, setShowConfirmacionForm] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm();

    if (!devolucion) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'pendiente': return 'amber';
            case 'enviado': return 'blue';
            case 'confirmado': return 'green';
            case 'rechazado': return 'red';
            default: return 'gray';
        }
    };

    const getProgressSteps = () => {
        const steps = [
            { label: 'Creada', completed: true },
            { label: 'Enviada', completed: !!devolucion.fecha_envio },
            { label: 'Confirmada', completed: !!devolucion.fecha_confirmacion }
        ];

        return steps;
    };

    const getCurrentStep = () => {
        if (devolucion.fecha_confirmacion) return 2;
        if (devolucion.fecha_envio) return 1;
        return 0;
    };

    const handleEnviarProveedor = async (data) => {
        try {
            const result = await updateEstadoDevolucion(devolucion.id, 'enviar', {
                observaciones: data.observaciones_envio
            });

            if (result.success) {
                toast.success('Devolución enviada al proveedor');
                setShowEnvioForm(false);
                reset();
                onSuccess();
            }
        } catch (error) {
            toast.error('Error al enviar devolución');
        }
    };

    const handleConfirmarRespuesta = async (data) => {
        try {
            const result = await updateEstadoDevolucion(devolucion.id, 'confirmar', {
                respuesta_proveedor_id: parseInt(data.respuesta_proveedor_id),
                observaciones_proveedor: data.observaciones_proveedor
            });

            if (result.success) {
                toast.success('Respuesta del proveedor confirmada');
                setShowConfirmacionForm(false);
                reset();
                onSuccess();
            }
        } catch (error) {
            toast.error('Error al confirmar respuesta');
        }
    };

    const canSendToProvider = () => {
        return devolucion.estado_info?.codigo === 'PENDIENTE';
    };

    const canConfirmResponse = () => {
        return devolucion.estado_info?.codigo === 'ENVIADO';
    };

    const canCreateReingreso = () => {
        return devolucion.estado_info?.codigo === 'CONFIRMADO' &&
            devolucion.respuesta_proveedor_info?.codigo === 'REPOSICION';
    };

    return (
        <Dialog open={open} handler={onClose} size="xl">
            <DialogHeader className="flex items-center justify-between">
                <div>
                    <Typography variant="h5" color="blue-gray">
                        📋 Detalle de Devolución
                    </Typography>
                    <Typography variant="small" color="gray">
                        {devolucion.numero_devolucion}
                    </Typography>
                </div>
                <IconButton variant="text" color="gray" onClick={onClose}>
                    <IoClose className="h-5 w-5" />
                </IconButton>
            </DialogHeader>

            <DialogBody divider className="max-h-[70vh] overflow-y-auto space-y-6">
                {/* Progreso de la devolución */}
                <Card>
                    <CardHeader>
                        <Typography variant="h6" color="blue-gray">
                            📈 Estado del Proceso
                        </Typography>
                    </CardHeader>
                    <CardBody>
                        <div className="mb-6">
                            <Stepper activeStep={getCurrentStep()}>
                                {getProgressSteps().map((step, index) => (
                                    <Step key={index} completed={step.completed}>
                                        <div className="text-center">
                                            <Typography variant="small" color={step.completed ? "blue-gray" : "gray"}>
                                                {step.label}
                                            </Typography>
                                        </div>
                                    </Step>
                                ))}
                            </Stepper>
                        </div>

                        <div className="flex items-center justify-center">
                            <Chip
                                size="lg"
                                variant="gradient"
                                color={getEstadoColor(devolucion.estado_info?.codigo)}
                                value={devolucion.estado_info?.nombre || 'Sin estado'}
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Información general */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <Typography variant="h6" color="blue-gray">
                                📄 Información General
                            </Typography>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div className="flex items-center gap-3">
                                <IoDocument className="h-5 w-5 text-blue-500" />
                                <div>
                                    <Typography variant="small" color="gray">
                                        Número de Devolución
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {devolucion.numero_devolucion}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <IoBusiness className="h-5 w-5 text-green-500" />
                                <div>
                                    <Typography variant="small" color="gray">
                                        Proveedor
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {devolucion.proveedor_info?.nombre_comercial}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <IoCalendar className="h-5 w-5 text-amber-500" />
                                <div>
                                    <Typography variant="small" color="gray">
                                        Fecha de Creación
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {formatDate(devolucion.fecha_creacion)}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <IoDocument className="h-5 w-5 text-red-500" />
                                <div>
                                    <Typography variant="small" color="gray">
                                        Informe de Laboratorio
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {devolucion.numero_informe_laboratorio}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <IoInformationCircle className="h-5 w-5 text-purple-500" />
                                <div>
                                    <Typography variant="small" color="gray">
                                        Materiales Devueltos
                                    </Typography>
                                    <Typography color="blue-gray" className="font-medium">
                                        {devolucion.cantidad_materiales} equipos
                                    </Typography>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Typography variant="h6" color="blue-gray">
                                📅 Cronología
                            </Typography>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <div>
                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                        Devolución creada
                                    </Typography>
                                    <Typography variant="small" color="gray">
                                        {formatDate(devolucion.fecha_creacion)}
                                    </Typography>
                                </div>
                            </div>

                            {devolucion.fecha_envio && (
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                            Enviada al proveedor
                                        </Typography>
                                        <Typography variant="small" color="gray">
                                            {formatDate(devolucion.fecha_envio)}
                                        </Typography>
                                    </div>
                                </div>
                            )}

                            {devolucion.fecha_confirmacion && (
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <div>
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                            Respuesta confirmada
                                        </Typography>
                                        <Typography variant="small" color="gray">
                                            {formatDate(devolucion.fecha_confirmacion)}
                                        </Typography>
                                    </div>
                                </div>
                            )}

                            {!devolucion.fecha_envio && (
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                    <div>
                                        <Typography variant="small" color="gray">
                                            Pendiente de envío
                                        </Typography>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>

                {/* Motivo de la devolución */}
                <Card>
                    <CardHeader>
                        <Typography variant="h6" color="blue-gray">
                            📝 Motivo de la Devolución
                        </Typography>
                    </CardHeader>
                    <CardBody>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <Typography color="blue-gray">
                                {devolucion.motivo}
                            </Typography>
                        </div>
                    </CardBody>
                </Card>

                {/* Lista de materiales devueltos */}
                <Card>
                    <CardHeader>
                        <Typography variant="h6" color="blue-gray">
                            📦 Materiales Devueltos ({devolucion.cantidad_materiales})
                        </Typography>
                    </CardHeader>
                    <CardBody>
                        {devolucion.materiales_devueltos && devolucion.materiales_devueltos.length > 0 ? (
                            <div className="space-y-3">
                                {devolucion.materiales_devueltos.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <Typography variant="small" color="blue-gray" className="font-medium">
                                                {item.material_info?.codigo_interno}
                                            </Typography>
                                            <Typography variant="small" color="gray" className="font-mono">
                                                MAC: {item.material_info?.descripcion?.split(' - ')[1]}
                                            </Typography>
                                        </div>
                                        <Chip
                                            size="sm"
                                            variant="ghost"
                                            color="red"
                                            value="DEVUELTO"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Typography color="gray" className="text-center py-4">
                                No hay información detallada de materiales
                            </Typography>
                        )}
                    </CardBody>
                </Card>

                {/* Respuesta del proveedor */}
                {devolucion.respuesta_proveedor_info && (
                    <Card>
                        <CardHeader>
                            <Typography variant="h6" color="blue-gray">
                                💬 Respuesta del Proveedor
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            <div className="flex items-center gap-3 mb-3">
                                <Typography variant="small" color="gray">
                                    Respuesta:
                                </Typography>
                                <Chip
                                    size="sm"
                                    variant="gradient"
                                    color={devolucion.respuesta_proveedor_info.codigo === 'REPOSICION' ? 'green' :
                                        devolucion.respuesta_proveedor_info.codigo === 'CREDITO' ? 'blue' : 'red'}
                                    value={devolucion.respuesta_proveedor_info.nombre}
                                />
                            </div>

                            {devolucion.observaciones_proveedor && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <Typography variant="small" color="blue-gray">
                                        {devolucion.observaciones_proveedor}
                                    </Typography>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                )}

                {/* Formulario de envío */}
                {showEnvioForm && (
                    <Card>
                        <CardHeader>
                            <Typography variant="h6" color="blue">
                                📤 Enviar al Proveedor
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleSubmit(handleEnviarProveedor)}>
                                <Textarea
                                    label="Observaciones del Envío"
                                    {...register('observaciones_envio')}
                                    rows={3}
                                    placeholder="Información adicional para el proveedor..."
                                />

                                <div className="flex justify-end gap-2 mt-4">
                                    <Button
                                        variant="outlined"
                                        color="gray"
                                        onClick={() => setShowEnvioForm(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="blue"
                                        loading={loading}
                                        className="flex items-center gap-2"
                                    >
                                        <IoSend className="h-4 w-4" />
                                        Confirmar Envío
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                )}

                {/* Formulario de confirmación */}
                {showConfirmacionForm && (
                    <Card>
                        <CardHeader>
                            <Typography variant="h6" color="green">
                                ✅ Confirmar Respuesta del Proveedor
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleSubmit(handleConfirmarRespuesta)}>
                                <div className="space-y-4">
                                    <Controller
                                        name="respuesta_proveedor_id"
                                        control={control}
                                        rules={{ required: 'La respuesta del proveedor es obligatoria' }}
                                        render={({ field }) => (
                                            <Select
                                                label="Respuesta del Proveedor *"
                                                value={field.value}
                                                onChange={(value) => field.onChange(value)}
                                                error={!!errors.respuesta_proveedor_id}
                                            >
                                                {opciones?.respuestas_proveedor?.map((respuesta) => (
                                                    <Option key={respuesta.id} value={respuesta.id.toString()}>
                                                        {respuesta.nombre}
                                                    </Option>
                                                ))}
                                            </Select>
                                        )}
                                    />

                                    <Textarea
                                        label="Observaciones del Proveedor"
                                        {...register('observaciones_proveedor')}
                                        rows={3}
                                        placeholder="Detalles de la respuesta del proveedor..."
                                    />
                                </div>

                                <div className="flex justify-end gap-2 mt-4">
                                    <Button
                                        variant="outlined"
                                        color="gray"
                                        onClick={() => setShowConfirmacionForm(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="green"
                                        loading={loading}
                                        className="flex items-center gap-2"
                                    >
                                        <IoCheckmarkCircle className="h-4 w-4" />
                                        Confirmar Respuesta
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                )}

                {/* Alertas según estado */}
                {canCreateReingreso() && (
                    <Alert color="green">
                        <IoCheckmarkCircle className="h-5 w-5" />
                        <div>
                            <Typography variant="small" className="font-medium">
                                ✅ Reposición autorizada por el proveedor
                            </Typography>
                            <Typography variant="small">
                                Puedes registrar el reingreso del nuevo equipo de reposición.
                            </Typography>
                        </div>
                    </Alert>
                )}
            </DialogBody>

            <DialogFooter className="space-x-2">
                <Button variant="text" color="gray" onClick={onClose}>
                    Cerrar
                </Button>

                {canSendToProvider() && !showEnvioForm && (
                    <Button
                        color="blue"
                        className="flex items-center gap-2"
                        onClick={() => setShowEnvioForm(true)}
                    >
                        <IoSend className="h-4 w-4" />
                        Enviar al Proveedor
                    </Button>
                )}

                {canConfirmResponse() && !showConfirmacionForm && (
                    <Button
                        color="green"
                        className="flex items-center gap-2"
                        onClick={() => setShowConfirmacionForm(true)}
                    >
                        <IoCheckmarkCircle className="h-4 w-4" />
                        Confirmar Respuesta
                    </Button>
                )}

                {canCreateReingreso() && (
                    <Button
                        color="orange"
                        className="flex items-center gap-2"
                        onClick={() => onReingreso(devolucion)}
                    >
                        <IoArrowForward className="h-4 w-4" />
                        Registrar Reposición
                    </Button>
                )}
            </DialogFooter>
        </Dialog>
    );
};

export default DevolucionDetailDialog;