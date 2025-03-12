document.getElementById('gerarPdfBtn').addEventListener('click', gerarPDF);

async function gerarPDF() {
    const { PDFDocument } = PDFLib;
    const timbradoInput = document.getElementById('timbrado');
    const timbradoFile = timbradoInput.files[0];

    let pdfDoc = await PDFDocument.create();
    let templatePage = null;

    // Carrega o timbrado (se existir)
    if (timbradoFile) {
        const timbradoDoc = await PDFDocument.load(await timbradoFile.arrayBuffer());
        [templatePage] = await pdfDoc.copyPages(timbradoDoc, [0]); // Copia a primeira página do timbrado
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

    // Função para justificar texto (exceto última linha do parágrafo)
    function justifyText(text, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = [];
        let currentWidth = 0;

        for (const word of words) {
            const wordWidth = font.widthOfTextAtSize(word, fontSize);
            const spaceWidth = currentLine.length > 0 ? font.widthOfTextAtSize(' ', fontSize) : 0;

            if (currentWidth + spaceWidth + wordWidth <= maxWidth) {
                currentLine.push(word);
                currentWidth += wordWidth + spaceWidth;
            } else {
                lines.push(currentLine);
                currentLine = [word];
                currentWidth = wordWidth;
            }
        }
        lines.push(currentLine); // Última linha do parágrafo
        return lines;
    }

    // Função para adicionar páginas com timbrado
    function addNewPage() {
        if (templatePage) {
            return pdfDoc.addPage(templatePage);
        } else {
            return pdfDoc.addPage([595.28, 841.89]); // Tamanho A4
        }
    }

    // Adiciona cabeçalho (remetente, destinatário, assunto)
    let currentPage = addNewPage();
    let yPosition = currentPage.getHeight() - margin.top;

    currentPage.drawText(formData.remetente, { x: margin.left, y: yPosition, size: fontSize, font });
    yPosition -= lineHeight * 2;
    currentPage.drawText(formData.destinatario, { x: margin.left, y: yPosition, size: fontSize, font });
    yPosition -= lineHeight * 2;
    currentPage.drawText(formData.assunto, { x: margin.left, y: yPosition, size: fontSize, font });
    yPosition -= lineHeight * 3; // Espaço antes do conteúdo

    // Processa o conteúdo com quebra de páginas
    const paragraphs = formData.conteudo.split('\n');
    const maxWidth = templatePage 
        ? templatePage.getWidth() - margin.left - margin.right 
        : 595.28 - margin.left - margin.right;

    for (const paragraph of paragraphs) {
        const lines = justifyText(paragraph, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isLastLine = i === lines.length - 1;

            // Quebra de página se necessário
            if (yPosition < margin.bottom) {
                currentPage = addNewPage();
                yPosition = currentPage.getHeight() - margin.top;
            }

            // Largura do texto e espaçamento
            const text = line.join(' ');
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            
            // Justifica apenas se não for a última linha e tiver mais de uma palavra
            if (!isLastLine && line.length > 1) {
                const spaceWidth = (maxWidth - textWidth) / (line.length - 1);
                let x = margin.left;
                
                for (const [index, word] of line.entries()) {
                    currentPage.drawText(word, { x, y: yPosition, size: fontSize, font });
                    x += font.widthOfTextAtSize(word, fontSize) + spaceWidth;
                }
            } else {
                // Alinha à esquerda para última linha ou palavras únicas
                currentPage.drawText(text, { x: margin.left, y: yPosition, size: fontSize, font });
            }

            yPosition -= lineHeight;
        }
    }

    // Finaliza e baixa o PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'documento_gerado.pdf';
    link.click();
}