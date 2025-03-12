document.getElementById('gerarPdfBtn').addEventListener('click', gerarPDF);

async function gerarPDF() {
    const { PDFDocument } = PDFLib;
    const timbradoInput = document.getElementById('timbrado');
    const timbradoFile = timbradoInput.files[0];

    let pdfDoc = await PDFDocument.create();
    let templatePages = [];

    // Carrega o papel timbrado (se existir)
    if (timbradoFile) {
        const timbradoBuffer = await timbradoFile.arrayBuffer();
        const timbradoDoc = await PDFDocument.load(timbradoBuffer);
        // Copia TODAS as páginas do timbrado (para casos de templates multi-página)
        templatePages = await pdfDoc.copyPages(timbradoDoc, timbradoDoc.getPageIndices());
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

    // Função para quebrar texto em linhas justificadas
    function justifyText(text, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = [];
        let currentWidth = 0;

        for (const word of words) {
            const wordWidth = font.widthOfTextAtSize(word, fontSize);
            const spaceWidth = font.widthOfTextAtSize(' ', fontSize);

            if (currentWidth + wordWidth + (currentLine.length * spaceWidth) > maxWidth) {
                lines.push(currentLine);
                currentLine = [word];
                currentWidth = wordWidth;
            } else {
                currentLine.push(word);
                currentWidth += wordWidth + spaceWidth;
            }
        }

        lines.push(currentLine);
        return lines.map(line => ({
            words: line,
            width: line.reduce((acc, word) => acc + font.widthOfTextAtSize(word, fontSize), 0)
        }));
    }

    // Função para adicionar texto com paginação
    async function addText(text, startPage, startY) {
        let currentPage = startPage;
        let y = startY;
        const maxWidth = currentPage.getWidth() - margin.left - margin.right;

        const paragraphs = text.split('\n');
        for (const paragraph of paragraphs) {
            const lines = justifyText(paragraph, maxWidth);

            for (const line of lines) {
                if (y < margin.bottom) {
                    // Adiciona nova página (com timbrado ou branca)
                    currentPage = templatePages.length > 0 
                        ? pdfDoc.addPage(templatePages[0]) // Usa a primeira página do timbrado
                        : pdfDoc.addPage([595.28, 841.89]);
                    y = currentPage.getHeight() - margin.top;
                }

                const spaceCount = line.words.length - 1;
                const totalSpaceWidth = maxWidth - line.width;
                const spaceWidth = spaceCount > 0 ? totalSpaceWidth / spaceCount : 0;

                let x = margin.left;
                for (let i = 0; i < line.words.length; i++) {
                    currentPage.drawText(line.words[i], { x, y, size: fontSize, font });
                    x += font.widthOfTextAtSize(line.words[i], fontSize) + (i < spaceCount ? spaceWidth : 0);
                }

                y -= lineHeight;
            }
        }
    }

    // Adiciona a primeira página (timbrado ou branca)
    const firstPage = templatePages.length > 0 
        ? pdfDoc.addPage(templatePages[0]) 
        : pdfDoc.addPage([595.28, 841.89]);

    // Campos fixos (apenas na primeira página)
    firstPage.drawText(formData.remetente, { x: margin.left, y: firstPage.getHeight() - margin.top, size: fontSize, font });
    firstPage.drawText(formData.destinatario, { x: margin.left, y: firstPage.getHeight() - margin.top - lineHeight * 2, size: fontSize, font });
    firstPage.drawText(formData.assunto, { x: margin.left, y: firstPage.getHeight() - margin.top - lineHeight * 4, size: fontSize, font });

    // Conteúdo justificado (começa após os campos fixos)
    await addText(
        formData.conteudo, 
        firstPage, 
        firstPage.getHeight() - margin.top - lineHeight * 6
    );

    // Finaliza e baixa o PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'documento_gerado.pdf';
    link.click();
}