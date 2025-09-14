import React, { useState } from 'react';
import {
    Typography,
    Chip,
    IconButton,
    Tooltip,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
} from '@material-tailwind/react';
import {
    IoEye,
    IoEllipsisVertical,
    IoSwapHorizontal,
    IoCopy,
    IoArrowUp,
    IoArrowDown,
} from 'react-icons/io5';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ONUTable = ({ materiales, opciones, onViewDetail, onChangeState, canEdit }) => {
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    const getEstadoColor = (estado) => {
        if (!estado) return 'gray';

        const colorMap = {
            'NUEVO': 'gray',
            'DISPONIBLE': 'green',
            'RESERVADO': 'amber',
            'ASIGNADO': 'blue',
            'INSTALADO': 'purple',
            'EN_LABORATORIO': 'orange',
            'DEFECTUOSO': 'red',
            'DEVUELTO_PROVEEDOR': 'gray',
            'REINGRESADO': 'cyan',
            'DADO_DE_BAJA': 'black'
        };

        return colorMap[estado.nombre] || 'gray';
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const SortableHeader = ({ field, children }) => (
        <th
            className="border-b border-blue-gray-50 py-3 px-4 text-left cursor-pointer hover:bg-blue-gray-50"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-2">
                <Typography variant="small" color="blue-gray" className="font-semibold">
                    {children}
                </Typography>
                {sortField === field && (
                    sortDirection === 'asc' ?
                        <IoArrowUp className="h-3 w-3" /> :
                        <IoArrowDown className="h-3 w-3" />
                )}
            </div>
        </th>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left">
                <thead>
                <tr>
                    <SortableHeader field="codigo_interno">Código</SortableHeader>
                    <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                            Estado
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                            Modelo
                        </Typography>
                    </th>
                    <SortableHeader field="mac_address">MAC Address</SortableHeader>
                    <SortableHeader field="gpon_serial">GPON Serial</SortableHeader>
                    <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                            D-SN
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                            Almacén
                        </Typography>
                    </th>
                    <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                            Lote
                        </Typography>
                    </th>
                    <SortableHeader field="created_at">Fecha Ingreso</SortableHeader>
                    <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                            Acciones
                        </Typography>
                    </th>
                </tr>
                </thead>
                <tbody>
                {materiales.map((material) => (
                    <tr key={material.id} className="hover:bg-blue-gray-50">
                        <td className="py-3 px-4">
                            <div className="flex flex-col">
                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                    {material.codigo_interno}
                                </Typography>
                                {material.es_nuevo && (
                                    <Chip size="sm" value="Nuevo" color="green" variant="ghost" className="w-fit" />
                                )}
                            </div>
                        </td>
                        <td className="py-3 px-4">
                            <Chip
                                size="sm"
                                value={material.estado_display?.nombre || 'Sin estado'}
                                color={getEstadoColor(material.estado_display)}
                            />
                        </td>
                        <td className="py-3 px-4">
                            <div className="flex flex-col">
                                <Typography variant="small" color="blue-gray" className="font-medium">
                                    {material.modelo_info.marca} {material.modelo_info.nombre}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    #{material.modelo_info.codigo_modelo}
                                </Typography>
                            </div>
                        </td>
                        <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                                <Typography variant="small" color="blue-gray" className="font-mono">
                                    {material.mac_address}
                                </Typography>
                                <Tooltip content="Copiar MAC">
                                    <IconButton
                                        size="sm"
                                        variant="text"
                                        onClick={() => copyToClipboard(material.mac_address)}
                                    >
                                        <IoCopy className="h-3 w-3" />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </td>
                        <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                                <Typography variant="small" color="blue-gray" className="font-mono">
                                    {material.gpon_serial}
                                </Typography>
                                <Tooltip content="Copiar GPON">
                                    <IconButton
                                        size="sm"
                                        variant="text"
                                        onClick={() => copyToClipboard(material.gpon_serial)}
                                    >
                                        <IoCopy className="h-3 w-3" />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </td>
                        <td className="py-3 px-4">
                            <Typography variant="small" color="blue-gray" className="font-mono">
                                {material.serial_manufacturer}
                            </Typography>
                        </td>
                        <td className="py-3 px-4">
                            <div className="flex flex-col">
                                <Typography variant="small" color="blue-gray" className="font-medium">
                                    {material.almacen_info.codigo}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    {material.almacen_info.nombre}
                                </Typography>
                            </div>
                        </td>
                        <td className="py-3 px-4">
                            <Typography variant="small" color="blue-gray">
                                {material.lote_info.numero_lote}
                            </Typography>
                        </td>
                        <td className="py-3 px-4">
                            <Typography variant="small" color="gray">
                                {formatDate(material.created_at)}
                            </Typography>
                        </td>
                        <td className="py-3 px-4">
                            <Menu placement="bottom-end">
                                <MenuHandler>
                                    <IconButton variant="text" size="sm">
                                        <IoEllipsisVertical className="h-4 w-4" />
                                    </IconButton>
                                </MenuHandler>
                                <MenuList>
                                    <MenuItem
                                        onClick={() => onViewDetail(material)}
                                        className="flex items-center gap-2"
                                    >
                                        <IoEye className="h-4 w-4" />
                                        Ver Detalle
                                    </MenuItem>
                                    {canEdit && (
                                        <MenuItem
                                            onClick={() => {/* Implementar cambio de estado */}}
                                            className="flex items-center gap-2"
                                        >
                                            <IoSwapHorizontal className="h-4 w-4" />
                                            Cambiar Estado
                                        </MenuItem>
                                    )}
                                </MenuList>
                            </Menu>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ONUTable;