// src/core/almacenes/pages/proveedores/ProveedorDialog.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Textarea,
    Switch,
    Typography,
    Alert,
    Spinner
} from '@material-tailwind/react';
import { useForm } from 'react-hook-form';
import { IoClose } from 'react-icons/io5';

const ProveedorDialog = ({
                             open,
                             mode = 'create',
                             proveedor = null,
                             onClose,
                             onSubmit,
                             loading = false
                         }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm({
        defaultValues: {
            codigo: '',
            nombre_comercial: '',
            razon_social: '',
            contacto_principal: '',
            telefono: '',
            email: '',
            activo: true
        }
    });

    const isEdit = mode === 'edit';
    const title = isEdit ? 'Editar Proveedor' : 'Crear Nuevo Proveedor';

    // Llenar formulario en modo edición
    useEffect(() => {
        if (open) {
            if (isEdit && proveedor) {
                reset({
                    codigo: proveedor.codigo || '',
                    nombre_comercial: proveedor.nombre_comercial || '',
                    razon_social: proveedor.razon_social || '',
                    contacto_principal: proveedor.contacto_principal || '',
                    telefono: proveedor.telefono || '',
                    email: proveedor.email || '',
                    activo: proveedor.activo !== undefined ? proveedor.activo : true
                });
            } else {
                reset({
                    codigo: '',
                    nombre_comercial: '',
                    razon_social: '',
                    contacto_principal: '',
                    telefono: '',
                    email: '',
                    activo: true
                });
            }
            setError(null);
        }
    }, [open, isEdit, proveedor, reset]);

    const handleFormSubmit = async (data) => {
        setSubmitting(true);
        setError(null);

        try {
            const result = await onSubmit(data);
            if (!result.success) {
                setError(result.error);
            }
        } catch (err) {
            setError('Error inesperado al guardar');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            reset();
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={open} handler={handleClose} size="lg">
            <DialogHeader className="flex items-center justify-between">
                <Typography variant="h5" color="blue-gray">
                    {title}
                </Typography>
                <Button variant="text" color="gray" onClick={handleClose} className="p-2">
                    <IoClose className="h-5 w-5" />
                </Button>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogBody divider className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <Alert color="red" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {/* Información Básica */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="mb-3">
                            Información Básica
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Código (Opcional)"
                                    {...register('codigo', {
                                        maxLength: {
                                            value: 20,
                                            message: 'Máximo 20 caracteres'
                                        }
                                    })}
                                    error={!!errors.codigo}
                                    disabled={submitting}
                                />
                                {errors.codigo && (
                                    <Typography variant="small" color="red" className="mt-1">
                                        {errors.codigo.message}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Input
                                    label="Nombre Comercial *"
                                    {...register('nombre_comercial', {
                                        required: 'El nombre comercial es obligatorio',
                                        maxLength: {
                                            value: 100,
                                            message: 'Máximo 100 caracteres'
                                        }
                                    })}
                                    error={!!errors.nombre_comercial}
                                    disabled={submitting}
                                />
                                {errors.nombre_comercial && (
                                    <Typography variant="small" color="red" className="mt-1">
                                        {errors.nombre_comercial.message}
                                    </Typography>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <Textarea
                                label="Razón Social"
                                {...register('razon_social', {
                                    maxLength: {
                                        value: 150,
                                        message: 'Máximo 150 caracteres'
                                    }
                                })}
                                error={!!errors.razon_social}
                                disabled={submitting}
                                rows={2}
                            />
                            {errors.razon_social && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.razon_social.message}
                                </Typography>
                            )}
                        </div>
                    </div>

                    {/* Información de Contacto */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="mb-3">
                            Información de Contacto
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Contacto Principal"
                                    {...register('contacto_principal', {
                                        maxLength: {
                                            value: 100,
                                            message: 'Máximo 100 caracteres'
                                        }
                                    })}
                                    error={!!errors.contacto_principal}
                                    disabled={submitting}
                                />
                                {errors.contacto_principal && (
                                    <Typography variant="small" color="red" className="mt-1">
                                        {errors.contacto_principal.message}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Input
                                    label="Teléfono"
                                    type="tel"
                                    {...register('telefono', {
                                        maxLength: {
                                            value: 20,
                                            message: 'Máximo 20 caracteres'
                                        },
                                        pattern: {
                                            value: /^[0-9+\-\s()]+$/,
                                            message: 'Formato de teléfono inválido'
                                        }
                                    })}
                                    error={!!errors.telefono}
                                    disabled={submitting}
                                />
                                {errors.telefono && (
                                    <Typography variant="small" color="red" className="mt-1">
                                        {errors.telefono.message}
                                    </Typography>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <Input
                                label="Email"
                                type="email"
                                {...register('email', {
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Email inválido'
                                    }
                                })}
                                error={!!errors.email}
                                disabled={submitting}
                            />
                            {errors.email && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.email.message}
                                </Typography>
                            )}
                        </div>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center justify-between p-4 bg-blue-gray-50 rounded-lg">
                        <div>
                            <Typography variant="small" color="blue-gray" className="font-medium">
                                Estado Activo
                            </Typography>
                            <Typography variant="small" color="gray">
                                Los proveedores inactivos no aparecen en las operaciones
                            </Typography>
                        </div>
                        <Switch
                            {...register('activo')}
                            color="green"
                            disabled={submitting}
                        />
                    </div>
                </DialogBody>

                <DialogFooter className="space-x-2">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        color="blue"
                        disabled={submitting}
                        className="flex items-center gap-2"
                    >
                        {submitting && <Spinner className="h-4 w-4" />}
                        {isEdit ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
};

export default ProveedorDialog;