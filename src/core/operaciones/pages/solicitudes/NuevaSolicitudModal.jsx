// src/core/operaciones/pages/solicitudes/NuevaSolicitudModal.jsx
// Registro de una solicitud: tipo → cliente (por CI) → plan → ubicación en el mapa.
// Con cobertura se genera la OT al instante; sin cobertura queda registrada como demanda.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoCheckmarkCircle, IoAlertCircle, IoPersonCircleOutline, IoSearchOutline } from 'react-icons/io5';
import { Modal, Button, Field, TextInput, TextArea, SelectInput, Toggle, cx } from '../../../../shared/components/ui';
import { solicitudesService, planesApi, adicionalesApi } from '../../services/operacionesService';
import ServiciosSolicitud from '../../components/ServiciosSolicitud';
import UbicacionMapa from '../../components/UbicacionMapa';
import { zonaDe, direccionDe } from '../../components/mapa';
import { TIPOS, EstadoSolicitud, fechaCorta } from '../../components/opUi';

const VACIO = {
    tipo: 'INSTALACION', urgente: false,
    ci: '', nombres: '', apellidos: '', telefono: '', email: '',
    plan: '', plan_tv: '', cantidad_tv: 0, plan_telefonia: '', cantidad_lineas: 0, direccion: '', zona_referencia: '', referencia: '', observaciones: '',
    ubicacion: null,
};

const Seccion = ({ n, titulo, children }) => (
    <section className="space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs text-white">{n}</span>{titulo}
        </h4>
        {children}
    </section>
);

const bs = (n) => `Bs ${Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AvisoDeuda = ({ deuda, bloqueado, tipo }) => {
    if (!deuda.disponible) return <p className="rounded-lg bg-gray-100 px-3 py-2 text-gray-600">{deuda.mensaje}</p>;
    if (!deuda.facturas) {
        return <p className="flex items-center gap-2 text-xs text-green-700"><IoCheckmarkCircle className="h-4 w-4" />Sin deuda registrada{deuda.fecha_corte ? ` (corte ${fechaCorta(deuda.fecha_corte)})` : ''}</p>;
    }
    return (
        <div className={cx('rounded-xl border px-3 py-2', bloqueado ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-800')}>
            <p className="flex items-start gap-2 font-medium">
                <IoAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                    {deuda.facturas} factura(s) impaga(s) · {bs(deuda.monto)}
                    {bloqueado ? ` — no puede solicitar ${tipo?.toLowerCase()} hasta regularizar su deuda.` : deuda.bloquea ? ' — puede registrar este tipo de trabajo, pero no instalaciones ni traslados.' : ' — no bloquea.'}
                </span>
            </p>
            <ul className="mt-1 space-y-0.5 pl-7 text-xs">
                {deuda.contratos.map((c) => (
                    <li key={c.contrato} className={cx(c.bloquea && 'font-semibold')}>
                        Contrato {c.contrato} · {c.servicio}{c.anulado ? ' (anulado)' : ''} · {c.facturas} factura(s) · {bs(c.monto)}{c.bloquea ? ' · bloquea' : ''}
                    </li>
                ))}
            </ul>
            {deuda.fecha_corte && <p className="mt-1 pl-7 text-xs opacity-80">Datos al {fechaCorta(deuda.fecha_corte)}</p>}
        </div>
    );
};

const NuevaSolicitudModal = ({ open, zonas, onClose, onRegistrada }) => {
    const [v, setV] = useState(VACIO);
    const [errores, setErrores] = useState({});
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [planes, setPlanes] = useState([]);
    const [adicionales, setAdicionales] = useState([]);
    const [sugerida, setSugerida] = useState(null); // dirección que propone el mapa
    const actual = useRef(v);
    actual.current = v;
    const [busqueda, setBusqueda] = useState({ estado: 'inicial', cliente: null, solicitudes: [] }); // inicial | buscando | encontrado | nuevo

    useEffect(() => {
        if (!open) return;
        setV(VACIO); setErrores({}); setError(''); setSugerida(null); setBusqueda({ estado: 'inicial', cliente: null, solicitudes: [] });
        planesApi.listar({ activos: 'true' }).then((r) => r.success && setPlanes(r.data));
        adicionalesApi.listar({ activos: 'true' }).then((r) => r.success && setAdicionales(r.data));
    }, [open]);

    const set = (k) => (e) => {
        const valor = e?.target ? e.target.value : e;
        setV((x) => ({ ...x, [k]: valor }));
        setErrores((x) => ({ ...x, [k]: '' }));
    };

    const buscarCliente = async () => {
        const ci = v.ci.replace(/\s+/g, '').toUpperCase();
        if (ci.length < 4) { setErrores((x) => ({ ...x, ci: 'Escribe el CI completo' })); return; }
        setBusqueda((b) => ({ ...b, estado: 'buscando' }));
        const r = await solicitudesService.cliente(ci);
        if (!r.success) { setBusqueda({ estado: 'inicial', cliente: null, solicitudes: [] }); toast.error(r.error); return; }
        const c = r.data.cliente;
        if (c) {
            setV((x) => ({ ...x, ci, nombres: c.nombres, apellidos: c.apellidos, telefono: c.telefono || '', email: c.email || '' }));
            setBusqueda({ estado: 'encontrado', cliente: c, solicitudes: r.data.solicitudes, deuda: r.data.deuda });
        } else {
            setV((x) => ({ ...x, ci, nombres: '', apellidos: '', telefono: '', email: '' }));
            setBusqueda({ estado: 'nuevo', cliente: null, solicitudes: [], deuda: r.data.deuda });
        }
    };

    const usarUbicacionDe = (s) => setV((x) => ({
        ...x, ubicacion: s.ubicacion, direccion: s.direccion, zona_referencia: s.zona_referencia || x.zona_referencia,
    }));

    // Al marcar el punto: calle y barrio desde el mapa. Si los campos están vacíos se llenan;
    // si ya escribiste algo, queda como sugerencia para no pisarlo.
    useEffect(() => {
        if (!v.ubicacion) return undefined;
        const ctrl = new AbortController();
        const t = setTimeout(() => {
            direccionDe(v.ubicacion.lat, v.ubicacion.lng, ctrl.signal).then((d) => {
                const x = actual.current;
                if (!d.direccion && !d.zona) { setSugerida(null); return; }
                if (!x.direccion.trim() && !x.zona_referencia.trim()) {
                    setSugerida(null);
                    setV((y) => ({ ...y, direccion: d.direccion, zona_referencia: d.zona }));
                } else {
                    setSugerida(d.direccion === x.direccion && d.zona === x.zona_referencia ? null : d);
                }
            }).catch(() => {});
        }, 400);
        return () => { clearTimeout(t); ctrl.abort(); };
    }, [v.ubicacion]);

    const tipo = TIPOS.find((t) => t.codigo === v.tipo);
    const necesitaCobertura = ['INSTALACION', 'TRASLADO'].includes(v.tipo);
    const zona = useMemo(() => (v.ubicacion ? zonaDe(zonas, v.ubicacion.lat, v.ubicacion.lng) : null), [zonas, v.ubicacion]);
    const clienteListo = busqueda.estado === 'encontrado' || busqueda.estado === 'nuevo';
    const anterior = busqueda.solicitudes.find((s) => s.estado.codigo !== 'ANULADA');
    const deuda = clienteListo ? busqueda.deuda : null;
    const bloqueadoPorDeuda = !!(deuda?.bloquea && deuda.tipos_bloqueados?.includes(v.tipo));

    const validar = () => {
        const e = {};
        if (!clienteListo) e.ci = 'Busca primero al cliente por su CI';
        if (bloqueadoPorDeuda) e.deuda = deuda.mensaje;
        if (busqueda.estado === 'nuevo') {
            if (!v.nombres.trim()) e.nombres = 'Obligatorio';
            if (!v.apellidos.trim()) e.apellidos = 'Obligatorio';
        }
        if (!/^[0-9+\-\s()]{7,20}$/.test(v.telefono.trim())) e.telefono = 'Teléfono no válido';
        if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Correo no válido';
        if (v.tipo === 'INSTALACION' && !v.plan) e.plan = 'Elige el plan';
        if (!v.ubicacion) e.ubicacion = 'Marca la ubicación en el mapa';
        if (v.direccion.trim().length < 5) e.direccion = 'Escribe la dirección completa';
        setErrores(e);
        return !Object.keys(e).length;
    };

    const registrar = async () => {
        setError('');
        if (!validar()) { setError('Revisa los campos marcados.'); return; }
        setGuardando(true);
        const r = await solicitudesService.registrar({
            tipo: v.tipo,
            prioridad: v.urgente ? 'ALTA' : 'NORMAL',
            cliente: { ci: v.ci, nombres: v.nombres.trim(), apellidos: v.apellidos.trim(), telefono: v.telefono.trim(), email: v.email.trim() },
            plan: v.tipo === 'INSTALACION' ? Number(v.plan) : null,
            plan_tv: v.tipo === 'INSTALACION' && v.plan_tv ? Number(v.plan_tv) : null,
            cantidad_tv: v.tipo === 'INSTALACION' && v.plan_tv ? Number(v.cantidad_tv) : 0,
            plan_telefonia: v.tipo === 'INSTALACION' && v.plan_telefonia ? Number(v.plan_telefonia) : null,
            cantidad_lineas: v.tipo === 'INSTALACION' && v.plan_telefonia ? Number(v.cantidad_lineas) : 0,
            direccion: v.direccion.trim(),
            zona_referencia: v.zona_referencia.trim(),
            referencia: v.referencia.trim(),
            latitud: v.ubicacion.lat.toFixed(6),
            longitud: v.ubicacion.lng.toFixed(6),
            observaciones: v.observaciones.trim(),
        });
        setGuardando(false);
        if (!r.success) {
            const anidados = r.data?.cliente && typeof r.data.cliente === 'object' && !Array.isArray(r.data.cliente)
                ? Object.fromEntries(Object.entries(r.data.cliente).map(([k, x]) => [k, [].concat(x).join(' ')])) : {};
            setErrores({ ...r.fieldErrors, ...anidados, ...(r.fieldErrors?.latitud ? { ubicacion: r.fieldErrors.latitud } : {}) });
            const textos = Object.values({ ...r.fieldErrors, ...anidados }).filter((t) => t && typeof t === 'string');
            setError(textos.length ? textos.join(' ') : r.error);
            return;
        }
        toast.success(r.data.message, { duration: 6000 });
        onRegistrada(r.data);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={guardando}
            size="xl"
            title="Nueva solicitud"
            subtitle="Al registrarla se genera la orden de trabajo si la ubicación tiene cobertura"
            footer={(
                <>
                    <Button variant="ghost" onClick={onClose} disabled={guardando}>Cancelar</Button>
                    <Button onClick={registrar} loading={guardando} disabled={bloqueadoPorDeuda}>
                        {v.ubicacion && necesitaCobertura && !zona ? 'Registrar sin cobertura' : 'Registrar y generar OT'}
                    </Button>
                </>
            )}
        >
            <div className="space-y-6 text-sm">
                {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div>}

                <Seccion n={1} titulo="¿Qué necesita el cliente?">
                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                        {TIPOS.map((t) => (
                            <button key={t.codigo} type="button" onClick={() => set('tipo')(t.codigo)}
                                className={cx('rounded-xl border p-3 text-left transition-colors',
                                    v.tipo === t.codigo ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-gray-300')}>
                                <p className="font-semibold text-gray-800">{t.corto}</p>
                                <p className="mt-0.5 text-xs text-gray-500">{t.ayuda}</p>
                            </button>
                        ))}
                    </div>
                    {errores.tipo && <p className="text-xs text-red-600">{errores.tipo}</p>}
                    <Toggle checked={v.urgente} onChange={set('urgente')} label="Urgente (se atiende antes que las demás)" />
                </Seccion>

                <Seccion n={2} titulo="Cliente">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                        <Field label="CI" required error={errores.ci} className="sm:w-60">
                            <TextInput value={v.ci} error={errores.ci} maxLength={15} placeholder="Ej: 6012345 o 6012345-1A"
                                onChange={(e) => { set('ci')(e.target.value.toUpperCase()); if (busqueda.estado !== 'inicial') setBusqueda({ estado: 'inicial', cliente: null, solicitudes: [] }); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscarCliente(); } }} />
                        </Field>
                        <Button variant="secondary" icon={IoSearchOutline} className="sm:mt-6" onClick={buscarCliente} loading={busqueda.estado === 'buscando'}>Buscar</Button>
                    </div>

                    {busqueda.estado === 'encontrado' && (
                        <div className="rounded-xl border border-gray-200 p-3">
                            <p className="flex items-center gap-2 font-medium text-gray-800"><IoPersonCircleOutline className="h-5 w-5 text-gray-400" />{busqueda.cliente.nombre_completo}</p>
                            {busqueda.solicitudes.length > 0 && (
                                <ul className="mt-2 space-y-1 text-xs text-gray-600">
                                    {busqueda.solicitudes.map((s) => (
                                        <li key={s.id} className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono">{s.numero}</span>{s.tipo.nombre} · {fechaCorta(s.created_at)} <EstadoSolicitud estado={s.estado} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    {busqueda.estado === 'nuevo' && <p className="text-xs text-gray-500">Cliente nuevo: completa sus datos.</p>}
                    {deuda && <AvisoDeuda deuda={deuda} bloqueado={bloqueadoPorDeuda} tipo={tipo?.corto} />}

                    {clienteListo && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {busqueda.estado === 'nuevo' && (
                                <>
                                    <Field label="Nombres" required error={errores.nombres}><TextInput value={v.nombres} onChange={set('nombres')} maxLength={100} error={errores.nombres} /></Field>
                                    <Field label="Apellidos" required error={errores.apellidos}><TextInput value={v.apellidos} onChange={set('apellidos')} maxLength={100} error={errores.apellidos} /></Field>
                                </>
                            )}
                            <Field label="Teléfono de contacto" required error={errores.telefono}><TextInput type="tel" value={v.telefono} onChange={set('telefono')} maxLength={20} error={errores.telefono} placeholder="Ej: 71234567" /></Field>
                            <Field label="Correo" error={errores.email}><TextInput type="email" value={v.email} onChange={set('email')} error={errores.email} /></Field>
                        </div>
                    )}
                </Seccion>

                {v.tipo === 'INSTALACION' && (
                    <Seccion n={3} titulo="Plan y servicios">
                        <ServiciosSolicitud planes={planes} adicionales={adicionales} v={v} set={set} errores={errores} />
                    </Seccion>
                )}

                <Seccion n={v.tipo === 'INSTALACION' ? 4 : 3} titulo={v.tipo === 'TRASLADO' ? 'Nueva ubicación' : 'Ubicación'}>
                    {anterior && v.tipo !== 'INSTALACION' && (
                        <button type="button" onClick={() => usarUbicacionDe(anterior)} className="text-sm font-medium text-orange-600 hover:underline">
                            Usar la ubicación de {anterior.numero} ({anterior.direccion})
                        </button>
                    )}
                    <UbicacionMapa zonas={zonas} valor={v.ubicacion} alto="h-72"
                        color={!v.ubicacion || zona ? '#F97316' : '#B45309'}
                        onChange={(lat, lng) => { setV((x) => ({ ...x, ubicacion: { lat, lng } })); setErrores((x) => ({ ...x, ubicacion: '' })); }} />
                    {errores.ubicacion && <p className="text-xs text-red-600">{errores.ubicacion}</p>}
                    {v.ubicacion && (zona ? (
                        <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-green-800">
                            <IoCheckmarkCircle className="h-5 w-5 shrink-0" />Dentro de la zona <strong>{zona.nombre}</strong>
                        </p>
                    ) : necesitaCobertura ? (
                        <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
                            <IoAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                            <span>Fuera de cobertura. Se registrará como <strong>sin cobertura</strong> (no se genera OT); queda como demanda para cuando se amplíe la red.</span>
                        </p>
                    ) : (
                        <p className="rounded-lg bg-gray-50 px-3 py-2 text-gray-600">Fuera de las zonas registradas. Para {tipo?.corto.toLowerCase()} igual se genera la OT.</p>
                    ))}
                    {sugerida && (
                        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-blue-800">
                            <span>Según el mapa: <strong>{[sugerida.direccion, sugerida.zona].filter(Boolean).join(', ')}</strong></span>
                            <button type="button" className="font-semibold underline" onClick={() => { setV((x) => ({ ...x, direccion: sugerida.direccion || x.direccion, zona_referencia: sugerida.zona || x.zona_referencia })); setSugerida(null); }}>
                                Usar esta dirección
                            </button>
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Field label="Dirección" required error={errores.direccion} className="sm:col-span-2" hint="Completa el número de casa, piso o departamento">
                            <TextInput value={v.direccion} onChange={set('direccion')} maxLength={255} error={errores.direccion} placeholder="Calle, número, edificio / piso" />
                        </Field>
                        <Field label="Zona / barrio"><TextInput value={v.zona_referencia} onChange={set('zona_referencia')} maxLength={100} placeholder="Ej: Sopocachi" /></Field>
                        <Field label="Referencias del domicilio" className="sm:col-span-3" hint="Lo verá el técnico en la orden de trabajo">
                            <TextArea rows={3} value={v.referencia} onChange={set('referencia')} placeholder="Ej: casa de 2 pisos, garaje color café, frente a la tienda Doña Rosa; tocar el timbre de arriba" />
                        </Field>
                    </div>
                </Seccion>

                <Field label="Observaciones">
                    <TextArea rows={2} value={v.observaciones} onChange={set('observaciones')} placeholder={v.tipo === 'REPARACION' ? 'Describe la falla que reporta el cliente' : 'Notas del trámite (opcional)'} />
                </Field>
            </div>
        </Modal>
    );
};

export default NuevaSolicitudModal;
