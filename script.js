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
  return materia.correlativasTP.every(id => {
    const mat = materias.find(m => m.id === id);
    return mat && mat.tpAprobado;
  });
}

function puedeAprobarFinal(materia) {
  return materia.correlativasFinal.every(id => {
    const mat = materias.find(m => m.id === id);
    return mat && mat.finalAprobado;
  });
}

function actualizarMalla() {
  contenedor.innerHTML = '';
  const cuatrimestres = [...new Set(materias.map(m => m.cuatri))].sort((a,b)=>a-b);

  cuatrimestres.forEach(cuatri => {
    const col = document.createElement('div');
    col.className = 'cuatrimestre';
    col.innerHTML = `<h2>${cuatri}° Cuatrimestre</h2>`;

    materias.filter(m => m.cuatri === cuatri).forEach(materia => {
      materia.tpAprobado = materia.tpAprobado || false;
      materia.finalAprobado = materia.finalAprobado || false;

      const div = document.createElement('div');
      div.classList.add('materia');

      if (materia.finalAprobado) div.classList.add('aprobado-final');
      else if (materia.tpAprobado) div.classList.add('aprobado-tp');
      else if (puedeCursar(materia)) div.classList.add('habilitada');
      else div.classList.add('bloqueada');

      div.innerHTML = `
        <div>${materia.nombre}</div>
        <div class="checkbox-group">
          <label><input type="checkbox" data-id="${materia.id}" data-tipo="tp" ${materia.tpAprobado ? 'checked' : ''} ${!puedeCursar(materia) ? 'disabled' : ''}/> TP</label>
          <label><input type="checkbox" data-id="${materia.id}" data-tipo="final" ${materia.finalAprobado ? 'checked' : ''} ${!puedeAprobarFinal(materia) ? 'disabled' : ''}/> Final</label>
        </div>
      `;

      col.appendChild(div);
    });

    contenedor.appendChild(col);
  });

  agregarEventos();
  guardarEstado();
}

function agregarEventos() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(chk => {
    chk.addEventListener('change', e => {
      const id = e.target.dataset.id;
      const tipo = e.target.dataset.tipo;
      const materia = materias.find(m => m.id === id);

      if (!materia) return;

      if (tipo === 'tp') {
        materia.tpAprobado = e.target.checked;
        if (!materia.tpAprobado) materia.finalAprobado = false;
      } else if (tipo === 'final') {
        materia.finalAprobado = e.target.checked;
        if (materia.finalAprobado) materia.tpAprobado = true;
      }

      actualizarMalla();
    });
  });
}

window.onload = cargarMaterias;
