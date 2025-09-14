import React from 'react';
import { Typography, Card, CardBody, Button } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { IoSearch } from 'react-icons/io5';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 px-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl">
                    <CardBody className="p-6 text-center">
                        <div className="mb-4 h-20 w-20 text-gray-500 mx-auto">
                            <IoSearch className="w-full h-full" />
                        </div>
                        <Typography variant="h4" color="blue-gray" className="mb-4">
                            Página No Encontrada
                        </Typography>
                        <Typography color="gray" className="mb-6">
                            La página que buscas no existe o ha sido movida.
                        </Typography>
                        <Button
                            color="blue"
                            onClick={() => navigate('/dashboard')}
                            fullWidth
                        >
                            Ir al Dashboard
                        </Button>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default NotFound;