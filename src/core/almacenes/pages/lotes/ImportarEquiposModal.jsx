// src/core/almacenes/pages/lotes/ImportarEquiposModal.jsx
// Carga de equipos/materiales de un lote desde Excel o CSV:
// 1) elegir modelo + archivo  2) revisar (validación sin guardar)  3) importar
import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoCloudUploadOutline, IoCheckmarkCircle, IoAlertCircle, IoDocumentOutline } from 'react-icons/io5';
import { Modal, Button, Field, TextInput, SelectInput, Badge, cx } from '../../../../shared/components/ui';
import lotesService from '../../services/lotesService';

const COLUMNAS = {
    unico: { requeridas: ['GPON_SN', 'MAC'], opcionales: ['D_SN'], ejemplo: 'GPON_SN: HWTC12345678 · MAC: AA:BB:CC:DD:EE:FF' },
    granel: { requeridas: ['CANTIDAD', 'ITEM_EQUIPO'], opcionales: ['OBSERVACIONES', 'LOTE_PROVEEDOR'], ejemplo: 'CANTIDAD: 500 · ITEM_EQUIPO: 123456' },
};

const ImportarEquiposModal = ({ open, lote, onClose, onDone }) => {
    const [paso, setPaso] = useState(1);
    const [modelo, setModelo] = useState('');
    const [item, setItem] = useState('');
    const [entrega, setEntrega] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [entregas, setEntregas] = useState([]);
    const [revision, setRevision] = useState(null);
    const [resultado, setResultado] = useState(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState({});
    const inputRef = useRef(null);

    const detalles = useMemo(() => (lote?.detalles || []).map((d) => ({
        ...d,
        pendiente: Math.max(0, Number(d.cantidad) - Number(d.cantidad_recibida || 0)),
        esUnico: !!d.modelo_info?.tipo_material?.es_unico,
    })), [lote]);
    const detalle = detalles.find((d) => String(d.modelo) === modelo);
    const cols = detalle ? COLUMNAS[detalle.esUnico ? 'unico' : 'granel'] : null;

    useEffect(() => {
        if (!open || !lote) return;
        setPaso(1); setItem(''); setEntrega(''); setArchivo(null); setRevision(null); setResultado(null); setErr({});
        // Si hay un solo modelo con serie pendiente, se elige solo (el granel se registra con un clic)
        const conPendiente = detalles.filter((d) => d.pendiente > 0);
        const unicos = conPendiente.filter((d) => d.esUnico);
        const elegido = unicos.length === 1 ? unicos[0] : conPendiente.length === 1 ? conPendiente[0] : null;
        setModelo(elegido ? String(elegido.modelo) : '');
        lotesService.entregas(lote.id).then((r) => r.success && setEntregas(r.data.entregas || []));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, lote?.id]);

    const enviar = async (soloValidar) => {
        const e = {};
        if (!modelo) e.modelo = 'Elige el modelo';
        if (!/^\d{6,10}$/.test(item.trim())) e.item = 'De 6 a 10 dígitos';
        if (!archivo) e.archivo = 'Elige el archivo';
        if (Object.keys(e).length) { setErr(e); return; }
        setBusy(true);
        const r = await lotesService.importar({ loteId: lote.id, modeloId: modelo, itemEquipo: item.trim(), archivo, entrega, soloValidar });
        setBusy(false);
        const data = r.success ? r.data : r.data || {};
        const res = data.resultado || {};
        const errores = res.detalles_errores || data.detalles_errores || [];
        if (soloValidar) {
            if (!r.success && !data.resultado) { toast.error(r.error, { duration: 7000 }); return; }
            setRevision({ ...res, errores, validos: res.equipos_validos || res.lotes_validos || [] });
            setPaso(2);
        } else if (r.success) {
            setResultado(res);
            setPaso(3);
            onDone?.();
        } else {
            toast.error(r.error, { duration: 7000 });
            if (data.resultado) setRevision({ ...res, errores, validos: [] });
        }
    };

    if (!lote) return null;
    const entregasAbiertas = entregas.filter((x) => x.puede_recibir_equipos);

    const footer = {
        1: (<><Button variant="ghost" onClick={onClose} disabled={busy}>Cancelar</Button><Button onClick={() => enviar(true)} loading={busy}>Revisar archivo</Button></>),
        2: (<>
            <Button variant="ghost" onClick={() => setPaso(1)} disabled={busy}>Cambiar archivo</Button>
            <Button onClick={() => enviar(false)} loading={busy} disabled={!revision?.validados}>
                {revision?.validados ? `Importar ${revision.validados} ${detalle?.esUnico ? 'equipo(s)' : 'registro(s)'}` : 'Nada para importar'}
            </Button>
        </>),
        3: (<><Button variant="ghost" onClick={() => { setPaso(1); setArchivo(null); setRevision(null); }}>Importar otro archivo</Button><Button onClick={onClose}>Listo</Button></>),
    }[paso];

    return (
        <Modal open={open} onClose={onClose} busy={busy} size="lg" title={`Cargar equipos · ${lote.numero_lote}`} subtitle={['Elegir modelo y archivo', 'Revisión del archivo', 'Resultado'][paso - 1]} footer={footer}>
            {paso === 1 && (
                <div className="space-y-4">
                    <Field label="Modelo" required error={err.modelo}>
                        <SelectInput value={modelo} onChange={(e) => { setModelo(e.target.value); setErr((x) => ({ ...x, modelo: undefined })); }} disabled={busy}>
                            <option value="">Seleccionar…</option>
                            {detalles.map((d) => (
                                <option key={d.id} value={d.modelo} disabled={d.pendiente === 0}>
                                    {d.modelo_info?.marca} {d.modelo_info?.nombre} — faltan {d.pendiente} de {d.cantidad}{d.pendiente === 0 ? ' (completo)' : ''}
                                </option>
                            ))}
                        </SelectInput>
                    </Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Código de ítem Sprint" required error={err.item} hint="Se aplica a todas las filas">
                            <TextInput value={item} inputMode="numeric" maxLength={10} placeholder="6 a 10 dígitos" error={err.item} onChange={(e) => { setItem(e.target.value.replace(/\D/g, '')); setErr((x) => ({ ...x, item: undefined })); }} disabled={busy} />
                        </Field>
                        <Field label="Entrega del proveedor" hint={entregasAbiertas.length ? 'O súmalo a una entrega con espacio' : 'Se registra una entrega nueva con lo importado'}>
                            <SelectInput value={entrega} onChange={(e) => setEntrega(e.target.value)} disabled={busy}>
                                <option value="">Nueva entrega</option>
                                {entregasAbiertas.map((x) => <option key={x.id} value={x.numero_entrega}>Entrega #{x.numero_entrega} — faltan {x.equipos_restantes}</option>)}
                            </SelectInput>
                        </Field>
                    </div>
                    <Field label="Archivo" required error={err.archivo}>
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={busy}
                            className={cx('flex w-full items-center gap-3 rounded-lg border-2 border-dashed px-4 py-5 text-left transition-colors', archivo ? 'border-orange-300 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50', err.archivo && 'border-red-300')}
                        >
                            {archivo ? <IoDocumentOutline className="h-8 w-8 text-orange-500" /> : <IoCloudUploadOutline className="h-8 w-8 text-gray-400" />}
                            <span>
                                <span className="block text-sm font-medium text-gray-800">{archivo ? archivo.name : 'Elegir archivo Excel o CSV'}</span>
                                <span className="block text-xs text-gray-500">{archivo ? `${(archivo.size / 1024).toFixed(1)} KB · clic para cambiar` : '.xlsx, .xls o .csv'}</span>
                            </span>
                        </button>
                        <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { setArchivo(e.target.files?.[0] || null); setErr((x) => ({ ...x, archivo: undefined })); e.target.value = ''; }} />
                    </Field>
                    {cols && (
                        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                            <p className="mb-1 font-medium text-gray-700">Columnas del archivo (primera fila)</p>
                            <p>Obligatorias: {cols.requeridas.map((c) => <code key={c} className="mr-1 rounded bg-white px-1 py-0.5 text-gray-800">{c}</code>)}</p>
                            <p className="mt-1">Opcionales: {cols.opcionales.map((c) => <code key={c} className="mr-1 rounded bg-white px-1 py-0.5 text-gray-800">{c}</code>)}</p>
                            <p className="mt-1 text-gray-500">Ejemplo: {cols.ejemplo}</p>
                        </div>
                    )}
                </div>
            )}

            {paso === 2 && revision && (
                <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border border-gray-200 p-3"><p className="text-xs text-gray-500">Filas</p><p className="text-xl font-bold text-gray-800">{revision.total_filas ?? 0}</p></div>
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3"><p className="text-xs text-green-700">Listas para importar</p><p className="text-xl font-bold text-green-700">{revision.validados ?? 0}</p></div>
                        <div className={cx('rounded-lg border p-3', revision.errores?.length ? 'border-red-200 bg-red-50' : 'border-gray-200')}><p className="text-xs text-red-700">Con errores</p><p className="text-xl font-bold text-red-700">{typeof revision.errores === 'number' ? revision.errores : revision.errores?.length ?? 0}</p></div>
                    </div>
                    {detalle && revision.validados > detalle.pendiente && (
                        <p className="rounded-lg bg-amber-50 p-3 text-amber-800">El archivo trae {revision.validados} y en el lote faltan {detalle.pendiente}. Revisa que sea el archivo correcto.</p>
                    )}
                    {!!revision.errores?.length && (
                        <div>
                            <p className="mb-1 font-medium text-gray-700">Filas con errores (no se importarán)</p>
                            <div className="max-h-60 overflow-auto rounded-lg border border-gray-200">
                                <table className="w-full text-left text-xs">
                                    <thead className="sticky top-0 bg-gray-50 text-gray-500"><tr><th className="px-3 py-2">Fila</th><th className="px-3 py-2">Dato</th><th className="px-3 py-2">Problema</th></tr></thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {revision.errores.map((e, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-1.5 text-gray-500">{e.fila}</td>
                                                <td className="px-3 py-1.5 font-mono text-gray-700">{e.mac || e.gpon || e.cantidad || '—'}</td>
                                                <td className="px-3 py-1.5 text-red-700">{(e.errores || []).join('; ')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {!!revision.validos?.length && (
                        <div>
                            <p className="mb-1 font-medium text-gray-700">Vista previa</p>
                            <div className="flex flex-wrap gap-1">
                                {revision.validos.map((x, i) => <Badge key={i} color="gray">{x.gpon_serial || x.mac_address || `${x.cantidad} u.`}</Badge>)}
                                {revision.validados > revision.validos.length && <span className="text-xs text-gray-500">y {revision.validados - revision.validos.length} más…</span>}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {paso === 3 && resultado && (
                <div className="space-y-3 py-4 text-center text-sm">
                    {(resultado.errores_importacion || []).length ? <IoAlertCircle className="mx-auto h-12 w-12 text-amber-500" /> : <IoCheckmarkCircle className="mx-auto h-12 w-12 text-green-500" />}
                    <p className="text-lg font-semibold text-gray-800">{resultado.importados ?? 0} registro(s) importado(s)</p>
                    {resultado.numero_entrega && <p className="text-gray-500">Asignados a la entrega #{resultado.numero_entrega}</p>}
                    {!!(resultado.errores_importacion || []).length && (
                        <p className="text-amber-700">{resultado.errores_importacion.length} fila(s) no se pudieron guardar.</p>
                    )}
                    {detalle?.modelo_info && lote.detalles?.length && <p className="text-gray-500">Revisa el avance del lote en su detalle.</p>}
                </div>
            )}
        </Modal>
    );
};

export default ImportarEquiposModal;
