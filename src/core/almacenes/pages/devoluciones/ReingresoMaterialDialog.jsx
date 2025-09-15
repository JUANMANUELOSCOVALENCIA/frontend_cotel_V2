// src/core/almacenes/pages/devoluciones/ReingresoMaterialDialog.jsx - NUEVO
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
    Alert,
    Card,
    CardBody,
    CardHeader,
    Chip,
    IconButton,
    Stepper,
    Step
} from '@material-tailwind/react';
import {
    IoClose,
    IoArrowForward,
    IoCheckmarkCircle,
    IoWarning,
    IoSwapHorizontal,
    IoHardwareChip,
    IoWifi,
    IoRefresh,
    IoSave
} from 'react-icons/io5';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';

const ReingresoMaterialDialog = ({ open, onClose, devolucion, opciones, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [materialOriginal, setMaterialOriginal] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm();

    const watchMac = watch('mac_address');
    const watchGpon = watch('gpon_serial');

    useEffect(() => {
        if (open && devolucion) {
            loadMaterialOriginal();
        }
    }, [open, devolucion]);

    const loadMaterialOriginal = async () => {
        try {
            // Obtener el primer material de la devolución para usar como referencia
            if (devolucion.materiales_devueltos && devolucion.materiales_devueltos.length > 0) {
                const materialId = devolucion.materiales_devueltos[0].material;
                const response = await api.get(`/almacenes/materiales/${materialId}/`);
                setMaterialOriginal(response.data);
            }
        } catch (error) {
            console.error('Error al cargar material original:', error);
        }
    };

    const generateSerialNumbers = () => {
        // Generar números de serie de ejemplo
        const macBase = '00:11:22:33:44:';
        const gponBase = 'HWTC';
        const dsnBase = 'SN';

        const randomMac = macBase + Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const randomGpon = gponBase + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        const randomDsn = dsnBase + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');

        return { randomMac, randomGpon, randomDsn };
    };

    const handleAutoGenerate = () => {
        const { randomMac, randomGpon, randomDsn } = generateSerialNumbers();
        reset({
            mac_address: randomMac,
            gpon_serial: randomGpon,
            serial_manufacturer: randomDsn,
            codigo_item_equipo: materialOriginal?.codigo_item_equipo || '',
            motivo_reingreso: `Reposición por equipo defectuoso - Devolución ${devolucion?.numero_devolucion}`
        });
    };

    const validateUniqueValues = async (field, value) => {
        try {
            const response = await api.get('/almacenes/materiales/validar_unicidad/', {
                params: { [field]: value }
            });
            return response.data.unique;
        } catch (error) {
            return true; // Asumir único si hay error en validación
        }
    };

    const handleRegistrarReingreso = async (data) => {
        try {
            setLoading(true);

            // Validar unicidad de valores críticos
            const macUnique = await validateUniqueValues('mac_address', data.mac_address);
            const gponUnique = await validateUniqueValues('gpon_serial', data.gpon_serial);
            const dsnUnique = data.serial_manufacturer ?
                await validateUniqueValues('serial_manufacturer', data.serial_manufacturer) : true;

            if (!macUnique || !gponUnique || !dsnUnique) {
                toast.error('Algunos valores ya existen en el sistema. Verifica MAC, GPON Serial y D-SN.');
                return;
            }

            const reingresoData = {
                material_original_id: materialOriginal.id,
                mac_address: data.mac_address.toUpperCase(),
                gpon_serial: data.gpon_serial,
                serial_manufacturer: data.serial_manufacturer || '', // Opcional
                codigo_item_equipo: data.codigo_item_equipo,
                motivo_reingreso: data.motivo_reingreso
            };

            const response = await api.post('/almacenes/materiales/reingreso/', reingresoData);

            if (response.data.success) {
                toast.success('Reingreso registrado correctamente');
                setCurrentStep(2);
                onSuccess();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al registrar reingreso');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        reset();
        setCurrentStep(0);
        setMaterialOriginal(null);
        onClose();
    };

    const steps = [
        'Verificar Material Original',
        'Registrar Nuevo Equipo',
        'Reingreso Completado'
    ];

    if (!devolucion) return null;

    return (
        <Dialog open={open} handler={handleClose} size="lg">
            <DialogHeader className="flex items-center justify-between">
                <div>
                    <Typography variant="h5" color="green">
                        🔄 Registro de Reposición
                    </Typography>
                    <Typography variant="small" color="gray">
                        Devolución: {devolucion.numero_devolucion}
                    </Typography>
                </div>
                <IconButton variant="text" color="gray" onClick={handleClose}>
                    <IoClose className="h-5 w-5" />
                </IconButton>
            </DialogHeader>

            <DialogBody divider className="max-h-[70vh] overflow-y-auto space-y-6">
                {/* Stepper de progreso */}
                <div className="mb-6">
                    <Stepper activeStep={currentStep}>
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <div className="text-center">
                                    <Typography variant="small" color={index <= currentStep ? "blue-gray" : "gray"}>
                                        {step}
                                    </Typography>
                                </div>
                            </Step>
                        ))}
                    </Stepper>
                </div>

                {/* Paso 0: Información del material original */}
                {currentStep === 0 && materialOriginal && (
                    <div className="space-y-4">
                        <Alert color="blue">
                            <div className="flex items-center gap-2">
                                <IoSwapHorizontal className="h-5 w-5" />
                                <div>
                                    <Typography variant="small" className="font-medium">
                                        Proceso de Reposición Autorizado
                                    </Typography>
                                    <Typography variant="small">
                                        El proveedor ha autorizado la reposición del equipo defectuoso.
                                    </Typography>
                                </div>
                            </div>
                        </Alert>

                        <Card>
                            <CardHeader>
                                <Typography variant="h6" color="blue-gray">
                                    📦 Material Original (Defectuoso)
                                </Typography>
                            </CardHeader>
                            <CardBody className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <IoHardwareChip className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <Typography variant="small" color="gray">
                                                Código Interno
                                            </Typography>
                                            <Typography color="blue-gray" className="font-medium">
                                                {materialOriginal.codigo_interno}
                                            </Typography>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <IoWifi className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <Typography variant="small" color="gray">
                                                MAC Address
                                            </Typography>
                                            <Typography color="blue-gray" className="font-medium font-mono">
                                                {materialOriginal.mac_address}
                                            </Typography>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <IoHardwareChip className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <Typography variant="small" color="gray">
                                                GPON Serial
                                            </Typography>
                                            <Typography color="blue-gray" className="font-medium font-mono">
                                                {materialOriginal.gpon_serial}
                                            </Typography>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <IoHardwareChip className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <Typography variant="small" color="gray">
                                                D-SN
                                            </Typography>
                                            <Typography color="blue-gray" className="font-medium font-mono">
                                                {materialOriginal.serial_manufacturer || 'No especificado'}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center mt-4">
                                    <Chip
                                        size="lg"
                                        variant="gradient"
                                        color="red"
                                        value="EQUIPO DEFECTUOSO"
                                        icon={<IoWarning className="h-4 w-4" />}
                                    />
                                </div>
                            </CardBody>
                        </Card>

                        <div className="flex justify-end">
                            <Button
                                color="blue"
                                onClick={() => setCurrentStep(1)}
                                className="flex items-center gap-2"
                            >
                                Continuar
                                <IoArrowForward className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Paso 1: Registrar nuevo equipo */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <Alert color="green">
                            <div className="flex items-center gap-2">
                                <IoCheckmarkCircle className="h-5 w-5" />
                                <div>
                                    <Typography variant="small" className="font-medium">
                                        Registrar Equipo de Reposición
                                    </Typography>
                                    <Typography variant="small">
                                        Ingresa los datos del nuevo equipo que reemplazará al defectuoso.
                                    </Typography>
                                </div>
                            </div>
                        </Alert>

                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <Typography variant="h6" color="blue-gray">
                                    📝 Datos del Nuevo Equipo
                                </Typography>
                                <Button
                                    size="sm"
                                    variant="outlined"
                                    color="blue"
                                    onClick={handleAutoGenerate}
                                    className="flex items-center gap-2"
                                >
                                    <IoRefresh className="h-4 w-4" />
                                    Auto-generar
                                </Button>
                            </CardHeader>
                            <CardBody>
                                <form onSubmit={handleSubmit(handleRegistrarReingreso)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="MAC Address *"
                                            {...register('mac_address', {
                                                required: 'MAC Address es obligatorio',
                                                pattern: {
                                                    value: /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i,
                                                    message: 'Formato de MAC inválido (XX:XX:XX:XX:XX:XX)'
                                                }
                                            })}
                                            error={!!errors.mac_address}
                                            placeholder="00:11:22:33:44:55"
                                        />

                                        <Input
                                            label="GPON Serial *"
                                            {...register('gpon_serial', {
                                                required: 'GPON Serial es obligatorio',
                                                minLength: {
                                                    value: 8,
                                                    message: 'GPON Serial debe tener al menos 8 caracteres'
                                                }
                                            })}
                                            error={!!errors.gpon_serial}
                                            placeholder="HWTC12345678"
                                        />

                                        <Input
                                            label="D-SN (Opcional)"
                                            {...register('serial_manufacturer', {
                                                minLength: {
                                                    value: 6,
                                                    message: 'D-SN debe tener al menos 6 caracteres si se proporciona'
                                                }
                                            })}
                                            error={!!errors.serial_manufacturer}
                                            placeholder="SN123456789"
                                        />

                                        <Input
                                            label="ITEM Equipo *"
                                            {...register('codigo_item_equipo', {
                                                required: 'ITEM Equipo es obligatorio',
                                                pattern: {
                                                    value: /^\d{6,10}$/,
                                                    message: 'Debe tener entre 6 y 10 dígitos'
                                                }
                                            })}
                                            error={!!errors.codigo_item_equipo}
                                            placeholder="1234567890"
                                        />
                                    </div>

                                    <Textarea
                                        label="Motivo del Reingreso"
                                        {...register('motivo_reingreso')}
                                        rows={3}
                                        placeholder="Descripción del motivo de reposición..."
                                    />

                                    {/* Validación en tiempo real */}
                                    {(watchMac || watchGpon) && (
                                        <Alert color="blue">
                                            <div className="flex items-center gap-2">
                                                <IoCheckmarkCircle className="h-5 w-5" />
                                                <Typography variant="small">
                                                    <strong>Validación automática:</strong> Se verificará que los nuevos números de serie sean únicos en el sistema.
                                                </Typography>
                                            </div>
                                        </Alert>
                                    )}

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outlined"
                                            color="gray"
                                            onClick={() => setCurrentStep(0)}
                                        >
                                            Atrás
                                        </Button>
                                        <Button
                                            type="submit"
                                            color="green"
                                            loading={loading}
                                            className="flex items-center gap-2"
                                        >
                                            <IoSave className="h-4 w-4" />
                                            Registrar Reposición
                                        </Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {/* Paso 2: Confirmación */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <Alert color="green">
                            <div className="flex items-center gap-2">
                                <IoCheckmarkCircle className="h-5 w-5" />
                                <div>
                                    <Typography variant="small" className="font-medium">
                                        ✅ Reposición Registrada Exitosamente
                                    </Typography>
                                    <Typography variant="small">
                                        El nuevo equipo ha sido registrado y está disponible en el almacén.
                                    </Typography>
                                </div>
                            </div>
                        </Alert>

                        <Card>
                            <CardBody className="text-center py-8">
                                <IoCheckmarkCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                                <Typography variant="h6" color="green" className="mb-2">
                                    Proceso Completado
                                </Typography>
                                <Typography color="gray">
                                    El equipo de reposición ha sido registrado correctamente y el material original ha sido marcado como reemplazado.
                                </Typography>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {/* Errores de validación */}
                {Object.keys(errors).length > 0 && currentStep === 1 && (
                    <Alert color="red">
                        <Typography variant="small" className="font-medium mb-2">
                            Errores en el formulario:
                        </Typography>
                        {Object.values(errors).map((error, index) => (
                            <div key={index}>• {error.message}</div>
                        ))}
                    </Alert>
                )}
            </DialogBody>

            <DialogFooter className="space-x-2">
                <Button variant="text" color="gray" onClick={handleClose}>
                    {currentStep === 2 ? 'Cerrar' : 'Cancelar'}
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default ReingresoMaterialDialog;