// Ejercicio 2 · Explorador de carpetas (fs + path + picocolors)
// Uso:
//   node listar.js ./mi-carpeta
//   node listar.js            (sin argumento: usa la carpeta actual)

const fs = require('node:fs')
const path = require('node:path')
const pc = require('picocolors')

// ---------- Funciones auxiliares ----------

// Convierte bytes a un texto legible: B, KB o MB
function formatearTamano (bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

// Muestra un error con fondo rojo y termina el programa con código 1
function salirConError (mensaje) {
  console.error(pc.bgRed(pc.white(' ERROR ')) + ' ' + mensaje)
  process.exit(1)
}

// ---------- Programa principal ----------

// process.argv = ['ruta/a/node', 'ruta/a/listar.js', 'argumento1', ...]
// El argumento que escribe el usuario está en la posición 2.
// Si no escribe nada, usamos '.' (la carpeta actual).
const ruta = process.argv[2] || '.'

// Comprobamos que la ruta existe y que es una carpeta
if (!fs.existsSync(ruta)) {
  salirConError(`La ruta "${ruta}" no existe`)
}
if (!fs.statSync(ruta).isDirectory()) {
  salirConError(`"${ruta}" no es una carpeta`)
}

// withFileTypes: true -> cada elemento trae métodos como isDirectory()
const elementos = fs.readdirSync(ruta, { withFileTypes: true })

// Ordenamos: primero las carpetas y luego los archivos, cada grupo por nombre
elementos.sort((a, b) => {
  if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
  return a.name.localeCompare(b.name)
})

let numCarpetas = 0
let numArchivos = 0
let tamanoTotal = 0

console.log(pc.bold(pc.cyan(`\nContenido de ${path.resolve(ruta)}\n`)))

for (const elemento of elementos) {
  const esOculto = elemento.name.startsWith('.')

  if (elemento.isDirectory()) {
    numCarpetas++
    const nombre = elemento.name + '/'
    // Carpetas en azul (en gris si están ocultas)
    console.log('  ' + (esOculto ? pc.dim(nombre) : pc.blue(nombre)))
  } else {
    numArchivos++
    // path.join construye la ruta completa del archivo de forma segura
    const tamano = fs.statSync(path.join(ruta, elemento.name)).size
    tamanoTotal += tamano
    // Archivos en verde (en gris si están ocultos) y el tamaño siempre en gris
    const nombre = esOculto ? pc.dim(elemento.name) : pc.green(elemento.name)
    console.log('  ' + nombre + ' ' + pc.dim(`(${formatearTamano(tamano)})`))
  }
}

// Resumen final
console.log(`\n${numCarpetas} carpetas, ${numArchivos} archivos, ${formatearTamano(tamanoTotal)} en total\n`)
