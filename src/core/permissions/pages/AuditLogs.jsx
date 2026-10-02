// src/core/permissions/pages/AuditLogs.jsx
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    IoSearchOutline,
    IoRefreshOutline,
    IoDownloadOutline,
    IoCloseCircleOutline,
    IoChevronDown,
    IoReceiptOutline,
} from 'react-icons/io5';
import permissionService from '../services/permissionService';
import { useUser } from '../../auth/hooks/useAuth';
import {
    PageHeader, Card, Button, Badge, StatCard, Field, TextInput, SelectInput, Pager, EmptyState, Spinner, cx,
} from '../../../shared/components/ui';

const PAGE_SIZE = 20;

// Acciones del backend (AuditLog.AccionChoices) con su color
const ACCIONES = {
    CREATE: { label: 'Crear', color: 'green' },
    UPDATE: { label: 'Actualizar', color: 'blue' },
    DELETE: { label: 'Eliminar', color: 'red' },
    RESTORE: { label: 'Restaurar', color: 'green' },
    LOGIN: { label: 'Iniciar sesión', color: 'gray' },
    LOGOUT: { label: 'Cerrar sesión', color: 'gray' },
    RESET_PASSWORD: { label: 'Resetear contraseña', color: 'amber' },
    CHANGE_PASSWORD: { label: 'Cambiar contraseña', color: 'amber' },
    MIGRATE_USER: { label: 'Migrar usuario', color: 'purple' },
    ACTIVATE_USER: { label: 'Activar usuario', color: 'green' },
    DEACTIVATE_USER: { label: 'Desactivar usuario', color: 'red' },
    ASSIGN_ROLE: { label: 'Asignar rol', color: 'purple' },
    REVOKE_ROLE: { label: 'Revocar rol', color: 'purple' },
    APPROVE: { label: 'Aprobar', color: 'green' },
    REJECT: { label: 'Rechazar', color: 'red' },
    TRANSFER: { label: 'Transferir', color: 'orange' },
    CUSTOM: { label: 'Personalizada', color: 'gray' },
};

const EMPTY_FILTERS = { codigocotel: '', accion: '', fecha_desde: '', fecha_hasta: '' };

const accionLabel = (log) =>
    log.accion === 'CUSTOM' && log.accion_personalizada
        ? log.accion_personalizada
        : log.accion_display || ACCIONES[log.accion]?.label || log.accion;

const AuditLogs = () => {
    const { fullName, user } = useUser();

    const [logs, setLogs] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [stats, setStats] = useState(null);
    const [expanded, setExpanded] = useState(null);

    // Filtros del formulario vs. filtros aplicados
    const [form, setForm] = useState(EMPTY_FILTERS);
    const [filters, setFilters] = useState(EMPTY_FILTERS);

    const loadLogs = useCallback(async () => {
        setLoading(true);
        const result = await permissionService.getLogs({ ...filters, page, page_size: PAGE_SIZE });
        if (result.success) {
            setLogs(result.data.results || result.data || []);
            setCount(result.data.count ?? (result.data.results || result.data || []).length);
        } else {
            toast.error(result.error || 'Error al cargar los logs');
            setLogs([]);
            setCount(0);
        }
        setLoading(false);
    }, [filters, page]);

    const loadStats = useCallback(async () => {
        const result = await permissionService.getLogStatistics(filters);
        if (result.success) setStats(result.data);
    }, [filters]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const applyFilters = (e) => {
        e?.preventDefault();
        if (form.codigocotel && !/^\d+$/.test(form.codigocotel)) {
            toast.error('El código COTEL debe ser un número');
            return;
        }
        if (form.fecha_desde && form.fecha_hasta && form.fecha_desde > form.fecha_hasta) {
            toast.error('La fecha "desde" no puede ser mayor que "hasta"');
            return;
        }
        setPage(1);
        setFilters({ ...form });
    };

    const clearFilters = () => {
        setForm(EMPTY_FILTERS);
        setFilters(EMPTY_FILTERS);
        setPage(1);
    };

    const hasFilters = Object.values(filters).some(Boolean);

    // ========== EXPORTAR A PDF ==========
    const exportPDF = async () => {
        setExporting(true);
        const result = await permissionService.exportLogs(filters);
        setExporting(false);

        if (!result.success) {
            toast.error(result.error || 'No se pudo exportar');
            return;
        }
        const rows = result.data.results || [];
        if (rows.length === 0) {
            toast.error('No hay registros para exportar con estos filtros');
            return;
        }

        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const now = new Date();

        // Encabezado
        doc.setFillColor(249, 115, 22);
        doc.rect(0, 0, pageWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(31, 41, 55);
        doc.text('COTEL R.L. - Reporte de Auditoría', 40, 40);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        const filtroTxt = [
            filters.codigocotel && `Código COTEL: ${filters.codigocotel}`,
            filters.accion && `Acción: ${ACCIONES[filters.accion]?.label || filters.accion}`,
            filters.fecha_desde && `Desde: ${filters.fecha_desde}`,
            filters.fecha_hasta && `Hasta: ${filters.fecha_hasta}`,
        ].filter(Boolean).join('   |   ') || 'Sin filtros';
        doc.text(`Filtros: ${filtroTxt}`, 40, 58);
        doc.text(
            `Generado: ${now.toLocaleString('es-BO')}   |   Por: ${fullName} (${user?.codigocotel})   |   Registros: ${rows.length}`,
            40,
            72
        );

        autoTable(doc, {
            startY: 86,
            head: [['Fecha y hora', 'Código', 'Usuario', 'Acción', 'Módulo', 'Objeto', 'IP']],
            body: rows.map((l) => [
                l.fecha_hora_formateada,
                l.usuario_codigo ?? '',
                l.usuario_nombre || '',
                accionLabel(l),
                `${l.app_label}.${l.model_name}`,
                l.objeto_representacion || '',
                l.ip_address || '',
            ]),
            styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
            headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            columnStyles: {
                0: { cellWidth: 95 },
                1: { cellWidth: 50 },
                2: { cellWidth: 140 },
                3: { cellWidth: 100 },
                4: { cellWidth: 100 },
                6: { cellWidth: 80 },
            },
            margin: { left: 40, right: 40 },
            didDrawPage: () => {
                const h = doc.internal.pageSize.getHeight();
                doc.setFontSize(8);
                doc.setTextColor(156, 163, 175);
                doc.text(`Página ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 80, h - 20);
            },
        });

        doc.save(`auditoria_${now.toISOString().slice(0, 10)}.pdf`);
        toast.success(`PDF generado con ${rows.length} registros`);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Auditoría"
                subtitle="Registro de acciones realizadas en el sistema"
                actions={
                    <>
                        <Button variant="secondary" icon={IoRefreshOutline} onClick={() => { loadLogs(); loadStats(); }} disabled={loading}>Actualizar</Button>
                        <Button icon={IoDownloadOutline} onClick={exportPDF} loading={exporting} disabled={count === 0}>Exportar PDF</Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label={hasFilters ? 'Registros (filtrados)' : 'Total de registros'} value={stats?.total_logs} />
                <StatCard label="Últimas 24 horas" value={stats?.logs_24h} tone="text-orange-600" />
                <StatCard label="Tipos de acción" value={stats ? Object.keys(stats.por_accion || {}).length : null} />
            </div>

            <Card className="p-4">
                <form onSubmit={applyFilters} className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 lg:grid-cols-5">
                    <Field label="Código COTEL">
                        <TextInput
                            inputMode="numeric"
                            placeholder="Ej: 9999"
                            value={form.codigocotel}
                            onChange={(e) => setForm({ ...form, codigocotel: e.target.value.trim() })}
                        />
                    </Field>
                    <Field label="Acción">
                        <SelectInput value={form.accion} onChange={(e) => setForm({ ...form, accion: e.target.value })}>
                            <option value="">Todas</option>
                            {Object.entries(ACCIONES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </SelectInput>
                    </Field>
                    <Field label="Desde">
                        <TextInput type="date" value={form.fecha_desde} onChange={(e) => setForm({ ...form, fecha_desde: e.target.value })} />
                    </Field>
                    <Field label="Hasta">
                        <TextInput type="date" value={form.fecha_hasta} onChange={(e) => setForm({ ...form, fecha_hasta: e.target.value })} />
                    </Field>
                    <div className="flex gap-2">
                        <Button type="submit" variant="dark" icon={IoSearchOutline} className="flex-1">Buscar</Button>
                        {hasFilters && (
                            <Button type="button" variant="secondary" icon={IoCloseCircleOutline} onClick={clearFilters} title="Limpiar filtros" />
                        )}
                    </div>
                </form>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Fecha y hora</th>
                                <th className="px-4 py-3 font-semibold">Usuario</th>
                                <th className="px-4 py-3 font-semibold">Acción</th>
                                <th className="px-4 py-3 font-semibold">Módulo</th>
                                <th className="px-4 py-3 font-semibold">Objeto</th>
                                <th className="px-4 py-3 font-semibold">IP</th>
                                <th className="w-10 px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && logs.length === 0 && (
                                <tr><td colSpan={7} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>
                            )}
                            {!loading && logs.length === 0 && (
                                <tr><td colSpan={7}><EmptyState icon={IoReceiptOutline} title="No se encontraron registros" /></td></tr>
                            )}
                            {logs.map((log) => {
                                const isOpen = expanded === log.id;
                                const hasDetails = log.detalles && Object.keys(log.detalles).length > 0;
                                return (
                                    <React.Fragment key={log.id}>
                                        <tr
                                            onClick={() => setExpanded(isOpen ? null : log.id)}
                                            className={cx('cursor-pointer transition-colors hover:bg-gray-50', isOpen && 'bg-orange-50/40')}
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">{log.fecha_hora_formateada}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800">{log.usuario_nombre}</p>
                                                <p className="whitespace-nowrap text-xs text-gray-500">Cód. COTEL {log.usuario_codigo}</p>
                                            </td>
                                            <td className="px-4 py-3"><Badge color={ACCIONES[log.accion]?.color || 'gray'}>{accionLabel(log)}</Badge></td>
                                            <td className="px-4 py-3 text-xs text-gray-600">{log.app_label}.{log.model_name}</td>
                                            <td className="max-w-[260px] truncate px-4 py-3 text-gray-700" title={log.objeto_representacion}>{log.objeto_representacion}</td>
                                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">{log.ip_address || '—'}</td>
                                            <td className="px-4 py-3 text-gray-400">
                                                <IoChevronDown className={cx('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                                            </td>
                                        </tr>
                                        {isOpen && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={7} className="px-4 py-4">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div>
                                                            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Detalles</p>
                                                            {hasDetails ? (
                                                                <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 rounded-lg border border-gray-200 bg-white p-3 text-xs">
                                                                    {Object.entries(log.detalles).map(([k, v]) => (
                                                                        <React.Fragment key={k}>
                                                                            <dt className="text-gray-500">{k.replace(/_/g, ' ')}</dt>
                                                                            <dd className="break-all text-gray-800">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd>
                                                                        </React.Fragment>
                                                                    ))}
                                                                </dl>
                                                            ) : (
                                                                <p className="text-sm text-gray-400">Sin detalles</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Navegador</p>
                                                            <p className="break-all text-xs text-gray-600">{log.user_agent || '—'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <Pager page={page} pageSize={PAGE_SIZE} count={count} onChange={setPage} />
            </Card>
        </div>
    );
};

export default AuditLogs;
