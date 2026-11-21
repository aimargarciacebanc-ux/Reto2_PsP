
// 1. IMPORTACIONES
const http = require('node:http');
const pc = require('picocolors');
const PORT = 3000;

// 2. DATOS
const clientes = [
  { id: 1, nombre: 'Ane Etxeberria', email: 'ane@correo.com', ciudad: 'Donostia' },
  { id: 2, nombre: 'Jon Garmendia', email: 'jon@correo.com', ciudad: 'Zumaia' },
  { id: 3, nombre: 'Miren Urrutia', email: 'miren@correo.com', ciudad: 'Irun' }
];

const pedidos = [
  { id: 101, clienteId: 1, producto: 'Teclado', cantidad: 2, total: 59.8 },
  { id: 102, clienteId: 2, producto: 'Ratón', cantidad: 1, total: 19.95 },
  { id: 103, clienteId: 1, producto: 'Monitor', cantidad: 1, total: 149.0 }
];

// 3. PÁGINAS HTML
const paginaBienvenida = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Bienvenida</title>
</head>
<body>
  <h1>¡Bienvenido a mi API!</h1>
  <p>Esta es una pequeña API hecha con Node.js puro que simula
     la gestión de clientes y pedidos.</p>
  <a href="/api">Ver la API</a>
</body>
</html>`;

const paginaApi = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Índice de la API</title>
</head>
<body>
  <h1>API de clientes y pedidos</h1>

  <h2>Clientes</h2>
  <h3>Listado completo de clientes</h3>
  <a href="/clientes">Ir a /clientes</a>

  <h2>Pedidos</h2>
  <h3>Listado completo de pedidos</h3>
  <a href="/pedidos">Ir a /pedidos</a>
</body>
</html>`;

// 4. FUNCIONES AUXILIARES DE LOG
function logRequest(req) {
  console.log(pc.bold(pc.yellow('------- REQUEST -----')));
  console.log(pc.bold(pc.yellow(`Request URL: ${req.url}`)));
  console.log(pc.bold(pc.yellow(`Request Method: ${req.method}`)));
}
function logResponse(mensaje, res) {
  console.log(pc.bold(pc.yellow('------- RESPONSE -----')));

  const color = res.statusCode === 200 ? pc.green : pc.red;

  console.log(color(`Response sent: ${mensaje}`));
  console.log(color(`Status code sent: ${res.statusCode}`));
}

// 5. SERVIDOR
const server = http.createServer((req, res) => {
  logRequest(req);

  switch (req.url) {
    case '/':
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(paginaBienvenida);
      logResponse('bienvenida', res);
      break;

    case '/api':
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(paginaApi);
      logResponse('api', res);
      break;

    case '/clientes':
      res.statusCode = 200;

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');

      res.end(JSON.stringify(clientes, null, 2));
      logResponse('clientes', res);
      break;

    case '/pedidos':
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(JSON.stringify(pedidos, null, 2));
      logResponse('pedidos', res);
      break;

    default:
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Error 404\nPage not found');
      logResponse('Error 404', res);
      break;
  }
});

// 6. ARRANQUE
server.listen(PORT, () => {
  console.log(pc.yellow(`Server listening on port ${PORT}`));
});