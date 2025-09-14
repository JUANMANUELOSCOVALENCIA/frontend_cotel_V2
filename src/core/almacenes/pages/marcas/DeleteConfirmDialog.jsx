// ======================================================
// src/core/almacenes/pages/marcas/DeleteConfirmDialog.jsx
// ======================================================

import React, { useState } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Alert,
    Spinner
} from '@material-tailwind/react';
import { IoWarning } from 'react-icons/io5';

const DeleteConfirmDialog = React.memo(({
                                            open,
                                            onClose,
                                            onConfirm,
                                            itemName,
                                            itemType = 'elemento'
                                        }) => {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        setDeleting(true);
        setError(null);

        try {
            const result = await onConfirm();
            if (!result?.success) {
                setError(result?.error || 'Error al eliminar el elemento');
            }
        } catch (err) {
            setError('Error inesperado al eliminar');
        } finally {
            setDeleting(false);
        }
    };

    const handleClose = () => {
        if (!deleting) {
            setError(null);
            onClose();
        }
    };

    React.useEffect(() => {
        if (open) {
            setError(null);
        }
    }, [open]);

    return (
        <Dialog open={open} handler={handleClose} size="sm">
            <DialogHeader className="flex items-center gap-2">
                <IoWarning className="h-6 w-6 text-red-500" />
                <Typography variant="h5" color="red">
                    Confirmar Eliminación
                </Typography>
            </DialogHeader>

            <DialogBody divider className="space-y-4">
                {error && (
                    <Alert color="red">
                        {error}
                    </Alert>
                )}

                <div className="text-center">
                    <Typography variant="h6" color="blue-gray">
                        ¿Estás seguro de que deseas eliminar {itemType}?
                    </Typography>

                    {itemName && (
                        <Typography variant="lead" color="blue-gray" className="mt-2 font-bold">
                            "{itemName}"
                        </Typography>
                    )}

                    <Typography color="gray" className="mt-4">
                        Esta acción no se puede deshacer.
                    </Typography>
                </div>

                <Alert color="orange" variant="ghost">
                    <Typography variant="small">
                        <strong>Advertencia:</strong> Si esta {itemType} tiene elementos relacionados,
                        podría no ser posible eliminarla.
                    </Typography>
                </Alert>
            </DialogBody>

            <DialogFooter className="space-x-2">
                <Button
                    variant="text"
                    color="gray"
                    onClick={handleClose}
                    disabled={deleting}
                >
                    Cancelar
                </Button>
                <Button
                    color="red"
                    onClick={handleConfirm}
                    disabled={deleting}
                    className="flex items-center gap-2"
                >
                    {deleting && <Spinner className="h-4 w-4" />}
                    Eliminar
                </Button>
            </DialogFooter>
        </Dialog>
    );
});

DeleteConfirmDialog.displayName = 'DeleteConfirmDialog';

export default DeleteConfirmDialog;