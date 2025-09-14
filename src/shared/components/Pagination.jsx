import React from 'react';
import {
    Button,
    IconButton,
    Typography,
} from '@material-tailwind/react';
import {
    IoChevronBack,
    IoChevronForward,
    IoEllipsisHorizontal,
} from 'react-icons/io5';

const Pagination = ({
                        currentPage,
                        totalPages,
                        onPageChange,
                        showInfo = false,
                        totalItems = 0,
                        itemsPerPage = 20,
                        maxVisiblePages = 5
                    }) => {
    // Calcular rango de páginas visibles
    const getVisiblePages = () => {
        const delta = Math.floor(maxVisiblePages / 2);
        let start = Math.max(1, currentPage - delta);
        let end = Math.min(totalPages, start + maxVisiblePages - 1);

        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    // Calcular información de elementos mostrados
    const getItemsInfo = () => {
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, totalItems);
        return { start, end };
    };

    const visiblePages = getVisiblePages();
    const itemsInfo = getItemsInfo();

    const handlePageClick = (page) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    if (totalPages <= 1) {
        return showInfo ? (
            <div className="flex justify-center">
                <Typography variant="small" color="gray">
                    Mostrando {totalItems} {totalItems === 1 ? 'elemento' : 'elementos'}
                </Typography>
            </div>
        ) : null;
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Información de elementos */}
            {showInfo && (
                <Typography variant="small" color="gray">
                    Mostrando {itemsInfo.start} a {itemsInfo.end} de {totalItems} elementos
                </Typography>
            )}

            {/* Controles de paginación */}
            <div className="flex items-center gap-1">
                {/* Botón anterior */}
                <IconButton
                    variant="text"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                >
                    <IoChevronBack className="h-4 w-4" />
                </IconButton>

                {/* Primera página si no está visible */}
                {visiblePages[0] > 1 && (
                    <>
                        <IconButton
                            variant={1 === currentPage ? "filled" : "text"}
                            size="sm"
                            onClick={() => handlePageClick(1)}
                        >
                            1
                        </IconButton>
                        {visiblePages[0] > 2 && (
                            <IconButton variant="text" size="sm" disabled>
                                <IoEllipsisHorizontal className="h-4 w-4" />
                            </IconButton>
                        )}
                    </>
                )}

                {/* Páginas visibles */}
                {visiblePages.map((page) => (
                    <IconButton
                        key={page}
                        variant={page === currentPage ? "filled" : "text"}
                        size="sm"
                        onClick={() => handlePageClick(page)}
                    >
                        {page}
                    </IconButton>
                ))}

                {/* Última página si no está visible */}
                {visiblePages[visiblePages.length - 1] < totalPages && (
                    <>
                        {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                            <IconButton variant="text" size="sm" disabled>
                                <IoEllipsisHorizontal className="h-4 w-4" />
                            </IconButton>
                        )}
                        <IconButton
                            variant={totalPages === currentPage ? "filled" : "text"}
                            size="sm"
                            onClick={() => handlePageClick(totalPages)}
                        >
                            {totalPages}
                        </IconButton>
                    </>
                )}

                {/* Botón siguiente */}
                <IconButton
                    variant="text"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                >
                    <IoChevronForward className="h-4 w-4" />
                </IconButton>
            </div>

            {/* Botones de navegación rápida (opcional) */}
            <div className="flex items-center gap-2">
                <Button
                    variant="text"
                    size="sm"
                    onClick={() => handlePageClick(1)}
                    disabled={currentPage === 1}
                >
                    Primera
                </Button>
                <Button
                    variant="text"
                    size="sm"
                    onClick={() => handlePageClick(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    Última
                </Button>
            </div>
        </div>
    );
};

export default Pagination;