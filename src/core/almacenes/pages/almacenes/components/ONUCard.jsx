import React from 'react';
import {
    Card,
    CardBody,
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
    IoLocationOutline,
    IoCalendarOutline,
} from 'react-icons/io5';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ONUCard = ({ material, opciones, onViewDetail, onChangeState, canEdit }) => {
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

    const copyToClipboard = (text, label) => {
        if (text) {
            navigator.clipboard.writeText(text);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
        } catch {
            return 'Fecha inválida';
        }
    };

    // Proteger contra valores null
    const safeGet = (obj, path, fallback = 'Sin datos') => {
        try {
            return path.split('.').reduce((current, key) => current?.[key], obj) || fallback;
        } catch {
            return fallback;
        }
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardBody className="p-4">
                {/* Header con estado y menú */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <Chip
                            size="sm"
                            value={material?.estado_display?.nombre || 'Sin estado'}
                            color={getEstadoColor(material?.estado_display)}
                            className="mb-2"
                        />
                        <Typography variant="h6" color="blue-gray" className="font-semibold">
                            {material?.codigo_interno || 'Sin código'}
                        </Typography>
                    </div>

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
                                    onClick={() => {/* Abrir modal de cambio de estado */}}
                                    className="flex items-center gap-2"
                                >
                                    <IoSwapHorizontal className="h-4 w-4" />
                                    Cambiar Estado
                                </MenuItem>
                            )}
                        </MenuList>
                    </Menu>
                </div>

                {/* Información del modelo */}
                <div className="mb-3">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                        {safeGet(material, 'modelo_info.marca', 'Sin marca')} {safeGet(material, 'modelo_info.nombre', 'Sin modelo')}
                    </Typography>
                    <Typography variant="small" color="gray">
                        Código: {safeGet(material, 'modelo_info.codigo_modelo', 'Sin código')}
                    </Typography>
                </div>

                {/* Información de conectividad */}
                <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                        <Typography variant="small" color="gray" className="font-medium">
                            MAC Address:
                        </Typography>
                        <div className="flex items-center gap-1">
                            <Typography variant="small" color="blue-gray" className="font-mono">
                                {material?.mac_address || 'Sin MAC'}
                            </Typography>
                            {material?.mac_address && (
                                <Tooltip content="Copiar MAC">
                                    <IconButton
                                        size="sm"
                                        variant="text"
                                        onClick={() => copyToClipboard(material.mac_address, 'MAC')}
                                    >
                                        <IoCopy className="h-3 w-3" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Typography variant="small" color="gray" className="font-medium">
                            GPON Serial:
                        </Typography>
                        <div className="flex items-center gap-1">
                            <Typography variant="small" color="blue-gray" className="font-mono">
                                {material?.gpon_serial || 'Sin GPON'}
                            </Typography>
                            {material?.gpon_serial && (
                                <Tooltip content="Copiar GPON">
                                    <IconButton
                                        size="sm"
                                        variant="text"
                                        onClick={() => copyToClipboard(material.gpon_serial, 'GPON')}
                                    >
                                        <IoCopy className="h-3 w-3" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Typography variant="small" color="gray" className="font-medium">
                            D-SN:
                        </Typography>
                        <Typography variant="small" color="blue-gray" className="font-mono">
                            {material?.serial_manufacturer || 'Sin D-SN'}
                        </Typography>
                    </div>
                </div>

                {/* Información de ubicación y lote */}
                <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <IoLocationOutline className="h-4 w-4 text-gray-500" />
                        <Typography variant="small" color="blue-gray">
                            {safeGet(material, 'almacen_info.codigo', 'Sin código')} - {safeGet(material, 'almacen_info.nombre', 'Sin almacén')}
                        </Typography>
                    </div>

                    <div className="flex items-center gap-2">
                        <Typography variant="small" color="gray">
                            Lote: {safeGet(material, 'lote_info.numero_lote', 'Sin lote')}
                        </Typography>
                    </div>

                    <div className="flex items-center gap-2">
                        <IoCalendarOutline className="h-4 w-4 text-gray-500" />
                        <Typography variant="small" color="gray">
                            {formatDate(material?.created_at)}
                        </Typography>
                    </div>
                </div>

                {/* Badges adicionales */}
                <div className="flex items-center gap-1 mt-3">
                    {material?.es_nuevo && (
                        <Chip size="sm" value="Nuevo" color="green" variant="ghost" />
                    )}
                    {material?.codigo_item_equipo && (
                        <Chip
                            size="sm"
                            value={`Item: ${material.codigo_item_equipo}`}
                            color="blue"
                            variant="ghost"
                        />
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

export default ONUCard;