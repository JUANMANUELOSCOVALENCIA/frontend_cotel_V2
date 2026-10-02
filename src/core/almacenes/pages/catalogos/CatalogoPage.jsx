// src/core/almacenes/pages/catalogos/CatalogoPage.jsx
// Pantalla reutilizable para los catálogos de almacenes (proveedores, marcas, componentes,
// modelos, almacenes). Cada catálogo solo define sus columnas y su formulario.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
    IoAddOutline, IoRefreshOutline, IoCreateOutline, IoEllipsisVertical,
    IoTrashOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoFileTrayOutline,
} from 'react-icons/io5';
import { usePermissions } from '../../../permissions/hooks/usePermissions';
import {
    PageHeader, Card, Button, IconButton, SearchInput, SelectInput, Badge, Dropdown,
    EmptyState, Spinner, ConfirmModal, Modal, cx,
} from '../../../../shared/components/ui';
import CampoForm, { validarCampos } from './CampoForm';

const quitarAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Props principales:
 *  titulo, subtitulo, recurso ('marcas'), api (de catalogosService), singular ('marca'), genero ('a' | 'o')
 *  columnas: [{ label, render: (item) => node, className }]
 *  campos:   config del formulario (ver CampoForm) o renderFormulario({ valores, set, errores, item })
 *  valoresIniciales(item|null) -> objeto del formulario
 *  preparar(valores) -> datos a enviar
 *  textoBusqueda(item) -> texto donde buscar
 *  filtros: [{ key, label, opciones: [{value,label}], aplicar: (item, valor) => bool }]
 *  validar(valores) -> { campo: 'mensaje' } (validaciones extra)
 */
const CatalogoPage = ({
    titulo, subtitulo, recurso, api, singular, genero = 'o', icono = IoFileTrayOutline,
    columnas, campos, renderFormulario, valoresIniciales, preparar = (v) => v,
    textoBusqueda, filtros = [], validar, anchoModal = 'md', nombreDe = (i) => i.nombre,
    alGuardar,
}) => {
    const { hasPermission } = usePermissions();
    const puede = useMemo(() => ({
        crear: hasPermission(recurso, 'crear'),
        editar: hasPermission(recurso, 'actualizar'),
        eliminar: hasPermission(recurso, 'eliminar'),
    }), [hasPermission, recurso]);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [estado, setEstado] = useState('activos');
    const [valoresFiltro, setValoresFiltro] = useState({});

    const [form, setForm] = useState(null); // { item|null }
    const [valores, setValores] = useState({});
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);
    const [borrar, setBorrar] = useState({ item: null, loading: false });

    const nuevo = `Nuev${genero} ${singular}`;

    const cargar = useCallback(async () => {
        setLoading(true);
        const r = await api.listar();
        if (r.success) setItems(r.data);
        else toast.error(r.error);
        setLoading(false);
    }, [api]);

    useEffect(() => { cargar(); }, [cargar]);

    const visibles = useMemo(() => {
        const q = quitarAcentos(busqueda.trim());
        return items.filter((it) =>
            (estado === '' || (estado === 'activos' ? it.activo : !it.activo)) &&
            (!q || quitarAcentos(textoBusqueda(it)).includes(q)) &&
            filtros.every((f) => !valoresFiltro[f.key] || f.aplicar(it, valoresFiltro[f.key]))
        );
    }, [items, busqueda, estado, valoresFiltro, filtros, textoBusqueda]);

    const contadores = useMemo(() => ({
        activos: items.filter((i) => i.activo).length,
        inactivos: items.filter((i) => !i.activo).length,
    }), [items]);

    // ---------- Formulario ----------
    const abrir = (item = null) => {
        setValores(valoresIniciales(item));
        setErrores({});
        setForm({ item });
    };
    const set = useCallback((campo, valor) => {
        setValores((v) => ({ ...v, [campo]: valor }));
        setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
    }, []);

    const guardar = async (e) => {
        e?.preventDefault();
        const errs = { ...(campos ? validarCampos(campos, valores) : {}), ...(validar ? validar(valores, form.item) : {}) };
        Object.keys(errs).forEach((k) => !errs[k] && delete errs[k]);
        if (Object.keys(errs).length) { setErrores(errs); return; }

        setGuardando(true);
        const datos = preparar(valores, form.item);
        const r = form.item ? await api.actualizar(form.item.id, datos) : await api.crear(datos);
        setGuardando(false);
        if (!r.success) {
            if (Object.keys(r.fieldErrors || {}).length) setErrores(r.fieldErrors);
            toast.error(r.error);
            return;
        }
        toast.success(form.item ? `${singular[0].toUpperCase()}${singular.slice(1)} actualizad${genero}` : `${singular[0].toUpperCase()}${singular.slice(1)} cread${genero}`);
        setForm(null);
        alGuardar?.(r.data);
        cargar();
    };

    // ---------- Acciones ----------
    const cambiarEstado = async (item) => {
        const r = await api.cambiarEstado(item);
        if (!r.success) { toast.error(r.error); return; }
        toast.success(`${nombreDe(item)}: ${item.activo ? 'desactivad' : 'activad'}${genero}`);
        cargar();
    };
    const eliminar = async () => {
        setBorrar((b) => ({ ...b, loading: true }));
        const r = await api.eliminar(borrar.item.id);
        if (!r.success) {
            setBorrar((b) => ({ ...b, loading: false }));
            toast.error(r.error, { duration: 7000 });
            return;
        }
        toast.success(`${nombreDe(borrar.item)} eliminad${genero}`);
        setBorrar({ item: null, loading: false });
        cargar();
    };

    const hayAcciones = puede.editar || puede.eliminar;
    const totalCols = columnas.length + 1 + (hayAcciones ? 1 : 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title={titulo}
                subtitle={subtitulo}
                actions={
                    <>
                        <Button variant="secondary" icon={IoRefreshOutline} onClick={cargar} disabled={loading}>Actualizar</Button>
                        {puede.crear && <Button icon={IoAddOutline} onClick={() => abrir()}>{nuevo}</Button>}
                    </>
                }
            />

            <Card className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <SearchInput className="lg:flex-1" value={busqueda} onChange={setBusqueda} placeholder="Buscar…" />
                    {filtros.map((f) => (
                        <SelectInput key={f.key} className="lg:w-52" value={valoresFiltro[f.key] || ''} onChange={(e) => setValoresFiltro((v) => ({ ...v, [f.key]: e.target.value }))}>
                            <option value="">{f.label}</option>
                            {f.opciones.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </SelectInput>
                    ))}
                    <SelectInput className="lg:w-44" value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <option value="activos">Activ{genero}s ({contadores.activos})</option>
                        <option value="inactivos">Inactiv{genero}s ({contadores.inactivos})</option>
                        <option value="">Todos ({items.length})</option>
                    </SelectInput>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="border-b border-gray-200 px-4 py-3">
                    <p className="font-semibold text-gray-800">{titulo} <span className="font-normal text-gray-500">({visibles.length})</span></p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                {columnas.map((c) => <th key={c.label} className={cx('px-4 py-3 font-semibold', c.className)}>{c.label}</th>)}
                                <th className="px-4 py-3 font-semibold">Estado</th>
                                {hayAcciones && <th className="w-24 px-4 py-3 text-right font-semibold">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !items.length && (
                                <tr><td colSpan={totalCols} className="py-12"><div className="flex justify-center text-orange-500"><Spinner className="h-6 w-6" /></div></td></tr>
                            )}
                            {!loading && !visibles.length && (
                                <tr><td colSpan={totalCols}>
                                    <EmptyState icon={icono} title={items.length ? 'Nada coincide con la búsqueda o los filtros' : `Aún no hay ${titulo.toLowerCase()}`} />
                                </td></tr>
                            )}
                            {visibles.map((item) => (
                                <tr key={item.id} className={cx('align-top hover:bg-gray-50', !item.activo && 'opacity-60')}>
                                    {columnas.map((c) => <td key={c.label} className={cx('px-4 py-3', c.className)}>{c.render(item)}</td>)}
                                    <td className="px-4 py-3"><Badge color={item.activo ? 'green' : 'gray'}>{item.activo ? `Activ${genero}` : `Inactiv${genero}`}</Badge></td>
                                    {hayAcciones && (
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                {puede.editar && <IconButton icon={IoCreateOutline} title="Editar" tone="primary" onClick={() => abrir(item)} />}
                                                <Dropdown
                                                    trigger={<IconButton icon={IoEllipsisVertical} title="Más acciones" />}
                                                    items={[
                                                        puede.editar && (item.activo
                                                            ? { label: 'Desactivar', icon: IoCloseCircleOutline, onClick: () => cambiarEstado(item) }
                                                            : { label: 'Activar', icon: IoCheckmarkCircleOutline, onClick: () => cambiarEstado(item) }),
                                                        puede.eliminar && puede.editar && { divider: true },
                                                        puede.eliminar && { label: 'Eliminar', icon: IoTrashOutline, danger: true, onClick: () => setBorrar({ item, loading: false }) },
                                                    ]}
                                                />
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                open={!!form}
                onClose={() => setForm(null)}
                busy={guardando}
                size={anchoModal}
                title={form?.item ? `Editar ${singular}` : nuevo}
                subtitle={form?.item ? nombreDe(form.item) : undefined}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setForm(null)} disabled={guardando}>Cancelar</Button>
                        <Button onClick={guardar} loading={guardando}>{form?.item ? 'Guardar cambios' : 'Crear'}</Button>
                    </>
                }
            >
                {form && (
                    <form onSubmit={guardar} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {campos && campos.map((c) => (
                            <CampoForm key={c.name} campo={c} valor={valores[c.name]} error={errores[c.name]} onChange={(v) => set(c.name, v)} disabled={guardando} />
                        ))}
                        {renderFormulario && renderFormulario({ valores, set, errores, item: form.item, disabled: guardando })}
                        <button type="submit" className="hidden" aria-hidden />
                    </form>
                )}
            </Modal>

            <ConfirmModal
                open={!!borrar.item}
                danger
                loading={borrar.loading}
                title={`Eliminar ${singular}`}
                confirmText="Eliminar"
                message={<>¿Eliminar <strong>{borrar.item && nombreDe(borrar.item)}</strong>? Si ya se usó en lotes o materiales no se podrá eliminar; en ese caso desactívalo.</>}
                onClose={() => !borrar.loading && setBorrar({ item: null, loading: false })}
                onConfirm={eliminar}
            />
        </div>
    );
};

export default CatalogoPage;
