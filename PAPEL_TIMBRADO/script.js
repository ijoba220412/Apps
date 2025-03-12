document.getElementById('gerarPdfBtn').addEventListener('click', gerarPDF);

async function gerarPDF() {
    const { PDFDocument, rgb } = PDFLib;
    const timbradoInput = document.getElementById('timbrado');
    const timbradoFile = timbradoInput.files[0];

    // Cria um novo PDF
    const pdfDoc = await PDFDocument.create();
    let templateDoc = null;

    // Carrega o timbrado (se existir)
    if (timbradoFile) {
        const timbradoBuffer = await timbradoFile.arrayBuffer();
        templateDoc = await PDFDocument.load(timbradoBuffer);
    }

    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

    // Configurações de layout
    const margin = { 
        top: 150,    // Distância do topo para campos fixos
        bodyTop: 250, // Início do conteúdo após campos fixos
        bottom: 100,
        left: 100,
        right: 100 
    };
    
    const fontSize = 12;
    const lineHeight = font.heightAtSize(fontSize) + 2; // Altura exata da fonte

    // Dados do formulário
    const formData = {
        remetente: document.getElementById('remetente').value,
        destinatario: document.getElementById('destinatario').value,
        assunto: document.getElementById('assunto').value,
        conteudo: document.getElementById('conteudo').value
    };

    // Função para criar nova página com template
    async function addNewPage() {
        if (templateDoc) {
            const [templatePage] = await pdfDoc.copyPages(templateDoc, [0]);
            return pdfDoc.addPage(templatePage);
        } else {
            return pdfDoc.addPage([595.28, 841.89]); // Tamanho A4
        }
    }

    // Função para quebrar texto em linhas
    function wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        let currentWidth = 0;

        for (const word of words) {
            const wordWidth = font.widthOfTextAtSize(word, fontSize);
            const spaceWidth = font.widthOfTextAtSize(' ', fontSize);

            if (currentWidth + wordWidth + (currentLine ? spaceWidth : 0) > maxWidth) {
                lines.push(currentLine);
                currentLine = '';
                currentWidth = 0;
            }

            currentLine += (currentLine ? ' ' : '') + word;
            currentWidth += wordWidth + (currentLine ? spaceWidth : 0);
        }

        lines.push(currentLine);
        return lines;
    }

    // Função principal para adicionar conteúdo
    async function addContent(text, startPage) {
        let currentPage = startPage;
        let y = currentPage.getHeight() - margin.bodyTop; // Começa abaixo dos campos fixos
        const maxWidth = currentPage.getWidth() - margin.left - margin.right;

        const paragraphs = text.split('\n');
        for (const paragraph of paragraphs) {
            const lines = wrapText(paragraph, maxWidth);

            for (const line of lines) {
                // Verifica se precisa de nova página
                if (y < margin.bottom) {
                    currentPage = await addNewPage();
                    y = currentPage.getHeight() - margin.bodyTop; // Reinicia posição Y
                }

                // Desenha a linha
                currentPage.drawText(line, {
                    x: margin.left,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0, 0, 0)
                });

                y -= lineHeight; // Atualiza posição Y
            }
        }
    }

    // Processamento principal
    try {
        // Primeira página
        let currentPage = await addNewPage();

        // Campos fixos (apenas na primeira página)
        currentPage.drawText(formData.remetente, {
            x: margin.left,
            y: currentPage.getHeight() - margin.top,
            size: fontSize,
            font
        });

        currentPage.drawText(formData.destinatario, {
            x: margin.left,
            y: currentPage.getHeight() - margin.top - 40,
            size: fontSize,
            font
        });

        currentPage.drawText(formData.assunto, {
            x: margin.left,
            y: currentPage.getHeight() - margin.top - 80,
            size: fontSize,
            font
        });

        // Adiciona conteúdo principal
        await addContent(formData.conteudo, currentPage);

        // Finaliza e baixa o PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'documento_final.pdf';
        link.click();

    } catch (error) {
        alert('Erro ao gerar PDF: ' + error.message);
    }
}