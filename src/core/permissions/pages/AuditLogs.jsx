import React from 'react';
import { Typography, Card, CardBody } from '@material-tailwind/react';

const AuditLogs = () => {
    return (
        <div className="space-y-6">
            <Typography variant="h3" color="blue-gray">
                Logs de Auditoría
            </Typography>
            <Card>
                <CardBody>
                    <Typography>
                        Módulo de auditoría en desarrollo...
                    </Typography>
                </CardBody>
            </Card>
        </div>
    );
};

export default AuditLogs;