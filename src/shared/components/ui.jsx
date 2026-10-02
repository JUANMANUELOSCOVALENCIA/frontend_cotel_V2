// src/shared/components/ui.jsx
// Componentes base con el diseño unificado del sistema (colores planos, sin degradados).
// Naranja = acción principal · Gris = neutro · Colores suaves (50/700) para estados.
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoCloseOutline, IoSearchOutline, IoChevronBack, IoChevronForward } from 'react-icons/io5';

export const cx = (...c) => c.filter(Boolean).join(' ');

// ---------- Botones ----------
const BTN = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'text-gray-600 hover:bg-gray-100',
    dark: 'bg-gray-800 text-white hover:bg-gray-900',
};

export const Button = ({ variant = 'primary', icon: Icon, loading, children, className, disabled, ...props }) => (
    <button
        type="button"
        disabled={disabled || loading}
        className={cx(
            'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50',
            BTN[variant],
            className
        )}
        {...props}
    >
        {loading ? <Spinner className="h-4 w-4" /> : Icon && <Icon className="h-4 w-4" />}
        {children}
    </button>
);

export const IconButton = ({ icon: Icon, title, tone = 'default', className, ...props }) => {
    const tones = {
        default: 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
        danger: 'text-gray-500 hover:bg-red-50 hover:text-red-600',
        primary: 'text-gray-500 hover:bg-orange-50 hover:text-orange-600',
    };
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            className={cx('rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30', tones[tone], className)}
            {...props}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
};

export const Spinner = ({ className = 'h-5 w-5' }) => (
    <svg className={cx('animate-spin', className)} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
);

// ---------- Etiquetas de estado ----------
const BADGE = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-50 text-green-700 ring-green-600/20',
    red: 'bg-red-50 text-red-700 ring-red-600/20',
    amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    orange: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
};

export const Badge = ({ color = 'gray', children, className }) => (
    <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-gray-500/10', BADGE[color], className)}>
        {children}
    </span>
);

// ---------- Contenedores ----------
export const Card = ({ className, children }) => (
    <div className={cx('rounded-xl border border-gray-200 bg-white shadow-sm', className)}>{children}</div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
);

export const StatCard = ({ label, value, tone = 'text-gray-800' }) => (
    <Card className="p-4">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={cx('text-2xl font-bold', tone)}>{value ?? '—'}</p>
    </Card>
);

export const EmptyState = ({ icon: Icon, title, children }) => (
    <div className="px-4 py-12 text-center">
        {Icon && <Icon className="mx-auto h-10 w-10 text-gray-300" />}
        <p className="mt-2 font-medium text-gray-600">{title}</p>
        {children && <div className="mt-1 text-sm text-gray-500">{children}</div>}
    </div>
);

// ---------- Formularios (etiqueta SIEMPRE arriba: nunca se superpone) ----------
export const inputCls =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 ' +
    'focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:bg-gray-100 disabled:text-gray-500';

export const Field = ({ label, required, error, hint, children, className }) => (
    <div className={className}>
        {label && (
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        {children}
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
);

export const TextInput = React.forwardRef(({ className, error, ...props }, ref) => (
    <input ref={ref} className={cx(inputCls, 'h-10', error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20', className)} {...props} />
));
TextInput.displayName = 'TextInput';

export const TextArea = React.forwardRef(({ className, rows = 3, ...props }, ref) => (
    <textarea ref={ref} rows={rows} className={cx(inputCls, 'resize-y', className)} {...props} />
));
TextArea.displayName = 'TextArea';

export const SelectInput = React.forwardRef(({ className, children, ...props }, ref) => (
    <select ref={ref} className={cx(inputCls, 'h-10 pr-8', className)} {...props}>{children}</select>
));
SelectInput.displayName = 'SelectInput';

export const Toggle = ({ checked, onChange, label, disabled }) => (
    <label className={cx('inline-flex cursor-pointer select-none items-center gap-3', disabled && 'cursor-not-allowed opacity-60')}>
        <span className={cx('relative h-6 w-11 rounded-full transition-colors', checked ? 'bg-orange-500' : 'bg-gray-300')}>
            <input type="checkbox" className="sr-only" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
            <span className={cx('absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-5')} />
        </span>
        {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
);

// Búsqueda: actualiza el texto al instante y avisa con retraso (no recarga la página)
export const SearchInput = ({ value, onChange, placeholder = 'Buscar…', delay = 0, className }) => {
    const [local, setLocal] = useState(value ?? '');
    useEffect(() => setLocal(value ?? ''), [value]);
    useEffect(() => {
        if (!delay) return undefined;
        const t = setTimeout(() => { if (local !== value) onChange(local); }, delay);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [local]);
    return (
        <div className={cx('relative', className)}>
            <IoSearchOutline className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
                value={local}
                onChange={(e) => { setLocal(e.target.value); if (!delay) onChange(e.target.value); }}
                placeholder={placeholder}
                className={cx(inputCls, 'h-10 pl-9 pr-8')}
            />
            {local && (
                <button type="button" onClick={() => { setLocal(''); onChange(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600" aria-label="Limpiar">
                    <IoCloseOutline className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

// ---------- Modal ----------
export const Modal = ({ open, onClose, title, subtitle, size = 'md', children, footer, busy }) => {
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => e.key === 'Escape' && !busy && onClose?.();
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }, [open, busy, onClose]);

    if (!open) return null;
    const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4" onMouseDown={() => !busy && onClose?.()}>
            <div
                role="dialog"
                aria-modal="true"
                className={cx('flex max-h-[90vh] w-full flex-col rounded-xl bg-white shadow-xl', widths[size])}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
                    <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-gray-800">{title}</h3>
                        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                    </div>
                    <button type="button" onClick={onClose} disabled={busy} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Cerrar">
                        <IoCloseOutline className="h-5 w-5" />
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
                {footer && <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">{footer}</div>}
            </div>
        </div>,
        document.body
    );
};

export const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmText = 'Confirmar', danger, loading }) => (
    <Modal
        open={open}
        onClose={onClose}
        title={title}
        size="sm"
        busy={loading}
        footer={
            <>
                <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmText}</Button>
            </>
        }
    >
        <div className="text-sm text-gray-600">{message}</div>
    </Modal>
);

// ---------- Menú desplegable (se dibuja fuera de la tabla para que no se corte) ----------
export const Dropdown = ({ trigger, items, align = 'right' }) => {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    useLayoutEffect(() => {
        if (!open || !btnRef.current) return;
        const r = btnRef.current.getBoundingClientRect();
        const menuH = menuRef.current?.offsetHeight || 0;
        const below = r.bottom + 4 + menuH < window.innerHeight;
        setPos({
            top: below ? r.bottom + 4 : r.top - menuH - 4,
            left: align === 'right' ? r.right : r.left,
        });
    }, [open, align]);

    useEffect(() => {
        if (!open) return undefined;
        const close = (e) => {
            if (!menuRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
        };
        const closeNow = () => setOpen(false);
        document.addEventListener('mousedown', close);
        window.addEventListener('scroll', closeNow, true);
        window.addEventListener('resize', closeNow);
        return () => {
            document.removeEventListener('mousedown', close);
            window.removeEventListener('scroll', closeNow, true);
            window.removeEventListener('resize', closeNow);
        };
    }, [open]);

    const visible = items.filter(Boolean);
    if (!visible.length) return null;

    return (
        <>
            <span ref={btnRef} onClick={() => setOpen((o) => !o)} className="inline-flex">{trigger}</span>
            {open && createPortal(
                <div
                    ref={menuRef}
                    style={{ top: pos.top, left: pos.left, transform: align === 'right' ? 'translateX(-100%)' : undefined }}
                    className="fixed z-[10000] min-w-[190px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                >
                    {visible.map((it, i) =>
                        it.divider ? (
                            <div key={`d${i}`} className="my-1 border-t border-gray-100" />
                        ) : it.header ? (
                            <p key={`h${i}`} className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{it.header}</p>
                        ) : (
                            <button
                                key={it.label}
                                type="button"
                                disabled={it.disabled}
                                onClick={() => { setOpen(false); it.onClick?.(); }}
                                className={cx(
                                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-40',
                                    it.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50',
                                    it.active && 'bg-orange-50 font-medium text-orange-700'
                                )}
                            >
                                {it.icon && <it.icon className="h-4 w-4" />}
                                {it.label}
                            </button>
                        )
                    )}
                </div>,
                document.body
            )}
        </>
    );
};

// ---------- Paginación simple ----------
export const Pager = ({ page, pageSize, count, onChange }) => {
    const pages = Math.max(1, Math.ceil((count || 0) / pageSize));
    const nums = useMemo(() => {
        const start = Math.max(1, Math.min(page - 2, pages - 4));
        return Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);
    }, [page, pages]);
    if (pages <= 1) return null;
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, count);
    return (
        <div className="flex flex-col items-center justify-between gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row">
            <p className="text-sm text-gray-500">{from}–{to} de {count}</p>
            <div className="flex items-center gap-1">
                <IconButton icon={IoChevronBack} title="Anterior" disabled={page <= 1} onClick={() => onChange(page - 1)} />
                {nums.map((n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onChange(n)}
                        className={cx('h-8 min-w-[2rem] rounded-lg px-2 text-sm', n === page ? 'bg-orange-500 font-semibold text-white' : 'text-gray-600 hover:bg-gray-100')}
                    >
                        {n}
                    </button>
                ))}
                <IconButton icon={IoChevronForward} title="Siguiente" disabled={page >= pages} onClick={() => onChange(page + 1)} />
            </div>
        </div>
    );
};

// Colores por acción de permiso (mismo criterio en todas las pantallas)
export const ACCION_COLOR = { crear: 'green', leer: 'blue', actualizar: 'amber', eliminar: 'red' };
export const ACCIONES = ['crear', 'leer', 'actualizar', 'eliminar'];
