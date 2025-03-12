document.getElementById('gerarPdfBtn').addEventListener('click', gerarPDF);

async function gerarPDF() {
    const { PDFDocument } = PDFLib;
    const timbradoInput = document.getElementById('timbrado');
    const timbradoFile = timbradoInput.files[0];

    let pdfDoc;
    let templatePage = null;

    // Carrega o timbrado ou cria PDF em branco
    if (timbradoFile) {
        const arrayBuffer = await timbradoFile.arrayBuffer();
        const timbradoDoc = await PDFDocument.load(arrayBuffer);
        pdfDoc = await PDFDocument.create();
        [templatePage] = await pdfDoc.copyPages(timbradoDoc, [0]); // Copia a primeira página do timbrado
    } else {
        pdfDoc = await PDFDocument.create();
    }

    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

    // Configurações de layout
    const margin = {
        top: 100,
        bottom: 100,
        left: 100,
        right: 100
    };
    const lineHeight = 20;
    const fontSize = 12;

    // Dados do formulário
    const formData = {
        remetente: document.getElementById('remetente').value,
        destinatario: document.getElementById('destinatario').value,
        assunto: document.getElementById('assunto').value,
        conteudo: document.getElementById('conteudo').value
    };

    // Função para justificar texto
    function justifyText(text, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = [words[0]];
        let currentWidth = font.widthOfTextAtSize(words[0], fontSize);

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const wordWidth = font.widthOfTextAtSize(` ${word}`, fontSize);
            
            if (currentWidth + wordWidth <= maxWidth) {
                currentLine.push(word);
                currentWidth += wordWidth;
            } else {
                lines.push(currentLine);
                currentLine = [word];
                currentWidth = font.widthOfTextAtSize(word, fontSize);
            }
        }
        lines.push(currentLine);
        return lines.map(line => ({
            text: line,
            width: font.widthOfTextAtSize(line.join(' '), fontSize)
        }));
    }

    // Função para adicionar texto com paginação e justificação
    async function addTextWithPagination(text, startY) {
        const maxWidth = templatePage 
            ? templatePage.getWidth() - margin.left - margin.right 
            : 595.28 - margin.left - margin.right;

        const paragraphs = text.split('\n');
        let currentPage = templatePage ? pdfDoc.addPage(templatePage) : pdfDoc.addPage([595.28, 841.89]);
        let y = startY;

        for (const paragraph of paragraphs) {
            const lines = justifyText(paragraph, maxWidth);
            
            for (const line of lines) {
                if (y < margin.bottom) {
                    // Adiciona nova página com timbrado
                    currentPage = templatePage 
                        ? pdfDoc.addPage(templatePage) 
                        : pdfDoc.addPage([595.28, 841.89]);
                    y = currentPage.getHeight() - margin.top;
                }

                // Calcula espaçamento para justificar
                const spaceWidth = (maxWidth - line.width) / (line.text.length - 1 || 1);
                let x = margin.left;

                for (const [index, word] of line.text.entries()) {
                    currentPage.drawText(word, { x, y, size: fontSize, font });
                    x += font.widthOfTextAtSize(word, fontSize) + spaceWidth;
                }

                y -= lineHeight;
            }
        }
    }

    // Adiciona dados às páginas
    let currentPage = templatePage || pdfDoc.addPage([595.28, 841.89]);
    let yPosition = currentPage.getHeight() - margin.top;

    // Campos fixos
    currentPage.drawText(formData.remetente, { x: margin.left, y: yPosition, size: fontSize, font });
    yPosition -= lineHeight * 2;
    currentPage.drawText(formData.destinatario, { x: margin.left, y: yPosition, size: fontSize, font });
    yPosition -= lineHeight * 2;
    currentPage.drawText(formData.assunto, { x: margin.left, y: yPosition, size: fontSize, font });
    yPosition -= lineHeight * 2;

    // Conteúdo justificado
    await addTextWithPagination(formData.conteudo, yPosition);

    // Finaliza e baixa o PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'documento_gerado.pdf';
    link.click();
}