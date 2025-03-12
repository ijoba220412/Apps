// app.js - Lógica principal do aplicativo
document.addEventListener('DOMContentLoaded', function() {
    const templateSelect = document.getElementById('templateSelect');
    const dynamicForm = document.getElementById('dynamicForm');
    const preview = document.getElementById('preview');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const printBtn = document.getElementById('printBtn');
    const logoUpload = document.getElementById('logoUpload');
    let headerLogo = null;
    
    // Valores do formulário com valores padrão
    let formValues = {
        RECLAMANTE_NACIONALIDADE: 'brasileiro(a)',
        CIDADE_UF: 'Rio de Janeiro/RJ',
        ADVOGADO_UF: 'RJ'
    };
    
    // Função para formatar data por extenso
    function formatDateExtended(dateStr) {
        if (!dateStr) return '';
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        const day = date.getDate();
        const months = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} de ${month} de ${year}`;
    }
    
    // Função para capitalizar primeira letra de cada palavra
    function capitalizeWords(str) {
        if (!str) return '';
        return str.replace(/\b\w/g, match => match.toUpperCase());
    }
    
    // Função para aplicar máscaras de formatação
    function applyMask(value, fieldId) {
        if (!value) return '';
        
        // Remove caracteres não numéricos para processamento
        const numbers = value.replace(/\D/g, '');
        
        switch(fieldId) {
            case 'RECLAMANTE_CPF':
                // Formato: 000.000.000-00
                if (numbers.length <= 11) {
                    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                }
                return value;
                
            case 'RECLAMANTE_PIS':
                // Formato: 000.00000.00-0
                if (numbers.length <= 11) {
                    return numbers.replace(/(\d{3})(\d{5})(\d{2})(\d{1})/, '$1.$2.$3-$4');
                }
                return value;
                
            case 'RECLAMANTE_RG':
                // Formato básico para RG: 00.000.000-0
                if (numbers.length <= 9) {
                    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
                }
                return value;
                
            case 'RECLAMADA_CNPJ':
                // Formato: 00.000.000/0000-00
                if (numbers.length <= 14) {
                    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                }
                return value;
                
            case 'ADVOGADO_OAB':
                // Mantém como está, pois OAB pode variar por estado
                return value;
                
            case 'RECLAMANTE_CTPS':
                // Formato: 0000000 série 000-0
                if (numbers.length <= 8) {
                    return numbers.replace(/(\d{7})(\d{1})/, '$1 série 000-$2');
                }
                return value;
                
            default:
                return value;
        }
    }
    
    // Inicializa o formulário com o template selecionado
    function initForm() {
        const selectedTemplate = templateSelect.value;
        const template = templates[selectedTemplate];
        
        if (!template) return;
        
        // Limpa o formulário atual
        dynamicForm.innerHTML = '';
        // Mantém os valores padrão
        const defaultValues = {
            RECLAMANTE_NACIONALIDADE: 'brasileiro(a)',
            CIDADE_UF: 'Rio de Janeiro/RJ', 
            ADVOGADO_UF: 'RJ'
        };
        formValues = {...defaultValues};
        
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
            
            // Preenche com valor padrão se existir
            if (formValues[field.id]) {
                if (field.type === 'select') {
                    // Para select, precisamos encontrar a opção correspondente
                    for (let i = 0; i < input.options.length; i++) {
                        if (input.options[i].value === formValues[field.id]) {
                            input.selectedIndex = i;
                            break;
                        }
                    }
                } else {
                    input.value = formValues[field.id];
                }
            }
            
            // Adiciona listener para atualizar os valores
            if (field.type === 'select') {
                input.addEventListener('change', function() {
                    formValues[field.id] = this.value;
                });
            } else if (field.type === 'date') {
                input.addEventListener('change', function() {
                    // Para campos de data, já convertemos para o formato por extenso
                    formValues[field.id] = formatDateExtended(this.value);
                });
            } else {
                input.addEventListener('input', function() {
                    let value = this.value;
                    
                    // Aplicar máscaras para documentos
                    if (['RECLAMANTE_CPF', 'RECLAMANTE_PIS', 'RECLAMANTE_RG', 
                         'RECLAMADA_CNPJ', 'ADVOGADO_OAB', 'RECLAMANTE_CTPS'].includes(field.id)) {
                        value = applyMask(value, field.id);
                        this.value = value; // Atualiza o campo visualmente
                    }
                    
                    // Capitaliza a primeira letra de cada palavra em campos de texto
                    if (field.type === 'text' && 
                        !['RECLAMANTE_CPF', 'RECLAMANTE_PIS', 'RECLAMANTE_RG', 
                          'RECLAMADA_CNPJ', 'ADVOGADO_OAB', 'RECLAMANTE_CTPS'].includes(field.id)) {
                        value = capitalizeWords(value);
                        this.value = value; // Atualiza o campo visualmente
                    }
                    
                    formValues[field.id] = value;
                });
            }
            
            fieldGroup.appendChild(input);
            dynamicForm.appendChild(fieldGroup);
        });
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
        
        // Adiciona papel timbrado se existir
        if (headerLogo) {
            const headerHtml = `<div style="text-align:center; margin-bottom: 20px;">
                <img src="${headerLogo}" style="max-width: 100%; max-height: 150px;">
            </div>`;
            documentContent = headerHtml + documentContent;
        }
        
        preview.innerHTML = documentContent;
    }
    
    // Exporta para formato .docx usando docx.js
    function downloadDocx() {
        // Código simplificado - na implementação real você usaria a biblioteca docx.js
        alert("Para implementar a exportação DOCX, é necessário incluir a biblioteca docx.js!");
        
        // Em uma implementação real, você montaria o documento usando a API da biblioteca
        // Por exemplo:
        /*
        const doc = new Document();
        // Montar o documento com paragraphs, sections, etc.
        // Packing para download
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, `${templates[templateSelect.value].name}.docx`);
        });
        */
    }
    
    // Exporta para PDF
    function generatePDF() {
        // Código simplificado - na implementação real você usaria uma biblioteca como html2pdf.js
        alert("Para implementar a exportação PDF, é necessário incluir a biblioteca html2pdf.js!");
        
        // Em uma implementação real:
        /*
        html2pdf().from(preview).save(`${templates[templateSelect.value].name}.pdf`);
        */
    }
    
    // Função de impressão
    function printDocument() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Imprimir Petição</title>');
        printWindow.document.write('<style>body { font-family: "Times New Roman", Times, serif; line-height: 1.5; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(preview.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        
        // Imprimir após carregar todo o conteúdo
        printWindow.onload = function() {
            printWindow.print();
            printWindow.close();
        };
    }
    
    // Baixa o documento como arquivo .txt
    function downloadDocument() {
        const selectedTemplate = templateSelect.value;
        const template = templates[selectedTemplate];
        
        if (!template) return;
        
        let documentContent = template.content;
        
        // Substitui todos os campos no template pelos valores do formulário
        for (const [key, value] of Object.entries(formValues)) {
            const placeholder = new RegExp('{{' + key + '}}', 'g');
            documentContent = documentContent.replace(placeholder, value || `_______________`);
        }
        
        // Remove campos não preenchidos
        documentContent = documentContent.replace(/{{[A-Z_]+}}/g, '_______________');
        
        // Cria um blob para download
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
    
    // Gerenciar upload de logo/papel timbrado
    function handleLogoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                headerLogo = e.target.result;
                // Exibe miniatura do logo
                const logoPreview = document.getElementById('logoPreview');
                if (logoPreview) {
                    logoPreview.src = headerLogo;
                    logoPreview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Event Listeners
    templateSelect.addEventListener('change', initForm);
    generateBtn.addEventListener('click', generateDocument);
    downloadBtn.addEventListener('click', downloadDocument);
    
    // Novos event listeners
    if (pdfBtn) pdfBtn.addEventListener('click', generatePDF);
    if (printBtn) printBtn.addEventListener('click', printDocument);
    if (logoUpload) logoUpload.addEventListener('change', handleLogoUpload);
    
    // Inicializa o formulário ao carregar a página
    initForm();
});

// Função para exportar para DOCX usando a biblioteca docx.js
function downloadDocx() {
    const selectedTemplate = templateSelect.value;
    const template = templates[selectedTemplate];
    
    if (!template) return;
    
    // Importações necessárias da biblioteca docx
    const { Document, Packer, Paragraph, TextRun, Header, ImageRun, AlignmentType } = docx;
    
    // Criar novo documento
    const doc = new Document({
        sections: [{
            properties: {},
            children: []
        }]
    });
    
    // Adicionar papel timbrado/logo se existir
    if (headerLogo) {
        const logoImage = new ImageRun({
            data: headerLogo.split(';base64,')[1],
            transformation: {
                width: 400,
                height: 100
            }
        });
        
        const headerParagraph = new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [logoImage]
        });
        
        doc.addSection({
            headers: {
                default: new Header({
                    children: [headerParagraph]
                })
            },
            children: []
        });
    }
    
    // Preparar o conteúdo do documento
    let documentContent = template.content;
    
    // Substituir todos os campos no template pelos valores do formulário
    for (const [key, value] of Object.entries(formValues)) {
        const placeholder = new RegExp('{{' + key + '}}', 'g');
        documentContent = documentContent.replace(placeholder, value || `_______________`);
    }
    
    // Remover campos não preenchidos
    documentContent = documentContent.replace(/{{[A-Z_]+}}/g, '_______________');
    
    // Dividir por linhas para criar parágrafos
    const lines = documentContent.split('\n');
    
    // Adicionar cada linha como um parágrafo
    lines.forEach(line => {
        if (line.trim() === '') {
            // Linha em branco
            doc.addParagraph(new Paragraph({}));
        } else {
            doc.addParagraph(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: line,
                            size: 24 // 12pt = 24 half-points
                        })
                    ]
                })
            );
        }
    });
    
    // Gerar o arquivo e baixar
    Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${template.name}.docx`);
    });
}

// Função para exportar para PDF usando html2pdf
function generatePDF() {
    const selectedTemplate = templateSelect.value;
    const template = templates[selectedTemplate];
    
    if (!template) return;
    
    const opt = {
        margin: [20, 20, 20, 20],
        filename: `${template.name}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(preview).save();
}

// Event Listeners para novos botões
document.getElementById('docxBtn').addEventListener('click', downloadDocx);
document.getElementById('pdfBtn').addEventListener('click', generatePDF);
