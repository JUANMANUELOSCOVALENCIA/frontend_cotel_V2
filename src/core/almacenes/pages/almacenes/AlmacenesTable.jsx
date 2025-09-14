// ======================================================
// src/core/almacenes/pages/almacenes/AlmacenesTable.jsx
// ======================================================

import React from 'react';
import {
    Typography,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    Spinner
} from '@material-tailwind/react';
import {
    IoEyeOutline,
    IoPencilOutline,
    IoTrashOutline,
    IoHomeOutline,
    IoBusinessOutline,
    IoLocationOutline
} from 'react-icons/io5';

const AlmacenesTable = ({
                            almacenes,
                            loading,
                            error,
                            onEdit,
                            onDelete,
                            onDetail,
                            onClearError
                        }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert color="red" className="m-4" dismissible onClose={onClearError}>
                {error}
            </Alert>
        );
    }

    if (!almacenes || almacenes.length === 0) {
        return (
            <div className="text-center py-12">
                <IoBusinessOutline className="mx-auto h-12 w-12 text-gray-400" />
                <Typography variant="h6" color="blue-gray" className="mt-4">
                    No hay almacenes registrados
                </Typography>
                <Typography color="gray" className="mt-2">
                    Comienza creando tu primer almacén
                </Typography>
            </div>
        );
    }

    const getEstadoChip = (activo) => {
        return (
            <Chip
                variant="ghost"
                color={activo ? "green" : "red"}
                size="sm"
                value={activo ? "Activo" : "Inactivo"}
                icon={
                    <span
                        className={`mx-auto mt-1 block h-2 w-2 rounded-full ${
                            activo ? 'bg-green-900' : 'bg-red-900'
                        } content-['']`}
                    />
                }
            />
        );
    };

    const getTipoIcon = (tipo) => {
        switch (tipo?.codigo) {
            case 'PRINCIPAL':
                return <IoHomeOutline className="h-4 w-4 text-blue-500" />;
            case 'REGIONAL':
                return <IoBusinessOutline className="h-4 w-4 text-green-500" />;
            case 'TEMPORAL':
                return <IoLocationOutline className="h-4 w-4 text-orange-500" />;
            default:
                return <IoBusinessOutline className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatEncargado = (encargadoInfo) => {
        if (!encargadoInfo) return 'Sin asignar';
        return `${encargadoInfo.nombre_completo} (${encargadoInfo.codigo_cotel})`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left">
                <thead>
                <tr>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                        >
                            Código & Nombre
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                        >
                            Tipo & Ubicación
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                        >
                            Encargado
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                        >
                            Inventario
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                        >
                            Estado
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70"
                        >
                            Acciones
                        </Typography>
                    </th>
                </tr>
                </thead>
                <tbody>
                {almacenes.map((almacen, index) => {
                    const isLast = index === almacenes.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                        <tr key={almacen.id} className="hover:bg-blue-gray-50/50">
                            {/* Código & Nombre */}
                            <td className={classes}>
                                <div className="flex items-center gap-3">
                                    {almacen.es_principal && (
                                        <div className="p-1 bg-blue-500/10 rounded-full">
                                            <IoHomeOutline className="h-4 w-4 text-blue-500" />
                                        </div>
                                    )}
                                    <div>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                            {almacen.codigo}
                                        </Typography>
                                        <Typography variant="small" color="gray" className="font-normal">
                                            {almacen.nombre}
                                        </Typography>
                                    </div>
                                </div>
                            </td>

                            {/* Tipo & Ubicación */}
                            <td className={classes}>
                                <div className="flex items-center gap-2">
                                    {getTipoIcon(almacen.tipo_info)}
                                    <div>
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                            {almacen.tipo_info?.nombre || 'Sin tipo'}
                                        </Typography>
                                        <Typography variant="small" color="gray" className="font-normal">
                                            {almacen.ciudad}
                                        </Typography>
                                    </div>
                                </div>
                            </td>

                            {/* Encargado */}
                            <td className={classes}>
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {formatEncargado(almacen.encargado_info)}
                                </Typography>
                            </td>

                            {/* Inventario */}
                            <td className={classes}>
                                <div className="flex flex-col">
                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                        {almacen.total_materiales || 0} materiales
                                    </Typography>
                                    <Typography variant="small" color="green" className="font-normal">
                                        {almacen.materiales_disponibles || 0} disponibles
                                    </Typography>
                                </div>
                            </td>

                            {/* Estado */}
                            <td className={classes}>
                                {getEstadoChip(almacen.activo)}
                            </td>

                            {/* Acciones */}
                            <td className={classes}>
                                <div className="flex items-center gap-2">
                                    <Tooltip content="Ver detalles">
                                        <IconButton
                                            variant="text"
                                            color="blue-gray"
                                            onClick={() => onDetail(almacen)}
                                        >
                                            <IoEyeOutline className="h-4 w-4" />
                                        </IconButton>
                                    </Tooltip>

                                    {onEdit && (
                                        <Tooltip content="Editar">
                                            <IconButton
                                                variant="text"
                                                color="blue-gray"
                                                onClick={() => onEdit(almacen)}
                                            >
                                                <IoPencilOutline className="h-4 w-4" />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    {onDelete && !almacen.es_principal && (
                                        <Tooltip content="Eliminar">
                                            <IconButton
                                                variant="text"
                                                color="red"
                                                onClick={() => onDelete(almacen)}
                                            >
                                                <IoTrashOutline className="h-4 w-4" />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    {almacen.es_principal && (
                                        <Tooltip content="No se puede eliminar el almacén principal">
                                            <IconButton
                                                variant="text"
                                                color="gray"
                                                disabled
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

export default AlmacenesTable;