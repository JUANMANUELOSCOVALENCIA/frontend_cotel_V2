// src/core/almacenes/pages/lotes/loteDialogs.jsx - ACTUALIZADO CON SECTOR SOLICITANTE

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Textarea,
    Select,
    Option,
    Alert,
    Typography,
    IconButton,
    Card,
    CardBody
} from '@material-tailwind/react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { IoWarning, IoCheckmarkCircle, IoAdd, IoTrash, IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useLotes } from '../../hooks/useAlmacenes';

// Componente Modal personalizado (el mismo que creamos antes)
const Modal = ({ open, onClose, children, size = "lg" }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '0px';

            if (modalRef.current) {
                modalRef.current.focus();
            }
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [open]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && open) {
                onClose();
            }
        };

        if (open) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [open, onClose]);

    if (!open) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl'
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                ref={modalRef}
                className={`relative bg-white m-4 rounded-lg shadow-2xl text-blue-gray-500 antialiased font-sans text-base font-light leading-relaxed w-full ${sizeClasses[size]} min-w-[95%] md:min-w-[83.333333%] 2xl:min-w-[75%] max-w-[95%] md:max-w-[83.333333%] 2xl:max-w-[75%] max-h-[90vh] overflow-y-auto`}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>,
        document.body
    );
};

const LoteDialogs = ({
                         dialogs,
                         selectedLote,
                         confirmAction,
                         opciones,
                         loading,
                         onCloseDialog,
                         onSuccess,
                         onLoteAction
                     }) => {
    const { createLote, updateLote } = useLotes();

    // ========== FORMULARIO PARA CREAR/EDITAR ==========
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setValue,
        watch,
        getValues,
        clearErrors
    } = useForm({
        defaultValues: {} // ✅ INICIALIZAR COMPLETAMENTE VACÍO
    });

    // Manejo de array de detalles
    const { fields, append, remove } = useFieldArray({
        control,
        name: "detalles"
    });

    const watchTipoIngreso = watch('tipo_ingreso');

    // Efecto para llenar formulario al editar
    useEffect(() => {
        console.log('🔄 useEffect ejecutado - dialogs:', dialogs);

        if (dialogs.create) {
            console.log('🆕 Modo CREAR - Inicializando con detalles');
            reset({
                numero_lote: '',
                tipo_ingreso: '',
                proveedor: '',
                almacen_destino: '',
                tipo_servicio: '',
                sector_solicitante: '', // ✅ NUEVO CAMPO
                codigo_requerimiento_compra: '',
                codigo_nota_ingreso: '',
                fecha_recepcion: '',
                fecha_inicio_garantia: '',
                fecha_fin_garantia: '',
                observaciones: '',
                detalles: [{ modelo: '', cantidad: 1 }] // ✅ Solo en creación
            });
        } else if (dialogs.edit && selectedLote) {
            console.log('✏️ Modo EDITAR - Sin detalles');
            reset({
                numero_lote: selectedLote.numero_lote || '',
                tipo_ingreso: selectedLote.tipo_ingreso?.toString() || selectedLote.tipo_ingreso_info?.id?.toString() || '',
                proveedor: selectedLote.proveedor?.toString() || selectedLote.proveedor_info?.id?.toString() || '',
                almacen_destino: selectedLote.almacen_destino?.toString() || selectedLote.almacen_destino_info?.id?.toString() || '',
                tipo_servicio: selectedLote.tipo_servicio?.toString() || selectedLote.tipo_servicio_info?.id?.toString() || '',
                sector_solicitante: selectedLote.sector_solicitante?.toString() || selectedLote.sector_solicitante_info?.id?.toString() || '', // ✅ NUEVO CAMPO
                codigo_requerimiento_compra: selectedLote.codigo_requerimiento_compra || '',
                codigo_nota_ingreso: selectedLote.codigo_nota_ingreso || '',
                fecha_recepcion: selectedLote.fecha_recepcion || '',
                fecha_inicio_garantia: selectedLote.fecha_inicio_garantia || '',
                fecha_fin_garantia: selectedLote.fecha_fin_garantia || '',
                observaciones: selectedLote.observaciones || ''
                // ✅ NO detalles aquí
            });

            // ✅ LIMPIAR explícitamente cualquier error de detalles
            setTimeout(() => {
                clearErrors('detalles');
                console.log('🧹 Errores de detalles limpiados para edición');
            }, 100);
        }
    }, [dialogs.create, dialogs.edit, selectedLote, reset, clearErrors]);

    // ========== HANDLERS ==========
    const handleCreateLote = async (data) => {
        console.log('🔍 Datos del formulario RAW:', data);
        console.log('🔍 Sector solicitante específico:', data.sector_solicitante);

        // VALIDAR detalles
        if (!data.detalles || data.detalles.length === 0) {
            toast.error('Debe agregar al menos un modelo al lote');
            return;
        }

        const detallesValidos = data.detalles.filter(d => d.modelo && d.cantidad > 0);
        console.log('🔍 Detalles válidos:', detallesValidos);

        if (detallesValidos.length !== data.detalles.length) {
            toast.error('Todos los detalles deben tener modelo y cantidad válida');
            return;
        }

        // VERIFICAR que todos los parseInt no devuelvan NaN
        console.log('🔍 Verificando campos numéricos:');
        const numericFields = ['tipo_ingreso', 'tipo_servicio', 'proveedor', 'almacen_destino', 'sector_solicitante'];

        for (const field of numericFields) {
            console.log(`${field}:`, data[field], '→ parseInt:', parseInt(data[field]));
            if (isNaN(parseInt(data[field]))) {
                toast.error(`Error en ${field} - valor inválido`);
                console.error(`❌ Campo ${field} devolvió NaN`);
                return;
            }
        }

        // ESTRUCTURA EXACTA
        const loteData = {
            numero_lote: data.numero_lote?.trim(),
            tipo_ingreso: parseInt(data.tipo_ingreso),
            tipo_servicio: parseInt(data.tipo_servicio),
            proveedor: parseInt(data.proveedor),
            almacen_destino: parseInt(data.almacen_destino),
            sector_solicitante: parseInt(data.sector_solicitante), // ✅ NUEVO CAMPO
            codigo_requerimiento_compra: data.codigo_requerimiento_compra?.trim(),
            codigo_nota_ingreso: data.codigo_nota_ingreso?.trim(),
            fecha_recepcion: data.fecha_recepcion,
            fecha_inicio_garantia: data.fecha_inicio_garantia,
            fecha_fin_garantia: data.fecha_fin_garantia,
            observaciones: data.observaciones?.trim() || '',
            detalles: detallesValidos.map(detalle => ({
                modelo: parseInt(detalle.modelo),
                cantidad: parseInt(detalle.cantidad)
            }))
        };

        console.log('📤 Datos FINALES enviados al backend:', JSON.stringify(loteData, null, 2));

        const result = await createLote(loteData);
        console.log('📥 Respuesta del backend:', result);

        if (result.success) {
            toast.success('Lote creado correctamente');
            reset();
            onSuccess('create');
        } else {
            console.error('❌ Error del backend:', result.error);
            toast.error(result.error);
        }
    };

    const handleEditLote = async (data) => {
        console.log('🔍 EDIT - Datos del formulario completo:', data);

        // ✅ IGNORAR errores de detalles en edición
        if (errors.detalles) {
            console.log('ℹ️ Ignorando errores de detalles en modo edición');
            clearErrors('detalles');
        }
        // Verificar campos numéricos
        const numericFields = ['tipo_ingreso', 'tipo_servicio', 'proveedor', 'almacen_destino', 'sector_solicitante'];
        for (const field of numericFields) {
            if (data[field] && isNaN(parseInt(data[field]))) {
                toast.error(`Error en el campo ${field}: valor inválido`);
                console.error(`❌ Campo ${field} no es numérico:`, data[field]);
                return;
            }
        }

        // Estructura completa para edición
        const loteData = {
            numero_lote: data.numero_lote?.trim(),
            tipo_ingreso: parseInt(data.tipo_ingreso),
            tipo_servicio: parseInt(data.tipo_servicio),
            proveedor: parseInt(data.proveedor),
            almacen_destino: parseInt(data.almacen_destino),
            sector_solicitante: parseInt(data.sector_solicitante), // ✅ NUEVO CAMPO
            codigo_requerimiento_compra: data.codigo_requerimiento_compra?.trim(),
            codigo_nota_ingreso: data.codigo_nota_ingreso?.trim(),
            fecha_recepcion: data.fecha_recepcion,
            fecha_inicio_garantia: data.fecha_inicio_garantia,
            fecha_fin_garantia: data.fecha_fin_garantia,
            observaciones: data.observaciones?.trim() || ''
        };

        console.log('📤 EDIT - Datos FINALES enviados:', JSON.stringify(loteData, null, 2));

        try {
            const result = await updateLote(selectedLote.id, loteData);
            console.log('📥 EDIT - Respuesta del backend:', result);

            if (result.success) {
                toast.success('Lote actualizado correctamente');
                reset();
                onSuccess('edit');
            } else {
                console.error('❌ EDIT - Error del backend:', result.error);
                toast.error(result.error);
            }
        } catch (error) {
            console.error('❌ EDIT - Exception:', error);
            toast.error('Error al actualizar lote');
        }
    };

    const handleConfirmAction = async () => {
        console.log('🚨 CONFIRMAR ACCIÓN - Ejecutando:', confirmAction);

        if (confirmAction) {
            console.log('🚨 CONFIRMAR - Llamando onLoteAction con:', {
                action: confirmAction.action,
                lote: confirmAction.lote
            });

            try {
                await onLoteAction(confirmAction.action, confirmAction.lote);
                console.log('✅ CONFIRMAR - onLoteAction completada');
                onSuccess('confirm');
            } catch (error) {
                console.error('❌ CONFIRMAR - Error en onLoteAction:', error);
            }
        } else {
            console.warn('⚠️ CONFIRMAR - No hay confirmAction definida');
        }
    };

    const getActionText = (action) => {
        switch (action) {
            case 'delete': return 'eliminar';
            case 'close': return 'cerrar';
            case 'reopen': return 'reabrir';
            default: return '';
        }
    };

    const agregarDetalle = () => {
        append({ modelo: '', cantidad: 1 });
    };

    const removerDetalle = (index) => {
        if (fields.length > 1) {
            remove(index);
        } else {
            toast.warning('Debe mantener al menos un detalle');
        }
    };

    // ========== CREAR LOTE DIALOG ==========
    const CreateLoteDialog = () => (
        <Modal
            open={dialogs.create}
            onClose={() => onCloseDialog('create')}
            size="xl"
        >
            <DialogHeader className="flex items-center justify-between">
                <Typography variant="h5" color="blue-gray">
                    Crear Nuevo Lote
                </Typography>
                <IconButton
                    variant="text"
                    color="blue-gray"
                    onClick={() => {
                        reset();
                        onCloseDialog('create');
                    }}
                >
                    <IoClose className="h-5 w-5" />
                </IconButton>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleCreateLote)}>
                <DialogBody divider className="space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Información Básica */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="mb-3">
                            📋 Información Básica
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Número de Lote *"
                                {...register('numero_lote', {
                                    required: 'El número de lote es obligatorio',
                                    minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                                })}
                                error={!!errors.numero_lote}
                            />

                            <Controller
                                name="tipo_ingreso"
                                control={control}
                                rules={{ required: 'El tipo de ingreso es obligatorio' }}
                                render={({ field }) => (
                                    <Select
                                        label="Tipo de Ingreso *"
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        error={!!errors.tipo_ingreso}
                                    >
                                        {opciones?.tipos_ingreso?.length > 0 ? (
                                            opciones.tipos_ingreso.map((tipo) => (
                                                <Option key={tipo.id} value={tipo.id.toString()}>
                                                    {tipo.nombre}
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="" disabled>No hay tipos disponibles</Option>
                                        )}
                                    </Select>
                                )}
                            />

                            <Controller
                                name="proveedor"
                                control={control}
                                rules={{ required: 'El proveedor es obligatorio' }}
                                render={({ field }) => (
                                    <Select
                                        label="Proveedor *"
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        error={!!errors.proveedor}
                                    >
                                        {opciones?.proveedores?.length > 0 ? (
                                            opciones.proveedores.map((proveedor) => (
                                                <Option key={proveedor.id} value={proveedor.id.toString()}>
                                                    {proveedor.nombre_comercial}
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="" disabled>No hay proveedores disponibles</Option>
                                        )}
                                    </Select>
                                )}
                            />

                            <Controller
                                name="almacen_destino"
                                control={control}
                                rules={{ required: 'El almacén destino es obligatorio' }}
                                render={({ field }) => (
                                    <Select
                                        label="Almacén Destino *"
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        error={!!errors.almacen_destino}
                                    >
                                        {opciones?.almacenes?.length > 0 ? (
                                            opciones.almacenes.map((almacen) => (
                                                <Option key={almacen.id} value={almacen.id.toString()}>
                                                    {almacen.nombre} ({almacen.codigo})
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="" disabled>No hay almacenes disponibles</Option>
                                        )}
                                    </Select>
                                )}
                            />

                            <Controller
                                name="tipo_servicio"
                                control={control}
                                rules={{ required: 'El tipo de servicio es obligatorio' }}
                                render={({ field }) => (
                                    <Select
                                        label="Tipo de Servicio *"
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        error={!!errors.tipo_servicio}
                                    >
                                        {opciones.tipos_servicio?.length > 0 ? (
                                            opciones.tipos_servicio.map((tipo) => (
                                                <Option key={tipo.id} value={tipo.id.toString()}>
                                                    {tipo.nombre}
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="" disabled>No hay tipos disponibles</Option>
                                        )}
                                    </Select>
                                )}
                            />

                            {/* ✅ NUEVO CAMPO: SECTOR SOLICITANTE */}
                            <Controller
                                name="sector_solicitante"
                                control={control}
                                rules={{ required: 'El sector solicitante es obligatorio' }}
                                render={({ field }) => (
                                    <Select
                                        label="Sector Solicitante *"
                                        value={field.value || ''} // ✅ AGREGAR || ''
                                        onChange={(value) => {
                                            console.log('🔍 Sector seleccionado:', value); // ✅ DEBUG
                                            field.onChange(value);
                                        }}
                                        error={!!errors.sector_solicitante}
                                    >
                                        {opciones?.sectores_solicitantes?.length > 0 ? (
                                            opciones.sectores_solicitantes.map((sector) => (
                                                <Option key={sector.id} value={sector.id.toString()}>
                                                    {sector.nombre}
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="" disabled>No hay sectores disponibles</Option>
                                        )}
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Resto del formulario permanece igual... */}
                    {/* Modelos y Cantidades */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Typography variant="h6" color="blue-gray">
                                📦 Modelos y Cantidades
                            </Typography>
                            <Button
                                size="sm"
                                variant="outlined"
                                color="blue"
                                className="flex items-center gap-2"
                                onClick={agregarDetalle}
                                type="button"
                            >
                                <IoAdd className="h-4 w-4" />
                                Agregar Modelo
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <Card key={field.id} className="bg-blue-gray-50">
                                    <CardBody className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <Controller
                                                    name={`detalles.${index}.modelo`}
                                                    control={control}
                                                    rules={{ required: 'Selecciona un modelo' }}
                                                    render={({ field }) => (
                                                        <Select
                                                            label="Modelo *"
                                                            value={field.value}
                                                            onChange={(value) => field.onChange(value)}
                                                            error={!!errors?.detalles?.[index]?.modelo}
                                                        >
                                                            {opciones?.modelos?.length > 0 ? (
                                                                opciones.modelos.map((modelo) => (
                                                                    <Option key={modelo.id} value={modelo.id.toString()}>
                                                                        {modelo.marca_info?.nombre} {modelo.nombre}
                                                                        {modelo.tipo_material_info?.es_unico ? ' (ONU)' : ' (Material)'}
                                                                    </Option>
                                                                ))
                                                            ) : (
                                                                <Option value="" disabled>No hay modelos disponibles</Option>
                                                            )}
                                                        </Select>
                                                    )}
                                                />
                                            </div>

                                            <div className="w-32">
                                                <Input
                                                    type="number"
                                                    label="Cantidad *"
                                                    min="1"
                                                    {...register(`detalles.${index}.cantidad`, {
                                                        required: 'La cantidad es obligatoria',
                                                        min: { value: 1, message: 'Mínimo 1' }
                                                    })}
                                                    error={!!errors?.detalles?.[index]?.cantidad}
                                                />
                                            </div>

                                            <IconButton
                                                variant="text"
                                                color="red"
                                                size="sm"
                                                onClick={() => removerDetalle(index)}
                                                disabled={fields.length === 1}
                                                type="button"
                                            >
                                                <IoTrash className="h-4 w-4" />
                                            </IconButton>
                                        </div>

                                        {(errors?.detalles?.[index]?.modelo || errors?.detalles?.[index]?.cantidad) && (
                                            <div className="mt-2">
                                                <Typography variant="small" color="red">
                                                    {errors?.detalles?.[index]?.modelo?.message ||
                                                        errors?.detalles?.[index]?.cantidad?.message}
                                                </Typography>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            ))}
                        </div>

                        <Alert color="blue" className="mt-3">
                            <Typography variant="small">
                                💡 <strong>Tip:</strong> Agrega todos los modelos que vendrán en este lote con sus cantidades respectivas.
                                Después podrás importar masivamente los equipos específicos.
                            </Typography>
                        </Alert>
                    </div>

                    {/* Códigos de Referencia */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="mb-3">
                            🏢 Códigos Sistema Sprint
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Código Requerimiento Compra Sprint *"
                                {...register('codigo_requerimiento_compra', {
                                    required: 'El código de requerimiento es obligatorio',
                                    pattern: {
                                        value: /^\d{6,10}$/,
                                        message: 'Debe tener entre 6 y 10 dígitos numéricos'
                                    }
                                })}
                                error={!!errors.codigo_requerimiento_compra}
                            />

                            <Input
                                label="Código Nota Ingreso Sprint*"
                                {...register('codigo_nota_ingreso', {
                                    required: 'El código de nota de ingreso es obligatorio',
                                    pattern: {
                                        value: /^\d{6,10}$/,
                                        message: 'Debe tener entre 6 y 10 dígitos numéricos'
                                    }
                                })}
                                error={!!errors.codigo_nota_ingreso}
                            />
                        </div>
                    </div>

                    {/* Fechas */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="mb-3">
                            📅 Fechas
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                type="date"
                                label="Fecha Recepción *"
                                {...register('fecha_recepcion', {
                                    required: 'La fecha de recepción es obligatoria'
                                })}
                                error={!!errors.fecha_recepcion}
                            />

                            <Input
                                type="date"
                                label="Inicio Garantía"
                                {...register('fecha_inicio_garantia')}
                                error={!!errors.fecha_inicio_garantia}
                            />

                            <Input
                                type="date"
                                label="Fin Garantía"
                                {...register('fecha_fin_garantia')}
                                error={!!errors.fecha_fin_garantia}
                            />
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <Textarea
                            label="Observaciones"
                            {...register('observaciones')}
                            rows={3}
                        />
                    </div>

                    {/* Alertas específicas */}
                    {watchTipoIngreso === '1' && (
                        <Alert color="blue">
                            <Typography variant="small">
                                <strong>Lote NUEVO:</strong> Los materiales deberán pasar por inspección inicial.
                            </Typography>
                        </Alert>
                    )}

                    {Object.keys(errors).length > 0 && (
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
                    <Button
                        variant="text"
                        color="gray"
                        onClick={() => {
                            reset();
                            onCloseDialog('create');
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" color="orange" loading={loading}>
                        Crear Lote Completo
                    </Button>
                </DialogFooter>
            </form>
        </Modal>
    );

    // ========== EDITAR LOTE DIALOG ==========
    const EditLoteDialog = () => (
        <Modal
            open={dialogs.edit}
            onClose={() => onCloseDialog('edit')}
            size="xl"
        >
            <DialogHeader className="flex items-center justify-between">
                <Typography variant="h5" color="blue-gray">
                    Editar Lote: {selectedLote?.numero_lote}
                </Typography>
                <IconButton
                    variant="text"
                    color="blue-gray"
                    onClick={() => {
                        reset();
                        onCloseDialog('edit');
                    }}
                >
                    <IoClose className="h-5 w-5" />
                </IconButton>
            </DialogHeader>

            <form onSubmit={handleSubmit(
                (data) => {
                    console.log('✅ FORM VÁLIDO - Enviando:', data);
                    handleEditLote(data);
                },
                (errors) => {
                    console.error('❌ ERRORES DE VALIDACIÓN:', errors);
                    toast.error('Hay errores en el formulario');
                }
            )}>
                <DialogBody divider className="space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Información Básica */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="mb-3">
                            📋 Información Básica
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Número de Lote *"
                                {...register('numero_lote', {
                                    required: 'El número de lote es obligatorio',
                                    minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                                })}
                                error={!!errors.numero_lote}
                            />

                            <Controller
                                name="tipo_ingreso"
                                control={control}
                                rules={{ required: 'El tipo de ingreso es obligatorio' }}
                                render={({ field }) => (
                                    <Select
                                        label="Tipo de Ingreso *"
                                        value={field.value?.toString() || ''}
                                        onChange={(value) => field.onChange(value)}
                                        error={!!errors.tipo_ingreso}
                                    >
                                        {opciones?.tipos_ingreso?.length > 0 ? (
                                            opciones.tipos_ingreso.map((tipo) => (
                                                <Option key={tipo.id} value={tipo.id.toString()}>
                                                    {tipo.nombre}
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="" disabled>No hay tipos disponibles</Option>
                                        )}
                                    </Select>
                                )}
                            />

                            <Controller
                                name="proveedor"
                                control={control}
                                rules={{ required: 'El proveedor es obligatorio' }}
                                render={({ field }) => (
                                    <Select
                                        label="Proveedor *"
                                        value={field.value?.toString() || ''}
                                        onChange={(value) => field.onChange(value)}
                                        error={!!errors.proveedor}
                                    >
                                        {opciones?.proveedores?.length > 0 ? (
                                            opciones.proveedores.map((proveedor) => (
                                                <Option key={proveedor.id} value={proveedor.id.toString()}>
                                                    {proveedor.nombre_comercial}
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="" disabled>No hay proveedores disponibles</Option>
                                        )}
                                    </Select>
                                )}
                            />

                            <Controller
                                name="almacen_destino"
                                control={control}
                                rules={{ required: 'El almacén destino es obligatorio' }}
                                render={({ field }) => (
                                    <Select
                                        label="Almacén Destino *"
                                        value={field.value?.toString() || ''}
                                        onChange={(value) => field.onChange(value)}
                                        error={!!errors.almacen_destino}
                                    >
                                        {opciones?.almacenes?.length > 0 ? (
                                            opciones.almacenes.map((almacen) => (
                                                <Option key={almacen.id} value={almacen.id.toString()}>
                                                    {almacen.nombre} ({almacen.codigo})
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="" disabled>No hay almacenes disponibles</Option>
                                        )}
                                    </Select>
                                )}
                            />

                            <Controller
                                name="tipo_servicio"
                                control={control}
                                rules={{ required: 'El tipo de servicio es obligatorio' }}
                                render={({ field }) => (
                                    <Select
                                        label="Tipo de Servicio *"
                                        value={field.value?.toString() || ''}
                                        onChange={(value) => field.onChange(value)}
                                        error={!!errors.tipo_servicio}
                                    >
                                        {opciones.tipos_servicio?.length > 0 ? (
                                            opciones.tipos_servicio.map((tipo) => (
                                                <Option key={tipo.id} value={tipo.id.toString()}>
                                                    {tipo.nombre}
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="" disabled>No hay tipos disponibles</Option>
                                        )}
                                    </Select>
                                )}
                            />

                            {/* ✅ NUEVO CAMPO: SECTOR SOLICITANTE EN EDITAR */}
                            <Controller
                                name="sector_solicitante"
                                control={control}
                                rules={{ required: 'El sector solicitante es obligatorio' }}
                                render={({ field }) => (
                                    <Select
                                        label="Sector Solicitante *"
                                        value={field.value?.toString() || ''}
                                        onChange={(value) => field.onChange(value)}
                                        error={!!errors.sector_solicitante}
                                    >
                                        {opciones?.sectores_solicitantes?.length > 0 ? (
                                            opciones.sectores_solicitantes.map((sector) => (
                                                <Option key={sector.id} value={sector.id.toString()}>
                                                    {sector.nombre}
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="" disabled>No hay sectores disponibles</Option>
                                        )}
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Resto del formulario de editar permanece igual... */}
                    {/* Códigos de Referencia */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="mb-3">
                            🏢 Códigos Sistema Sprint
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Código Requerimiento Compra Sprint *"
                                {...register('codigo_requerimiento_compra', {
                                    required: 'El código de requerimiento es obligatorio',
                                    pattern: {
                                        value: /^\d{6,10}$/,
                                        message: 'Debe tener entre 6 y 10 dígitos numéricos'
                                    }
                                })}
                                error={!!errors.codigo_requerimiento_compra}
                            />

                            <Input
                                label="Código Nota Ingreso Sprint *"
                                {...register('codigo_nota_ingreso', {
                                    required: 'El código de nota de ingreso es obligatorio',
                                    pattern: {
                                        value: /^\d{6,10}$/,
                                        message: 'Debe tener entre 6 y 10 dígitos numéricos'
                                    }
                                })}
                                error={!!errors.codigo_nota_ingreso}
                            />
                        </div>
                    </div>

                    {/* Fechas */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="mb-3">
                            📅 Fechas
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                type="date"
                                label="Fecha Recepción *"
                                {...register('fecha_recepcion', {
                                    required: 'La fecha de recepción es obligatoria'
                                })}
                                error={!!errors.fecha_recepcion}
                            />

                            <Input
                                type="date"
                                label="Inicio Garantía"
                                {...register('fecha_inicio_garantia')}
                                error={!!errors.fecha_inicio_garantia}
                            />

                            <Input
                                type="date"
                                label="Fin Garantía"
                                {...register('fecha_fin_garantia')}
                                error={!!errors.fecha_fin_garantia}
                            />
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <Textarea
                            label="Observaciones"
                            {...register('observaciones')}
                            rows={3}
                        />
                    </div>

                    {/* Información del estado actual */}
                    {selectedLote && (
                        <Alert color="blue" className="mt-4">
                            <Typography variant="small">
                                <strong>Estado actual:</strong> {selectedLote.estado_info?.nombre}
                                <br />
                                <strong>Progreso:</strong> {selectedLote.cantidad_recibida || 0}/{selectedLote.cantidad_total || 0} materiales
                                <br />
                                <strong>Sector:</strong> {selectedLote.sector_solicitante_info?.nombre || 'No asignado'}
                                <br />
                                <strong>Detalles:</strong> Los modelos y cantidades no se pueden editar una vez creado el lote
                            </Typography>
                        </Alert>
                    )}

                    {/* Errores */}
                    {Object.keys(errors).length > 0 && (
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
                    <Button
                        variant="text"
                        color="gray"
                        onClick={() => {
                            reset();
                            onCloseDialog('edit');
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        color="orange"
                        loading={loading}
                    >
                        Actualizar Lote
                    </Button>
                </DialogFooter>
            </form>
        </Modal>
    );

    // ========== CONFIRMAR ACCIÓN DIALOG ==========
    const ConfirmActionDialog = () => (
        <Modal
            open={dialogs.confirm}
            onClose={() => onCloseDialog('confirm')}
            size="sm"
        >
            <DialogHeader className="flex items-center gap-2">
                <IoWarning className="h-6 w-6 text-orange-500" />
                Confirmar Acción
            </DialogHeader>

            <DialogBody>
                {confirmAction ? (
                    <div>
                        <Typography>
                            ¿Estás seguro de que deseas {getActionText(confirmAction.action)} el lote{' '}
                            <strong>{confirmAction.lote?.numero_lote}</strong>?
                        </Typography>

                        {confirmAction.action === 'delete' && (
                            <Typography variant="small" color="red" className="mt-2">
                                Esta acción eliminará el lote y no se puede deshacer.
                            </Typography>
                        )}
                    </div>
                ) : (
                    <Typography>
                        Cargando información de la acción...
                    </Typography>
                )}
            </DialogBody>

            <DialogFooter className="space-x-2">
                <Button
                    variant="text"
                    color="gray"
                    onClick={() => onCloseDialog('confirm')}
                >
                    Cancelar
                </Button>
                <Button
                    color={confirmAction?.action === 'delete' ? 'red' : 'orange'}
                    loading={loading}
                    onClick={handleConfirmAction}
                >
                    Confirmar
                </Button>
            </DialogFooter>
        </Modal>
    );

    // ========== RENDER PRINCIPAL ==========
    return (
        <>
            <CreateLoteDialog />
            <EditLoteDialog />
            <ConfirmActionDialog />
        </>
    );
};

export default LoteDialogs;