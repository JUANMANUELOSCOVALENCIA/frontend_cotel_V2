// src/core/layout/Topbar.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    IoMenu,
    IoChevronDown,
    IoChevronForward,
    IoPersonCircleOutline,
    IoKeyOutline,
    IoLogOutOutline,
    IoWarningOutline,
} from 'react-icons/io5';
import { useAuth, useUser, useLogout } from '../auth/hooks/useAuth';
import { findRouteInfo } from './navConfig';

const getInitials = (user) =>
    `${user?.nombres?.[0] || ''}${user?.apellidopaterno?.[0] || ''}`.toUpperCase() || 'U';

const Topbar = ({ onOpenMobile }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { requiresPasswordChange } = useAuth();
    const { user, fullName } = useUser();
    const { logout } = useLogout();

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const { title, parent } = findRouteInfo(location.pathname);

    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const go = (href) => {
        setMenuOpen(false);
        navigate(href);
    };

    const handleLogout = async () => {
        setMenuOpen(false);
        await logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur lg:px-6">
            {/* Botón menú (móvil) */}
            <button
                onClick={onOpenMobile}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                aria-label="Abrir menú"
            >
                <IoMenu className="h-6 w-6" />
            </button>

            {/* Título / ruta actual */}
            <div className="min-w-0 flex-1">
                {parent && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>{parent}</span>
                        <IoChevronForward className="h-3 w-3" />
                    </div>
                )}
                <h1 className="truncate text-base font-semibold text-gray-800 lg:text-lg">{title}</h1>
            </div>

            {requiresPasswordChange && (
                <button
                    onClick={() => navigate('/change-password')}
                    className="hidden items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-200 md:flex"
                >
                    <IoWarningOutline className="h-4 w-4" />
                    Cambio de contraseña requerido
                </button>
            )}

            {/* Menú de usuario */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-gray-100"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                        {getInitials(user)}
                    </span>
                    <span className="hidden text-left leading-tight sm:block">
                        <span className="block text-sm font-semibold text-gray-800">{user?.nombres}</span>
                        <span className="block text-xs text-gray-500">{user?.rol || 'Sin rol'}</span>
                    </span>
                    <IoChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                            <p className="truncate text-sm font-semibold text-gray-800">{fullName}</p>
                            <p className="text-xs text-gray-500">Código COTEL: {user?.codigocotel}</p>
                        </div>
                        <div className="p-1.5">
                            <button
                                onClick={() => go('/profile')}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                            >
                                <IoPersonCircleOutline className="h-5 w-5" /> Mi perfil
                            </button>
                            <button
                                onClick={() => go('/change-password')}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                            >
                                <IoKeyOutline className="h-5 w-5" /> Cambiar contraseña
                            </button>
                        </div>
                        <div className="border-t border-gray-100 p-1.5">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <IoLogOutOutline className="h-5 w-5" /> Cerrar sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Topbar;
