// src/core/permissions/pages/EmployeeMigration/migrationHooks.js
import { useState, useCallback, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';
import permissionService from '../../services/permissionService';

// ========== HOOK PARA MANEJO DE FILTROS ==========

export const useMigrationFilters = () => {
    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({
        search: '',
    });

    // Debounce para búsqueda
    const debouncedSearch = useMemo(
        () => debounce((searchValue) => {
            console.log('🔍 Ejecutando búsqueda de empleados:', searchValue);
            setFilters(prev => ({ ...prev, search: searchValue }));
        }, 300),
        []
    );

    // Handler para input de búsqueda
    const handleSearch = useCallback((value) => {
        console.log('⌨️ Búsqueda de empleados cambiada:', value);
        setSearchInput(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    // Handler para otros filtros
    const handleFilterChange = useCallback((key, value) => {
        console.log('🔧 Filtro de migración cambiado:', key, '=', value);
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Limpiar búsqueda
    const clearSearch = useCallback(() => {
        setSearchInput('');
        setFilters(prev => ({ ...prev, search: '' }));
    }, []);

    // Limpiar debounce al desmontar
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return {
        filters,
        searchInput,
        handleFilterChange,
        handleSearch,
        clearSearch
    };
};

// ========== HOOK PARA ACCIONES DE MIGRACIÓN ==========

export const useMigrationActions = () => {
    // Migración individual
    const handleMigrateSingle = useCallback(async (employee, roleId) => {
        console.log(`🎯 Migrando empleado individual:`, employee.nombre_completo);

        try {
            const result = await permissionService.migrateEmployee({
                empleado_persona: employee.persona,
                rol_id: parseInt(roleId)
            });

            if (result.success) {
                console.log('✅ Empleado migrado exitosamente');
                return { success: true, data: result.data };
            } else {
                console.error('❌ Error migrando empleado:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('❌ Error en migración individual:', error);
            return { success: false, error: 'Error inesperado' };
        }
    }, []);

    // Migración masiva
    const handleMigrateBulk = useCallback(async (employeePersonas, roleId) => {
        console.log(`🎯 Migrando ${employeePersonas.length} empleados masivamente`);

        let successCount = 0;
        let errorCount = 0;

        try {
            for (const employeePersona of employeePersonas) {
                try {
                    const result = await permissionService.migrateEmployee({
                        empleado_persona: employeePersona,
                        rol_id: parseInt(roleId)
                    });

                    if (result.success) {
                        successCount++;
                    } else {
                        errorCount++;
                        console.error('❌ Error migrando empleado:', employeePersona, result.error);
                    }
                } catch (err) {
                    errorCount++;
                    console.error('❌ Error en empleado individual:', employeePersona, err);
                }
            }

            // Mostrar resultados
            if (successCount > 0) {
                toast.success(`${successCount} empleados migrados correctamente`);
            }
            if (errorCount > 0) {
                toast.error(`${errorCount} empleados no pudieron ser migrados`);
            }

            console.log(`✅ Migración masiva completada. Éxito: ${successCount}, Errores: ${errorCount}`);

            return {
                success: true,
                successCount,
                errorCount,
                total: employeePersonas.length
            };

        } catch (error) {
            console.error('❌ Error en migración masiva:', error);
            toast.error('Error en migración masiva');
            return { success: false, error: 'Error inesperado en migración masiva' };
        }
    }, []);

    return {
        handleMigrateSingle,
        handleMigrateBulk
    };
};

// ========== HOOK PARA ESTADÍSTICAS DE MIGRACIÓN ==========

export const useMigrationStats = (statistics) => {
    const processedStats = useMemo(() => {
        if (!statistics) {
            return {
                total_empleados_fdw: 0,
                total_migrados: 0,
                total_disponibles: 0,
                porcentaje_migrado: 0,
                progreso_color: 'gray'
            };
        }

        // Determinar color del progreso
        let progressColor = 'red';
        if (statistics.porcentaje_migrado >= 75) {
            progressColor = 'green';
        } else if (statistics.porcentaje_migrado >= 50) {
            progressColor = 'orange';
        } else if (statistics.porcentaje_migrado >= 25) {
            progressColor = 'yellow';
        }

        return {
            ...statistics,
            progreso_color: progressColor
        };
    }, [statistics]);

    // Calcular métricas adicionales
    const metrics = useMemo(() => {
        if (!statistics) return null;

        return {
            empleados_restantes: statistics.total_disponibles,
            tasa_migracion: statistics.porcentaje_migrado,
            estado_migracion: statistics.porcentaje_migrado >= 100 ? 'completa' :
                statistics.porcentaje_migrado >= 75 ? 'avanzada' :
                    statistics.porcentaje_migrado >= 50 ? 'media' :
                        statistics.porcentaje_migrado >= 25 ? 'inicial' : 'comenzando',
        };
    }, [statistics]);

    return {
        processedStats,
        metrics
    };
};

// ========== HOOK PARA SELECCIÓN MASIVA ==========

export const useBulkSelection = (employees = []) => {
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    // Seleccionar/deseleccionar empleado individual
    const toggleEmployee = useCallback((employeePersona, checked) => {
        if (checked) {
            setSelectedEmployees(prev => [...prev, employeePersona]);
        } else {
            setSelectedEmployees(prev => prev.filter(id => id !== employeePersona));
        }
    }, []);

    // Seleccionar/deseleccionar todos
    const toggleAll = useCallback((checked) => {
        if (checked) {
            setSelectedEmployees(employees.map(emp => emp.persona));
        } else {
            setSelectedEmployees([]);
        }
    }, [employees]);

    // Limpiar selección
    const clearSelection = useCallback(() => {
        setSelectedEmployees([]);
    }, []);

    // Estadísticas de selección
    const selectionStats = useMemo(() => {
        const total = employees.length;
        const selected = selectedEmployees.length;

        return {
            total,
            selected,
            percentage: total > 0 ? Math.round((selected / total) * 100) : 0,
            allSelected: selected === total && total > 0,
            noneSelected: selected === 0,
            partiallySelected: selected > 0 && selected < total
        };
    }, [employees.length, selectedEmployees.length]);

    return {
        selectedEmployees,
        setSelectedEmployees,
        toggleEmployee,
        toggleAll,
        clearSelection,
        selectionStats
    };
};

// ========== FUNCIONES AUXILIARES ==========

// Verificar si un empleado puede ser migrado
export const canMigrateEmployee = (employee) => {
    return employee.puede_migrar && employee.esta_activo;
};

// Formatear nombre completo del empleado
export const formatEmployeeName = (employee) => {
    if (!employee) return '';
    return employee.nombre_completo || `Empleado ${employee.persona}`;
};

// Obtener estado del empleado
export const getEmployeeStatus = (employee) => {
    if (!employee.esta_activo) return { text: 'Inactivo', color: 'red' };
    if (!employee.puede_migrar) return { text: 'No migrable', color: 'orange' };
    return { text: 'Disponible', color: 'green' };
};

// Validar datos de migración
export const validateMigrationData = (employee, roleId) => {
    const errors = [];

    if (!employee) {
        errors.push('Empleado no válido');
    }

    if (!roleId) {
        errors.push('Rol es obligatorio');
    }

    if (employee && !employee.puede_migrar) {
        errors.push('Este empleado no puede ser migrado');
    }

    if (employee && !employee.esta_activo) {
        errors.push('El empleado debe estar activo para ser migrado');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Obtener progreso de migración como texto
export const getMigrationProgressText = (percentage) => {
    if (percentage >= 100) return 'Migración completa';
    if (percentage >= 75) return 'Migración avanzada';
    if (percentage >= 50) return 'Migración media';
    if (percentage >= 25) return 'Migración inicial';
    return 'Migración comenzando';
};

// Calcular tiempo estimado de migración masiva
export const estimateBulkMigrationTime = (employeeCount) => {
    // Aproximadamente 2 segundos por empleado
    const secondsPerEmployee = 2;
    const totalSeconds = employeeCount * secondsPerEmployee;

    if (totalSeconds < 60) {
        return `${totalSeconds} segundos`;
    } else if (totalSeconds < 3600) {
        const minutes = Math.ceil(totalSeconds / 60);
        return `${minutes} minutos`;
    } else {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.ceil((totalSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
};

// ========== CONSTANTES ==========

export const MIGRATION_STATUS = {
    AVAILABLE: 'disponible',
    MIGRATED: 'migrado',
    NOT_MIGRATABLE: 'no_migrable',
    INACTIVE: 'inactivo',
};

export const MIGRATION_COLORS = {
    AVAILABLE: 'green',
    MIGRATED: 'blue',
    NOT_MIGRATABLE: 'orange',
    INACTIVE: 'red',
};

export const BULK_MIGRATION_LIMITS = {
    MAX_EMPLOYEES: 100, // Máximo empleados por migración masiva
    MIN_EMPLOYEES: 2,   // Mínimo empleados para migración masiva
    BATCH_SIZE: 10,     // Empleados por lote
};

// ========== HOOK PARA VALIDACIÓN DE MIGRACIÓN ==========

export const useMigrationValidation = () => {
    const [validationErrors, setValidationErrors] = useState({});

    const validateEmployee = useCallback((employee) => {
        const errors = [];

        if (!employee.puede_migrar) {
            errors.push('Este empleado no puede ser migrado');
        }

        if (!employee.esta_activo) {
            errors.push('El empleado debe estar activo');
        }

        if (!employee.codigocotel) {
            errors.push('El empleado debe tener un código COTEL válido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, []);

    const validateBulkSelection = useCallback((selectedEmployees, employees) => {
        const errors = [];

        if (selectedEmployees.length === 0) {
            errors.push('Debe seleccionar al menos un empleado');
        }

        if (selectedEmployees.length > BULK_MIGRATION_LIMITS.MAX_EMPLOYEES) {
            errors.push(`No se pueden migrar más de ${BULK_MIGRATION_LIMITS.MAX_EMPLOYEES} empleados a la vez`);
        }

        // Validar empleados individuales
        const invalidEmployees = employees
            .filter(emp => selectedEmployees.includes(emp.persona))
            .filter(emp => !emp.puede_migrar || !emp.esta_activo);

        if (invalidEmployees.length > 0) {
            errors.push(`${invalidEmployees.length} empleados seleccionados no pueden ser migrados`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            invalidEmployees
        };
    }, []);

    const clearValidationErrors = useCallback(() => {
        setValidationErrors({});
    }, []);

    return {
        validationErrors,
        validateEmployee,
        validateBulkSelection,
        clearValidationErrors
    };
};

export default {
    useMigrationFilters,
    useMigrationActions,
    useMigrationStats,
    useBulkSelection,
    useMigrationValidation,
    canMigrateEmployee,
    formatEmployeeName,
    getEmployeeStatus,
    validateMigrationData,
    getMigrationProgressText,
    estimateBulkMigrationTime,
    MIGRATION_STATUS,
    MIGRATION_COLORS,
    BULK_MIGRATION_LIMITS,
};