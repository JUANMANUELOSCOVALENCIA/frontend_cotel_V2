// src/core/permissions/pages/permissions/permissionDialogs.jsx
import React, { useEffect, useState } from 'react';
import { IoCreateOutline, IoTrashOutline, IoInformationCircleOutline } from 'react-icons/io5';
import {
    Modal, Button, Field, TextInput, TextArea, SelectInput, Toggle, Badge, ConfirmModal,
    ACCIONES, ACCION_COLOR,
} from '../../../../shared/components/ui';

const RECURSO_RE = /^[a-z0-9_-]+$/;
const fmt = (v) => (v ? new Date(v).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

// ---------- Crear / editar ----------
export const PermisoFormModal = ({ open, mode, permiso, preset, recursos, existentes, onClose, onSubmit }) => {
    const [form, setForm] = useState({ recurso: '', accion: 'leer', descripcion: '', activo: true });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setErrors({});
        if (mode === 'edit' && permiso) {
            setForm({ recurso: permiso.recurso, accion: permiso.accion, descripcion: permiso.descripcion || '', activo: !!permiso.activo });
        } else {
            setForm({ recurso: preset?.recurso || '', accion: preset?.accion || 'leer', descripcion: '', activo: true });
        }
    }, [open, mode, permiso, preset]);

    const enUso = mode === 'edit' && permiso?.esta_en_uso;

    const handleSubmit = async (e) => {
        e?.preventDefault();
        const recurso = form.recurso.trim().toLowerCase();
        const errs = {};
        if (!recurso) errs.recurso = 'El recurso es obligatorio';
        else if (recurso.length < 2) errs.recurso = 'Mínimo 2 caracteres';
        else if (!RECURSO_RE.test(recurso)) errs.recurso = 'Solo minúsculas, números, guion (-) y guion bajo (_)';
        const duplicado = existentes.some(
            (p) => p.recurso === recurso && p.accion === form.accion && (mode !== 'edit' || p.id !== permiso?.id)
        );
        if (duplicado) errs.accion = `Ya existe el permiso ${recurso}:${form.accion}`;
        setErrors(errs);
        if (Object.keys(errs).length) return;

        setSaving(true);
        await onSubmit({
            recurso,
            accion: form.accion,
            descripcion: form.descripcion.trim() || `${form.accion} ${recurso}`,
            ...(mode === 'edit' && { activo: form.activo }),
        });
        setSaving(false);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={saving}
            title={mode === 'edit' ? 'Editar permiso' : 'Nuevo permiso'}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleSubmit} loading={saving}>{mode === 'edit' ? 'Guardar cambios' : 'Crear permiso'}</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {enUso && (
                    <div className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                        <IoInformationCircleOutline className="mt-0.5 h-5 w-5 shrink-0" />
                        Este permiso está asignado a roles: el recurso y la acción no se pueden cambiar.
                    </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                        label="Recurso"
                        required
                        error={errors.recurso}
                        hint="Debe coincidir con el nombre usado en el sistema (ej: almacenes, lotes)."
                    >
                        <TextInput
                            list="recursos-existentes"
                            value={form.recurso}
                            onChange={(e) => setForm({ ...form, recurso: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            placeholder="ej: almacenes"
                            disabled={enUso}
                            error={errors.recurso}
                            autoFocus={!preset}
                            maxLength={50}
                        />
                        <datalist id="recursos-existentes">
                            {recursos.map((r) => <option key={r} value={r} />)}
                        </datalist>
                    </Field>
                    <Field label="Acción" required error={errors.accion}>
                        <SelectInput value={form.accion} onChange={(e) => setForm({ ...form, accion: e.target.value })} disabled={enUso}>
                            {ACCIONES.map((a) => <option key={a} value={a}>{a}</option>)}
                        </SelectInput>
                    </Field>
                </div>
                <Field label="Descripción" hint="Si la dejas vacía se genera automáticamente.">
                    <TextArea
                        value={form.descripcion}
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                        placeholder="Ej: Permite ver el listado de almacenes"
                        autoFocus={!!preset}
                    />
                </Field>
                {mode === 'edit' && (
                    <Toggle checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} label="Permiso activo" />
                )}
                <button type="submit" className="hidden" />
            </form>
        </Modal>
    );
};

// ---------- Detalle ----------
const Dato = ({ label, children }) => (
    <div>
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="mt-0.5 text-sm text-gray-800">{children}</dd>
    </div>
);

export const PermisoDetalleModal = ({ permiso, canEdit, canDelete, onClose, onEdit, onDelete }) => {
    const [confirmar, setConfirmar] = useState(false);
    const [borrando, setBorrando] = useState(false);
    if (!permiso) return null;

    return (
        <>
            <Modal
                open={!!permiso}
                onClose={onClose}
                size="sm"
                title={<span className="font-mono">{permiso.recurso}:{permiso.accion}</span>}
                footer={
                    <>
                        {canDelete && (
                            <Button
                                variant="ghost"
                                icon={IoTrashOutline}
                                className="mr-auto text-red-600 hover:bg-red-50"
                                disabled={permiso.esta_en_uso}
                                title={permiso.esta_en_uso ? 'Quítalo de los roles antes de eliminarlo' : undefined}
                                onClick={() => setConfirmar(true)}
                            >
                                Eliminar
                            </Button>
                        )}
                        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                        {canEdit && <Button icon={IoCreateOutline} onClick={() => onEdit(permiso)}>Editar</Button>}
                    </>
                }
            >
                <dl className="grid grid-cols-2 gap-4">
                    <Dato label="Recurso"><span className="font-mono">{permiso.recurso}</span></Dato>
                    <Dato label="Acción"><Badge color={ACCION_COLOR[permiso.accion]}>{permiso.accion}</Badge></Dato>
                    <div className="col-span-2">
                        <Dato label="Descripción">{permiso.descripcion || <span className="italic text-gray-400">Sin descripción</span>}</Dato>
                    </div>
                    <Dato label="Estado"><Badge color={permiso.activo ? 'green' : 'gray'}>{permiso.activo ? 'Activo' : 'Inactivo'}</Badge></Dato>
                    <Dato label="Uso"><Badge color={permiso.esta_en_uso ? 'orange' : 'gray'}>{permiso.esta_en_uso ? 'Asignado a roles' : 'Sin asignar'}</Badge></Dato>
                    <Dato label="Creado por">{permiso.creado_por_nombre || 'Sistema'}</Dato>
                    <Dato label="Creado">{fmt(permiso.fecha_creacion)}</Dato>
                    <div className="col-span-2">
                        <Dato label="Última modificación">{fmt(permiso.fecha_modificacion)}</Dato>
                    </div>
                </dl>
            </Modal>
            <ConfirmModal
                open={confirmar}
                danger
                loading={borrando}
                title="Eliminar permiso"
                confirmText="Eliminar"
                message={<>¿Eliminar el permiso <strong className="font-mono">{permiso.recurso}:{permiso.accion}</strong>?</>}
                onClose={() => !borrando && setConfirmar(false)}
                onConfirm={async () => {
                    setBorrando(true);
                    await onDelete(permiso);
                    setBorrando(false);
                    setConfirmar(false);
                }}
            />
        </>
    );
};
