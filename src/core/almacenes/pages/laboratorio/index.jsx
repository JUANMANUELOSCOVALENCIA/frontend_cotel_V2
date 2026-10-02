// src/core/almacenes/pages/laboratorio/index.jsx
// Laboratorio: control de calidad de equipos ONU.
//   Por enviar → En laboratorio → (inspección) → Disponible / Defectuoso
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoRefreshOutline } from 'react-icons/io5';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { PageHeader, Button, StatCard, cx } from '../../../../shared/components/ui';
import laboratorioService from '../../services/laboratorioService';
import PorEnviarTab from './PorEnviarTab';
import EnLaboratorioTab from './EnLaboratorioTab';
import HistorialTab from './HistorialTab';

const Laboratorio = () => {
    const { hasPermission } = usePermissions();
    const puedeEditar = hasPermission('laboratorio', 'actualizar');
    const [tab, setTab] = useState('en_laboratorio');
    const [resumen, setResumen] = useState(null);
    const [version, setVersion] = useState(0); // fuerza recarga de la pestaña activa

    const cargarResumen = useCallback(async () => {
        const r = await laboratorioService.resumen();
        if (r.success) setResumen(r.data);
        else toast.error(r.error);
    }, []);
    useEffect(() => { cargarResumen(); }, [cargarResumen]);

    // Tras enviar o inspeccionar: refrescar contadores y la pestaña
    const alCambiar = useCallback(() => { cargarResumen(); setVersion((v) => v + 1); }, [cargarResumen]);

    const r = resumen?.resumen;
    const u = resumen?.ultimos_30_dias;
    const tabs = [
        { id: 'por_enviar', label: 'Por enviar', n: r?.por_enviar },
        { id: 'en_laboratorio', label: 'En laboratorio', n: r?.en_laboratorio },
        { id: 'historial', label: 'Historial' },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Laboratorio"
                subtitle="Control de calidad de los equipos ONU antes de quedar disponibles"
                actions={<Button variant="secondary" icon={IoRefreshOutline} onClick={alCambiar}>Actualizar</Button>}
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Por enviar" value={r?.por_enviar} tone={r?.por_enviar ? 'text-blue-600' : 'text-gray-800'} />
                <StatCard label="En laboratorio" value={r?.en_laboratorio} tone="text-purple-600" />
                <StatCard label={`Más de ${resumen?.dias_limite ?? 15} días`} value={r?.demorados} tone={r?.demorados ? 'text-red-600' : 'text-gray-800'} />
                <StatCard
                    label="Aprobación (30 días)"
                    value={u ? (u.porcentaje_aprobacion == null ? '—' : `${u.porcentaje_aprobacion}%`) : null}
                    tone="text-green-600"
                />
            </div>
            {u?.total > 0 && (
                <p className="-mt-3 text-xs text-gray-500">
                    Últimos 30 días: {u.total} inspecciones · {u.aprobados} aprobadas · {u.rechazados} rechazadas
                    {u.dias_promedio != null && (u.dias_promedio < 1 ? ' · menos de 1 día promedio en laboratorio' : ` · ${u.dias_promedio} días promedio en laboratorio`)}
                </p>
            )}

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={cx(
                                'flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium',
                                tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            )}
                        >
                            {t.label}
                            {t.n > 0 && <span className={cx('rounded-full px-2 text-xs', tab === t.id ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600')}>{t.n}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            {tab === 'por_enviar' && <PorEnviarTab key={version} puedeEditar={puedeEditar} onCambio={alCambiar} />}
            {tab === 'en_laboratorio' && (
                <EnLaboratorioTab key={version} puedeEditar={puedeEditar} diasLimite={resumen?.dias_limite ?? 15} onCambio={alCambiar} />
            )}
            {tab === 'historial' && <HistorialTab key={version} />}
        </div>
    );
};

export default Laboratorio;
