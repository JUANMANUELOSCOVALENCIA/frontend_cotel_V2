// src/core/auth/components/Login.jsx
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Field, TextInput } from '../../../shared/components/ui';
import { useLogin } from '../hooks/useAuth';
import { AuthLayout, PasswordInput, AuthError } from './AuthLayout';

const Login = () => {
    const [codigo, setCodigo] = useState('');
    const [password, setPassword] = useState('');
    const [errores, setErrores] = useState({});
    const [error, setError] = useState('');
    const passRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useLogin();

    const enviar = async (e) => {
        e.preventDefault();
        const err = {};
        if (!codigo.trim()) err.codigo = 'Ingresa tu código COTEL';
        else if (!/^\d+$/.test(codigo.trim())) err.codigo = 'El código solo tiene números';
        if (!password) err.password = 'Ingresa tu contraseña';
        setErrores(err);
        setError('');
        if (Object.keys(err).length) return;

        setIsLoading(true);
        const r = await login({ codigocotel: parseInt(codigo.trim(), 10), password });
        setIsLoading(false);
        if (!r?.success) {
            // El servidor dice el motivo (contraseña incorrecta, usuario no registrado, sin conexión…)
            setError(r?.error || 'No se pudo iniciar sesión');
            setPassword('');
            passRef.current?.focus();
        }
    };

    return (
        <AuthLayout
            title="Iniciar sesión"
            subtitle="Ingresa con tu código COTEL"
            footer={<>¿Aún no tienes usuario? <Link to="/migration" className="font-medium text-orange-600 hover:text-orange-700">Activar mi cuenta</Link></>}
        >
            <form onSubmit={enviar} className="space-y-4" noValidate>
                <AuthError>{error}</AuthError>
                <Field label="Código COTEL" error={errores.codigo}>
                    <TextInput
                        inputMode="numeric"
                        autoComplete="username"
                        autoFocus
                        value={codigo}
                        onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, '')); setErrores((x) => ({ ...x, codigo: undefined })); setError(''); }}
                        placeholder="Ej: 1234"
                        error={errores.codigo}
                        className="h-11"
                        disabled={isLoading}
                    />
                </Field>
                <Field label="Contraseña" error={errores.password}>
                    <PasswordInput
                        ref={passRef}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrores((x) => ({ ...x, password: undefined })); setError(''); }}
                        placeholder="Tu contraseña"
                        error={errores.password}
                        disabled={isLoading}
                    />
                </Field>
                <Button type="submit" className="h-11 w-full" loading={isLoading}>
                    {isLoading ? 'Ingresando…' : 'Ingresar'}
                </Button>
                <p className="rounded-lg bg-gray-100 px-3 py-2 text-center text-xs text-gray-600">
                    Primer ingreso: tu contraseña es tu código COTEL. Luego te pediremos cambiarla.
                </p>
            </form>
        </AuthLayout>
    );
};

export default Login;
