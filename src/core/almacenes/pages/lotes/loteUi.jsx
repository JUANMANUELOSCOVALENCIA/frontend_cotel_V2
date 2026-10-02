// src/core/almacenes/pages/lotes/loteUi.jsx
// Piezas visuales compartidas de lotes.
import React from 'react';
import { Badge, cx } from '../../../../shared/components/ui';

export const COLOR_ESTADO = {
    REGISTRADO: 'gray',
    ACTIVO: 'blue',
    RECEPCION_PARCIAL: 'amber',
    RECEPCION_COMPLETA: 'green',
    CERRADO: 'purple',
};

export const EstadoLoteBadge = ({ estado }) => (
    <Badge color={COLOR_ESTADO[estado?.codigo] || 'gray'}>{estado?.nombre || 'Sin estado'}</Badge>
);

// Fecha de hoy en hora local (toISOString usa UTC y en Bolivia adelanta un día por la noche)
export const hoyLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// Nombre del tipo de lote: 'NUEVO' se muestra como Compra
export const tipoLote = (t) => (!t ? '—' : t.codigo === 'NUEVO' ? 'Compra' : t.nombre);

export const fecha = (f) => (f ? new Date(`${String(f).slice(0, 10)}T00:00`).toLocaleDateString('es-BO') : '—');

const num = (n) => {
    const x = Number(n) || 0;
    return Number.isInteger(x) ? x.toLocaleString('es-BO') : x.toLocaleString('es-BO', { maximumFractionDigits: 2 });
};

export const Progreso = ({ recibido, total, compacto }) => {
    const pct = total > 0 ? Math.min(100, (Number(recibido) / Number(total)) * 100) : 0;
    const completo = total > 0 && Number(recibido) >= Number(total);
    return (
        <div className={compacto ? 'w-32' : ''}>
            <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-gray-700">{num(recibido)} / {num(total)}</span>
                <span className="text-gray-500">{Math.floor(pct)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className={cx('h-full rounded-full', completo ? 'bg-green-500' : 'bg-orange-500')} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};
