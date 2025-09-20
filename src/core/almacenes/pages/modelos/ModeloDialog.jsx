// src/core/almacenes/pages/modelos/ModeloDialog.jsx - SOLUCIÓN DEFINITIVA CON SELECT NATIVO
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useOpcionesCompletas } from '../../hooks/useAlmacenes';

const ModeloDialog = React.memo(({
                                     open,
                                     onClose,
                                     onSubmit,
                                     title,
                                     mode = 'create',
                                     initialData = null
                                 }) => {
    const { opciones, loading: loadingOpciones } = useOpcionesCompletas();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm({
        defaultValues: {
            nombre: '',
            codigo_modelo: '',
            marca: '',
            tipo_material: '',
            unidad_medida: '',
            requiere_inspeccion_inicial: false,
            descripcion: ''
        }
    });

    const watchTipoMaterial = watch('tipo_material');

    // Memoizar opciones seguras
    const safeOptions = useMemo(() => ({
        marcas: opciones?.marcas?.filter(marca => marca?.id && marca?.nombre && marca?.activo) || [],
        unidadesMedida: opciones?.unidades_medida?.filter(unidad => unidad?.id && unidad?.nombre && unidad?.activo) || [],
        tiposMaterial: opciones?.tipos_material?.filter(tipo => tipo?.id && tipo?.nombre) || []
    }), [opciones]);

    const categorizedTypes = useMemo(() => ({
        onus: safeOptions.tiposMaterial.filter(tipo => tipo.es_unico === true),
        generales: safeOptions.tiposMaterial.filter(tipo => tipo.es_unico === false)
    }), [safeOptions.tiposMaterial]);

    // Reset form
    useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                const formData = {
                    nombre: initialData.nombre || '',
                    codigo_modelo: initialData.codigo_modelo || '',
                    marca: initialData.marca ? initialData.marca.toString() : '',
                    tipo_material: initialData.tipo_material ? initialData.tipo_material.toString() : '',
                    unidad_medida: initialData.unidad_medida ? initialData.unidad_medida.toString() : '',
                    requiere_inspeccion_inicial: Boolean(initialData.requiere_inspeccion_inicial),
                    descripcion: initialData.descripcion || ''
                };
                reset(formData);
                console.log('Datos para edición:', formData);
            } else {
                reset({
                    nombre: '',
                    codigo_modelo: '',
                    marca: '',
                    tipo_material: '',
                    unidad_medida: '',
                    requiere_inspeccion_inicial: false,
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
            const nombre = (data.nombre || '').toString().trim();
            const codigo_modelo = (data.codigo_modelo || '').toString().trim();
            const descripcion = (data.descripcion || '').toString().trim();

            if (!nombre) throw new Error('El nombre es obligatorio');
            if (!codigo_modelo) throw new Error('El código del modelo es obligatorio');
            if (!data.marca) throw new Error('La marca es obligatoria');
            if (!data.tipo_material) throw new Error('El tipo de material es obligatorio');
            if (!data.unidad_medida) throw new Error('La unidad de medida es obligatoria');

            const modeloData = {
                nombre,
                codigo_modelo,
                marca: parseInt(data.marca),
                tipo_material: parseInt(data.tipo_material),
                unidad_medida: parseInt(data.unidad_medida),
                requiere_inspeccion_inicial: Boolean(data.requiere_inspeccion_inicial),
                descripcion
            };

            console.log('Enviando datos:', modeloData);
            const result = await onSubmit(modeloData);
            if (!result?.success) {
                setError(result?.error || 'Error al guardar el modelo');
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Error inesperado al guardar');
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

    const selectedTypeInfo = useMemo(() => {
        if (!watchTipoMaterial || loadingOpciones) return null;
        return safeOptions.tiposMaterial.find(tipo => tipo.id.toString() === watchTipoMaterial);
    }, [watchTipoMaterial, safeOptions.tiposMaterial, loadingOpciones]);

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

                    {loadingOpciones && (
                        <Alert color="blue" className="mb-4">
                            <div className="flex items-center gap-2">
                                <Spinner className="h-4 w-4" />
                                <Typography variant="small">
                                    Cargando opciones del sistema...
                                </Typography>
                            </div>
                        </Alert>
                    )}

                    {/* Información Básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Nombre del Modelo *"
                                {...register('nombre', {
                                    required: 'El nombre es obligatorio',
                                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                                    maxLength: { value: 100, message: 'Máximo 100 caracteres' }
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

                        <div>
                            <Input
                                label="Código del Modelo Sistema Sprint *"
                                {...register('codigo_modelo', {
                                    required: 'El código es obligatorio',
                                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                                    maxLength: { value: 20, message: 'Máximo 20 caracteres' }
                                })}
                                error={!!errors.codigo_modelo}
                                disabled={submitting}
                            />
                            {errors.codigo_modelo && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.codigo_modelo.message}
                                </Typography>
                            )}
                        </div>
                    </div>

                    {/* Selects nativos estilizados */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Marca */}
                        <div>
                            <div className="relative">
                                <select
                                    {...register('marca', { required: 'La marca es obligatoria' })}
                                    className={`peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 ${errors.marca ? 'border-red-500 focus:border-red-500' : ''}`}
                                    disabled={submitting || loadingOpciones}
                                >
                                    <option value="">Seleccionar marca</option>
                                    {safeOptions.marcas.map(marca => (
                                        <option key={marca.id} value={marca.id.toString()}>
                                            {marca.nombre}
                                        </option>
                                    ))}
                                </select>
                                <label className={`flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:border-gray-900 after:border-blue-gray-200 peer-focus:after:border-gray-900 ${errors.marca ? 'text-red-500 before:border-red-500 after:border-red-500 peer-focus:text-red-500 peer-focus:before:border-red-500 peer-focus:after:border-red-500' : ''}`}>
                                    Marca *
                                </label>
                            </div>
                            {errors.marca && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.marca.message}
                                </Typography>
                            )}
                        </div>

                        {/* Tipo de Material */}
                        <div>
                            <div className="relative">
                                <select
                                    {...register('tipo_material', { required: 'El tipo de material es obligatorio' })}
                                    className={`peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 ${errors.tipo_material ? 'border-red-500 focus:border-red-500' : ''}`}
                                    disabled={submitting || loadingOpciones}
                                >
                                    <option value="">Seleccionar tipo</option>
                                    {categorizedTypes.onus.length > 0 && (
                                        <optgroup label="EQUIPOS ONUs">
                                            {categorizedTypes.onus.map(tipo => (
                                                <option key={`onu-${tipo.id}`} value={tipo.id.toString()}>
                                                    {tipo.nombre} (Equipo único)
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                    {categorizedTypes.generales.length > 0 && (
                                        <optgroup label="MATERIALES GENERALES">
                                            {categorizedTypes.generales.map(tipo => (
                                                <option key={`general-${tipo.id}`} value={tipo.id.toString()}>
                                                    {tipo.nombre} (Por cantidad)
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                                <label className={`flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:border-gray-900 after:border-blue-gray-200 peer-focus:after:border-gray-900 ${errors.tipo_material ? 'text-red-500 before:border-red-500 after:border-red-500 peer-focus:text-red-500 peer-focus:before:border-red-500 peer-focus:after:border-red-500' : ''}`}>
                                    Tipo de Material *
                                </label>
                            </div>
                            {errors.tipo_material && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.tipo_material.message}
                                </Typography>
                            )}
                        </div>
                    </div>

                    {/* Unidad de Medida */}
                    <div>
                        <div className="relative">
                            <select
                                {...register('unidad_medida', { required: 'La unidad de medida es obligatoria' })}
                                className={`peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900 ${errors.unidad_medida ? 'border-red-500 focus:border-red-500' : ''}`}
                                disabled={submitting || loadingOpciones}
                            >
                                <option value="">Seleccionar unidad</option>
                                {safeOptions.unidadesMedida.map(unidad => (
                                    <option key={unidad.id} value={unidad.id.toString()}>
                                        {unidad.nombre} ({unidad.simbolo})
                                    </option>
                                ))}
                            </select>
                            <label className={`flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:border-gray-900 after:border-blue-gray-200 peer-focus:after:border-gray-900 ${errors.unidad_medida ? 'text-red-500 before:border-red-500 after:border-red-500 peer-focus:text-red-500 peer-focus:before:border-red-500 peer-focus:after:border-red-500' : ''}`}>
                                Unidad de Medida *
                            </label>
                        </div>
                        {errors.unidad_medida && (
                            <Typography variant="small" color="red" className="mt-1">
                                {errors.unidad_medida.message}
                            </Typography>
                        )}
                    </div>

                    {/* Descripción */}
                    <div>
                        <Textarea
                            label="Descripción Del Equipo ONU"
                            {...register('descripcion', {
                                maxLength: { value: 255, message: 'Máximo 255 caracteres' }
                            })}
                            error={!!errors.descripcion}
                            disabled={submitting}
                            rows={3}
                        />
                        {errors.descripcion && (
                            <Typography variant="small" color="red" className="mt-1">
                                {errors.descripcion.message}
                            </Typography>
                        )}
                    </div>

                    {/* Switch */}
                    <div className="p-4 bg-blue-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="small" color="blue-gray" className="font-medium">
                                    Requiere Inspección Inicial
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Los materiales nuevos de este modelo necesitarán inspección antes de estar disponibles
                                </Typography>
                            </div>
                            <Switch
                                {...register('requiere_inspeccion_inicial')}
                                color="blue"
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {/* Alert informativo */}
                    {selectedTypeInfo && (
                        <Alert color="blue">
                            <Typography variant="small">
                                {selectedTypeInfo.es_unico ? (
                                    <>
                                        <strong>Equipo ONU:</strong> Cada material tendrá identificadores únicos (MAC, Serial, etc.)
                                    </>
                                ) : (
                                    <>
                                        <strong>Material General:</strong> Se manejará por cantidades y no requiere identificadores únicos
                                    </>
                                )}
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
                        disabled={submitting || loadingOpciones}
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

ModeloDialog.displayName = 'ModeloDialog';

export default ModeloDialog;