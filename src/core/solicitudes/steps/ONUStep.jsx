import React, { useState } from 'react';
import { Typography } from '@material-tailwind/react';
import { IoHardwareChip, IoCheckmarkCircle, IoSearch, IoStorefront } from 'react-icons/io5';
import { IoLogoRss } from 'react-icons/io';
import { ONUS_DISPONIBLES } from '../mockData.js';

const ONUStep = ({ formData, onChange, errors }) => {
    const [busqueda, setBusqueda] = useState('');

    const handleSelect = (onu) => {
        onChange({ ...formData, onuSeleccionada: onu });
    };

    const onusFiltradas = ONUS_DISPONIBLES.filter((onu) => {
        const q = busqueda.toLowerCase();
        return (
            onu.modelo.toLowerCase().includes(q) ||
            onu.marca.toLowerCase().includes(q) ||
            onu.serie.toLowerCase().includes(q) ||
            onu.almacen.toLowerCase().includes(q)
        );
    });

    const marcaColor = (marca) => {
        const map = {
            Huawei: { bg: '#dbeafe', text: '#1d4ed8' },
            FiberHome: { bg: '#dcfce7', text: '#15803d' },
            ZTE: { bg: '#fef9c3', text: '#a16207' },
        };
        return map[marca] || { bg: '#f3f4f6', text: '#374151' };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-orange-100">
                    <IoLogoRss className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <Typography variant="h6" className="text-gray-800 font-bold">
                        Equipo ONU
                    </Typography>
                    <Typography variant="small" className="text-gray-500">
                        Selecciona el equipo ONU que se asignará al contrato
                    </Typography>
                </div>
            </div>

            {/* Info mock */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <IoHardwareChip className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                    <span className="font-semibold">Datos de demostración</span> — En producción se consultarán los equipos disponibles desde el módulo de Almacenes.
                </p>
            </div>

            {/* Buscador */}
            <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por modelo, marca, serie..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm outline-none focus:border-orange-500 transition-all"
                />
            </div>

            {/* Lista de ONUs */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {onusFiltradas.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <IoHardwareChip className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No se encontraron equipos</p>
                    </div>
                ) : (
                    onusFiltradas.map((onu) => {
                        const isSelected = formData.onuSeleccionada?.id === onu.id;
                        const colors = marcaColor(onu.marca);

                        return (
                            <div
                                key={onu.id}
                                onClick={() => handleSelect(onu)}
                                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
                                    isSelected
                                        ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100'
                                        : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Icono */}
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                            <IoLogoRss className="h-6 w-6 text-orange-500" />
                                        </div>

                                        {/* Info */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-800 text-sm">{onu.modelo}</span>
                                                <span
                                                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                                    style={{ backgroundColor: colors.bg, color: colors.text }}
                                                >
                                                    {onu.marca}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Serie: <span className="font-mono font-medium text-gray-700">{onu.serie}</span>
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <IoHardwareChip className="h-3 w-3" />
                                                    {onu.puerto}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <IoStorefront className="h-3 w-3" />
                                                    {onu.almacen}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estado + check */}
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                                            ✓ Disponible
                                        </span>
                                        {isSelected && (
                                            <IoCheckmarkCircle className="h-6 w-6 text-orange-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {errors?.onuSeleccionada && (
                <p className="text-red-500 text-xs">{errors.onuSeleccionada}</p>
            )}

            {/* ONU seleccionada */}
            {formData.onuSeleccionada && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <IoCheckmarkCircle className="h-6 w-6 text-orange-500 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-orange-700">
                                ONU asignada: {formData.onuSeleccionada.modelo}
                            </p>
                            <p className="text-xs text-orange-600 font-mono">
                                Serie: {formData.onuSeleccionada.serie}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ONUStep;
