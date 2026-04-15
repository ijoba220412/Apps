// --- Dados Iniciais (Simulando os PDFs) ---
let funcionarios = [];
let setores = [
  { nome: 'Internação (I)', abreFeriado: true, abreFimSemana: true },
  { nome: 'Ambulatório (A)', abreFeriado: false, abreFimSemana: false },
  { nome: 'Manipulação (QT)', abreFeriado: true, abreFimSemana: true },
  { nome: 'Assistência Domiciliar (AD)', abreFeriado: false, abreFimSemana: false },
  { nome: 'Estoque (E)', abreFeriado: false, abreFimSemana: false }
];
let feriados = ['2026-04-03', '2026-04-21', '2026-04-23'];

// Função para carregar dados de exemplo
function carregarDadosExemplo() {
  funcionarios = [
    // Farmacêuticos
    { id: 1, nome: 'Andrea M.', categoria: 'farmaceutico', vinculos: [{ tipo: 'CLT', cargaHorariaMensal: 152 }], restricoes: { ausencias: [{ inicio: '2026-04-06', fim: '2026-04-19' }], diasSemanaPermitidos: [0,1,2,3,4,5,6], permitidoPar: true, permitidoImpar: true, trabalhaFeriado: true, trabalhaFimSemana: true } },
    { id: 2, nome: 'Raphael', categoria: 'farmaceutico', vinculos: [{ tipo: 'CLT', cargaHorariaMensal: 152 }], restricoes: { ausencias: [], diasSemanaPermitidos: [0,1,2,3,4,5,6], permitidoPar: true, permitidoImpar: true, trabalhaFeriado: true, trabalhaFimSemana: true } },
    { id: 3, nome: 'Karina', categoria: 'farmaceutico', vinculos: [{ tipo: 'CLT', cargaHorariaMensal: 152 }], restricoes: { ausencias: [], diasSemanaPermitidos: [0,1,2,3,4,5,6], permitidoPar: true, permitidoImpar: true, trabalhaFeriado: true, trabalhaFimSemana: true } },
    // Técnicos
    { id: 4, nome: 'Bianca', categoria: 'tecnico', vinculos: [{ tipo: 'CLT', cargaHorariaMensal: 152 }], restricoes: { ausencias: [{ inicio: '2026-04-10', fim: '2026-04-24' }], diasSemanaPermitidos: [0,1,2,3,4,5,6], permitidoPar: true, permitidoImpar: true, trabalhaFeriado: true, trabalhaFimSemana: true } },
    { id: 5, nome: 'Anderson D.', categoria: 'tecnico', vinculos: [{ tipo: 'Bolsa', cargaHorariaMensal: 152 }], restricoes: { ausencias: [{ inicio: '2026-04-10', fim: '2026-04-24' }], diasSemanaPermitidos: [0,1,2,3,4,5,6], permitidoPar: true, permitidoImpar: true, trabalhaFeriado: true, trabalhaFimSemana: true } },
    { id: 6, nome: 'Verônica', categoria: 'tecnico', vinculos: [{ tipo: 'CLT', cargaHorariaMensal: 152 }], restricoes: { ausencias: [], diasSemanaPermitidos: [0,1,2,3,4,5,6], permitidoPar: true, permitidoImpar: true, trabalhaFeriado: true, trabalhaFimSemana: true } }
  ];
}

// --- Funções Auxiliares ---
function formatarData(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function isFeriado(dataStr) {
  return feriados.includes(dataStr);
}

function isFimDeSemana(diaDaSemana) {
  return diaDaSemana === 0 || diaDaSemana === 6;
}

function verificarDisponibilidade(funcionario, data) {
  const dataStr = formatarData(data);
  const diaDaSemana = data.getDay();
  const diaDoMes = data.getDate();

  // Verifica férias/ausências
  for (let ausencia of funcionario.restricoes.ausencias) {
    if (dataStr >= ausencia.inicio && dataStr <= ausencia.fim) {
      return false;
    }
  }

  // Verifica dia da semana permitido
  if (!funcionario.restricoes.diasSemanaPermitidos.includes(diaDaSemana)) {
    return false;
  }

  // Verifica preferência por par/ímpar
  if (!funcionario.restricoes.permitidoPar && diaDoMes % 2 === 0) return false;
  if (!funcionario.restricoes.permitidoImpar && diaDoMes % 2 !== 0) return false;

  // Verifica trabalho em feriados
  if (isFeriado(dataStr) && !funcionario.restricoes.trabalhaFeriado) {
    return false;
  }

  // Verifica trabalho em fins de semana
  if (isFimDeSemana(diaDaSemana) && !funcionario.restricoes.trabalhaFimSemana) {
    return false;
  }

  return true;
}

// --- Geração da Escala ---
function gerarEscala(mes, ano) {
  carregarDadosExemplo(); // Garante que os dados estejam carregados
  const escala = {};
  const contagemPlantoes = {};
  
  // Inicializa contagem de plantões por funcionário
  funcionarios.forEach(f => { contagemPlantoes[f.id] = 0; });

  const dataInicio = new Date(ano, mes - 1, 1);
  const dataFim = new Date(ano, mes, 0);

  for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
    const dataStr = formatarData(d);
    escala[dataStr] = {};

    setores.forEach(setor => {
      const diaDaSemana = d.getDay();
      const feriado = isFeriado(dataStr);
      const fimDeSemana = isFimDeSemana(diaDaSemana);
      
      // Verifica se o setor está aberto
      let setorAberto = true;
      if (feriado && !setor.abreFeriado) setorAberto = false;
      if (fimDeSemana && !setor.abreFimSemana) setorAberto = false;

      if (setorAberto) {
        // Filtra funcionários disponíveis para este dia e setor
        const disponiveis = funcionarios.filter(f => {
          // Filtra por categoria (aqui você pode adicionar regra se o setor exige categoria específica)
          // Por simplicidade, vamos permitir qualquer categoria, mas você pode refinar.
          return verificarDisponibilidade(f, d);
        });

        if (disponiveis.length > 0) {
          // Seleciona o funcionário com menos plantões (para equilibrar)
          disponiveis.sort((a, b) => contagemPlantoes[a.id] - contagemPlantoes[b.id]);
          const escolhido = disponiveis[0];
          
          if (!escala[dataStr][setor.nome]) {
            escala[dataStr][setor.nome] = [];
          }
          escala[dataStr][setor.nome].push(escolhido);
          contagemPlantoes[escolhido.id]++;
        } else {
          if (!escala[dataStr][setor.nome]) {
            escala[dataStr][setor.nome] = [];
          }
          escala[dataStr][setor.nome].push({ nome: 'N/D', categoria: 'sem-funcionario' });
        }
      }
    });
  }

  return escala;
}

// --- Renderização da Tabela ---
function renderizarEscala(escala, categoriaFiltro) {
  const container = document.getElementById('calendarioEscala');
  const mes = 4; // Abril
  const ano = 2026;
  const dataInicio = new Date(ano, mes - 1, 1);
  const dataFim = new Date(ano, mes, 0);
  
  let html = '<table>';
  html += '<thead><tr><th>DOM</th><th>SEG</th><th>TER</th><th>QUA</th><th>QUI</th><th>SEX</th><th>SAB</th></tr></thead>';
  html += '<tbody>';

  let diaAtual = new Date(dataInicio);
  // Ajusta para o primeiro dia da semana (domingo)
  diaAtual.setDate(diaAtual.getDate() - diaAtual.getDay());

  while (diaAtual <= dataFim || diaAtual.getDay() !== 0) {
    html += '<tr>';
    for (let i = 0; i < 7; i++) {
      const dataStr = formatarData(diaAtual);
      const diaDoMes = diaAtual.getDate();
      const mesAtual = diaAtual.getMonth() + 1;
      const feriado = isFeriado(dataStr);
      const fimDeSemana = isFimDeSemana(diaAtual.getDay());
      
      let classeCelula = 'celula-dia';
      if (feriado) classeCelula += ' feriado';
      if (fimDeSemana) classeCelula += ' fim-de-semana';
      
      html += `<td class="${classeCelula}">`;
      
      if (mesAtual === mes) {
        html += `<strong>${diaDoMes}</strong>`;
        
        if (escala[dataStr]) {
          for (let setor in escala[dataStr]) {
            const plantonistas = escala[dataStr][setor];
            if (plantonistas) {
              plantonistas.forEach(func => {
                // Aplica o filtro de categoria
                if (categoriaFiltro === 'todos' || func.categoria === categoriaFiltro) {
                  if (func.nome !== 'N/D') {
                    html += `<div class="plantao-item"><span>${func.nome}</span><small>${setor}</small></div>`;
                  } else {
                    html += `<div class="sem-plantao">(Sem plantonista)</div>`;
                  }
                }
              });
            }
          }
        } else {
          html += `<div class="sem-plantao">-</div>`;
        }
      } else {
        html += `<div class="sem-plantao"></div>`;
      }
      
      html += '</td>';
      diaAtual.setDate(diaAtual.getDate() + 1);
    }
    html += '</tr>';
  }

  html += '</tbody></table>';
  container.innerHTML = html;
}

// --- Inicialização e Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  carregarDadosExemplo();
  
  document.getElementById('btnGerar').addEventListener('click', () => {
    const escala = gerarEscala(4, 2026);
    const filtro = document.getElementById('filtroCategoria').value;
    renderizarEscala(escala, filtro);
  });

  document.getElementById('filtroCategoria').addEventListener('change', () => {
    const escala = gerarEscala(4, 2026);
    const filtro = document.getElementById('filtroCategoria').value;
    renderizarEscala(escala, filtro);
  });

  document.getElementById('btnImprimir').addEventListener('click', () => {
    window.print();
  });

  // Gera a escala inicial ao carregar a página
  const escalaInicial = gerarEscala(4, 2026);
  renderizarEscala(escalaInicial, 'todos');
});