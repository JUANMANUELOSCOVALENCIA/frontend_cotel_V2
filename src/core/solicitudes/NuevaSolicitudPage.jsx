import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button } from '@material-tailwind/react';
import { IoArrowBack, IoArrowForward, IoCheckmark, IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';

import DatosClienteStep from './steps/DatosClienteStep.jsx';
import MapaStep from './steps/MapaStep.jsx';
import PlanesStep from './steps/PlanesStep.jsx';
import ONUStep from './steps/ONUStep.jsx';
import ResumenStep from './steps/ResumenStep.jsx';
import { generarNumeroSolicitud } from './mockData.js';

const STEPS = [
    { id: 1, label: 'Cliente',    short: '1' },
    { id: 2, label: 'Ubicación',  short: '2' },
    { id: 3, label: 'Plan',       short: '3' },
    { id: 4, label: 'ONU',        short: '4' },
    { id: 5, label: 'Resumen',    short: '5' },
];

const INITIAL_FORM = {
    // Paso 1
    tipoDocumento: '', numeroDocumento: '', nombres: '', apellidos: '',
    telefono: '', email: '', departamento: '', ciudad: '',
    // Paso 2
    direccion: '', referencia: '', lat: null, lng: null, direccionMapa: '',
    // Paso 3
    planSeleccionado: null,
    // Paso 4
    onuSeleccionada: null,
};

const validateStep = (step, formData) => {
    const errors = {};
    if (step === 1) {
        if (!formData.numeroDocumento) errors.numeroDocumento = 'Requerido';
        if (!formData.nombres) errors.nombres = 'Requerido';
        if (!formData.apellidos) errors.apellidos = 'Requerido';
        if (!formData.telefono) errors.telefono = 'Requerido';
        if (!formData.ciudad) errors.ciudad = 'Requerido';
    }
    if (step === 2) {
        if (!formData.direccion) errors.direccion = 'Ingresa la dirección de instalación';
    }
    if (step === 3) {
        if (!formData.planSeleccionado) errors.planSeleccionado = 'Selecciona un plan';
    }
    if (step === 4) {
        if (!formData.onuSeleccionada) errors.onuSeleccionada = 'Selecciona una ONU';
    }
    return errors;
};

const NuevaSolicitudPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [numeroSolicitud] = useState(generarNumeroSolicitud());

    const handleNext = () => {
        const stepErrors = validateStep(currentStep, formData);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            toast.error('Completa todos los campos requeridos');
            return;
        }
        setErrors({});
        setCurrentStep((s) => Math.min(s + 1, STEPS.length));
    };

    const handlePrev = () => {
        setErrors({});
        setCurrentStep((s) => Math.max(s - 1, 1));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        // Simular llamada al backend
        await new Promise((r) => setTimeout(r, 1800));
        setSubmitting(false);
        setSubmitted(true);
        toast.success(`Solicitud ${numeroSolicitud} registrada exitosamente`);
    };

    // Pantalla de éxito
    if (submitted) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <IoCheckmark className="h-10 w-10 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 mb-2">¡Solicitud Registrada!</h2>
                    <p className="text-gray-500 mb-4 text-sm">
                        La solicitud ha sido registrada exitosamente y está pendiente de aprobación.
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
                        <p className="text-xs text-orange-600 mb-1">Número de solicitud</p>
                        <p className="text-xl font-black font-mono text-orange-700">{numeroSolicitud}</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="outlined"
                            className="border-2 border-orange-500 text-orange-500 normal-case rounded-xl"
                            onClick={() => { setSubmitted(false); setFormData(INITIAL_FORM); setCurrentStep(1); }}
                        >
                            Nueva Solicitud
                        </Button>
                        <Button
                            className="bg-orange-500 normal-case rounded-xl"
                            onClick={() => navigate('/dashboard')}
                        >
                            Ir al Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:text-orange-500 transition-all"
                >
                    <IoArrowBack className="h-5 w-5" />
                </button>
                <div>
                    <Typography variant="h5" className="font-black text-gray-800">
                        Nueva Solicitud de Servicio
                    </Typography>
                    <Typography variant="small" className="text-gray-500">
                        Fibra Óptica FTTH — COTEL R.L.
                    </Typography>
                </div>
            </div>

            {/* Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    {/* Línea de progreso */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0">
                        <div
                            className="h-full bg-orange-500 transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                        />
                    </div>

                    {STEPS.map((step) => {
                        const isDone = currentStep > step.id;
                        const isActive = currentStep === step.id;
                        return (
                            <div key={step.id} className="flex flex-col items-center z-10 gap-2">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                                        isDone
                                            ? 'bg-orange-500 border-orange-500 text-white'
                                            : isActive
                                            ? 'bg-white border-orange-500 text-orange-600 shadow-md shadow-orange-100'
                                            : 'bg-white border-gray-200 text-gray-400'
                                    }`}
                                >
                                    {isDone ? <IoCheckmark className="h-5 w-5" /> : step.short}
                                </div>
                                <span
                                    className={`text-xs font-semibold hidden sm:block ${
                                        isActive ? 'text-orange-600' : isDone ? 'text-orange-400' : 'text-gray-400'
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Card del formulario */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[480px]">
                {currentStep === 1 && (
                    <DatosClienteStep
                        formData={formData}
                        onChange={setFormData}
                        errors={errors}
                    />
                )}
                {currentStep === 2 && (
                    <MapaStep
                        formData={formData}
                        onChange={setFormData}
                        errors={errors}
                    />
                )}
                {currentStep === 3 && (
                    <PlanesStep
                        formData={formData}
                        onChange={setFormData}
                        errors={errors}
                    />
                )}
                {currentStep === 4 && (
                    <ONUStep
                        formData={formData}
                        onChange={setFormData}
                        errors={errors}
                    />
                )}
                {currentStep === 5 && (
                    <ResumenStep formData={formData} />
                )}
            </div>

            {/* Navegación */}
            <div className="flex justify-between items-center mt-6">
                <Button
                    variant="outlined"
                    disabled={currentStep === 1}
                    onClick={handlePrev}
                    className="flex items-center gap-2 normal-case rounded-xl border-2 border-gray-300 text-gray-600 disabled:opacity-30"
                >
                    <IoArrowBack className="h-4 w-4" />
                    Anterior
                </Button>

                <span className="text-xs text-gray-400">
                    Paso {currentStep} de {STEPS.length}
                </span>

                {currentStep < STEPS.length ? (
                    <Button
                        onClick={handleNext}
                        className="flex items-center gap-2 normal-case rounded-xl bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-100"
                    >
                        Siguiente
                        <IoArrowForward className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 normal-case rounded-xl bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-100 disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Registrando...
                            </>
                        ) : (
                            <>
                                <IoCheckmark className="h-4 w-4" />
                                Confirmar Solicitud
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default NuevaSolicitudPage;
