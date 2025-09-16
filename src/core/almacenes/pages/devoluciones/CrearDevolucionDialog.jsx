// src/core/almacenes/pages/devoluciones/CrearDevolucionDialog.jsx - NUEVO
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Input,
    Textarea,
    Select,
    Option,
    Alert,
    Card,
    CardBody,
    Chip,
    IconButton,
    Checkbox
} from '@material-tailwind/react';
import {
    IoClose,
    IoSearch,
    IoWarning,
    IoCheckmarkCircle,
    IoFlask,
    IoTrash,
    IoAdd
} from 'react-icons/io5';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../../../services/api';
import { useDevolucion } from '../../hooks/useDevolucion';

const CrearDevolucionDialog = ({ open, onClose, opciones, onSuccess }) => {
    const { createDevolucion, loading } = useDevolucion();
    const [materialesDefectuosos, setMaterialesDefectuosos] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors }
    } = useForm();

    const watchLote = watch('lote_origen');

    useEffect(() => {
        if (open) {
            loadMaterialesDefectuosos();
        }
    }, [open]);

    useEffect(() => {
        if (watchLote) {
            loadMaterialesPorLote(watchLote);
        }
    }, [watchLote]);

    const loadMaterialesDefectuosos = async () => {
        try {
            setLoadingMaterials(true);
            // Buscar materiales con estado DEFECTUOSO
            const response = await api.get('/almacenes/materiales/', {
                params: {
                    estado_onu: 'DEFECTUOSO',
                    tipo_material: 'ONU'
                }
            });
            setMaterialesDefectuosos(response.data.results || response.data || []);
        } catch (error) {
            toast.error('Error al cargar materiales defectuosos');
        } finally {
            setLoadingMaterials(false);
        }
    };

    const loadMaterialesPorLote = async (loteId) => {
        try {
            setLoadingMaterials(true);
            const response = await api.get(`/almacenes/lotes/${loteId}/materiales/`, {
                params: {
                    estado_onu: 'DEFECTUOSO'
                }
            });
            setMaterialesDefectuosos(response.data || []);
        } catch (error) {
            console.error('Error al cargar materiales del lote:', error);
        } finally {
            setLoadingMaterials(false);
        }
    };

    const handleMaterialToggle = (material) => {
        setSelectedMaterials(prev => {
            const exists = prev.find(m => m.id === material.id);
            if (exists) {
                return prev.filter(m => m.id !== material.id);
            } else {
                return [...prev, material];
            }
        });
    };

    const handleCreateDevolucion = async (data) => {
        if (selectedMaterials.length === 0) {
            toast.error('Debe seleccionar al menos un material para devolver');
            return;
        }

        try {
            const devolucionData = {
                lote_origen: parseInt(data.lote_origen),
                motivo: data.motivo,
                numero_informe_laboratorio: data.numero_informe_laboratorio,
                materiales_ids: selectedMaterials.map(m => m.id)
            };

            const result = await createDevolucion(devolucionData);
            if (result.success) {
                reset();
                setSelectedMaterials([]);
                onSuccess();
            }
        } catch (error) {
            toast.error('Error al crear devolución');
        }
    };

    const handleClose = () => {
        reset();
        setSelectedMaterials([]);
        setMaterialesDefectuosos([]);
        onClose();
    };

    const filteredMaterials = materialesDefectuosos.filter(material => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            material.codigo_interno?.toLowerCase().includes(searchLower) ||
            material.mac_address?.toLowerCase().includes(searchLower) ||
            material.modelo_info?.nombre?.toLowerCase().includes(searchLower)
        );
    });

    // Generar número de informe automático
    const generateInformeNumber = () => {
        const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `DEV-${fecha}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    };

    return (
        <Dialog open={open} handler={handleClose} size="xl">
            <DialogHeader className="flex items-center justify-between">
                <Typography variant="h5" color="red">
                    🔄 Nueva Devolución al Proveedor
                </Typography>
                <IconButton variant="text" color="gray" onClick={handleClose}>
                    <IoClose className="h-5 w-5" />
                </IconButton>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleCreateDevolucion)}>
                <DialogBody divider className="max-h-[70vh] overflow-y-auto space-y-6">
                    {/* Información básica */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="mb-4">
                            📋 Información de la Devolución
                        </Typography>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="lote_origen"
                                control={control}
                                rules={{ required: 'El lote origen es obligatorio' }}
                                render={({ field }) => (
                                    <Select
                                        label="Lote de Origen *"
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        error={!!errors.lote_origen}
                                    >
                                        {opciones?.lotes?.map((lote) => (
                                            <Option key={lote.id} value={lote.id.toString()}>
                                                {lote.numero_lote} - {lote.proveedor_info?.nombre_comercial}
                                            </Option>
                                        ))}
                                    </Select>
                                )}
                            />

                            <Input
                                label="Número de Informe Laboratorio *"
                                {...register('numero_informe_laboratorio', {
                                    required: 'El número de informe es obligatorio'
                                })}
                                error={!!errors.numero_informe_laboratorio}
                                placeholder={generateInformeNumber()}
                            />
                        </div>

                        <div className="mt-4">
                            <Textarea
                                label="Motivo de la Devolución *"
                                {...register('motivo', {
                                    required: 'El motivo es obligatorio'
                                })}
                                error={!!errors.motivo}
                                rows={3}
                                placeholder="Describir las fallas encontradas en laboratorio..."
                            />
                        </div>
                    </div>

                    {/* Selección de materiales */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <Typography variant="h6" color="blue-gray">
                                🔍 Materiales Defectuosos
                            </Typography>
                            <div className="flex items-center gap-2">
                                <Typography variant="small" color="gray">
                                    {selectedMaterials.length} seleccionados
                                </Typography>
                                <Chip
                                    size="sm"
                                    variant="ghost"
                                    color="blue"
                                    value={`${filteredMaterials.length} disponibles`}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <Input
                                label="Buscar materiales..."
                                icon={<IoSearch className="h-5 w-5" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Código interno, MAC o modelo..."
                            />
                        </div>

                        {loadingMaterials ? (
                            <div className="text-center py-8">
                                <Typography color="gray">Cargando materiales defectuosos...</Typography>
                            </div>
                        ) : filteredMaterials.length === 0 ? (
                            <Alert color="amber">
                                <IoWarning className="h-5 w-5" />
                                <div>
                                    <Typography variant="small" className="font-medium">
                                        No hay materiales defectuosos disponibles
                                    </Typography>
                                    <Typography variant="small">
                                        {watchLote
                                            ? 'No hay materiales defectuosos en el lote seleccionado'
                                            : 'Selecciona un lote para ver sus materiales defectuosos'
                                        }
                                    </Typography>
                                </div>
                            </Alert>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {filteredMaterials.map((material) => (
                                    <Card
                                        key={material.id}
                                        className={`cursor-pointer transition-colors ${
                                            selectedMaterials.find(m => m.id === material.id)
                                                ? 'bg-red-50 border-red-200'
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleMaterialToggle(material)}
                                    >
                                        <CardBody className="p-3">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={!!selectedMaterials.find(m => m.id === material.id)}
                                                    onChange={() => handleMaterialToggle(material)}
                                                    color="red"
                                                />

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                                            {material.codigo_interno}
                                                        </Typography>
                                                        <Chip
                                                            size="sm"
                                                            variant="ghost"
                                                            color="red"
                                                            value="DEFECTUOSO"
                                                        />
                                                    </div>

                                                    <Typography variant="small" color="gray" className="font-mono">
                                                        MAC: {material.mac_address}
                                                    </Typography>

                                                    <Typography variant="small" color="gray">
                                                        Modelo: {material.modelo_info?.nombre} | Lote: {material.lote_info?.numero_lote}
                                                    </Typography>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <IoFlask className="h-4 w-4 text-red-500" />
                                                    <Typography variant="small" color="red">
                                                        Defectuoso
                                                    </Typography>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resumen de selección */}
                    {selectedMaterials.length > 0 && (
                        <Alert color="blue">
                            <div className="flex items-center gap-2">
                                <IoCheckmarkCircle className="h-5 w-5" />
                                <div>
                                    <Typography variant="small" className="font-medium">
                                        {selectedMaterials.length} materiales seleccionados para devolución
                                    </Typography>
                                    <Typography variant="small">
                                        Estos materiales serán marcados como "Devuelto a Proveedor"
                                    </Typography>
                                </div>
                            </div>
                        </Alert>
                    )}

                    {/* Errores de validación */}
                    {Object.keys(errors).length > 0 && (
                        <Alert color="red">
                            <Typography variant="small" className="font-medium mb-2">
                                Errores en el formulario:
                            </Typography>
                            {Object.values(errors).map((error, index) => (
                                <div key={index}>• {error.message}</div>
                            ))}
                        </Alert>
                    )}
                </DialogBody>

                <DialogFooter className="space-x-2">
                    <Button variant="text" color="gray" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        color="red"
                        loading={loading}
                        disabled={selectedMaterials.length === 0}
                    >
                        Crear Devolución
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
};

export default CrearDevolucionDialog;