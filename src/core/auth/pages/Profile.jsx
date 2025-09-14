import React from 'react';
import { Typography, Card, CardBody } from '@material-tailwind/react';
import { useUser } from '../hooks/useAuth.js';

const Profile = () => {
    const { user, fullName } = useUser();

    return (
        <div className="space-y-6">
            <Typography variant="h3" color="blue-gray">
                Mi Perfil
            </Typography>
            <Card>
                <CardBody>
                    <div className="space-y-4">
                        <div>
                            <Typography variant="h6" color="blue-gray">
                                Información Personal
                            </Typography>
                            <Typography color="gray">
                                Nombre: {fullName}
                            </Typography>
                            <Typography color="gray">
                                Código COTEL: {user?.codigocotel}
                            </Typography>
                            <Typography color="gray">
                                Rol: {user?.rol || 'No asignado'}
                            </Typography>
                        </div>
                        <Typography color="gray">
                            Módulo de perfil en desarrollo...
                        </Typography>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Profile;