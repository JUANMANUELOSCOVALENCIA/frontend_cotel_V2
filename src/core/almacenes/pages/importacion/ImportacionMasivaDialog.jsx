// ImportacionMasivaDialog.jsx - Componente completo con selección de entregas parciales

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Input,
    Select,
    Option,
    Alert,
    Card,
    CardBody,
    Progress,
    IconButton,
    Chip
} from '@material-tailwind/react';
import {
    IoClose,
    IoCloudUpload,
    IoCheckmarkCircle,
    IoWarning,
    IoInformationCircle,
    IoRefresh
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { api } from '../../../../services/api.js';

const ImportacionMasivaDialog = ({
                                     open = false,
                                     onClose = () => {},
                                     onSuccess = () => {},
                                     opciones = {}
                                 }) => {
    // Estados principales
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Config, 2: Archivo, 3: Validación, 4: Resultados

    // Estados de configuración
    const [selectedLote, setSelectedLote] = useState('');
    const [selectedModelo, setSelectedModelo] = useState('');
    const [itemEquipo, setItemEquipo] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    // Estados de entregas parciales
    const [entregasDisponibles, setEntregasDisponibles] = useState([]);
    const [entregaSeleccionada, setEntregaSeleccionada] = useState('');
    const [loadingEntregas, setLoadingEntregas] = useState(false);

    // Estados de validación
    const [validationData, setValidationData] = useState(null);
    const [importResult, setImportResult] = useState(null);

    // Cargar entregas disponibles cuando se selecciona un lote
    const cargarEntregasDisponibles = async (loteId) => {
        if (!loteId) {
            setEntregasDisponibles([]);
            return;
        }

        try {
            setLoadingEntregas(true);
            console.log(`Cargando entregas para lote ${loteId}`);

            const response = await api.get(`/almacenes/lotes/${loteId}/entregas_parciales_disponibles/`);

            console.log('Entregas disponibles:', response.data);
            setEntregasDisponibles(response.data.entregas || []);

        } catch (error) {
            console.error('Error cargando entregas:', error);
            setEntregasDisponibles([]);
            toast.error('Error al cargar entregas parciales');
        } finally {
            setLoadingEntregas(false);
        }
    };

    const ImportacionMasivaDialog = ({ open, onClose, lote, opciones, onSuccess }) => {
        // NUEVA VALIDACIÓN: Solo permitir para materiales únicos
        const tieneMaterialesUnicos = lote?.detalles?.some(d =>
            d.modelo_info?.tipo_material?.es_unico
        );

        if (open && !tieneMaterialesUnicos) {
            return (
                <Dialog open={open} handler={onClose} size="md">
                    <DialogHeader>
                        <Typography variant="h5" color="blue-gray">
                            Importación No Disponible
                        </Typography>
                    </DialogHeader>
                    <DialogBody>
                        <Alert color="blue">
                            <div className="flex items-start gap-3">
                                <IoInformationCircle className="h-6 w-6 flex-shrink-0 mt-1"/>
                                <div>
                                    <Typography className="font-semibold mb-2">
                                        Este lote contiene materiales por cantidad
                                    </Typography>
                                    <Typography variant="small">
                                        Los materiales como cables, conectores y otros que se miden por
                                        cantidad no requieren importación desde Excel.
                                    </Typography>
                                    <Typography variant="small" className="mt-2">
                                        Use la opción <strong>"Completar Recepción Automática"</strong>
                                        en el detalle del lote para registrar estos materiales.
                                    </Typography>
                                </div>
                            </div>
                        </Alert>
                    </DialogBody>
                    <DialogFooter>
                        <Button color="blue" onClick={onClose}>
                            Entendido
                        </Button>
                    </DialogFooter>
                </Dialog>
            );
        }
    };
    // Efecto para cargar entregas cuando cambia el lote
    useEffect(() => {
        if (selectedLote) {
            cargarEntregasDisponibles(selectedLote);
            setEntregaSeleccionada(''); // Reset selección de entrega
        } else {
            setEntregasDisponibles([]);
            setEntregaSeleccionada('');
        }
    }, [selectedLote]);

    // Reset al abrir/cerrar modal
    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        setStep(1);
        setSelectedLote('');
        setSelectedModelo('');
        setItemEquipo('');
        setSelectedFile(null);
        setEntregaSeleccionada('');
        setEntregasDisponibles([]);
        setValidationData(null);
        setImportResult(null);
        setLoading(false);
    };

    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv'
            ];

            if (validTypes.includes(file.type)) {
                setSelectedFile(file);
                toast.success(`Archivo seleccionado: ${file.name}`);
            } else {
                toast.error('Tipo de archivo no válido. Use Excel (.xlsx) o CSV');
                event.target.value = '';
            }
        }
    };

    const validateForm = () => {
        if (!selectedLote) {
            toast.error('Seleccione un lote');
            return false;
        }
        if (!selectedModelo) {
            toast.error('Seleccione un modelo');
            return false;
        }
        if (!itemEquipo) {
            toast.error('Ingrese el código de item equipo');
            return false;
        }
        if (!selectedFile) {
            toast.error('Seleccione un archivo');
            return false;
        }
        return true;
    };

    const handleValidation = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('lote_id', selectedLote);
            formData.append('modelo_id', selectedModelo);
            formData.append('item_equipo', itemEquipo);
            formData.append('archivo', selectedFile);
            formData.append('validacion', 'true');

            if (entregaSeleccionada) {
                formData.append('entrega_seleccionada', entregaSeleccionada);
            }

            const response = await api.post('/almacenes/importacion/masiva/', formData);

            if (response.data.success) {
                setValidationData(response.data.resultado);
                setStep(3);
                toast.success('Validación completada');
            }

        } catch (error) {
            console.error('Error en validación:', error);
            const errorMsg = error.response?.data?.error || 'Error en validación';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleImportacion = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('lote_id', selectedLote);
            formData.append('modelo_id', selectedModelo);
            formData.append('item_equipo', itemEquipo);
            formData.append('archivo', selectedFile);
            formData.append('validacion', 'false');

            // NUEVO: Agregar entrega seleccionada
            if (entregaSeleccionada) {
                formData.append('entrega_seleccionada', entregaSeleccionada);
            }

            const response = await api.post('/almacenes/importacion/masiva/', formData);

            if (response.data.success) {
                setImportResult(response.data.resultado);
                setStep(4);
                toast.success('Importación completada exitosamente');

                // Actualizar entregas disponibles
                if (selectedLote) {
                    await cargarEntregasDisponibles(selectedLote);
                }

                // Notificar éxito al componente padre
                onSuccess();
            }

        } catch (error) {
            console.error('Error en importación:', error);
            const errorMsg = error.response?.data?.error || 'Error en importación';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Obtener información de la entrega seleccionada
    const getEntregaInfo = () => {
        if (!entregaSeleccionada || !entregasDisponibles.length) return null;

        const entrega = entregasDisponibles.find(e =>
            e.numero_entrega.toString() === entregaSeleccionada
        );

        return entrega;
    };

    const entregaInfo = getEntregaInfo();

    return (
        <Dialog
            open={open}
            handler={handleClose}
            size="xl"
            dismiss={{ escapeKey: !loading, outsidePress: !loading }}
        >
            <DialogHeader className="flex items-center justify-between">
                <div>
                    <Typography variant="h5" color="blue-gray">
                        Importación Masiva de Equipos
                    </Typography>
                    <Typography color="gray" className="text-sm">
                        Paso {step} de 4 - {
                        step === 1 ? 'Configuración inicial' :
                            step === 2 ? 'Selección de archivo' :
                                step === 3 ? 'Validación' : 'Resultados'
                    }
                    </Typography>
                </div>
                <IconButton variant="text" color="gray" onClick={handleClose} disabled={loading}>
                    <IoClose className="h-5 w-5" />
                </IconButton>
            </DialogHeader>

            <DialogBody divider className="max-h-[70vh] overflow-y-auto">
                {step === 1 && (
                    <div className="space-y-4">
                        <Typography variant="h6" color="blue-gray">
                            Configuración Inicial
                        </Typography>

                        {/* Selección de Lote y Modelo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Select
                                    label="Lote de Destino *"
                                    value={selectedLote}
                                    onChange={setSelectedLote}
                                >
                                    {opciones?.lotes?.map((lote) => (
                                        <Option key={lote.id} value={lote.id.toString()}>
                                            {lote.numero_lote} ({lote.proveedor_info?.nombre})
                                        </Option>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <Select
                                    label="Modelo *"
                                    value={selectedModelo}
                                    onChange={setSelectedModelo}
                                >
                                    {opciones?.modelos?.map((modelo) => (
                                        <Option key={modelo.id} value={modelo.id.toString()}>
                                            {modelo.nombre}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* Código Item Equipo */}
                        <div className="space-y-2">
                            <Typography variant="small" color="blue-gray" className="font-medium">
                                Código Item Equipo Sprint*
                            </Typography>
                            <Input
                                value={itemEquipo}
                                onChange={(e) => setItemEquipo(e.target.value)}
                                placeholder="Ej: 1234567890"
                            />
                        </div>

                        {/* Selector de Entrega Parcial */}
                        {selectedLote && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Select
                                        label="Entrega Parcial (Opcional)"
                                        value={entregaSeleccionada}
                                        onChange={setEntregaSeleccionada}
                                        disabled={loadingEntregas}
                                    >
                                        <Option value="">Nueva entrega automática</Option>
                                        {entregasDisponibles.map((entrega) => (
                                            <Option key={entrega.id} value={entrega.numero_entrega.toString()}>
                                                Entrega #{entrega.numero_entrega} - {entrega.cantidad_entregada} equipos registrados
                                                {entrega.materiales_count > 0 && ` (${entrega.materiales_count} cargados)`}
                                            </Option>
                                        ))}
                                    </Select>
                                    {loadingEntregas && (
                                        <IconButton size="sm" variant="text" disabled>
                                            <IoRefresh className="h-4 w-4 animate-spin" />
                                        </IconButton>
                                    )}
                                </div>

                                {/* Información de la entrega seleccionada */}
                                {entregaInfo && (
                                    <Alert color={entregaInfo.equipos_restantes > 0 ? "blue" : "amber"} className="mt-2">
                                        <div className="flex items-start gap-2">
                                            <IoInformationCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <Typography variant="small" className="font-medium mb-1">
                                                    Entrega #{entregaInfo.numero_entrega} seleccionada
                                                </Typography>
                                                <div className="space-y-1 text-sm">
                                                    <div>• Cantidad registrada: {entregaInfo.cantidad_entregada} equipos</div>
                                                    <div>• Ya cargados: {entregaInfo.materiales_count || 0} equipos</div>
                                                    <div className={entregaInfo.equipos_restantes > 0 ? "text-green-700" : "text-red-700"}>
                                                        • Restantes por cargar: {entregaInfo.equipos_restantes} equipos
                                                    </div>
                                                    <div>• Fecha: {new Date(entregaInfo.fecha_entrega).toLocaleDateString()}</div>
                                                    {entregaInfo.observaciones && (
                                                        <div>• Observaciones: {entregaInfo.observaciones}</div>
                                                    )}
                                                </div>

                                                {entregaInfo.equipos_restantes <= 0 && (
                                                    <Typography variant="small" color="red" className="mt-2 font-medium">
                                                        ⚠️ Esta entrega ya está completa. No puede recibir más equipos.
                                                    </Typography>
                                                )}
                                            </div>
                                        </div>
                                    </Alert>
                                )}

                                {/* Resumen de entregas disponibles */}
                                {entregasDisponibles.length > 0 && !entregaSeleccionada && (
                                    <Card className="mt-4">
                                        <CardBody>
                                            <Typography variant="small" className="font-medium mb-2">
                                                Entregas parciales disponibles:
                                            </Typography>
                                            <div className="space-y-2">
                                                {entregasDisponibles.map((entrega) => (
                                                    <div key={entrega.id} className="flex items-center justify-between">
                                                        <span className="text-sm">
                                                            Entrega #{entrega.numero_entrega}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600">
                                                                {entrega.materiales_count}/{entrega.cantidad_entregada}
                                                            </span>
                                                            <Chip
                                                                size="sm"
                                                                variant="ghost"
                                                                color={entrega.equipos_restantes > 0 ? "green" : "gray"}
                                                                value={
                                                                    entrega.equipos_restantes > 0
                                                                        ? `${entrega.equipos_restantes} libres`
                                                                        : "Completa"
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardBody>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <Typography variant="h6" color="blue-gray">
                            Selección de Archivo
                        </Typography>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                            <IoCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <Typography color="gray" className="mb-4">
                                Seleccione un archivo Excel (.xlsx) o CSV
                            </Typography>

                            {/* Versión simple que funciona */}
                            <div className="relative inline-block">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    id="file-upload"
                                />
                                <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                                    <IoCloudUpload className="mr-2 h-4 w-4" />
                                    Seleccionar Archivo
                                </div>
                            </div>

                            <Typography variant="small" color="gray" className="mt-2">
                                Archivos soportados: .xlsx, .xls, .csv
                            </Typography>
                        </div>

                        {selectedFile && (
                            <Alert color="green">
                                <div className="flex items-center gap-2">
                                    <IoCheckmarkCircle className="h-5 w-5" />
                                    <div>
                                        <Typography variant="small" className="font-medium">
                                            Archivo seleccionado: {selectedFile.name}
                                        </Typography>
                                        <Typography variant="small">
                                            Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </Typography>
                                    </div>
                                </div>
                            </Alert>
                        )}
                    </div>
                )}

                {step === 3 && validationData && (
                    <div className="space-y-4">
                        <Typography variant="h6" color="blue-gray">
                            Resultado de Validación
                        </Typography>

                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardBody className="text-center">
                                    <Typography variant="h4" color="green">
                                        {validationData.validados}
                                    </Typography>
                                    <Typography color="gray">Equipos válidos</Typography>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="text-center">
                                    <Typography variant="h4" color="red">
                                        {validationData.errores}
                                    </Typography>
                                    <Typography color="gray">Equipos con errores</Typography>
                                </CardBody>
                            </Card>
                        </div>

                        {validationData.detalles_errores?.length > 0 && (
                            <Alert color="red">
                                <Typography variant="small" className="font-medium mb-2">
                                    Errores encontrados:
                                </Typography>
                                <div className="max-h-40 overflow-y-auto text-sm">
                                    {validationData.detalles_errores.slice(0, 10).map((error, index) => (
                                        <div key={index} className="mb-1">
                                            Fila {error.fila}: {error.errores.join(', ')}
                                        </div>
                                    ))}
                                </div>
                            </Alert>
                        )}
                    </div>
                )}

                {step === 4 && importResult && (
                    <div className="space-y-4">
                        <Typography variant="h6" color="blue-gray">
                            Resultado de Importación
                        </Typography>

                        <Alert color="green">
                            <div className="flex items-center gap-2">
                                <IoCheckmarkCircle className="h-5 w-5" />
                                <div>
                                    <Typography variant="small" className="font-medium">
                                        Importación completada exitosamente
                                    </Typography>
                                    <Typography variant="small">
                                        Se importaron {importResult.importados} equipos
                                        {entregaSeleccionada && ` en la entrega #${entregaSeleccionada}`}
                                    </Typography>
                                </div>
                            </div>
                        </Alert>

                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardBody className="text-center">
                                    <Typography variant="h4" color="green">
                                        {importResult.importados}
                                    </Typography>
                                    <Typography color="gray">Importados</Typography>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="text-center">
                                    <Typography variant="h4" color="blue">
                                        {importResult.total_filas}
                                    </Typography>
                                    <Typography color="gray">Total filas</Typography>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody className="text-center">
                                    <Typography variant="h4" color="red">
                                        {importResult.errores || 0}
                                    </Typography>
                                    <Typography color="gray">Errores</Typography>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                )}
            </DialogBody>

            <DialogFooter className="flex justify-between">
                <div>
                    {step > 1 && step < 4 && (
                        <Button
                            variant="text"
                            color="gray"
                            onClick={() => setStep(step - 1)}
                            disabled={loading}
                        >
                            Anterior
                        </Button>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button variant="text" color="gray" onClick={handleClose} disabled={loading}>
                        {step === 4 ? 'Cerrar' : 'Cancelar'}
                    </Button>

                    {step === 1 && (
                        <Button
                            color="blue"
                            onClick={() => setStep(2)}
                            disabled={!selectedLote || !selectedModelo || !itemEquipo}
                        >
                            Siguiente
                        </Button>
                    )}

                    {step === 2 && (
                        <Button
                            color="blue"
                            onClick={handleValidation}
                            disabled={!selectedFile}
                            loading={loading}
                        >
                            Validar Archivo
                        </Button>
                    )}

                    {step === 3 && (
                        <Button
                            color="green"
                            onClick={handleImportacion}
                            disabled={!validationData || validationData.validados === 0}
                            loading={loading}
                        >
                            Importar {validationData?.validados || 0} Equipos
                        </Button>
                    )}
                </div>
            </DialogFooter>
        </Dialog>
    );
};

export default ImportacionMasivaDialog;