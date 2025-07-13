// Carga y genera la malla interactiva

let materias = [];
const contenedor = document.getElementById('malla-container');

function guardarEstado() {
  localStorage.setItem('mallaEstado', JSON.stringify(materias));
}

function cargarEstado() {
  const estado = localStorage.getItem('mallaEstado');
  if (estado) {
    materias = JSON.parse(estado);
  }
}

async function cargarMaterias() {
  const res = await fetch('materias.json');
  materias = await res.json();
  cargarEstado();
  actualizarMalla();
}

function puedeCursar(materia) {
  // Para cursar (TP), todas las correlativasTP deben tener TP aprobado
  return materia.correlativasTP.every(id => {
    const mat = materias.find(m => m.id === id);
    return mat && mat.tpAprobado;
  });
}

function puedeAprobarFinal(materia) {
  // Para aprobar final, todas las correlativasFinal deben tener final aprobado
  return materia.correlativasFinal.every(id => {
    const mat = materias.find(m => m.id === id);
    return mat && mat.finalAprobado;
  });
}

function actualizarMalla() {
  contenedor.innerHTML = '';

  materias.forEach(materia => {
    // Estados
    materia.tpAprobado = materia.tpAprobado || false;
    materia.finalAprobado = materia.finalAprobado || false;

    const div = document.createElement('div');
    div.classList.add('materia');

    // Determinar estado de la materia
    if (materia.finalAprobado) {
      div.classList.add('aprobado-final');
    } else if (materia.tpAprobado) {
      div.classList.add('aprobado-tp');
    } else if (puedeCursar(materia)) {
      div.classList.add('habilitada');
    } else {
      div.classList.add('bloqueada');
    }

    div.innerHTML = `
      <h3>${materia.nombre}</h3>
      <div class="checkbox-group">
        <label><input type="checkbox" data-id="${materia.id}" data-tipo="tp" ${materia.tpAprobado ? 'checked' : ''} ${!puedeCursar(materia) ? 'disabled' : ''}/> TP aprobado</label>
        <label><input type="checkbox" data-id="${materia.id}" data-tipo="final" ${materia.finalAprobado ? 'checked' : ''} ${!puedeAprobarFinal(materia) ? 'disabled' : ''}/> Final aprobado</label>
      </div>
    `;

    contenedor.appendChild(div);
  });

  agregarEventos();
  guardarEstado();
}

function agregarEventos() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(chk => {
    chk.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const tipo = e.target.dataset.tipo;

      const materia = materias.find(m => m.id === id);
      if (!materia) return;

      if (tipo === 'tp') {
        materia.tpAprobado = e.target.checked;
        // Si destildo TP, también destildo final (porque no puede estar aprobado sin TP)
        if (!materia.tpAprobado) {
          materia.finalAprobado = false;
        }
      } else if (tipo === 'final') {
        materia.finalAprobado = e.target.checked;
        // Si tildo final, aseguro que TP esté tildado
        if (materia.finalAprobado) {
          materia.tpAprobado = true;
        }
      }

      actualizarMalla();
    });
  });
}

window.onload = cargarMaterias;
