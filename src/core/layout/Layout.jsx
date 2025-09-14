import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuthStatus } from '../auth/hooks/useAuth';
import Loader from './Loader';

const Layout = () => {
    const { isLoading } = useAuthStatus();

    if (isLoading) {
        return <Loader message="Cargando aplicación..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;