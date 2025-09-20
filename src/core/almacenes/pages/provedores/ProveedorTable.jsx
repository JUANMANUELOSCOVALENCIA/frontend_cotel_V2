// src/core/almacenes/pages/proveedores/ProveedorTable.jsx
import React from 'react';
import {
    Typography,
    Chip,
    IconButton,
    Tooltip,
    Spinner
} from '@material-tailwind/react';
import {
    IoEyeOutline,
    IoPencilOutline,
    IoTrashOutline,
    IoBusinessOutline,
    IoMailOutline,
    IoCallOutline
} from 'react-icons/io5';

const ProveedorTable = ({ proveedores, loading, onEdit, onDelete, onDetail }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!proveedores || proveedores.length === 0) {
        return (
            <div className="text-center py-12">
                <IoBusinessOutline className="mx-auto h-12 w-12 text-gray-400" />
                <Typography variant="h6" color="blue-gray" className="mt-4">
                    No hay proveedores registrados
                </Typography>
                <Typography color="gray" className="mt-2">
                    Comienza creando tu primer proveedor
                </Typography>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left">
                <thead>
                <tr>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Proveedor
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Descripcion
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Contacto
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Estado
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Fecha Registro
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Acciones
                        </Typography>
                    </th>
                </tr>
                </thead>
                <tbody>
                {proveedores.map((proveedor, index) => {
                    const isLast = index === proveedores.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                        <tr key={proveedor.id} className="hover:bg-blue-gray-50/50">
                            {/* Proveedor */}
                            <td className={classes}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-full">
                                        <IoBusinessOutline className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                            {proveedor.nombre_comercial}
                                        </Typography>
                                        {proveedor.codigo && (
                                            <Typography variant="small" color="gray" className="font-normal">
                                                Código: {proveedor.codigo}
                                            </Typography>
                                        )}
                                    </div>
                                </div>
                            </td>

                            {/* Razón Social */}
                            <td className={classes}>
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {proveedor.razon_social || '-'}
                                </Typography>
                            </td>

                            {/* Contacto */}
                            <td className={classes}>
                                <div className="flex flex-col gap-1">
                                    {proveedor.contacto_principal && (
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                            {proveedor.contacto_principal}
                                        </Typography>
                                    )}
                                    <div className="flex items-center gap-4">
                                        {proveedor.telefono && (
                                            <div className="flex items-center gap-1">
                                                <IoCallOutline className="h-3 w-3 text-gray-500" />
                                                <Typography variant="small" color="gray">
                                                    {proveedor.telefono}
                                                </Typography>
                                            </div>
                                        )}
                                        {proveedor.email && (
                                            <div className="flex items-center gap-1">
                                                <IoMailOutline className="h-3 w-3 text-gray-500" />
                                                <Typography variant="small" color="gray">
                                                    {proveedor.email}
                                                </Typography>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>

                            {/* Estado */}
                            <td className={classes}>
                                <Chip
                                    variant="ghost"
                                    color={proveedor.activo ? "green" : "red"}
                                    size="sm"
                                    value={proveedor.activo ? "Activo" : "Inactivo"}
                                    icon={
                                        <span
                                            className={`mx-auto mt-1 block h-2 w-2 rounded-full ${
                                                proveedor.activo ? 'bg-green-900' : 'bg-red-900'
                                            } content-['']`}
                                        />
                                    }
                                />
                            </td>

                            {/* Fecha */}
                            <td className={classes}>
                                <Typography variant="small" color="gray" className="font-normal">
                                    {formatDate(proveedor.created_at)}
                                </Typography>
                            </td>

                            {/* Acciones */}
                            <td className={classes}>
                                <div className="flex items-center gap-2">
                                    <Tooltip content="Ver detalles">
                                        <IconButton
                                            variant="text"
                                            color="blue-gray"
                                            onClick={() => onDetail(proveedor)}
                                        >
                                            <IoEyeOutline className="h-4 w-4" />
                                        </IconButton>
                                    </Tooltip>

                                    {onEdit && (
                                        <Tooltip content="Editar">
                                            <IconButton
                                                variant="text"
                                                color="blue-gray"
                                                onClick={() => onEdit(proveedor)}
                                            >
                                                <IoPencilOutline className="h-4 w-4" />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    {onDelete && (
                                        <Tooltip content="Eliminar">
                                            <IconButton
                                                variant="text"
                                                color="red"
                                                onClick={() => onDelete(proveedor)}
                                            >
                                                <IoTrashOutline className="h-4 w-4" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </div>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default ProveedorTable;