// src/core/operaciones/components/ProgramarModal.jsx
// Asignar una o varias OT a una cuadrilla y fecha. Si la OT ya estaba programada
// es una reprogramación y el motivo es obligatorio (queda en el historial).
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, Button, Field, SelectInput, TextInput, TextArea } from '../../../shared/components/ui';
import { cuadrillasService, ordenesService } from '../services/operacionesService';
import { hoyISO, sumarDias, fechaCorta } from './opUi';

// Avisos que no impiden programar (capacidad, zona)
export const mostrarAvisos = (avisos) => (avisos || []).forEach((a) => toast(a, { duration: 7000 }));

const completa = (c) => c.integrantes.length >= 2 && c.integrantes.some((i) => i.es_jefe);

const ProgramarModal = ({ open, ordenes = [], onClose, onHecho }) => {
    const una = ordenes.length === 1 ? ordenes[0] : null;
    const reprograma = !!una && una.estado.codigo === 'PROGRAMADA';
    const [cuadrillas, setCuadrillas] = useState([]);
    const [v, setV] = useState({ cuadrilla: '', fecha: '', motivo: '' });
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (!open) return;
        setError('');
        setV({
            cuadrilla: una?.cuadrilla?.id ? String(una.cuadrilla.id) : '',
            fecha: una?.fecha_programada && una.fecha_programada >= hoyISO() ? una.fecha_programada : sumarDias(hoyISO(), 1),
            motivo: '',
        });
        cuadrillasService.listar({ activas: 'true' }).then((r) => (r.success ? setCuadrillas(r.data) : toast.error(r.error)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, una?.id]);

    const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); setError(''); };

    const guardar = async () => {
        if (!v.cuadrilla) { setError('Elige la cuadrilla.'); return; }
        if (!v.fecha) { setError('Indica la fecha.'); return; }
        if (reprograma && v.motivo.trim().length < 5) { setError('Indica el motivo de la reprogramación (mínimo 5 caracteres).'); return; }
        setGuardando(true);
        const datos = { cuadrilla: Number(v.cuadrilla), fecha: v.fecha };
        const r = una
            ? await ordenesService.programar(una.id, { ...datos, motivo: v.motivo.trim() })
            : await ordenesService.programarVarias({ ...datos, ordenes: ordenes.map((o) => o.id) });
        setGuardando(false);
        if (!r.success) { setError(r.error); return; }
        toast.success(r.data.message);
        mostrarAvisos(r.data.avisos);
        onHecho?.(r.data);
    };

    const elegida = cuadrillas.find((c) => String(c.id) === v.cuadrilla);

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            title={reprograma ? `Reprogramar ${una.numero}` : una ? `Programar ${una.numero}` : `Programar ${ordenes.length} OT`}
            subtitle={reprograma ? `Hoy: ${una.cuadrilla?.nombre} · ${fechaCorta(una.fecha_programada)}` : 'Elige la cuadrilla y el día'}
            footer={(
                <>
                    <Button variant="ghost" onClick={onClose} disabled={guardando}>Cancelar</Button>
                    <Button onClick={guardar} loading={guardando}>{reprograma ? 'Reprogramar' : 'Programar'}</Button>
                </>
            )}
        >
            <div className="space-y-4 text-sm">
                {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Cuadrilla" required>
                        <SelectInput value={v.cuadrilla} onChange={set('cuadrilla')}>
                            <option value="">Elige…</option>
                            {cuadrillas.map((c) => (
                                <option key={c.id} value={c.id} disabled={!completa(c)}>
                                    {c.nombre}{completa(c) ? '' : ' (incompleta)'}
                                </option>
                            ))}
                        </SelectInput>
                    </Field>
                    <Field label="Fecha" required>
                        <TextInput type="date" min={hoyISO()} value={v.fecha} onChange={set('fecha')} />
                    </Field>
                </div>
                {elegida && (
                    <p className="text-xs text-gray-500">
                        {elegida.integrantes.map((i) => `${i.usuario.nombre}${i.es_jefe ? ' (jefe)' : ''}`).join(', ')}
                        {elegida.vehiculo_info ? ` · ${elegida.vehiculo_info.placa}` : ''}
                        {elegida.zonas_info.length ? ` · Zonas: ${elegida.zonas_info.map((z) => z.nombre).join(', ')}` : ''}
                    </p>
                )}
                {reprograma && (
                    <Field label="Motivo de la reprogramación" required hint="Queda en el historial de la OT.">
                        <TextArea rows={2} value={v.motivo} onChange={set('motivo')} placeholder="Ej: el cliente pidió otro día" />
                    </Field>
                )}
                {!una && <p className="text-xs text-gray-500">{ordenes.map((o) => o.numero).join(', ')}</p>}
            </div>
        </Modal>
    );
};

export default ProgramarModal;
