// src/core/almacenes/pages/lotes/EntregasParcialesDialog.jsx - VERSIÓN CORREGIDA
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
    IoInformationCircle,
    IoTrash,
    IoWarning,
    IoRefresh
} from 'react-icons/io5';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../../../services/api';

const EntregasParcialesDialog = ({
                                     open = false,
                                     onClose = () => {},
                                     lote = null,
                                     opciones = {},
                                     onSuccess = () => {}
                                 }) => {
    const [entregas, setEntregas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // ✅ NUEVO: Estado para manejar opciones de eliminación
    const [confirmDelete, setConfirmDelete] = useState({
        show: false,
        entrega: null,
        loading: false,
        requiresAdvancedConfirm: false,
        confirmationData: null,
        selectedOption: null // 'desasociar' o 'eliminar_todo'
    });

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm();

    useEffect(() => {
        if (open && lote?.id) {
            console.log('📦 Cargando entregas para lote:', lote.id);
            loadEntregas();
        }
    }, [open, lote]);

    const loadEntregas = async () => {
        if (!lote?.id) return;

        try {
            setLoading(true);
            console.log('📦 Llamando a API para cargar entregas...');
            const response = await api.get(`/almacenes/lotes/${lote.id}/resumen/`);
            console.log('📦 Respuesta de entregas:', response.data);

            if (response.data.entregas_parciales) {
                setEntregas(response.data.entregas_parciales);
                console.log('📦 Entregas cargadas:', response.data.entregas_parciales.length);
            }
        } catch (error) {
            console.error('❌ Error al cargar entregas:', error);
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

            const entregaData = {
                fecha_entrega: data.fecha_entrega,
                cantidad_entregada: parseInt(data.cantidad_entregada),
                estado_entrega: parseInt(data.estado_entrega),
                observaciones: data.observaciones || ''
            };

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
                await loadEntregas();
                onSuccess();
            }
        } catch (error) {
            console.error('❌ Error completo:', error);
            toast.error(error.response?.data?.error || 'Error al crear entrega');
        } finally {
            setLoading(false);
        }
    };

    // ✅ CORREGIDO: Iniciar eliminación sin cerrar modal principal
    const iniciarEliminacion = (entrega) => {
        console.log('🗑️ Iniciando eliminación de entrega:', entrega);
        setConfirmDelete({
            show: true,
            entrega: entrega,
            loading: false
        });
    };

    // ✅ CORREGIDO: Cancelar eliminación
    const cancelarEliminacion = () => {
        console.log('❌ Cancelando eliminación');
        setConfirmDelete({
            show: false,
            entrega: null,
            loading: false
        });
    };

    // ✅ CORREGIDO: Confirmar eliminación
    const confirmarEliminacion = async () => {
        if (!confirmDelete.entrega) {
            console.error('❌ No hay entrega seleccionada para eliminar');
            return;
        }

        try {
            setConfirmDelete(prev => ({ ...prev, loading: true }));

            const url = `/almacenes/lotes/${lote.id}/eliminar/?entrega_id=${confirmDelete.entrega.id}`;
            console.log(`🗑️ FRONTEND: URL completa: ${url}`);

            const response = await api.delete(url);

            console.log('✅ BACKEND: Respuesta exitosa:', response.data);
            toast.success(response.data.message || 'Entrega eliminada correctamente');

            // Cerrar modal de confirmación
            cancelarEliminacion();

            // Recargar entregas
            await loadEntregas();

            // Notificar al componente padre
            onSuccess();

        } catch (error) {
            console.error('❌ FRONTEND: Error eliminando entrega:', error);

            // Verificar si es un error de confirmación (409)
            if (error.response?.status === 409) {
                const confirmationData = error.response.data;
                console.log('⚠️ FRONTEND: Se requiere confirmación:', confirmationData);

                // Mostrar modal de confirmación avanzada
                mostrarConfirmacionAvanzada(confirmationData);
            } else {
                const errorMessage = error.response?.data?.error || 'Error al eliminar entrega';
                toast.error(errorMessage);
                setConfirmDelete(prev => ({ ...prev, loading: false }));
            }
        }
    };
    // ✅ NUEVO: Función para mostrar confirmación avanzada
    const mostrarConfirmacionAvanzada = (confirmationData) => {
        cancelarEliminacion();

        setConfirmDelete({
            show: true,
            entrega: confirmDelete.entrega,
            loading: false,
            requiresAdvancedConfirm: true,
            confirmationData: confirmationData,
            selectedOption: null
        });
    };

// ✅ NUEVO: Función para confirmar eliminación forzada
    const confirmarEliminacionForzada = async () => {
        try {
            setConfirmDelete(prev => ({ ...prev, loading: true }));

            const url = `/almacenes/lotes/${lote.id}/eliminar/?entrega_id=${confirmDelete.entrega.id}&force=true`;
            console.log(`🗑️ FRONTEND: Eliminación forzada: ${url}`);

            const response = await api.delete(url);

            console.log('✅ BACKEND: Eliminación forzada exitosa:', response.data);
            toast.success(response.data.message || 'Entrega eliminada correctamente');

            // Cerrar modal de confirmación
            cancelarEliminacion();

            // Recargar entregas
            await loadEntregas();

            // Notificar al componente padre
            onSuccess();

        } catch (error) {
            console.error('❌ FRONTEND: Error en eliminación forzada:', error);
            const errorMessage = error.response?.data?.error || 'Error al eliminar entrega';
            toast.error(errorMessage);
            setConfirmDelete(prev => ({ ...prev, loading: false }));
        }
    };
    // ✅ ACTUALIZAR: Función para confirmar eliminación con opción seleccionada
    const confirmarEliminacionConOpcion = async () => {
        if (!confirmDelete.selectedOption) {
            toast.error('Selecciona una opción para continuar');
            return;
        }

        try {
            setConfirmDelete(prev => ({ ...prev, loading: true }));

            let url;
            if (confirmDelete.selectedOption === 'desasociar') {
                url = confirmDelete.confirmationData.opciones.desasociar.url;
            } else {
                url = confirmDelete.confirmationData.opciones.eliminar_todo.url;
            }

            console.log(`🗑️ FRONTEND: Eliminación con opción ${confirmDelete.selectedOption}: ${url}`);

            const response = await api.delete(url);

            console.log('✅ BACKEND: Eliminación exitosa:', response.data);
            toast.success(response.data.message || 'Operación completada correctamente');

            cancelarEliminacion();
            await loadEntregas();
            onSuccess();

        } catch (error) {
            console.error('❌ FRONTEND: Error en eliminación:', error);
            const errorMessage = error.response?.data?.error || 'Error en la operación';
            toast.error(errorMessage);
            setConfirmDelete(prev => ({ ...prev, loading: false }));
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

    // ✅ CORREGIDO: Manejar cierre solo del modal principal
    const handleMainModalClose = () => {
        console.log('🚪 Cerrando modal principal de entregas parciales');
        // Solo cerrar si no hay modal de confirmación abierto
        if (!confirmDelete.show) {
            setShowCreateForm(false);
            reset();
            onClose();
        }
    };

    if (!lote) {
        console.warn('⚠️ No hay lote seleccionado');
        return null;
    }

    return (
        <>
            {/* Modal principal - no se muestra si hay confirmación abierta */}
            <Dialog
                open={open && !confirmDelete.show}
                handler={handleMainModalClose}
                size="xl"
                dismiss={{
                    escapeKey: !confirmDelete.show,
                    outsidePress: !confirmDelete.show
                }}
            >
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
                        <IconButton
                            variant="text"
                            color="blue-gray"
                            onClick={loadEntregas}
                            disabled={loading}
                        >
                            <IoRefresh className="h-5 w-5" />
                        </IconButton>
                        <IconButton variant="text" color="gray" onClick={handleMainModalClose}>
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
                                    Registrar Nueva Entrega Parcial
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
                            Entregas Registradas ({entregas.length})
                        </Typography>

                        {loading ? (
                            <Card>
                                <CardBody className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <Typography color="gray">
                                        Cargando entregas...
                                    </Typography>
                                </CardBody>
                            </Card>
                        ) : entregas.length === 0 ? (
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
                                                        {entrega.created_by_nombre && (
                                                            <Typography variant="small" color="gray">
                                                                Por: {entrega.created_by_nombre}
                                                            </Typography>
                                                        )}
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

                                                    <Tooltip content="Eliminar entrega parcial">
                                                        <IconButton
                                                            variant="text"
                                                            color="red"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                iniciarEliminacion(entrega);
                                                            }}
                                                            disabled={loading || confirmDelete.loading}
                                                        >
                                                            <IoTrash className="h-4 w-4" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                            {entrega.observaciones && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <Typography variant="small" color="gray">
                                                        <strong>Observaciones:</strong> {entrega.observaciones}
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
                    <Button variant="text" color="gray" onClick={handleMainModalClose}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Modal de confirmación independiente */}
            <Dialog
                open={confirmDelete.show}
                handler={cancelarEliminacion}
                size={confirmDelete.requiresAdvancedConfirm ? "lg" : "sm"}
                dismiss={{
                    escapeKey: true,
                    outsidePress: false
                }}
                className="z-[10000]"
            >
                <DialogHeader className="flex items-center gap-2">
                    <IoWarning className="h-6 w-6 text-red-500" />
                    <Typography variant="h6" color="red">
                        {confirmDelete.requiresAdvancedConfirm ? 'Confirmación Requerida' : 'Confirmar Eliminación'}
                    </Typography>
                </DialogHeader>

                <DialogBody>
                    {confirmDelete.entrega && (
                        <div className="space-y-4">
                            {confirmDelete.requiresAdvancedConfirm ? (
                                /* Confirmación avanzada con opciones */
                                <div className="space-y-4">
                                    <Typography color="red" className="font-bold">
                                        La entrega #{confirmDelete.entrega.numero_entrega} tiene {confirmDelete.confirmationData?.materiales_info?.total_count} materiales asociados
                                    </Typography>

                                    <Typography color="blue-gray" className="font-medium">
                                        Selecciona qué deseas hacer:
                                    </Typography>

                                    {/* Opción 1: Solo desasociar */}
                                    <div
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                            confirmDelete.selectedOption === 'desasociar'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onClick={() => setConfirmDelete(prev => ({ ...prev, selectedOption: 'desasociar' }))}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                checked={confirmDelete.selectedOption === 'desasociar'}
                                                onChange={() => {}}
                                                className="mt-1"
                                            />
                                            <div>
                                                <Typography variant="small" className="font-bold text-blue-600">
                                                    Opción 1: Solo eliminar la entrega
                                                </Typography>
                                                <Typography variant="small" color="gray">
                                                    • Elimina únicamente el registro de la entrega parcial
                                                </Typography>
                                                <Typography variant="small" color="gray">
                                                    • Los {confirmDelete.confirmationData?.materiales_info?.total_count} materiales permanecen en el lote
                                                </Typography>
                                                <Typography variant="small" color="gray">
                                                    • Los materiales quedan sin número de entrega asignado
                                                </Typography>
                                                <Typography variant="small" className="text-green-600 font-medium mt-1">
                                                    ✓ Recomendado si los equipos son correctos pero la entrega fue mal registrada
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Opción 2: Eliminar todo */}
                                    <div
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                            confirmDelete.selectedOption === 'eliminar_todo'
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onClick={() => setConfirmDelete(prev => ({ ...prev, selectedOption: 'eliminar_todo' }))}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                checked={confirmDelete.selectedOption === 'eliminar_todo'}
                                                onChange={() => {}}
                                                className="mt-1"
                                            />
                                            <div>
                                                <Typography variant="small" className="font-bold text-red-600">
                                                    Opción 2: Eliminar entrega Y materiales
                                                </Typography>
                                                <Typography variant="small" color="gray">
                                                    • Elimina completamente la entrega parcial del sistema
                                                </Typography>
                                                <Typography variant="small" color="gray">
                                                    • Elimina permanentemente los {confirmDelete.confirmationData?.materiales_info?.total_count} materiales asociados
                                                </Typography>
                                                <Typography variant="small" color="gray">
                                                    • Los equipos desaparecen completamente del sistema
                                                </Typography>
                                                <Typography variant="small" className="text-red-600 font-medium mt-1">
                                                    ⚠️ Solo usar si los equipos fueron importados por error
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Muestra de materiales */}
                                    <Alert color="blue">
                                        <Typography variant="small" className="font-medium mb-2">
                                            Materiales que serán afectados (muestra de {Math.min(5, confirmDelete.confirmationData?.materiales_info?.total_count || 0)}):
                                        </Typography>
                                        <div className="max-h-32 overflow-y-auto">
                                            {confirmDelete.confirmationData?.materiales_info?.muestra?.map((material, index) => (
                                                <div key={index} className="text-xs font-mono bg-white bg-opacity-50 p-1 rounded mb-1">
                                                    ID: {material.id} | {material.codigo_interno} | MAC: {material.mac_address}
                                                </div>
                                            ))}
                                        </div>
                                        {confirmDelete.confirmationData?.materiales_info?.total_count > 5 && (
                                            <Typography variant="small" className="text-gray-600 mt-1">
                                                ... y {confirmDelete.confirmationData.materiales_info.total_count - 5} materiales más
                                            </Typography>
                                        )}
                                    </Alert>

                                    {confirmDelete.selectedOption && (
                                        <Alert color={confirmDelete.selectedOption === 'eliminar_todo' ? 'red' : 'amber'}>
                                            <Typography variant="small" className="font-bold">
                                                {confirmDelete.selectedOption === 'eliminar_todo'
                                                    ? '🚨 ATENCIÓN: Esta acción eliminará permanentemente los equipos del sistema'
                                                    : '⚠️ Los materiales permanecerán en el lote pero sin entrega asignada'
                                                }
                                            </Typography>
                                        </Alert>
                                    )}
                                </div>
                            ) : (
                                /* Confirmación simple para entregas sin materiales */
                                <div className="space-y-4">
                                    <Typography color="blue-gray">
                                        ¿Estás seguro de que deseas eliminar la entrega parcial{' '}
                                        <strong>#{confirmDelete.entrega.numero_entrega}</strong>?
                                    </Typography>

                                    <Alert color="blue">
                                        <div className="flex items-start gap-2">
                                            <IoInformationCircle className="h-5 w-5 mt-0.5" />
                                            <div>
                                                <Typography variant="small" className="font-medium mb-1">
                                                    Información de la entrega:
                                                </Typography>
                                                <ul className="text-sm space-y-1">
                                                    <li>• <strong>ID:</strong> {confirmDelete.entrega.id}</li>
                                                    <li>• <strong>Fecha:</strong> {formatDate(confirmDelete.entrega.fecha_entrega)}</li>
                                                    <li>• <strong>Cantidad:</strong> {confirmDelete.entrega.cantidad_entregada} equipos</li>
                                                    <li>• <strong>Estado:</strong> {confirmDelete.entrega.estado_entrega_info?.nombre}</li>
                                                    {confirmDelete.entrega.created_by_nombre && (
                                                        <li>• <strong>Creado por:</strong> {confirmDelete.entrega.created_by_nombre}</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </Alert>

                                    <Alert color="red">
                                        <div className="flex items-start gap-2">
                                            <IoWarning className="h-5 w-5 mt-0.5" />
                                            <div>
                                                <Typography variant="small" className="font-medium mb-1">
                                                    ⚠️ Advertencias importantes:
                                                </Typography>
                                                <ul className="text-sm space-y-1">
                                                    <li>• Esta acción no se puede deshacer</li>
                                                    <li>• Los números de entregas posteriores se reordenarán automáticamente</li>
                                                    <li>• El estado del lote se actualizará según las entregas restantes</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </Alert>
                                </div>
                            )}
                        </div>
                    )}
                </DialogBody>

                <DialogFooter className="space-x-2">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={cancelarEliminacion}
                        disabled={confirmDelete.loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        color="red"
                        onClick={confirmDelete.requiresAdvancedConfirm ? confirmarEliminacionConOpcion : confirmarEliminacion}
                        loading={confirmDelete.loading}
                        disabled={confirmDelete.requiresAdvancedConfirm && !confirmDelete.selectedOption}
                        className="flex items-center gap-2"
                    >
                        <IoTrash className="h-4 w-4" />
                        {confirmDelete.requiresAdvancedConfirm
                            ? (confirmDelete.selectedOption === 'eliminar_todo' ? 'Eliminar Todo' : 'Eliminar Solo Entrega')
                            : 'Eliminar Entrega'
                        }
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
};

export default EntregasParcialesDialog;