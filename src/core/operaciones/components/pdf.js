// src/core/operaciones/components/pdf.js
// PDF de operaciones: reportes de listados (solicitudes / OT) y formatos
// individuales (orden de trabajo para el técnico, comprobante de solicitud, hoja del día de una cuadrilla).
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const NARANJA = [249, 115, 22];
const OSCURO = [31, 41, 55];
const GRIS = [107, 114, 128];
const MARGEN = 40;

const ahora = () => new Date().toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const fecha = (iso) => (iso ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—');
export const fechaHora = (iso) => (iso ? new Date(iso).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const bs = (n) => `Bs ${Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const nombreArchivo = (base) => `${base}_${new Date().toISOString().slice(0, 10)}.pdf`;

const encabezado = (doc, titulo, lineas = []) => {
    const ancho = doc.internal.pageSize.getWidth();
    doc.setFillColor(...NARANJA);
    doc.rect(0, 0, ancho, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...OSCURO);
    doc.text(`COTEL R.L. - ${titulo}`, MARGEN, 38);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GRIS);
    lineas.filter(Boolean).forEach((l, i) => doc.text(l, MARGEN, 55 + i * 13));
    return 55 + lineas.filter(Boolean).length * 13 + 6;
};

const piePaginas = (doc, texto) => {
    const total = doc.getNumberOfPages();
    const ancho = doc.internal.pageSize.getWidth();
    const alto = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= total; i += 1) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(texto, MARGEN, alto - 20);
        doc.text(`Página ${i} de ${total}`, ancho - MARGEN, alto - 20, { align: 'right' });
    }
};

const estiloTabla = {
    styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak', textColor: OSCURO },
    headStyles: { fillColor: OSCURO, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: MARGEN, right: MARGEN },
};

// Trae TODAS las páginas de un listado paginado (con los filtros actuales)
export const traerTodo = async (listar, params, limite = 5000) => {
    let page = 1;
    const filas = [];
    for (;;) {
        // eslint-disable-next-line no-await-in-loop
        const r = await listar({ ...params, page, page_size: 100 });
        if (!r.success) return r;
        filas.push(...(r.data.results || []));
        if (!r.data.next || filas.length >= limite) break;
        page += 1;
    }
    return { success: true, data: filas };
};

const contar = (filas, clave) => {
    const m = new Map();
    filas.forEach((f) => { const k = clave(f) || '—'; m.set(k, (m.get(k) || 0) + 1); });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

/** Reporte horizontal con tabla + resumen por estado y tipo. */
export const reporteListado = ({ titulo, filtros, usuario, columnas, filas, anchos = {}, resumenes = [], archivo }) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const y = encabezado(doc, titulo, [
        `Filtros: ${filtros || 'sin filtros'}`,
        `Generado: ${ahora()}   |   Por: ${usuario}   |   Registros: ${filas.length}`,
    ]);
    autoTable(doc, {
        ...estiloTabla,
        startY: y,
        head: [columnas.map((c) => c.titulo)],
        body: filas.map((f) => columnas.map((c) => c.valor(f) ?? '')),
        columnStyles: Object.fromEntries(columnas.map((c, i) => [i, { cellWidth: anchos[c.titulo] || 'auto' }])),
    });

    // Resumen: tablas pequeñas lado a lado
    let x = MARGEN;
    let yRes = doc.lastAutoTable.finalY + 24;
    if (yRes > doc.internal.pageSize.getHeight() - 140) { doc.addPage(); yRes = 50; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...OSCURO);
    doc.text('Resumen', MARGEN, yRes);
    resumenes.forEach(({ titulo: t, clave }) => {
        autoTable(doc, {
            ...estiloTabla,
            startY: yRes + 8,
            margin: { left: x },
            tableWidth: 220,
            head: [[t, 'Cantidad']],
            body: [...contar(filas, clave), ['Total', filas.length]],
            columnStyles: { 1: { halign: 'right', cellWidth: 60 } },
            didParseCell: (d) => { if (d.section === 'body' && d.row.index === d.table.body.length - 1) d.cell.styles.fontStyle = 'bold'; },
        });
        x += 240;
    });

    piePaginas(doc, `COTEL R.L. · ${titulo}`);
    doc.save(nombreArchivo(archivo));
};

// ---------- Formatos individuales ----------

const seccion = (doc, y, titulo) => {
    doc.setFillColor(243, 244, 246);
    doc.rect(MARGEN, y, doc.internal.pageSize.getWidth() - MARGEN * 2, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...OSCURO);
    doc.text(titulo.toUpperCase(), MARGEN + 6, y + 12.5);
    return y + 26;
};

const pares = (doc, y, items, columnas = 2) => {
    const ancho = doc.internal.pageSize.getWidth() - MARGEN * 2;
    const col = ancho / columnas;
    let fila = 0;
    let alto = 0;
    const lista = items.filter(Boolean);
    lista.forEach(([etq, valor, completo], i) => {
        const span = completo ? columnas : 1;
        if (fila + span > columnas) { y += alto + 6; fila = 0; alto = 0; }
        const x = MARGEN + fila * col;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...GRIS);
        doc.text(etq, x, y);
        doc.setFontSize(10);
        doc.setTextColor(...OSCURO);
        const lineas = doc.splitTextToSize(String(valor || '—'), col * span - 10);
        doc.text(lineas, x, y + 12);
        alto = Math.max(alto, 12 + lineas.length * 12);
        fila += span;
        if (fila >= columnas || i === lista.length - 1) { y += alto + 6; fila = 0; alto = 0; }
    });
    return y + 4;
};

const recuadro = (doc, y, titulo, texto, color = [254, 243, 199]) => {
    const ancho = doc.internal.pageSize.getWidth() - MARGEN * 2;
    doc.setFontSize(10);
    const lineas = doc.splitTextToSize(texto, ancho - 16);
    const alto = 22 + lineas.length * 12;
    doc.setFillColor(...color);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(MARGEN, y, ancho, alto, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    doc.text(titulo.toUpperCase(), MARGEN + 8, y + 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...OSCURO);
    doc.text(lineas, MARGEN + 8, y + 26);
    return y + alto + 10;
};

const mapsUrl = (u) => `https://www.google.com/maps?q=${u.lat},${u.lng}`;

/** Orden de trabajo para el técnico (hoja vertical para llevar a campo). */
export const imprimirOT = (o, usuario) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const ancho = doc.internal.pageSize.getWidth();
    let y = encabezado(doc, `Orden de trabajo ${o.numero}`, [
        `Solicitud ${o.solicitud.numero}   |   Registrada: ${fechaHora(o.created_at)}   |   Estado: ${o.estado.nombre}${o.prioridad === 'ALTA' ? '   |   URGENTE' : ''}`,
        `Programada para: ${o.fecha_programada ? fecha(o.fecha_programada) : 'sin programar'}${o.cuadrilla ? ` con ${o.cuadrilla.nombre}` : ''}   |   Impreso: ${ahora()} por ${usuario}`,
    ]);

    y = seccion(doc, y, 'Trabajo');
    y = pares(doc, y, [
        ['Tipo', o.tipo.nombre],
        ['Plan', o.solicitud.plan || '—'],
        ['Servicios a instalar', (o.solicitud.servicios || []).join(' + ') || '—', true],
        o.ubicacion.observaciones && ['Detalle del trámite', o.ubicacion.observaciones, true],
    ]);

    if (o.cuadrilla) {
        y = seccion(doc, y, 'Cuadrilla');
        y = pares(doc, y, [
            ['Cuadrilla', o.cuadrilla.nombre],
            ['Vehículo', o.cuadrilla.vehiculo ? `${o.cuadrilla.vehiculo.placa} · ${o.cuadrilla.vehiculo.descripcion}` : '—'],
            ['Técnicos', o.cuadrilla.integrantes.map((i) => `${i.usuario.nombre}${i.es_jefe ? ' (jefe)' : ''}`).join(', ') || '—', true],
        ]);
    }

    y = seccion(doc, y, 'Cliente');
    y = pares(doc, y, [
        ['Nombre', o.cliente.nombre],
        ['CI', o.cliente.ci],
        ['Teléfono de contacto', o.cliente.telefono],
        ['Zona de cobertura', o.zona?.nombre || 'Fuera de zona'],
    ]);

    y = seccion(doc, y, 'Domicilio');
    y = pares(doc, y, [
        ['Dirección', `${o.solicitud.direccion}${o.solicitud.zona_referencia ? `, ${o.solicitud.zona_referencia}` : ''}`, true],
        ['Coordenadas', `${o.ubicacion.lat.toFixed(6)}, ${o.ubicacion.lng.toFixed(6)}`],
        ['Ver en el mapa', mapsUrl(o.ubicacion)],
    ]);
    if (o.ubicacion.referencia) y = recuadro(doc, y, 'Referencias del domicilio', o.ubicacion.referencia);

    // Para llenar en campo
    y = seccion(doc, y + 4, 'Material utilizado (llenar en campo)');
    autoTable(doc, {
        ...estiloTabla,
        startY: y,
        theme: 'grid',
        styles: { ...estiloTabla.styles, fontSize: 9, minCellHeight: 20, valign: 'middle' },
        head: [['Material', 'Dato / cantidad']],
        body: [['ONU – GPON SN', ''], ['ONU – MAC', ''], ['Triplexor', ''], ['Cable drop (metros)', ''], ['Roseta óptica', ''], ['Otros', '']],
        columnStyles: { 0: { cellWidth: 170, fontStyle: 'bold' } },
    });
    y = doc.lastAutoTable.finalY + 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GRIS);
    doc.text('Observaciones del técnico:', MARGEN, y);
    doc.setDrawColor(209, 213, 219);
    for (let i = 1; i <= 3; i += 1) doc.line(MARGEN, y + i * 18, ancho - MARGEN, y + i * 18);
    y += 3 * 18 + 50;

    // Firmas
    if (y > doc.internal.pageSize.getHeight() - 80) { doc.addPage(); y = 90; }
    const mitad = (ancho - MARGEN * 2) / 2;
    [['Técnico(s)', MARGEN], ['Cliente (conformidad)', MARGEN + mitad + 20]].forEach(([t, x]) => {
        doc.setDrawColor(...GRIS);
        doc.line(x, y, x + mitad - 40, y);
        doc.setFontSize(8.5);
        doc.text(`${t}: nombre, firma y fecha`, x, y + 12);
    });

    piePaginas(doc, `COTEL R.L. · Orden de trabajo ${o.numero}`);
    doc.save(`${o.numero}.pdf`);
};

/** Comprobante de solicitud para el cliente. */
export const imprimirSolicitud = (s, usuario) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    let y = encabezado(doc, `Solicitud ${s.numero}`, [
        `${s.tipo.nombre}   |   Registrada: ${fechaHora(s.created_at)}${s.creado_por ? ` por ${s.creado_por}` : ''}   |   Estado: ${s.estado.nombre}`,
        `Impreso: ${ahora()} por ${usuario}`,
    ]);

    y = seccion(doc, y, 'Cliente');
    y = pares(doc, y, [
        ['Nombre', s.cliente.nombre_completo],
        ['CI', s.cliente.ci],
        ['Teléfono de contacto', s.telefono_contacto || s.cliente.telefono],
        ['Correo', s.cliente.email],
    ]);

    y = seccion(doc, y, 'Domicilio');
    y = pares(doc, y, [
        ['Dirección', `${s.direccion}${s.zona_referencia ? `, ${s.zona_referencia}` : ''}`, true],
        ['Zona de cobertura', s.zona?.nombre || 'Fuera de las zonas de cobertura'],
        ['Coordenadas', `${s.ubicacion.lat.toFixed(6)}, ${s.ubicacion.lng.toFixed(6)}`],
        s.referencia && ['Referencias del domicilio', s.referencia, true],
    ]);

    if (s.plan) {
        y = seccion(doc, y, 'Servicios solicitados');
        const filas = [[`Internet · ${s.plan.nombre}${s.plan.velocidad ? ` (${s.plan.velocidad} Mbps)` : ''}`]];
        (s.adicionales || []).forEach((a) => filas.push([`${a.tipo === 'TV' ? 'TV cable' : 'Telefonía'} · ${a.nombre} (${a.detalle})`]));
        autoTable(doc, { ...estiloTabla, startY: y, head: [['Servicio']], body: filas, styles: { ...estiloTabla.styles, fontSize: 9.5 } });
        y = doc.lastAutoTable.finalY + 10;
        if (s.monto_mensual_ref) {
            y = recuadro(doc, y, 'Monto referencial informado',
                `Mensual: ${bs(s.monto_mensual_ref)}     Instalación: ${bs(s.monto_instalacion_ref)}\nReferencial al momento de la solicitud; no es una factura.`,
                [239, 246, 255]);
        }
    }

    y = seccion(doc, y, 'Atención');
    y = pares(doc, y, [
        ['Orden de trabajo', s.orden ? `${s.orden.numero} (${s.orden.estado.nombre})` : (s.estado.codigo === 'SIN_COBERTURA' ? 'No se generó: fuera de cobertura' : '—')],
        ['Prioridad', s.prioridad === 'ALTA' ? 'Urgente' : 'Normal'],
        s.observaciones && ['Observaciones', s.observaciones, true],
        s.motivo_anulacion && ['Motivo de anulación', s.motivo_anulacion, true],
    ]);

    piePaginas(doc, `COTEL R.L. · Solicitud ${s.numero}`);
    doc.save(`${s.numero}.pdf`);
};

/**
 * Hoja del día de una cuadrilla: sus OT en orden de visita con dirección y referencias.
 * c: una cuadrilla de /ordenes/programacion/ ({ nombre, vehiculo, integrantes, ordenes }).
 */
export const imprimirHojaDia = (c, dia, usuario) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const ordenes = c.ordenes.filter((o) => o.estado.codigo !== 'NO_EJECUTADA');
    let y = encabezado(doc, `Hoja del día · ${c.nombre}`, [
        `Fecha: ${fecha(dia)}   |   Vehículo: ${c.vehiculo ? `${c.vehiculo.placa} · ${c.vehiculo.descripcion}` : 'sin vehículo'}   |   OT: ${ordenes.length}`,
        `Técnicos: ${c.integrantes.map((i) => `${i.usuario.nombre}${i.es_jefe ? ' (jefe)' : ''}`).join(', ') || '—'}`,
        `Impreso: ${ahora()} por ${usuario}`,
    ]);
    autoTable(doc, {
        ...estiloTabla,
        startY: y,
        head: [['#', 'OT', 'Trabajo', 'Cliente', 'Dirección y referencias', 'Firma cliente']],
        body: ordenes.map((o, i) => [
            String(i + 1),
            `${o.numero}${o.prioridad === 'ALTA' ? '\nURGENTE' : ''}${o.onu ? `\nONU ${o.onu}` : ''}`,
            [o.tipo.nombre, o.solicitud.plan && `${o.solicitud.plan} · ${(o.solicitud.servicios || []).join(' + ')}`].filter(Boolean).join('\n'),
            `${o.cliente.nombre}\nCI ${o.cliente.ci}\nTel. ${o.cliente.telefono || '—'}`,
            [`${o.solicitud.direccion}${o.solicitud.zona_referencia ? `, ${o.solicitud.zona_referencia}` : ''}`,
                o.solicitud.referencia && `Ref.: ${o.solicitud.referencia}`,
                o.solicitud.lat && `${o.solicitud.lat.toFixed(6)}, ${o.solicitud.lng.toFixed(6)}`].filter(Boolean).join('\n'),
            '',
        ]),
        styles: { ...estiloTabla.styles, fontSize: 8.5, minCellHeight: 34, valign: 'top' },
        headStyles: { ...estiloTabla.headStyles, minCellHeight: 0 },
        columnStyles: { 0: { cellWidth: 22, halign: 'center' }, 1: { cellWidth: 105 }, 2: { cellWidth: 125 }, 3: { cellWidth: 130 }, 5: { cellWidth: 90 } },
    });
    y = doc.lastAutoTable.finalY + 40;
    if (y > doc.internal.pageSize.getHeight() - 60) { doc.addPage(); y = 90; }
    doc.setDrawColor(...GRIS);
    doc.line(MARGEN, y, MARGEN + 220, y);
    doc.setFontSize(8.5);
    doc.setTextColor(...GRIS);
    doc.text('Jefe de cuadrilla: nombre y firma', MARGEN, y + 12);
    piePaginas(doc, `COTEL R.L. · Hoja del día ${c.nombre} · ${fecha(dia)}`);
    doc.save(`hoja_${c.nombre.replace(/\s+/g, '_')}_${dia}.pdf`);
};

/**
 * Vale de salida de una cuadrilla (y, si ya se rindió, el resultado de la rendición).
 * d: despacho de /despachos/{id}/ (cuadrilla con vehículo e integrantes, equipos, materiales, recuperados).
 */
export const imprimirValeDespacho = (d, usuario) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const ancho = doc.internal.pageSize.getWidth();
    const servicios = (o) => ['Internet', o.tv && 'TV', o.telefonia && 'Telefonía'].filter(Boolean).join(' + ');
    const n = (x) => Number(x || 0).toLocaleString('es-BO', { maximumFractionDigits: 2 });
    let y = encabezado(doc, `Vale de salida ${d.numero}`, [
        `Fecha de trabajo: ${fecha(d.fecha)}   |   Almacén: ${d.almacen.nombre}   |   Entregó: ${d.entregado_por} (${fechaHora(d.created_at)})`,
        `Estado: ${d.estado.nombre}   |   Impreso: ${ahora()} por ${usuario}`,
    ]);
    y = seccion(doc, y, 'Cuadrilla');
    y = pares(doc, y, [
        ['Cuadrilla', d.cuadrilla.nombre],
        ['Vehículo', d.cuadrilla.vehiculo ? `${d.cuadrilla.vehiculo.placa} · ${d.cuadrilla.vehiculo.descripcion}` : '—'],
        ['Técnicos', d.cuadrilla.integrantes.map((i) => `${i.usuario.nombre}${i.es_jefe ? ' (jefe)' : ''} · cód. ${i.usuario.codigocotel}`).join('\n') || '—', true],
    ]);

    y = seccion(doc, y, `ONU entregadas (${d.equipos.length})`);
    autoTable(doc, {
        ...estiloTabla,
        startY: y,
        head: [['#', 'GPON SN', 'MAC', 'Modelo', 'Servicios', ...(d.estado.codigo === 'RENDIDO' ? ['Resultado'] : [])]],
        body: d.equipos.length ? d.equipos.map((e, i) => [
            String(i + 1), e.onu.gpon_serial || e.onu.codigo, e.onu.mac || '—', e.onu.modelo, servicios(e.onu),
            ...(d.estado.codigo === 'RENDIDO' ? [`${e.resultado.nombre}${e.orden ? ` en ${e.orden.numero}` : ''}`] : []),
        ]) : [['', 'Sin ONU', '', '', '']],
        columnStyles: { 0: { cellWidth: 22, halign: 'center' } },
    });
    y = doc.lastAutoTable.finalY + 14;

    y = seccion(doc, y, 'Material por cantidad');
    const rendido = d.estado.codigo === 'RENDIDO';
    autoTable(doc, {
        ...estiloTabla,
        startY: y,
        head: [['Material', 'Lote', 'Entregado', ...(rendido ? ['Usado', 'Devuelto', 'Faltante'] : [])]],
        body: d.materiales.length ? d.materiales.map((m) => [
            m.nombre, m.lote || '—', `${n(m.cantidad)} ${m.unidad}`,
            ...(rendido ? [n(m.usada), n(m.devuelta), n(m.faltante)] : []),
        ]) : [['Sin material', '', '']],
    });
    y = doc.lastAutoTable.finalY + 14;

    if (d.recuperados?.length) {
        y = seccion(doc, y, 'Equipos recuperados de clientes');
        autoTable(doc, {
            ...estiloTabla,
            startY: y,
            head: [['Serie', 'OT', 'Inventario', 'Observación']],
            body: d.recuperados.map((x) => [x.serial, x.orden.numero, x.en_inventario ? 'Reingresado' : 'No registrado', x.observacion || '']),
        });
        y = doc.lastAutoTable.finalY + 14;
    }
    if (d.observaciones || d.observaciones_rendicion) {
        y = recuadro(doc, y, 'Observaciones', [d.observaciones, d.observaciones_rendicion].filter(Boolean).join('\n'));
    }

    // Firmas
    y += 50;
    if (y > doc.internal.pageSize.getHeight() - 80) { doc.addPage(); y = 90; }
    const mitad = (ancho - MARGEN * 2) / 2;
    [['Entregó (almacén)', MARGEN], ['Recibió (jefe de cuadrilla)', MARGEN + mitad + 20]].forEach(([t, x]) => {
        doc.setDrawColor(...GRIS);
        doc.line(x, y, x + mitad - 40, y);
        doc.setFontSize(8.5);
        doc.setTextColor(...GRIS);
        doc.text(`${t}: nombre, firma y fecha`, x, y + 12);
    });
    piePaginas(doc, `COTEL R.L. · Vale de salida ${d.numero} · ${d.cuadrilla.nombre}`);
    doc.save(`vale_${d.numero}.pdf`);
};
