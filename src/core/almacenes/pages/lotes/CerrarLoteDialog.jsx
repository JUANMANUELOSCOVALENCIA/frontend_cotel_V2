// src/core/almacenes/pages/lotes/CerrarLoteDialog.jsx
// Revisa si el lote se puede cerrar y pide motivo si quedan cantidades pendientes.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoAlertCircleOutline, IoWarningOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import { Modal, Button, Field, TextArea, Spinner } from '../../../../shared/components/ui';
import lotesService from '../../services/lotesService';

const CerrarLoteDialog = ({ open, lote, onClose, onDone }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [revision, setRevision] = useState(null);
    const [motivo, setMotivo] = useState('');

    useEffect(() => {
        if (!open || !lote) return;
        setRevision(null);
        setMotivo('');
        setLoading(true);
        lotesService.validarCierre(lote.id).then((r) => {
            setLoading(false);
            if (r.success) setRevision(r.data);
            else { toast.error(r.error); onClose(); }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, lote?.id]);

    if (!lote) return null;
    const bloqueado = revision && !revision.puede_cerrar;
    const conFaltantes = revision?.requiere_confirmacion;
    const motivoValido = motivo.trim().length >= 5;

    const cerrar = async () => {
        setSaving(true);
        const r = await lotesService.cerrar(lote.id, conFaltantes ? { forzar: true, motivo: motivo.trim() } : {});
        setSaving(false);
        if (r.success) {
            toast.success(r.data?.message || `Lote ${lote.numero_lote} cerrado`);
            onDone?.();
        } else {
            toast.error(r.error);
            if (r.data?.bloqueos) setRevision(r.data);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={saving}
            title={`Cerrar lote ${lote.numero_lote}`}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={saving}>{bloqueado ? 'Entendido' : 'Cancelar'}</Button>
                    {!bloqueado && (
                        <Button onClick={cerrar} loading={saving} disabled={!revision || (conFaltantes && !motivoValido)}>
                            {conFaltantes ? 'Cerrar con faltantes' : 'Cerrar lote'}
                        </Button>
                    )}
                </>
            }
        >
            <div className="space-y-4 text-sm">
                {loading && <div className="flex justify-center py-6 text-orange-500"><Spinner className="h-6 w-6" /></div>}

                {bloqueado && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                        <p className="mb-1 flex items-center gap-2 font-semibold"><IoAlertCircleOutline className="h-5 w-5" /> No se puede cerrar todavía</p>
                        <ul className="ml-7 list-disc space-y-1">{revision.bloqueos.map((b) => <li key={b}>{b}</li>)}</ul>
                        <p className="ml-7 mt-2">Termina el paso por laboratorio y vuelve a intentarlo.</p>
                    </div>
                )}

                {revision && conFaltantes && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                        <p className="mb-1 flex items-center gap-2 font-semibold"><IoWarningOutline className="h-5 w-5" /> El lote tiene cantidades pendientes</p>
                        <ul className="ml-7 list-disc space-y-1">{revision.advertencias.map((a) => <li key={a}>{a}</li>)}</ul>
                    </div>
                )}

                {revision && !bloqueado && conFaltantes && (
                    <Field label="Motivo del cierre con faltantes" required hint="Mínimo 5 caracteres. Queda registrado en las observaciones del lote.">
                        <TextArea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} disabled={saving} placeholder="Ej: El proveedor entregará el saldo en la próxima orden de compra" />
                    </Field>
                )}

                {revision && !bloqueado && !conFaltantes && (
                    <p className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 font-medium text-green-700">
                        <IoCheckmarkCircleOutline className="h-5 w-5" /> Todo recibido e inspeccionado. El lote está listo para cerrarse.
                    </p>
                )}

                {revision && !bloqueado && <p className="text-gray-500">Al cerrar el lote ya no se podrán cargar equipos ni registrar más entregas.</p>}
            </div>
        </Modal>
    );
};

export default CerrarLoteDialog;
