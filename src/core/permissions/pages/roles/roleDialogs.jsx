// src/core/permissions/pages/roles/roleDialogs.jsx
import React, { useEffect, useState } from 'react';
import { IoCreateOutline, IoPeopleOutline, IoKeyOutline, IoLockClosedOutline } from 'react-icons/io5';
import permissionService from '../../services/permissionService';
import { Modal, Button, Field, TextInput, TextArea, Toggle, Badge, Spinner } from '../../../../shared/components/ui';
import PermisoMatriz from './PermisoMatriz';

// ---------- Crear / editar / duplicar ----------
export const RoleFormModal = ({ open, mode, role, permisos, onClose, onSubmit }) => {
    const [form, setForm] = useState({ nombre: '', descripcion: '', activo: true });
    const [selected, setSelected] = useState(new Set());
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setErrors({});
        const ids = new Set((role?.permisos || []).map((p) => p.id));
        if (mode === 'edit' && role) {
            setForm({ nombre: role.nombre, descripcion: role.descripcion || '', activo: !!role.activo });
            setSelected(ids);
        } else if (mode === 'clone' && role) {
            setForm({ nombre: `${role.nombre} (copia)`, descripcion: role.descripcion || '', activo: true });
            setSelected(ids);
        } else {
            setForm({ nombre: '', descripcion: '', activo: true });
            setSelected(new Set());
        }
    }, [open, mode, role]);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        const nombre = form.nombre.trim();
        const errs = {};
        if (nombre.length < 2) errs.nombre = 'Mínimo 2 caracteres';
        if (nombre.length > 50) errs.nombre = 'Máximo 50 caracteres';
        setErrors(errs);
        if (Object.keys(errs).length) return;

        // Solo se envían permisos activos (el backend rechaza los inactivos)
        const activos = new Set(permisos.filter((p) => p.activo).map((p) => p.id));
        setSaving(true);
        const ok = await onSubmit({
            nombre,
            descripcion: form.descripcion.trim(),
            activo: form.activo,
            permisos_ids: [...selected].filter((id) => activos.has(id)),
        });
        setSaving(false);
        if (ok === 'nombre') setErrors({ nombre: 'Ya existe un rol con ese nombre' });
    };

    const titulos = { create: 'Nuevo rol', edit: 'Editar rol', clone: 'Duplicar rol' };

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={saving}
            size="xl"
            title={titulos[mode]}
            subtitle={mode === 'clone' ? `Basado en "${role?.nombre}". Ajusta el nombre y los permisos.` : 'Nombre del rol y qué puede hacer en cada recurso'}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleSubmit} loading={saving}>{mode === 'edit' ? 'Guardar cambios' : 'Crear rol'}</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Field label="Nombre" required error={errors.nombre}>
                        <TextInput value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} error={errors.nombre} maxLength={50} autoFocus placeholder="Ej: Técnico instalador" />
                    </Field>
                    <Field label="Descripción" className="md:col-span-2">
                        <TextInput value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Para qué sirve este rol" />
                    </Field>
                </div>
                {mode === 'edit' && (
                    <Toggle
                        checked={form.activo}
                        onChange={(v) => setForm({ ...form, activo: v })}
                        disabled={role?.es_sistema}
                        label={role?.es_sistema ? 'Rol del sistema (siempre activo)' : 'Rol activo — los usuarios con un rol inactivo pierden sus permisos'}
                    />
                )}
                <Field label="Permisos">
                    <PermisoMatriz permisos={permisos} selected={selected} onChange={setSelected} />
                </Field>
                <button type="submit" className="hidden" />
            </form>
        </Modal>
    );
};

// ---------- Detalle ----------
export const RoleDetalleModal = ({ role, permisos, canEdit, onClose, onEdit }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [tab, setTab] = useState('permisos');

    useEffect(() => {
        if (!role) return;
        setTab('permisos');
        setCargando(true);
        permissionService.getRoleUsers(role.id).then((r) => {
            setUsuarios(r.success ? (r.data.results || r.data || []) : []);
            setCargando(false);
        });
    }, [role]);

    if (!role) return null;
    const selected = new Set((role.permisos || []).map((p) => p.id));
    const tabs = [
        { id: 'permisos', label: `Permisos (${role.cantidad_permisos ?? selected.size})`, icon: IoKeyOutline },
        { id: 'usuarios', label: `Usuarios (${role.cantidad_usuarios ?? usuarios.length})`, icon: IoPeopleOutline },
    ];

    return (
        <Modal
            open={!!role}
            onClose={onClose}
            size="lg"
            title={
                <span className="flex items-center gap-2">
                    {role.nombre}
                    <Badge color={role.activo ? 'green' : 'gray'}>{role.activo ? 'Activo' : 'Inactivo'}</Badge>
                    {role.es_sistema && <Badge color="purple"><IoLockClosedOutline className="h-3 w-3" /> Sistema</Badge>}
                </span>
            }
            subtitle={role.descripcion || 'Sin descripción'}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                    {canEdit && <Button icon={IoCreateOutline} onClick={() => onEdit(role)}>Editar</Button>}
                </>
            }
        >
            <div className="mb-4 flex gap-1 border-b border-gray-200">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium ${
                            tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <t.icon className="h-4 w-4" /> {t.label}
                    </button>
                ))}
            </div>

            {tab === 'permisos' && (
                <PermisoMatriz permisos={permisos} selected={selected} soloAsignados maxHeight="max-h-[50vh]" />
            )}

            {tab === 'usuarios' && (
                cargando ? (
                    <div className="flex justify-center py-8 text-orange-500"><Spinner /></div>
                ) : usuarios.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500">Ningún usuario tiene este rol</p>
                ) : (
                    <ul className="max-h-[50vh] divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
                        {usuarios.map((u) => (
                            <li key={u.id} className="flex items-center justify-between px-3 py-2 text-sm">
                                <span className="text-gray-800">{u.nombre_completo}</span>
                                <span className="font-mono text-xs text-gray-500">{u.codigocotel}</span>
                            </li>
                        ))}
                    </ul>
                )
            )}

            <p className="mt-4 text-xs text-gray-400">
                Creado {role.fecha_creacion ? new Date(role.fecha_creacion).toLocaleDateString('es-BO') : ''}
                {role.creado_por_nombre ? ` por ${role.creado_por_nombre}` : ''}
            </p>
        </Modal>
    );
};
