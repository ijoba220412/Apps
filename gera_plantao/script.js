// ==================== SCRIPT.JS COMPLETO - SISTEMA DE ESCALAS INTELIGENTE ====================

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
  renderizarLegenda();
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
    // Dados de exemplo (podem ser editados manualmente aqui)
    funcionarios = [
      {
        id: 1,
        nome: 'Andrea M.',
        categoria: 'farmaceutico',
        vinculos: [{ tipo: 'CLT', cargaHorariaMensal: 152, maximoPlantoes: 13, horasPorPlantao: 12, setoresPermitidos: ['Internação (I)', 'Ambulatório (A)'] }],
        restricoes: { ausencias: [{ inicio: '2026-04-06', fim: '2026-04-19' }], diasSemanaPermitidos: [0,1,2,3,4,5,6], permitidoPar: true, permitidoImpar: true, trabalhaFeriado: true, trabalhaFimSemana: true }
      },
      {
        id: 2,
        nome: 'Raphael',
        categoria: 'farmaceutico',
        vinculos: [{ tipo: 'CLT', cargaHorariaMensal: 152, maximoPlantoes: 13, horasPorPlantao: 12, setoresPermitidos: ['Ambulatório (A)', 'Manipulação (QT)'] }],
        restricoes: { ausencias: [], diasSemanaPermitidos: [0,1,2,3,4,5,6], permitidoPar: true, permitidoImpar: true, trabalhaFeriado: true, trabalhaFimSemana: true }
      },
      {
        id: 3,
        nome: 'Bianca',
        categoria: 'tecnico',
        vinculos: [{ tipo: 'CLT', cargaHorariaMensal: 152, maximoPlantoes: 13, horasPorPlantao: 12, setoresPermitidos: ['Manipulação (QT)'] }],
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

// ---------- LEGENDA FIXA ----------
function renderizarLegenda() {
  let container = document.getElementById('legendaContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'legendaContainer';
    container.className = 'legenda';
    const escalaDiv = document.getElementById('calendarioEscala');
    escalaDiv.parentNode.insertBefore(container, escalaDiv);
  }
  let html = '<details><summary>📖 Legenda</summary><div class="legenda-content">';
  html += '<div><strong>Cores por categoria:</strong> ';
  CATEGORIAS.forEach(c => html += `<span class="legenda-cor ${c.cor}">${c.nome}</span> `);
  html += '</div>';
  html += '<div><strong>Setores:</strong> ';
  setores.forEach(s => html += `<span class="legenda-setor">${s.nome} (abre feriado: ${s.abreFeriado?'sim':'não'}, fim de semana: ${s.abreFimSemana?'sim':'não'})</span> `);
  html += '</div>';
  html += '<div><strong>Status:</strong> <span class="legenda-status ferias">Férias</span> <span class="legenda-status licenca">Licença</span> <span class="legenda-status ausencia">Afastamento</span></div>';
  html += '</div></details>';
  container.innerHTML = html;
}

// ---------- GERAÇÃO DA ESCALA (COM PRIORIDADE SEMANAL E RESPEITO AO MÁXIMO DE PLANTÕES) ----------
let ultimaEscalaGerada = null;
let contagemPlantoesGlobal = {};

function gerarEscalaAtual() {
  if (funcionarios.length === 0 || setores.length === 0) {
    alert('Cadastre pelo menos um funcionário e um setor.');
    return;
  }
  const mesAno = document.getElementById('mesAno').value;
  if (!mesAno) return;
  const [ano, mes] = mesAno.split('-').map(Number);
  const resultado = gerarEscala(mes, ano);
  renderizarEscala(resultado.escala, mes, ano, document.getElementById('filtroCategoria').value);
  renderizarRelatorio(resultado.contagem, resultado.horas, mes, ano);
}

function gerarEscala(mes, ano) {
  const escala = {};
  const contagem = {};
  const horas = {};
  funcionarios.forEach(f => {
    contagem[f.id] = f.vinculos.map(() => 0);
    horas[f.id] = f.vinculos.map(() => 0);
  });

  const dataInicio = new Date(ano, mes - 1, 1);
  const dataFim = new Date(ano, mes, 0);

  // Agrupar dias por semana para prioridade
  const semanas = [];
  let semanaAtual = [];
  let dia = new Date(dataInicio);
  while (dia <= dataFim) {
    semanaAtual.push(new Date(dia));
    if (dia.getDay() === 6 || dia.getTime() === dataFim.getTime()) {
      semanas.push(semanaAtual);
      semanaAtual = [];
    }
    dia.setDate(dia.getDate() + 1);
  }

  for (let semana of semanas) {
    for (let d of semana) {
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
          // Filtrar funcionários disponíveis que já não estejam alocados neste setor hoje
          const disponiveis = funcionarios.filter(f => {
            if (!verificarDisponibilidade(f, d)) return false;
            // Verificar se já existe alocação deste funcionário neste setor hoje
            if (escala[dataStr][setor.nome]) {
              const jaAlocado = escala[dataStr][setor.nome].some(aloc => aloc.funcionario?.id === f.id);
              if (jaAlocado) return false;
            }
            // Verificar vínculos com setor permitido e limite de plantões
            return f.vinculos.some((v, idx) => {
              if (!v.setoresPermitidos?.length || v.setoresPermitidos.includes(setor.nome)) {
                const maxPlant = v.maximoPlantoes || 13; // limite estrito
                return contagem[f.id][idx] < maxPlant;
              }
              return false;
            });
          });

          if (disponiveis.length > 0) {
            // Ordenar: prioridade para quem tem menos plantões na semana, depois total
            disponiveis.sort((a, b) => {
              const plantosSemanaA = contarPlantoesNaSemana(a.id, semana, escala);
              const plantosSemanaB = contarPlantoesNaSemana(b.id, semana, escala);
              if (plantosSemanaA !== plantosSemanaB) return plantosSemanaA - plantosSemanaB;
              const totalA = contagem[a.id].reduce((s, c) => s + c, 0);
              const totalB = contagem[b.id].reduce((s, c) => s + c, 0);
              return totalA - totalB;
            });

            const escolhido = disponiveis[0];
            const vinculoIndex = escolhido.vinculos.findIndex((v, idx) => {
              if (!v.setoresPermitidos?.length || v.setoresPermitidos.includes(setor.nome)) {
                const maxPlant = v.maximoPlantoes || 13;
                return contagem[escolhido.id][idx] < maxPlant;
              }
              return false;
            });

            if (vinculoIndex !== -1) {
              if (!escala[dataStr][setor.nome]) escala[dataStr][setor.nome] = [];
              const vinculo = escolhido.vinculos[vinculoIndex];
              escala[dataStr][setor.nome].push({
                funcionario: escolhido,
                vinculo: vinculo.tipo
              });
              contagem[escolhido.id][vinculoIndex]++;
              horas[escolhido.id][vinculoIndex] += vinculo.horasPorPlantao || 12;
            }
          } else {
            if (!escala[dataStr][setor.nome]) escala[dataStr][setor.nome] = [];
            escala[dataStr][setor.nome].push({ funcionario: null, vinculo: null });
          }
        }
      });
    }
  }

  ultimaEscalaGerada = escala;
  contagemPlantoesGlobal = contagem;
  return { escala, contagem, horas };
}

function contarPlantoesNaSemana(funcId, semana, escala) {
  let total = 0;
  for (let d of semana) {
    const dataStr = formatarData(d);
    if (escala[dataStr]) {
      for (let setor in escala[dataStr]) {
        if (escala[dataStr][setor]) {
          escala[dataStr][setor].forEach(aloc => {
            if (aloc.funcionario?.id === funcId) total++;
          });
        }
      }
    }
  }
  return total;
}

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
                // Verificar se está de férias/licença no dia
                const status = obterStatusFuncionario(func, dataStr);
                let statusClass = '';
                if (status === 'férias') statusClass = 'ferias';
                else if (status === 'licença') statusClass = 'licenca';
                else if (status === 'afastamento') statusClass = 'ausencia';
                html += `<div class="plantao-item ${cor} ${statusClass}"><span>${func.nome}</span><small>${setor} (${aloc.vinculo})</small></div>`;
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

function obterStatusFuncionario(func, dataStr) {
  if (func.restricoes.ausencias?.some(a => dataStr >= a.inicio && dataStr <= a.fim)) return 'afastamento';
  // Aqui pode-se adicionar lógica para férias e licenças específicas
  return null;
}

// ---------- RELATÓRIO EM FOLHA SEPARADA ----------
function renderizarRelatorio(contagem, horas, mes, ano) {
  let html = '<div class="relatorio">';
  html += '<h2>📊 Relatório de Plantões e Horas - ' + mes + '/' + ano + '</h2>';
  html += '<table><thead><tr><th>Funcionário</th><th>Categoria</th><th>Vínculo</th><th>Plantões realizados</th><th>Horas totais</th><th>Máx. plantões</th><th>Carga horária</th></tr></thead><tbody>';
  funcionarios.forEach(f => {
    f.vinculos.forEach((v, idx) => {
      const plantoes = contagem[f.id]?.[idx] || 0;
      const horasTotal = horas[f.id]?.[idx] || 0;
      const catNome = CATEGORIAS.find(c => c.id === f.categoria)?.nome || f.categoria;
      html += `<tr><td>${f.nome}</td><td>${catNome}</td><td>${v.tipo}</td><td>${plantoes}</td><td>${horasTotal}h</td><td>${v.maximoPlantoes || 13}</td><td>${v.cargaHorariaMensal}h</td></tr>`;
    });
  });
  html += '</tbody></table>';
  html += '<p><small>Legenda: Cores indicam categoria; ícones de status (férias, licença) aparecem na escala.</small></p>';
  html += '</div>';
  const container = document.getElementById('relatorioContainer');
  if (!container) {
    const div = document.createElement('div');
    div.id = 'relatorioContainer';
    document.querySelector('.container').appendChild(div);
  }
  document.getElementById('relatorioContainer').innerHTML = html;
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
    renderizarLegenda();
  };
}

function abrirModalSetores() {
  document.getElementById('modalSetores').style.display = 'block';
  renderizarListaSetores();
  document.getElementById('btnAddSetor').onclick = () => abrirFormSetor(null);
  document.getElementById('btnSalvarSetores').onclick = () => {
    salvarDados();
    fecharModais();
    renderizarLegenda();
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

// ---------- FORMULÁRIO FUNCIONÁRIO (COM LABELS) ----------
let funcionarioEditandoId = null;

function abrirFormFuncionario(id) {
  funcionarioEditandoId = id;
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
  return `<div class="vinculo-item" style="border:1px solid #ccc; padding:10px; margin:5px 0;">
    <label>Tipo: <input type="text" placeholder="Ex: CLT, FIOTEC" class="vinculoTipo" value="${v.tipo}" style="width:120px;"></label>
    <label>Carga horária mensal (h): <input type="number" class="vinculoCarga" value="${v.cargaHorariaMensal}" style="width:80px;"></label>
    <l