// src/core/auth/components/ChangePassword.jsx
// Cambio de contraseña: obligatorio en el primer ingreso o voluntario desde el perfil.
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Field } from '../../../shared/components/ui';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout, PasswordInput, AuthError, Requisitos } from './AuthLayout';

const ChangePassword = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, requiresPasswordChange, changePassword, logout } = useAuth();
    const [v, setV] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [errores, setErrores] = useState({});
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); setErrores((x) => ({ ...x, [k]: undefined })); setError(''); };
    const codigo = String(user?.codigocotel || '');
    const nueva = v.new_password;

    // Mismas reglas que valida el servidor (más la lista de contraseñas comunes, que solo revisa el servidor)
    const requisitos = [
        { texto: 'Al menos 8 caracteres', ok: nueva.length >= 8 },
        { texto: 'No solo números (incluye letras)', ok: !!nueva && !/^\d+$/.test(nueva) },
        { texto: 'No contiene tu código COTEL', ok: !!nueva && (!codigo || !nueva.includes(codigo)) },
        { texto: 'Distinta de la contraseña actual', ok: !!nueva && nueva !== v.old_password },
        { texto: 'La confirmación coincide', ok: !!nueva && nueva === v.confirm_password },
    ];

    const enviar = async (e) => {
        e.preventDefault();
        const err = {};
        if (!v.old_password) err.old_password = 'Ingresa tu contraseña actual';
        if (!nueva) err.new_password = 'Ingresa la nueva contraseña';
        if (!v.confirm_password) err.confirm_password = 'Repite la nueva contraseña';
        setErrores(err);
        setError('');
        if (Object.keys(err).length) return;
        if (!requisitos.every((r) => r.ok)) { setError('La nueva contraseña no cumple todos los requisitos.'); return; }

        setGuardando(true);
        const r = await changePassword(v);
        setGuardando(false);
        if (r.success) {
            navigate('/dashboard', { replace: true });
            return;
        }
        const campos = r.fieldErrors || {};
        setErrores(campos);
        // si el servidor marcó un campo, el mensaje va junto a ese campo (sin repetirlo arriba)
        setError(['old_password', 'new_password', 'confirm_password'].some((k) => campos[k]) ? '' : r.error);
    };

    return (
        <AuthLayout
            title={requiresPasswordChange ? 'Crea tu contraseña' : 'Cambiar contraseña'}
            subtitle={requiresPasswordChange
                ? `Hola ${user?.nombres || ''}. Antes de continuar, reemplaza la contraseña inicial por una propia.`
                : 'Elige una contraseña que no uses en otros sistemas.'}
            footer={requiresPasswordChange
                ? <button type="button" className="font-medium text-gray-600 hover:text-gray-800" onClick={logout}>Salir y volver más tarde</button>
                : <button type="button" className="font-medium text-gray-600 hover:text-gray-800" onClick={() => navigate(-1)}>Volver sin cambiar</button>}
        >
            <form onSubmit={enviar} className="space-y-4" noValidate>
                <AuthError>{error}</AuthError>
                <Field label={requiresPasswordChange ? 'Contraseña actual (tu código COTEL)' : 'Contraseña actual'} error={errores.old_password}>
                    <PasswordInput autoComplete="current-password" autoFocus value={v.old_password} onChange={set('old_password')} error={errores.old_password} disabled={guardando} />
                </Field>
                <Field label="Nueva contraseña" error={errores.new_password}>
                    <PasswordInput autoComplete="new-password" value={nueva} onChange={set('new_password')} error={errores.new_password} disabled={guardando} />
                </Field>
                <Field label="Repite la nueva contraseña" error={errores.confirm_password}>
                    <PasswordInput autoComplete="new-password" value={v.confirm_password} onChange={set('confirm_password')} error={errores.confirm_password} disabled={guardando} />
                </Field>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <Requisitos items={requisitos} />
                </div>
                <Button type="submit" className="h-11 w-full" loading={guardando}>
                    {guardando ? 'Guardando…' : 'Guardar contraseña'}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default ChangePassword;
