import React, { useEffect, useRef, useState } from 'react';
import { Typography } from '@material-tailwind/react';
import { IoLocation, IoSearch } from 'react-icons/io5';

const MapaStep = ({ formData, onChange, errors }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [busqueda, setBusqueda] = useState('');
    const [buscando, setBuscando] = useState(false);
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    const DEFAULT_LAT = -16.5;
    const DEFAULT_LNG = -68.15;

    const handleChange = (field, value) => {
        onChange({ ...formData, [field]: value });
    };

    // Cargar Leaflet dinámicamente
    useEffect(() => {
        if (window.L) {
            setLeafletLoaded(true);
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setLeafletLoaded(true);
        document.head.appendChild(script);

        return () => {};
    }, []);

    // Inicializar mapa
    useEffect(() => {
        if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

        const L = window.L;
        const lat = formData.lat || DEFAULT_LAT;
        const lng = formData.lng || DEFAULT_LNG;

        const map = L.map(mapRef.current).setView([lat, lng], 14);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        // Marcador personalizado naranja
        const icon = L.divIcon({
            html: `<div style="
                background: #f97316;
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>`,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });

        if (formData.lat && formData.lng) {
            markerRef.current = L.marker([formData.lat, formData.lng], { icon }).addTo(map);
        }

        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
            }
            // Geocodificación inversa con Nominatim
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
                .then(r => r.json())
                .then(data => {
                    const direccion = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                    onChange(prev => ({
                        ...prev,
                        lat,
                        lng,
                        direccionMapa: direccion,
                    }));
                })
                .catch(() => {
                    onChange(prev => ({ ...prev, lat, lng }));
                });
        });

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            markerRef.current = null;
        };
    }, [leafletLoaded]);

    // Buscar dirección
    const buscarDireccion = async () => {
        if (!busqueda.trim()) return;
        setBuscando(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(busqueda + ', Bolivia')}&format=json&limit=1`
            );
            const data = await res.json();
            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const L = window.L;
                const map = mapInstanceRef.current;
                map.setView([lat, lon], 16);

                const icon = L.divIcon({
                    html: `<div style="
                        background: #f97316;
                        width: 32px;
                        height: 32px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    "></div>`,
                    className: '',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });

                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lon]);
                } else {
                    markerRef.current = L.marker([parseFloat(lat), parseFloat(lon)], { icon }).addTo(map);
                }
                onChange(prev => ({
                    ...prev,
                    lat: parseFloat(lat),
                    lng: parseFloat(lon),
                    direccionMapa: display_name,
                }));
            }
        } catch (e) {
            console.error('Error buscando dirección:', e);
        } finally {
            setBuscando(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-orange-100">
                    <IoLocation className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <Typography variant="h6" className="text-gray-800 font-bold">
                        Ubicación de Instalación
                    </Typography>
                    <Typography variant="small" className="text-gray-500">
                        Busca o haz clic en el mapa para marcar la dirección exacta
                    </Typography>
                </div>
            </div>

            {/* Buscador */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscarDireccion()}
                        placeholder="Buscar dirección, barrio, zona..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm outline-none focus:border-orange-500 transition-all"
                    />
                </div>
                <button
                    onClick={buscarDireccion}
                    disabled={buscando}
                    className="px-5 py-3 bg-orange-500 text-white rounded-xl font-medium text-sm hover:bg-orange-600 transition-all disabled:opacity-50"
                >
                    {buscando ? '...' : 'Buscar'}
                </button>
            </div>

            {/* Mapa */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md">
                {!leafletLoaded && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-gray-500 text-sm">Cargando mapa...</p>
                        </div>
                    </div>
                )}
                <div ref={mapRef} style={{ height: '380px', width: '100%' }} />
            </div>

            <p className="text-xs text-gray-400 text-center">
                💡 Haz clic directamente en el mapa para marcar la ubicación exacta
            </p>

            {/* Dirección textual */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Dirección de Instalación *
                </label>
                <input
                    type="text"
                    value={formData.direccion || ''}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    placeholder="Ej: Av. 6 de Agosto #123, El Prado"
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-all outline-none focus:border-orange-500 ${
                        errors?.direccion ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                />
                {errors?.direccion && (
                    <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>
                )}
            </div>

            {/* Referencia */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Referencia
                </label>
                <input
                    type="text"
                    value={formData.referencia || ''}
                    onChange={(e) => handleChange('referencia', e.target.value)}
                    placeholder="Ej: Frente al parque, casa azul"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm outline-none focus:border-orange-500 hover:border-gray-300 transition-all"
                />
            </div>

            {/* Coordenadas capturadas */}
            {formData.lat && formData.lng && (
                <div className="flex gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                    <IoLocation className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-semibold text-orange-700">Coordenadas capturadas</p>
                        <p className="text-xs text-orange-600">
                            Lat: {formData.lat?.toFixed(5)} | Lng: {formData.lng?.toFixed(5)}
                        </p>
                        {formData.direccionMapa && (
                            <p className="text-xs text-orange-500 mt-1 truncate max-w-md">{formData.direccionMapa}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapaStep;
