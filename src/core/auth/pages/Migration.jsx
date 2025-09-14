import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Input,
    Button,
    Alert,
} from '@material-tailwind/react';
import { IoPersonAdd } from 'react-icons/io5';
import authService from '../services/authService';

const Migration = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            codigocotel: '',
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await authService.migrateUser(parseInt(data.codigocotel));

            if (result.success) {
                setSuccess(
                    `Usuario migrado exitosamente. 
          Usuario: ${data.codigocotel} 
          Contraseña: ${data.codigocotel} 
          Ahora puedes iniciar sesión.`
                );
                reset();

                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error('Migration error:', err);
            setError('Error inesperado durante la migración');
        } finally {
            setLoading(false);
        }
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
                            <IoPersonAdd className="w-full h-full" />
                        </div>
                        <Typography variant="h4" color="white" className="font-bold">
                            Migración de Usuario
                        </Typography>
                        <Typography color="white" className="mt-1 text-orange-100">
                            Migra tu usuario desde el sistema de empleados
                        </Typography>
                    </CardHeader>

                    <CardBody className="p-6">
                        {error && (
                            <Alert
                                color="red"
                                className="mb-4 bg-red-50 border border-red-200 text-red-700"
                            >
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert
                                color="green"
                                className="mb-4 bg-green-50 border border-green-200 text-green-700"
                            >
                                {success}
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
                                    placeholder="Ingresa tu código COTEL de empleado"
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

                            <Button
                                type="submit"
                                className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md border border-orange-600 transition-all duration-200"
                                fullWidth
                                loading={loading}
                                disabled={loading}
                            >
                                {loading ? 'Migrando usuario...' : 'Migrar Usuario'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Typography variant="small" color="blue-gray" className="text-gray-600">
                                ¿Ya tienes una cuenta migrada?{' '}
                                <Link
                                    to="/login"
                                    className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                                >
                                    Iniciar sesión
                                </Link>
                            </Typography>
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <Typography variant="small" color="blue-gray" className="font-medium mb-2 text-gray-700">
                                ¿Qué es la migración?
                            </Typography>
                            <Typography variant="small" color="gray" className="text-xs text-gray-600">
                                La migración crea tu usuario en el nuevo sistema usando tu código COTEL de empleado.
                                Tu contraseña inicial será tu mismo código COTEL.
                            </Typography>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default Migration;
