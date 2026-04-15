


  // Vínculos
  html += `<fieldset><legend>Vínculos</legend><div id="vinculosContainer">`;
  func.vinculos.forEach((v, idx) => {
    html += gerarHtmlVinculo(v, idx);
  });
  html += `</div><button type="button" onclick="adicionarVinculo()">➕ Adicionar Vínculo</button></fieldset>`;

  // Restrições
  const r = func.restricoes;
  html += `<fieldset><legend>Restrições</legend>`;
  html += `<label><input type="checkbox" id="permitidoPar" ${r.permitidoPar ? 'checked' : ''}> Pode trabalhar dias pares</label><br>`;
  html += `<label><input type="checkbox" id="permitidoImpar" ${r.permitidoImpar ? 'checked' : ''}> Pode trabalhar dias ímpares</label><br>`;
  html += `<label><input type="checkbox" id="trabalhaFeriado" ${r.trabalhaFeriado ? 'checked' : ''}> Trabalha em feriados</label><br>`;
  html += `<label><input type="checkbox" id="trabalhaFimSemana" ${r.trabalhaFimSemana ? 'checked' : ''}> Trabalha fins de semana</label><br>`;
  html += `<label>Dias da semana permitidos:</label><div>`;
  DIAS_SEMANA.forEach((dia, i) => {
    html += `<label><input type="checkbox" name="diaSemana" value="${i}" ${r.diasSemanaPermitidos.includes(i) ? 'checked' : ''}> ${dia}</label> `;
  });
  html += `</div>`;
  html += `<label>Ausências (datas):</label><div id="ausenciasContainer">`;
  r.ausencias.forEach((a, i) => {
    html += `<div>De <input type="date" class="ausenciaInicio" value="${a.inicio}"> até <input type="date" class="ausenciaFim" value="${a.fim}"> <button type="button" onclick="removerAusencia(this)">🗑️</button></div>`;
  });
  html += `</div><button type="button" onclick="adicionarAusencia()">➕ Adicionar Ausência</button>`;
  html += `</fieldset>`;

  html += `<div class="form-actions">`;
  html += `<button type="button" onclick="salvarFuncionario(${func.id})">Salvar</button>`;
  html += `<button type="button" onclick="renderizarListaFuncionarios()">Cancelar</button>`;
  html += `</div></div>`;

  container.innerHTML = html;
}

function gerarHtmlVinculo(v, idx) {
  let setoresOptions = '';
  setores.forEach(s => {
    const selected = v.setoresPermitidos?.includes(s.nome) ? 'selected' : '';
    setoresOptions += `<option value="${s.nome}" ${selected}>${s.nome}</option>`;
  });
  return `<div class="vinculo-item">
    <input type="text" placeholder="Tipo (CLT...)" class="vinculoTipo" value="${v.tipo}">
    <input type="number" placeholder="Carga horária" class="vinculoCarga" value="${v.cargaHorariaMensal}">
    <input type="number" placeholder="Máx. plantões" class="vinculoMaxPlant" value="${v.maximoPlantoes || 13}">
    <input type="number" placeholder="Horas/plantão" class="vinculoHorasPlantao" value="${v.horasPorPlantao || 12}">
    <select multiple class="vinculoSetores" size="3">${setoresOptions}</select>
    <button type="button" onclick="removerVinculo(this)">🗑️</button>
  </div>`;
}

window.adicionarVinculo = function() {
  const container = document.getElementById('vinculosContainer');
  const novo = { tipo: '', cargaHorariaMensal: 152, maximoPlantoes: 13, horasPorPlantao: 12, setoresPermitidos: [] };
  container.insertAdjacentHTML('beforeend', gerarHtmlVinculo(novo, container.children.length));
};

window.removerVinculo = function(btn) {
  btn.closest('.vinculo-item').remove();
};

window.adicionarAusencia = function() {
  const container = document.getElementById('ausenciasContainer');
  const div = document.createElement('div');
  div.innerHTML = `De <input type="date" class="ausenciaInicio"> até <input type="date" class="ausenciaFim"> <button type="button" onclick="removerAusencia(this)">🗑️</button>`;
  container.appendChild(div);
};

window.removerAusencia = function(btn) {
  btn.closest('div').remove();
};

window.salvarFuncionario = function(id) {
  const nome = document.getElementById('funcNome').value.trim();
  if (!nome) { alert('Nome obrigatório'); return; }
  const categoria = document.getElementById('funcCategoria').value;
  const vinculos = [];
  document.querySelectorAll('.vinculo-item').forEach(item => {
    const tipo = item.querySelector('.vinculoTipo').value.trim();
    const carga = parseInt(item.querySelector('.vinculoCarga').value) || 152;
    const maxPlant = parseInt(item.querySelector('.vinculoMaxPlant').value) || 13;
    const horasPlantao = parseInt(item.querySelector('.vinculoHorasPlantao').value) || 12;
    const setoresSelect = item.querySelector('.vinculoSetores');
    const setoresPermitidos = Array.from(setoresSelect.selectedOptions).map(opt => opt.value);
    if (tipo) vinculos.push({ tipo, cargaHorariaMensal: carga, maximoPlantoes: maxPlant, horasPorPlantao: horasPlantao, setoresPermitidos });
  });
  const restricoes = {
    permitidoPar: document.getElementById('permitidoPar').checked,
    permitidoImpar: document.getElementById('permitidoImpar').checked,
    trabalhaFeriado: document.getElementById('trabalhaFeriado').checked,
    trabalhaFimSemana: document.getElementById('trabalhaFimSemana').checked,
    diasSemanaPermitidos: Array.from(document.querySelectorAll('input[name="diaSemana"]:checked')).map(cb => parseInt(cb.value)),
    ausencias: []
  };
  document.querySelectorAll('#ausenciasContainer > div').forEach(div => {
    const inicio = div.querySelector('.ausenciaInicio').value;
    const fim = div.querySelector('.ausenciaFim').value;
    if (inicio && fim) restricoes.ausencias.push({ inicio, fim });
  });

  const funcionario = { id, nome, categoria, vinculos, restricoes };
  const index = funcionarios.findIndex(f => f.id === id);
  if (index >= 0) funcionarios[index] = funcionario;
  else funcionarios.push(funcionario);
  salvarDados();
  renderizarListaFuncionarios();
};

function renderizarListaFuncionarios() {
  const container = document.getElementById('listaFuncionarios');
  let html = '<ul>';
  funcionarios.forEach(f => {
    html += `<li><strong>${f.nome}</strong> (${f.categoria}) `;
    html += `<button onclick="abrirFormFuncionario(${f.id})">✏️ Editar</button> `;
    html += `<button onclick="removerFuncionario(${f.id})">🗑️</button></li>`;
  });
  html += '</ul>';
  container.innerHTML = html;
}

window.removerFuncionario = function(id) {
  funcionarios = funcionarios.filter(f => f.id !== id);
  salvarDados();
  renderizarListaFuncionarios();
};

// ---------- SETORES ----------
function renderizarListaSetores() {
  const container = document.getElementById('listaSetores');
  let html = '<ul>';
  setores.forEach(s => {
    html += `<li>${s.nome} - Feriado: ${s.abreFeriado?'Sim':'Não'} | Fim de semana: ${s.abreFimSemana?'Sim':'Não'} `;
    html += `<button onclick="abrirFormSetor(${s.id})">✏️</button> `;
    html += `<button onclick="removerSetor(${s.id})">🗑️</button></li>`;
  });
  html += '</ul>';
  container.innerHTML = html;
}

function abrirFormSetor(id) {
  const container = document.getElementById('listaSetores');
  const setor = id ? setores.find(s => s.id === id) : { id: Date.now(), nome: '', abreFeriado: false, abreFimSemana: false };
  let html = `<div><h3>${id?'Editar':'Novo'} Setor</h3>`;
  html += `<label>Nome: <input type="text" id="setorNome" value="${setor.nome}"></label><br>`;
  html += `<label><input type="checkbox" id="abreFeriado" ${setor.abreFeriado?'checked':''}> Abre em feriados</label><br>`;
  html += `<label><input type="checkbox" id="abreFimSemana" ${setor.abreFimSemana?'checked':''}> Abre fins de semana</label><br>`;
  html += `<button onclick="salvarSetor(${setor.id})">Salvar</button> <button onclick="renderizarListaSetores()">Cancelar</button>`;
  html += `</div>`;
  container.innerHTML = html;
}

window.salvarSetor = function(id) {
  const nome = document.getElementById('setorNome').value.trim();
  if (!nome) { alert('Nome obrigatório'); return; }
  const abreFeriado = document.getElementById('abreFeriado').checked;
  const abreFimSemana = document.getElementById('abreFimSemana').checked;
  const setor = { id, nome, abreFeriado, abreFimSemana };
  const index = setores.findIndex(s => s.id === id);
  if (index >= 0) setores[index] = setor;
  else setores.push(setor);
  salvarDados();
  renderizarListaSetores();
};

window.removerSetor = function(id) {
  setores = setores.filter(s => s.id !== id);
  salvarDados();
  renderizarListaSetores();
};

// ---------- FERIADOS ----------
function renderizarListaFeriados() {
  const container = document.getElementById('listaFeriados');
  let html = '<ul>';
  feriados.forEach((f, i) => {
    html += `<li>${f} <button onclick="removerFeriado(${i})">🗑️</button></li>`;
  });
  html += '</ul><button onclick="adicionarFeriado()">➕ Adicionar</button>';
  container.innerHTML = html;
}

window.adicionarFeriado = function() {
  const data = prompt('Digite a data (AAAA-MM-DD):');
  if (data && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
    feriados.push(data);
    renderizarListaFeriados();
  } else { alert('Formato inválido.'); }
};

window.removerFeriado = function(index) {
  feriados.splice(index, 1);
  renderizarListaFeriados();
};

// ---------- UTILITÁRIOS ----------
function formatarData(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
function isFeriado(dataStr) { return feriados.includes(dataStr); }
function isFimDeSemana(dia) { return dia === 0 || dia === 6; }