import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStatus } from '../auth/hooks/useAuth';
import Loader from './Loader';

const COLLAPSE_KEY = 'sidebar_collapsed';

const readCollapsed = () => {
    try {
        return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
        return false;
    }
};

const Layout = () => {
    const { isLoading } = useAuthStatus();
    const [collapsed, setCollapsed] = useState(readCollapsed);
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleCollapse = () => {
        setCollapsed((prev) => {
            try {
                localStorage.setItem(COLLAPSE_KEY, prev ? '0' : '1');
            } catch {
                /* sin almacenamiento disponible */
            }
            return !prev;
        });
    };

    if (isLoading) {
        return <Loader message="Cargando aplicación..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar
                collapsed={collapsed}
                onToggleCollapse={toggleCollapse}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />

            <div className={`flex min-h-screen flex-col transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                <Topbar onOpenMobile={() => setMobileOpen(true)} />
                <main className="flex-1 px-4 py-6 lg:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
