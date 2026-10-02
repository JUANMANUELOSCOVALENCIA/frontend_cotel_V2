// src/core/auth/components/AuthLayout.jsx
// Marco común de las pantallas de acceso (login, cambio de contraseña, alta de usuario).
// Mismo estilo que el resto del sistema: colores planos, panel oscuro como el menú lateral.
import React, { useState } from 'react';
import { IoEyeOutline, IoEyeOffOutline, IoCheckmarkCircle, IoEllipseOutline } from 'react-icons/io5';
import logo from '../../../assets/login-2.png';
import { inputCls, cx } from '../../../shared/components/ui';

export const AuthLayout = ({ title, subtitle, children, footer }) => (
    <div className="flex min-h-screen bg-gray-50">
        {/* Panel de marca (solo pantallas grandes) */}
        <aside className="hidden w-[42%] max-w-xl flex-col justify-between bg-gray-900 p-10 text-white lg:flex">
            <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-1.5"><img src={logo} alt="COTEL R.L." className="h-9 w-9 object-contain" /></div>
                <div>
                    <p className="font-bold">COTEL R.L.</p>
                    <p className="text-xs text-gray-400">Sistema de gestión</p>
                </div>
            </div>
            <div className="space-y-4">
                <div className="inline-block rounded-2xl bg-white px-8 py-6"><img src={logo} alt="" className="h-28 w-auto object-contain" /></div>
                <h1 className="text-3xl font-bold leading-tight">Inventario y operación<br />de la red de fibra óptica</h1>
                <p className="max-w-sm text-gray-400">Equipos ONU, materiales, laboratorio y almacenes en un solo lugar.</p>
            </div>
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} COTEL R.L. · Telecomunicaciones</p>
        </aside>

        {/* Formulario */}
        <main className="flex flex-1 items-center justify-center px-4 py-10">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex justify-center lg:hidden">
                    <img src={logo} alt="COTEL R.L." className="h-20 w-auto object-contain" />
                </div>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
                </div>
                {children}
                {footer && <div className="mt-8 text-center text-sm text-gray-500">{footer}</div>}
            </div>
        </main>
    </div>
);

// Campo de contraseña con botón para mostrar/ocultar
export const PasswordInput = React.forwardRef(({ error, className, ...props }, ref) => {
    const [ver, setVer] = useState(false);
    return (
        <div className="relative">
            <input
                ref={ref}
                type={ver ? 'text' : 'password'}
                className={cx(inputCls, 'h-11 pr-10', error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20', className)}
                {...props}
            />
            <button
                type="button"
                tabIndex={-1}
                onClick={() => setVer((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
                aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
                {ver ? <IoEyeOffOutline className="h-5 w-5" /> : <IoEyeOutline className="h-5 w-5" />}
            </button>
        </div>
    );
});
PasswordInput.displayName = 'PasswordInput';

// Mensaje de error general del formulario
export const AuthError = ({ children }) => (children ? (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{children}</div>
) : null);

// Lista de requisitos que se marcan a medida que se cumplen
export const Requisitos = ({ items }) => (
    <ul className="space-y-1 text-sm">
        {items.map((r) => (
            <li key={r.texto} className={cx('flex items-center gap-2', r.ok ? 'text-green-700' : 'text-gray-500')}>
                {r.ok ? <IoCheckmarkCircle className="h-4 w-4 shrink-0" /> : <IoEllipseOutline className="h-4 w-4 shrink-0" />}
                {r.texto}
            </li>
        ))}
    </ul>
);
