import React from 'react';
import { Typography, Card, CardBody, Button } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { IoWarning } from 'react-icons/io5';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl">
                    <CardBody className="p-6 text-center">
                        <div className="mb-4 h-20 w-20 text-red-500 mx-auto">
                            <IoWarning className="w-full h-full" />
                        </div>
                        <Typography variant="h4" color="red" className="mb-4">
                            Acceso Denegado
                        </Typography>
                        <Typography color="gray" className="mb-6">
                            No tienes permisos para acceder a esta página.
                        </Typography>
                        <Button
                            color="blue"
                            onClick={() => navigate('/dashboard')}
                            fullWidth
                        >
                            Volver al Dashboard
                        </Button>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default Unauthorized;