// Configuración dinámica de la URL del API
export const API_BASE_URL = 
    typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3001'
        : window.location.hostname === '10.0.153.73'
            ? 'http://10.0.153.73:3001'
            : `${window.location.protocol}//${window.location.hostname}`;
