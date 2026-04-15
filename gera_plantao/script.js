// Estruturas de dados iniciais (exemplo)
let funcionarios = [];
let setores = [];
let feriados = [];

// Inicialização com dados de exemplo baseados nos PDFs fornecidos
function carregarDadosExemplo() {
  // Farmacêuticos
  funcionarios.push({
    id: 1,
    nome: "Andrea M.",
    categoria: "farmaceutico",
    vinculos: [{ tipo: "CLT", cargaHorariaMensal: 152 }],
    restricoes: {
      ausencias: [{ inicio: "2026-04-06", fim: "2026-04-19" }],
      diasSemanaPermitidos: [0,1,2,3,4,5,6],
      permitidoPar: true, permitidoImpar: true,
      trabalhaFeriado: true, trabalhaFimSemana: true
    }
  });
  // ... adicionar demais conforme os PDFs
}

// Função para gerar escala
function gerarEscala(mes, ano) {
  // 1. Determinar dias do mês
  // 2. Para cada dia, verificar setores abertos
  // 3. Para cada setor, selecionar funcionário disponível
  // 4. Atribuir plantão e registrar
}

// Renderização da tabela
function renderizarEscala(escala, categoriaFiltro) {
  // Monta tabela HTML com os plantões
}

// Event Listeners
document.getElementById('btnGerar').addEventListener('click', () => {
  const escala = gerarEscala(4, 2026); // abril 2026
  renderizarEscala(escala, document.getElementById('filtroCategoria').value);
});