// app.js
// EJER2 - API REST de Incidencias y Clientes para HelpDeskFX
// Recursos: /api/incidencias (GET, GET por código, POST)
//           /api/clientes    (CRUD completo)
// Persistencia: ficheros JSON en la carpeta DATOS_API
// Logger: middleware global con picocolors (verde 2xx, rojo 4xx)

const express = require('express');
const fs = require('fs');
const path = require('path');
const pc = require('picocolors');

const app = express();
const PORT = 5082; // Puerto que espera el cliente HelpDeskFX

// ------------------------------------------------------------
// RUTAS DE LOS FICHEROS DE DATOS
// ------------------------------------------------------------
// __dirname = carpeta donde está app.js, así funciona aunque
// arranques el servidor desde otra carpeta.
const RUTA_INCIDENCIAS = path.join(__dirname, 'DATOS_API', 'incidencias.json');
const RUTA_CLIENTES = path.join(__dirname, 'DATOS_API', 'clientes.json');

// ------------------------------------------------------------
// FUNCIONES DE LECTURA / ESCRITURA DE JSON
// ------------------------------------------------------------
// Lee un fichero JSON y lo convierte en un array de JavaScript
function leerJSON(ruta) {
  const contenido = fs.readFileSync(ruta, 'utf-8');
  return JSON.parse(contenido);
}

// Convierte el array a texto JSON (con sangría de 2 espacios
// para que el fichero sea legible) y lo guarda en disco
function guardarJSON(ruta, datos) {
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), 'utf-8');
}

// Cargamos los datos en memoria al arrancar el servidor
let incidencias = leerJSON(RUTA_INCIDENCIAS);
let clientes = leerJSON(RUTA_CLIENTES);

// ------------------------------------------------------------
// MIDDLEWARES GLOBALES
// ------------------------------------------------------------
// 1) Permite leer el cuerpo de las peticiones en formato JSON (req.body)
app.use(express.json());

// 2) Logger con picocolors.
// El código de estado no se conoce hasta que se envía la respuesta,
// por eso escuchamos el evento 'finish' de res.
app.use((req, res, next) => {
  res.on('finish', () => {
    const estado = res.statusCode;
    let estadoColoreado;

    if (estado >= 200 && estado < 300) {
      estadoColoreado = pc.green(estado);   // 2xx -> verde
    } else if (estado >= 400 && estado < 500) {
      estadoColoreado = pc.red(estado);     // 4xx -> rojo
    } else {
      estadoColoreado = pc.yellow(estado);  // otros (3xx, 5xx) -> amarillo
    }

    console.log(`${pc.cyan(req.method)} ${req.originalUrl} -> ${estadoColoreado}`);
  });

  next(); // pasamos al siguiente middleware / ruta
});

// ============================================================
// ENDPOINTS DE INCIDENCIAS
// ============================================================

// Genera el siguiente código: busca el número más alto de los
// códigos existentes (H001 -> 1, H003 -> 3...) y le suma 1.
// Con los datos de ejemplo, el primero nuevo será H004.
function siguienteCodigo() {
  let maximo = 0;
  for (const inc of incidencias) {
    const numero = parseInt(inc.codigo.substring(1)); // quita la 'H'
    if (numero > maximo) {
      maximo = numero;
    }
  }
  return 'H' + String(maximo + 1).padStart(3, '0');
}

// GET /api/incidencias -> lista todas
app.get('/api/incidencias', (req, res) => {
  res.status(200).json(incidencias);
});

// GET /api/incidencias/:codigo -> una por su código (H001, H002...)
app.get('/api/incidencias/:codigo', (req, res) => {
  // Se compara como texto, no se convierte a número
  const codigo = req.params.codigo;
  const incidencia = incidencias.find(i => i.codigo === codigo);

  if (!incidencia) {
    return res.status(404).json({ error: `Incidencia ${codigo} no encontrada` });
  }
  res.status(200).json(incidencia);
});

// POST /api/incidencias -> crea una nueva
app.post('/api/incidencias', (req, res) => {
  const { titulo, prioridad, fecha, descripcion } = req.body;

  // Se construye el objeto con los campos en el orden pedido.
  // codigo y estado los pone el servidor.
  // La fecha se guarda tal cual llega (sin new Date()).
  const nuevaIncidencia = {
    codigo: siguienteCodigo(),
    titulo,
    prioridad,
    fecha,
    descripcion,
    estado: 'Pendiente'
  };

  incidencias.push(nuevaIncidencia);
  guardarJSON(RUTA_INCIDENCIAS, incidencias);

  res.status(201).json(nuevaIncidencia);
});

// ============================================================
// ENDPOINTS DE CLIENTES (CRUD COMPLETO)
// ============================================================

// Siguiente ID disponible: el mayor + 1 (o 1 si no hay clientes)
const siguienteId = () =>
  clientes.length ? Math.max(...clientes.map(c => c.id)) + 1 : 1;

// GET /api/clientes -> lista todos
app.get('/api/clientes', (req, res) => {
  res.status(200).json(clientes);
});

// GET /api/clientes/:id -> uno por su ID
app.get('/api/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id); // el parámetro llega como texto
  const cliente = clientes.find(c => c.id === id);

  if (!cliente) {
    return res.status(404).json({ error: `Cliente ${req.params.id} no encontrado` });
  }
  res.status(200).json(cliente);
});

// POST /api/clientes -> crea uno nuevo
app.post('/api/clientes', (req, res) => {
  const { nombre, email, telefono } = req.body;

  const nuevoCliente = {
    id: siguienteId(),
    nombre,
    email,
    telefono
  };

  clientes.push(nuevoCliente);
  guardarJSON(RUTA_CLIENTES, clientes);

  res.status(201).json(nuevoCliente);
});

// PUT /api/clientes/:id -> actualiza uno existente
app.put('/api/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cliente = clientes.find(c => c.id === id);

  if (!cliente) {
    return res.status(404).json({ error: `Cliente ${req.params.id} no encontrado` });
  }

  const { nombre, email, telefono } = req.body;

  // Solo se cambian los campos que vienen en el cuerpo;
  // si alguno no viene, se mantiene el valor anterior.
  if (nombre !== undefined) cliente.nombre = nombre;
  if (email !== undefined) cliente.email = email;
  if (telefono !== undefined) cliente.telefono = telefono;

  guardarJSON(RUTA_CLIENTES, clientes);
  res.status(200).json(cliente);
});

// DELETE /api/clientes/:id -> elimina uno
app.delete('/api/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cliente = clientes.find(c => c.id === id);

  if (!cliente) {
    return res.status(404).json({ error: `Cliente ${req.params.id} no encontrado` });
  }

  // Nos quedamos con todos menos el que se borra
  clientes = clientes.filter(c => c.id !== id);
  guardarJSON(RUTA_CLIENTES, clientes);

  res.status(200).json({ mensaje: 'Cliente eliminado correctamente', cliente });
});

// ------------------------------------------------------------
// ARRANQUE DEL SERVIDOR
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(pc.bold(`Servidor HelpDeskFX en marcha -> http://127.0.0.1:${PORT}/`));
});
