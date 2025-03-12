// app.js - Lógica principal do aplicativo
document.addEventListener('DOMContentLoaded', function() {
    const templateSelect = document.getElementById('templateSelect');
    const dynamicForm = document.getElementById('dynamicForm');
    const preview = document.getElementById('preview');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // Valores do formulário
    let formValues = {};
    
    // Valores padrão para campos comuns
    const defaultValues = {
        "RECLAMANTE_NACIONALIDADE": "brasileiro(a)",
        "CIDADE_UF": "Rio de Janeiro/RJ",
        "VARA_TRABALHO": "1ª"
    };
    
    // Função para converter data para formato por extenso
    function formatDateExtended(dateString) {
        if (!dateString) return "";
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const day = date.getDate();
        const months = [
            "janeiro", "fevereiro", "março", "abril", "maio", "junho", 
            "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        ];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} de ${month} de ${year}`;
    }
    
    // Função para capitalizar a primeira letra de cada palavra
    function capitalizeWords(str) {
        if (!str) return "";
        return str.replace(/\b\w/g, letter => letter.toUpperCase());
    }
    
    // Função para aplicar máscara de CPF: 000.000.000-00
    function maskCPF(cpf) {
        if (!cpf) return "";
        cpf = cpf.replace(/\D/g, "");
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    
    // Função para aplicar máscara de CNPJ: 00.000.000/0001-00
    function maskCNPJ(cnpj) {
        if (!cnpj) return "";
        cnpj = cnpj.replace(/\D/g, "");
        return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    
    // Função para aplicar máscara de PIS: 000.00000.00-0
    function maskPIS(pis) {
        if (!pis) return "";
        pis = pis.replace(/\D/g, "");
        return pis.replace(/(\d{3})(\d{5})(\d{2})(\d{1})/, "$1.$2.$3-$4");
    }
    
    // Função para formatar valores monetários: R$ 0.000,00
    function formatCurrency(value) {
        if (!value) return "";
        value = value.replace(/\D/g, "");
        value = (parseInt(value) / 100).toFixed(2);
        return "R$ " + value.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    // Aplica a máscara ao digitar em um input
    function applyInputMask(input, maskFunction) {
        input.addEventListener('input', function() {
            const cursorPos = this.selectionStart;
            const originalLength = this.value.length;
            this.value = maskFunction(this.value);
            const newLength = this.value.length;
            
            // Ajusta a posição do cursor após aplicar a máscara
            if (cursorPos < originalLength) {
                this.setSelectionRange(cursorPos + (newLength - originalLength), cursorPos + (newLength - originalLength));
            }
            
            // Atualiza o valor no objeto formValues
            formValues[this.name] = this.value;
        });
    }
    
    // Inicializa o formulário com o template selecionado
    function initForm() {
        const selectedTemplate = templateSelect.value;
        const template = templates[selectedTemplate];
        
        if (!template) return;
        
        // Limpa o formulário atual
        dynamicForm.innerHTML = '';
        formValues = JSON.parse(JSON.stringify(defaultValues)); // Clone os valores padrão
        
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
                    optElement.textContent = capitalizeWords(option);
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
            if (defaultValues[field.id]) {
                input.value = defaultValues[field.id];
                formValues[field.id] = defaultValues[field.id];
            }
            
            // Aplica máscaras específicas com base no campo
            if (field.id === "RECLAMANTE_CPF") {
                applyInputMask(input, maskCPF);
            } else if (field.id === "RECLAMADA_CNPJ") {
                applyInputMask(input, maskCNPJ);
            } else if (field.id === "RECLAMANTE_PIS") {
                applyInputMask(input, maskPIS);
            } else if (field.id.includes("VALOR_")) {
                // Para campos de valor monetário
                input.placeholder = "R$ 0,00";
                applyInputMask(input, formatCurrency);
            } else {
                // Adiciona listener para atualizar os valores
                input.addEventListener('input', function() {
                    // Capitaliza a primeira letra de palavras para campos de texto
                    if (field.type === 'text' && !field.id.includes("_RG") && 
                        !field.id.includes("_CTPS") && !field.id.includes("_OAB")) {
                        formValues[field.id] = capitalizeWords(this.value);
                    } else {
                        formValues[field.id] = this.value;
                    }
                });
            }
            
            // Caso especial para TIPO_RESCISAO, que precisa atualizar formValues ao ser selecionado
            if (field.id === "TIPO_RESCISAO") {
                input.addEventListener('change', function() {
                    formValues[field.id] = this.value;
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
            let formattedValue = value;
            
            // Formata datas para o formato por extenso
            if (key === "DATA_ADMISSAO" || key === "DATA_RESCISAO" || key === "RECLAMANTE_DATA_NASC") {
                formattedValue = formatDateExtended(value);
            }
            
            const placeholder = new RegExp('{{' + key + '}}', 'g');
            documentContent = documentContent.replace(placeholder, formattedValue || `[${key} não preenchido]`);
        }
        
        // Destaca campos não preenchidos
        documentContent = documentContent.replace(/{{[A-Z_]+}}/g, match => {
            return `<span style="background-color: yellow; color: red;">${match}</span>`;
        });
        
        preview.innerHTML = documentContent;
    }
    
    // Baixa o documento como arquivo .docx
    function downloadDocument() {
        const selectedTemplate = templateSelect.value;
        const template = templates[selectedTemplate];
        
        if (!template) return;
        
        let documentContent = template.content;
        
        // Substitui todos os campos no template pelos valores do formulário
        for (const [key, value] of Object.entries(formValues)) {
            let formattedValue = value;
            
            // Formata datas para o formato por extenso
            if (key === "DATA_ADMISSAO" || key === "DATA_RESCISAO" || key === "RECLAMANTE_DATA_NASC") {
                formattedValue = formatDateExtended(value);
            }
            
            const placeholder = new RegExp('{{' + key + '}}', 'g');
            documentContent = documentContent.replace(placeholder, formattedValue || `_______________`);
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
    
    // Event Listeners
    templateSelect.addEventListener('change', initForm);
    generateBtn.addEventListener('click', generateDocument);
    downloadBtn.addEventListener('click', downloadDocument);
    
    // Inicializa o formulário ao carregar a página
    initForm();
});