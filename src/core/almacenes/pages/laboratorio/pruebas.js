// src/core/almacenes/pages/laboratorio/pruebas.js
// Pruebas de laboratorio de los equipos ONU (mismo orden y nombres que el backend:
// almacenes/models.py → PRUEBAS_LABORATORIO). El backend rechaza cualquier otro valor.
export const PRUEBAS_LAB = [
    { campo: 'serie_logica_ok', nombre: 'Serie lógica' },
    { campo: 'puerto_ethernet_ok', nombre: 'Puerto Ethernet' },
    { campo: 'puerto_lan_ok', nombre: 'Puertos LAN' },
    { campo: 'wifi_24_ok', nombre: 'WiFi 2.4 GHz' },
    { campo: 'wifi_5_ok', nombre: 'WiFi 5 GHz' },
    { campo: 'puerto_catv_ok', nombre: 'Puerto CATV' },
    { campo: 'puerto_telefonia_rf_ok', nombre: 'Telefonía (POTS)' },
    { campo: 'otros_ok', nombre: 'Otras pruebas' },
];

export const TODAS_LAS_PRUEBAS = PRUEBAS_LAB.map((p) => p.campo);

// Pruebas de un modelo: si no se configuró ninguna, aplican todas
export const pruebasDeModelo = (lista) => (lista?.length ? TODAS_LAS_PRUEBAS.filter((c) => lista.includes(c)) : TODAS_LAS_PRUEBAS);
