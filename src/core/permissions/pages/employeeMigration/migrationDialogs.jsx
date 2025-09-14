// src/core/permissions/pages/EmployeeMigration/MigrationDialogs.jsx
import React from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Select,
    Option,
    Alert,
    Typography,
    Chip,
    Progress
} from '@material-tailwind/react';
import { useForm, Controller } from 'react-hook-form';
import { IoPersonAdd, IoWarning } from 'react-icons/io5';
import toast from 'react-hot-toast';

const MigrationDialogs = ({
                              dialogs,
                              selectedEmployee,
                              selectedEmployees,
                              roles,
                              loading,
                              onCloseDialog,
                              onSuccess,
                              onMigrateSingle,
                              onMigrateBulk
                          }) => {

    // ========== FORMULARIO ==========

    const {
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm();

    // ========== HANDLERS ==========

    const handleSingleMigration = async (data) => {
        const result = await onMigrateSingle(data);
        if (result.success) {
            toast.success(`Empleado ${selectedEmployee.nombre_completo} migrado correctamente`);
            reset();
            onSuccess('migrateSingle');
        } else {
            toast.error(result.error);
        }
    };

    const handleBulkMigrationSubmit = async (data) => {
        const result = await onMigrateBulk(data.rol_id);
        // El toast y cleanup se maneja en el componente padre
    };

    // ========== MIGRAR EMPLEADO INDIVIDUAL DIALOG ==========

    const MigrateSingleDialog = () => (
        <Dialog
            open={dialogs.migrateSingle}
            handler={() => onCloseDialog('migrateSingle')}
            size="md"
        >
            <DialogHeader>Migrar Empleado</DialogHeader>
            <form onSubmit={handleSubmit(handleSingleMigration)}>
                <DialogBody divider className="space-y-4">
                    {selectedEmployee && (
                        <Alert color="blue">
                            <Typography variant="small">
                                <strong>Empleado a migrar:</strong><br />
                                {selectedEmployee.nombre_completo}<br />
                                Código COTEL: {selectedEmployee.codigocotel}
                            </Typography>
                        </Alert>
                    )}

                    <Alert color="orange">
                        <Typography variant="small">
                            <strong>Información importante:</strong><br />
                            • La contraseña inicial será el código COTEL del empleado<br />
                            • El empleado deberá cambiar su contraseña en el primer login<br />
                            • Se creará un usuario con los datos del empleado
                        </Typography>
                    </Alert>

                    <Controller
                        name="rol_id"
                        control={control}
                        rules={{ required: 'El rol es obligatorio' }}
                        render={({ field }) => (
                            <Select
                                label="Rol a asignar *"
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                error={!!errors.rol_id}
                            >
                                {roles.map((role) => (
                                    <Option key={role.id} value={role.id.toString()}>
                                        <div className="flex items-center justify-between w-full">
                                            <span>{role.nombre}</span>
                                            <Chip
                                                size="sm"
                                                variant="ghost"
                                                value={`${role.cantidad_permisos} permisos`}
                                            />
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        )}
                    />

                    {errors.rol_id && (
                        <Alert color="red">
                            {errors.rol_id.message}
                        </Alert>
                    )}
                </DialogBody>
                <DialogFooter className="space-x-2">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={() => {
                            reset();
                            onCloseDialog('migrateSingle');
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        color="orange"
                        loading={loading}
                        className="flex items-center gap-2"
                    >
                        <IoPersonAdd className="h-4 w-4" />
                        Migrar Empleado
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );

    // ========== MIGRACIÓN MASIVA DIALOG ==========

    const MigrateBulkDialog = () => (
        <Dialog
            open={dialogs.migrateBulk}
            handler={() => onCloseDialog('migrateBulk')}
            size="md"
        >
            <DialogHeader>Migración Masiva</DialogHeader>
            <form onSubmit={handleSubmit(handleBulkMigrationSubmit)}>
                <DialogBody divider className="space-y-4">
                    <Alert color="blue">
                        <Typography variant="small">
                            <strong>Empleados seleccionados:</strong><br />
                            Se migrarán {selectedEmployees.length} empleados al sistema.
                        </Typography>
                    </Alert>

                    <Alert color="orange">
                        <Typography variant="small">
                            <strong>Proceso de migración masiva:</strong><br />
                            • Todos los empleados tendrán la misma contraseña inicial (su código COTEL)<br />
                            • Todos deberán cambiar su contraseña en el primer login<br />
                            • Se asignará el mismo rol a todos los empleados<br />
                            • El proceso puede tardar varios minutos
                        </Typography>
                    </Alert>

                    <Controller
                        name="rol_id"
                        control={control}
                        rules={{ required: 'El rol es obligatorio' }}
                        render={({ field }) => (
                            <Select
                                label="Rol a asignar a todos *"
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                error={!!errors.rol_id}
                            >
                                {roles.map((role) => (
                                    <Option key={role.id} value={role.id.toString()}>
                                        <div className="flex items-center justify-between w-full">
                                            <span>{role.nombre}</span>
                                            <Chip
                                                size="sm"
                                                variant="ghost"
                                                value={`${role.cantidad_permisos} permisos`}
                                            />
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        )}
                    />

                    {errors.rol_id && (
                        <Alert color="red">
                            {errors.rol_id.message}
                        </Alert>
                    )}

                    {loading && (
                        <div className="space-y-2">
                            <Typography variant="small" color="blue-gray">
                                Migrando empleados... Por favor espera.
                            </Typography>
                            <Progress size="sm" color="orange" />
                        </div>
                    )}
                </DialogBody>
                <DialogFooter className="space-x-2">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={() => {
                            reset();
                            onCloseDialog('migrateBulk');
                        }}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        color="orange"
                        loading={loading}
                        className="flex items-center gap-2"
                    >
                        <IoPersonAdd className="h-4 w-4" />
                        Migrar {selectedEmployees.length} Empleados
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );

    // ========== RENDER PRINCIPAL ==========

    return (
        <>
            <MigrateSingleDialog />
            <MigrateBulkDialog />
        </>
    );
};

export default MigrationDialogs;