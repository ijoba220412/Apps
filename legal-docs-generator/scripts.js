// Templates
const templates = {
    power_of_attorney: {
        content: `
            <div class="doc-header">
                <h2>PROCURAÇÃO PÚBLICA</h2>
                <p>Livro {{livro}}, Folha {{folha}}</p>
            </div>

            <div class="clause">
                <p>{{outorgante}}, brasileiro(a), portador(a) do CPF {{cpf_outorgante}},</p>
                <p>CONFERE PODERES a {{outorgado}}, OAB {{oab_outorgado}}, para:</p>
                
                <ul class="powers-list">
                    {{#poderes}}<li>{{.}}</li>{{/poderes}}
                </ul>
            </div>

            <div class="clause">
                <p>Validade: {{vigencia || 'Indeterminada'}}</p>
                <p>{{cidade}}, {{data}}</p>
            </div>
        `
    }
};

// Função de geração
function generateDocument(templateId) {
    const data = {
        outorgante: document.getElementById('outorgante').value,
        cpf_outorgante: document.getElementById('cpf_outorgante').value,
        outorgado: document.getElementById('outorgado').value,
        poderes: Array.from(document.querySelectorAll('[name="poderes"]:checked')).map(el => el.value),
        livro: 'A',
        folha: '001',
        cidade: 'São Paulo/SP',
        data: new Date().toLocaleDateString('pt-BR')
    };

    const rendered = Mustache.render(templates[templateId].content, data);
    localStorage.setItem('currentDoc', rendered);
    window.location.href = 'preview.html';
}

// Templates
const templates = {
    divorce: {
        title: "Petição Inicial - Divórcio Consensual",
        content: `
            <h2>Excelentíssimo Senhor Doutor Juiz de Direito da __ Vara da Família da Comarca de __</h2>
            
            <p>{{CLIENT_NAME}}, brasileiro(a), portador(a) do CPF {{CLIENT_CPF}}, vem respeitosamente à presença de Vossa Excelência propor a presente</p>
            
            <div class="clause">
                <h3>DO OBJETO</h3>
                <p>Divórcio consensual conforme acordo entre as partes...</p>
            </div>
        `
    }
};

function generateDocument() {
    // Coletar dados do formulário
    const docData = {
        clientName: document.getElementById('client-name').value,
        clientCPF: document.getElementById('client-cpf').value,
        lawyerOAB: document.getElementById('lawyer-oab').value
    };

    // Gerar conteúdo
    let content = templates.divorce.content
        .replace('{{CLIENT_NAME}}', docData.clientName)
        .replace('{{CLIENT_CPF}}', docData.clientCPF);

    // Salvar para preview
    localStorage.setItem('currentDoc', content);
    window.location.href = 'preview.html';
}

// Na preview.html
window.onload = function() {
    const content = localStorage.getItem('currentDoc');
    document.getElementById('preview-content').innerHTML = content;
    document.getElementById('watermark').textContent = `OAB: ${localStorage.getItem('lawyerOAB')}`;
}

function exportPDF() {
    const doc = new jspdf.jsPDF();
    const content = document.getElementById('preview-content').innerText;
    doc.text(content, 10, 10);
    doc.save('documento.pdf');
}
