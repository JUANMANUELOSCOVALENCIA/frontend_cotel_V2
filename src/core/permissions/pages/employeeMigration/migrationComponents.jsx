import React from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Input,
    Button,
    IconButton,
    Checkbox,
    Chip,
    Select,
    Option,
    Progress
} from '@material-tailwind/react';
import {
    IoSearch,
    IoPeople,
    IoCheckmarkCircle,
    IoPersonAdd,
    IoStatsChart,
    IoRefresh
} from 'react-icons/io5';

// ========== COMPONENTE ESTADÍSTICAS OPTIMIZADO ==========
const StatisticsCards = React.memo(({ statistics }) => {
    if (!statistics) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-blue-500">
                <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                        <IoPeople className="h-8 w-8 text-blue-500" />
                        <div>
                            <Typography variant="h4" color="blue-gray">
                                {statistics.total_empleados_fdw}
                            </Typography>
                            <Typography variant="small" color="gray">
                                Total Empleados
                            </Typography>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card className="border-l-4 border-green-500">
                <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                        <IoCheckmarkCircle className="h-8 w-8 text-green-500" />
                        <div>
                            <Typography variant="h4" color="blue-gray">
                                {statistics.total_migrados}
                            </Typography>
                            <Typography variant="small" color="gray">
                                Ya Migrados
                            </Typography>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card className="border-l-4 border-orange-500">
                <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                        <IoPersonAdd className="h-8 w-8 text-orange-500" />
                        <div>
                            <Typography variant="h4" color="blue-gray">
                                {statistics.total_disponibles}
                            </Typography>
                            <Typography variant="small" color="gray">
                                Disponibles
                            </Typography>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card className="border-l-4 border-purple-500">
                <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                        <IoStatsChart className="h-8 w-8 text-purple-500" />
                        <div>
                            <Typography variant="h4" color="blue-gray">
                                {statistics.porcentaje_migrado}%
                            </Typography>
                            <Typography variant="small" color="gray">
                                Progreso
                            </Typography>
                        </div>
                    </div>
                    <Progress
                        value={statistics.porcentaje_migrado}
                        color="purple"
                        className="mt-2"
                    />
                </CardBody>
            </Card>
        </div>
    );
});

StatisticsCards.displayName = 'StatisticsCards';

// ========== COMPONENTE BUSCADOR OPTIMIZADO CON DEBOUNCE ==========
const SearchInput = React.memo(({
                                    searchValue,
                                    onSearchChange,
                                    placeholder = "Nombre, apellido o código COTEL"
                                }) => {
    // Estado local para el input (inmediato)
    const [localValue, setLocalValue] = React.useState(searchValue || '');

    // Ref para el timeout del debounce
    const debounceRef = React.useRef(null);

    // Actualizar valor local cuando cambia el prop externo
    React.useEffect(() => {
        setLocalValue(searchValue || '');
    }, [searchValue]);

    // Handler del input con debounce
    const handleInputChange = React.useCallback((e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        // Limpiar timeout anterior
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Crear nuevo timeout para el debounce
        debounceRef.current = setTimeout(() => {
            onSearchChange(newValue);
        }, 500); // 500ms de delay
    }, [onSearchChange]);

    // Limpiar timeout al desmontar el componente
    React.useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <Input
            label="Buscar empleados"
            icon={<IoSearch />}
            value={localValue}
            onChange={handleInputChange}
            placeholder={placeholder}
        />
    );
});

SearchInput.displayName = 'SearchInput';

// ========== COMPONENTE FILTROS Y ACCIONES MASIVAS OPTIMIZADO ==========
const SearchAndActions = React.memo(({
                                         searchValue,
                                         selectedEmployees,
                                         roles,
                                         loading,
                                         onSearchChange,
                                         onMigrateBulk
                                     }) => {
    const handleBulkMigrate = React.useCallback((value) => {
        onMigrateBulk(value);
    }, [onMigrateBulk]);

    return (
        <Card>
            <CardBody className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex-1 max-w-md">
                        <SearchInput
                            searchValue={searchValue}
                            onSearchChange={onSearchChange}
                        />
                    </div>

                    {selectedEmployees.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Chip
                                variant="ghost"
                                color="blue"
                                size="sm"
                                value={`${selectedEmployees.length} seleccionados`}
                            />
                            <Select
                                label="Migrar con rol"
                                onChange={handleBulkMigrate}
                                disabled={loading}
                            >
                                {roles.map((role) => (
                                    <Option key={role.id} value={role.id.toString()}>
                                        {role.nombre}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
});

SearchAndActions.displayName = 'SearchAndActions';

// ========== COMPONENTE FILA DE EMPLEADO OPTIMIZADO ==========
const EmployeeRow = React.memo(({
                                    employee,
                                    isSelected,
                                    onSelectEmployee,
                                    onMigrateSingle
                                }) => {
    const handleCheckboxChange = React.useCallback((e) => {
        onSelectEmployee(employee.persona, e.target.checked);
    }, [employee.persona, onSelectEmployee]);

    const handleMigrateClick = React.useCallback(() => {
        onMigrateSingle(employee);
    }, [employee, onMigrateSingle]);

    const formattedDate = React.useMemo(() => {
        return employee.fechaingreso
            ? new Date(employee.fechaingreso).toLocaleDateString('es-ES')
            : 'No especificada';
    }, [employee.fechaingreso]);

    return (
        <tr className="hover:bg-gray-50">
            <td className="p-4">
                <Checkbox
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                />
            </td>
            <td className="p-4">
                <div className="flex flex-col">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                        {employee.nombre_completo}
                    </Typography>
                    <Typography variant="small" color="gray" className="font-normal">
                        ID: {employee.persona}
                    </Typography>
                </div>
            </td>
            <td className="p-4">
                <Typography variant="small" color="blue-gray" className="font-medium">
                    {employee.codigocotel}
                </Typography>
            </td>
            <td className="p-4">
                <Chip
                    variant="ghost"
                    size="sm"
                    value={employee.estado_texto}
                    color={employee.esta_activo ? 'green' : 'red'}
                />
            </td>
            <td className="p-4">
                <Typography variant="small" color="gray">
                    {formattedDate}
                </Typography>
            </td>
            <td className="p-4">
                <Button
                    size="sm"
                    color="orange"
                    className="flex items-center gap-2"
                    onClick={handleMigrateClick}
                    disabled={!employee.puede_migrar}
                >
                    <IoPersonAdd className="h-4 w-4" />
                    Migrar
                </Button>
            </td>
        </tr>
    );
});

EmployeeRow.displayName = 'EmployeeRow';

// ========== COMPONENTE TABLA DE EMPLEADOS OPTIMIZADO ==========
const EmployeesTable = React.memo(({
                                       employees,
                                       selectedEmployees,
                                       loading,
                                       pagination,
                                       onSelectAll,
                                       onSelectEmployee,
                                       onMigrateSingle,
                                       onRefresh,
                                       searchValue
                                   }) => {
    // Handler para seleccionar todos
    const handleSelectAllChange = React.useCallback((e) => {
        onSelectAll(e.target.checked);
    }, [onSelectAll]);

    // Handler para el botón de refresh
    const handleRefreshClick = React.useCallback(() => {
        onRefresh();
    }, [onRefresh]);

    // Memoizar el estado del checkbox principal
    const selectAllCheckboxState = React.useMemo(() => {
        const allSelected = selectedEmployees.length === employees.length;
        const someSelected = selectedEmployees.length > 0 && selectedEmployees.length < employees.length;

        return { allSelected, someSelected };
    }, [selectedEmployees.length, employees.length]);

    return (
        <Card>
            <CardHeader floated={false} shadow={false} className="rounded-none">
                <div className="flex items-center justify-between">
                    <Typography variant="h6" color="blue-gray">
                        Empleados Disponibles ({pagination.count || 0})
                    </Typography>

                    <div className="flex items-center gap-2">
                        <IconButton variant="text" onClick={handleRefreshClick} disabled={loading}>
                            <IoRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </IconButton>
                    </div>
                </div>
            </CardHeader>

            <CardBody className="overflow-x-auto px-0">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Progress size="sm" value={70} color="orange" className="w-32" />
                    </div>
                ) : employees.length === 0 ? (
                    <div className="text-center py-8">
                        <Typography color="gray">
                            {searchValue
                                ? 'No se encontraron empleados con ese criterio'
                                : 'No hay empleados disponibles para migrar'
                            }
                        </Typography>
                    </div>
                ) : (
                    <table className="w-full min-w-max table-auto text-left">
                        <thead>
                        <tr>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Checkbox
                                    checked={selectAllCheckboxState.allSelected}
                                    onChange={handleSelectAllChange}
                                    ref={(el) => {
                                        if (el) {
                                            el.indeterminate = selectAllCheckboxState.someSelected;
                                        }
                                    }}
                                />
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Empleado
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Código COTEL
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Estado
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Fecha Ingreso
                                </Typography>
                            </th>
                            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Acciones
                                </Typography>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {employees.map((employee) => (
                            <EmployeeRow
                                key={employee.persona}
                                employee={employee}
                                isSelected={selectedEmployees.includes(employee.persona)}
                                onSelectEmployee={onSelectEmployee}
                                onMigrateSingle={onMigrateSingle}
                            />
                        ))}
                        </tbody>
                    </table>
                )}
            </CardBody>
        </Card>
    );
});

EmployeesTable.displayName = 'EmployeesTable';

// ========== COMPONENTE PAGINACIÓN OPTIMIZADO ==========
const PaginationControls = React.memo(({
                                           employees,
                                           pagination,
                                           currentPage,
                                           onPageChange
                                       }) => {
    const handlePreviousPage = React.useCallback(() => {
        onPageChange(currentPage - 1);
    }, [currentPage, onPageChange]);

    const handleNextPage = React.useCallback(() => {
        onPageChange(currentPage + 1);
    }, [currentPage, onPageChange]);

    if (pagination.count <= 20) return null;

    return (
        <div className="flex items-center justify-between">
            <Typography variant="small" color="gray">
                Mostrando {employees.length} de {pagination.count} empleados
            </Typography>
            <div className="flex items-center gap-2">
                <Button
                    variant="outlined"
                    size="sm"
                    disabled={!pagination.previous}
                    onClick={handlePreviousPage}
                >
                    Anterior
                </Button>
                <Button
                    variant="outlined"
                    size="sm"
                    disabled={!pagination.next}
                    onClick={handleNextPage}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
});

PaginationControls.displayName = 'PaginationControls';

// ========== COMPONENTE PRINCIPAL OPTIMIZADO ==========
const EmployeesManagement = React.memo(({
                                            statistics,
                                            employees,
                                            selectedEmployees,
                                            roles,
                                            filters,
                                            pagination,
                                            currentPage,
                                            loading,
                                            onSearch,
                                            onSelectAll,
                                            onSelectEmployee,
                                            onMigrateSingle,
                                            onMigrateBulk,
                                            onPageChange,
                                            onRefresh
                                        }) => {
    // Handlers memoizados
    const handleSearchChange = React.useCallback((searchValue) => {
        onSearch(searchValue);
    }, [onSearch]);

    const handleSelectAll = React.useCallback((checked) => {
        onSelectAll(checked);
    }, [onSelectAll]);

    const handleSelectEmployee = React.useCallback((employeeId, checked) => {
        onSelectEmployee(employeeId, checked);
    }, [onSelectEmployee]);

    const handleMigrateSingle = React.useCallback((employee) => {
        onMigrateSingle(employee);
    }, [onMigrateSingle]);

    const handleMigrateBulk = React.useCallback((roleId) => {
        onMigrateBulk(roleId);
    }, [onMigrateBulk]);

    const handlePageChange = React.useCallback((page) => {
        onPageChange(page);
    }, [onPageChange]);

    const handleRefresh = React.useCallback(() => {
        onRefresh();
    }, [onRefresh]);

    return (
        <>
            <StatisticsCards statistics={statistics} />

            <SearchAndActions
                searchValue={filters.search}
                selectedEmployees={selectedEmployees}
                roles={roles}
                loading={loading}
                onSearchChange={handleSearchChange}
                onMigrateBulk={handleMigrateBulk}
            />

            <EmployeesTable
                employees={employees}
                selectedEmployees={selectedEmployees}
                loading={loading}
                pagination={pagination}
                searchValue={filters.search}
                onSelectAll={handleSelectAll}
                onSelectEmployee={handleSelectEmployee}
                onMigrateSingle={handleMigrateSingle}
                onRefresh={handleRefresh}
            />

            <PaginationControls
                employees={employees}
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
            />
        </>
    );
});

EmployeesManagement.displayName = 'EmployeesManagement';

export default EmployeesManagement;