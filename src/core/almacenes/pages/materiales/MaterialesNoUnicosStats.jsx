// src/core/almacenes/pages/materiales-no-unicos/MaterialesNoUnicosStats.jsx
import React from 'react';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { IoCube, IoCheckmarkCircle, IoWarning, IoBarChart } from 'react-icons/io5';

const MaterialesNoUnicosStats = ({ estadisticas, loading }) => {
    if (loading || !estadisticas) {
        return null;
    }

    const stats = [
        {
            title: 'Total Materiales',
            value: estadisticas.total || 0,
            icon: IoCube,
            color: 'blue'
        },
        {
            title: 'Disponibles',
            value: estadisticas.por_estado?.Disponible || 0,
            icon: IoCheckmarkCircle,
            color: 'green'
        },
        {
            title: 'En Uso',
            value: estadisticas.por_estado?.Asignado || 0,
            icon: IoBarChart,
            color: 'amber'
        },
        {
            title: 'Con Problemas',
            value: estadisticas.por_estado?.Defectuoso || 0,
            icon: IoWarning,
            color: 'red'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-500',
            green: 'bg-green-50 text-green-500',
            amber: 'bg-amber-50 text-amber-500',
            red: 'bg-red-50 text-red-500'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography color="gray" className="mb-1 text-sm">
                                    {stat.title}
                                </Typography>
                                <Typography variant="h4" color="blue-gray">
                                    {stat.value}
                                </Typography>
                            </div>
                            <div className={`rounded-full p-3 ${getColorClasses(stat.color)}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
};

export default MaterialesNoUnicosStats;