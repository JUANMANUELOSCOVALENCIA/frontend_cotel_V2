import React from 'react';
import { Typography } from '@material-tailwind/react';
import {
    IoDocument, IoPersonCircle, IoLocation, IoWifi,
    IoHardwareChip, IoCheckmarkCircle, IoPrint
} from 'react-icons/io5';
import { IoLogoRss } from 'react-icons/io';
import { generarNumeroSolicitud } from '../mockData.js';

const ResumenStep = ({ formData }) => {
    const numeroSolicitud = React.useMemo(() => generarNumeroSolicitud(), []);
    const fechaHoy = new Date().toLocaleDateString('es-BO', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const Section = ({ icon: Icon, title, children }) => (
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <Icon className="h-5 w-5 text-orange-500" />
                <span className="font-bold text-gray-700 text-sm">{title}</span>
            </div>
            <div className="p-4 space-y-2">{children}</div>
        </div>
    );

    const Row = ({ label, value }) => (
        <div className="flex justify-between items-start gap-4">
            <span className="text-xs text-gray-500 shrink-0">{label}</span>
            <span className="text-xs font-semibold text-gray-800 text-right">{value || '—'}</span>
        </div>
    );

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-orange-100">
                    <IoDocument className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <Typography variant="h6" className="text-gray-800 font-bold">
                        Resumen de Solicitud
                    </Typography>
                    <Typography variant="small" className="text-gray-500">
                        Revisa todos los datos antes de generar el contrato
                    </Typography>
                </div>
            </div>

            {/* Número de solicitud */}
            <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white text-center shadow-md">
                <p className="text-xs font-medium opacity-80 mb-1">Número de Solicitud</p>
                <p className="text-2xl font-black font-mono tracking-wider">{numeroSolicitud}</p>
                <p className="text-xs opacity-70 mt-1">{fechaHoy}</p>
            </div>

            {/* Datos del cliente */}
            <Section icon={IoPersonCircle} title="Datos del Cliente">
                <Row label="Documento" value={`${formData.tipoDocumento || ''} ${formData.numeroDocumento || ''}`} />
                <Row label="Nombre completo" value={`${formData.nombres || ''} ${formData.apellidos || ''}`} />
                <Row label="Teléfono" value={formData.telefono} />
                <Row label="Correo" value={formData.email || 'No proporcionado'} />
                <Row label="Departamento" value={formData.departamento} />
                <Row label="Ciudad" value={formData.ciudad} />
            </Section>

            {/* Dirección */}
            <Section icon={IoLocation} title="Dirección de Instalación">
                <Row label="Dirección" value={formData.direccion} />
                <Row label="Referencia" value={formData.referencia || 'No indicada'} />
                {formData.lat && (
                    <Row label="Coordenadas" value={`${formData.lat?.toFixed(5)}, ${formData.lng?.toFixed(5)}`} />
                )}
            </Section>

            {/* Plan */}
            <Section icon={IoWifi} title="Plan Contratado">
                {formData.planSeleccionado ? (
                    <>
                        <Row label="Plan" value={formData.planSeleccionado.nombre} />
                        <Row label="Velocidad" value={formData.planSeleccionado.velocidad} />
                        <Row label="Precio mensual" value={`Bs. ${formData.planSeleccionado.precio.toFixed(2)}`} />
                    </>
                ) : (
                    <p className="text-xs text-red-500">Sin plan seleccionado</p>
                )}
            </Section>

            {/* ONU */}
            <Section icon={IoLogoRss} title="Equipo ONU Asignado">
                {formData.onuSeleccionada ? (
                    <>
                        <Row label="Modelo" value={formData.onuSeleccionada.modelo} />
                        <Row label="Marca" value={formData.onuSeleccionada.marca} />
                        <Row label="Serie" value={formData.onuSeleccionada.serie} />
                        <Row label="Puerto" value={formData.onuSeleccionada.puerto} />
                        <Row label="Almacén" value={formData.onuSeleccionada.almacen} />
                    </>
                ) : (
                    <p className="text-xs text-red-500">Sin ONU seleccionada</p>
                )}
            </Section>

            {/* Aviso contrato */}
            <div className="p-4 border-2 border-dashed border-orange-300 rounded-2xl bg-orange-50">
                <div className="flex items-start gap-3">
                    <IoPrint className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-orange-700 mb-1">Generación de Contrato</p>
                        <p className="text-xs text-orange-600">
                            Al confirmar, se generará el número de solicitud y quedará en estado
                            <span className="font-semibold"> "Pendiente de aprobación"</span>.
                            El contrato físico deberá ser impreso y firmado por el cliente.
                        </p>
                    </div>
                </div>
            </div>

            {/* Check términos */}
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                    type="checkbox"
                    defaultChecked
                    className="mt-0.5 h-4 w-4 accent-orange-500"
                />
                <span className="text-xs text-gray-600">
                    Confirmo que los datos del cliente han sido verificados y el cliente acepta los términos y condiciones del servicio de COTEL R.L.
                </span>
            </label>
        </div>
    );
};

export default ResumenStep;
