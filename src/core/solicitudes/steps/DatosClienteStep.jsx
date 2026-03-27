import React from 'react';
import { Typography } from '@material-tailwind/react';
import { IoPersonCircle, IoCard, IoCall, IoMail } from 'react-icons/io5';

const DatosClienteStep = ({ formData, onChange, errors }) => {
    const handleChange = (field, value) => {
        onChange({ ...formData, [field]: value });
    };

    const inputClass = (field) =>
        `w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 outline-none focus:border-orange-500 bg-white ${
            errors?.[field]
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
        }`;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-orange-100">
                    <IoPersonCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <Typography variant="h6" className="text-gray-800 font-bold">
                        Datos del Cliente
                    </Typography>
                    <Typography variant="small" className="text-gray-500">
                        Ingresa la información personal del solicitante
                    </Typography>
                </div>
            </div>

            {/* Número de CI */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Número de CI *
                </label>
                <div className="relative">
                    <IoCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={formData.numeroDocumento || ''}
                        onChange={(e) => handleChange('numeroDocumento', e.target.value)}
                        placeholder="Ej: 12345678"
                        className={`${inputClass('numeroDocumento')} pl-10`}
                    />
                </div>
                {errors?.numeroDocumento && (
                    <p className="text-red-500 text-xs mt-1">{errors.numeroDocumento}</p>
                )}
            </div>

            {/* Nombres y apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Nombres *
                    </label>
                    <input
                        type="text"
                        value={formData.nombres || ''}
                        onChange={(e) => handleChange('nombres', e.target.value)}
                        placeholder="Ej: Juan Carlos"
                        className={inputClass('nombres')}
                    />
                    {errors?.nombres && (
                        <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Apellidos *
                    </label>
                    <input
                        type="text"
                        value={formData.apellidos || ''}
                        onChange={(e) => handleChange('apellidos', e.target.value)}
                        placeholder="Ej: Mamani Quispe"
                        className={inputClass('apellidos')}
                    />
                    {errors?.apellidos && (
                        <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>
                    )}
                </div>
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Teléfono / Celular *
                    </label>
                    <div className="relative">
                        <IoCall className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="tel"
                            value={formData.telefono || ''}
                            onChange={(e) => handleChange('telefono', e.target.value)}
                            placeholder="Ej: 70012345"
                            className={`${inputClass('telefono')} pl-10`}
                        />
                    </div>
                    {errors?.telefono && (
                        <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <IoMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="Ej: juan@correo.com"
                            className={`${inputClass('email')} pl-10`}
                        />
                    </div>
                </div>
            </div>

            {/* Ciudad */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Ciudad *
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {['La Paz', 'El Alto'].map((ciudad) => (
                        <button
                            key={ciudad}
                            type="button"
                            onClick={() => handleChange('ciudad', ciudad)}
                            className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                                formData.ciudad === ciudad
                                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                                    : 'border-gray-200 text-gray-600 hover:border-orange-300'
                            }`}
                        >
                            {ciudad}
                        </button>
                    ))}
                </div>
                {errors?.ciudad && (
                    <p className="text-red-500 text-xs mt-1">{errors.ciudad}</p>
                )}
            </div>
        </div>
    );
};

export default DatosClienteStep;