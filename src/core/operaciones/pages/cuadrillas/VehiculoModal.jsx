// src/core/operaciones/pages/cuadrillas/VehiculoModal.jsx
// Registro de un vehículo y su equipamiento fijo (lista de control, no inventario).
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoAddOutline, IoTrashOutline } from 'react-icons/io5';
import { Modal, Button, Field, TextInput, TextArea, Toggle, IconButton } from '../../../../shared/components/ui';
import { vehiculosService } from '../../services/operacionesService';

const SUGERIDOS = ['Escalera 8 m', 'Empalmadora de fusión', 'Medidor de potencia óptica', 'Cortadora de fibra', 'Kit de herramientas'];

const VehiculoModal = ({ open, vehiculo, puedeEditar, onClose, onGuardado }) => {
    const nuevo = !vehiculo;
    const [v, setV] = useState({});
    const [equipos, setEquipos] = useState([]);
    const [errores, setErrores] = useState({});
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (!open) return;
        setV({ placa: vehiculo?.placa || '', descripcion: vehiculo?.descripcion || '', observaciones: vehiculo?.observaciones || '', activo: vehiculo?.activo ?? true });
        setEquipos((vehiculo?.equipamiento || []).map(({ nombre, cantidad, nota }) => ({ nombre, cantidad: String(cantidad), nota })));
        setErrores({}); setError('');
    }, [open, vehiculo]);

    const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e?.target ? e.target.value : e })); setErrores((x) => ({ ...x, [k]: '' })); };
    const setEquipo = (i, k) => (e) => setEquipos((l) => l.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)));
    const agregar = (nombre = '') => setEquipos((l) => [...l, { nombre, cantidad: '1', nota: '' }]);
    const quitar = (i) => setEquipos((l) => l.filter((_, j) => j !== i));

    const guardar = async () => {
        const e = {};
        if (!v.placa.trim()) e.placa = 'Indica la placa.';
        if (!v.descripcion.trim()) e.descripcion = 'Describe el vehículo.';
        const lista = equipos.filter((x) => x.nombre.trim());
        if (lista.some((x) => !(Number(x.cantidad) >= 1))) e.equipamiento = 'La cantidad mínima es 1.';
        setErrores(e);
        if (Object.keys(e).length) return;
        setGuardando(true);
        const datos = {
            placa: v.placa.trim(), descripcion: v.descripcion.trim(), observaciones: v.observaciones.trim(),
            equipamiento: lista.map((x) => ({ nombre: x.nombre.trim(), cantidad: Number(x.cantidad), nota: x.nota.trim() })),
            ...(nuevo ? {} : { activo: v.activo }),
        };
        const r = nuevo ? await vehiculosService.crear(datos) : await vehiculosService.actualizar(vehiculo.id, datos);
        setGuardando(false);
        if (!r.success) { setErrores(r.fieldErrors || {}); setError(r.error); return; }
        toast.success(nuevo ? `Vehículo ${r.data.placa} registrado.` : 'Vehículo guardado.');
        onGuardado?.(r.data);
    };

    const soloLectura = !puedeEditar;
    const faltantes = SUGERIDOS.filter((s) => !equipos.some((x) => x.nombre.trim().toLowerCase() === s.toLowerCase()));

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            size="lg"
            title={nuevo ? 'Nuevo vehículo' : `Vehículo ${vehiculo.placa}`}
            subtitle={vehiculo?.cuadrilla ? `Asignado a ${vehiculo.cuadrilla.nombre}` : 'El equipamiento sirve para controlar lo que lleva la cuadrilla'}
            footer={(
                <>
                    <Button variant="ghost" onClick={onClose} disabled={guardando}>{soloLectura ? 'Cerrar' : 'Cancelar'}</Button>
                    {!soloLectura && <Button onClick={guardar} loading={guardando}>{nuevo ? 'Registrar' : 'Guardar'}</Button>}
                </>
            )}
        >
            <div className="space-y-4 text-sm">
                {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Placa" required error={errores.placa}>
                        <TextInput value={v.placa || ''} onChange={set('placa')} maxLength={15} placeholder="Ej: 2345ABC" disabled={soloLectura} error={errores.placa} className="uppercase" />
                    </Field>
                    <Field label="Descripción" required error={errores.descripcion} className="sm:col-span-2">
                        <TextInput value={v.descripcion || ''} onChange={set('descripcion')} maxLength={120} placeholder="Ej: Camioneta Toyota blanca" disabled={soloLectura} error={errores.descripcion} />
                    </Field>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Equipamiento fijo</p>
                        {!soloLectura && <Button variant="secondary" icon={IoAddOutline} onClick={() => agregar()}>Agregar</Button>}
                    </div>
                    {errores.equipamiento && <p className="mb-2 text-xs text-red-600">{errores.equipamiento}</p>}
                    {!equipos.length && <p className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-center text-gray-500">Sin equipamiento registrado.</p>}
                    <div className="space-y-2">
                        {equipos.map((x, i) => (
                            <div key={i} className="grid grid-cols-12 items-center gap-2">
                                <TextInput className="col-span-6" value={x.nombre} onChange={setEquipo(i, 'nombre')} maxLength={100} placeholder="Equipo" disabled={soloLectura} />
                                <TextInput className="col-span-2" type="number" min={1} value={x.cantidad} onChange={setEquipo(i, 'cantidad')} disabled={soloLectura} />
                                <TextInput className="col-span-3" value={x.nota} onChange={setEquipo(i, 'nota')} maxLength={200} placeholder="Nota" disabled={soloLectura} />
                                {!soloLectura && <IconButton icon={IoTrashOutline} tone="danger" title="Quitar" onClick={() => quitar(i)} />}
                            </div>
                        ))}
                    </div>
                    {!soloLectura && faltantes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {faltantes.map((s) => (
                                <button key={s} type="button" onClick={() => agregar(s)} className="rounded-full border border-gray-300 px-2.5 py-0.5 text-xs text-gray-600 hover:bg-gray-50">+ {s}</button>
                            ))}
                        </div>
                    )}
                </div>

                <Field label="Observaciones">
                    <TextArea rows={2} value={v.observaciones || ''} onChange={set('observaciones')} disabled={soloLectura} />
                </Field>
                {!nuevo && !soloLectura && (
                    <Toggle checked={v.activo} onChange={set('activo')} label={v.activo ? 'Activo' : 'Inactivo (no se puede asignar a cuadrillas)'} />
                )}
            </div>
        </Modal>
    );
};

export default VehiculoModal;
