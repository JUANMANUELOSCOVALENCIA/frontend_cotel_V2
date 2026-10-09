// src/core/operaciones/pages/clientes/index.jsx
// Clientes de COTEL: datos, contratos (cobre y GPON) y situación de deuda.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoRefreshOutline, IoPeopleCircleOutline } from 'react-icons/io5';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import { PageHeader, Card, Button, StatCard, SearchInput, SelectInput, Badge, EmptyState, Spinner, Pager } from '../../../../shared/components/ui';
import { clientesService } from '../../services/operacionesService';
import { fechaCorta } from '../../components/opUi';
import ClienteModal, { Situacion, bs } from './ClienteModal';

const PAGE_SIZE = 25;
const TIPO = { INSTALACION: 'instalaciones', TRASLADO: 'traslados', REPARACION: 'reparaciones', RETIRO: 'retiros' };

const Clientes = () => {
    const { hasPermission } = usePermissions();
    const [resumen, setResumen] = useState(null);
    const [items, setItems] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [f, setF] = useState({ search: '', situacion: '', prueba: '' });
    const [loading, setLoading] = useState(true);
    const [abierto, setAbierto] = useState(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await clientesService.listar({ ...f, page, page_size: PAGE_SIZE });
        setLoading(false);
        if (r.success) { setItems(r.data.results || []); setCount(r.data.count || 0); } else toast.error(r.error);
    }, [f, page]);
    useEffect(() => { cargar(); }, [cargar]);
    const cargarResumen = useCallback(() => { clientesService.resumen().then((r) => r.success && setResumen(r.data)); }, []);
    useEffect(() => { cargarResumen(); }, [cargarResumen]);

    const setFiltro = (k) => (v) => { setPage(1); setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v })); };
    const tipos = (resumen?.tipos_bloqueados || []).map((t) => TIPO[t] || t).join(' y ');

    return (
        <div className="space-y-6">
            <PageHeader
                title="Clientes"
                subtitle={resumen
                    ? `Un contrato con ${resumen.facturas_bloqueo} o más facturas impagas bloquea ${tipos}. La deuda se revisa sola al buscar el CI en una solicitud.`
                    : 'Clientes, contratos y deuda'}
                actions={<Button variant="secondary" icon={IoRefreshOutline} onClick={() => { cargar(); cargarResumen(); }} disabled={loading}>Actualizar</Button>}
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Clientes" value={resumen?.clientes?.toLocaleString('es-BO')} />
                <StatCard label="Con deuda" value={resumen?.con_deuda?.toLocaleString('es-BO')} tone="text-amber-600" />
                <StatCard label="Bloqueados" value={resumen?.bloqueados?.toLocaleString('es-BO')} tone="text-red-600" />
                <StatCard label={resumen?.fecha_corte ? `Deuda total al ${fechaCorta(resumen.fecha_corte)}` : 'Deuda total'} value={resumen ? bs(resumen.monto_total) : null} />
            </div>

            <Card className="flex flex-col gap-3 p-4 lg:flex-row">
                <SearchInput className="lg:flex-1" value={f.search} onChange={setFiltro('search')} delay={400} placeholder="CI, nombre o teléfono" />
                <SelectInput className="lg:w-52" value={f.situacion} onChange={setFiltro('situacion')}>
                    <option value="">Todas las situaciones</option>
                    <option value="al_dia">Al día</option>
                    <option value="deuda">Con deuda</option>
                    <option value="bloqueado">Bloqueados por deuda</option>
                </SelectInput>
                <SelectInput className="lg:w-52" value={f.prueba} onChange={setFiltro('prueba')}>
                    <option value="">Todos los datos</option>
                    <option value="false">Solo datos reales</option>
                    <option value="true">Solo datos de prueba</option>
                </SelectInput>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Cliente</th>
                                <th className="px-4 py-3 font-semibold">Contacto</th>
                                <th className="px-4 py-3 text-center font-semibold">Contratos</th>
                                <th className="px-4 py-3 text-right font-semibold">Deuda</th>
                                <th className="px-4 py-3 font-semibold">Situación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !items.length && <tr><td colSpan={5} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>}
                            {!loading && !items.length && <tr><td colSpan={5}><EmptyState icon={IoPeopleCircleOutline} title="Ningún cliente coincide" /></td></tr>}
                            {items.map((c) => (
                                <tr key={c.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setAbierto(c.id)}>
                                    <td className="px-4 py-3">
                                        <p className="text-gray-800">{c.nombre}{c.prueba && <Badge color="purple" className="ml-2">Prueba</Badge>}</p>
                                        <p className="font-mono text-xs text-gray-500">CI {c.ci}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-gray-700">{c.telefono || '—'}</p>
                                        <p className="text-xs text-gray-500">{[c.zona, c.ciudad].filter(Boolean).join(', ')}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-700">{c.contratos}</td>
                                    <td className="px-4 py-3 text-right">
                                        {c.facturas > 0 ? (
                                            <>
                                                <p className="font-medium text-gray-800">{bs(c.monto)}</p>
                                                <p className="text-xs text-gray-500">{c.facturas} factura(s)</p>
                                            </>
                                        ) : <span className="text-gray-400">—</span>}
                                    </td>
                                    <td className="px-4 py-3"><Situacion valor={c.situacion} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pager page={page} pageSize={PAGE_SIZE} count={count} onChange={setPage} />
            </Card>

            <ClienteModal
                id={abierto}
                puedeEditar={hasPermission('clientes', 'actualizar')}
                onClose={() => setAbierto(null)}
                onCambio={() => { cargar(); cargarResumen(); }}
            />
        </div>
    );
};

export default Clientes;
