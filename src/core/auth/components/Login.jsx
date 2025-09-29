import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const PRESERVED_CODIGO_KEY = 'login_temp_codigo';
const PRESERVED_ERROR_KEY = 'login_temp_error';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [codigocotel, setCodigocotel] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const { login, isLoading, error, clearError } = useLogin();

    // Al montar, recuperar valores solo de sessionStorage (se limpia al cerrar tab/refresh)
    useEffect(() => {
        const preservedCodigo = sessionStorage.getItem(PRESERVED_CODIGO_KEY);
        const preservedError = sessionStorage.getItem(PRESERVED_ERROR_KEY);

        if (preservedCodigo) {
            setCodigocotel(preservedCodigo);
        }

        if (preservedError) {
            setPasswordError(preservedError);
            sessionStorage.removeItem(PRESERVED_ERROR_KEY);
        }

        // Limpiar al desmontar si el login fue exitoso
        return () => {
            // Se limpiará automáticamente al cerrar/refrescar
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!codigocotel) {
            setPasswordError('');
            return;
        }

        if (!password) {
            setPasswordError('La contraseña es obligatoria');
            return;
        }

        clearError();
        setPasswordError('');

        // Guardar en sessionStorage (se limpia al refrescar)
        sessionStorage.setItem(PRESERVED_CODIGO_KEY, codigocotel);

        const result = await login({
            codigocotel: parseInt(codigocotel),
            password: password,
        });

        if (!result || !result.success) {
            const errorMsg = 'Contraseña incorrecta. Intenta nuevamente.';
            sessionStorage.setItem(PRESERVED_ERROR_KEY, errorMsg);

            setPassword('');
            setPasswordError(errorMsg);
        } else {
            sessionStorage.removeItem(PRESERVED_CODIGO_KEY);
            sessionStorage.removeItem(PRESERVED_ERROR_KEY);
            setPasswordError('');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleCodigoChange = (e) => {
        const valor = e.target.value;
        setCodigocotel(valor);
        if (error) {
            clearError();
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (passwordError) {
            setPasswordError('');
            sessionStorage.removeItem(PRESERVED_ERROR_KEY);
        }
        if (error) {
            clearError();
        }
    };

    const handleMigrationClick = () => {
        sessionStorage.removeItem(PRESERVED_CODIGO_KEY);
        sessionStorage.removeItem(PRESERVED_ERROR_KEY);
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

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    value={codigocotel}
                                    onChange={handleCodigoChange}
                                    className="!border-gray-300 focus:!border-orange-500 bg-white placeholder:text-gray-500 placeholder:opacity-100"
                                    labelProps={{
                                        className: "before:content-none after:content-none",
                                    }}
                                    disabled={isLoading}
                                />
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
                                    {/* Wrapper para forzar el borde rojo */}
                                    <div
                                        className={`rounded-md ${
                                            passwordError ? 'ring-2 ring-red-500' : ''
                                        }`}
                                    >
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            size="lg"
                                            placeholder="Ingresa tu contraseña"
                                            value={password}
                                            onChange={handlePasswordChange}
                                            className={`pr-10 bg-white placeholder:text-gray-500 placeholder:opacity-100 ${
                                                passwordError
                                                    ? '!border-red-500'
                                                    : '!border-gray-300 focus:!border-orange-500'
                                            }`}
                                            labelProps={{
                                                className: "before:content-none after:content-none",
                                            }}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                        onClick={togglePasswordVisibility}
                                        disabled={isLoading}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <IoEyeOff className="h-5 w-5" />
                                        ) : (
                                            <IoEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {passwordError && (
                                    <div className="mt-2 flex items-start gap-1 bg-red-50 p-2 rounded border border-red-200">
                                        <span className="text-red-600 text-base"></span>
                                        <Typography variant="small" className="text-red-600 font-medium">
                                            {passwordError}
                                        </Typography>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md border border-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    onClick={handleMigrationClick}
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