// src/core/almacenes/pages/traspasos/traspasoUi.jsx
import React from 'react';
import { Badge } from '../../../../shared/components/ui';

const COLOR = { EN_TRANSITO: 'amber', RECIBIDO: 'green', CANCELADO: 'gray', PENDIENTE: 'blue' };

export const EstadoTraspaso = ({ t }) => (
    <span className="inline-flex flex-wrap gap-1">
        <Badge color={COLOR[t.estado?.codigo] || 'gray'}>{t.estado?.nombre}</Badge>
        {t.faltantes > 0 && <Badge color="red">{t.faltantes} faltante(s)</Badge>}
    </span>
);
