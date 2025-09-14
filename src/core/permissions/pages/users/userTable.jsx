// src/core/permissions/pages/Users/UserTable.jsx
import React from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Button,
    Input,
    Select,
    Option,
    Progress,
    IconButton,
    Chip,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Tooltip
} from '@material-tailwind/react';
import {
    IoSearch,
    IoRefresh,
    IoDownload,
    IoEye,
    IoCreate,
    IoEllipsisVertical,
    IoCheckmarkCircle,
    IoCloseCircle,
    IoKey,
    IoLockOpen,
    IoTrash,
    IoReload,
    IoArchive,
    IoClose
} from 'react-icons/io5';
import Permission from '../../components/Permission';

const UserTable = ({
                       users,
                       roles,
                       loading,
                       pagination,
                       currentPage,
                       filters,
                       searchInput,
                       onPageChange,
                       onEditUser,
                       onConfirmAction,
                       onChangeRole,
                       onFilterChange,
                       onSearchChange,
                       onClearSearch,
                       onRefresh
                   }) => {

    // ========== HELPER FUNCTIONS ==========

    const getUserStatusColor = (user) => {
        if (user.eliminado) return 'gray';
        if (!user.is_active) return 'red';
        if (user.esta_bloqueado) return 'orange';
        if (user.estado_password === 'reset_requerido') return 'yellow';
        if (user.estado_password === 'cambio_requerido') return 'blue';
        return 'green';
    };

    const getUserStatusText = (user) => {
        if (user.eliminado) return 'Eliminado';
        if (!user.is_active) return 'Inactivo';
        if (user.esta_bloqueado) return 'Bloqueado';
        if (user.estado_password === 'reset_requerido') return 'Reset Requerido';
        if (user.estado_password === 'cambio_requerido') return 'Cambio Requerido';
        return 'Activo';
    };

    // ========== COMPONENTE FILA DE USUARIO ==========

    const UserRow = ({ user }) => (
        <tr className={`hover:bg-gray-50 ${user.eliminado ? 'opacity-60' : ''}`}>
            {/* Usuario */}
            <td className="p-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Typography variant="small" color="blue-gray" className="font-medium">
                            {user.nombre_completo}
                        </Typography>
                        {user.eliminado && (
                            <Chip
                                variant="ghost"
                                size="sm"
                                color="gray"
                                value="Eliminado"
                                icon={<IoTrash className="h-3 w-3" />}
                            />
                        )}
                    </div>
                    <Typography variant="small" color="gray" className="font-normal">
                        COTEL: {user.codigocotel}
                    </Typography>
                </div>
            </td>

            {/* Rol */}
            <td className="p-4">
                <div className="flex items-center gap-2">
                    <Chip
                        variant="ghost"
                        size="sm"
                        value={user.rol_nombre || 'Sin rol'}
                        color={user.rol_nombre ? 'blue' : 'gray'}
                    />
                    {user.rol_nombre && !user.eliminado && (
                        <Menu>
                            <MenuHandler>
                                <IconButton variant="text" size="sm">
                                    <IoCreate className="h-3 w-3" />
                                </IconButton>
                            </MenuHandler>
                            <MenuList>
                                {roles.map((role) => (
                                    <MenuItem
                                        key={role.id}
                                        onClick={() => onChangeRole(user.id, role.id)}
                                        className={user.rol_nombre === role.nombre ? 'bg-blue-50' : ''}
                                    >
                                        {role.nombre}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </Menu>
                    )}
                </div>
            </td>

            {/* Tipo */}
            <td className="p-4">
                <Chip
                    variant="ghost"
                    size="sm"
                    value={user.tipo_usuario === 'manual' ? 'Manual' : 'Migrado'}
                    color={user.tipo_usuario === 'manual' ? 'green' : 'blue'}
                />
            </td>

            {/* Estado */}
            <td className="p-4">
                <div className="flex flex-col gap-1">
                    <Chip
                        variant="ghost"
                        size="sm"
                        value={getUserStatusText(user)}
                        color={getUserStatusColor(user)}
                    />
                    {user.intentos_login_fallidos > 0 && (
                        <Typography variant="small" color="red" className="text-xs">
                            {user.intentos_login_fallidos} intentos fallidos
                        </Typography>
                    )}
                </div>
            </td>

            {/* Último Login */}
            <td className="p-4">
                <Typography variant="small" color="gray">
                    {user.last_login
                        ? new Date(user.last_login).toLocaleDateString('es-ES')
                        : 'Nunca'
                    }
                </Typography>
            </td>

            {/* Acciones */}
            <td className="p-4">
                <div className="flex items-center gap-2">
                    <Permission recurso="usuarios" accion="leer">
                        <Tooltip content="Ver detalles">
                            <IconButton variant="text" size="sm">
                                <IoEye className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>
                    </Permission>

                    {!user.eliminado && (
                        <Permission recurso="usuarios" accion="actualizar">
                            <Tooltip content="Editar">
                                <IconButton
                                    variant="text"
                                    size="sm"
                                    onClick={() => onEditUser(user)}
                                >
                                    <IoCreate className="h-4 w-4" />
                                </IconButton>
                            </Tooltip>
                        </Permission>
                    )}

                    <Menu>
                        <MenuHandler>
                            <IconButton variant="text" size="sm">
                                <IoEllipsisVertical className="h-4 w-4" />
                            </IconButton>
                        </MenuHandler>
                        <MenuList>
                            {user.eliminado && (
                                <Permission recurso="usuarios" accion="actualizar">
                                    <MenuItem
                                        className="flex items-center gap-2 text-green-500"
                                        onClick={() => onConfirmAction('restore', user)}
                                    >
                                        <IoReload className="h-4 w-4" />
                                        Restaurar
                                    </MenuItem>
                                </Permission>
                            )}

                            {!user.eliminado && (
                                <>
                                    <Permission recurso="usuarios" accion="actualizar">
                                        {user.is_active ? (
                                            <MenuItem
                                                className="flex items-center gap-2 text-red-500"
                                                onClick={() => onConfirmAction('deactivate', user)}
                                            >
                                                <IoCloseCircle className="h-4 w-4" />
                                                Desactivar
                                            </MenuItem>
                                        ) : (
                                            <MenuItem
                                                className="flex items-center gap-2 text-green-500"
                                                onClick={() => onConfirmAction('activate', user)}
                                            >
                                                <IoCheckmarkCircle className="h-4 w-4" />
                                                Activar
                                            </MenuItem>
                                        )}

                                        <MenuItem
                                            className="flex items-center gap-2"
                                            onClick={() => onConfirmAction('resetPassword', user)}
                                        >
                                            <IoKey className="h-4 w-4" />
                                            Resetear Contraseña
                                        </MenuItem>

                                        {user.esta_bloqueado && (
                                            <MenuItem
                                                className="flex items-center gap-2 text-blue-500"
                                                onClick={() => onConfirmAction('unlock', user)}
                                            >
                                                <IoLockOpen className="h-4 w-4" />
                                                Desbloquear
                                            </MenuItem>
                                        )}
                                    </Permission>

                                    <Permission recurso="usuarios" accion="eliminar">
                                        <MenuItem
                                            className="flex items-center gap-2 text-red-500"
                                            onClick={() => onConfirmAction('delete', user)}
                                        >
                                            <IoTrash className="h-4 w-4" />
                                            Eliminar
                                        </MenuItem>
                                    </Permission>
                                </>
                            )}
                        </MenuList>
                    </Menu>
                </div>
            </td>
        </tr>
    );

    // ========== RENDER PRINCIPAL ==========

    return (
        <>
            {/* Filtros */}
            <Card>
                <CardBody className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {/* Búsqueda */}
                        <div className="md:col-span-2">
                            <Input
                                label="Buscar usuarios"
                                icon={<IoSearch />}
                                value={searchInput}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Nombre, apellido o código COTEL"
                                className={loading ? "opacity-60" : ""}
                            />
                            {loading && searchInput && (
                                <Typography variant="small" color="blue" className="mt-1 text-xs">
                                    Buscando "{searchInput}"...
                                </Typography>
                            )}
                        </div>

                        {/* Rol */}
                        <Select
                            label="Rol"
                            value={String(filters.rol || '')}
                            onChange={(value) => onFilterChange('rol', value)}
                        >
                            <Option value="">Todos los roles</Option>
                            {roles.map((role) => (
                                <Option key={role.id} value={String(role.id)}>
                                    {role.nombre}
                                </Option>
                            ))}
                        </Select>

                        {/* Tipo */}
                        <Select
                            label="Tipo"
                            value={filters.tipo}
                            onChange={(value) => onFilterChange('tipo', value)}
                        >
                            <Option value="">Todos</Option>
                            <Option value="manual">Manual</Option>
                            <Option value="migrado">Migrado</Option>
                        </Select>

                        {/* Estado */}
                        <Select
                            label="Estado"
                            value={filters.is_active}
                            onChange={(value) => onFilterChange('is_active', value)}
                        >
                            <Option value="">Todos</Option>
                            <Option value="true">Activos</Option>
                            <Option value="false">Inactivos</Option>
                        </Select>

                        {/* Incluir eliminados */}
                        <Select
                            label="Incluir eliminados"
                            value={filters.incluir_eliminados}
                            onChange={(value) => onFilterChange('incluir_eliminados', value)}
                        >
                            <Option value="">Todos</Option>
                            <Option value="true">Incluir eliminados</Option>
                            <Option value="only">Solo eliminados</Option>
                        </Select>
                    </div>

                    {/* Filtros activos */}
                    {(filters.incluir_eliminados || filters.search) && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                            {filters.incluir_eliminados === 'true' && (
                                <Chip
                                    variant="ghost"
                                    color="blue"
                                    size="sm"
                                    value="Incluyendo usuarios eliminados"
                                    icon={<IoArchive className="h-3 w-3" />}
                                />
                            )}
                            {filters.incluir_eliminados === 'only' && (
                                <Chip
                                    variant="ghost"
                                    color="gray"
                                    size="sm"
                                    value="Solo usuarios eliminados"
                                    icon={<IoTrash className="h-3 w-3" />}
                                />
                            )}
                            {filters.search && (
                                <Chip
                                    variant="ghost"
                                    size="sm"
                                    value={`Búsqueda: "${filters.search}"`}
                                    color="blue"
                                    onClose={onClearSearch}
                                    action={
                                        <button onClick={onClearSearch}>
                                            <IoClose className="h-3 w-3" />
                                        </button>
                                    }
                                />
                            )}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Tabla */}
            <Card>
                <CardHeader floated={false} shadow={false} className="rounded-none">
                    <div className="flex items-center justify-between">
                        <Typography variant="h6" color="blue-gray">
                            Usuarios ({pagination.count || 0})
                        </Typography>

                        <div className="flex items-center gap-2">
                            <IconButton
                                variant="text"
                                onClick={onRefresh}
                                disabled={loading}
                            >
                                <IoRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </IconButton>

                            <Permission recurso="usuarios" accion="leer">
                                <IconButton variant="text">
                                    <IoDownload className="h-4 w-4" />
                                </IconButton>
                            </Permission>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="overflow-x-auto px-0">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Progress size="sm" value={70} color="orange" className="w-32" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8">
                            <Typography color="gray">
                                {filters.search
                                    ? `No se encontraron usuarios que coincidan con "${filters.search}"`
                                    : filters.incluir_eliminados === 'only'
                                        ? 'No se encontraron usuarios eliminados'
                                        : 'No se encontraron usuarios'
                                }
                            </Typography>
                        </div>
                    ) : (
                        <table className="w-full min-w-max table-auto text-left">
                            <thead>
                            <tr>
                                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                    <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                        Usuario
                                    </Typography>
                                </th>
                                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                    <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                        Rol
                                    </Typography>
                                </th>
                                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                    <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                        Tipo
                                    </Typography>
                                </th>
                                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                    <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                        Estado
                                    </Typography>
                                </th>
                                <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                    <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                        Último Login
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
                            {users.map((user) => (
                                <UserRow key={user.id} user={user} />
                            ))}
                            </tbody>
                        </table>
                    )}
                </CardBody>
            </Card>

            {/* Paginación */}
            {pagination.count > 20 && (
                <div className="flex items-center justify-between">
                    <Typography variant="small" color="gray">
                        Mostrando {users.length} de {pagination.count} usuarios
                    </Typography>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outlined"
                            size="sm"
                            disabled={!pagination.previous}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outlined"
                            size="sm"
                            disabled={!pagination.next}
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserTable;