// src/core/operaciones/components/opUi.jsx
// Etiquetas y colores de solicitudes y órdenes de trabajo.
import React from 'react';
import { Badge } from '../../../shared/components/ui';

export const TIPOS = [
    { codigo: 'INSTALACION', nombre: 'Instalación nueva', corto: 'Instalación', ayuda: 'Cliente nuevo o servicio nuevo en un domicilio' },
    { codigo: 'TRASLADO', nombre: 'Traslado', corto: 'Traslado', ayuda: 'El servicio se muda a otra dirección (marca la NUEVA)' },
    { codigo: 'REPARACION', nombre: 'Reparación / cambio de equipo', corto: 'Reparación', ayuda: 'Falla del servicio o equipo dañado' },
    { codigo: 'RETIRO', nombre: 'Retiro / baja', corto: 'Retiro', ayuda: 'Se retira el equipo del domicilio' },
];
// ['Internet', 'TV cable'] → 'Internet + TV cable'
export const serviciosTexto = (lista) => (lista?.length ? lista.join(' + ') : '');

export const TIPO_CORTO = Object.fromEntries(TIPOS.map((t) => [t.codigo, t.corto]));

const COLOR_SOLICITUD = { EN_CURSO: 'blue', SIN_COBERTURA: 'amber', ATENDIDA: 'green', ANULADA: 'gray' };
const COLOR_OT = {
    PENDIENTE: 'amber', PROGRAMADA: 'blue', EN_CAMPO: 'purple', EJECUTADA: 'orange',
    NO_EJECUTADA: 'red', VERIFICADA: 'green', CERRADA: 'gray', ANULADA: 'gray',
};

export const EstadoSolicitud = ({ estado }) => <Badge color={COLOR_SOLICITUD[estado?.codigo] || 'gray'}>{estado?.nombre}</Badge>;
export const EstadoOT = ({ estado }) => <Badge color={COLOR_OT[estado?.codigo] || 'gray'}>{estado?.nombre}</Badge>;
export const Prioridad = ({ valor }) => (valor === 'ALTA' ? <Badge color="red">Urgente</Badge> : null);

export const ZonaChip = ({ zona }) => (zona ? (
    <span className="inline-flex items-center gap-1.5 text-gray-700">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: zona.color }} />{zona.nombre}
    </span>
) : <span className="text-gray-400">Fuera de zona</span>);

// '2025-10-31' (solo fecha) se lee como fecha local, no como medianoche UTC (que en Bolivia es el día anterior)
const aFecha = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso));
export const fechaCorta = (iso) => (iso ? aFecha(iso).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—');
export const fechaHora = (iso) => (iso ? new Date(iso).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

// Fechas para la programación: 'YYYY-MM-DD' en hora local (Bolivia), no UTC
export const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const hoyISO = () => isoLocal(new Date());
export const sumarDias = (iso, n) => { const d = aFecha(iso); d.setDate(d.getDate() + n); return isoLocal(d); };
export const fechaLarga = (iso) => {
    if (!iso) return '—';
    const t = aFecha(iso).toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' });
    return t.charAt(0).toUpperCase() + t.slice(1);
};

// "Juan Pérez (jefe), Luis Mamani"
export const integrantesTexto = (lista) => (lista || []).map((i) => `${i.usuario.nombre}${i.es_jefe ? ' (jefe)' : ''}`).join(', ');

// Servicios que requiere una OT o que soporta una ONU: { tv, telefonia } (internet siempre)
export const ServiciosChips = ({ s }) => (
    <span className="inline-flex flex-wrap gap-1">
        <Badge color="blue">Internet</Badge>
        {s?.tv && <Badge color="purple">TV</Badge>}
        {s?.telefonia && <Badge color="amber">Telefonía</Badge>}
    </span>
);
export const serviciosOnuTexto = (s) => ['Internet', s?.tv && 'TV', s?.telefonia && 'Telefonía'].filter(Boolean).join(' + ');
export const onuSirve = (onu, sv) => (!sv?.tv || onu.tv) && (!sv?.telefonia || onu.telefonia);

// Plazo ATT (RAR 589/2025): instalación/traslado 7 días, reparación 24 h. Solo informa; no cambia estados.
const duracion = (seg) => {
    const s = Math.abs(seg);
    if (s >= 86400) return `${Math.floor(s / 86400)} día(s)`;
    if (s >= 3600) return `${Math.floor(s / 3600)} h`;
    return `${Math.max(1, Math.floor(s / 60))} min`;
};
const PLAZO = {
    EN_PLAZO: { color: 'green', texto: (p) => `Plazo ATT: quedan ${duracion(p.segundos)}` },
    POR_VENCER: { color: 'amber', texto: (p) => `Por vencer: quedan ${duracion(p.segundos)}` },
    VENCIDA: { color: 'red', texto: (p) => `Plazo ATT vencido hace ${duracion(p.segundos)}` },
    CUMPLIDO: { color: 'green', texto: () => 'Atendida en plazo ATT' },
    INCUMPLIDO: { color: 'red', texto: () => 'Atendida fuera de plazo ATT' },
};
export const PlazoChip = ({ plazo }) => {
    const c = plazo && PLAZO[plazo.estado];
    if (!c) return null;
    return <span title={`Límite ATT: ${fechaHora(plazo.limite)}`}><Badge color={c.color}>{c.texto(plazo)}</Badge></span>;
};
