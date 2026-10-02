// src/core/permissions/pages/employeeMigration/migrationDialogs.jsx
import React, { useEffect, useState } from 'react';
import { IoCheckmarkCircleOutline, IoCloseCircleOutline, IoInformationCircleOutline } from 'react-icons/io5';
import { Modal, Button, Field, SelectInput } from '../../../../shared/components/ui';

const Aviso = () => (
    <div className="flex gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
        <IoInformationCircleOutline className="mt-0.5 h-5 w-5 shrink-0" />
        <span>El usuario ingresará con su <strong>código COTEL</strong> como usuario y contraseña inicial, y deberá cambiarla la primera vez.</span>
    </div>
);

/**
 * Migra uno o varios empleados.
 * empleados: lista de empleados a migrar
 * onMigrate(empleado, rolId) -> { success, error }
 */
export const MigrarModal = ({ open, empleados, roles, onClose, onMigrate, onDone }) => {
    const [rol, setRol] = useState('');
    const [error, setError] = useState('');
    const [running, setRunning] = useState(false);
    const [progreso, setProgreso] = useState(0);
    const [resultados, setResultados] = useState(null);

    useEffect(() => {
        if (!open) return;
        setRol('');
        setError('');
        setRunning(false);
        setProgreso(0);
        setResultados(null);
    }, [open]);

    const activos = roles.filter((r) => r.activo);
    const uno = empleados.length === 1;

    const migrar = async () => {
        if (!rol) { setError('Selecciona el rol que tendrán'); return; }
        setRunning(true);
        const res = [];
        for (let i = 0; i < empleados.length; i += 1) {
            const e = empleados[i];
            const r = await onMigrate(e, parseInt(rol, 10));
            res.push({ empleado: e, ok: r.success, error: r.error });
            setProgreso(i + 1);
        }
        setRunning(false);
        setResultados(res);
        onDone?.(res);
    };

    const ok = resultados?.filter((r) => r.ok).length || 0;
    const fallos = resultados?.filter((r) => !r.ok) || [];

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={running}
            title={uno ? 'Migrar empleado' : `Migrar ${empleados.length} empleados`}
            subtitle={uno ? `${empleados[0]?.nombre_completo} · código ${empleados[0]?.codigocotel}` : 'Se crearán como usuarios del sistema con el mismo rol'}
            footer={
                resultados ? (
                    <Button onClick={onClose}>Listo</Button>
                ) : (
                    <>
                        <Button variant="ghost" onClick={onClose} disabled={running}>Cancelar</Button>
                        <Button onClick={migrar} loading={running}>
                            {running ? `Migrando ${progreso}/${empleados.length}…` : uno ? 'Migrar' : `Migrar ${empleados.length}`}
                        </Button>
                    </>
                )
            }
        >
            {!resultados ? (
                <div className="space-y-4">
                    <Field label="Rol que tendrá" required error={error}>
                        <SelectInput value={rol} onChange={(e) => { setRol(e.target.value); setError(''); }} disabled={running}>
                            <option value="">Seleccionar rol…</option>
                            {activos.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                        </SelectInput>
                    </Field>
                    {!uno && (
                        <ul className="max-h-40 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200 text-sm">
                            {empleados.map((e) => (
                                <li key={e.persona} className="flex justify-between px-3 py-1.5">
                                    <span className="text-gray-800">{e.nombre_completo}</span>
                                    <span className="font-mono text-xs text-gray-500">{e.codigocotel}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {running && (
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div className="h-full bg-orange-500 transition-all" style={{ width: `${(progreso / empleados.length) * 100}%` }} />
                        </div>
                    )}
                    <Aviso />
                </div>
            ) : (
                <div className="space-y-3 text-sm">
                    {ok > 0 && (
                        <div className="flex items-center gap-2 font-medium text-green-700">
                            <IoCheckmarkCircleOutline className="h-5 w-5" /> {ok} empleado(s) migrado(s) correctamente
                        </div>
                    )}
                    {fallos.length > 0 && (
                        <div className="rounded-lg bg-red-50 p-3 text-red-700">
                            <div className="mb-1 flex items-center gap-2 font-medium">
                                <IoCloseCircleOutline className="h-5 w-5" /> {fallos.length} no se pudieron migrar
                            </div>
                            <ul className="ml-7 list-disc space-y-0.5">
                                {fallos.map((f) => <li key={f.empleado.persona}>{f.empleado.nombre_completo}: {f.error}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};
