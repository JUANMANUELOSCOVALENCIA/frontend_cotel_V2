// ======================================================
// src/core/almacenes/pages/almacenes/AlmacenDialog.jsx - CORREGIDO
// ======================================================

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
// ✅ CORRECCIÓN: Importar el hook correcto
import { useOpcionesCompletas } from '../../hooks/useAlmacenes';

const AlmacenDialog = ({
                           open,
                           onClose,
                           onSubmit,
                           title,
                           mode = 'create',
                           initialData = null
                       }) => {
    // ✅ CORRECCIÓN: Usar el hook correcto
    const { opciones, loading: loadingOpciones } = useOpcionesCompletas();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue
    } = useForm({
        defaultValues: {
            codigo: '',
            nombre: '',
            ciudad: '',
            tipo: '',
            direccion: '',
            es_principal: false,
            codigo_cotel_encargado: '',
            activo: true,
            observaciones: ''
        }
    });

    const esPrincipal = watch('es_principal');

    // Resetear form cuando se abre/cierra o cambian los datos iniciales
    useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                reset({
                    codigo: initialData.codigo || '',
                    nombre: initialData.nombre || '',
                    ciudad: initialData.ciudad || '',
                    tipo: initialData.tipo || '',
                    direccion: initialData.direccion || '',
                    es_principal: initialData.es_principal || false,
                    codigo_cotel_encargado: initialData.codigo_cotel_encargado || '',
                    activo: initialData.activo !== undefined ? initialData.activo : true,
                    observaciones: initialData.observaciones || ''
                });
            } else {
                reset({
                    codigo: '',
                    nombre: '',
                    ciudad: '',
                    tipo: '',
                    direccion: '',
                    es_principal: false,
                    codigo_cotel_encargado: '',
                    activo: true,
                    observaciones: ''
                });
            }
            setError(null);
        }
    }, [open, mode, initialData, reset]);

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
            <DialogHeader>
                <Typography variant="h5" color="blue-gray">
                    {title}
                </Typography>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogBody divider className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <Alert color="red" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {/* Información Básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Código del Almacén *"
                                {...register('codigo', {
                                    required: 'El código es obligatorio',
                                    minLength: {
                                        value: 2,
                                        message: 'Mínimo 2 caracteres'
                                    },
                                    maxLength: {
                                        value: 10,
                                        message: 'Máximo 10 caracteres'
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
                                label="Nombre del Almacén *"
                                {...register('nombre', {
                                    required: 'El nombre es obligatorio',
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Ciudad *"
                                {...register('ciudad', {
                                    required: 'La ciudad es obligatoria',
                                    maxLength: {
                                        value: 50,
                                        message: 'Máximo 50 caracteres'
                                    }
                                })}
                                error={!!errors.ciudad}
                                disabled={submitting}
                            />
                            {errors.ciudad && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.ciudad.message}
                                </Typography>
                            )}
                        </div>

                        <div>
                            {loadingOpciones ? (
                                <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-md">
                                    <Spinner className="h-4 w-4" />
                                    <Typography variant="small" color="gray">
                                        Cargando tipos...
                                    </Typography>
                                </div>
                            ) : (
                                <select
                                    {...register('tipo', {
                                        required: 'El tipo es obligatorio'
                                    })}
                                    className={`w-full p-3 border rounded-md ${
                                        errors.tipo ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={submitting}
                                >
                                    <option value="">Seleccionar tipo *</option>
                                    {/* ✅ CORRECCIÓN: Usar opciones.tipos_almacen */}
                                    {opciones.tipos_almacen?.map(tipo => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.tipo && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.tipo.message}
                                </Typography>
                            )}
                        </div>
                    </div>

                    {/* Dirección */}
                    <div>
                        <Textarea
                            label="Dirección"
                            {...register('direccion', {
                                maxLength: {
                                    value: 255,
                                    message: 'Máximo 255 caracteres'
                                }
                            })}
                            error={!!errors.direccion}
                            disabled={submitting}
                        />
                        {errors.direccion && (
                            <Typography variant="small" color="red" className="mt-1">
                                {errors.direccion.message}
                            </Typography>
                        )}
                    </div>

                    {/* Encargado */}
                    <div>
                        <Input
                            label="Código COTEL del Encargado"
                            {...register('codigo_cotel_encargado', {
                                pattern: {
                                    value: /^[A-Z0-9]+$/,
                                    message: 'Solo letras mayúsculas y números'
                                },
                                maxLength: {
                                    value: 20,
                                    message: 'Máximo 20 caracteres'
                                }
                            })}
                            error={!!errors.codigo_cotel_encargado}
                            disabled={submitting}
                        />
                        {errors.codigo_cotel_encargado && (
                            <Typography variant="small" color="red" className="mt-1">
                                {errors.codigo_cotel_encargado.message}
                            </Typography>
                        )}
                        <Typography variant="small" color="gray" className="mt-1">
                            El sistema buscará automáticamente el usuario con este código
                        </Typography>
                    </div>

                    {/* Switches */}
                    <div className="flex flex-col gap-4 p-4 bg-blue-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="small" color="blue-gray" className="font-medium">
                                    Almacén Principal
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Solo puede existir un almacén principal en el sistema
                                </Typography>
                            </div>
                            <Switch
                                {...register('es_principal')}
                                color="blue"
                                disabled={submitting}
                            />
                        </div>

                        {!esPrincipal && (
                            <div className="flex items-center justify-between">
                                <div>
                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                        Estado Activo
                                    </Typography>
                                    <Typography variant="small" color="gray">
                                        Los almacenes inactivos no aparecen en las operaciones
                                    </Typography>
                                </div>
                                <Switch
                                    {...register('activo')}
                                    color="green"
                                    disabled={submitting}
                                />
                            </div>
                        )}
                    </div>

                    {/* Observaciones */}
                    <div>
                        <Textarea
                            label="Observaciones"
                            {...register('observaciones')}
                            disabled={submitting}
                        />
                    </div>

                    {/* ✅ AGREGAR: Preview de datos para debugging si es necesario */}
                    {loadingOpciones && (
                        <Alert color="blue">
                            <Typography variant="small">
                                Cargando opciones del sistema...
                            </Typography>
                        </Alert>
                    )}
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
};

export default AlmacenDialog;