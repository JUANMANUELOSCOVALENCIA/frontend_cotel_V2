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
