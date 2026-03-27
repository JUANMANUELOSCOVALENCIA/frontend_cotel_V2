// ==========================================
// MOCK DATA - Sin conexión a backend
// ==========================================

export const PLANES_FIBRA = [
    {
        id: 1,
        nombre: 'Básico',
        velocidad: '50 Mbps',
        precio: 89.00,
        descripcion: 'Ideal para navegación y redes sociales',
        color: '#6b7280',
        features: ['Navegación web', 'Redes sociales', 'Streaming SD', 'Soporte 24/7'],
        popular: false,
    },
    {
        id: 2,
        nombre: 'Hogar',
        velocidad: '100 Mbps',
        precio: 129.00,
        descripcion: 'Perfecto para el hogar con múltiples dispositivos',
        color: '#f97316',
        features: ['Todo lo del Básico', 'Streaming HD', 'Videollamadas HD', 'Router incluido'],
        popular: true,
    },
    {
        id: 3,
        nombre: 'Pro',
        velocidad: '200 Mbps',
        precio: 179.00,
        descripcion: 'Para gamers y trabajo desde casa',
        color: '#3b82f6',
        features: ['Todo lo del Hogar', 'Gaming online', 'Streaming 4K', 'IP estática'],
        popular: false,
    },
    {
        id: 4,
        nombre: 'Empresarial',
        velocidad: '500 Mbps',
        precio: 299.00,
        descripcion: 'Solución completa para negocios',
        color: '#8b5cf6',
        features: ['Todo lo del Pro', 'SLA garantizado', 'Soporte prioritario', 'Múltiples IPs'],
        popular: false,
    },
];

export const ONUS_DISPONIBLES = [
    {
        id: 'ONU-001',
        modelo: 'HG8310M',
        marca: 'Huawei',
        serie: 'HW2024001',
        estado: 'disponible',
        puerto: 'PON-1/1/1',
        almacen: 'Almacén Central',
    },
    {
        id: 'ONU-002',
        modelo: 'AN5506-04-FA',
        marca: 'FiberHome',
        serie: 'FH2024045',
        estado: 'disponible',
        puerto: 'PON-1/1/2',
        almacen: 'Almacén Central',
    },
    {
        id: 'ONU-003',
        modelo: 'HG8245H5',
        marca: 'Huawei',
        serie: 'HW2024078',
        estado: 'disponible',
        puerto: 'PON-1/2/1',
        almacen: 'Almacén Norte',
    },
    {
        id: 'ONU-004',
        modelo: 'EG8141A5',
        marca: 'Huawei',
        serie: 'HW2024099',
        estado: 'disponible',
        puerto: 'PON-2/1/1',
        almacen: 'Almacén Sur',
    },
    {
        id: 'ONU-005',
        modelo: 'RTF8115VW',
        marca: 'ZTE',
        serie: 'ZTE2024012',
        estado: 'disponible',
        puerto: 'PON-2/1/2',
        almacen: 'Almacén Central',
    },
];

export const TIPOS_DOCUMENTO = [
    { value: 'CI', label: 'Cédula de Identidad' },
    { value: 'NIT', label: 'NIT' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
];

export const DEPARTAMENTOS_BOLIVIA = [
    'La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí',
    'Chuquisaca', 'Tarija', 'Beni', 'Pando'
];

// Genera número de solicitud único
export const generarNumeroSolicitud = () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `SOL-${año}${mes}${dia}-${random}`;
};
