// src/core/almacenes/pages/proveedores/ConfirmDialog.jsx
import React from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Alert
} from '@material-tailwind/react';
import { IoWarningOutline, IoTrashOutline } from 'react-icons/io5';

const ConfirmDialog = ({
                           open,
                           title = "Confirmar Acción",
                           message,
                           confirmText = "Confirmar",
                           cancelText = "Cancelar",
                           confirmColor = "red",
                           loading = false,
                           onConfirm,
                           onCancel
                       }) => {
    return (
        <Dialog open={open} handler={onCancel} size="sm">
            <DialogHeader className="flex items-center gap-2">
                <IoWarningOutline className="h-6 w-6 text-orange-500" />
                <Typography variant="h5" color="blue-gray">
                    {title}
                </Typography>
            </DialogHeader>

            <DialogBody>
                <Typography color="blue-gray">
                    {message}
                </Typography>
            </DialogBody>

            <DialogFooter className="space-x-2">
                <Button
                    variant="text"
                    color="gray"
                    onClick={onCancel}
                    disabled={loading}
                >
                    {cancelText}
                </Button>
                <Button
                    color={confirmColor}
                    onClick={onConfirm}
                    disabled={loading}
                    loading={loading}
                    className="flex items-center gap-2"
                >
                    <IoTrashOutline className="h-4 w-4" />
                    {confirmText}
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default ConfirmDialog;