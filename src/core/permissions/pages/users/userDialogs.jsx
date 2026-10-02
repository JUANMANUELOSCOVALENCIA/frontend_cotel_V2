// src/core/permissions/pages/users/userDialogs.jsx
// Modales de usuarios: crear/editar, confirmación de acciones y aviso de credenciales.
import React, { useEffect, useState } from 'react';
import { IoCheckmarkCircleOutline, IoCopyOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { Modal, ConfirmModal, Button, Field, TextInput, SelectInput } from '../../../../shared/components/ui';

const EMPTY = { nombres: '', apellidopaterno: '', apellidomaterno: '', rol: '' };

const NAME_RE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'.-]+$/;

const validar = (f) => {
    const e = {};
    [['nombres', 'Los nombres'], ['apellidopaterno', 'El apellido paterno'], ['apellidomaterno', 'El apellido materno']].forEach(([k, label]) => {
        const v = f[k].trim();
        if (!v) e[k] = `${label} es obligatorio`;
        else if (v.length < 2) e[k] = 'Mínimo 2 caracteres';
        else if (!NAME_RE.test(v)) e[k] = 'Solo letras y espacios';
    });
    if (!f.rol) e.rol = 'Selecciona un rol';
    return e;
};

// ---------- Crear / editar ----------
export const UserFormModal = ({ open, mode, user, roles, onClose, onSubmit }) => {
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setErrors({});
        setForm(
            mode === 'edit' && user
                ? {
                      nombres: user.nombres || '',
                      apellidopaterno: user.apellidopaterno || '',
                      apellidomaterno: user.apellidomaterno || '',
                      rol: user.rol_id ? String(user.rol_id) : '',
                  }
                : EMPTY
        );
    }, [open, mode, user]);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e?.preventDefault();
        const errs = validar(form);
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setSaving(true);
        await onSubmit({
            nombres: form.nombres.trim(),
            apellidopaterno: form.apellidopaterno.trim(),
            apellidomaterno: form.apellidomaterno.trim(),
            rol: parseInt(form.rol, 10),
        });
        setSaving(false);
    };

    const activos = roles.filter((r) => r.activo || String(r.id) === form.rol);

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={saving}
            title={mode === 'edit' ? 'Editar usuario' : 'Nuevo usuario'}
            subtitle={mode === 'edit' ? `Código COTEL ${user?.codigocotel}` : 'El código COTEL se asigna automáticamente'}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleSubmit} loading={saving}>{mode === 'edit' ? 'Guardar cambios' : 'Crear usuario'}</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nombres" required error={errors.nombres} className="sm:col-span-2">
                    <TextInput value={form.nombres} onChange={set('nombres')} error={errors.nombres} autoFocus maxLength={100} />
                </Field>
                <Field label="Apellido paterno" required error={errors.apellidopaterno}>
                    <TextInput value={form.apellidopaterno} onChange={set('apellidopaterno')} error={errors.apellidopaterno} maxLength={100} />
                </Field>
                <Field label="Apellido materno" required error={errors.apellidomaterno}>
                    <TextInput value={form.apellidomaterno} onChange={set('apellidomaterno')} error={errors.apellidomaterno} maxLength={100} />
                </Field>
                <Field label="Rol" required error={errors.rol} className="sm:col-span-2">
                    <SelectInput value={form.rol} onChange={set('rol')}>
                        <option value="">Seleccionar rol…</option>
                        {activos.map((r) => (
                            <option key={r.id} value={r.id}>{r.nombre}{!r.activo ? ' (inactivo)' : ''}</option>
                        ))}
                    </SelectInput>
                </Field>
                <button type="submit" className="hidden" />
            </form>
        </Modal>
    );
};

// ---------- Credenciales del usuario recién creado ----------
export const CredencialesModal = ({ user, onClose }) => {
    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(`Usuario (código COTEL): ${user.codigocotel}\nContraseña inicial: ${user.codigocotel}`);
            toast.success('Copiado al portapapeles');
        } catch {
            toast.error('No se pudo copiar');
        }
    };
    return (
        <Modal
            open={!!user}
            onClose={onClose}
            size="sm"
            title="Usuario creado"
            footer={
                <>
                    <Button variant="secondary" icon={IoCopyOutline} onClick={copiar}>Copiar datos</Button>
                    <Button onClick={onClose}>Listo</Button>
                </>
            }
        >
            {user && (
                <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-2 text-green-700">
                        <IoCheckmarkCircleOutline className="h-5 w-5" />
                        <span className="font-medium">{user.nombre_completo || `${user.nombres} ${user.apellidopaterno}`}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4">
                        <div>
                            <p className="text-xs text-gray-500">Código COTEL (usuario)</p>
                            <p className="font-mono text-lg font-bold text-gray-800">{user.codigocotel}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Contraseña inicial</p>
                            <p className="font-mono text-lg font-bold text-gray-800">{user.codigocotel}</p>
                        </div>
                    </div>
                    <p className="text-gray-500">Al iniciar sesión por primera vez, el sistema le pedirá cambiar la contraseña.</p>
                </div>
            )}
        </Modal>
    );
};

// ---------- Confirmación de acciones ----------
const TEXTOS = {
    activate: { titulo: 'Activar usuario', verbo: 'activar', boton: 'Activar' },
    deactivate: { titulo: 'Desactivar usuario', verbo: 'desactivar', boton: 'Desactivar', danger: true, nota: 'No podrá iniciar sesión hasta que se vuelva a activar.' },
    delete: { titulo: 'Eliminar usuario', verbo: 'eliminar', boton: 'Eliminar', danger: true, nota: 'Podrás restaurarlo luego filtrando por "Eliminados".' },
    restore: { titulo: 'Restaurar usuario', verbo: 'restaurar', boton: 'Restaurar' },
    resetPassword: { titulo: 'Resetear contraseña', verbo: 'resetear la contraseña de', boton: 'Resetear', nota: 'La contraseña volverá a ser su código COTEL y deberá cambiarla al ingresar.' },
    unlock: { titulo: 'Desbloquear usuario', verbo: 'desbloquear', boton: 'Desbloquear' },
};

export const UserConfirmModal = ({ action, user, loading, onClose, onConfirm }) => {
    const t = TEXTOS[action] || {};
    return (
        <ConfirmModal
            open={!!action}
            onClose={onClose}
            onConfirm={onConfirm}
            loading={loading}
            danger={t.danger}
            title={t.titulo}
            confirmText={t.boton}
            message={
                <>
                    <p>¿Seguro que deseas {t.verbo} a <strong>{user?.nombre_completo}</strong> ({user?.codigocotel})?</p>
                    {t.nota && <p className="mt-2 text-gray-500">{t.nota}</p>}
                </>
            }
        />
    );
};
