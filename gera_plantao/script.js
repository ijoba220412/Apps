// ==================== SCRIPT.JS - SISTEMA DE ESCALAS INTELIGENTE ====================

// ---------- ESTRUTURAS DE DADOS ----------
let funcionarios = [];
let setores = [];
let feriados = [];

const CATEGORIAS = [
  { id: 'farmaceutico', nome: 'Farmacêutico', cor: 'farmaceutico' },
  { id: 'tecnico', nome: 'Técnico de Farmácia', cor: 'tecnico' },
  { id: 'outro', nome: 'Outro', cor: 'outro' }
];

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// ---------- INICIALIZAÇÃO ----------
document.addEventListener('DOMContentLoaded', () => {
  carregarDados();
  inicializarEventListeners();
  if (funcionarios.length > 0) {
    gerarEscalaAtual();
  } else {
    document.getElementById('calendarioEscala').innerHTML = '<p>👈 Cadastre funcionários e setores, depois clique em "Gerar Escala".</p>';
  }
});

// ---------- PERSISTÊNCIA ----------
function salvarDados() {
  localStorage.setItem('escala_funcionarios', JSON.stringify(funcionarios));
  localStorage.setItem('escala_setores', JSON.stringify(setores));
  localStorage.setItem('escala_feriados', JSON.stringify(feriados));
}

function carregarDados() {
  const funcStorage = localStorage.getItem('escala_funcionarios');
  const setStorage = localStorage.getItem('escala_setores');
  const ferStorage = localStorage.getItem('escala_feriados');

  if (funcStorage) {
    funcionarios = JSON.parse(funcStorage);
  } else {
    // Dados de exemplo
    funcionarios = [
      {
        id: 1,
        nome: 'Andrea M.',
        categoria: 'farmaceutico',
        vinculos: [{ tipo: 'CLT', cargaHorariaMensal: 152, setoresPermitidos: ['Internação (I)', 'Ambulatório (A)'] }],
        restricoes: { ausencias: [{ inicio: '2026-04-06', fim: '2026-04-19' }], diasSemanaPermitidos: [0,1,2,3,4,5,6], permitidoPar: true, permitidoImpar: true, trabalhaFeriado: true, trabalhaFimSemana: true }
      },
      {
        id: 2,
        nome: 'Raphael',
        categoria: 'farmaceutico',
        vinculos: [{ tipo: 'CLT', cargaHorariaMensal: 152, setoresPermitidos: ['Ambulatório (A)', 'Manipulação (QT)'] }],
        restricoes: { ausencias: [], diasSemanaPermitidos: [0,1,2,3,4,5,6], permitidoPar: true, permitidoImpar: true, trabalhaFeriado: true, trabalhaFimSemana: true }
      },
      {
        id: 3,
        nome: 'Bianca',
        categoria: 'tecnico',
        vinculos: [{ tipo: 'CLT', cargaHorariaMensal: 152, setoresPermitidos: ['Manipulação (QT)'] }],
        restricoes: { ausencias: [{ inicio: '2026-04-10', fim: '2026-04-24' }], diasSemanaPermitidos: [0,1,2,3,4,5,6], permitidoPar: true, permitidoImpar: true, trabalhaFeriado: true, trabalhaFimSemana: true }
      }
    ];
  }

  if (setStorage) {
    setores = JSON.parse(setStorage);
  } else {
    setores = [
      { id: 1, nome: 'Internação (I)', abreFeriado: true, abreFimSemana: true },
      { id: 2, nome: 'Ambulatório (A)', abreFeriado: false, abreFimSemana: false },
      { id: 3, nome: 'Manipulação (QT)', abreFeriado: true, abreFimSemana: true },
      { id: 4, nome: 'Assistência Domiciliar (AD)', abreFeriado: false, abreFimSemana: false },
      { id: 5, nome: 'Estoque (E)', abreFeriado: false, abreFimSemana: false }
    ];
  }

  if (ferStorage) {
    feriados = JSON.parse(ferStorage);
  } else {
    feriados = ['2026-04-03', '2026-04-21', '2026-04-23'];
  }
}

// ---------- EVENT LISTENERS ----------
function inicializarEventListeners() {
  document.getElementById('btnGerar').addEventListener('click', gerarEscalaAtual);
  document.getElementById('filtroCategoria').addEventListener('change', gerarEscalaAtual);
  document.getElementById('btnImprimir').addEventListener('click', () => window.print());

  document.getElementById('btnConfigFuncionarios').addEventListener('click', abrirModalFuncionarios);
  document.getElementById('btnConfigSetores').addEventListener('click', abrirModalSetores);
  document.getElementById('btnConfigFeriados').addEventListener('click', abrirModalFeriados);

  document.querySelectorAll('.close').forEach(el => el.addEventListener('click', fecharModais));
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) fecharModais();
  });
}

function fecharModais() {
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

// ---------- GERAÇÃO DA ESCALA (mantida igual) ----------
function gerarEscalaAtual() {
  if (funcionarios.length === 0 || setores.length === 0) {
    alert('Cadastre pelo menos um funcionário e um setor.');
    return;
  }
  const mesAno = document.getElementById('mesAno').value;
  if (!mesAno) return;
  const [ano, mes] = mesAno.split('-').map(Number);
  const escala = gerarEscala(mes, ano);
  renderizarEscala(escala, mes, ano, document.getElementById('filtroCategoria').value);
}

function gerarEscala(mes, ano) {
  const escala = {};
  const contagemPlantoes = {};
  funcionarios.forEach(f => { contagemPlantoes[f.id] = f.vinculos.map(() => 0); });

  const dataInicio = new Date(ano, mes - 1, 1);
  const dataFim = new Date(ano, mes, 0);

  for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
    const dataStr = formatarData(d);
    escala[dataStr] = {};

    setores.forEach(setor => {
      const diaDaSemana = d.getDay();
      const feriado = isFeriado(dataStr);
      const fimDeSemana = isFimDeSemana(diaDaSemana);
      let setorAberto = true;
      if (feriado && !setor.abreFeriado) setorAberto = false;
      if (fimDeSemana && !setor.abreFimSemana) setorAberto = false;

      if (setorAberto) {
        const disponiveis = funcionarios.filter(f => {
          if (!verificarDisponibilidade(f, d)) return false;
          return f.vinculos.some((v, idx) => {
            if (!v.setoresPermitidos?.length || v.setoresPermitidos.includes(setor.nome)) {
              return contagemPlantoes[f.id][idx] < calcularMaximoPlantoes(v.cargaHorariaMensal);
            }
            return false;
          });
        });

        if (disponiveis.length > 0) {
          disponiveis.sort((a, b) => {
            const totalA = contagemPlantoes[a.id].reduce((s, c) => s + c, 0);
            const totalB = contagemPlantoes[b.id].reduce((s, c) => s + c, 0);
            return totalA - totalB;
          });
          const escolhido = disponiveis[0];
          const vinculoIndex = escolhido.vinculos.findIndex((v, idx) => {
            if (!v.setoresPermitidos?.length || v.setoresPermitidos.includes(setor.nome)) {
              return contagemPlantoes[escolhido.id][idx] < calcularMaximoPlantoes(v.cargaHorariaMensal);
            }
            return false;
          });
          if (vinculoIndex !== -1) {
            if (!escala[dataStr][setor.nome]) escala[dataStr][setor.nome] = [];
            escala[dataStr][setor.nome].push({
              funcionario: escolhido,
              vinculo: escolhido.vinculos[vinculoIndex].tipo
            });
            contagemPlantoes[escolhido.id][vinculoIndex]++;
          }
        } else {
          if (!escala[dataStr][setor.nome]) escala[dataStr][setor.nome] = [];
          escala[dataStr][setor.nome].push({ funcionario: null, vinculo: null });
        }
      }
    });
  }
  return escala;
}

function calcularMaximoPlantoes(carga) { return Math.floor(carga / 12); }
function verificarDisponibilidade(f, data) {
  const dataStr = formatarData(data);
  const diaSemana = data.getDay();
  const diaMes = data.getDate();
  if (f.restricoes.ausencias?.some(a => dataStr >= a.inicio && dataStr <= a.fim)) return false;
  if (!f.restricoes.diasSemanaPermitidos.includes(diaSemana)) return false;
  if (!f.restricoes.permitidoPar && diaMes % 2 === 0) return false;
  if (!f.restricoes.permitidoImpar && diaMes % 2 !== 0) return false;
  if (isFeriado(dataStr) && !f.restricoes.trabalhaFeriado) return false;
  if (isFimDeSemana(diaSemana) && !f.restricoes.trabalhaFimSemana) return false;
  return true;
}

function renderizarEscala(escala, mes, ano, filtro) {
  const container = document.getElementById('calendarioEscala');
  const dataInicio = new Date(ano, mes - 1, 1);
  const dataFim = new Date(ano, mes, 0);
  let html = '<table><thead><tr><th>DOM</th><th>SEG</th><th>TER</th><th>QUA</th><th>QUI</th><th>SEX</th><th>SAB</th></tr></thead><tbody>';
  let diaAtual = new Date(dataInicio);
  diaAtual.setDate(diaAtual.getDate() - diaAtual.getDay());
  while (diaAtual <= dataFim || diaAtual.getDay() !== 0) {
    html += '<tr>';
    for (let i = 0; i < 7; i++) {
      const dataStr = formatarData(diaAtual);
      const diaMes = diaAtual.getDate();
      const mesAtual = diaAtual.getMonth() + 1;
      const feriado = isFeriado(dataStr);
      const fimSemana = isFimDeSemana(diaAtual.getDay());
      let classe = 'celula-dia';
      if (feriado) classe += ' feriado';
      if (fimSemana) classe += ' fim-de-semana';
      html += `<td class="${classe}">`;
      if (mesAtual === mes) {
        html += `<strong>${diaMes}</strong>`;
        if (escala[dataStr]) {
          for (let setor in escala[dataStr]) {
            escala[dataStr][setor].forEach(aloc => {
              const func = aloc.funcionario;
              if (!func) { html += `<div class="sem-plantao">(vago)</div>`; return; }
              if (filtro === 'todos' || func.categoria === filtro) {
                const cor = CATEGORIAS.find(c => c.id === func.categoria)?.cor || 'outro';
                html += `<div class="plantao-item ${cor}"><span>${func.nome}</span><small>${setor} (${aloc.vinculo})</small></div>`;
              }
            });
          }
        } else { html += `<div class="sem-plantao">-</div>`; }
      } else { html += `<div class="sem-plantao"></div>`; }
      html += '</td>';
      diaAtual.setDate(diaAtual.getDate() + 1);
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  container.innerHTML = html;
}

// ---------- MODAIS ----------
function abrirModalFuncionarios() {
  document.getElementById('modalFuncionarios').style.display = 'block';
  renderizarListaFuncionarios();
  document.getElementById('btnAddFuncionario').onclick = () => abrirFormFuncionario(null);
  document.getElementById('btnSalvarFuncionarios').onclick = () => {
    salvarDados();
    fecharModais();
    gerarEscalaAtual();
  };
}

function abrirModalSetores() {
  document.getElementById('modalSetores').style.display = 'block';
  renderizarListaSetores();
  document.getElementById('btnAddSetor').onclick = () => abrirFormSetor(null);
  document.getElementById('btnSalvarSetores').onclick = () => {
    salvarDados();
    fecharModais();
  };
}

function abrirModalFeriados() {
  document.getElementById('modalFeriados').style.display = 'block';
  renderizarListaFeriados();
  document.getElementById('btnAddFeriado').onclick = () => adicionarFeriado();
  document.getElementById('btnSalvarFeriados').onclick = () => {
    salvarDados();
    fecharModais();
  };
}

// ---------- FORMULÁRIO DE FUNCIONÁRIO (EDITÁVEL) ----------
let funcionarioEditandoId = null;

function abrirFormFuncionario(id) {
  funcionarioEditandoId = id;
  const modal = document.getElementById('modalFuncionarios');
  const container = document.getElementById('listaFuncionarios');
  let func = id ? funcionarios.find(f => f.id === id) : null;
  if (!func) {
    func = {
      id: Date.now(),
      nome: '',
      categoria: 'farmaceutico',
      vinculos: [],
      restricoes: {
        ausencias: [],
        diasSemanaPermitidos: [0,1,2,3,4,5,6],
        permitidoPar: true,
        permitidoImpar: true,
        trabalhaFeriado: true,
        trabalhaFimSemana: true
      }
    };
  }

  let html = `<div class="form-funcionario">`;
  html += `<h3>${id ? 'Editar' : 'Novo'} Funcionário</h3>`;
  html += `<label>Nome: <input type="text" id="funcNome" value="${func.nome}"></label><br>`;
  html += `<label>Categoria: <select id="funcCategoria">`;
  CATEGORIAS.forEach(cat => {
    html += `<option value="${cat.id}" ${func.categoria === cat.id ? 'selected' : ''}>${cat.nome}</option>`;
  });
  html += `</select></label><br>`;

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
    <input type="text" placeholder="Tipo (CLT, FIOTEC...)" class="vinculoTipo" value="${v.tipo}">
    <input type="number" placeholder="Carga horária" class="vinculoCarga" value="${v.cargaHorariaMensal}">
    <select multiple class="vinculoSetores" size="3">${setoresOptions}</select>
    <button type="button" onclick="removerVinculo(this)">🗑️</button>
  </div>`;
}

window.adicionarVinculo = function() {
  const container = document.getElementById('vinculosContainer');
  const novo = { tipo: '', cargaHorariaMensal: 152, setoresPermitidos: [] };
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
    const setoresSelect = item.querySelector('.vinculoSetores');
    const setoresPermitidos = Array.from(setoresSelect.selectedOptions).map(opt => opt.value);
    if (tipo) vinculos.push({ tipo, cargaHorariaMensal: carga, setoresPermitidos });
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

// ---------- SETORES (FORMULÁRIO SIMPLES) ----------
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
```
