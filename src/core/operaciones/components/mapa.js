// src/core/operaciones/components/mapa.js
// Utilidades de mapa (Leaflet + OpenStreetMap) para cobertura y solicitudes.
// Las zonas viajan como geometría GeoJSON: cada punto es [longitud, latitud].
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const CENTRO_LA_PAZ = [-16.5, -68.15];

export const crearMapa = (el, { centro = CENTRO_LA_PAZ, zoom = 13 } = {}) => {
    const map = L.map(el, { zoomControl: true, attributionControl: true }).setView(centro, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
    }).addTo(map);
    return map;
};

// Marcador plano (sin imágenes, así no depende de los íconos de Leaflet)
export const pin = (color = '#F97316') => L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);transform:rotate(-45deg)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
});

export const estiloZona = (z, resaltada = false) => ({
    color: z.color || '#F97316',
    weight: resaltada ? 3 : 2,
    opacity: z.activo === false ? 0.5 : 0.9,
    fillColor: z.color || '#F97316',
    fillOpacity: z.activo === false ? 0.05 : resaltada ? 0.3 : 0.15,
    dashArray: z.activo === false ? '6 6' : null,
});

/** Dibuja las zonas y devuelve el grupo (para limpiarlo o encuadrarlo). */
export const dibujarZonas = (map, zonas, { onClick, tooltip = true } = {}) => {
    const grupo = L.featureGroup();
    zonas.forEach((z) => {
        const capa = L.geoJSON(z.geometria, { style: estiloZona(z) });
        if (tooltip) capa.bindTooltip(`${z.nombre}${z.activo === false ? ' (inactiva)' : ''}`, { sticky: true });
        if (onClick) capa.on('click', (e) => { L.DomEvent.stopPropagation(e); onClick(z, e); });
        capa.zonaId = z.id;
        capa.addTo(grupo);
    });
    grupo.addTo(map);
    return grupo;
};

export const encuadrar = (map, grupo, padding = 30) => {
    const b = grupo?.getBounds?.();
    if (b && b.isValid()) map.fitBounds(b, { padding: [padding, padding], maxZoom: 16 });
};

// ---- Punto dentro de polígono (igual que el backend) ----
const enAnillo = (lng, lat, anillo) => {
    let dentro = false;
    for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
        const [xi, yi] = anillo[i];
        const [xj, yj] = anillo[j];
        if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
    }
    return dentro;
};
const enPoligono = (lng, lat, p) => p?.length && enAnillo(lng, lat, p[0]) && !p.slice(1).some((h) => enAnillo(lng, lat, h));

export const zonaDe = (zonas, lat, lng) => {
    if (lat == null || lng == null) return null;
    return [...zonas]
        .filter((z) => z.activo !== false)
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .find((z) => {
            const g = z.geometria;
            if (g?.type === 'Polygon') return enPoligono(lng, lat, g.coordinates);
            if (g?.type === 'MultiPolygon') return g.coordinates.some((p) => enPoligono(lng, lat, p));
            return false;
        }) || null;
};

// Búsqueda de direcciones en OpenStreetMap (Nominatim), limitada a Bolivia
export const buscarDireccion = async (texto) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=bo&accept-language=es&q=${encodeURIComponent(texto)}`;
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error('No se pudo buscar la dirección');
    const data = await r.json();
    return data.map((d) => ({ nombre: d.display_name, lat: Number(d.lat), lng: Number(d.lon) }));
};

// Calle y barrio de un punto (OpenStreetMap / Nominatim). En La Paz casi nunca trae el número de casa.
export const direccionDe = async (lat, lng, signal) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=es&lat=${lat}&lon=${lng}`;
    const r = await fetch(url, { headers: { Accept: 'application/json' }, signal });
    if (!r.ok) throw new Error('No se pudo obtener la dirección');
    const a = (await r.json()).address || {};
    const calle = a.road || a.pedestrian || a.footway || a.residential || a.path || '';
    const direccion = [calle, a.house_number && `Nº ${a.house_number}`].filter(Boolean).join(' ');
    const zona = a.neighbourhood || a.suburb || a.quarter || a.city_district || a.hamlet || '';
    return { direccion, zona, ciudad: a.city || a.town || a.village || '' };
};

export const redondear = (n) => Math.round(Number(n) * 1e6) / 1e6;
export { L };
