// Script to import Catalina.xlsx data to Santa Catalina ranch
// Run this in the browser console on index.html

// Excel serial date converter
function excelDateToJSDate(serial) {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split('T')[0];
}

// Catalina data from Excel
const catalinaData = [
    { numero: '140', lote: '22', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 135, precioKilo: 8400, fechaSerial: 45073, fecha: '2023-05-27' },
    { numero: '142', lote: '22', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 163, precioKilo: 8400, fechaSerial: 45073, fecha: '2023-05-27' },
    { numero: '144', lote: '22', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 200, precioKilo: 8400, fechaSerial: 45073, fecha: '2023-05-27' },
    { numero: '153', lote: '23', vendedor: 'Joye', sexo: 'MACHO', peso: 126, precioKilo: 7900, fechaSerial: 45081, fecha: '2023-06-04' },
    { numero: '155', lote: '25', vendedor: 'Joye', sexo: 'MACHO', peso: 194, precioKilo: 7900, fechaSerial: 45081, fecha: '2023-06-04' },
    { numero: '161', lote: '26', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 178, precioKilo: 8200, fechaSerial: 45127, fecha: '2023-07-20' },
    { numero: '162', lote: '26', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 150, precioKilo: 8200, fechaSerial: 45127, fecha: '2023-07-20' },
    { numero: '165', lote: '26', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 224, precioKilo: 8200, fechaSerial: 45127, fecha: '2023-07-20' },
    { numero: '166', lote: '27', vendedor: 'Joye', sexo: 'MACHO', peso: 143, precioKilo: 8200, fechaSerial: 45151, fecha: '2023-08-13' },
    { numero: '167', lote: '27', vendedor: 'Joye', sexo: 'MACHO', peso: 139, precioKilo: 8200, fechaSerial: 45151, fecha: '2023-08-13' },
    { numero: '173', lote: '29', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 239, precioKilo: 8100, fechaSerial: 45214, fecha: '2023-10-15' },
    { numero: '175', lote: '30', vendedor: 'San Fernando', sexo: 'MACHO', peso: 221, precioKilo: 8200, fechaSerial: 45301, fecha: '2024-01-10' },
    { numero: '178', lote: '31', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 200, precioKilo: 8000, fechaSerial: 45301, fecha: '2024-01-10' },
    { numero: '179', lote: '31', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 271, precioKilo: 8000, fechaSerial: 45301, fecha: '2024-01-10' },
    { numero: '181', lote: '31', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 256, precioKilo: 8000, fechaSerial: 45301, fecha: '2024-01-10' },
    { numero: '183', lote: '32', vendedor: 'Fernando Uribe', sexo: 'MACHO', peso: 212, precioKilo: 7900.943396226415, fechaSerial: 45365, fecha: '2024-03-14' },
    { numero: '184', lote: '33', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 294, precioKilo: 8000, fechaSerial: 45451, fecha: '2024-06-08' },
    { numero: '185', lote: '33', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 265, precioKilo: 8000, fechaSerial: 45451, fecha: '2024-06-08' },
    { numero: '187', lote: '35', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 237, precioKilo: 8000, fechaSerial: 45451, fecha: '2024-06-08' },
    { numero: '188', lote: '35', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 233, precioKilo: 8000, fechaSerial: 45451, fecha: '2024-06-08' },
    { numero: '190', lote: '35', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 256, precioKilo: 8000, fechaSerial: 45451, fecha: '2024-06-08' },
    { numero: '191', lote: '35', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 306, precioKilo: 8000, fechaSerial: 45451, fecha: '2024-06-08' },
    { numero: '192', lote: '35', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 257, precioKilo: 8000, fechaSerial: 45451, fecha: '2024-06-08' },
    { numero: '193', lote: '35', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 260, precioKilo: 8000, fechaSerial: 45451, fecha: '2024-06-08' },
    { numero: '195', lote: '35', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 213, precioKilo: 8000, fechaSerial: 45451, fecha: '2024-06-08' },
    { numero: '196', lote: '36', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 256, precioKilo: 8000, fechaSerial: 45464, fecha: '2024-06-21' },
    { numero: '197', lote: '36', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 258, precioKilo: 8000, fechaSerial: 45464, fecha: '2024-06-21' },
    { numero: '198', lote: '36', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 279, precioKilo: 8000, fechaSerial: 45464, fecha: '2024-06-21' },
    { numero: '201', lote: '37', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 268, precioKilo: 8000, fechaSerial: 45500, fecha: '2024-07-27' },
    { numero: '202', lote: '38', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 274, precioKilo: 8000, fechaSerial: 45514, fecha: '2024-08-10' },
    { numero: '203', lote: '39', vendedor: 'Llanitos', sexo: 'MACHO', peso: 244, precioKilo: 8000, fechaSerial: 45514, fecha: '2024-08-10' },
    { numero: '207', lote: '40', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 260, precioKilo: 8000, fechaSerial: 45514, fecha: '2024-08-10' },
    { numero: '208', lote: '41', vendedor: 'Llanitos', sexo: 'MACHO', peso: 260, precioKilo: 8000, fechaSerial: 45514, fecha: '2024-08-10' },
    { numero: '215', lote: '42', vendedor: 'Gustavo García', sexo: 'MACHO', peso: 293, precioKilo: 7800, fechaSerial: 45570, fecha: '2024-10-05' },
    { numero: '216', lote: '43', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 300, precioKilo: 8100, fechaSerial: 45577, fecha: '2024-10-12' },
    { numero: '217', lote: '43', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 190, precioKilo: 8100, fechaSerial: 45577, fecha: '2024-10-12' },
    { numero: '218', lote: '43', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 235, precioKilo: 8100, fechaSerial: 45577, fecha: '2024-10-12' },
    { numero: '219', lote: '43', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 265, precioKilo: 8100, fechaSerial: 45577, fecha: '2024-10-12' },
    { numero: '220', lote: '43', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 257, precioKilo: 8100, fechaSerial: 45577, fecha: '2024-10-12' },
    { numero: '221', lote: '43', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 208, precioKilo: 8100, fechaSerial: 45577, fecha: '2024-10-12' },
    { numero: '222', lote: '43', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 221, precioKilo: 8100, fechaSerial: 45577, fecha: '2024-10-12' },
    { numero: '223', lote: '44', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 307, precioKilo: 7950, fechaSerial: 45613, fecha: '2024-11-17' },
    { numero: '224', lote: '44', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 292, precioKilo: 7950, fechaSerial: 45613, fecha: '2024-11-17' },
    { numero: '225', lote: '44', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 288, precioKilo: 7950, fechaSerial: 45613, fecha: '2024-11-17' },
    { numero: '226', lote: '45', vendedor: 'Fernando Uribe', sexo: 'MACHO', peso: 247, precioKilo: 8400, fechaSerial: 45687, fecha: '2025-01-30' },
    { numero: '227', lote: '46', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 247, precioKilo: 8100, fechaSerial: 45711, fecha: '2025-02-23' },
    { numero: '228', lote: '46', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 212, precioKilo: 8100, fechaSerial: 45711, fecha: '2025-02-23' },
    { numero: '229', lote: '46', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 215, precioKilo: 8100, fechaSerial: 45711, fecha: '2025-02-23' },
    { numero: '230', lote: '46', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 206, precioKilo: 8100, fechaSerial: 45711, fecha: '2025-02-23' },
    { numero: '231', lote: '46', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 230, precioKilo: 8100, fechaSerial: 45711, fecha: '2025-02-23' },
    { numero: '232', lote: '47', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 315, precioKilo: 8100, fechaSerial: 45761, fecha: '2025-04-14' },
    { numero: '233', lote: '48', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 228, precioKilo: 8300, fechaSerial: 45762, fecha: '2025-04-15' },
    { numero: '234', lote: '48', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 227, precioKilo: 8300, fechaSerial: 45762, fecha: '2025-04-15' },
    { numero: '235', lote: '48', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 205, precioKilo: 8300, fechaSerial: 45762, fecha: '2025-04-15' },
    { numero: '236', lote: '48', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 190, precioKilo: 8300, fechaSerial: 45762, fecha: '2025-04-15' },
    { numero: '237', lote: '48', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 180, precioKilo: 8300, fechaSerial: 45762, fecha: '2025-04-15' },
    { numero: '238', lote: '48', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 210, precioKilo: 8300, fechaSerial: 45762, fecha: '2025-04-15' },
    { numero: '239', lote: '48', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 182, precioKilo: 8300, fechaSerial: 45762, fecha: '2025-04-15' },
    { numero: '240', lote: '48', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 229, precioKilo: 8300, fechaSerial: 45762, fecha: '2025-04-15' },
    { numero: '241', lote: '49', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 135, precioKilo: 9629.62962962963, fechaSerial: 45763, fecha: '2025-04-16' },
    { numero: '242', lote: '50', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 125, precioKilo: 10000, fechaSerial: 45763, fecha: '2025-04-16' },
    { numero: '243', lote: '51', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 230, precioKilo: 8300, fechaSerial: 45798, fecha: '2025-05-21' },
    { numero: '244', lote: '51', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 267, precioKilo: 8300, fechaSerial: 45798, fecha: '2025-05-21' },
    { numero: '245', lote: '51', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 306, precioKilo: 8300, fechaSerial: 45798, fecha: '2025-05-21' },
    { numero: '246', lote: '52', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 201, precioKilo: 8600, fechaSerial: 45878, fecha: '2025-08-09' },
    { numero: '247', lote: '52', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 206, precioKilo: 8600, fechaSerial: 45878, fecha: '2025-08-09' },
    { numero: '248', lote: '52', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 231, precioKilo: 8600, fechaSerial: 45878, fecha: '2025-08-09' },
    { numero: '249', lote: '52', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 175, precioKilo: 8600, fechaSerial: 45878, fecha: '2025-08-09' },
    { numero: '250', lote: '52', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 188, precioKilo: 8600, fechaSerial: 45878, fecha: '2025-08-09' },
    { numero: '251', lote: '52', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 221, precioKilo: 8600, fechaSerial: 45878, fecha: '2025-08-09' },
    { numero: '252', lote: '52', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 185, precioKilo: 8600, fechaSerial: 45878, fecha: '2025-08-09' },
    { numero: '253', lote: '53', vendedor: 'Vizcaya', sexo: 'MACHO', peso: 190, precioKilo: 9000, fechaSerial: 45884, fecha: '2025-08-15' },
    { numero: '254', lote: '54', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 395, precioKilo: 9225.606854, fechaSerial: 45899, fecha: '2025-08-30' },
    { numero: '255', lote: '54', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 349, precioKilo: 9225.606854, fechaSerial: 45899, fecha: '2025-08-30' },
    { numero: '256', lote: '54', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 337, precioKilo: 9225.606854, fechaSerial: 45899, fecha: '2025-08-30' },
    { numero: '257', lote: '54', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 288, precioKilo: 9225.606854, fechaSerial: 45899, fecha: '2025-08-30' },
    { numero: '258', lote: '55', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 259, precioKilo: 9100, fechaSerial: 45900, fecha: '2025-08-31' },
    { numero: '259', lote: '55', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 294, precioKilo: 9100, fechaSerial: 45900, fecha: '2025-08-31' },
    { numero: '260', lote: '55', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 226, precioKilo: 9100, fechaSerial: 45900, fecha: '2025-08-31' },
    { numero: '261', lote: '55', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 308, precioKilo: 9100, fechaSerial: 45900, fecha: '2025-08-31' },
    { numero: '262', lote: '55', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 203, precioKilo: 9100, fechaSerial: 45900, fecha: '2025-08-31' },
    { numero: '263', lote: '56', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 315, precioKilo: 9750, fechaSerial: 45990, fecha: '2025-11-29' },
    { numero: '264', lote: '56', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 305, precioKilo: 9750, fechaSerial: 45990, fecha: '2025-11-29' },
    { numero: '265', lote: '56', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 280, precioKilo: 9750, fechaSerial: 45990, fecha: '2025-11-29' },
    { numero: '266', lote: '56', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 280, precioKilo: 9750, fechaSerial: 45990, fecha: '2025-11-29' },
    { numero: '267', lote: '56', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 295, precioKilo: 9750, fechaSerial: 45990, fecha: '2025-11-29' },
    { numero: '268', lote: '56', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 260, precioKilo: 9750, fechaSerial: 45990, fecha: '2025-11-29' },
    { numero: '269', lote: '56', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 300, precioKilo: 9750, fechaSerial: 45990, fecha: '2025-11-29' },
    { numero: '270', lote: '56', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 295, precioKilo: 9750, fechaSerial: 45990, fecha: '2025-11-29' },
    { numero: '271', lote: '56', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 275, precioKilo: 9750, fechaSerial: 45990, fecha: '2025-11-29' },
    { numero: '272', lote: '56', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 314, precioKilo: 9750, fechaSerial: 45990, fecha: '2025-11-29' },
    { numero: '273', lote: '57', vendedor: 'Albeiro Pineda', sexo: 'MACHO', peso: 325, precioKilo: 9700, fechaSerial: 45993, fecha: '2025-12-02' }
];

// Convert to entrada format
const entradas = catalinaData.map(row => ({
    numero: row.numero,
    lote: row.lote,
    vendedor: row.vendedor,
    raza: 'Cebú', // Default raza
    sexo: row.sexo,
    peso: row.peso,
    precioKilo: row.precioKilo,
    fechaEntrada: row.fecha, // Using the text date
    numeroVaca: null,
    costoTotal: row.peso * row.precioKilo
}));

// Load current Santa Catalina data
const catalinaKey = 'ganadoFinca_SantaCatalina';
let catalinaData_existing = JSON.parse(localStorage.getItem(catalinaKey) || '{"entradas":[],"salidas":[],"config":{}}');

// Add new entradas
if (!catalinaData_existing.entradas) catalinaData_existing.entradas = [];
catalinaData_existing.entradas = catalinaData_existing.entradas.concat(entradas);

// Save back
localStorage.setItem(catalinaKey, JSON.stringify(catalinaData_existing));

console.log(`✅ Imported ${entradas.length} animals to Santa Catalina`);
console.log('Total animals in Santa Catalina:', catalinaData_existing.entradas.length);
