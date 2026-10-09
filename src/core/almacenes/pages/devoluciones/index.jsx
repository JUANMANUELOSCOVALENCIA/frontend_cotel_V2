// src/core/almacenes/pages/devoluciones/index.jsx
// Garantías con el proveedor:
//   Defectuoso → Enviar a garantía → respuesta del proveedor (cambio / reparado / sin reposición)
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoRefreshOutline } from 'react-icons/io5';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { PageHeader, Button, StatCard, cx } from '../../../../shared/components/ui';
import garantiasService from '../../services/garantiasService';
import PorEnviarTab from './PorEnviarTab';
import EnviosTab from './EnviosTab';
import EnvioModal from './EnvioModal';

const Garantias = () => {
    const { hasPermission } = usePermissions();
    const puedeEditar = hasPermission('materiales', 'actualizar');
    const [tab, setTab] = useState('por_enviar');
    const [resumen, setResumen] = useState(null);
    const [version, setVersion] = useState(0);
    const [abierto, setAbierto] = useState(null); // id del envío en el modal

    const cargarResumen = useCallback(async () => {
        const r = await garantiasService.resumen();
        if (r.success) setResumen(r.data);
        else toast.error(r.error);
    }, []);
    useEffect(() => { cargarResumen(); }, [cargarResumen]);

    const alCambiar = useCallback(() => { cargarResumen(); setVersion((v) => v + 1); }, [cargarResumen]);

    const tabs = [
        { id: 'por_enviar', label: 'Por enviar', n: resumen?.por_enviar },
        { id: 'abiertos', label: 'En garantía', n: resumen?.envios_abiertos },
        { id: 'cerrados', label: 'Historial' },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Garantías"
                subtitle="Equipos que laboratorio rechazó: envío al proveedor y su reposición"
                actions={<Button variant="secondary" icon={IoRefreshOutline} onClick={alCambiar}>Actualizar</Button>}
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Defectuosos por enviar" value={resumen?.por_enviar} tone={resumen?.por_enviar ? 'text-red-600' : 'text-gray-800'} />
                <StatCard label="Equipos en garantía" value={resumen?.en_garantia} tone="text-amber-600" />
                <StatCard label="Envíos abiertos" value={resumen?.envios_abiertos} />
                <StatCard label={`Más de ${resumen?.dias_alerta ?? 30} días sin respuesta`} value={resumen?.demorados} tone={resumen?.demorados ? 'text-red-600' : 'text-gray-800'} />
            </div>

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

            {tab === 'por_enviar' && (
                <PorEnviarTab key={version} puedeEditar={puedeEditar} onEnviado={(envio) => { alCambiar(); setTab('abiertos'); setAbierto(envio.id); }} />
            )}
            {tab === 'abiertos' && <EnviosTab key={`a${version}`} cerrado={false} diasAlerta={resumen?.dias_alerta ?? 30} onAbrir={setAbierto} />}
            {tab === 'cerrados' && <EnviosTab key={`c${version}`} cerrado diasAlerta={resumen?.dias_alerta ?? 30} onAbrir={setAbierto} />}

            <EnvioModal
                envioId={abierto}
                open={!!abierto}
                puedeEditar={puedeEditar}
                onClose={() => setAbierto(null)}
                onCambio={alCambiar}
            />
        </div>
    );
};

export default Garantias;
