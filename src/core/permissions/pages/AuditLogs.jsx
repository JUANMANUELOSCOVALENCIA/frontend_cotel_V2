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
    IoTimeOutline,
    IoFilterOutline,
} from 'react-icons/io5';
import permissionService from '../services/permissionService';
import Pagination from '../../../shared/components/Pagination';
import { useUser } from '../../auth/hooks/useAuth';

const PAGE_SIZE = 20;

// Acciones del backend (AuditLog.AccionChoices) con su color
const ACCIONES = {
    CREATE: { label: 'Crear', cls: 'bg-green-100 text-green-700' },
    UPDATE: { label: 'Actualizar', cls: 'bg-blue-100 text-blue-700' },
    DELETE: { label: 'Eliminar', cls: 'bg-red-100 text-red-700' },
    RESTORE: { label: 'Restaurar', cls: 'bg-teal-100 text-teal-700' },
    LOGIN: { label: 'Iniciar sesión', cls: 'bg-gray-100 text-gray-700' },
    LOGOUT: { label: 'Cerrar sesión', cls: 'bg-gray-100 text-gray-500' },
    RESET_PASSWORD: { label: 'Resetear contraseña', cls: 'bg-amber-100 text-amber-700' },
    CHANGE_PASSWORD: { label: 'Cambiar contraseña', cls: 'bg-amber-100 text-amber-700' },
    MIGRATE_USER: { label: 'Migrar usuario', cls: 'bg-indigo-100 text-indigo-700' },
    ACTIVATE_USER: { label: 'Activar usuario', cls: 'bg-green-100 text-green-700' },
    DEACTIVATE_USER: { label: 'Desactivar usuario', cls: 'bg-red-100 text-red-700' },
    ASSIGN_ROLE: { label: 'Asignar rol', cls: 'bg-purple-100 text-purple-700' },
    REVOKE_ROLE: { label: 'Revocar rol', cls: 'bg-purple-100 text-purple-700' },
    APPROVE: { label: 'Aprobar', cls: 'bg-green-100 text-green-700' },
    REJECT: { label: 'Rechazar', cls: 'bg-red-100 text-red-700' },
    TRANSFER: { label: 'Transferir', cls: 'bg-orange-100 text-orange-700' },
    CUSTOM: { label: 'Personalizada', cls: 'bg-gray-100 text-gray-700' },
};

const EMPTY_FILTERS = { codigocotel: '', accion: '', fecha_desde: '', fecha_hasta: '' };

const accionLabel = (log) =>
    log.accion === 'CUSTOM' && log.accion_personalizada
        ? log.accion_personalizada
        : log.accion_display || ACCIONES[log.accion]?.label || log.accion;

const StatCard = ({ icon: Icon, label, value, accent }) => (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent}`}>
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
        </div>
    </div>
);

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

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
    const inputCls =
        'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20';

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Logs de auditoría</h2>
                    <p className="text-sm text-gray-500">Registro de acciones realizadas en el sistema</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { loadLogs(); loadStats(); }}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <IoRefreshOutline className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                    <button
                        onClick={exportPDF}
                        disabled={exporting || count === 0}
                        className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <IoDownloadOutline className="h-4 w-4" />
                        {exporting ? 'Generando...' : 'Exportar PDF'}
                    </button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard icon={IoReceiptOutline} label={hasFilters ? 'Logs (filtrados)' : 'Total de logs'} value={stats?.total_logs} accent="bg-orange-100 text-orange-600" />
                <StatCard icon={IoTimeOutline} label="Últimas 24 horas" value={stats?.logs_24h} accent="bg-blue-100 text-blue-600" />
                <StatCard icon={IoFilterOutline} label="Tipos de acción" value={stats ? Object.keys(stats.por_accion || {}).length : null} accent="bg-gray-100 text-gray-600" />
            </div>

            {/* Filtros */}
            <form onSubmit={applyFilters} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Código COTEL</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Ej: 9999"
                            value={form.codigocotel}
                            onChange={(e) => setForm({ ...form, codigocotel: e.target.value.trim() })}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Acción</label>
                        <select
                            value={form.accion}
                            onChange={(e) => setForm({ ...form, accion: e.target.value })}
                            className={inputCls}
                        >
                            <option value="">Todas</option>
                            {Object.entries(ACCIONES).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Desde</label>
                        <input type="date" value={form.fecha_desde} onChange={(e) => setForm({ ...form, fecha_desde: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Hasta</label>
                        <input type="date" value={form.fecha_hasta} onChange={(e) => setForm({ ...form, fecha_hasta: e.target.value })} className={inputCls} />
                    </div>
                    <div className="flex items-end gap-2">
                        <button
                            type="submit"
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
                        >
                            <IoSearchOutline className="h-4 w-4" /> Buscar
                        </button>
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                title="Limpiar filtros"
                                className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
                            >
                                <IoCloseCircleOutline className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {/* Tabla */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Cargando...</td></tr>
                            )}
                            {!loading && logs.length === 0 && (
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No se encontraron registros</td></tr>
                            )}
                            {logs.map((log) => {
                                const isOpen = expanded === log.id;
                                const hasDetails = log.detalles && Object.keys(log.detalles).length > 0;
                                return (
                                    <React.Fragment key={log.id}>
                                        <tr
                                            onClick={() => setExpanded(isOpen ? null : log.id)}
                                            className={`cursor-pointer transition-colors hover:bg-orange-50/50 ${isOpen ? 'bg-orange-50/50' : ''}`}
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">{log.fecha_hora_formateada}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800">{log.usuario_nombre}</p>
                                                <p className="text-xs text-gray-500">Cód. {log.usuario_codigo}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${ACCIONES[log.accion]?.cls || 'bg-gray-100 text-gray-700'}`}>
                                                    {accionLabel(log)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600">{log.app_label}.{log.model_name}</td>
                                            <td className="max-w-[260px] truncate px-4 py-3 text-gray-700" title={log.objeto_representacion}>{log.objeto_representacion}</td>
                                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">{log.ip_address || '—'}</td>
                                            <td className="px-4 py-3 text-gray-400">
                                                <IoChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                            </td>
                                        </tr>
                                        {isOpen && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={7} className="px-4 py-4">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div>
                                                            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Detalles</p>
                                                            {hasDetails ? (
                                                                <pre className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
                                                                    {JSON.stringify(log.detalles, null, 2)}
                                                                </pre>
                                                            ) : (
                                                                <p className="text-sm text-gray-400">Sin detalles</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Navegador</p>
                                                            <p className="break-all text-xs text-gray-600">{log.user_agent || '—'}</p>
                                                            <p className="mb-1 mt-3 text-xs font-semibold uppercase text-gray-500">ID del objeto</p>
                                                            <p className="text-xs text-gray-600">{log.object_id}</p>
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

                {count > PAGE_SIZE && (
                    <div className="border-t border-gray-200 px-4 py-3">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            showInfo
                            totalItems={count}
                            itemsPerPage={PAGE_SIZE}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
