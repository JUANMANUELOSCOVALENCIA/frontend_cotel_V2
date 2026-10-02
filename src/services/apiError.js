// src/services/apiError.js
// Convierte cualquier error de la API en un texto para mostrar al usuario,
// y separa los errores por campo para marcarlos en los formularios.

const aTexto = (v) => (Array.isArray(v) ? v.join(' ') : typeof v === 'string' ? v : '');

/** Errores por campo que devuelve Django REST ({ nombre: ['Ya existe…'] }) */
export const erroresDeCampos = (error) => {
    const data = error?.response?.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    const campos = {};
    Object.entries(data).forEach(([k, v]) => {
        if (['error', 'message', 'detail', 'non_field_errors', 'success'].includes(k)) return;
        const t = aTexto(v);
        if (t) campos[k] = t;
    });
    return campos;
};

/** Mensaje general del error */
export const mensajeError = (error, porDefecto = 'Ocurrió un error') => {
    if (!error?.response) return 'No se pudo conectar con el servidor';
    const data = error.response.data;
    if (typeof data === 'string') return porDefecto;
    if (data?.error) return aTexto(data.error);
    if (data?.detail) return aTexto(data.detail);
    if (data?.message) return aTexto(data.message);
    if (data?.non_field_errors) return aTexto(data.non_field_errors);
    const campos = Object.values(erroresDeCampos(error));
    if (campos.length) return campos.join(' ');
    return porDefecto;
};

/** Resultado uniforme para los servicios: { success, data } o { success, error, fieldErrors } */
export const ejecutar = async (peticion, porDefecto) => {
    try {
        const response = await peticion();
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            status: error?.response?.status,
            data: error?.response?.data,
            error: mensajeError(error, porDefecto),
            fieldErrors: erroresDeCampos(error),
        };
    }
};
