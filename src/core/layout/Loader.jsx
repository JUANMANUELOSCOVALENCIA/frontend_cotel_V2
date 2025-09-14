import React from 'react';
import { Spinner } from '@material-tailwind/react';

const Loader = ({
                    size = 'lg',
                    color = 'blue',
                    fullScreen = true,
                    message = 'Cargando...',
                    className = ''
                }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-center">
                    <Spinner
                        className={`${sizeClasses[size]} mx-auto mb-4`}
                        color={color}
                    />
                    <p className="text-gray-600 text-sm font-medium">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center p-8 ${className}`}>
            <div className="text-center">
                <Spinner
                    className={`${sizeClasses[size]} mx-auto mb-2`}
                    color={color}
                />
                <p className="text-gray-600 text-xs">{message}</p>
            </div>
        </div>
    );
};

export default Loader;