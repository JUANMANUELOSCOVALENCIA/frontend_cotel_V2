// src/core/almacenes/pages/equipos/inventarioUi.jsx
// Piezas visuales compartidas del inventario (equipos y materiales).
import React from 'react';
import { Badge } from '../../../../shared/components/ui';

export const COLOR_ESTADO_MATERIAL = {
    NUEVO: 'blue',
    EN_LABORATORIO: 'purple',
    DISPONIBLE: 'green',
    RESERVADO: 'amber',
    DEFECTUOSO: 'red',
    DEVUELTO_SECTOR_SOLICITANTE: 'gray',
    DEVUELTO_PROVEEDOR: 'gray',
    REINGRESADO: 'orange',
    REEMPLAZADO: 'gray',
    CONSUMIDO: 'gray',
};

export const EstadoMaterialBadge = ({ estado }) => (
    <Badge color={COLOR_ESTADO_MATERIAL[estado?.codigo] || 'gray'}>{estado?.nombre || 'Sin estado'}</Badge>
);

export const fechaHora = (f) => (f ? new Date(f).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' }) : '—');

export const cantidad = (n, unidad) => `${(Number(n) || 0).toLocaleString('es-BO', { maximumFractionDigits: 2 })}${unidad ? ` ${unidad}` : ''}`;
