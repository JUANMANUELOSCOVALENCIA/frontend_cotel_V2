// src/core/permissions/pages/users/index.jsx
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoAddOutline, IoRefreshOutline } from 'react-icons/io5';
import permissionService from '../../services/permissionService';
import { usePermissions } from '../../hooks/usePermissions';
import { PageHeader, Card, Button, SearchInput, SelectInput, Pager } from '../../../../shared/components/ui';
import UserTable from './userTable';
import { UserFormModal, UserConfirmModal, CredencialesModal } from './userDialogs';

const PAGE_SIZE = 20;
const FILTROS_INICIALES = { search: '', rol: '', tipo: '', is_active: '', eliminados: '' };

const Users = () => {
    const { hasPermission, isSuperuser } = usePermissions();
    const can = useCallback((r, a) => isSuperuser || hasPermission(r, a), [isSuperuser, hasPermission]);

    const [users, setUsers] = useState([]);
    const [count, setCount] = useState(0);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState(FILTROS_INICIALES);

    const [form, setForm] = useState({ open: false, mode: 'create', user: null });
    const [confirm, setConfirm] = useState({ action: null, user: null, loading: false });
    const [creado, setCreado] = useState(null);

    // ---------- Carga ----------
    const loadUsers = useCallback(async () => {
        setLoading(true);
        const params = {
            page,
            page_size: PAGE_SIZE,
            search: filters.search,
            rol: filters.rol,
            tipo: filters.tipo,
            is_active: filters.is_active,
        };
        if (filters.eliminados === 'incluir') params.with_deleted = 'true';
        if (filters.eliminados === 'solo') params.eliminados_only = 'true';

        const result = await permissionService.getUsers(params);
        if (result.success) {
            setUsers(result.data.results || result.data || []);
            setCount(result.data.count ?? (result.data.results || result.data || []).length);
        } else {
            toast.error(result.error || 'Error al cargar usuarios');
        }
        setLoading(false);
    }, [page, filters]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    useEffect(() => {
        permissionService.getRoles({ page_size: 100 }).then((r) => {
            if (r.success) setRoles(r.data.results || r.data || []);
        });
    }, []);

    const setFilter = (k) => (v) => {
        setPage(1);
        setFilters((f) => ({ ...f, [k]: v }));
    };
    const hayFiltros = Object.values(filters).some(Boolean);

    // ---------- Crear / editar ----------
    const handleSubmit = async (data) => {
        const result = form.mode === 'edit'
            ? await permissionService.updateUser(form.user.id, data)
            : await permissionService.createUser(data);

        if (!result.success) {
            toast.error(result.error || 'No se pudo guardar');
            return;
        }
        setForm({ open: false, mode: 'create', user: null });
        if (form.mode === 'edit') {
            toast.success('Usuario actualizado');
        } else {
            setCreado(result.data);
        }
        loadUsers();
    };

    // ---------- Acciones ----------
    const ejecutar = async () => {
        const { action, user } = confirm;
        const fn = {
            activate: () => permissionService.activateUser(user.id),
            deactivate: () => permissionService.deactivateUser(user.id),
            delete: () => permissionService.deleteUser(user.id),
            restore: () => permissionService.restoreUser(user.id),
            resetPassword: () => permissionService.resetUserPassword(user.id, { motivo: 'Reseteo solicitado por administrador' }),
            unlock: () => permissionService.unlockUser(user.id),
        }[action];
        setConfirm((c) => ({ ...c, loading: true }));
        const result = await fn();
        setConfirm({ action: null, user: null, loading: false });
        if (result.success) {
            toast.success(result.message || 'Listo');
            loadUsers();
        } else {
            toast.error(result.error);
        }
    };

    const cambiarRol = async (user, rol) => {
        const result = await permissionService.changeUserRole(user.id, { rol_id: rol.id });
        if (result.success) {
            toast.success(`${user.nombre_completo} ahora es ${rol.nombre}`);
            loadUsers();
        } else {
            toast.error(result.error);
        }
    };

    const emptyText = filters.search
        ? `No hay usuarios que coincidan con "${filters.search}"`
        : filters.eliminados === 'solo' ? 'No hay usuarios eliminados' : 'No se encontraron usuarios';

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión de usuarios"
                subtitle="Usuarios del sistema, sus roles y estado de acceso"
                actions={
                    <>
                        <Button variant="secondary" icon={IoRefreshOutline} onClick={loadUsers} disabled={loading}>Actualizar</Button>
                        {can('usuarios', 'crear') && (
                            <Button icon={IoAddOutline} onClick={() => setForm({ open: true, mode: 'create', user: null })}>Nuevo usuario</Button>
                        )}
                    </>
                }
            />

            {/* Filtros */}
            <Card className="p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
                    <SearchInput
                        className="lg:col-span-2"
                        value={filters.search}
                        onChange={setFilter('search')}
                        delay={350}
                        placeholder="Nombre, apellido o código COTEL"
                    />
                    <SelectInput value={filters.rol} onChange={(e) => setFilter('rol')(e.target.value)}>
                        <option value="">Todos los roles</option>
                        {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </SelectInput>
                    <SelectInput value={filters.tipo} onChange={(e) => setFilter('tipo')(e.target.value)}>
                        <option value="">Todos los tipos</option>
                        <option value="manual">Manual</option>
                        <option value="migrado">Migrado</option>
                    </SelectInput>
                    <SelectInput value={filters.is_active} onChange={(e) => setFilter('is_active')(e.target.value)}>
                        <option value="">Todo estado</option>
                        <option value="true">Solo activos</option>
                        <option value="false">Solo inactivos</option>
                    </SelectInput>
                    <SelectInput value={filters.eliminados} onChange={(e) => setFilter('eliminados')(e.target.value)}>
                        <option value="">Sin eliminados</option>
                        <option value="incluir">Incluir eliminados</option>
                        <option value="solo">Solo eliminados</option>
                    </SelectInput>
                </div>
                {hayFiltros && (
                    <button
                        type="button"
                        onClick={() => { setPage(1); setFilters(FILTROS_INICIALES); }}
                        className="mt-3 text-sm font-medium text-orange-600 hover:text-orange-700"
                    >
                        Limpiar filtros
                    </button>
                )}
            </Card>

            {/* Tabla */}
            <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <p className="font-semibold text-gray-800">Usuarios <span className="font-normal text-gray-500">({count})</span></p>
                </div>
                <UserTable
                    users={users}
                    roles={roles}
                    loading={loading}
                    can={can}
                    emptyText={emptyText}
                    onEdit={(u) => setForm({ open: true, mode: 'edit', user: u })}
                    onAction={(action, user) => setConfirm({ action, user, loading: false })}
                    onChangeRole={cambiarRol}
                />
                <Pager page={page} pageSize={PAGE_SIZE} count={count} onChange={setPage} />
            </Card>

            <UserFormModal
                open={form.open}
                mode={form.mode}
                user={form.user}
                roles={roles}
                onClose={() => setForm({ open: false, mode: 'create', user: null })}
                onSubmit={handleSubmit}
            />
            <UserConfirmModal
                action={confirm.action}
                user={confirm.user}
                loading={confirm.loading}
                onClose={() => !confirm.loading && setConfirm({ action: null, user: null, loading: false })}
                onConfirm={ejecutar}
            />
            <CredencialesModal user={creado} onClose={() => setCreado(null)} />
        </div>
    );
};

export default Users;
