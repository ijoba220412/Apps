// app.js - Lógica principal do aplicativo
document.addEventListener('DOMContentLoaded', function() {
    const templateSelect = document.getElementById('templateSelect');
    const dynamicForm = document.getElementById('dynamicForm');
    const preview = document.getElementById('preview');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');
    const logoInput = document.getElementById('logoInput');
    const logoPreview = document.getElementById('logoPreview');
document.addEventListener('DOMContentLoaded', function() {
  // Seleciona o campo pelo ID
  const campoCidadeData = document.getElementById('CIDADE_DATA');
  
  // Formata a data
  const data = new Date();
  const opcoes = { day: 'numeric', month: 'long', year: 'numeric' };
  const dataFormatada = data.toLocaleDateString('pt-BR', opcoes).replace(/ /g, ' de ');
  
  // Atualiza o placeholder com a cidade e data
  campoCidadeData.placeholder = `Rio de Janeiro, ${dataFormatada}`;
});    
    


// Valores do formulário
    let formValues = {};
    let logoFile = null;
    
    // Funções de formatação
    
    // Capitaliza a primeira letra de cada palavra
    function capitalizeWords(str) {
        if (!str) return str;
        return str.replace(/\b\w+/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }).replace(/\bi\b/g, 'I'); // Corrige o pronome "I" em inglês, se necessário
    }
    
    // Formata data por extenso
    function formatDateExtended(dateStr) {
        if (!dateStr) return dateStr;
        
        const months = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            
            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            
            return `${day} de ${month} de ${year}`;
        } catch (e) {
            return dateStr;
        }
    }
    
    // Retorna a data de hoje por extenso
    function getTodayExtended() {
        const today = new Date();
        const months = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        
        const day = today.getDate();
        const month = months[today.getMonth()];
        const year = today.getFullYear();
        
        return `Rio de Janeiro, ${day} de ${month} de ${year}`;
    }
    
    // Funções de máscara para formatação de input
    
    // Máscara para CPF
    function maskCPF(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    }
    
    // Máscara para CNPJ
    function maskCNPJ(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    }
    
    // Máscara para PIS
    function maskPIS(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{5})(\d)/, '$1.$2')
            .replace(/(\d{5}\.\d{2})(\d{1})/, '$1-$2')
            .replace(/(-\d{1})\d+?$/, '$1');
    }
    
    // Máscara para RG
    function maskRG(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{1})\d+?$/, '$1');
    }
    
    // Máscara para CTPS
    function maskCTPS(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{7})(\d)/, '$1/$2')
            .replace(/(\d{7}\/\d{0,3})\d+?$/, '$1');
    }
    
    // Máscara para OAB
    function maskOAB(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{0,6})\d+?$/, '$1');
    }
    
    // Máscara para valores monetários
    function maskCurrency(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d)(\d{2})$/, '$1,$2')
            .replace(/(?=(\d{3})+(\D))\B/g, '.');
    }
    
    // Aplica a máscara apropriada com base no ID do campo
    function applyMask(fieldId, value) {
        if (!value) return value;
        
        if (fieldId === 'RECLAMANTE_CPF') {
            return maskCPF(value);
        } else if (fieldId === 'RECLAMADA_CNPJ') {
            return maskCNPJ(value);
        } else if (fieldId === 'RECLAMANTE_PIS') {
            return maskPIS(value);
        } else if (fieldId === 'RECLAMANTE_RG') {
            return maskRG(value);
        } else if (fieldId === 'RECLAMANTE_CTPS') {
            return maskCTPS(value);
        } else if (fieldId === 'ADVOGADO_OAB') {
            return maskOAB(value);
        } else if (fieldId.includes('VALOR_')) {
            return 'R$ ' + maskCurrency(value);
        } else if (fieldId === 'VALOR_CAUSA') {
            return 'R$ ' + maskCurrency(value);
        } else if (fieldId === 'RECLAMANTE_SALARIO') {
            return 'R$ ' + maskCurrency(value);
        }
        
        return value;
    }
    
    // Inicializa o formulário com o template selecionado
    function initForm() {
        const selectedTemplate = templateSelect.value;
        const template = templates[selectedTemplate];
        
        if (!template) return;
        
        // Limpa o formulário atual
        dynamicForm.innerHTML = '';
        formValues = {};
        
        // Cria os campos do formulário dinamicamente com base nos campos do template
        template.fields.forEach(field => {
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'form-group';
            
            const label = document.createElement('label');
            label.htmlFor = field.id;
            label.textContent = field.label;
            fieldGroup.appendChild(label);
            
            let input;
            
            if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = 3;
            } else if (field.type === 'select') {
                input = document.createElement('select');
                field.options.forEach(option => {
                    const optElement = document.createElement('option');
                    optElement.value = option;
                    optElement.textContent = option;
                    input.appendChild(optElement);
                });
            } else {
                input = document.createElement('input');
                input.type = field.type;
            }
            
            input.id = field.id;
            input.name = field.id;
            
            if (field.placeholder) {
                input.placeholder = field.placeholder;
            }
            
            // Define valores padrão
            if (field.id === 'CIDADE_DATA') {
                input.value = getTodayExtended();
                formValues[field.id] = input.value;
            } else if (field.id === 'CIDADE_UF') {
                input.value = 'Rio de Janeiro/RJ';
                formValues[field.id] = input.value;
            } else if (field.id === 'ADVOGADO_UF') {
                input.value = 'RJ';
                formValues[field.id] = input.value;
            } else if (field.id === 'RECLAMANTE_NACIONALIDADE') {
                if (input.type === 'text') {
                    input.value = 'brasileiro(a)';
                    formValues[field.id] = input.value;
                }
            }
            
            // Aplica máscaras apropriadas
            if (
                ['RECLAMANTE_CPF', 'RECLAMADA_CNPJ', 'RECLAMANTE_PIS', 
                'RECLAMANTE_RG', 'RECLAMANTE_CTPS', 'ADVOGADO_OAB', 
                'RECLAMANTE_SALARIO', 'VALOR_CAUSA'].includes(field.id) || 
                field.id.includes('VALOR_')
            ) {
                input.addEventListener('input', function(e) {
                    const valor = applyMask(field.id, e.target.value);
                    e.target.value = valor;
                    formValues[field.id] = valor;
                });
            } else {
                // Adiciona listener para atualizar os valores
                input.addEventListener('input', function() {
                    if (field.type === 'select') {
                        formValues[field.id] = this.value;
                    } else if (field.type === 'date') {
                        formValues[field.id] = formatDateExtended(this.value);
                    } else {
                        // Capitaliza palavras para campos de texto
                        if (field.type === 'text' && !field.id.includes('VALOR_')) {
                            const capitalizedValue = capitalizeWords(this.value);
                            formValues[field.id] = capitalizedValue;
                        } else {
                            formValues[field.id] = this.value;
                        }
                    }
                });
            }
            
            // Para campos do tipo de rescisão, garantir que o valor seja capturado corretamente
            if (field.id === 'TIPO_RESCISAO') {
                input.addEventListener('change', function() {
                    formValues[field.id] = this.value;
                });
            }
            
            fieldGroup.appendChild(input);
            dynamicForm.appendChild(fieldGroup);
        });
    }
    
    // Handler de upload do logo
    function handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        logoFile = file;
        
        // Mostra prévia do logo
        const reader = new FileReader();
        reader.onload = function(e) {
            logoPreview.src = e.target.result;
            logoPreview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
    
    // Gera a visualização do documento
    function generateDocument() {
        const selectedTemplate = templateSelect.value;
        const template = templates[selectedTemplate];
        
        if (!template) return;
        
        let documentContent = template.content;
        
        // Substitui todos os campos no template pelos valores do formulário
        for (const [key, value] of Object.entries(formValues)) {
            const placeholder = new RegExp('{{' + key + '}}', 'g');
            documentContent = documentContent.replace(placeholder, value || `[${key} não preenchido]`);
        }
        
        // Destaca campos não preenchidos
        documentContent = documentContent.replace(/{{[A-Z_]+}}/g, match => {
            return `<span style="background-color: yellow; color: red;">${match}</span>`;
        });
        
        // Adiciona o logo se disponível
        let headerHtml = '';
        if (logoFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                headerHtml = `<div style="text-align: center; margin-bottom: 20px;">
                    <img src="${e.target.result}" style="max-width: 100%; max-height: 150px;" />
                </div>`;
                
                preview.innerHTML = headerHtml + documentContent;
            }
            reader.readAsDataURL(logoFile);
        } else {
            preview.innerHTML = documentContent;
        }
    }
    
    // Função auxiliar para exportação
    function prepareDocumentContent() {
        const selectedTemplate = templateSelect.value;
        const template = templates[selectedTemplate];
        
        if (!template) return null;
        
        let documentContent = template.content;
        
        // Substitui todos os campos no template pelos valores do formulário
        for (const [key, value] of Object.entries(formValues)) {
            const placeholder = new RegExp('{{' + key + '}}', 'g');
            documentContent = documentContent.replace(placeholder, value || `_______________`);
        }
        
        // Remove campos não preenchidos
        documentContent = documentContent.replace(/{{[A-Z_]+}}/g, '_______________');
        
        return documentContent;
    }
    
    // Baixa o documento como arquivo .docx
    async function downloadDocx() {
        const documentContent = prepareDocumentContent();
        if (!documentContent) return;
        
        const selectedTemplate = templateSelect.value;
        const template = templates[selectedTemplate];
        
        // Importa a biblioteca de terceiros para gerar .docx
        // Neste exemplo estamos usando uma biblioteca fictícia
        // Na implementação real, você precisa importar uma biblioteca como docx
        try {
            // Código para gerar o arquivo .docx usando a biblioteca
            const blob = new Blob([documentContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${template.name}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Documento .docx gerado com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar .docx:', error);
            alert('Erro ao gerar o documento .docx. Por favor, tente novamente.');
            
            // Fallback para texto simples
            const blob = new Blob([documentContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${template.name}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
    
    // Gera e baixa o documento como PDF
    async function downloadPDF() {
        const documentContent = prepareDocumentContent();
        if (!documentContent) return;
        
        const selectedTemplate = templateSelect.value;
        const template = templates[selectedTemplate];
        
        // Importa a biblioteca de terceiros para gerar PDF
        // Neste exemplo estamos usando uma biblioteca fictícia
        // Na implementação real, você precisa importar uma biblioteca como jsPDF ou usar serviços de API
        try {
            // Código para gerar o arquivo PDF usando a biblioteca
            // Este é um placeholder - na implementação real, você usaria uma biblioteca como jsPDF
            
            // Para fins de demonstração, vamos apenas simular o download
            const htmlContent = `
                <html>
                    <head>
                        <title>${template.name}</title>
                        <style>
                            body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; }
                        </style>
                    </head>
                    <body>
                        ${documentContent.replace(/\n/g, '<br>')}
                    </body>
                </html>
            `;
            
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${template.name}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Para uma implementação completa de PDF, é necessário incluir uma biblioteca como jsPDF.');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar o documento PDF. Por favor, tente novamente.');
        }
    }
    
    // Imprime o documento atual
    function printDocument() {
        const printWindow = window.open('', '_blank');
        const selectedTemplate = templateSelect.value;
        const template = templates[selectedTemplate];
        
        if (!printWindow || !template) return;
        
        const documentContent = prepareDocumentContent();
        if (!documentContent) return;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${template.name}</title>
                <style>
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        line-height: 1.5;
                        margin: 2cm;
                    }
                    @media print {
                        body {
                            margin: 2cm;
                        }
                    }
                </style>
            </head>
            <body>
        `);
        
        // Adiciona o logo se disponível
        if (logoFile) {
            const img = logoPreview.cloneNode(true);
            printWindow.document.write(`
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${img.src}" style="max-width: 100%; max-height: 150px;" />
                </div>
            `);
        }
        
        // Adiciona o conteúdo do documento
        printWindow.document.write(`
                <div>${documentContent.replace(/\n/g, '<br>')}</div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        // Atrasa a impressão para garantir que o conteúdo seja carregado
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 1000);
    }
    
    // Event Listeners
    templateSelect.addEventListener('change', initForm);
    generateBtn.addEventListener('click', generateDocument);
    downloadBtn.addEventListener('click', downloadDocx);
    pdfBtn.addEventListener('click', downloadPDF);
    printBtn.addEventListener('click', printDocument);
    logoInput.addEventListener('change', handleLogoUpload);
    
    // Inicializa o formulário ao carregar a página
    initForm();
});