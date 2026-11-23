const $ = (id) => document.getElementById(id);

async function pedir(metodo, ruta, cuerpo) {
  const opciones = { method: metodo, headers: {} };
  if (cuerpo) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }

  const respuesta = await fetch(ruta, opciones);
  const datos = await respuesta.json();
  return { status: respuesta.status, datos };
}

function registrar(resultado, ruta) {
  const elemento = document.createElement('li');
  const codigo = document.createElement('span');
  codigo.className = `codigo ${resultado.status === 401 ? 'e401' : resultado.status === 403 ? 'e403' : resultado.status < 400 ? 'ok' : 'error'}`;
  codigo.textContent = resultado.status;
  elemento.append(codigo, document.createTextNode(` ${ruta} — ${JSON.stringify(resultado.datos)}`));
  $('bitacora').append(elemento);
}

function mostrarEstado(autenticado, datos) {
  const estado = $('estado');
  estado.className = `estado ${autenticado ? 'con-sesion' : 'sin-sesion'}`;
  if (autenticado) {
    estado.textContent = `${datos.usuario.nombre} · rol ${datos.usuario.rol} · sesión ${datos.sesion || '(sin id)'} · vence en ${datos.expiraEnSegundos ?? 0} s`;
  } else {
    estado.textContent = 'Sin sesión';
  }
  $('cookie-js').textContent = document.cookie || '(vacío)';
}

async function actualizarEstado() {
  try {
    const resultado = await pedir('GET', '/api/perfil');
    mostrarEstado(resultado.status === 200, resultado.datos);
    return resultado;
  } catch (error) {
    console.error('No se pudo consultar el perfil:', error);
    $('estado').className = 'estado sin-sesion';
    $('estado').textContent = 'Sin sesión';
    return null;
  }
}

async function actualizarSesiones() {
  try {
    const [diagnostico, configuracion] = await Promise.all([
      pedir('GET', '/api/diagnostico/sesiones'),
      pedir('GET', '/api/config'),
    ]);
    $('donde').textContent = diagnostico.datos.almacen === 'mysql'
      ? 'Almacenamiento: MySQL (tabla sessions)'
      : 'Almacenamiento: memoria del servidor (MemoryStore)';
    $('config').textContent = JSON.stringify(configuracion.datos, null, 2);

    const cuerpo = $('tabla-sesiones');
    cuerpo.replaceChildren();
    if (!diagnostico.datos.sesiones.length) {
      const fila = cuerpo.insertRow();
      const celda = fila.insertCell();
      celda.colSpan = 4;
      celda.textContent = '(sin sesiones)';
      return;
    }

    for (const sesion of diagnostico.datos.sesiones) {
      const fila = cuerpo.insertRow();
      if (sesion.esLaTuya) fila.className = 'tuya';
      for (const valor of [sesion.sesion, sesion.usuario, sesion.visitas, sesion.expira || '—']) {
        fila.insertCell().textContent = valor;
      }
    }
  } catch (error) {
    console.error('No se pudo consultar el diagnóstico de sesiones:', error);
    $('donde').textContent = 'No se pudo cargar el diagnóstico';
  }
}

async function ejecutar(metodo, ruta, cuerpo) {
  try {
    const resultado = await pedir(metodo, ruta, cuerpo);
    registrar(resultado, `${metodo} ${ruta}`);
    await actualizarEstado();
    await actualizarSesiones();
    return resultado;
  } catch (error) {
    console.error(`Falló ${metodo} ${ruta}:`, error);
    registrar({ status: 0, datos: { error: 'No se pudo conectar con el servidor.' } }, `${metodo} ${ruta}`);
    return null;
  }
}

$('form-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  await ejecutar('POST', '/api/login', {
    usuario: $('usuario').value,
    contrasena: $('contrasena').value,
  });
});

$('btn-refrescar').addEventListener('click', () => ejecutar('GET', '/api/perfil'));
$('btn-sesiones').addEventListener('click', actualizarSesiones);

document.querySelectorAll('[data-metodo][data-url]').forEach((boton) => {
  boton.addEventListener('click', () => ejecutar(boton.dataset.metodo, boton.dataset.url));
});

actualizarEstado();
actualizarSesiones();