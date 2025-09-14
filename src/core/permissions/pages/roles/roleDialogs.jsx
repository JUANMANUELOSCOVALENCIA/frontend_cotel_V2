// src/core/permissions/pages/Roles/RoleDialogs.jsx
import React from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Textarea,
    Alert,
    Typography,
    Chip,
    Accordion,
    AccordionHeader,
    AccordionBody,
    Progress,
    Card,
    CardBody
} from '@material-tailwind/react';
import { useForm, Controller } from 'react-hook-form';
import {
    IoWarning,
    IoKey,
    IoChevronDown,
    IoCheckmarkCircle
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useRolesCRUD } from '../../hooks/usePermissions';

// ========== COMPONENTE OPTIMIZADO DE PERMISOS ==========
const PermissionSelector = React.memo(({
                                           readOnly = false,
                                           groupedPermissions = {},
                                           selectedPermissions = [],
                                           permissionsLoading = false,
                                           onPermissionChange,
                                           permissionAccordions = {},
                                           onToggleAccordion
                                       }) => {
    // Handlers memoizados para evitar re-renders
    const handlePermissionToggle = React.useCallback((permissionId, checked) => {
        if (readOnly || !onPermissionChange) return;

        const newPermissions = checked
            ? [...selectedPermissions, permissionId]
            : selectedPermissions.filter(id => id !== permissionId);

        onPermissionChange(newPermissions);
    }, [selectedPermissions, onPermissionChange, readOnly]);

    const handleResourceToggle = React.useCallback((resourcePermissions, checked) => {
        if (readOnly || !onPermissionChange) return;

        const permissionIds = resourcePermissions.map(p => p.id);

        if (checked) {
            const newPermissions = [...selectedPermissions];
            permissionIds.forEach(id => {
                if (!newPermissions.includes(id)) {
                    newPermissions.push(id);
                }
            });
            onPermissionChange(newPermissions);
        } else {
            onPermissionChange(
                selectedPermissions.filter(id => !permissionIds.includes(id))
            );
        }
    }, [selectedPermissions, onPermissionChange, readOnly]);

    if (permissionsLoading) {
        return (
            <div className="space-y-4">
                <Typography variant="h6" color="blue-gray">
                    Cargando permisos...
                </Typography>
                <Progress size="sm" value={50} color="orange" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Typography variant="h6" color="blue-gray">
                    Permisos ({selectedPermissions.length} seleccionados)
                </Typography>
                {!readOnly && (
                    <Typography variant="small" color="gray">
                        Selecciona los permisos para este rol
                    </Typography>
                )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg">
                {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                    <AccordionItem
                        key={resource}
                        resource={resource}
                        resourcePermissions={resourcePermissions}
                        selectedPermissions={selectedPermissions}
                        readOnly={readOnly}
                        isOpen={permissionAccordions[resource] || false}
                        onToggleAccordion={onToggleAccordion}
                        onResourceToggle={handleResourceToggle}
                        onPermissionToggle={handlePermissionToggle}
                    />
                ))}
            </div>
        </div>
    );
});

PermissionSelector.displayName = 'PermissionSelector';

// ========== COMPONENTE DE ACORDEÓN OPTIMIZADO ==========
const AccordionItem = React.memo(({
                                      resource,
                                      resourcePermissions,
                                      selectedPermissions,
                                      readOnly,
                                      isOpen,
                                      onToggleAccordion,
                                      onResourceToggle,
                                      onPermissionToggle
                                  }) => {
    const allSelected = React.useMemo(() =>
            resourcePermissions.every(p => selectedPermissions.includes(p.id)),
        [resourcePermissions, selectedPermissions]
    );

    const someSelected = React.useMemo(() =>
            resourcePermissions.some(p => selectedPermissions.includes(p.id)),
        [resourcePermissions, selectedPermissions]
    );

    const selectedCount = React.useMemo(() =>
            resourcePermissions.filter(p => selectedPermissions.includes(p.id)).length,
        [resourcePermissions, selectedPermissions]
    );

    const handleToggleAccordion = React.useCallback(() => {
        onToggleAccordion(resource);
    }, [resource, onToggleAccordion]);

    const handleResourceChange = React.useCallback((e) => {
        e.stopPropagation();
        onResourceToggle(resourcePermissions, e.target.checked);
    }, [resourcePermissions, onResourceToggle]);

    return (
        <Accordion open={isOpen}>
            <AccordionHeader
                onClick={handleToggleAccordion}
                className="border-b-0 p-3 hover:bg-gray-50"
            >
                <div className="flex items-center gap-3 w-full">
                    {!readOnly && (
                        <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => {
                                if (el) el.indeterminate = someSelected && !allSelected;
                            }}
                            onChange={handleResourceChange}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                    )}
                    <IoKey className="h-5 w-5 text-orange-500" />
                    <Typography variant="h6" className="capitalize">
                        {resource}
                    </Typography>
                    <Chip
                        size="sm"
                        variant="ghost"
                        value={`${selectedCount}/${resourcePermissions.length}`}
                        color={allSelected ? 'green' : someSelected ? 'orange' : 'gray'}
                    />
                    <IoChevronDown
                        className={`h-4 w-4 transition-transform ml-auto ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </div>
            </AccordionHeader>
            <AccordionBody className="pt-0 pb-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 ml-8">
                    {resourcePermissions.map((permission) => (
                        <PermissionItem
                            key={permission.id}
                            permission={permission}
                            isSelected={selectedPermissions.includes(permission.id)}
                            readOnly={readOnly}
                            onToggle={onPermissionToggle}
                        />
                    ))}
                </div>
            </AccordionBody>
        </Accordion>
    );
});

AccordionItem.displayName = 'AccordionItem';

// ========== COMPONENTE DE PERMISO INDIVIDUAL ==========
const PermissionItem = React.memo(({
                                       permission,
                                       isSelected,
                                       readOnly,
                                       onToggle
                                   }) => {
    const handleToggle = React.useCallback((e) => {
        onToggle(permission.id, e.target.checked);
    }, [permission.id, onToggle]);

    return (
        <div className="flex items-center">
            {!readOnly && (
                <input
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    checked={isSelected}
                    onChange={handleToggle}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
            )}
            <label
                htmlFor={`permission-${permission.id}`}
                className={`ml-2 text-sm capitalize ${
                    readOnly ? 'text-gray-600' : 'text-gray-700 cursor-pointer'
                } ${isSelected ? 'font-medium' : ''}`}
            >
                {permission.accion}
            </label>
        </div>
    );
});

PermissionItem.displayName = 'PermissionItem';

// ========== COMPONENTE PRINCIPAL OPTIMIZADO ==========
const RoleDialogs = ({
                         dialogs,
                         selectedRole,
                         confirmAction,
                         permissions,
                         groupedPermissions,
                         selectedPermissions,
                         permissionsLoading,
                         loading,
                         onCloseDialog,
                         onSuccess,
                         onRoleAction,
                         onPermissionChange
                     }) => {
    const { createRole, updateRole, cloneRole } = useRolesCRUD();

    // Estado para acordeones - inicializado una sola vez
    const [permissionAccordions, setPermissionAccordions] = React.useState(() =>
        Object.keys(groupedPermissions || {}).reduce((acc, resource) => {
            acc[resource] = false;
            return acc;
        }, {})
    );

    // Form hook
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setValue
    } = useForm();

    // ========== CALLBACKS OPTIMIZADOS ==========

    const handlePermissionChangeCallback = React.useCallback((newPermissions) => {
        onPermissionChange(newPermissions);
    }, [onPermissionChange]);

    const handleToggleAccordion = React.useCallback((resource) => {
        setPermissionAccordions(prev => ({
            ...prev,
            [resource]: !prev[resource]
        }));
    }, []);

    const handleCreateRole = React.useCallback(async (data) => {
        const roleData = {
            ...data,
            permisos_ids: selectedPermissions
        };

        const result = await createRole(roleData);
        if (result.success) {
            toast.success('Rol creado correctamente');
            reset();
            onSuccess('create');
        } else {
            if (result.error?.includes('500') || result.error?.includes('Internal Server Error')) {
                toast.warning('El rol se creó pero hubo un problema en la respuesta. Recargando...');
                reset();
                onSuccess('create');
            } else {
                toast.error(result.error);
            }
        }
    }, [selectedPermissions, createRole, reset, onSuccess]);

    const handleEditRole = React.useCallback(async (data) => {
        const roleData = {
            ...data,
            permisos_ids: selectedPermissions
        };

        const result = await updateRole(selectedRole.id, roleData);
        if (result.success) {
            toast.success('Rol actualizado correctamente');
            reset();
            onSuccess('edit');
        } else {
            toast.error(result.error);
        }
    }, [selectedPermissions, selectedRole?.id, updateRole, reset, onSuccess]);

    const handleCloneRole = React.useCallback(async (data) => {
        const result = await cloneRole(selectedRole.id, {
            nombre: data.nombre,
            descripcion: data.descripcion || ''
        });

        if (result.success) {
            toast.success('Rol clonado correctamente');
            reset();
            onSuccess('clone');
        } else {
            toast.error(result.error);
        }
    }, [selectedRole?.id, cloneRole, reset, onSuccess]);

    const handleConfirmAction = React.useCallback(async () => {
        if (confirmAction) {
            await onRoleAction(confirmAction.action, confirmAction.role);
            onSuccess('confirm');
        }
    }, [confirmAction, onRoleAction, onSuccess]);

    const handleCloseCreate = React.useCallback(() => {
        reset();
        onCloseDialog('create');
    }, [reset, onCloseDialog]);

    const handleCloseEdit = React.useCallback(() => {
        reset();
        onCloseDialog('edit');
    }, [reset, onCloseDialog]);

    const handleCloseClone = React.useCallback(() => {
        reset();
        onCloseDialog('clone');
    }, [reset, onCloseDialog]);

    // ========== EFECTOS OPTIMIZADOS ==========

    // Efecto para llenar formulario al editar/clonar - optimizado
    React.useEffect(() => {
        if (dialogs.edit && selectedRole) {
            setValue('nombre', selectedRole.nombre || '');
            setValue('descripcion', selectedRole.descripcion || '');
            setValue('activo', selectedRole.activo);
        }
    }, [dialogs.edit, selectedRole, setValue]);

    React.useEffect(() => {
        if (dialogs.clone && selectedRole) {
            setValue('nombre', `${selectedRole.nombre} (Copia)` || '');
            setValue('descripcion', selectedRole.descripcion || '');
        }
    }, [dialogs.clone, selectedRole, setValue]);

    // Actualizar acordeones cuando cambian los permisos agrupados
    React.useEffect(() => {
        if (groupedPermissions && Object.keys(groupedPermissions).length > 0) {
            setPermissionAccordions(prev => {
                const newAccordions = { ...prev };
                Object.keys(groupedPermissions).forEach(resource => {
                    if (!(resource in newAccordions)) {
                        newAccordions[resource] = false;
                    }
                });
                return newAccordions;
            });
        }
    }, [groupedPermissions]);

    // ========== COMPONENTES DE DIALOGO MEMOIZADOS ==========

    const CreateRoleDialog = React.useMemo(() => (
        <Dialog open={dialogs.create} handler={() => onCloseDialog('create')} size="lg">
            <DialogHeader>Crear Rol</DialogHeader>
            <form onSubmit={handleSubmit(handleCreateRole)}>
                <DialogBody divider className="space-y-6 max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                        <Input
                            label="Nombre del Rol *"
                            {...register('nombre', {
                                required: 'El nombre es obligatorio',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={!!errors.nombre}
                        />

                        <Textarea
                            label="Descripción"
                            {...register('descripcion')}
                            rows={3}
                        />
                    </div>

                    <PermissionSelector
                        groupedPermissions={groupedPermissions}
                        selectedPermissions={selectedPermissions}
                        permissionsLoading={permissionsLoading}
                        onPermissionChange={handlePermissionChangeCallback}
                        permissionAccordions={permissionAccordions}
                        onToggleAccordion={handleToggleAccordion}
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
                        onClick={handleCloseCreate}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" color="orange" loading={loading}>
                        Crear Rol
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    ), [
        dialogs.create,
        handleSubmit,
        handleCreateRole,
        register,
        errors,
        groupedPermissions,
        selectedPermissions,
        permissionsLoading,
        handlePermissionChangeCallback,
        permissionAccordions,
        handleToggleAccordion,
        loading,
        handleCloseCreate,
        onCloseDialog
    ]);

    const EditRoleDialog = React.useMemo(() => (
        <Dialog open={dialogs.edit} handler={() => onCloseDialog('edit')} size="lg">
            <DialogHeader>Editar Rol</DialogHeader>
            <form onSubmit={handleSubmit(handleEditRole)}>
                <DialogBody divider className="space-y-6 max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                        <Input
                            label="Nombre del Rol *"
                            {...register('nombre', {
                                required: 'El nombre es obligatorio',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={!!errors.nombre}
                        />

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
                                        id="activo-edit"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="activo-edit" className="ml-2 text-sm text-gray-700">
                                        Rol activo
                                    </label>
                                </div>
                            )}
                        />
                    </div>

                    <PermissionSelector
                        groupedPermissions={groupedPermissions}
                        selectedPermissions={selectedPermissions}
                        permissionsLoading={permissionsLoading}
                        onPermissionChange={handlePermissionChangeCallback}
                        permissionAccordions={permissionAccordions}
                        onToggleAccordion={handleToggleAccordion}
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
                        onClick={handleCloseEdit}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" color="orange" loading={loading}>
                        Actualizar Rol
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    ), [
        dialogs.edit,
        handleSubmit,
        handleEditRole,
        register,
        errors,
        control,
        groupedPermissions,
        selectedPermissions,
        permissionsLoading,
        handlePermissionChangeCallback,
        permissionAccordions,
        handleToggleAccordion,
        loading,
        handleCloseEdit,
        onCloseDialog
    ]);

    const CloneRoleDialog = React.useMemo(() => (
        <Dialog open={dialogs.clone} handler={() => onCloseDialog('clone')} size="md">
            <DialogHeader>Clonar Rol</DialogHeader>
            <form onSubmit={handleSubmit(handleCloneRole)}>
                <DialogBody divider className="space-y-4">
                    <Alert color="blue">
                        <Typography variant="small">
                            Se creará una copia del rol "{selectedRole?.nombre}" con todos sus permisos.
                        </Typography>
                    </Alert>

                    <Input
                        label="Nombre del Nuevo Rol *"
                        {...register('nombre', {
                            required: 'El nombre es obligatorio',
                            minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                        })}
                        error={!!errors.nombre}
                    />

                    <Textarea
                        label="Descripción"
                        {...register('descripcion')}
                        rows={3}
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
                        onClick={handleCloseClone}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" color="orange" loading={loading}>
                        Clonar Rol
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    ), [
        dialogs.clone,
        selectedRole?.nombre,
        handleSubmit,
        handleCloneRole,
        register,
        errors,
        loading,
        handleCloseClone,
        onCloseDialog
    ]);

    const ViewRoleDialog = React.useMemo(() => (
        <Dialog open={dialogs.view} handler={() => onCloseDialog('view')} size="lg">
            <DialogHeader>Detalles del Rol</DialogHeader>
            <DialogBody divider className="space-y-6">
                {selectedRole ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Typography variant="h6" color="blue-gray">
                                    {selectedRole.nombre}
                                </Typography>
                                <Typography color="gray" className="mt-1">
                                    {selectedRole.descripcion || 'Sin descripción'}
                                </Typography>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Chip
                                        variant="ghost"
                                        size="sm"
                                        value={selectedRole.activo ? 'Activo' : 'Inactivo'}
                                        color={selectedRole.activo ? 'green' : 'red'}
                                    />
                                    {selectedRole.es_sistema && (
                                        <Chip
                                            variant="ghost"
                                            size="sm"
                                            value="Sistema"
                                            color="blue"
                                        />
                                    )}
                                </div>

                                <Typography variant="small" color="gray">
                                    {selectedRole.cantidad_usuarios} usuarios asignados
                                </Typography>

                                <Typography variant="small" color="gray">
                                    Creado: {new Date(selectedRole.fecha_creacion).toLocaleDateString('es-ES')}
                                </Typography>
                            </div>
                        </div>

                        <div>
                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                Permisos ({selectedRole.permisos?.length || 0})
                            </Typography>

                            {selectedRole.permisos && selectedRole.permisos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(
                                        selectedRole.permisos.reduce((acc, permission) => {
                                            if (!acc[permission.recurso]) {
                                                acc[permission.recurso] = [];
                                            }
                                            acc[permission.recurso].push(permission);
                                            return acc;
                                        }, {})
                                    ).map(([resource, resourcePermissions]) => (
                                        <Card key={resource} className="p-4">
                                            <Typography variant="h6" className="capitalize mb-2">
                                                {resource}
                                            </Typography>
                                            <div className="flex flex-wrap gap-1">
                                                {resourcePermissions.map((permission) => (
                                                    <Chip
                                                        key={permission.id}
                                                        variant="ghost"
                                                        size="sm"
                                                        value={permission.accion}
                                                        color="blue"
                                                        className="capitalize"
                                                    />
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Typography color="gray">
                                    Este rol no tiene permisos asignados
                                </Typography>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <Typography color="gray">Cargando información del rol...</Typography>
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
    ), [dialogs.view, selectedRole, onCloseDialog]);

    const ConfirmDeleteDialog = React.useMemo(() => (
        <Dialog open={dialogs.confirm} handler={() => onCloseDialog('confirm')} size="sm">
            <DialogHeader className="flex items-center gap-2">
                <IoWarning className="h-6 w-6 text-orange-500" />
                Confirmar Eliminación
            </DialogHeader>
            <DialogBody>
                {confirmAction ? (
                    <div>
                        <Typography>
                            ¿Estás seguro de que deseas eliminar el rol{' '}
                            <strong>{confirmAction.role?.nombre}</strong>?
                        </Typography>

                        <Typography variant="small" color="gray" className="mt-2">
                            Esta acción no se puede deshacer.
                        </Typography>

                        {confirmAction.role?.cantidad_usuarios > 0 && (
                            <Alert color="orange" className="mt-4">
                                <Typography variant="small">
                                    Este rol tiene {confirmAction.role.cantidad_usuarios} usuarios asignados
                                    y no puede ser eliminado.
                                </Typography>
                            </Alert>
                        )}
                    </div>
                ) : (
                    <Typography>
                        Cargando información del rol...
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
                    disabled={confirmAction?.role?.cantidad_usuarios > 0}
                    onClick={handleConfirmAction}
                >
                    Eliminar
                </Button>
            </DialogFooter>
        </Dialog>
    ), [dialogs.confirm, confirmAction, loading, handleConfirmAction, onCloseDialog]);

    // ========== RENDER PRINCIPAL ==========
    return (
        <>
            {CreateRoleDialog}
            {EditRoleDialog}
            {CloneRoleDialog}
            {ViewRoleDialog}
            {ConfirmDeleteDialog}
        </>
    );
};

export default React.memo(RoleDialogs);