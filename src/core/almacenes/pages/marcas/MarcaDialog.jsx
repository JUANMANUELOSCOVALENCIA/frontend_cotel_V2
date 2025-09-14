// ======================================================
// src/core/almacenes/pages/marcas/MarcaDialog.jsx
// ======================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Textarea,
    Typography,
    Alert,
    Spinner
} from '@material-tailwind/react';
import { useForm } from 'react-hook-form';

const MarcaDialog = React.memo(({
                                    open,
                                    onClose,
                                    onSubmit,
                                    title,
                                    mode = 'create',
                                    initialData = null
                                }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            nombre: '',
            descripcion: ''
        }
    });

    // Resetear form cuando se abre/cierra o cambian los datos iniciales
    useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                reset({
                    nombre: initialData.nombre || '',
                    descripcion: initialData.descripcion || ''
                });
            } else {
                reset({
                    nombre: '',
                    descripcion: ''
                });
            }
            setError(null);
        }
    }, [open, mode, initialData, reset]);

    const handleFormSubmit = useCallback(async (data) => {
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
    }, [onSubmit]);

    const handleClose = useCallback(() => {
        if (!submitting) {
            reset();
            setError(null);
            onClose();
        }
    }, [submitting, reset, onClose]);

    return (
        <Dialog open={open} handler={handleClose} size="md">
            <DialogHeader>
                <Typography variant="h5" color="blue-gray">
                    {title}
                </Typography>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogBody divider className="space-y-4">
                    {error && (
                        <Alert color="red" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {/* Nombre */}
                    <div>
                        <Input
                            label="Nombre de la Marca *"
                            {...register('nombre', {
                                required: 'El nombre es obligatorio',
                                minLength: {
                                    value: 2,
                                    message: 'Mínimo 2 caracteres'
                                },
                                maxLength: {
                                    value: 100,
                                    message: 'Máximo 100 caracteres'
                                }
                            })}
                            error={!!errors.nombre}
                            disabled={submitting}
                        />
                        {errors.nombre && (
                            <Typography variant="small" color="red" className="mt-1">
                                {errors.nombre.message}
                            </Typography>
                        )}
                    </div>

                    {/* Descripción */}
                    <div>
                        <Textarea
                            label="Descripción"
                            {...register('descripcion', {
                                maxLength: {
                                    value: 255,
                                    message: 'Máximo 255 caracteres'
                                }
                            })}
                            error={!!errors.descripcion}
                            disabled={submitting}
                        />
                        {errors.descripcion && (
                            <Typography variant="small" color="red" className="mt-1">
                                {errors.descripcion.message}
                            </Typography>
                        )}
                        <Typography variant="small" color="gray" className="mt-1">
                            Información adicional sobre la marca (opcional)
                        </Typography>
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
                        {mode === 'create' ? 'Crear' : 'Actualizar'}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
});

MarcaDialog.displayName = 'MarcaDialog';

export default MarcaDialog;