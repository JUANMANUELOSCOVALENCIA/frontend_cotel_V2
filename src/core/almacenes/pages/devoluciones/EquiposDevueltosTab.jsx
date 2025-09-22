// src/core/almacenes/pages/devoluciones/EquiposDevueltosTab.jsx
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Input,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Select,
    Option
} from '@material-tailwind/react';
import {
    IoSearch,
    IoRefresh,
    IoAdd,
    IoEye,
    IoCheckmarkCircle,
    IoBusinessOutline,
    IoClose
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';

// Hooks
import { api } from '../../../../services/api';

const EquiposDevueltosTab = ({ onSuccess, loading: parentLoading }) => {
    const [equiposDevueltos, setEquiposDevueltos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEquipos, setFilteredEquipos] = useState([]);
    const [selectedEquipo, setSelectedEquipo] = useState(null);
    const [reingresoDialog, setReingresoDialog] = useState(false);

    const { register, handleSubmit, control, formState: { errors }, reset } = useForm();

    useEffect(() => {
        loadEquiposDevueltos();
    }, []);

    useEffect(() => {
        // Filtrar equipos cuando cambia el término de búsqueda
        if (searchTerm.trim() === '') {
            setFilteredEquipos(equiposDevueltos);
        } else {
            const filtered = equiposDevueltos.filter(equipo =>
                equipo.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipo.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipo.gpon_serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipo.lote_info?.numero_lote?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEquipos(filtered);
        }
    }, [searchTerm, equiposDevueltos]);

    const loadEquiposDevueltos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/almacenes/sectores/reingreso/');

            if (response.data) {
                setEquiposDevueltos(response.data.materiales || []);
                setFilteredEquipos(response.data.materiales || []);
            }
        } catch (error) {
            console.error('Error cargando equipos devueltos:', error);
            toast.error('Error al cargar equipos devueltos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReingreso = (equipo) => {
        setSelectedEquipo(equipo);
        setReingresoDialog(true);
        reset(); // Limpiar formulario
    };

    const handleCloseReingreso = () => {
        setReingresoDialog(false);
        setSelectedEquipo(null);
        reset();
    };

    const handleRegistrarReingreso = async (data) => {
        try {
            setLoading(true);

            const reingresoData = {
                materiales_originales_ids: [selectedEquipo.id],
                nuevos_equipos: [{
                    mac_address: data.mac_address,
                    gpon_serial: data.gpon_serial,
                    serial_manufacturer: data.serial_manufacturer || null,
                    codigo_item_equipo: selectedEquipo.codigo_item_equipo,
                }]
            };

            const response = await api.post('/almacenes/sectores/reingreso/', reingresoData);

            if (response.data.success) {
                toast.success('Reposición registrada exitosamente');
                handleCloseReingreso();
                await loadEquiposDevueltos();
                onSuccess();
            }
        } catch (error) {
            console.error('Error registrando reingreso:', error);
            toast.error(error.response?.data?.error || 'Error al registrar reposición');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    if (loading || parentLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <Typography color="gray">Cargando equipos devueltos...</Typography>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {/* Header con búsqueda y acciones */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex-1 max-w-md">
                        <Input
                            label="Buscar equipos devueltos..."
                            icon={<IoSearch className="h-5 w-5" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Tooltip content="Actualizar lista">
                            <IconButton
                                variant="outlined"
                                color="blue-gray"
                                onClick={loadEquiposDevueltos}
                                disabled={loading}
                            >
                                <IoRefresh className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>

                {/* Información */}
                <Alert color="amber">
                    <div className="flex items-start gap-2">
                        <IoBusinessOutline className="h-5 w-5 mt-0.5" />
                        <div>
                            <Typography variant="small" className="font-medium">
                                Equipos Devueltos al Sector: {filteredEquipos.length}
                            </Typography>
                            <Typography variant="small" className="mt-1">
                                Estos equipos están en el sector solicitante esperando reposición del proveedor.
                            </Typography>
                        </div>
                    </div>
                </Alert>

                {/* Lista de equipos */}
                {filteredEquipos.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-8">
                            <IoCheckmarkCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                            <Typography color="gray" className="mb-2">
                                No hay equipos devueltos al sector
                            </Typography>
                            <Typography variant="small" color="gray">
                                Todos los equipos defectuosos han sido gestionados
                            </Typography>
                        </CardBody>
                    </Card>
                ) : (
                    <Card>
                        <CardBody className="px-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-max table-auto text-left">
                                    <thead>
                                    <tr>
                                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                                Equipo
                                            </Typography>
                                        </th>
                                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                                Lote / Sector
                                            </Typography>
                                        </th>
                                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                                Modelo
                                            </Typography>
                                        </th>
                                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                                Fecha Devolución
                                            </Typography>
                                        </th>
                                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                                Estado
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
                                    {filteredEquipos.map((equipo) => (
                                        <tr key={equipo.id} className="even:bg-blue-gray-50/50">
                                            <td className="p-4">
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                                        {equipo.codigo_interno}
                                                    </Typography>
                                                    <Typography variant="small" color="gray" className="opacity-70">
                                                        MAC: {equipo.mac_address}
                                                    </Typography>
                                                    <Typography variant="small" color="gray" className="opacity-70">
                                                        GPON: {equipo.gpon_serial}
                                                    </Typography>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                                        {equipo.lote_info?.numero_lote || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="small" color="gray" className="opacity-70">
                                                        Sector: {equipo.lote_info?.sector_solicitante || 'N/A'}
                                                    </Typography>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {equipo.modelo_info?.nombre || 'N/A'}
                                                </Typography>
                                            </td>
                                            <td className="p-4">
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {formatDate(equipo.fecha_devolucion_sector)}
                                                </Typography>
                                            </td>
                                            <td className="p-4">
                                                <Chip
                                                    size="sm"
                                                    variant="gradient"
                                                    color="amber"
                                                    value="DEVUELTO A SECTOR"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1">
                                                    <Tooltip content="Ver detalles">
                                                        <IconButton
                                                            variant="text"
                                                            color="blue"
                                                            size="sm"
                                                        >
                                                            <IoEye className="h-4 w-4" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip content="Registrar reposición">
                                                        <IconButton
                                                            variant="text"
                                                            color="green"
                                                            size="sm"
                                                            onClick={() => handleOpenReingreso(equipo)}
                                                        >
                                                            <IoAdd className="h-4 w-4" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>

            {/* Dialog de Reingreso */}
            <Dialog open={reingresoDialog} handler={handleCloseReingreso} size="md">
                <form onSubmit={handleSubmit(handleRegistrarReingreso)}>
                    <DialogHeader className="flex items-center justify-between">
                        <Typography variant="h5">Registrar Reposición</Typography>
                        <IconButton
                            color="blue-gray"
                            size="sm"
                            variant="text"
                            onClick={handleCloseReingreso}
                        >
                            <IoClose className="h-5 w-5" />
                        </IconButton>
                    </DialogHeader>

                    <DialogBody>
                        <div className="space-y-4">
                            {/* Información del equipo original - SOLO LECTURA */}
                            <Alert color="amber">
                                <Typography variant="small" className="font-medium mb-1">
                                    Equipo Original a Reemplazar:
                                </Typography>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><strong>Código:</strong> {selectedEquipo?.codigo_interno}</div>
                                    <div><strong>Item Equipo:</strong> {selectedEquipo?.codigo_item_equipo}</div>
                                    <div><strong>MAC:</strong> {selectedEquipo?.mac_address}</div>
                                    <div><strong>GPON:</strong> {selectedEquipo?.gpon_serial}</div>
                                    <div><strong>D_SN:</strong> {selectedEquipo?.serial_manufacturer || 'No tiene'}</div>
                                </div>
                            </Alert>

                            <Typography variant="h6" color="blue-gray">
                                Nuevo Equipo de Reposición
                            </Typography>

                            {/* Solo los campos que SÍ cambian */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="MAC Address *"
                                    {...register('mac_address', {
                                        required: 'La MAC address es obligatoria'
                                    })}
                                    error={!!errors.mac_address}
                                />

                                <Input
                                    label="GPON Serial *"
                                    {...register('gpon_serial', {
                                        required: 'El GPON serial es obligatorio'
                                    })}
                                    error={!!errors.gpon_serial}
                                />

                                <Input
                                    label="Serial Manufacturer (D_SN)"
                                    {...register('serial_manufacturer')}
                                    className="md:col-span-2"
                                />
                            </div>

                            <Input
                                label="Observaciones"
                                {...register('observaciones')}
                            />
                        </div>
                    </DialogBody>

                    <DialogFooter>
                        <Button
                            variant="text"
                            color="red"
                            onClick={handleCloseReingreso}
                            className="mr-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            color="green"
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <IoAdd className="h-4 w-4" />
                            Registrar Reposición
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>
        </>
    );
};

export default EquiposDevueltosTab;