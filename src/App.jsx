import React, { useContext } from 'react';
import { ThemeProvider } from '@material-tailwind/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './core/auth/context/AuthContext';

// Componentes principales
import Login from './core/auth/components/Login';
import ChangePassword from './core/auth/components/ChangePassword';
import Migration from './core/auth/pages/Migration';
import Dashboard from './core/layout/pages/Dashboard';
import Layout from './core/layout/Layout';
import Loader from './core/layout/Loader';

// Páginas de gestión
import Users from './core/permissions/pages/users/index.jsx';
import Roles from './core/permissions/pages/roles/index.jsx';
import Permissions from './core/permissions/pages/permissions/index.jsx';
import Profile from './core/auth/pages/Profile';
import EmployeeMigration from "./core/permissions/pages/employeeMigration/index.jsx";
import AlmacenesPage from "./core/almacenes/pages/almacenes/index.jsx";
import MarcasPage from "./core/almacenes/pages/marcas/index.jsx";
import LotesPage from "./core/almacenes/pages/lotes/index.jsx";
import ONUsList from "./core/almacenes/pages/almacenes/ONUsList.jsx";
import ModelosPage from "./core/almacenes/pages/modelos/index.jsx";
import ProveedoresPage from "./core/almacenes/pages/provedores/index.jsx";

function App() {
    const { isAuthenticated, loading, user } = useContext(AuthContext);

    // Mostrar loader mientras se inicializa
    if (loading) {
        console.log('🔄 App: Mostrando loader, loading =', loading);
        return <Loader />;
    }

    console.log('🏠 App: Renderizando, isAuthenticated =', isAuthenticated);
    console.log('🏠 App: Usuario =', user);

    return (
        <ThemeProvider>
            <Routes>
                {/* Rutas públicas */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
                    }
                />
                <Route
                    path="/migration"
                    element={
                        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Migration />
                    }
                />

                {/* Cambio de contraseña - requiere estar autenticado */}
                <Route
                    path="/change-password"
                    element={
                        !isAuthenticated ? (
                            <Navigate to="/login" replace />
                        ) : user?.password_changed && !user?.password_reset_required ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <ChangePassword />
                        )
                    }
                />

                {/* Rutas protegidas */}
                <Route
                    path="/"
                    element={
                        !isAuthenticated ? (
                            <Navigate to="/login" replace />
                        ) : (!user?.password_changed || user?.password_reset_required) ? (
                            <Navigate to="/change-password" replace />
                        ) : (
                            <Layout />
                        )
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="usuarios/usuarios" element={<Users />} />
                    <Route path="usuarios/roles" element={<Roles />} />
                    <Route path="usuarios/permisos" element={<Permissions />} />
                    <Route path="usuarios/migracion" element={<EmployeeMigration />} />
                    <Route path="almacenes/almacen" element={<AlmacenesPage />} />
                    <Route path="almacenes/marcas" element={<MarcasPage />} />
                    <Route path="almacenes/lotes" element={<LotesPage />} />
                    <Route path="almacenes/onus" element={<ONUsList />} />
                    <Route path="almacenes/modelos" element={<ModelosPage />} />
                    <Route path="almacenes/proveedores" element={<ProveedoresPage />} />

                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#f97316', // Naranja empresa
                            color: '#fff',
                        },
                    },
                    error: {
                        duration: 5000,
                        style: {
                            background: '#6b7280', // Plomo empresa
                            color: '#fff',
                        },
                    },
                }}
            />
        </ThemeProvider>
    );
}

export default App;