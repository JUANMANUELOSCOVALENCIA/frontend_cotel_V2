// src/core/almacenes/pages/catalogos/CampoForm.jsx
// Un campo de formulario definido por configuración:
// { name, label, type: 'text'|'email'|'tel'|'number'|'textarea'|'select'|'toggle',
//   required, maxLength, min, pattern: { value: /re/, message }, opciones: [{value,label}],
//   placeholder, hint, ancho: 'completo' | 'medio', mayusculas }
import React from 'react';
import { Field, TextInput, TextArea, SelectInput, Toggle, cx } from '../../../../shared/components/ui';

export const validarCampos = (campos, valores) => {
    const errores = {};
    campos.forEach((c) => {
        const v = valores[c.name];
        const texto = typeof v === 'string' ? v.trim() : v;
        if (c.required && (texto === '' || texto === null || texto === undefined)) {
            errores[c.name] = `${c.label} es obligatorio`;
            return;
        }
        if (texto === '' || texto === null || texto === undefined) return;
        if (c.maxLength && String(texto).length > c.maxLength) errores[c.name] = `Máximo ${c.maxLength} caracteres`;
        else if (c.minLength && String(texto).length < c.minLength) errores[c.name] = `Mínimo ${c.minLength} caracteres`;
        else if (c.pattern && !c.pattern.value.test(String(texto))) errores[c.name] = c.pattern.message;
        else if (c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(texto))) errores[c.name] = 'Correo no válido';
        else if (c.type === 'number' && c.min !== undefined && Number(texto) < c.min) errores[c.name] = `Debe ser al menos ${c.min}`;
    });
    return errores;
};

const CampoForm = ({ campo: c, valor, error, onChange, disabled }) => {
    const ancho = c.ancho === 'medio' ? 'sm:col-span-1' : 'sm:col-span-2';
    if (c.type === 'toggle') {
        return (
            <div className={cx(ancho, 'pt-1')}>
                <Toggle checked={!!valor} onChange={onChange} label={c.label} disabled={disabled || c.disabled} />
                {c.hint && <p className="mt-1 text-xs text-gray-500">{c.hint}</p>}
            </div>
        );
    }
    const comunes = {
        value: valor ?? '',
        disabled: disabled || c.disabled,
        placeholder: c.placeholder,
        maxLength: c.maxLength,
        onChange: (e) => onChange(c.mayusculas ? e.target.value.toUpperCase() : e.target.value),
    };
    return (
        <Field label={c.label} required={c.required} error={error} hint={c.hint} className={ancho}>
            {c.type === 'textarea' && <TextArea rows={c.rows || 3} {...comunes} />}
            {c.type === 'select' && (
                <SelectInput {...comunes}>
                    <option value="">{c.placeholder || 'Seleccionar…'}</option>
                    {(c.opciones || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </SelectInput>
            )}
            {!['textarea', 'select'].includes(c.type) && (
                <TextInput type={c.type || 'text'} min={c.min} step={c.step} error={error} {...comunes} />
            )}
        </Field>
    );
};

export default CampoForm;
