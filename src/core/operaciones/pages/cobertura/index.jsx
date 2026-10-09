// src/core/operaciones/pages/cobertura/index.jsx
// Mapa de cobertura: zonas (polígonos) donde se puede instalar fibra.
// Se dibujan en el mapa o se importan desde un archivo GeoJSON.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import {
    IoAddOutline, IoCloudUploadOutline, IoDownloadOutline, IoMapOutline, IoEllipsisVertical,
    IoCreateOutline, IoShapesOutline, IoTrashOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline,
    IoAlertCircleOutline,
} from 'react-icons/io5';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { useOpcionesCompletas } from '../../../almacenes/hooks/useAlmacenes';
import {
    PageHeader, Card, Button, IconButton, Badge, Dropdown, EmptyState, Spinner, Modal, ConfirmModal,
    Field, TextInput, TextArea, SelectInput, Toggle, cx,
} from '../../../../shared/components/ui';
import { zonasService, solicitudesService } from '../../services/operacionesService';
import { crearMapa, dibujarZonas, encuadrar, estiloZona, L } from '../../components/mapa';

const COLORES = ['#F97316', '#2563EB', '#16A34A', '#9333EA', '#DC2626', '#0891B2', '#CA8A04', '#DB2777'];

// ---------- Formulario de datos de la zona ----------
const ZonaForm = ({ open, zona, geometria, almacenes, onClose, onGuardada }) => {
    const [v, setV] = useState({});
    const [errores, setErrores] = useState({});
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (!open) return;
        setV({
            nombre: zona?.nombre || '',
            color: zona?.color || COLORES[Math.floor(Math.random() * COLORES.length)],
            almacen: zona?.almacen || '',
            observaciones: zona?.observaciones || '',
            activo: zona ? zona.activo : true,
        });
        setErrores({}); setError('');
    }, [open, zona]);

    const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e?.target ? e.target.value : e })); setErrores((x) => ({ ...x, [k]: '' })); };

    const guardar = async () => {
        if (!v.nombre.trim()) { setErrores({ nombre: 'Ponle un nombre a la zona' }); return; }
        setGuardando(true);
        const datos = { ...v, nombre: v.nombre.trim(), almacen: v.almacen || null, ...(geometria ? { geometria } : {}) };
        const r = zona ? await zonasService.actualizar(zona.id, datos) : await zonasService.crear(datos);
        setGuardando(false);
        if (!r.success) { setErrores(r.fieldErrors || {}); setError(r.fieldErrors?.nombre ? '' : r.error); return; }
        toast.success(zona ? 'Zona actualizada' : `Zona «${r.data.nombre}» creada`);
        onGuardada(r.data);
    };

    return (
        <Modal open={open} onClose={onClose} busy={guardando} title={zona ? `Editar zona · ${zona.nombre}` : 'Nueva zona de cobertura'}
            footer={<><Button variant="ghost" onClick={onClose} disabled={guardando}>Cancelar</Button><Button onClick={guardar} loading={guardando}>Guardar</Button></>}>
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 sm:col-span-2">{error}</div>}
                <Field label="Nombre" required error={errores.nombre} className="sm:col-span-2">
                    <TextInput value={v.nombre || ''} onChange={set('nombre')} maxLength={100} placeholder="Ej: Sopocachi, Ciudad Satélite" error={errores.nombre} autoFocus />
                </Field>
                <Field label="Color en el mapa" error={errores.color}>
                    <div className="flex flex-wrap items-center gap-2">
                        {COLORES.map((c) => (
                            <button key={c} type="button" onClick={() => set('color')(c)} aria-label={c}
                                className={cx('h-7 w-7 rounded-full ring-offset-2', v.color === c && 'ring-2 ring-gray-800')} style={{ background: c }} />
                        ))}
                    </div>
                </Field>
                <Field label="Almacén que la atiende" hint="Opcional. Servirá para saber de dónde salen los equipos.">
                    <SelectInput value={v.almacen || ''} onChange={set('almacen')}>
                        <option value="">Sin indicar</option>
                        {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </SelectInput>
                </Field>
                <Field label="Observaciones" className="sm:col-span-2">
                    <TextArea rows={2} value={v.observaciones || ''} onChange={set('observaciones')} />
                </Field>
                {zona && <div className="sm:col-span-2"><Toggle checked={v.activo} onChange={set('activo')} label="Zona activa (se usa para validar solicitudes)" /></div>}
            </div>
        </Modal>
    );
};

// ---------- Importar archivo GeoJSON ----------
const nombreDeFeature = (f, i) => {
    const p = f.properties || {};
    return String(p.nombre || p.name || p.Name || p.NOMBRE || p.zona || `Zona importada ${i + 1}`).trim().slice(0, 100);
};

const ImportarModal = ({ open, archivo, onClose, onListo }) => {
    const [filas, setFilas] = useState([]);
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (!open || !archivo) return;
        setError(''); setFilas([]);
        archivo.text().then((txt) => {
            let json;
            try { json = JSON.parse(txt); } catch { setError('El archivo no es un GeoJSON válido.'); return; }
            const feats = json.type === 'FeatureCollection' ? json.features || [] : json.type === 'Feature' ? [json] : [{ type: 'Feature', geometry: json, properties: {} }];
            const polis = feats.filter((f) => ['Polygon', 'MultiPolygon'].includes(f?.geometry?.type));
            if (!polis.length) { setError('El archivo no tiene polígonos (solo se importan zonas tipo Polygon o MultiPolygon).'); return; }
            setFilas(polis.map((f, i) => ({ nombre: nombreDeFeature(f, i), color: f.properties?.color || COLORES[i % COLORES.length], geometria: f.geometry, incluir: true, estado: '' })));
            if (polis.length < feats.length) setError(`Se ignoraron ${feats.length - polis.length} elemento(s) que no son polígonos (puntos o líneas).`);
        });
    }, [open, archivo]);

    const importar = async () => {
        setGuardando(true);
        let ok = 0;
        const nuevas = [...filas];
        for (let i = 0; i < nuevas.length; i += 1) {
            const f = nuevas[i];
            if (!f.incluir || f.estado === 'ok') continue;
            const color = /^#[0-9a-fA-F]{6}$/.test(f.color) ? f.color : COLORES[i % COLORES.length];
            // eslint-disable-next-line no-await-in-loop
            const r = await zonasService.crear({ nombre: f.nombre, color, geometria: f.geometria });
            nuevas[i] = { ...f, estado: r.success ? 'ok' : (r.fieldErrors?.nombre || r.fieldErrors?.geometria || r.error) };
            if (r.success) ok += 1;
        }
        setFilas(nuevas);
        setGuardando(false);
        if (ok) { toast.success(`${ok} zona(s) importada(s)`); onListo(); }
        if (nuevas.every((f) => !f.incluir || f.estado === 'ok')) onClose();
    };

    return (
        <Modal open={open} onClose={onClose} busy={guardando} size="lg" title="Importar zonas" subtitle={archivo?.name}
            footer={<><Button variant="ghost" onClick={onClose} disabled={guardando}>Cerrar</Button><Button onClick={importar} loading={guardando} disabled={!filas.some((f) => f.incluir && f.estado !== 'ok')}>Importar</Button></>}>
            <div className="space-y-3 text-sm">
                {error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">{error}</p>}
                {filas.length > 0 && <p className="text-gray-600">Revisa los nombres antes de importar. Cada polígono se crea como una zona.</p>}
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                    {filas.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 px-3 py-2">
                            <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={f.incluir} disabled={f.estado === 'ok'}
                                onChange={(e) => setFilas((x) => x.map((y, j) => (j === i ? { ...y, incluir: e.target.checked } : y)))} />
                            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: f.color }} />
                            <TextInput className="h-9" value={f.nombre} disabled={f.estado === 'ok'} maxLength={100}
                                onChange={(e) => setFilas((x) => x.map((y, j) => (j === i ? { ...y, nombre: e.target.value, estado: '' } : y)))} />
                            <span className="w-40 shrink-0 text-xs">
                                {f.estado === 'ok' && <span className="text-green-700">Importada</span>}
                                {f.estado && f.estado !== 'ok' && <span className="text-red-600">{f.estado}</span>}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </Modal>
    );
};

// ---------- Página ----------
const Cobertura = () => {
    const { hasPermission } = usePermissions();
    const puede = { crear: hasPermission('cobertura', 'crear'), editar: hasPermission('cobertura', 'actualizar'), eliminar: hasPermission('cobertura', 'eliminar') };
    const { opciones } = useOpcionesCompletas();

    const [zonas, setZonas] = useState([]);
    const [demanda, setDemanda] = useState([]);
    const [verDemanda, setVerDemanda] = useState(true);
    const [loading, setLoading] = useState(true);
    const [sel, setSel] = useState(null);
    const [modo, setModo] = useState(null); // 'dibujar' | 'forma'
    const [form, setForm] = useState(null); // { zona, geometria }
    const [importar, setImportar] = useState(null);
    const [borrar, setBorrar] = useState({ zona: null, loading: false });

    const el = useRef(null);
    const map = useRef(null);
    const capaZonas = useRef(null);
    const capaDemanda = useRef(null);
    const capaEdicion = useRef(null);
    const inputArchivo = useRef(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        const [r, d] = await Promise.all([
            zonasService.listar(),
            solicitudesService.listar({ estado: 'SIN_COBERTURA', page_size: 100 }),
        ]);
        setLoading(false);
        if (r.success) setZonas(r.data); else toast.error(r.error);
        if (d.success) setDemanda(d.data.results || []);
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    // Mapa
    useEffect(() => {
        map.current = crearMapa(el.current, { zoom: 12 });
        map.current.pm.setLang('es');
        map.current.on('pm:create', (e) => {
            capaEdicion.current = e.layer;
            map.current.pm.disableDraw();
            setModo(null);
            setForm({ zona: null, geometria: e.layer.toGeoJSON().geometry });
        });
        return () => { map.current?.remove(); map.current = null; capaZonas.current = null; capaDemanda.current = null; capaEdicion.current = null; };
    }, []);

    const primeraVez = useRef(true);
    useEffect(() => {
        if (!map.current) return;
        capaZonas.current?.remove();
        capaZonas.current = dibujarZonas(map.current, zonas, { onClick: (z) => setSel(z.id) });
        if (primeraVez.current && zonas.length) { encuadrar(map.current, capaZonas.current); primeraVez.current = false; }
    }, [zonas]);

    useEffect(() => {
        if (!map.current) return;
        capaDemanda.current?.remove();
        if (!verDemanda || !demanda.length) return;
        capaDemanda.current = L.layerGroup(demanda.map((s) => L.circleMarker([s.ubicacion.lat, s.ubicacion.lng], {
            radius: 6, color: '#fff', weight: 2, fillColor: '#B45309', fillOpacity: 0.9,
        }).bindTooltip(`${s.numero} · ${s.cliente.nombre}<br/>${s.direccion}`))).addTo(map.current);
    }, [demanda, verDemanda]);

    // Resaltar la zona elegida
    useEffect(() => {
        capaZonas.current?.eachLayer((capa) => {
            const z = zonas.find((x) => x.id === capa.zonaId);
            if (z) capa.setStyle(estiloZona(z, z.id === sel));
        });
        const capa = capaZonas.current?.getLayers().find((c) => c.zonaId === sel);
        if (capa && !modo) map.current.fitBounds(capa.getBounds(), { padding: [40, 40], maxZoom: 16 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sel, zonas]);

    const zonaSel = useMemo(() => zonas.find((z) => z.id === sel), [zonas, sel]);

    const empezarDibujo = () => {
        cancelarEdicion();
        setSel(null);
        setModo('dibujar');
        map.current.pm.enableDraw('Polygon', { snappable: true, allowSelfIntersection: false, templineStyle: { color: '#F97316' }, hintlineStyle: { color: '#F97316', dashArray: [5, 5] } });
    };

    const empezarForma = (z) => {
        cancelarEdicion();
        setSel(z.id);
        const capa = L.geoJSON(z.geometria, { style: { ...estiloZona(z, true), dashArray: null } }).getLayers()[0];
        capa.addTo(map.current);
        capa.pm.enable({ allowSelfIntersection: false, snappable: true });
        capaEdicion.current = capa;
        capaZonas.current?.getLayers().find((c) => c.zonaId === z.id)?.setStyle({ opacity: 0, fillOpacity: 0 });
        setModo('forma');
    };

    function cancelarEdicion() {
        map.current?.pm.disableDraw();
        if (capaEdicion.current) { capaEdicion.current.pm?.disable(); capaEdicion.current.remove(); capaEdicion.current = null; }
        capaZonas.current?.eachLayer((capa) => {
            const z = zonas.find((x) => x.id === capa.zonaId);
            if (z) capa.setStyle(estiloZona(z, z.id === sel));
        });
        setModo(null);
    }

    const guardarForma = async () => {
        const geometria = capaEdicion.current.toGeoJSON().geometry;
        const r = await zonasService.actualizar(zonaSel.id, { geometria });
        if (!r.success) { toast.error(r.error); return; }
        toast.success('Forma de la zona guardada');
        cancelarEdicion();
        setZonas((x) => x.map((z) => (z.id === r.data.id ? r.data : z)));
    };

    const alternar = async (z) => {
        const r = await zonasService.actualizar(z.id, { activo: !z.activo });
        if (!r.success) { toast.error(r.error); return; }
        toast.success(`${z.nombre}: ${z.activo ? 'desactivada' : 'activada'}`);
        setZonas((x) => x.map((y) => (y.id === z.id ? r.data : y)));
    };

    const eliminar = async () => {
        setBorrar((b) => ({ ...b, loading: true }));
        const r = await zonasService.eliminar(borrar.zona.id);
        if (!r.success) { toast.error(r.error); setBorrar((b) => ({ ...b, loading: false })); return; }
        toast.success('Zona eliminada');
        setBorrar({ zona: null, loading: false });
        setSel(null);
        cargar();
    };

    const exportar = () => {
        const fc = {
            type: 'FeatureCollection',
            features: zonas.map((z) => ({ type: 'Feature', properties: { nombre: z.nombre, color: z.color, almacen: z.almacen_nombre, activo: z.activo }, geometry: z.geometria })),
        };
        const url = URL.createObjectURL(new Blob([JSON.stringify(fc, null, 2)], { type: 'application/geo+json' }));
        const a = document.createElement('a');
        a.href = url; a.download = `cobertura_cotel_${new Date().toISOString().slice(0, 10)}.geojson`; a.click();
        URL.revokeObjectURL(url);
    };

    const revisar = async () => {
        const r = await solicitudesService.revisarCobertura();
        if (!r.success) { toast.error(r.error); return; }
        toast.success(r.data.message, { duration: 6000 });
        cargar();
    };

    const activas = zonas.filter((z) => z.activo);
    const area = activas.reduce((s, z) => s + (z.area_km2 || 0), 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Cobertura"
                subtitle="Zonas donde COTEL puede instalar fibra. Las solicitudes fuera de estas zonas quedan como «sin cobertura»."
                actions={(
                    <>
                        {zonas.length > 0 && <Button variant="secondary" icon={IoDownloadOutline} onClick={exportar}>Exportar</Button>}
                        {puede.crear && (
                            <>
                                <input ref={inputArchivo} type="file" accept=".geojson,.json,application/geo+json,application/json" className="hidden"
                                    onChange={(e) => { if (e.target.files?.[0]) setImportar(e.target.files[0]); e.target.value = ''; }} />
                                <Button variant="secondary" icon={IoCloudUploadOutline} onClick={() => inputArchivo.current?.click()}>Importar GeoJSON</Button>
                                <Button icon={IoAddOutline} onClick={empezarDibujo} disabled={modo === 'dibujar'}>Dibujar zona</Button>
                            </>
                        )}
                    </>
                )}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
                <Card className="flex max-h-[70vh] flex-col overflow-hidden">
                    <div className="border-b border-gray-200 px-4 py-3">
                        <p className="font-semibold text-gray-800">{activas.length} zona(s) activa(s)</p>
                        <p className="text-xs text-gray-500">≈ {area.toLocaleString('es-BO', { maximumFractionDigits: 1 })} km² de cobertura</p>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {loading && !zonas.length && <div className="flex justify-center py-10 text-orange-500"><Spinner className="h-6 w-6" /></div>}
                        {!loading && !zonas.length && (
                            <EmptyState icon={IoMapOutline} title="Aún no hay zonas">
                                {puede.crear ? 'Dibuja la primera en el mapa o importa un archivo GeoJSON.' : 'Pide a quien administra la cobertura que las registre.'}
                            </EmptyState>
                        )}
                        <ul className="divide-y divide-gray-100">
                            {zonas.map((z) => (
                                <li key={z.id} className={cx('flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-gray-50', sel === z.id && 'bg-orange-50/60', !z.activo && 'opacity-60')}
                                    onClick={() => !modo && setSel(z.id)}>
                                    <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: z.color }} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-gray-800">{z.nombre}</p>
                                        <p className="text-xs text-gray-500">
                                            {[z.almacen_nombre, `${z.area_km2} km²`, `${z.solicitudes} solicitud(es)`].filter(Boolean).join(' · ')}
                                        </p>
                                        {!z.activo && <Badge className="mt-1">Inactiva</Badge>}
                                    </div>
                                    {(puede.editar || puede.eliminar) && !modo && (
                                        <span onClick={(e) => e.stopPropagation()}>
                                            <Dropdown
                                                trigger={<IconButton icon={IoEllipsisVertical} title="Acciones" />}
                                                items={[
                                                    puede.editar && { label: 'Editar datos', icon: IoCreateOutline, onClick: () => setForm({ zona: z, geometria: null }) },
                                                    puede.editar && { label: 'Editar forma', icon: IoShapesOutline, onClick: () => empezarForma(z) },
                                                    puede.editar && (z.activo
                                                        ? { label: 'Desactivar', icon: IoCloseCircleOutline, onClick: () => alternar(z) }
                                                        : { label: 'Activar', icon: IoCheckmarkCircleOutline, onClick: () => alternar(z) }),
                                                    puede.eliminar && { divider: true },
                                                    puede.eliminar && { label: 'Eliminar', icon: IoTrashOutline, danger: true, onClick: () => setBorrar({ zona: z, loading: false }) },
                                                ]}
                                            />
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {demanda.length > 0 && (
                        <div className="space-y-2 border-t border-gray-200 bg-amber-50 px-4 py-3 text-sm">
                            <p className="flex items-center gap-1.5 font-medium text-amber-800"><IoAlertCircleOutline className="h-4 w-4" />{demanda.length} solicitud(es) sin cobertura</p>
                            <Toggle checked={verDemanda} onChange={setVerDemanda} label="Ver en el mapa" />
                            {hasPermission('solicitudes', 'actualizar') && (
                                <Button variant="secondary" className="w-full" onClick={revisar}>Revisar con las zonas actuales</Button>
                            )}
                        </div>
                    )}
                </Card>

                <Card className="relative overflow-hidden">
                    <div ref={el} className="h-[70vh] min-h-[420px] w-full" />
                    {modo === 'dibujar' && (
                        <div className="absolute inset-x-0 top-3 z-[1000] mx-auto flex w-fit items-center gap-3 rounded-full bg-gray-800/90 px-4 py-2 text-sm text-white">
                            Haz clic para poner los puntos; clic en el primero para cerrar la zona.
                            <button type="button" className="font-semibold text-orange-300" onClick={cancelarEdicion}>Cancelar</button>
                        </div>
                    )}
                    {modo === 'forma' && (
                        <div className="absolute inset-x-0 top-3 z-[1000] mx-auto flex w-fit items-center gap-2 rounded-full bg-white px-3 py-2 text-sm shadow-lg ring-1 ring-gray-200">
                            <span className="px-1 text-gray-700">Arrastra los puntos de <strong>{zonaSel?.nombre}</strong></span>
                            <Button variant="ghost" className="h-8 py-0" onClick={cancelarEdicion}>Cancelar</Button>
                            <Button className="h-8 py-0" onClick={guardarForma}>Guardar forma</Button>
                        </div>
                    )}
                </Card>
            </div>

            <ZonaForm
                open={!!form}
                zona={form?.zona}
                geometria={form?.geometria}
                almacenes={opciones.almacenes || []}
                onClose={() => { setForm(null); if (capaEdicion.current && !form?.zona) cancelarEdicion(); }}
                onGuardada={(z) => { setForm(null); if (capaEdicion.current) cancelarEdicion(); setSel(z.id); cargar(); }}
            />
            <ImportarModal open={!!importar} archivo={importar} onClose={() => setImportar(null)} onListo={cargar} />
            <ConfirmModal
                open={!!borrar.zona}
                onClose={() => setBorrar({ zona: null, loading: false })}
                onConfirm={eliminar}
                loading={borrar.loading}
                danger
                title="Eliminar zona"
                confirmText="Eliminar"
                message={<>¿Eliminar la zona <strong>{borrar.zona?.nombre}</strong>? Si ya tiene solicitudes, mejor desactívala.</>}
            />
        </div>
    );
};

export default Cobertura;
