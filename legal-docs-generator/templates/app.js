// app.js - Lógica principal do aplicativo
document.addEventListener('DOMContentLoaded', function() {
    const templateSelect = document.getElementById('templateSelect');
    const dynamicForm = document.getElementById('dynamicForm');
    const preview = document.getElementById('preview');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // Valores do formulário
    let formValues = {};
    
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
            
            // Adiciona listener para atualizar os valores
            input.addEventListener('input', function() {
                formValues[field.id] = this.value;
            });
            
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
    
    // Event Listeners
    templateSelect.addEventListener('change', initForm);
    generateBtn.addEventListener('click', generateDocument);
    downloadBtn.addEventListener('click', downloadDocument);
    
    // Inicializa o formulário ao carregar a página
    initForm();
});