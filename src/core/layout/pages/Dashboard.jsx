import React from 'react';
import { Typography, Card, CardBody } from '@material-tailwind/react';
import { useUser } from '../../auth/hooks/useAuth';

const Dashboard = () => {
    const { user, fullName } = useUser();

    return (
        <div className="space-y-6">
            <div>
                <Typography variant="h3" color="blue-gray">
                    Bienvenido, {user?.nombres}
                </Typography>
                <Typography color="gray" className="mt-1">
                    Panel principal del sistema COTEL
                </Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-l-4 border-orange-500">
                    <CardBody>
                        <Typography variant="h6" color="blue-gray">
                            Tu Información
                        </Typography>
                        <div className="mt-2 space-y-1">
                            <Typography variant="small" color="gray">
                                <span className="font-medium">Nombre:</span> {fullName}
                            </Typography>
                            <Typography variant="small" color="gray">
                                <span className="font-medium">Código COTEL:</span> {user?.codigocotel}
                            </Typography>
                            <Typography variant="small" color="gray">
                                <span className="font-medium">Rol:</span> {user?.rol || 'No asignado'}
                            </Typography>
                        </div>
                    </CardBody>
                </Card>

                <Card className="border-l-4 border-gray-500">
                    <CardBody>
                        <Typography variant="h6" color="blue-gray">
                            Estado del Sistema
                        </Typography>
                        <div className="mt-2">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <Typography variant="small" color="gray">
                                    Operativo
                                </Typography>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="border-l-4 border-blue-500">
                    <CardBody>
                        <Typography variant="h6" color="blue-gray">
                            Acceso Rápido
                        </Typography>
                        <Typography variant="small" color="gray" className="mt-2">
                            Utiliza el menú superior para navegar por los módulos disponibles
                        </Typography>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;