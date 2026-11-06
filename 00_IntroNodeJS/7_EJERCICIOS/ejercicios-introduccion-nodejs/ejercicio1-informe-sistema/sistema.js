// Ejercicio 1 · Informe del sistema
// Muestra información del equipo usando el módulo nativo 'os'
// y le da color con la librería externa 'picocolors'.

const os = require('node:os')
const pc = require('picocolors')

// ---------- Funciones auxiliares ----------

// Convierte bytes a GB con 2 decimales (1 GB = 1024 * 1024 * 1024 bytes)
function formatearBytes (bytes) {
  const gb = bytes / 1024 / 1024 / 1024
  return gb.toFixed(2) + ' GB'
}

// Convierte segundos al formato "Xh Ym"
function formatearUptime (segundos) {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  return `${horas}h ${minutos}m`
}

// Devuelve el porcentaje coloreado según su valor
function colorearPorcentaje (porcentaje) {
  const texto = porcentaje.toFixed(1) + ' %'
  if (porcentaje < 60) return pc.green(texto)
  if (porcentaje <= 85) return pc.yellow(texto)
  return pc.red(texto)
}

// Imprime una línea "etiqueta: valor" con los colores pedidos
function mostrarDato (etiqueta, valor) {
  console.log('  ' + pc.dim(etiqueta.padEnd(15)) + valor)
}

// Imprime un título en negrita y cian
function mostrarTitulo (texto) {
  console.log('\n' + pc.bold(pc.cyan(texto)))
}

// ---------- Recogida de datos ----------

const cpus = os.cpus()
const memoriaTotal = os.totalmem()
const memoriaLibre = os.freemem()
const memoriaUsada = memoriaTotal - memoriaLibre
const porcentajeUsado = (memoriaUsada / memoriaTotal) * 100

// ---------- Informe ----------

mostrarTitulo('=== INFORME DEL SISTEMA ===')

mostrarTitulo('General')
mostrarDato('Equipo:', pc.white(os.hostname()))
mostrarDato('Sistema:', pc.white(`${os.type()} ${os.release()} (${os.arch()})`))
mostrarDato('Usuario:', pc.white(os.userInfo().username))

mostrarTitulo('Procesador')
mostrarDato('Modelo:', pc.white(cpus[0].model.trim()))
mostrarDato('Nº de CPUs:', pc.green(cpus.length))

mostrarTitulo('Memoria')
mostrarDato('Total:', pc.white(formatearBytes(memoriaTotal)))
mostrarDato('Libre:', pc.green(formatearBytes(memoriaLibre)))
mostrarDato('Usada:', colorearPorcentaje(porcentajeUsado))

mostrarTitulo('Tiempo activo')
mostrarDato('Uptime:', pc.white(formatearUptime(os.uptime())))

console.log()
