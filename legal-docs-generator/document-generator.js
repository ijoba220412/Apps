// Aguarde o carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Aplicar máscaras aos campos
    $('#reclamante_cpf').mask('000.000.000-00');
    $('#reclamada_cnpj').mask('00.000.000/0000-00');
    $('#reclamante_salario').mask('#.##0,00', {reverse: true});
    $('#valor_saldo_salario').mask('#.##0,00', {reverse: true});
    $('#valor_ferias').mask('#.##0,00', {reverse: true});
    $('#valor_13_salario').mask('#.##0,00', {reverse: true});
    $('#valor_aviso_previo').mask('#.##0,00', {reverse: true});
    $('#valor_multa_477').mask('#.##0,00', {reverse: true});
    $('#valor_multa_fgts').mask('#.##0,00', {reverse: true});
    $('#valor_dano_moral').mask('#.##0,00', {reverse: true});
    $('#valor_causa').mask('#.##0,00', {reverse: true});

    // Referências aos elementos DOM
    const petitionForm = document.getElementById('petitionForm');
    const previewTab = document.getElementById('preview-tab');
    const documentPreview = document.getElementById('documentPreview');
    
    // Carregar o template quando a página for carregada
    let documentTemplate = '';
    
    // Função para carregar o template
    async function loadTemplate() {
        try {
            const response = await fetch('./templates/inicial_trab.txt');
            if (!response.ok) {
                throw new Error(`Falha ao carregar o template: ${response.status}`);
            }
            documentTemplate = await response.text();
            console.log('Template carregado com sucesso');
        } catch (error) {
            console.error('Erro ao carregar o template:', error);
            documentTemplate = 'Erro ao carregar o template. Verifique se o arquivo existe no caminho "./templates/inicial_trab.txt"';
        }
    }
    
    // Carregar o template ao iniciar
    loadTemplate();
    
    // Função para formatar a data de DD/MM/AAAA
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    // Função para calcular o tempo de serviço
    function calcularTempoServico(dataAdmissao, dataRescisao) {
        const admissao = new Date(dataAdmissao);
        const rescisao = new Date(dataRescisao);
        
        const diferencaMilissegundos = rescisao - admissao;
        const diferencaDias = Math.floor(diferencaMilissegundos / (1000 * 60 * 60 * 24));
        
        const anos = Math.floor(diferencaDias / 365);
        const meses = Math.floor((diferencaDias % 365) / 30);
        const dias = diferencaDias % 30;
        
        let resultado = '';
        
        if (anos > 0) {
            resultado += `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
        }
        
        if (meses > 0) {
            if (resultado !== '') resultado += ', ';
            resultado += `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
        }
        
        if (dias > 0 || resultado === '') {
            if (resultado !== '') resultado += ' e ';
            resultado += `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
        }
        
        return resultado;
    }
    
    // Função para gerar o documento quando o formulário for enviado
    petitionForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Obter todos os valores do formulário
        const formData = new FormData(petitionForm);
        let documentText = documentTemplate;
        
        // Substituir cada tag no template pelo valor correspondente do formulário
        for (const [key, value] of formData.entries()) {
            const placeholder = new RegExp(`{${key}}`, 'g');
            documentText = documentText.replace(placeholder, value);
        }
        
        // Lidar com valores calculados ou formatados
        const dataAdmissao = formData.get('DATA_ADMISSAO');
        const dataRescisao = formData.get('DATA_RESCISAO');
        
        documentText = documentText.replace(/{DATA_ADMISSAO_FORMATADA}/g, formatDate(dataAdmissao));
        documentText = documentText.replace(/{DATA_RESCISAO_FORMATADA}/g, formatDate(dataRescisao));
        documentText = documentText.replace(/{TEMPO_SERVICO}/g, calcularTempoServico(dataAdmissao, dataRescisao));
        
        // Calcular o valor total da causa
        const valoresPedidos = [
            parseFloat(formData.get('VALOR_SALDO_SALARIO').replace('.', '').replace(',', '.') || 0),
            parseFloat(formData.get('VALOR_FERIAS').replace('.', '').replace(',', '.') || 0),
            parseFloat(formData.get('VALOR_13_SALARIO').replace('.', '').replace(',', '.') || 0),
            parseFloat(formData.get('VALOR_AVISO_PREVIO').replace('.', '').replace(',', '.') || 0),
            parseFloat(formData.get('VALOR_MULTA_477').replace('.', '').replace(',', '.') || 0),
            parseFloat(formData.get('VALOR_MULTA_FGTS').replace('.', '').replace(',', '.') || 0),
            parseFloat(formData.get('VALOR_DANO_MORAL').replace('.', '').replace(',', '.') || 0)
        ];
        
        const valorTotal = valoresPedidos.reduce((total, valor) => total + valor, 0);
        const valorTotalFormatado = valorTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        
        documentText = documentText.replace(/{VALOR_CAUSA_EXTENSO}/g, valorPorExtenso(valorTotal));
        
        // Data atual
        const dataAtual = new Date();
        const dataFormatada = `${dataAtual.getDate()} de ${getNomeMes(dataAtual.getMonth())} de ${dataAtual.getFullYear()}`;
        documentText = documentText.replace(/{DATA_ATUAL}/g, dataFormatada);
        
        // Exibir no preview
        documentPreview.innerHTML = documentText.replace(/\n/g, '<br>');
        
        // Mudar para a aba de visualização
        previewTab.click();
    });
    
    // Função para obter o nome do mês
    function getNomeMes(numeroMes) {
        const meses = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        return meses[numeroMes];
    }
    
    // Função para converter valor numérico em extenso
    function valorPorExtenso(valor) {
        if (valor === 0) return 'zero reais';
        
        const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
        const dezADezenove = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
        const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
        const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
        
        function converterGrupo(numero) {
            let resultado = '';
            
            if (numero >= 100) {
                if (numero === 100) {
                    return 'cem';
                }
                resultado += centenas[Math.floor(numero / 100)] + ' e ';
                numero %= 100;
            }
            
            if (numero >= 10 && numero <= 19) {
                resultado += dezADezenove[numero - 10];
            } else if (numero >= 20) {
                resultado += dezenas[Math.floor(numero / 10)];
                if (numero % 10 !== 0) {
                    resultado += ' e ' + unidades[numero % 10];
                }
            } else if (numero > 0) {
                resultado += unidades[numero];
            }
            
            return resultado;
        }
        
        const valorInteiro = Math.floor(valor);
        const centavos = Math.round((valor - valorInteiro) * 100);
        
        let resultado = '';
        
        if (valorInteiro > 0) {
            const bilhoes = Math.floor(valorInteiro / 1000000000);
            const milhoes = Math.floor((valorInteiro % 1000000000) / 1000000);
            const milhares = Math.floor((valorInteiro % 1000000) / 1000);
            const unidadesValor = valorInteiro % 1000;
            
            if (bilhoes > 0) {
                resultado += converterGrupo(bilhoes) + ' ' + (bilhoes === 1 ? 'bilhão' : 'bilhões');
                if (milhoes > 0 || milhares > 0 || unidadesValor > 0) {
                    resultado += ' ';
                }
            }
            
            if (milhoes > 0) {
                resultado += converterGrupo(milhoes) + ' ' + (milhoes === 1 ? 'milhão' : 'milhões');
                if (milhares > 0 || unidadesValor > 0) {
                    resultado += ' ';
                }
            }
            
            if (milhares > 0) {
                resultado += converterGrupo(milhares) + ' mil';
                if (unidadesValor > 0) {
                    resultado += ' ';
                }
            }
            
            if (unidadesValor > 0) {
                resultado += converterGrupo(unidadesValor);
            }
            
            resultado += ' ' + (valorInteiro === 1 ? 'real' : 'reais');
        }
        
        if (centavos > 0) {
            if (valorInteiro > 0) {
                resultado += ' e ';
            }
            resultado += converterGrupo(centavos) + ' ' + (centavos === 1 ? 'centavo' : 'centavos');
        }
        
        return resultado;
    }
    
    // Botão para exportar como PDF
    document.getElementById('exportPDF').addEventListener('click', function() {
        const element = document.getElementById('documentPreview');
        
        const opt = {
            margin: [15, 15, 15, 15],
            filename: 'peticao_inicial_trabalhista.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
    });
    
    // Botão para exportar como DOCX
    document.getElementById('exportDOCX').addEventListener('click', function() {
        const content = document.getElementById('documentPreview').innerText;
        
        // Configuração do documento
        const doc = new docx.Document({
            sections: [{
                properties: {},
                children: [
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun(content)
                        ]
                    })
                ]
            }]
        });
        
        // Gerar e salvar o arquivo
        docx.Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'peticao_inicial_trabalhista.docx');
        });
    });
});
