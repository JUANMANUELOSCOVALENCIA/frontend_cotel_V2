// src/core/permissions/pages/Permissions/PermissionDialogs.jsx
import React from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Select,
    Option,
    Textarea,
    Alert,
    Typography,
    Chip,
    Card
} from '@material-tailwind/react';
import { useForm, Controller } from 'react-hook-form';
import { IoWarning, IoCheckmarkCircle } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { usePermissionsCRUD } from '../../hooks/usePermissions';

const PermissionDialogs = ({
                               dialogs,
                               selectedPermission,
                               confirmAction,
                               resources,
                               actions,
                               loading,
                               onCloseDialog,
                               onSuccess,
                               onPermissionAction
                           }) => {
    const { createPermission, updatePermission } = usePermissionsCRUD();

    // ========== FORMULARIO ==========

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setValue,
        watch
    } = useForm();

    const newResource = watch('recurso');

    // Efecto para llenar formulario al editar
    React.useEffect(() => {
        if (dialogs.edit && selectedPermission) {
            setValue('recurso', selectedPermission.recurso || '');
            setValue('accion', selectedPermission.accion || '');
            setValue('descripcion', selectedPermission.descripcion || '');
            setValue('activo', selectedPermission.activo);
        }
    }, [dialogs.edit, selectedPermission, setValue]);

    // ========== HANDLERS ==========

    const handleCreatePermission = async (data) => {
        const result = await createPermission(data);
        if (result.success) {
            toast.success('Permiso creado correctamente');
            reset();
            onSuccess('create');
        } else {
            toast.error(result.error);
        }
    };

    const handleEditPermission = async (data) => {
        const result = await updatePermission(selectedPermission.id, data);
        if (result.success) {
            toast.success('Permiso actualizado correctamente');
            reset();
            onSuccess('edit');
        } else {
            toast.error(result.error);
        }
    };

    const handleConfirmAction = async () => {
        if (confirmAction) {
            await onPermissionAction(confirmAction.action, confirmAction.permission);
            onSuccess('confirm');
        }
    };

    // ========== CREAR PERMISO DIALOG ==========

    const CreatePermissionDialog = () => (
        <Dialog open={dialogs.create} handler={() => onCloseDialog('create')} size="md">
            <DialogHeader>Crear Permiso</DialogHeader>
            <form onSubmit={handleSubmit(handleCreatePermission)}>
                <DialogBody divider className="space-y-4">
                    <Alert color="blue">
                        <Typography variant="small">
                            Los permisos controlan el acceso a recursos específicos del sistema.
                            Define claramente el recurso y la acción que este permiso controlará.
                        </Typography>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Recurso *"
                                {...register('recurso', {
                                    required: 'El recurso es obligatorio',
                                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                                    pattern: {
                                        value: /^[a-z0-9\-_]+$/,
                                        message: 'Solo letras minúsculas, números, guiones y guiones bajos'
                                    }
                                })}
                                error={!!errors.recurso}
                                placeholder="ej: usuarios, productos, reportes"
                            />
                            <Typography variant="small" color="gray" className="mt-1">
                                Nombre del recurso que se va a proteger
                            </Typography>
                        </div>

                        <Controller
                            name="accion"
                            control={control}
                            rules={{ required: 'La acción es obligatoria' }}
                            render={({ field }) => (
                                <div>
                                    <Select
                                        label="Acción *"
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        error={!!errors.accion}
                                    >
                                        {actions.map((action) => (
                                            <Option key={action} value={action}>
                                                {action}
                                            </Option>
                                        ))}
                                    </Select>
                                    <Typography variant="small" color="gray" className="mt-1">
                                        Acción específica sobre el recurso
                                    </Typography>
                                </div>
                            )}
                        />
                    </div>

                    <Textarea
                        label="Descripción"
                        {...register('descripcion')}
                        rows={3}
                        placeholder="Describe qué permite hacer este permiso..."
                    />

                    <Controller
                        name="activo"
                        control={control}
                        defaultValue={true}
                        render={({ field }) => (
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="permiso-activo-create"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="permiso-activo-create" className="ml-2 text-sm text-gray-700">
                                    Permiso activo
                                </label>
                            </div>
                        )}
                    />

                    {/* Requisitos de validación */}
                    <div className="p-4 bg-blue-gray-50 rounded-lg">
                        <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                            Requisitos del permiso:
                        </Typography>
                        <ul className="text-xs text-blue-gray-600 space-y-1">
                            <li className="flex items-center">
                                <span className={`mr-2 ${newResource?.length >= 2 ? 'text-green-500' : 'text-gray-400'}`}>
                                    {newResource?.length >= 2 ? '✓' : '○'}
                                </span>
                                Mínimo 2 caracteres para el recurso
                            </li>
                            <li className="flex items-center">
                                <span className={`mr-2 ${/^[a-z0-9\-_]*$/.test(newResource || '') ? 'text-green-500' : 'text-gray-400'}`}>
                                    {/^[a-z0-9\-_]*$/.test(newResource || '') ? '✓' : '○'}
                                </span>
                                Solo letras minúsculas, números y guiones
                            </li>
                        </ul>
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <Alert color="red">
                            {Object.values(errors).map((error, index) => (
                                <div key={index}>{error.message}</div>
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
                        Crear Permiso
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );

    // ========== EDITAR PERMISO DIALOG ==========

    const EditPermissionDialog = () => (
        <Dialog open={dialogs.edit} handler={() => onCloseDialog('edit')} size="md">
            <DialogHeader>Editar Permiso</DialogHeader>
            <form onSubmit={handleSubmit(handleEditPermission)}>
                <DialogBody divider className="space-y-4">
                    {selectedPermission?.esta_en_uso && (
                        <Alert color="orange">
                            <Typography variant="small">
                                Este permiso está actualmente asignado a uno o más roles.
                                Los cambios afectarán a todos los usuarios con esos roles.
                            </Typography>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Recurso *"
                            {...register('recurso', {
                                required: 'El recurso es obligatorio',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                                pattern: {
                                    value: /^[a-z0-9\-_]+$/,
                                    message: 'Solo letras minúsculas, números, guiones y guiones bajos'
                                }
                            })}
                            error={!!errors.recurso}
                            disabled={selectedPermission?.esta_en_uso}
                        />

                        <Controller
                            name="accion"
                            control={control}
                            rules={{ required: 'La acción es obligatoria' }}
                            render={({ field }) => (
                                <Select
                                    label="Acción *"
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                    error={!!errors.accion}
                                    disabled={selectedPermission?.esta_en_uso}
                                >
                                    {actions.map((action) => (
                                        <Option key={action} value={action}>
                                            {action}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        />
                    </div>

                    <Textarea
                        label="Descripción"
                        {...register('descripcion')}
                        rows={3}
                    />

                    <Controller
                        name="activo"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="permiso-activo-edit"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="permiso-activo-edit" className="ml-2 text-sm text-gray-700">
                                    Permiso activo
                                </label>
                            </div>
                        )}
                    />

                    {Object.keys(errors).length > 0 && (
                        <Alert color="red">
                            {Object.values(errors).map((error, index) => (
                                <div key={index}>{error.message}</div>
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
                    <Button type="submit" color="orange" loading={loading}>
                        Actualizar Permiso
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );

    // ========== VER PERMISO DIALOG ==========

    const ViewPermissionDialog = () => (
        <Dialog open={dialogs.view} handler={() => onCloseDialog('view')} size="md">
            <DialogHeader>Detalles del Permiso</DialogHeader>
            <DialogBody divider className="space-y-6">
                {selectedPermission ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Typography variant="h6" color="blue-gray">
                                    {selectedPermission.recurso}:{selectedPermission.accion}
                                </Typography>
                                <Typography color="gray" className="mt-1">
                                    {selectedPermission.descripcion || 'Sin descripción'}
                                </Typography>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Chip
                                        variant="ghost"
                                        size="sm"
                                        value={selectedPermission.activo ? 'Activo' : 'Inactivo'}
                                        color={selectedPermission.activo ? 'green' : 'red'}
                                    />
                                    <Chip
                                        variant="ghost"
                                        size="sm"
                                        value={selectedPermission.accion}
                                        color={getActionColor(selectedPermission.accion)}
                                        className="capitalize"
                                    />
                                </div>

                                <Typography variant="small" color="gray">
                                    Estado: {selectedPermission.esta_en_uso ? 'En uso' : 'No asignado'}
                                </Typography>

                                <Typography variant="small" color="gray">
                                    ID: {selectedPermission.id}
                                </Typography>

                                <Typography variant="small" color="gray">
                                    Creado: {new Date(selectedPermission.fecha_creacion).toLocaleDateString('es-ES')}
                                </Typography>

                                {selectedPermission.fecha_modificacion && (
                                    <Typography variant="small" color="gray">
                                        Modificado: {new Date(selectedPermission.fecha_modificacion).toLocaleDateString('es-ES')}
                                    </Typography>
                                )}
                            </div>
                        </div>

                        {selectedPermission.creado_por_nombre && (
                            <div>
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    Información de Auditoría
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Creado por: {selectedPermission.creado_por_nombre}
                                </Typography>
                            </div>
                        )}

                        {selectedPermission.esta_en_uso && (
                            <Alert color="blue">
                                <Typography variant="small">
                                    <strong>Este permiso está en uso:</strong><br />
                                    Está asignado a uno o más roles activos del sistema.
                                    Para eliminarlo, primero debe ser removido de todos los roles.
                                </Typography>
                            </Alert>
                        )}
                    </>
                ) : (
                    <div className="text-center py-4">
                        <Typography color="gray">Cargando información del permiso...</Typography>
                    </div>
                )}
            </DialogBody>
            <DialogFooter>
                <Button
                    variant="text"
                    color="gray"
                    onClick={() => onCloseDialog('view')}
                >
                    Cerrar
                </Button>
            </DialogFooter>
        </Dialog>
    );

    // ========== CONFIRMAR ELIMINACIÓN DIALOG ==========

    const ConfirmDeleteDialog = () => (
        <Dialog open={dialogs.confirm} handler={() => onCloseDialog('confirm')} size="sm">
            <DialogHeader className="flex items-center gap-2">
                <IoWarning className="h-6 w-6 text-orange-500" />
                Confirmar Eliminación
            </DialogHeader>
            <DialogBody>
                {confirmAction ? (
                    <div>
                        <Typography>
                            ¿Estás seguro de que deseas eliminar el permiso{' '}
                            <strong>
                                {confirmAction.permission?.recurso}:{confirmAction.permission?.accion}
                            </strong>?
                        </Typography>

                        <Alert color="red" className="mt-4">
                            <Typography variant="small">
                                <strong>Advertencia:</strong> Esta acción no se puede deshacer.
                                El permiso se eliminará permanentemente del sistema.
                            </Typography>
                        </Alert>

                        {confirmAction.permission?.esta_en_uso && (
                            <Alert color="orange" className="mt-2">
                                <Typography variant="small">
                                    Este permiso está actualmente en uso y no puede ser eliminado.
                                    Primero debe ser removido de todos los roles que lo usan.
                                </Typography>
                            </Alert>
                        )}
                    </div>
                ) : (
                    <Typography>
                        Cargando información del permiso...
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
                    color="red"
                    loading={loading}
                    disabled={confirmAction?.permission?.esta_en_uso}
                    onClick={handleConfirmAction}
                >
                    Eliminar
                </Button>
            </DialogFooter>
        </Dialog>
    );

    // ========== FUNCIONES AUXILIARES ==========

    const getActionColor = (action) => {
        const colors = {
            'crear': 'green',
            'leer': 'blue',
            'actualizar': 'orange',
            'eliminar': 'red',
        };
        return colors[action] || 'gray';
    };

    // ========== RENDER PRINCIPAL ==========

    return (
        <>
            <CreatePermissionDialog />
            <EditPermissionDialog />
            <ViewPermissionDialog />
            <ConfirmDeleteDialog />
        </>
    );
};

export default PermissionDialogs;