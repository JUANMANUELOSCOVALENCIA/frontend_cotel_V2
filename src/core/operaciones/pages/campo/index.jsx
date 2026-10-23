// src/core/operaciones/pages/campo/index.jsx
// Mis trabajos (app de campo, pensada para el celular): OT de la cuadrilla del técnico para el día,
// en el orden de la hoja de ruta, más las pendientes de días anteriores y lo que la cuadrilla tiene a cargo.
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoRefreshOutline, IoChevronForward, IoCubeOutline, IoPhonePortraitOutline } from 'react-icons/io5';
import { PageHeader, Card, Button, EmptyState, Spinner, Badge, cx } from '../../../../shared/components/ui';
import { campoService } from '../../services/operacionesService';
import { EstadoOT, PlazoChip, Prioridad, ServiciosChips, fechaCorta, fechaLarga, hoyISO, integrantesTexto } from '../../components/opUi';
import OtCampoModal from './OtCampoModal';
import { MSG_HTTPS, ORIGEN_SEGURO } from '../../components/campoUi';

const HECHAS = ['EJECUTADA', 'VERIFICADA', 'CERRADA', 'NO_EJECUTADA'];

const Tarjeta = ({ ot, n, onAbrir }) => (
    <button type="button" onClick={() => onAbrir(ot.id)}
        className={cx('flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-orange-50', HECHAS.includes(ot.estado.codigo) && 'opacity-70')}>
        <span className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
            ot.estado.codigo === 'EN_CAMPO' ? 'bg-purple-100 text-purple-700' : HECHAS.includes(ot.estado.codigo) ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-700')}>
            {n}
        </span>
        <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-sm font-semibold text-gray-800">{ot.numero}</span>
                <span className="text-sm text-gray-700">{ot.tipo.nombre}</span>
                <Prioridad valor={ot.prioridad} />
            </span>
            <span className="block truncate text-xs text-gray-600">{ot.cliente.nombre} · {ot.solicitud.direccion}</span>
            <span className="mt-1 flex flex-wrap items-center gap-1.5">
                <EstadoOT estado={ot.estado} />
                {ot.onu_obligatoria && <ServiciosChips s={ot.servicios} />}
                {!HECHAS.includes(ot.estado.codigo) && ['VENCIDA', 'POR_VENCER'].includes(ot.plazo?.estado) && <PlazoChip plazo={ot.plazo} />}
            </span>
        </span>
        <IoChevronForward className="h-5 w-5 shrink-0 text-gray-300" />
    </button>
);

const MisTrabajos = () => {
    const [d, setD] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [abierta, setAbierta] = useState(null);
    const [verCargo, setVerCargo] = useState(false);

    const cargar = useCallback(async () => {
        setCargando(true);
        const r = await campoService.misTrabajos(hoyISO());
        setCargando(false);
        if (r.success) setD(r.data); else toast.error(r.error);
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    const todas = d ? [...d.previas, ...d.ordenes] : [];
    const ot = todas.find((o) => o.id === abierta) || null;
    // La respuesta de cada acción trae la OT actualizada; lo demás (ONU y material a cargo) se recarga
    const onCambio = (nueva) => {
        setD((x) => x && ({ ...x, previas: x.previas.map((o) => (o.id === nueva.id ? nueva : o)), ordenes: x.ordenes.map((o) => (o.id === nueva.id ? nueva : o)) }));
        if (!['PROGRAMADA', 'EN_CAMPO'].includes(nueva.estado.codigo)) cargar();
    };
    const pendientes = d ? d.ordenes.filter((o) => !HECHAS.includes(o.estado.codigo)).length : 0;

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <PageHeader
                subtitle={d?.cuadrilla ? `${d.cuadrilla.nombre} · ${fechaLarga(d.fecha)}` : undefined}
                actions={<Button variant="secondary" icon={IoRefreshOutline} onClick={cargar} disabled={cargando}>Actualizar</Button>}
            />

            {!ORIGEN_SEGURO && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {MSG_HTTPS} Así no se puede marcar la llegada ni tomar fotos.
                </div>
            )}

            {cargando && !d && <div className="flex justify-center py-16 text-orange-500"><Spinner className="h-7 w-7" /></div>}

            {d && !d.cuadrilla && (
                <Card><EmptyState icon={IoPhonePortraitOutline} title="No estás en ninguna cuadrilla">Cuando te asignen a una cuadrilla, aquí verás sus trabajos del día.</EmptyState></Card>
            )}

            {d?.cuadrilla && (
                <>
                    <Card className="p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800">{d.cuadrilla.nombre}{d.cuadrilla.vehiculo && <span className="font-normal text-gray-500"> · {d.cuadrilla.vehiculo}</span>}</p>
                                <p className="text-xs text-gray-500">{integrantesTexto(d.cuadrilla.integrantes.map((i) => ({ usuario: { nombre: i.nombre }, es_jefe: i.es_jefe })))}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-800">{pendientes}</p>
                                <p className="text-xs text-gray-500">por hacer hoy</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setVerCargo((v) => !v)} className="mt-3 flex items-center gap-2 text-sm text-orange-600">
                            <IoCubeOutline className="h-4 w-4" />A cargo: {d.onus.length} ONU · {d.materiales.length} material(es)
                        </button>
                        {verCargo && (
                            <div className="mt-2 space-y-1 border-t border-gray-100 pt-2 text-xs text-gray-600">
                                {d.onus.map((o) => <p key={o.id} className="flex items-center justify-between gap-2"><span className="font-mono">{o.gpon_serial}</span><span className="truncate">{o.modelo}</span><ServiciosChips s={o} /></p>)}
                                {d.materiales.map((m) => <p key={m.id}>{m.nombre}: te quedan {m.disponible} de {m.entregado} {m.unidad}</p>)}
                                {!d.onus.length && !d.materiales.length && <p>No tienes nada a cargo: pide el despacho en el almacén.</p>}
                            </div>
                        )}
                    </Card>

                    {d.previas.length > 0 && (
                        <Card className="overflow-hidden">
                            <p className="border-b border-gray-100 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">Pendientes de días anteriores</p>
                            <div className="divide-y divide-gray-100">
                                {d.previas.map((o) => (
                                    <div key={o.id}>
                                        <p className="px-4 pt-2 text-xs text-gray-500">Programada el {fechaCorta(o.fecha_programada)}</p>
                                        <Tarjeta ot={o} n="!" onAbrir={setAbierta} />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card className="overflow-hidden">
                        <p className="border-b border-gray-100 px-4 py-2 text-sm font-medium text-gray-700">Hoy <span className="font-normal text-gray-500">({d.ordenes.length})</span></p>
                        {!d.ordenes.length ? <EmptyState icon={IoPhonePortraitOutline} title="No tienes trabajos programados para hoy" /> : (
                            <div className="divide-y divide-gray-100">
                                {d.ordenes.map((o, i) => <Tarjeta key={o.id} ot={o} n={i + 1} onAbrir={setAbierta} />)}
                            </div>
                        )}
                    </Card>
                    {d.ordenes.some((o) => o.estado.codigo === 'NO_EJECUTADA') && (
                        <p className="text-center text-xs text-gray-500"><Badge color="red">No ejecutada</Badge> vuelve a programarse desde la oficina.</p>
                    )}
                </>
            )}

            <OtCampoModal ot={ot} datos={d} onClose={() => setAbierta(null)} onCambio={onCambio} />
        </div>
    );
};

export default MisTrabajos;
