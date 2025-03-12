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

    // Configurações
    const margin = { top: 150, bottom: 100, left: 100, right: 100 };
    const fontSize = 12;
    const lineHeight = 20;

    // Dados do formulário
    const formData = {
        remetente: document.getElementById('remetente').value,
        destinatario: document.getElementById('destinatario').value,
        assunto: document.getElementById('assunto').value,
        conteudo: document.getElementById('conteudo').value
    };

    // Função para criar uma nova página (com ou sem timbrado)
    async function addNewPage() {
        if (templateDoc) {
            const [templatePage] = await pdfDoc.copyPages(templateDoc, [0]);
            return pdfDoc.addPage(templatePage);
        } else {
            return pdfDoc.addPage([595.28, 841.89]); // A4
        }
    }

    // Função para justificar texto
    function justifyText(text, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = [];
        let currentWidth = 0;

        for (const word of words) {
            const wordWidth = font.widthOfTextAtSize(word, fontSize);
            const spaceWidth = font.widthOfTextAtSize(' ', fontSize);

            if (currentLine.length > 0 && (currentWidth + wordWidth + spaceWidth > maxWidth)) {
                lines.push(currentLine);
                currentLine = [];
                currentWidth = 0;
            }

            currentLine.push(word);
            currentWidth += wordWidth + (currentLine.length > 1 ? spaceWidth : 0);
        }

        if (currentLine.length > 0) lines.push(currentLine);
        return lines;
    }

    // Função para adicionar texto com controle de páginas
    async function addContent(text, startPage) {
        let currentPage = startPage;
        let y = currentPage.getHeight() - margin.top;
        const maxWidth = currentPage.getWidth() - margin.left - margin.right;

        const paragraphs = text.split('\n');
        for (const paragraph of paragraphs) {
            const lines = justifyText(paragraph, maxWidth);

            for (const line of lines) {
                // Verifica se precisa de nova página
                if (y < margin.bottom) {
                    currentPage = await addNewPage();
                    y = currentPage.getHeight() - margin.top;
                }

                // Calcula espaçamento para justificar
                const textWidth = font.widthOfTextAtSize(line.join(' '), fontSize);
                const spaceCount = line.length - 1;
                const spaceWidth = spaceCount > 0 ? (maxWidth - textWidth) / spaceCount : 0;

                // Desenha cada palavra
                let x = margin.left;
                for (const [index, word] of line.entries()) {
                    currentPage.drawText(word, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
                    x += font.widthOfTextAtSize(word, fontSize) + (index < spaceCount ? spaceWidth : 0);
                }

                y -= lineHeight;
            }
        }
    }

    // Processamento principal
    try {
        // Adiciona primeira página
        let currentPage = await addNewPage();

        // Campos fixos (só na primeira página)
        currentPage.drawText(formData.remetente, { x: margin.left, y: currentPage.getHeight() - margin.top, size: fontSize, font });
        currentPage.drawText(formData.destinatario, { x: margin.left, y: currentPage.getHeight() - margin.top - 40, size: fontSize, font });
        currentPage.drawText(formData.assunto, { x: margin.left, y: currentPage.getHeight() - margin.top - 80, size: fontSize, font });

        // Adiciona conteúdo (começa abaixo dos campos fixos)
        await addContent(formData.conteudo, currentPage);

        // Baixa o PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'documento_gerado.pdf';
        link.click();

    } catch (error) {
        alert('Erro ao gerar PDF: ' + error.message);
    }
}