// src/core/permissions/pages/EmployeeMigration/index.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Alert, Button } from '@material-tailwind/react';
import { IoPersonAdd, IoRefresh } from 'react-icons/io5';

// Hooks
import permissionService from '../../services/permissionService';
import { useRolesCRUD } from '../../hooks/usePermissions';
import { useMigrationFilters, useMigrationActions, useMigrationStats } from './migrationHooks';

// Componentes
import Permission from '../../components/Permission';
import Loader from '../../../layout/Loader';
import MigrationComponents from './migrationComponents';
import MigrationDialogs from './migrationDialogs.jsx';

const EmployeeMigration = () => {
    // ========== ESTADOS PRINCIPALES ==========
    const [employees, setEmployees] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});

    // Estados de diálogos
    const [dialogs, setDialogs] = useState({
        migrateSingle: false,
        migrateBulk: false,
    });

    // ========== HOOKS DE DATOS ==========
    const {
        roles,
        loading: rolesLoading,
        loadRoles,
    } = useRolesCRUD();

    // ========== HOOKS PERSONALIZADOS ==========
    const { filters, handleFilterChange, handleSearch } = useMigrationFilters();
    const { handleMigrateSingle, handleMigrateBulk } = useMigrationActions();
    const { processedStats } = useMigrationStats(statistics);

    // ========== EFECTOS ==========

    // Cargar datos iniciales
    useEffect(() => {
        loadEmployees();
        loadRoles({ page_size: 100 });
        loadStatistics();
    }, [currentPage, filters]);

    // ========== FUNCIONES DE CARGA DE DATOS ==========

    const loadEmployees = async () => {
        setLoading(true);
        setError('');

        try {
            const params = {
                page: currentPage,
                search: filters.search,
                page_size: 20
            };

            const result = await permissionService.getAvailableEmployees(params);

            if (result.success) {
                setEmployees(result.data.results || result.data);
                setPagination({
                    count: result.data.count || 0,
                    next: result.data.next || null,
                    previous: result.data.previous || null,
                });
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al cargar empleados disponibles');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const result = await permissionService.getMigrationStatistics();
            if (result.success) {
                setStatistics(result.data);
            }
        } catch (err) {
            console.error('Error loading statistics:', err);
        }
    };

    // ========== HANDLERS PARA DIÁLOGOS ==========

    const openDialog = (type, employee = null) => {
        setSelectedEmployee(employee);
        setDialogs(prev => ({ ...prev, [type]: true }));
    };

    const closeDialog = (type) => {
        setDialogs(prev => ({ ...prev, [type]: false }));
        if (type === 'migrateSingle') {
            setSelectedEmployee(null);
        }
    };

    // ========== HANDLERS DE SELECCIÓN ==========

    const handleSelectEmployee = (employeePersona, checked) => {
        if (checked) {
            setSelectedEmployees(prev => [...prev, employeePersona]);
        } else {
            setSelectedEmployees(prev => prev.filter(id => id !== employeePersona));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedEmployees(employees.map(emp => emp.persona));
        } else {
            setSelectedEmployees([]);
        }
    };

    // ========== HANDLERS DE MIGRACIÓN ==========

    const handleSingleMigration = async (data) => {
        const result = await handleMigrateSingle(selectedEmployee, data.rol_id);
        if (result.success) {
            closeDialog('migrateSingle');
            await loadEmployees();
            await loadStatistics();
        }
        return result;
    };

    const handleBulkMigration = async (roleId) => {
        if (selectedEmployees.length === 0) {
            setError('Selecciona al menos un empleado');
            return;
        }

        const result = await handleMigrateBulk(selectedEmployees, roleId);

        // Limpiar selección y recargar datos
        setSelectedEmployees([]);
        await loadEmployees();
        await loadStatistics();

        return result;
    };

    // ========== HANDLER DE ÉXITO ==========

    const handleSuccess = async (type) => {
        closeDialog(type);
        await loadEmployees();
        await loadStatistics();
    };

    // ========== LOADING INICIAL ==========

    if (loading && employees.length === 0) {
        return <Loader message="Cargando empleados disponibles..." />;
    }

    // ========== RENDER ==========

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <Typography variant="h3" color="blue-gray">
                        Migración de Empleados
                    </Typography>
                    <Typography color="gray" className="mt-1">
                        Migra empleados del sistema FDW al nuevo sistema de usuarios
                    </Typography>
                </div>

                <Button
                    variant="outlined"
                    className="flex items-center gap-2"
                    onClick={() => {
                        loadEmployees();
                        loadStatistics();
                    }}
                >
                    <IoRefresh className="h-5 w-5" />
                    Actualizar
                </Button>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert color="red" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Componentes principales */}
            <MigrationComponents
                employees={employees}
                statistics={processedStats}
                loading={loading}
                pagination={pagination}
                currentPage={currentPage}
                filters={filters}
                selectedEmployees={selectedEmployees}
                roles={roles}
                onPageChange={setCurrentPage}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onSelectEmployee={handleSelectEmployee}
                onSelectAll={handleSelectAll}
                onMigrateSingle={(employee) => openDialog('migrateSingle', employee)}
                onMigrateBulk={handleBulkMigration}
                onRefresh={loadEmployees}
            />

            {/* Todos los Diálogos */}
            <MigrationDialogs
                dialogs={dialogs}
                selectedEmployee={selectedEmployee}
                selectedEmployees={selectedEmployees}
                roles={roles}
                loading={loading}
                onCloseDialog={closeDialog}
                onSuccess={handleSuccess}
                onMigrateSingle={handleSingleMigration}
                onMigrateBulk={handleBulkMigration}
            />
        </div>
    );
};

export default EmployeeMigration;