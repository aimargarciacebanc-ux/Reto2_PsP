// Ejercicio 3 · Informe a archivo con historial (os + fs + picocolors)
// Uso: node informe.js
//
// Hace lo mismo que el ejercicio 1 y además:
//   - informe.txt   -> se SOBRESCRIBE en cada ejecución (writeFileSync)
//   - historial.log -> se AÑADE una línea en cada ejecución (appendFileSync)
//
// Idea clave: el texto que se guarda en los archivos va SIN colores.
// Los colores (picocolors) solo se aplican al mostrarlo por consola.

const os = require('node:os')
const fs = require('node:fs')
const pc = require('picocolors')

// ---------- Funciones auxiliares ----------

function formatearBytes (bytes) {
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

function formatearUptime (segundos) {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  return `${horas}h ${minutos}m`
}

function colorearPorcentaje (texto, porcentaje) {
  if (porcentaje < 60) return pc.green(texto)
  if (porcentaje <= 85) return pc.yellow(texto)
  return pc.red(texto)
}

// Devuelve la fecha actual como "2026-11-01 10:32:15"
function fechaActual () {
  const d = new Date()
  const dos = (n) => String(n).padStart(2, '0') // 5 -> "05"
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())} ` +
         `${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`
}

// ---------- Recogida de datos ----------

const cpus = os.cpus()
const memoriaTotal = os.totalmem()
const memoriaLibre = os.freemem()
const porcentajeUsado = ((memoriaTotal - memoriaLibre) / memoriaTotal) * 100
const textoPorcentaje = porcentajeUsado.toFixed(1) + ' %'

// El informe se guarda como una lista de secciones con sus datos.
// Así podemos usar los mismos datos para el archivo (sin color) y la consola (con color).
const secciones = [
  {
    titulo: 'General',
    datos: [
      ['Equipo:', os.hostname()],
      ['Sistema:', `${os.type()} ${os.release()} (${os.arch()})`],
      ['Usuario:', os.userInfo().username]
    ]
  },
  {
    titulo: 'Procesador',
    datos: [
      ['Modelo:', cpus[0].model.trim()],
      ['Nº de CPUs:', String(cpus.length)]
    ]
  },
  {
    titulo: 'Memoria',
    datos: [
      ['Total:', formatearBytes(memoriaTotal)],
      ['Libre:', formatearBytes(memoriaLibre)],
      ['Usada:', textoPorcentaje]
    ]
  },
  {
    titulo: 'Tiempo activo',
    datos: [
      ['Uptime:', formatearUptime(os.uptime())]
    ]
  }
]

// ---------- 1) Texto plano para el archivo ----------

let textoPlano = `=== INFORME DEL SISTEMA (${fechaActual()}) ===\n`
for (const seccion of secciones) {
  textoPlano += `\n${seccion.titulo}\n`
  for (const [etiqueta, valor] of seccion.datos) {
    textoPlano += `  ${etiqueta.padEnd(15)}${valor}\n`
  }
}

fs.writeFileSync('informe.txt', textoPlano)

// ---------- 2) Línea del historial ----------

const lineaHistorial = `${fechaActual()} | RAM usada: ${Math.round(porcentajeUsado)}%\n`
fs.appendFileSync('historial.log', lineaHistorial)

// ---------- 3) Mostrar por consola con colores ----------

console.log('\n' + pc.bold(pc.cyan('=== INFORME DEL SISTEMA ===')))
for (const seccion of secciones) {
  console.log('\n' + pc.bold(pc.cyan(seccion.titulo)))
  for (const [etiqueta, valor] of seccion.datos) {
    // El porcentaje de memoria lleva su color especial; el resto, blanco
    const valorColor = valor === textoPorcentaje
      ? colorearPorcentaje(valor, porcentajeUsado)
      : pc.white(valor)
    console.log('  ' + pc.dim(etiqueta.padEnd(15)) + valorColor)
  }
}

console.log('\n' + pc.green('✔ Informe guardado en informe.txt') + '\n')
