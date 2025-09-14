// src/core/permissions/pages/Users/UserDialogs.jsx
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
    Alert,
    Typography
} from '@material-tailwind/react';
import { useForm, Controller } from 'react-hook-form';
import { IoWarning, IoCheckmarkCircle, IoPersonAdd } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useUsersCRUD } from '../../hooks/usePermissions';

const UserDialogs = ({
                         dialogs,
                         selectedUser,
                         confirmAction,
                         roles,
                         loading,
                         onCloseDialog,
                         onSuccess,
                         onUserAction
                     }) => {
    const { createUser, updateUser } = useUsersCRUD();

    // ========== FORMULARIO PARA CREAR/EDITAR ==========

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setValue
    } = useForm();

    // Efecto para llenar formulario al editar
    React.useEffect(() => {
        if (dialogs.edit && selectedUser) {
            setValue('nombres', selectedUser.nombres || '');
            setValue('apellidopaterno', selectedUser.apellidopaterno || '');
            setValue('apellidomaterno', selectedUser.apellidomaterno || '');
            setValue('rol', selectedUser.rol_id || '');
        }
    }, [dialogs.edit, selectedUser, setValue]);

    // ========== HANDLERS ==========

    const handleCreateUser = async (data) => {
        const result = await createUser(data);
        if (result.success) {
            toast.success('Usuario creado correctamente');
            reset();
            onSuccess('create');
        } else {
            toast.error(result.error);
        }
    };

    const handleEditUser = async (data) => {
        const updateData = {
            nombres: data.nombres,
            apellidopaterno: data.apellidopaterno,
            apellidomaterno: data.apellidomaterno,
            rol: parseInt(data.rol)
        };

        const result = await updateUser(selectedUser.id, updateData);
        if (result.success) {
            toast.success('Usuario actualizado correctamente');
            reset();
            onSuccess('edit');
        } else {
            toast.error(result.error);
        }
    };

    const handleConfirmAction = async () => {
        if (confirmAction) {
            await onUserAction(confirmAction.action, confirmAction.user);
            onSuccess('confirm');
        }
    };

    const getActionText = (action) => {
        switch (action) {
            case 'activate': return 'activar';
            case 'deactivate': return 'desactivar';
            case 'delete': return 'eliminar';
            case 'restore': return 'restaurar';
            case 'resetPassword': return 'resetear la contraseña de';
            case 'unlock': return 'desbloquear';
            default: return '';
        }
    };

    // ========== CREAR USUARIO DIALOG ==========

    const CreateUserDialog = () => (
        <Dialog
            open={dialogs.create}
            handler={() => onCloseDialog('create')}
            size="md"
        >
            <DialogHeader>Crear Usuario</DialogHeader>
            <form onSubmit={handleSubmit(handleCreateUser)}>
                <DialogBody divider className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nombres *"
                            {...register('nombres', {
                                required: 'Los nombres son obligatorios',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={!!errors.nombres}
                        />
                        <Input
                            label="Apellido Paterno *"
                            {...register('apellidopaterno', {
                                required: 'El apellido paterno es obligatorio',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={!!errors.apellidopaterno}
                        />
                        <Input
                            label="Apellido Materno *"
                            {...register('apellidomaterno', {
                                required: 'El apellido materno es obligatorio',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={!!errors.apellidomaterno}
                        />
                        <Controller
                            name="rol"
                            control={control}
                            rules={{ required: 'El rol es obligatorio' }}
                            render={({ field }) => (
                                <Select
                                    label="Rol *"
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                    error={!!errors.rol}
                                >
                                    {roles.map((role) => (
                                        <Option key={role.id} value={role.id.toString()}>
                                            {role.nombre}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        />
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
                        Crear Usuario
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );

    // ========== EDITAR USUARIO DIALOG ==========

    const EditUserDialog = () => (
        <Dialog
            open={dialogs.edit}
            handler={() => onCloseDialog('edit')}
            size="md"
        >
            <DialogHeader>Editar Usuario</DialogHeader>
            <form onSubmit={handleSubmit(handleEditUser)}>
                <DialogBody divider className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nombres *"
                            {...register('nombres', {
                                required: 'Los nombres son obligatorios',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={!!errors.nombres}
                        />
                        <Input
                            label="Apellido Paterno *"
                            {...register('apellidopaterno', {
                                required: 'El apellido paterno es obligatorio',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={!!errors.apellidopaterno}
                        />
                        <Input
                            label="Apellido Materno *"
                            {...register('apellidomaterno', {
                                required: 'El apellido materno es obligatorio',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={!!errors.apellidomaterno}
                        />
                        <Controller
                            name="rol"
                            control={control}
                            rules={{ required: 'El rol es obligatorio' }}
                            render={({ field }) => (
                                <Select
                                    label="Rol *"
                                    value={field.value ? field.value.toString() : ''}
                                    onChange={(value) => {
                                        const roleId = parseInt(value);
                                        field.onChange(roleId);
                                    }}
                                    error={!!errors.rol}
                                >
                                    {roles.map((role) => (
                                        <Option key={role.id} value={role.id.toString()}>
                                            {role.nombre}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        />
                    </div>

                    {selectedUser && (
                        <Alert color="blue" className="mt-4">
                            <Typography variant="small">
                                Código COTEL: {selectedUser.codigocotel}
                                {selectedUser.tipo_usuario === 'migrado' && (
                                    <span className="ml-2 text-xs">(Usuario migrado - datos limitados)</span>
                                )}
                            </Typography>
                        </Alert>
                    )}

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
                        Actualizar Usuario
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );

    // ========== MIGRAR EMPLEADO DIALOG ==========

    const MigrateUserDialog = () => (
        <Dialog
            open={dialogs.migrate}
            handler={() => onCloseDialog('migrate')}
            size="md"
        >
            <DialogHeader>Migrar Empleado</DialogHeader>
            <DialogBody divider>
                <Typography color="gray" className="mb-4">
                    Funcionalidad para migrar empleados desde el sistema legacy.
                </Typography>
                <Alert color="amber">
                    <Typography variant="small">
                        Esta funcionalidad estará disponible próximamente.
                    </Typography>
                </Alert>
            </DialogBody>
            <DialogFooter>
                <Button
                    variant="text"
                    color="gray"
                    onClick={() => onCloseDialog('migrate')}
                >
                    Cerrar
                </Button>
            </DialogFooter>
        </Dialog>
    );

    // ========== CONFIRMAR ACCIÓN DIALOG ==========

    const ConfirmActionDialog = () => (
        <Dialog
            open={dialogs.confirm}
            handler={() => onCloseDialog('confirm')}
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
                            ¿Estás seguro de que deseas {getActionText(confirmAction.action)} al usuario{' '}
                            <strong>{confirmAction.user?.nombre_completo}</strong>?
                        </Typography>

                        {confirmAction.action === 'resetPassword' && (
                            <Typography variant="small" color="gray" className="mt-2">
                                La nueva contraseña será el código COTEL del usuario.
                            </Typography>
                        )}

                        {confirmAction.action === 'delete' && (
                            <Typography variant="small" color="red" className="mt-2">
                                Esta acción eliminará lógicamente al usuario. Podrá ser restaurado posteriormente.
                            </Typography>
                        )}

                        {confirmAction.action === 'restore' && (
                            <Alert color="green" className="mt-4">
                                <Typography variant="small">
                                    <strong>Al restaurar:</strong><br />
                                    • El usuario volverá a estar activo en el sistema<br />
                                    • Recuperará su acceso y permisos<br />
                                    • Aparecerá nuevamente en la lista de usuarios activos
                                </Typography>
                            </Alert>
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
                    color={confirmAction?.action === 'delete' ? 'red' :
                        confirmAction?.action === 'restore' ? 'green' : 'orange'}
                    loading={loading}
                    onClick={handleConfirmAction}
                >
                    {confirmAction?.action === 'restore' ? 'Restaurar' : 'Confirmar'}
                </Button>
            </DialogFooter>
        </Dialog>
    );

    // ========== RENDER PRINCIPAL ==========

    return (
        <>
            <CreateUserDialog />
            <EditUserDialog />
            <MigrateUserDialog />
            <ConfirmActionDialog />
        </>
    );
};

export default UserDialogs;