import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Input,
    Button,
    Alert,
    Progress,
} from '@material-tailwind/react';
import {
    IoEye,
    IoEyeOff,
    IoShieldCheckmark,
    IoWarning
} from 'react-icons/io5';
import { usePasswordChange, useAuthStatus } from '../hooks/useAuth';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const { changePassword, isLoading, error } = usePasswordChange();
    const { isAuthenticated, requiresPasswordChange } = useAuthStatus();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm({
        defaultValues: {
            old_password: '',
            new_password: '',
            confirm_password: '',
        },
    });

    // Verificar si el usuario debe estar aquí
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const newPassword = watch('new_password');

    const onSubmit = async (data) => {
        const result = await changePassword({
            old_password: data.old_password,
            new_password: data.new_password,
            confirm_password: data.confirm_password,
        });

        if (result.success) {
            reset();
            // Redireccionar al dashboard después del cambio exitoso
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 1500);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        const checks = [
            password.length >= 8,
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /\d/.test(password),
            /[!@#$%^&*(),.?":{}|<>]/.test(password),
        ];

        strength = checks.filter(Boolean).length;

        const levels = [
            { strength: 0, label: '', color: '' },
            { strength: 1, label: 'Muy débil', color: 'red' },
            { strength: 2, label: 'Débil', color: 'orange' },
            { strength: 3, label: 'Regular', color: 'yellow' },
            { strength: 4, label: 'Fuerte', color: 'light-green' },
            { strength: 5, label: 'Muy fuerte', color: 'green' },
        ];

        return levels[strength];
    };

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 px-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl">
                    <CardHeader
                        floated={false}
                        shadow={false}
                        className="m-0 grid place-items-center bg-gradient-to-r from-orange-600 to-red-600 py-8 px-4 text-center"
                    >
                        <div className="mb-4 h-20 w-20 text-white">
                            {requiresPasswordChange ? (
                                <IoWarning className="w-full h-full" />
                            ) : (
                                <IoShieldCheckmark className="w-full h-full" />
                            )}
                        </div>
                        <Typography variant="h4" color="white" className="font-bold">
                            {requiresPasswordChange ? 'Cambio Obligatorio' : 'Cambiar Contraseña'}
                        </Typography>
                        <Typography color="orange" className="mt-1 text-orange-100">
                            {requiresPasswordChange
                                ? 'Debes cambiar tu contraseña para continuar'
                                : 'Actualiza tu contraseña por seguridad'
                            }
                        </Typography>
                    </CardHeader>

                    <CardBody className="p-6">
                        {requiresPasswordChange && (
                            <Alert
                                color="orange"
                                icon={<IoWarning className="h-6 w-6" />}
                                className="mb-4"
                            >
                                Por seguridad, debes cambiar tu contraseña antes de continuar.
                            </Alert>
                        )}

                        {error && (
                            <Alert color="red" className="mb-4">
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Contraseña Actual */}
                            <div>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium"
                                >
                                    Contraseña Actual
                                </Typography>
                                <div className="relative">
                                    <Input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        size="lg"
                                        placeholder="Ingresa tu contraseña actual"
                                        className="!border-t-blue-gray-200 focus:!border-t-orange-500 pr-10"
                                        labelProps={{
                                            className: "before:content-none after:content-none",
                                        }}
                                        {...register('old_password', {
                                            required: 'La contraseña actual es obligatoria',
                                        })}
                                        error={!!errors.old_password}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-gray-400 hover:text-blue-gray-600"
                                        onClick={() => togglePasswordVisibility('current')}
                                    >
                                        {showPasswords.current ? (
                                            <IoEyeOff className="h-5 w-5" />
                                        ) : (
                                            <IoEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.old_password && (
                                    <Typography variant="small" color="red" className="mt-1">
                                        {errors.old_password.message}
                                    </Typography>
                                )}
                            </div>

                            {/* Nueva Contraseña */}
                            <div>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium"
                                >
                                    Nueva Contraseña
                                </Typography>
                                <div className="relative">
                                    <Input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        size="lg"
                                        placeholder="Ingresa tu nueva contraseña"
                                        className="!border-t-blue-gray-200 focus:!border-t-orange-500 pr-10"
                                        labelProps={{
                                            className: "before:content-none after:content-none",
                                        }}
                                        {...register('new_password', {
                                            required: 'La nueva contraseña es obligatoria',
                                            minLength: {
                                                value: 8,
                                                message: 'La contraseña debe tener al menos 8 caracteres',
                                            },
                                            validate: {
                                                hasUpperCase: value =>
                                                    /[A-Z]/.test(value) || 'Debe contener al menos una letra mayúscula',
                                                hasLowerCase: value =>
                                                    /[a-z]/.test(value) || 'Debe contener al menos una letra minúscula',
                                                hasNumber: value =>
                                                    /\d/.test(value) || 'Debe contener al menos un número',
                                            },
                                        })}
                                        error={!!errors.new_password}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-gray-400 hover:text-blue-gray-600"
                                        onClick={() => togglePasswordVisibility('new')}
                                    >
                                        {showPasswords.new ? (
                                            <IoEyeOff className="h-5 w-5" />
                                        ) : (
                                            <IoEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.new_password && (
                                    <Typography variant="small" color="red" className="mt-1">
                                        {errors.new_password.message}
                                    </Typography>
                                )}

                                {/* Indicador de fortaleza */}
                                {newPassword && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between">
                                            <Typography variant="small" color="blue-gray">
                                                Fortaleza:
                                            </Typography>
                                            <Typography
                                                variant="small"
                                                color={passwordStrength.color}
                                                className="font-medium"
                                            >
                                                {passwordStrength.label}
                                            </Typography>
                                        </div>
                                        <Progress
                                            value={(passwordStrength.strength / 5) * 100}
                                            color={passwordStrength.color}
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Confirmar Contraseña */}
                            <div>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium"
                                >
                                    Confirmar Nueva Contraseña
                                </Typography>
                                <div className="relative">
                                    <Input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        size="lg"
                                        placeholder="Confirma tu nueva contraseña"
                                        className="!border-t-blue-gray-200 focus:!border-t-orange-500 pr-10"
                                        labelProps={{
                                            className: "before:content-none after:content-none",
                                        }}
                                        {...register('confirm_password', {
                                            required: 'Debes confirmar la nueva contraseña',
                                            validate: value =>
                                                value === newPassword || 'Las contraseñas no coinciden',
                                        })}
                                        error={!!errors.confirm_password}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-gray-400 hover:text-blue-gray-600"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                    >
                                        {showPasswords.confirm ? (
                                            <IoEyeOff className="h-5 w-5" />
                                        ) : (
                                            <IoEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirm_password && (
                                    <Typography variant="small" color="red" className="mt-1">
                                        {errors.confirm_password.message}
                                    </Typography>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="mt-6 bg-gradient-to-r from-orange-600 to-red-600"
                                fullWidth
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                            </Button>
                        </form>

                        {/* Requisitos de contraseña */}
                        <div className="mt-6 p-4 bg-blue-gray-50 rounded-lg">
                            <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                                Requisitos de la contraseña:
                            </Typography>
                            <ul className="text-xs text-blue-gray-600 space-y-1">
                                <li className="flex items-center">
                  <span className={`mr-2 ${newPassword?.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>
                    {newPassword?.length >= 8 ? '✓' : '○'}
                  </span>
                                    Minimo 8 caracteres
                                </li>
                                <li className="flex items-center">
                  <span className={`mr-2 ${/[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                    {/[A-Z]/.test(newPassword) ? '✓' : '○'}
                  </span>
                                    Al menos una letra mayuscula
                                </li>
                                <li className="flex items-center">
                  <span className={`mr-2 ${/[a-z]/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                    {/[a-z]/.test(newPassword) ? '✓' : '○'}
                  </span>
                                    Al menos una letra minuscula
                                </li>
                                <li className="flex items-center">
                  <span className={`mr-2 ${/\d/.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                    {/\d/.test(newPassword) ? '✓' : '○'}
                  </span>
                                    Al menos un numero
                                </li>
                            </ul>
                        </div>

                        {!requiresPasswordChange && (
                            <div className="mt-4 text-center">
                                <Button
                                    variant="text"
                                    color="blue-gray"
                                    onClick={() => navigate('/dashboard')}
                                    className="text-sm"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default ChangePassword;