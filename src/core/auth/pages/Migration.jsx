// src/core/auth/pages/Migration.jsx
// Activar cuenta: crea el usuario a partir del registro de empleados (código COTEL).
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { Button, Field, TextInput } from '../../../shared/components/ui';
import authService from '../services/authService';
import { AuthLayout, AuthError } from '../components/AuthLayout';

const Migration = () => {
    const navigate = useNavigate();
    const [codigo, setCodigo] = useState('');
    const [errorCampo, setErrorCampo] = useState('');
    const [error, setError] = useState('');
    const [listo, setListo] = useState(null); // código activado
    const [loading, setLoading] = useState(false);

    // Tras activar, ir al login
    useEffect(() => {
        if (!listo) return undefined;
        const t = setTimeout(() => navigate('/login'), 6000);
        return () => clearTimeout(t);
    }, [listo, navigate]);

    const enviar = async (e) => {
        e.preventDefault();
        setError('');
        if (!codigo.trim()) { setErrorCampo('Ingresa tu código COTEL'); return; }
        setLoading(true);
        const r = await authService.migrateUser(parseInt(codigo.trim(), 10));
        setLoading(false);
        if (r.success) setListo(codigo.trim());
        else setError(r.error);
    };

    if (listo) {
        return (
            <AuthLayout title="Cuenta activada">
                <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                        <IoCheckmarkCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                            <p>Tu usuario <strong>{listo}</strong> ya está listo.</p>
                            <p className="mt-1">Para el primer ingreso, la contraseña es tu código COTEL. Luego te pediremos cambiarla.</p>
                        </div>
                    </div>
                    <Button className="h-11 w-full" onClick={() => navigate('/login')}>Ir a iniciar sesión</Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Activar mi cuenta"
            subtitle="Crea tu usuario con tu código COTEL de empleado."
            footer={<>¿Ya tienes usuario? <Link to="/login" className="font-medium text-orange-600 hover:text-orange-700">Iniciar sesión</Link></>}
        >
            <form onSubmit={enviar} className="space-y-4" noValidate>
                <AuthError>{error}</AuthError>
                <Field label="Código COTEL" error={errorCampo}>
                    <TextInput
                        inputMode="numeric"
                        autoFocus
                        value={codigo}
                        onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, '')); setErrorCampo(''); setError(''); }}
                        placeholder="Ej: 1234"
                        error={errorCampo}
                        className="h-11"
                        disabled={loading}
                    />
                </Field>
                <Button type="submit" className="h-11 w-full" loading={loading}>
                    {loading ? 'Activando…' : 'Activar cuenta'}
                </Button>
                <p className="rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-600">
                    Solo para empleados activos de COTEL. Tu contraseña inicial será tu mismo código COTEL.
                </p>
            </form>
        </AuthLayout>
    );
};

export default Migration;
