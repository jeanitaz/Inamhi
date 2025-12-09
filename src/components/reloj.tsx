import { useEffect, useState } from 'react';
import '../styles/reloj.css';

// Componente reutilizable para cada anillo
const TimeCircle = ({ 
    value, 
    maxValue, 
    color, 
    label, 
    size = 100 
}: { 
    value: number; 
    maxValue: number; 
    color: string; 
    label: string; 
    size?: number; 
}) => {
    const radius = size / 2 - 5; // Radio del círculo
    const circumference = 2 * Math.PI * radius; // Circunferencia total
    const strokeDashoffset = circumference - (value / maxValue) * circumference;

    return (
        <div className="time-circle" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                {/* Círculo de fondo (track) */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#333"
                    strokeWidth="4"
                />
                {/* Círculo de progreso */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                />
            </svg>
            <div className="inner-content">
                <span className="num" style={{ color: color }}>
                    {value.toString().padStart(2, '0')}
                </span>
                <span className="label">{label}</span>
            </div>
        </div>
    );
};

export default function Reloj() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    
    // Formato de hora (12h)
    const displayHour = h % 12 || 12;
    const ampm = h >= 12 ? "PM" : "AM";

    // Formato de fecha
    const dateString = time.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <div className="clock-widget glass-dark">
            <div className="clock-header">
                <span className="date-text">{dateString}</span>
            </div>
            
            <div className="clock-rings">
                <TimeCircle 
                    value={displayHour} 
                    maxValue={12} 
                    color="#ff3c7b" 
                    label="Horas" 
                />
                <div className="separator">:</div>
                <TimeCircle 
                    value={m} 
                    maxValue={60} 
                    color="#f6d32d" 
                    label="Minutos" 
                />
                <div className="separator">:</div>
                <TimeCircle 
                    value={s} 
                    maxValue={60} 
                    color="#00ff6a" 
                    label="Segundos" 
                />
            </div>
            
            <div className="ampm-tag">
                {ampm}
            </div>
        </div>
    );
}