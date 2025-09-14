import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, Link } from 'react-router-dom';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Input,
    Button,
    Alert,
} from '@material-tailwind/react';
import { IoEye, IoEyeOff, IoPersonCircle } from 'react-icons/io5';
import { useLogin } from '../hooks/useAuth';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error, clearError } = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            codigocotel: '',
            password: '',
        },
    });

    const onSubmit = async (data) => {
        clearError();

        console.log('Intentando login con:', data.codigocotel);

        const result = await login({
            codigocotel: parseInt(data.codigocotel),
            password: data.password,
        });

        if (result.success) {
            console.log('Login exitoso, requiresPasswordChange:', result.requiresPasswordChange);
            // La redirección se maneja automáticamente por los guards de rutas
        } else {
            console.error('Login falló:', result.error);
            reset({ password: '' }); // Solo limpiar contraseña
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <Card className="shadow-lg border border-gray-200 bg-white">
                    <CardHeader
                        floated={false}
                        shadow={false}
                        className="m-0 grid place-items-center bg-orange-500 py-8 px-4 text-center border-b border-orange-600"
                    >
                        <div className="mb-4 h-20 w-20 text-white">
                            <IoPersonCircle className="w-full h-full" />
                        </div>
                        <Typography variant="h4" color="white" className="font-bold">
                            Sistema COTEL
                        </Typography>
                        <Typography color="white" className="mt-1 text-orange-100">
                            Inicia sesión con tu código COTEL
                        </Typography>
                    </CardHeader>

                    <CardBody className="p-6">
                        {error && (
                            <Alert
                                color="red"
                                className="mb-4 bg-red-50 border border-red-200 text-red-700"
                                dismissible={{
                                    onClose: clearError,
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium text-gray-700"
                                >
                                    Código COTEL
                                </Typography>
                                <Input
                                    type="number"
                                    size="lg"
                                    placeholder="Ingresa tu código COTEL"
                                    className="!border-gray-300 focus:!border-orange-500 bg-white placeholder:text-gray-500 placeholder:opacity-100"
                                    labelProps={{
                                        className: "before:content-none after:content-none",
                                    }}
                                    {...register('codigocotel', {
                                        required: 'El código COTEL es obligatorio',
                                        min: {
                                            value: 1,
                                            message: 'Código COTEL inválido',
                                        },
                                        max: {
                                            value: 999999,
                                            message: 'Código COTEL demasiado largo',
                                        },
                                    })}
                                    error={!!errors.codigocotel}
                                />
                                {errors.codigocotel && (
                                    <Typography variant="small" color="red" className="mt-1 text-red-600">
                                        {errors.codigocotel.message}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium text-gray-700"
                                >
                                    Contraseña
                                </Typography>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        size="lg"
                                        placeholder="Ingresa tu contraseña"
                                        className="!border-gray-300 focus:!border-orange-500 pr-10 bg-white placeholder:text-gray-500 placeholder:opacity-100"
                                        labelProps={{
                                            className: "before:content-none after:content-none",
                                        }}
                                        {...register('password', {
                                            required: 'La contraseña es obligatoria',
                                            minLength: {
                                                value: 1,
                                                message: 'La contraseña es obligatoria',
                                            },
                                        })}
                                        error={!!errors.password}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors duration-200"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? (
                                            <IoEyeOff className="h-5 w-5" />
                                        ) : (
                                            <IoEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <Typography variant="small" color="red" className="mt-1 text-red-600">
                                        {errors.password.message}
                                    </Typography>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md border border-orange-600 transition-all duration-200"
                                fullWidth
                                loading={isLoading || undefined}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Typography variant="small" color="blue-gray" className="text-gray-600">
                                ¿No tienes una cuenta?{' '}
                                <Link
                                    to="/migration"
                                    className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                                >
                                    Migrar desde empleados
                                </Link>
                            </Typography>
                        </div>

                        <div className="mt-4 text-center">
                            <Typography variant="small" color="blue-gray" className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                Si es tu primer ingreso, usa tu código COTEL como contraseña
                            </Typography>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default Login;