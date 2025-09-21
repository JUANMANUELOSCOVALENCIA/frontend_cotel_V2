// src/core/almacenes/pages/devoluciones/EquiposDefectuososTab.jsx
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
    Checkbox
} from '@material-tailwind/react';
import {
    IoSearch,
    IoRefresh,
    IoReturnUpBack,
    IoEye,
    IoCheckmarkCircle,
    IoWarning
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

// Hooks
import { useMateriales } from '../../hooks/useMateriales';
import { api } from '../../../../services/api';

const EquiposDefectuososTab = ({ onSuccess, loading: parentLoading }) => {
    const [equiposDefectuosos, setEquiposDefectuosos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEquipos, setSelectedEquipos] = useState([]);
    const [filteredEquipos, setFilteredEquipos] = useState([]);

    useEffect(() => {
        loadEquiposDefectuosos();
    }, []);

    useEffect(() => {
        // Filtrar equipos cuando cambia el término de búsqueda
        if (searchTerm.trim() === '') {
            setFilteredEquipos(equiposDefectuosos);
        } else {
            const filtered = equiposDefectuosos.filter(equipo =>
                equipo.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipo.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipo.gpon_serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipo.lote_info?.numero_lote?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEquipos(filtered);
        }
    }, [searchTerm, equiposDefectuosos]);

    const loadEquiposDefectuosos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/almacenes/materiales/defectuosos/');

            if (response.data) {
                setEquiposDefectuosos(response.data.materiales || []);
                setFilteredEquipos(response.data.materiales || []);
            }
        } catch (error) {
            console.error('Error cargando equipos defectuosos:', error);
            toast.error('Error al cargar equipos defectuosos');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEquipo = (equipoId) => {
        setSelectedEquipos(prev => {
            if (prev.includes(equipoId)) {
                return prev.filter(id => id !== equipoId);
            } else {
                return [...prev, equipoId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedEquipos.length === filteredEquipos.length) {
            setSelectedEquipos([]);
        } else {
            setSelectedEquipos(filteredEquipos.map(e => e.id));
        }
    };

    const handleDevolverAlSector = async () => {
        if (selectedEquipos.length === 0) {
            toast.error('Selecciona al menos un equipo para devolver');
            return;
        }

        try {
            setLoading(true);

            const response = await api.post('/almacenes/materiales/devolver_a_sector/', {
                materiales_ids: selectedEquipos,
                motivo: 'Equipo defectuoso devuelto al sector solicitante para gestión de reposición'
            });

            if (response.data.success) {
                toast.success(`${response.data.count} equipos devueltos al sector`);
                setSelectedEquipos([]);
                await loadEquiposDefectuosos();
                onSuccess();
            }
        } catch (error) {
            console.error('Error devolviendo equipos:', error);
            toast.error(error.response?.data?.error || 'Error al devolver equipos');
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <Typography color="gray">Cargando equipos defectuosos...</Typography>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header con búsqueda y acciones */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1 max-w-md">
                    <Input
                        label="Buscar equipos..."
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
                            onClick={loadEquiposDefectuosos}
                            disabled={loading}
                        >
                            <IoRefresh className="h-4 w-4" />
                        </IconButton>
                    </Tooltip>

                    <Button
                        color="amber"
                        className="flex items-center gap-2"
                        onClick={handleDevolverAlSector}
                        disabled={selectedEquipos.length === 0 || loading}
                    >
                        <IoReturnUpBack className="h-4 w-4" />
                        Devolver al Sector ({selectedEquipos.length})
                    </Button>
                </div>
            </div>

            {/* Información */}
            <Alert color="blue">
                <div className="flex items-start gap-2">
                    <IoWarning className="h-5 w-5 mt-0.5" />
                    <div>
                        <Typography variant="small" className="font-medium">
                            Equipos Defectuosos Encontrados: {filteredEquipos.length}
                        </Typography>
                        <Typography variant="small" className="mt-1">
                            Selecciona los equipos que quieres devolver al sector solicitante para su gestión de reposición.
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
                            No hay equipos defectuosos
                        </Typography>
                        <Typography variant="small" color="gray">
                            Todos los equipos están en buen estado
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
                                        <Checkbox
                                            checked={selectedEquipos.length === filteredEquipos.length && filteredEquipos.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
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
                                            <Checkbox
                                                checked={selectedEquipos.includes(equipo.id)}
                                                onChange={() => handleSelectEquipo(equipo.id)}
                                            />
                                        </td>
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
                                            <Chip
                                                size="sm"
                                                variant="gradient"
                                                color="red"
                                                value="DEFECTUOSO"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <Tooltip content="Ver detalles">
                                                <IconButton
                                                    variant="text"
                                                    color="blue"
                                                    size="sm"
                                                >
                                                    <IoEye className="h-4 w-4" />
                                                </IconButton>
                                            </Tooltip>
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
    );
};

export default EquiposDefectuososTab;