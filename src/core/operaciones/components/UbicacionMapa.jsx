// src/core/operaciones/components/UbicacionMapa.jsx
// Mapa para marcar (o solo mostrar) la ubicación de un cliente sobre las zonas de cobertura.
import React, { useEffect, useRef, useState } from 'react';
import { IoLocateOutline, IoSearchOutline } from 'react-icons/io5';
import { Button, Spinner, cx, inputCls } from '../../../shared/components/ui';
import { crearMapa, dibujarZonas, encuadrar, pin, buscarDireccion, redondear, L } from './mapa';

const UbicacionMapa = ({ zonas = [], valor, onChange, soloLectura = false, alto = 'h-80', color = '#F97316' }) => {
    const el = useRef(null);
    const map = useRef(null);
    const marcador = useRef(null);
    const capaZonas = useRef(null);
    const cambiar = useRef(onChange);
    cambiar.current = onChange;

    const [texto, setTexto] = useState('');
    const [resultados, setResultados] = useState(null);
    const [buscando, setBuscando] = useState(false);
    const [errorBusqueda, setErrorBusqueda] = useState('');
    const [ubicando, setUbicando] = useState(false);

    // Crear el mapa una sola vez
    useEffect(() => {
        map.current = crearMapa(el.current);
        if (!soloLectura) {
            map.current.on('click', (e) => cambiar.current?.(redondear(e.latlng.lat), redondear(e.latlng.lng)));
        }
        // dentro de un modal el tamaño se conoce después de pintarse
        const t = setTimeout(() => map.current?.invalidateSize(), 150);
        return () => { clearTimeout(t); map.current?.remove(); map.current = null; marcador.current = null; capaZonas.current = null; };
    }, [soloLectura]);

    // Zonas
    useEffect(() => {
        if (!map.current) return;
        capaZonas.current?.remove();
        capaZonas.current = dibujarZonas(map.current, zonas, {
            onClick: soloLectura ? null : (_, e) => cambiar.current?.(redondear(e.latlng.lat), redondear(e.latlng.lng)),
        });
        if (!valor) encuadrar(map.current, capaZonas.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zonas, soloLectura]);

    // Marcador
    useEffect(() => {
        if (!map.current) return;
        if (!valor) { marcador.current?.remove(); marcador.current = null; return; }
        const pos = [valor.lat, valor.lng];
        if (!marcador.current) {
            marcador.current = L.marker(pos, { icon: pin(color), draggable: !soloLectura }).addTo(map.current);
            marcador.current.on('dragend', (e) => {
                const p = e.target.getLatLng();
                cambiar.current?.(redondear(p.lat), redondear(p.lng));
            });
            map.current.setView(pos, Math.max(map.current.getZoom(), 16));
        } else {
            marcador.current.setLatLng(pos);
            marcador.current.setIcon(pin(color));
        }
    }, [valor, color, soloLectura]);

    const buscar = async () => {
        if (texto.trim().length < 3) return;
        setBuscando(true); setErrorBusqueda('');
        try {
            const r = await buscarDireccion(texto.trim());
            setResultados(r);
            if (!r.length) setErrorBusqueda('No se encontró esa dirección. Marca el punto directamente en el mapa.');
        } catch {
            setErrorBusqueda('No se pudo buscar (¿sin internet?). Marca el punto directamente en el mapa.');
        }
        setBuscando(false);
    };

    const irA = (r) => {
        setResultados(null);
        map.current?.setView([r.lat, r.lng], 17);
        onChange?.(redondear(r.lat), redondear(r.lng));
    };

    const miUbicacion = () => {
        if (!navigator.geolocation) { setErrorBusqueda('Este navegador no da la ubicación.'); return; }
        setUbicando(true);
        navigator.geolocation.getCurrentPosition(
            (p) => { setUbicando(false); irA({ lat: p.coords.latitude, lng: p.coords.longitude }); },
            () => { setUbicando(false); setErrorBusqueda('No se pudo obtener tu ubicación (permiso denegado o sin HTTPS).'); },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="space-y-2">
            {!soloLectura && (
                <div className="relative">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <IoSearchOutline className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                value={texto}
                                onChange={(e) => { setTexto(e.target.value); setErrorBusqueda(''); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscar(); } }}
                                placeholder="Buscar calle o lugar (ej: Plaza Abaroa, La Paz)"
                                className={cx(inputCls, 'h-10 pl-9')}
                            />
                        </div>
                        <Button variant="secondary" onClick={buscar} loading={buscando} disabled={texto.trim().length < 3}>Buscar</Button>
                        <Button variant="secondary" icon={IoLocateOutline} onClick={miUbicacion} loading={ubicando} title="Usar mi ubicación">
                            <span className="hidden sm:inline">Mi ubicación</span>
                        </Button>
                    </div>
                    {resultados?.length > 0 && (
                        <ul className="absolute z-[1001] mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                            {resultados.map((r, i) => (
                                <li key={i}>
                                    <button type="button" onClick={() => irA(r)} className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-orange-50">{r.nombre}</button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {errorBusqueda && <p className="mt-1 text-xs text-amber-700">{errorBusqueda}</p>}
                </div>
            )}
            <div className={cx('relative overflow-hidden rounded-xl border border-gray-200', alto)}>
                <div ref={el} className="h-full w-full" />
                {!soloLectura && !valor && (
                    <div className="pointer-events-none absolute inset-x-0 top-2 z-[1000] flex justify-center">
                        <span className="rounded-full bg-gray-800/85 px-3 py-1 text-xs text-white">Haz clic en el mapa para marcar la casa del cliente</span>
                    </div>
                )}
                {buscando && <div className="absolute right-2 top-2 z-[1000] text-orange-500"><Spinner /></div>}
            </div>
        </div>
    );
};

export default UbicacionMapa;
