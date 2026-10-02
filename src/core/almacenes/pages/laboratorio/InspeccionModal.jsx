// src/core/almacenes/pages/laboratorio/InspeccionModal.jsx
// Registrar el resultado de laboratorio para uno o varios equipos.
// Solo se muestran las pruebas que aplican a sus modelos; cada equipo se evalúa con las suyas.
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import { Modal, Button, Field, TextInput, TextArea, cx } from '../../../../shared/components/ui';
import laboratorioService from '../../services/laboratorioService';
import { PRUEBAS_LAB, pruebasDeModelo } from './pruebas';

const InspeccionModal = ({ open, equipos, onClose, onGuardado }) => {
    const [res, setRes] = useState({});
    const [obs, setObs] = useState('');
    const [informe, setInforme] = useState('');
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);

    // Pruebas que aplican a los equipos elegidos y a cuántos de ellos aplica cada una
    const pruebas = useMemo(() => {
        const cuenta = {};
        equipos.forEach((m) => pruebasDeModelo(m.pruebas).forEach((c) => { cuenta[c] = (cuenta[c] || 0) + 1; }));
        return PRUEBAS_LAB.filter((p) => cuenta[p.campo]).map((p) => ({ ...p, aplicaA: cuenta[p.campo] }));
    }, [equipos]);

    useEffect(() => {
        if (open) {
            setRes(Object.fromEntries(pruebas.map((p) => [p.campo, true])));
            setObs(''); setInforme(''); setErrores({});
        }
    }, [open, pruebas]);

    const fallas = pruebas.filter((p) => res[p.campo] === false);
    const varios = equipos.length > 1;
    // Resultado por equipo según sus propias pruebas
    const rechazados = equipos.filter((m) => pruebasDeModelo(m.pruebas).some((c) => res[c] === false)).length;
    const aprobados = equipos.length - rechazados;

    const guardar = async () => {
        if (rechazados && obs.trim().length < 5) {
            setErrores({ observaciones_tecnico: 'Describe la falla encontrada (mínimo 5 caracteres).' });
            return;
        }
        setGuardando(true);
        const r = await laboratorioService.registrar({
            materiales_ids: equipos.map((m) => m.id),
            ...res,
            observaciones_tecnico: obs.trim(),
            numero_informe: informe.trim(),
        });
        setGuardando(false);
        if (!r.success) {
            setErrores(r.fieldErrors || {});
            toast.error(r.error);
            return;
        }
        toast.success(r.data.message);
        onGuardado();
    };

    const textoBoton = !rechazados ? 'Aprobar' : !aprobados ? 'Rechazar como defectuoso' : 'Registrar resultado';
    const resumen = !rechazados
        ? `Resultado: APROBADO. ${varios ? 'Los equipos quedarán' : 'El equipo quedará'} Disponible.`
        : !aprobados
            ? `Resultado: RECHAZADO (${fallas.map((f) => f.nombre).join(', ')}). ${varios ? 'Los equipos quedarán' : 'El equipo quedará'} como Defectuoso.`
            : `${aprobados} equipo(s) quedan Disponibles y ${rechazados} como Defectuosos: la falla (${fallas.map((f) => f.nombre).join(', ')}) solo cuenta para los modelos que tienen esa prueba.`;

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            size="lg"
            title={varios ? `Resultado para ${equipos.length} equipos` : `Inspección · ${equipos[0]?.gpon_serial || ''}`}
            subtitle={varios ? 'Las pruebas marcadas se aplican a todos los equipos que las tienen' : `${equipos[0]?.modelo || ''} · lote ${equipos[0]?.lote?.numero_lote || ''}`}
            footer={(
                <>
                    <Button variant="ghost" onClick={onClose} disabled={guardando}>Cancelar</Button>
                    <Button variant={rechazados ? 'danger' : 'primary'} onClick={guardar} loading={guardando}>
                        {textoBoton}{varios ? ` (${equipos.length})` : ''}
                    </Button>
                </>
            )}
        >
            <div className="space-y-5 text-sm">
                {varios && (
                    <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto rounded-lg bg-gray-50 p-2">
                        {equipos.map((m) => <span key={m.id} className="rounded bg-white px-2 py-0.5 font-mono text-xs text-gray-700 ring-1 ring-gray-200">{m.gpon_serial || m.codigo_interno}</span>)}
                    </div>
                )}

                <div>
                    <p className="mb-2 font-medium text-gray-700">Pruebas <span className="font-normal text-gray-500">— toca una prueba para marcarla como fallida</span></p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {pruebas.map((p) => {
                            const ok = res[p.campo] !== false;
                            return (
                                <button
                                    key={p.campo}
                                    type="button"
                                    disabled={guardando}
                                    onClick={() => setRes((x) => ({ ...x, [p.campo]: !ok }))}
                                    className={cx(
                                        'flex items-center justify-between rounded-lg border px-3 py-2 text-left',
                                        ok ? 'border-gray-200 bg-white hover:bg-gray-50' : 'border-red-300 bg-red-50'
                                    )}
                                >
                                    <span>
                                        <span className={ok ? 'text-gray-800' : 'font-medium text-red-700'}>{p.nombre}</span>
                                        {varios && p.aplicaA < equipos.length && <span className="block text-xs text-gray-500">aplica a {p.aplicaA} de {equipos.length}</span>}
                                    </span>
                                    {ok
                                        ? <span className="flex items-center gap-1 text-green-600"><IoCheckmarkCircle className="h-5 w-5" /> OK</span>
                                        : <span className="flex items-center gap-1 text-red-600"><IoCloseCircle className="h-5 w-5" /> Falla</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={cx('rounded-lg px-3 py-2', !rechazados ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800')}>{resumen}</div>

                <Field label="Observaciones" required={!!rechazados} error={errores.observaciones_tecnico}>
                    <TextArea
                        rows={2}
                        value={obs}
                        onChange={(e) => { setObs(e.target.value); setErrores((x) => ({ ...x, observaciones_tecnico: undefined })); }}
                        disabled={guardando}
                        placeholder={!rechazados ? 'Opcional' : 'Ej: No enciende el LED PON / WiFi 5G no emite señal'}
                    />
                </Field>

                <Field label="Nº de informe" error={errores.numero_informe} hint={varios ? 'Opcional. Si lo dejas vacío se genera automáticamente; si lo indicas, se le agrega -001, -002… a cada equipo.' : 'Opcional. Si lo dejas vacío se genera automáticamente.'}>
                    <TextInput value={informe} onChange={(e) => setInforme(e.target.value)} disabled={guardando} maxLength={36} placeholder="INF-AAAAMMDD-001" className="sm:w-64" />
                </Field>
            </div>
        </Modal>
    );
};

export default InspeccionModal;
