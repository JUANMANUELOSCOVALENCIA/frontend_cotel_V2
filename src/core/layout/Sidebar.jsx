// src/core/layout/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { IoChevronDown, IoChevronBack, IoClose } from 'react-icons/io5';
import { usePermissions } from '../permissions/hooks/usePermissions';
import { navItems } from './navConfig';
import logo from '../../assets/login-2.png';

const Sidebar = ({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) => {
    const location = useLocation();
    const { hasAnyPermission, isSuperuser } = usePermissions();

    const canSee = (perms) => !perms || perms.length === 0 || isSuperuser || hasAnyPermission(perms);

    // Filtrar menú según permisos
    const visibleItems = navItems
        .filter((item) => canSee(item.permissions))
        .map((item) => {
            if (!item.children) return item;
            const children = item.children.filter((c) => c.section || canSee(c.permissions));
            // Quitar títulos de sección que quedaron sin elementos
            const cleaned = children.filter((c, i) => {
                if (!c.section) return true;
                const next = children[i + 1];
                return next && !next.section;
            });
            return { ...item, children: cleaned };
        })
        .filter((item) => !item.children || item.children.some((c) => !c.section));

    const groupIsActive = (item) =>
        (item.children || []).some((c) => c.href && location.pathname === c.href);

    // Grupos abiertos: se abre automáticamente el grupo de la ruta actual
    const [openGroups, setOpenGroups] = useState(() =>
        Object.fromEntries(navItems.filter(groupIsActive).map((i) => [i.label, true]))
    );

    useEffect(() => {
        const active = navItems.find(groupIsActive);
        if (active) setOpenGroups((prev) => ({ ...prev, [active.label]: true }));
        onCloseMobile?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const toggleGroup = (label) => {
        if (collapsed) {
            onToggleCollapse();
            setOpenGroups((prev) => ({ ...prev, [label]: true }));
            return;
        }
        setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const linkBase =
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors';
    const linkIdle = 'text-gray-300 hover:bg-white/5 hover:text-white';
    const linkActive = 'bg-orange-500 text-white shadow-sm shadow-orange-900/40';

    return (
        <>
            {/* Fondo oscuro en móvil */}
            <div
                className={`fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden ${
                    mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                onClick={onCloseMobile}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900 text-gray-100 transition-all duration-300
                    ${collapsed ? 'lg:w-20' : 'lg:w-64'} w-64
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
                    <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
                        <img src={logo} alt="COTEL" className="h-9 w-9 shrink-0 rounded-lg bg-white object-contain p-1" />
                        <div className={`leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
                            <p className="whitespace-nowrap text-base font-bold text-white">COTEL R.L.</p>
                            <p className="whitespace-nowrap text-xs text-gray-400">Sistema de gestión</p>
                        </div>
                    </Link>
                    <button
                        onClick={onCloseMobile}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
                        aria-label="Cerrar menú"
                    >
                        <IoClose className="h-5 w-5" />
                    </button>
                </div>

                {/* Navegación */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;

                        if (!item.children) {
                            return (
                                <NavLink
                                    key={item.label}
                                    to={item.href}
                                    title={collapsed ? item.label : undefined}
                                    className={({ isActive }) =>
                                        `${linkBase} ${isActive ? linkActive : linkIdle} ${collapsed ? 'lg:justify-center' : ''}`
                                    }
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
                                </NavLink>
                            );
                        }

                        const isOpen = !!openGroups[item.label] && !collapsed;
                        const active = groupIsActive(item);

                        return (
                            <div key={item.label}>
                                <button
                                    onClick={() => toggleGroup(item.label)}
                                    title={collapsed ? item.label : undefined}
                                    className={`${linkBase} w-full ${
                                        active ? 'text-orange-400' : linkIdle
                                    } ${collapsed ? 'lg:justify-center' : ''}`}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <span className={`flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                                    <IoChevronDown
                                        className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} ${
                                            collapsed ? 'lg:hidden' : ''
                                        }`}
                                    />
                                </button>

                                <div
                                    className={`grid transition-all duration-200 ${
                                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                    }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="ml-5 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                                            {item.children.map((child, idx) => {
                                                if (child.section) {
                                                    return (
                                                        <p
                                                            key={`s-${idx}`}
                                                            className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                                                        >
                                                            {child.section}
                                                        </p>
                                                    );
                                                }
                                                const ChildIcon = child.icon;
                                                return (
                                                    <NavLink
                                                        key={child.href}
                                                        to={child.href}
                                                        className={({ isActive }) =>
                                                            `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                                                                isActive
                                                                    ? 'bg-orange-500/15 font-semibold text-orange-400'
                                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                            }`
                                                        }
                                                    >
                                                        <ChildIcon className="h-4 w-4 shrink-0" />
                                                        {child.label}
                                                    </NavLink>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Botón colapsar (solo escritorio) */}
                <div className="hidden border-t border-white/10 p-3 lg:block">
                    <button
                        onClick={onToggleCollapse}
                        className={`${linkBase} w-full ${linkIdle} ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? 'Expandir menú' : 'Contraer menú'}
                    >
                        <IoChevronBack className={`h-5 w-5 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                        <span className={collapsed ? 'hidden' : ''}>Contraer menú</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
