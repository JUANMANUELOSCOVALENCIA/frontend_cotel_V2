import React from 'react';
import { Typography, Chip } from '@material-tailwind/react';
import { IoWifi, IoCheckmarkCircle, IoSpeedometer } from 'react-icons/io5';
import { PLANES_FIBRA } from '../mockData.js';

const PlanesStep = ({ formData, onChange, errors }) => {
    const handleSelect = (plan) => {
        onChange({ ...formData, planSeleccionado: plan });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-orange-100">
                    <IoWifi className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <Typography variant="h6" className="text-gray-800 font-bold">
                        Planes de Fibra Óptica
                    </Typography>
                    <Typography variant="small" className="text-gray-500">
                        Selecciona el plan que mejor se adapte al cliente
                    </Typography>
                </div>
            </div>

            {/* Banner informativo */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <IoSpeedometer className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                    <p className="text-sm font-semibold text-blue-700">Todos los planes incluyen</p>
                    <p className="text-xs text-blue-600 mt-1">
                        Instalación gratuita · Sin costo de activación · Soporte técnico 24/7 · Fibra óptica FTTH
                    </p>
                </div>
            </div>

            {/* Grid de planes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PLANES_FIBRA.map((plan) => {
                    const isSelected = formData.planSeleccionado?.id === plan.id;

                    return (
                        <div
                            key={plan.id}
                            onClick={() => handleSelect(plan)}
                            className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
                                isSelected
                                    ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100'
                                    : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm'
                            }`}
                        >
                            {/* Badge popular */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                                        ⭐ MÁS POPULAR
                                    </span>
                                </div>
                            )}

                            {/* Checkmark seleccionado */}
                            {isSelected && (
                                <div className="absolute top-3 right-3">
                                    <IoCheckmarkCircle className="h-6 w-6 text-orange-500" />
                                </div>
                            )}

                            {/* Header del plan */}
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: plan.color + '20' }}
                                >
                                    <IoWifi className="h-6 w-6" style={{ color: plan.color }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-base">{plan.nombre}</h3>
                                    <p className="text-xs text-gray-500">{plan.descripcion}</p>
                                </div>
                            </div>

                            {/* Velocidad */}
                            <div
                                className="text-center py-3 rounded-xl mb-4"
                                style={{ backgroundColor: plan.color + '15' }}
                            >
                                <span className="text-3xl font-black" style={{ color: plan.color }}>
                                    {plan.velocidad}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">Velocidad simétrica</p>
                            </div>

                            {/* Precio */}
                            <div className="text-center mb-4">
                                <span className="text-2xl font-black text-gray-800">
                                    Bs. {plan.precio.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500"> / mes</span>
                            </div>

                            {/* Features */}
                            <ul className="space-y-2">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                        <IoCheckmarkCircle
                                            className="h-4 w-4 shrink-0"
                                            style={{ color: plan.color }}
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {errors?.planSeleccionado && (
                <p className="text-red-500 text-xs text-center">{errors.planSeleccionado}</p>
            )}

            {/* Plan seleccionado - resumen */}
            {formData.planSeleccionado && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <IoCheckmarkCircle className="h-6 w-6 text-orange-500" />
                        <div>
                            <p className="text-sm font-bold text-orange-700">
                                Plan seleccionado: {formData.planSeleccionado.nombre}
                            </p>
                            <p className="text-xs text-orange-600">
                                {formData.planSeleccionado.velocidad} · Bs. {formData.planSeleccionado.precio.toFixed(2)}/mes
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanesStep;
