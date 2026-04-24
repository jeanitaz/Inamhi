fetch('http://10.0.153.73:3001/')
    .then(res => res.json())
    .then(data => {
        const ticket56 = data.find(t => t.id === 'INAMHI-DAF-UTICS-2026-0056-ST');
        console.log(ticket56 ? ticket56 : 'No se encontró el ticket 56');
    })
    .catch(err => console.error("Error:", err));
