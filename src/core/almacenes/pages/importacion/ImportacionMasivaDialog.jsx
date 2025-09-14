import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Alert,
    Progress,
    Card,
    CardBody,
    Input,
    Select,
    Option,
    Chip,
    List,
    ListItem,
    Stepper,
    Step
} from '@material-tailwind/react';
import {
    IoCloudUpload,
    IoDocument,
    IoDownload,
    IoCheckmarkCircle,
    IoWarning,
    IoCloseCircle,
    IoInformationCircle,
    IoPlay,
    IoEye,
    IoRefresh,
    IoTrash
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { useImportacionMasiva } from '../../hooks/useAlmacenes';

const ImportacionMasivaDialog = ({
                                     open,
                                     onClose,
                                     lote,
                                     opciones,
                                     onSuccess
                                 }) => {
    const {
        loading,
        error,
        resultado,
        importarArchivo,
        obtenerPlantilla,
        clearError,
        clearResultado
    } = useImportacionMasiva();

    // ========== ESTADO LOCAL ==========
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedModel, setSelectedModel] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef(null);

    // ========== PASOS DEL WIZARD ==========
    const steps = [
        'Seleccionar Archivo',
        'Configurar Importación',
        'Validar Datos',
        'Importar',
        'Resultados'
    ];
    const [itemEquipo, setItemEquipo] = useState('');

    // ========== HANDLERS ==========
    const handleReset = () => {
        setCurrentStep(0);
        setSelectedFile(null);
        setSelectedModel('');
        setItemEquipo('');
        setPreviewData(null);
        setValidationErrors([]);
        setUploadProgress(0);
        clearError();
        clearResultado();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validar tipo de archivo
            const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
            if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.csv')) {
                toast.error('Solo se permiten archivos Excel (.xlsx) o CSV');
                return;
            }

            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('El archivo no puede ser mayor a 5MB');
                return;
            }

            setSelectedFile(file);
            setCurrentStep(1);
        }
    };

    const handleValidateFile = async () => {
        if (!selectedFile || !selectedModel) {
            toast.error('Selecciona un archivo y modelo');
            return;
        }
        // Validar formato ITEM_EQUIPO
        if (!/^\d{6,10}$/.test(itemEquipo)) {
            toast.error('ITEM_EQUIPO debe tener entre 6 y 10 dígitos');
            return;
        }
        try {
            setCurrentStep(2);
            const result = await importarArchivo(selectedFile, lote.id, selectedModel, itemEquipo, true);

            if (result.success) {
                setPreviewData(result.data.resultado);
                if (result.data.resultado.errores > 0) {
                    setValidationErrors(result.data.resultado.detalles_errores || []);
                    toast.warning(`Se encontraron ${result.data.resultado.errores} errores en el archivo`);
                } else {
                    toast.success(`Validación exitosa: ${result.data.resultado.validados} equipos listos para importar`);
                    setCurrentStep(3);
                }
            } else {
                toast.error(result.error);
                setCurrentStep(1);
            }
        } catch (error) {
            toast.error('Error al validar archivo');
            setCurrentStep(1);
        }
    };

    const handleImport = async () => {
        // PRIMERO: Validaciones iniciales
        if (!selectedFile || !selectedModel || !itemEquipo) {
            toast.error('Faltan datos para la importación');
            return;
        }

        // SEGUNDO: Declarar y limpiar la variable
        let itemEquipoLimpio = itemEquipo.toString().trim();

        // Quitar comillas dobles si existen
        if (itemEquipoLimpio.startsWith('"') && itemEquipoLimpio.endsWith('"')) {
            itemEquipoLimpio = itemEquipoLimpio.slice(1, -1);
        }

        // Quitar comillas simples si existen
        if (itemEquipoLimpio.startsWith("'") && itemEquipoLimpio.endsWith("'")) {
            itemEquipoLimpio = itemEquipoLimpio.slice(1, -1);
        }

        console.log('ITEM_EQUIPO limpio:', itemEquipoLimpio);

        // TERCERO: Validar formato
        if (!/^\d{6,10}$/.test(itemEquipoLimpio)) {
            toast.error(`ITEM_EQUIPO inválido: "${itemEquipoLimpio}". Debe tener 6-10 dígitos`);
            return;
        }

        // CUARTO: Debugging DESPUÉS de declarar la variable
        console.log('🔍 COMPONENT DEBUG - Antes de llamar importarArchivo:', {
            selectedFile: selectedFile?.name,
            loteId: lote.id,
            selectedModel,
            itemEquipoLimpio,
            esValidacion: false
        });

        try {
            setCurrentStep(4);
            setUploadProgress(0);

            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // QUINTO: Llamar a importarArchivo UNA SOLA VEZ
            const result = await importarArchivo(selectedFile, lote.id, selectedModel, itemEquipoLimpio, false);

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (result.success) {
                setCurrentStep(4);
                toast.success(`¡Importación exitosa! ${result.data.resultado.importados} equipos registrados`);

                setTimeout(() => {
                    onSuccess();
                }, 1500);
            } else {
                toast.error(result.error);
                setCurrentStep(3);
            }
        } catch (error) {
            toast.error('Error durante la importación');
            setCurrentStep(3);
        }
    };
    const handleDownloadTemplate = async () => {
        try {
            const result = await obtenerPlantilla();
            if (result.success) {
                // Crear datos para Excel con ejemplos
                const data = [
                    ['D_SN', 'GPON_SN', 'MAC'], // Headers en la primera fila
                    ['SN123456789', 'HWTC12345678', '00:11:22:33:44:55'],
                    ['SN987654321', 'HWTC87654321', '00:11:22:33:44:56'],
                    ['SN456789123', 'HWTC56789123', '00:11:22:33:44:57'],
                    ['', '', ''], // Fila vacía para que empiecen a llenar
                    ['', '', ''], // Más filas vacías
                    ['', '', ''],
                ];

                // Crear hoja de Excel
                const worksheet = XLSX.utils.aoa_to_sheet(data);

                // Configurar ancho de columnas
                worksheet['!cols'] = [
                    { width: 20 }, // Columna A - D_SN
                    { width: 25 }, // Columna B - GPON_SN
                    { width: 20 }  // Columna C - MAC
                ];

                // Aplicar estilos a los headers (fila 1)
                const headerStyle = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4472C4" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };

                // Aplicar estilo a las celdas de header
                ['A1', 'B1', 'C1'].forEach(cell => {
                    if (worksheet[cell]) {
                        worksheet[cell].s = headerStyle;
                    }
                });

                // Crear libro de Excel
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla ONUs');

                // Crear hoja de instrucciones
                const instrucciones = [
                    ['INSTRUCCIONES PARA IMPORTACIÓN MASIVA DE ONUs'],
                    [''],
                    ['Formato requerido:'],
                    ['• Columna A: D_SN - Serial del fabricante (mínimo 6 caracteres)'],
                    ['• Columna B: GPON_SN - Serial GPON (mínimo 8 caracteres)'],
                    ['• Columna C: MAC - Dirección MAC formato XX:XX:XX:XX:XX:XX'],
                    [''],
                    ['Reglas importantes:'],
                    ['• Todos los valores deben ser únicos (no repetir MACs, seriales, etc.)'],
                    ['• No eliminar los encabezados de la primera fila'],
                    ['• No dejar filas vacías entre los datos'],
                    ['• El ITEM_EQUIPO se configura en el formulario de importación'],
                    ['• Máximo 1000 equipos por archivo'],
                    [''],
                    ['Ejemplo de datos válidos:'],
                    ['D_SN: SN123456789'],
                    ['GPON_SN: HWTC12345678'],
                    ['MAC: 00:11:22:33:44:55'],
                    [''],
                    ['Una vez completado, guarde el archivo y súbalo en el sistema.']
                ];

                const worksheetInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);
                worksheetInstrucciones['!cols'] = [{ width: 60 }];

                // Estilo para el título
                if (worksheetInstrucciones['A1']) {
                    worksheetInstrucciones['A1'].s = {
                        font: { bold: true, size: 14, color: { rgb: "000080" } },
                        alignment: { horizontal: "center" }
                    };
                }

                XLSX.utils.book_append_sheet(workbook, worksheetInstrucciones, 'Instrucciones');

                // Configurar propiedades del archivo
                workbook.Props = {
                    Title: "Plantilla Importación ONUs",
                    Subject: "Plantilla para importación masiva de equipos ONUs",
                    Author: "Sistema de Almacenes",
                    CreatedDate: new Date()
                };

                // Descargar el archivo
                XLSX.writeFile(workbook, 'Plantilla_Importacion_ONUs.xlsx');

                toast.success('Plantilla Excel descargada con éxito');
            } else {
                toast.error('Error al descargar plantilla');
            }
        } catch (error) {
            console.error('Error generando plantilla:', error);
            toast.error('Error al generar plantilla Excel');
        }
    };

    // ========== COMPONENTES DE PASOS ==========
    const StepFileSelection = () => (
        <div className="space-y-4">
            <div className="text-center">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                    Seleccionar Archivo de Importación
                </Typography>
                <Typography color="gray" className="mb-4">
                    Sube un archivo Excel (.xlsx) o CSV con los datos de las ONUs
                </Typography>
            </div>

            {/* Información del lote */}
            <Alert color="blue">
                <div className="flex items-center gap-2">
                    <IoInformationCircle className="h-5 w-5" />
                    <div>
                        <Typography variant="small" className="font-medium">
                            Lote: {lote?.numero_lote}
                        </Typography>
                        <Typography variant="small">
                            Proveedor: {lote?.proveedor_info?.nombre_comercial}
                        </Typography>
                    </div>
                </div>
            </Alert>

            {/* Plantilla */}
            <Card>
                <CardBody>
                    <div className="flex items-center justify-between">
                        <div>
                            <Typography variant="h6" color="blue-gray">
                                Plantilla de Importación
                            </Typography>
                            <Typography variant="small" color="gray">
                                Descarga la plantilla para ver el formato requerido
                            </Typography>
                        </div>
                        <Button
                            size="sm"
                            variant="outlined"
                            color="blue"
                            className="flex items-center gap-2"
                            onClick={handleDownloadTemplate}
                        >
                            <IoDownload className="h-4 w-4" />
                            Descargar Plantilla
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Área de subida */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {selectedFile ? (
                    <div className="space-y-2">
                        <IoCheckmarkCircle className="mx-auto h-12 w-12 text-green-500" />
                        <Typography variant="h6" color="green">
                            Archivo Seleccionado
                        </Typography>
                        <Typography color="gray">
                            {selectedFile.name}
                        </Typography>
                        <Typography variant="small" color="gray">
                            Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                        <Button
                            size="sm"
                            variant="text"
                            color="red"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                                fileInputRef.current.value = '';
                            }}
                        >
                            Cambiar archivo
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <IoCloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <Typography variant="h6" color="blue-gray">
                            Arrastra un archivo aquí o haz clic para seleccionar
                        </Typography>
                        <Typography color="gray">
                            Soporta archivos .xlsx y .csv (máximo 5MB)
                        </Typography>
                    </div>
                )}
            </div>

            {/* Requisitos */}
            <Alert color="blue" className="mb-4">
                <Typography variant="small" className="font-medium mb-2">
                    📋 Formato del archivo Excel:
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="bg-white bg-opacity-50 p-2 rounded">
                        <strong>Columna A:</strong> D_SN<br/>
                        <span className="text-xs">Serial del fabricante</span>
                    </div>
                    <div className="bg-white bg-opacity-50 p-2 rounded">
                        <strong>Columna B:</strong> GPON_SN<br/>
                        <span className="text-xs">Serial GPON del equipo</span>
                    </div>
                    <div className="bg-white bg-opacity-50 p-2 rounded">
                        <strong>Columna C:</strong> MAC<br/>
                        <span className="text-xs">XX:XX:XX:XX:XX:XX</span>
                    </div>
                </div>
            </Alert>

            <Alert color="amber">
                <Typography variant="small" className="font-medium mb-2">
                    ⚠️ Requisitos importantes:
                </Typography>
                <ul className="text-sm space-y-1 ml-4">
                    <li>• Descargar y usar la plantilla Excel proporcionada</li>
                    <li>• Completar las columnas A, B, C con los datos respectivos</li>
                    <li>• Mantener los encabezados en la primera fila</li>
                    <li>• Todos los valores deben ser únicos (no duplicados)</li>
                    <li>• El ITEM_EQUIPO se configura en el siguiente paso</li>
                    <li>• Guardar como archivo .xlsx antes de subir</li>
                </ul>
            </Alert>
        </div>
    );

    const StepConfiguration = () => (
        <div className="space-y-4">
            <Typography variant="h6" color="blue-gray" className="mb-4">
                Configurar Importación
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Archivo Seleccionado
                    </Typography>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <IoDocument className="h-5 w-5 text-blue-500" />
                        <Typography variant="small" color="blue-gray">
                            {selectedFile?.name}
                        </Typography>
                    </div>
                </div>

                <div>
                    <Typography variant="small" color="gray" className="mb-2">
                        Modelo de Equipo *
                    </Typography>
                    <Select
                        label="Seleccionar Modelo"
                        value={selectedModel}
                        onChange={(value) => setSelectedModel(value)}
                    >
                        {opciones.modelos?.filter(modelo =>
                            modelo.tipo_material_info?.es_unico === true
                        ).map((modelo) => (
                            <Option key={modelo.id} value={modelo.id.toString()}>
                                {modelo.marca_info?.nombre} {modelo.nombre}
                            </Option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* AGREGAR: Campo para ITEM_EQUIPO */}
            <div>
                <Typography variant="small" color="gray" className="mb-2">
                    Código ITEM_EQUIPO del Lote *
                </Typography>
                <Input
                    label="ITEM_EQUIPO (6-10 dígitos)"
                    value={itemEquipo}
                    onChange={(e) => setItemEquipo(e.target.value)}
                    pattern="[0-9]{6,10}"
                    maxLength="10"
                    placeholder="1234567890"
                />
                <Typography variant="small" color="gray" className="mt-1">
                    Este código se aplicará a todos los equipos del archivo
                </Typography>
            </div>

            <Alert color="blue">
                <Typography variant="small">
                    <strong>Lote destino:</strong> {lote?.numero_lote}<br />
                    <strong>Almacén:</strong> {lote?.almacen_destino_info?.nombre}<br />
                    <strong>Proveedor:</strong> {lote?.proveedor_info?.nombre_comercial}
                </Typography>
            </Alert>
        </div>
    );

    const StepValidation = () => (
        <div className="space-y-4">
            <Typography variant="h6" color="blue-gray" className="mb-4">
                Validación de Datos
            </Typography>

            {previewData ? (
                <div className="space-y-4">
                    {/* Resumen de validación */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardBody className="text-center">
                                <Typography color="green" className="text-2xl font-bold">
                                    {previewData.validados || 0}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Válidos
                                </Typography>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="text-center">
                                <Typography color="red" className="text-2xl font-bold">
                                    {previewData.errores || 0}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Con Errores
                                </Typography>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="text-center">
                                <Typography color="blue" className="text-2xl font-bold">
                                    {(previewData.validados || 0) + (previewData.errores || 0)}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Total Filas
                                </Typography>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Errores de validación */}
                    {validationErrors.length > 0 && (
                        <Card>
                            <CardBody>
                                <Typography variant="h6" color="red" className="mb-3">
                                    Errores Encontrados ({validationErrors.length})
                                </Typography>
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {validationErrors.map((error, index) => (
                                        <Alert key={index} color="red" className="py-2">
                                            <div className="flex items-start gap-2">
                                                <IoWarning className="h-4 w-4 mt-0.5" />
                                                <div>
                                                    <Typography variant="small" className="font-medium">
                                                        Fila {error.fila}: {error.mac || 'Sin MAC'}
                                                    </Typography>
                                                    <Typography variant="small">
                                                        {error.errores?.join(', ')}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </Alert>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Preview de datos válidos */}
                    {previewData.equipos_validos && previewData.equipos_validos.length > 0 && (
                        <Card>
                            <CardBody>
                                <Typography variant="h6" color="green" className="mb-3">
                                    Preview de Equipos Válidos ({previewData.equipos_validos.length})
                                </Typography>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">MAC Address</th>
                                            <th className="text-left p-2">GPON Serial</th>
                                            <th className="text-left p-2">D-SN</th>
                                            <th className="text-left p-2">Item Equipo</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {previewData.equipos_validos.slice(0, 5).map((equipo, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="p-2 font-mono text-xs">{equipo.mac_address}</td>
                                                <td className="p-2 font-mono text-xs">{equipo.gpon_serial}</td>
                                                <td className="p-2 font-mono text-xs">{equipo.serial_manufacturer}</td>
                                                <td className="p-2 font-mono text-xs">{equipo.codigo_item_equipo}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    {previewData.equipos_validos.length > 5 && (
                                        <Typography variant="small" color="gray" className="text-center mt-2">
                                            ... y {previewData.equipos_validos.length - 5} equipos más
                                        </Typography>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <Typography color="gray">
                        Ejecutando validación...
                    </Typography>
                </div>
            )}
        </div>
    );

    const StepImport = () => (
        <div className="space-y-4">
            <Typography variant="h6" color="blue-gray" className="mb-4">
                Importando Equipos
            </Typography>
            {/* AGREGAR DEBUG TEMPORAL */}
            <Alert color="blue">
                <Typography variant="small">
                    Debug - ITEM_EQUIPO actual: "{itemEquipo}" (longitud: {itemEquipo?.length})
                </Typography>
            </Alert>
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    {uploadProgress < 100 ? (
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
                    ) : (
                        <IoCheckmarkCircle className="h-16 w-16 text-green-500" />
                    )}
                </div>

                <div className="space-y-2">
                    <Typography color="blue-gray">
                        {uploadProgress < 100 ? 'Procesando equipos...' : '¡Importación completada!'}
                    </Typography>
                    <Progress
                        value={uploadProgress}
                        color={uploadProgress < 100 ? "orange" : "green"}
                        className="w-full"
                    />
                    <Typography variant="small" color="gray">
                        {uploadProgress}% completado
                    </Typography>
                </div>

                {resultado && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <Card>
                            <CardBody className="text-center">
                                <Typography color="green" className="text-xl font-bold">
                                    {resultado.importados || 0}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Importados
                                </Typography>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="text-center">
                                <Typography color="blue" className="text-xl font-bold">
                                    {resultado.validados || 0}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Validados
                                </Typography>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="text-center">
                                <Typography color="red" className="text-xl font-bold">
                                    {resultado.errores || 0}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Errores
                                </Typography>
                            </CardBody>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );

    // ========== RENDER PRINCIPAL ==========
    return (
        <Dialog
            open={open}
            handler={handleClose}
            size="xl"
            className="min-h-[600px]"
        >
            <DialogHeader className="flex items-center justify-between">
                <div>
                    <Typography variant="h5" color="blue-gray">
                        Importación Masiva de ONUs
                    </Typography>
                    <Typography color="gray">
                        Lote: {lote?.numero_lote}
                    </Typography>
                </div>
                <Button
                    variant="text"
                    color="gray"
                    onClick={handleClose}
                    className="p-2"
                >
                    <IoCloseCircle className="h-5 w-5" />
                </Button>
            </DialogHeader>

            <DialogBody divider className="max-h-[70vh] overflow-y-auto">
                {/* Stepper */}
                <div className="mb-6">
                    <Stepper activeStep={currentStep}>
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <div className="text-center">
                                    <Typography variant="small" color={index <= currentStep ? "blue-gray" : "gray"}>
                                        {step}
                                    </Typography>
                                </div>
                            </Step>
                        ))}
                    </Stepper>
                </div>

                {/* Error global */}
                {error && (
                    <Alert color="red" className="mb-4">
                        <IoWarning className="h-5 w-5" />
                        {error}
                    </Alert>
                )}

                {/* Contenido del paso actual */}
                <div>
                    {currentStep === 0 && <StepFileSelection />}
                    {currentStep === 1 && <StepConfiguration />}
                    {currentStep === 2 && <StepValidation />}
                    {currentStep === 3 && <StepImport />}
                    {currentStep === 4 && <StepImport />}
                </div>
            </DialogBody>

            <DialogFooter className="flex justify-between">
                <div>
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        Reiniciar
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        {currentStep === 4 ? 'Cerrar' : 'Cancelar'}
                    </Button>

                    {currentStep === 1 && (
                        <Button
                            color="blue"
                            onClick={handleValidateFile}
                            disabled={!selectedFile || !selectedModel || loading}
                            className="flex items-center gap-2"
                        >
                            <IoEye className="h-4 w-4" />
                            Validar Archivo
                        </Button>
                    )}

                    {currentStep === 2 && validationErrors.length === 0 && (
                        <Button
                            color="orange"
                            onClick={() => setCurrentStep(3)}
                            className="flex items-center gap-2"
                        >
                            <IoPlay className="h-4 w-4" />
                            Continuar
                        </Button>
                    )}

                    {currentStep === 3 && (
                        <Button
                            color="green"
                            onClick={handleImport}
                            disabled={loading}
                            loading={loading}
                            className="flex items-center gap-2"
                        >
                            <IoCloudUpload className="h-4 w-4" />
                            Importar Equipos
                        </Button>
                    )}
                </div>
            </DialogFooter>
        </Dialog>
    );
};

export default ImportacionMasivaDialog;