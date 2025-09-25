import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Input,
    IconButton,
    Alert,
    Spinner,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter
} from '@material-tailwind/react';
import {
    IoAdd,
    IoSearch,
    IoRefresh,
    IoCloudUpload,
    IoCube,
    IoStatsChart,
    IoFilterOutline,
    IoCheckmarkCircle,
    IoTime,
    IoWarning,
    IoInformationCircle,
    IoClose
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { createPortal } from 'react-dom';

// Hooks y servicios
import { useLotes, useOpcionesCompletas } from '../../hooks/useAlmacenes';
import { usePermissions } from '../../../permissions/hooks/usePermissions';

// Componentes
import {
    LotesTable,
    LoteStatsCard,
    LoteDetailCard,
    LoteFilters
} from './loteComponents';
import LoteDialogs from './loteDialogs';

// Componente de importación masiva
import ImportacionMasivaDialog from '../importacion/ImportacionMasivaDialog';
import EntregasParcialesDialog from './EntregasParcialesDialog';

// Componente Modal mejorado
const Modal = ({ open, onClose, children, size = "lg" }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        if (open) {
            // Bloquear scroll del body
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '0px';

            // Enfocar el modal
            if (modalRef.current) {
                modalRef.current.focus();
            }
        } else {
            // Restaurar scroll del body
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [open]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && open) {
                onClose();
            }
        };

        if (open) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [open, onClose]);

    if (!open) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl'
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className={`relative bg-white m-4 rounded-lg shadow-2xl text-blue-gray-500 antialiased font-sans text-base font-light leading-relaxed w-full ${sizeClasses[size]} min-w-[95%] md:min-w-[83.333333%] 2xl:min-w-[75%] max-w-[95%] md:max-w-[83.333333%] 2xl:max-w-[75%] max-h-[90vh] overflow-y-auto`}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>,
        document.body
    );
};

const LotesPage = () => {
    const { hasPermission } = usePermissions();

    // ========== HOOKS ==========
    const {
        lotes,
        loading,
        error,
        loadLotes,
        createLote,
        deleteLote,
        permissions
    } = useLotes();

    const {
        opciones,
        loading: loadingOpciones
    } = useOpcionesCompletas();

    // ========== ESTADO LOCAL ==========
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLote, setSelectedLote] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [filtros, setFiltros] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        activos: 0,
        completados: 0,
        pendientes: 0
    });

    // Estados para diálogos
    const [dialogs, setDialogs] = useState({
        create: false,
        edit: false,
        confirm: false,
        import: false,
        entregas: false
    });
    const [confirmAction, setConfirmAction] = useState(null);

    // ========== EFECTOS ==========
    useEffect(() => {
        loadLotes();
    }, [loadLotes]);

    useEffect(() => {
        if (lotes.length > 0) {
            calculateStats();
        }
    }, [lotes]);

    // Suprimir errores de aria-hidden en desarrollo
    useEffect(() => {
        const originalError = console.error;
        console.error = (...args) => {
            if (typeof args[0] === 'string' &&
                (args[0].includes('aria-hidden') ||
                    args[0].includes('not contained inside'))) {
                return;
            }
            originalError(...args);
        };

        return () => {
            console.error = originalError;
        };
    }, []);

    // ========== FUNCIONES ==========
    const calculateStats = () => {
        const total = lotes.length;
        const activos = lotes.filter(l => ['ACTIVO', 'RECEPCION_PARCIAL'].includes(l.estado_info?.codigo)).length;
        const completados = lotes.filter(l => l.estado_info?.codigo === 'RECEPCION_COMPLETA').length;
        const pendientes = lotes.filter(l => l.cantidad_pendiente > 0).length;

        setStats({ total, activos, completados, pendientes });
    };

    const handleSearch = () => {
        const params = {};
        if (searchTerm) {
            params.search = searchTerm;
        }
        loadLotes({ ...params, ...filtros });
    };

    const handleFiltroChange = (key, value) => {
        const newFiltros = { ...filtros, [key]: value };
        setFiltros(newFiltros);
        loadLotes({ ...newFiltros, search: searchTerm });
    };

    const handleLimpiarFiltros = () => {
        setFiltros({});
        setSearchTerm('');
        loadLotes();
    };

    // ========== HANDLERS DE LOTES ==========
    const handleCreateLote = () => {
        setSelectedLote(null);
        setDialogs({ ...dialogs, create: true });
    };

    const handleViewLote = (lote) => {
        setSelectedLote(lote);
        setShowDetail(true);
    };

    const handleEditLote = (lote) => {
        setSelectedLote(lote);
        setDialogs({ ...dialogs, edit: true });
    };

    const handleDeleteLote = (lote) => {
        console.log('🗑️ ELIMINAR - Lote seleccionado:', lote);
        setConfirmAction({ action: 'delete', lote });
        setDialogs({ ...dialogs, confirm: true });
        console.log('🗑️ ELIMINAR - Dialog de confirmación abierto');
    };

    const handleImportLote = (lote) => {
        setSelectedLote(lote);
        setDialogs({ ...dialogs, import: true });
    };

    const handleEntregasLote = (lote) => {
        console.log('📦 ENTREGAS - Lote seleccionado:', lote);
        setSelectedLote(lote);
        setDialogs({ ...dialogs, entregas: true });
    };

    const handleLoteAction = async (action, lote) => {
        console.log('🎬 LOTE ACTION - Iniciando:', { action, lote: lote?.id });

        try {
            if (action === 'delete') {
                console.log('🗑️ ELIMINANDO - Llamando deleteLote para ID:', lote.id);

                const result = await deleteLote(lote.id);

                console.log('🗑️ ELIMINANDO - Resultado:', result);

                if (result.success) {
                    toast.success(`Lote ${lote.numero_lote} eliminado correctamente`);
                } else {
                    toast.error(result.error);
                }
            }

            console.log('✅ LOTE ACTION - Completada, lotes recargados');
        } catch (error) {
            console.error('❌ LOTE ACTION - Error:', error);
            toast.error(`Error al ejecutar ${action}`);
        }
    };

    // ========== HANDLERS DE DIÁLOGOS ==========
    const closeDialog = (dialogName) => {
        setDialogs({ ...dialogs, [dialogName]: false });
        if (dialogName === 'confirm') {
            setConfirmAction(null);
        }
        if (['import', 'entregas'].includes(dialogName)) {
            setSelectedLote(null);
        }
        if (dialogName === 'detail') {
            setShowDetail(false);
            setSelectedLote(null);
        }
    };

    const handleDialogSuccess = async (action) => {
        closeDialog(action === 'create' ? 'create' : action === 'edit' ? 'edit' : 'confirm');
        await loadLotes();

        if (action === 'create') {
            toast.success('¡Lote creado! Ahora puedes importar los materiales.');
        }
    };

    const handleImportSuccess = async () => {
        closeDialog('import');
        await loadLotes();
        toast.success('¡Importación completada! Los materiales han sido registrados.');
    };

    const handleEntregasSuccess = async () => {
        closeDialog('entregas');
        await loadLotes();
        toast.success('Entrega parcial registrada exitosamente');
    };

    // ========== RENDER PRINCIPAL ==========
    if (loadingOpciones) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner className="h-8 w-8" />
                <Typography color="gray" className="ml-2">
                    Cargando configuración...
                </Typography>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <Typography variant="h4" color="blue-gray">
                        Gestión de Lotes
                    </Typography>
                    <Typography color="gray">
                        Administra los lotes de materiales y equipos ONUs
                    </Typography>
                </div>

                <div className="flex items-center gap-3">
                    {permissions.canCreate && (
                        <Button
                            color="orange"
                            className="flex items-center gap-2"
                            onClick={handleCreateLote}
                        >
                            <IoAdd className="h-5 w-5" />
                            Crear Lote
                        </Button>
                    )}

                    <IconButton
                        variant="outlined"
                        color="blue-gray"
                        onClick={() => loadLotes()}
                    >
                        <IoRefresh className="h-5 w-5" />
                    </IconButton>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <LoteStatsCard
                    icon={IoCube}
                    title="Total Lotes"
                    value={stats.total}
                    color="blue"
                />
                <LoteStatsCard
                    icon={IoCloudUpload}
                    title="Lotes Activos"
                    value={stats.activos}
                    color="green"
                />
                <LoteStatsCard
                    icon={IoCheckmarkCircle}
                    title="Completados"
                    value={stats.completados}
                    color="teal"
                />
                <LoteStatsCard
                    icon={IoTime}
                    title="Pendientes"
                    value={stats.pendientes}
                    color="amber"
                />
            </div>

            {/* Alertas */}
            {error && (
                <Alert color="red" className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Barra de búsqueda y filtros */}
            <Card>
                <CardBody>
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                label="Buscar lotes..."
                                icon={<IoSearch className="h-5 w-5" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button
                            variant="outlined"
                            className="flex items-center gap-2"
                            onClick={handleSearch}
                        >
                            <IoSearch className="h-4 w-4" />
                            Buscar
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Filtros */}
            <LoteFilters
                filtros={filtros}
                onFiltroChange={handleFiltroChange}
                opciones={opciones}
                onLimpiarFiltros={handleLimpiarFiltros}
            />

            {/* Tabla de lotes */}
            <LotesTable
                lotes={lotes}
                loading={loading}
                onView={handleViewLote}
                onEdit={handleEditLote}
                onDelete={handleDeleteLote}
                onImport={handleImportLote}
                onEntregas={handleEntregasLote}
                permissions={permissions}
            />

            {/* Modal de detalle */}
            <Modal
                open={showDetail}
                onClose={() => closeDialog('detail')}
                size="xl"
            >
                {selectedLote && (
                    <>
                        <DialogHeader className="flex items-center justify-between">
                            <Typography variant="h5" color="blue-gray">
                                Detalle del Lote
                            </Typography>
                            <IconButton
                                variant="text"
                                color="blue-gray"
                                onClick={() => closeDialog('detail')}
                            >
                                <IoClose className="h-5 w-5" />
                            </IconButton>
                        </DialogHeader>
                        <DialogBody divider className="max-h-[70vh] overflow-y-auto">
                            <LoteDetailCard
                                lote={selectedLote}
                                onClose={() => closeDialog('detail')}
                                onImport={handleImportLote}
                                onSuccess={async () => {
                                    await loadLotes(); // Recargar lotes
                                    closeDialog('detail'); // Cerrar modal
                                }}
                                permissions={permissions}
                            />
                        </DialogBody>
                    </>
                )}
            </Modal>

            {/* Diálogos usando Modal corregido */}
            <LoteDialogs
                dialogs={dialogs}
                selectedLote={selectedLote}
                confirmAction={confirmAction}
                opciones={opciones}
                loading={loading}
                onCloseDialog={closeDialog}
                onSuccess={handleDialogSuccess}
                onLoteAction={handleLoteAction}
                ModalComponent={Modal}
            />

            {/* Diálogo de importación masiva */}
            <Modal
                open={dialogs.import}
                onClose={() => closeDialog('import')}
                size="xl"
            >
                {selectedLote && (
                    <ImportacionMasivaDialog
                        open={dialogs.import}
                        onClose={() => closeDialog('import')}
                        lote={selectedLote}
                        opciones={opciones}
                        onSuccess={handleImportSuccess}
                        useCustomModal={false}
                    />
                )}
            </Modal>

            {/* Diálogo de entregas parciales */}
            <Modal
                open={dialogs.entregas}
                onClose={() => closeDialog('entregas')}
                size="xl"
            >
                {selectedLote && (
                    <EntregasParcialesDialog
                        open={dialogs.entregas}
                        onClose={() => closeDialog('entregas')}
                        lote={selectedLote}
                        opciones={opciones}
                        onSuccess={handleEntregasSuccess}
                    />
                )}
            </Modal>
        </div>
    );
};

export default LotesPage;