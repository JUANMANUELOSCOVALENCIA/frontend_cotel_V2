// src/core/operaciones/components/campoUi.jsx
// Piezas de la app de campo: ubicación del teléfono, cámara en vivo (sin galería) y miniaturas de fotos.
import React, { useEffect, useRef, useState } from 'react';
import { IoCameraOutline, IoCloseOutline, IoRefreshOutline, IoCheckmarkOutline } from 'react-icons/io5';
import { Badge, Button, Spinner, cx } from '../../../shared/components/ui';

// GPS del teléfono: { lat, lng, precision } con 6 decimales. Pide alta precisión.
// El navegador solo da ubicación y cámara en un origen seguro (HTTPS o localhost)
export const ORIGEN_SEGURO = typeof window === 'undefined' || window.isSecureContext;
export const MSG_HTTPS = 'La ubicación y la cámara solo funcionan si entras por HTTPS (o desde la misma PC con localhost).';

export const obtenerUbicacion = () => new Promise((resolve, reject) => {
    if (!ORIGEN_SEGURO) { reject(new Error(MSG_HTTPS)); return; }
    if (!navigator.geolocation) { reject(new Error('Este teléfono no permite obtener la ubicación.')); return; }
    navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6), precision: Math.round(p.coords.accuracy) }),
        (e) => reject(new Error(e.code === 1
            ? 'Permite el acceso a la ubicación para continuar (se registra dónde se toma cada foto).'
            : 'No se pudo obtener la ubicación. Revisa que el GPS esté encendido y vuelve a intentar.')),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
});

// Cámara en vivo: la foto solo puede salir de la cámara en este momento (no hay acceso a la galería).
export const Camara = ({ open, titulo, onClose, onFoto }) => {
    const video = useRef(null);
    const stream = useRef(null);
    const [error, setError] = useState('');
    const [lista, setLista] = useState(false);
    const [captura, setCaptura] = useState(null); // { blob, url }

    useEffect(() => {
        if (!open) return undefined;
        setError(''); setLista(false); setCaptura(null);
        if (!ORIGEN_SEGURO || !navigator.mediaDevices?.getUserMedia) {
            setError(ORIGEN_SEGURO ? 'Este navegador no permite usar la cámara.' : MSG_HTTPS);
            return undefined;
        }
        let cancelado = false;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1600 } }, audio: false })
            .then((s) => {
                if (cancelado) { s.getTracks().forEach((t) => t.stop()); return; }
                stream.current = s;
                if (video.current) { video.current.srcObject = s; video.current.play().catch(() => {}); }
            })
            .catch(() => setError('No se pudo abrir la cámara. Permite el acceso a la cámara para este sitio.'));
        return () => {
            cancelado = true;
            stream.current?.getTracks().forEach((t) => t.stop());
            stream.current = null;
        };
    }, [open]);

    useEffect(() => () => { if (captura) URL.revokeObjectURL(captura.url); }, [captura]);

    const disparar = () => {
        const v = video.current;
        if (!v || !v.videoWidth) return;
        const c = document.createElement('canvas');
        c.width = v.videoWidth; c.height = v.videoHeight;
        c.getContext('2d').drawImage(v, 0, 0);
        c.toBlob((blob) => blob && setCaptura({ blob, url: URL.createObjectURL(blob) }), 'image/jpeg', 0.88);
    };

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[10000] flex flex-col bg-black">
            <div className="flex items-center justify-between px-4 py-3 text-white">
                <p className="text-sm font-medium">{titulo}</p>
                <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Cerrar cámara"><IoCloseOutline className="h-6 w-6" /></button>
            </div>
            <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                {error ? <p className="max-w-xs px-6 text-center text-sm text-white">{error}</p> : (
                    <>
                        <video ref={video} playsInline muted onLoadedData={() => setLista(true)}
                            className={cx('max-h-full max-w-full', captura && 'hidden')} />
                        {captura && <img src={captura.url} alt="Foto tomada" className="max-h-full max-w-full" />}
                        {!lista && !captura && <Spinner className="absolute h-8 w-8 text-white" />}
                    </>
                )}
            </div>
            <div className="flex items-center justify-center gap-4 px-4 py-5">
                {captura ? (
                    <>
                        <Button variant="secondary" icon={IoRefreshOutline} onClick={() => setCaptura(null)}>Repetir</Button>
                        <Button icon={IoCheckmarkOutline} onClick={() => onFoto(captura.blob)}>Usar foto</Button>
                    </>
                ) : (
                    <button type="button" onClick={disparar} disabled={!lista || !!error} aria-label="Tomar foto"
                        className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 text-white disabled:opacity-40">
                        <IoCameraOutline className="h-7 w-7" />
                    </button>
                )}
            </div>
        </div>
    );
};

const COLOR_EV = { ACEPTADA: 'green', RECHAZADA: 'red', OBSERVADA: 'amber' };

// Miniatura de una evidencia: la imagen se pide al backend con el token (cargar: () => Promise<{success, data: Blob}>)
export const FotoEvidencia = ({ ev, cargar }) => {
    const [url, setUrl] = useState(null);
    const [grande, setGrande] = useState(false);
    useEffect(() => {
        let u = null;
        let vivo = true;
        cargar().then((r) => { if (vivo && r.success) { u = URL.createObjectURL(r.data); setUrl(u); } });
        return () => { vivo = false; if (u) URL.revokeObjectURL(u); };
    }, [ev.id]); // eslint-disable-line react-hooks/exhaustive-deps
    return (
        <div className="flex gap-3 rounded-lg border border-gray-200 p-2">
            <button type="button" onClick={() => url && setGrande(true)} className="h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                {url ? <img src={url} alt={ev.tipo.nombre} className="h-full w-full object-cover" /> : <Spinner className="m-auto mt-5 h-5 w-5 text-gray-400" />}
            </button>
            <div className="min-w-0 text-xs">
                <p className="flex flex-wrap items-center gap-1.5"><span className="font-medium text-gray-800">{ev.tipo.nombre}</span><Badge color={COLOR_EV[ev.estado.codigo]}>{ev.estado.nombre}</Badge></p>
                {ev.motivo && <p className="mt-0.5 text-red-600">{ev.motivo}</p>}
                <p className="mt-0.5 text-gray-500">
                    {new Date(ev.fecha).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    {' · '}a {Math.round(ev.distancia_m)} m del domicilio
                    {ev.tipo.codigo === 'ONU' && ` · CNN: ${ev.cnn.nombre.toLowerCase()}`}
                    {ev.tomada_por && ` · ${ev.tomada_por}`}
                </p>
            </div>
            {grande && (
                <button type="button" onClick={() => setGrande(false)} className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/90 p-4" aria-label="Cerrar foto">
                    <img src={url} alt={ev.tipo.nombre} className="max-h-full max-w-full" />
                </button>
            )}
        </div>
    );
};
