document.getElementById('gerarPdfBtn').addEventListener('click', gerarPDF);

async function gerarPDF() {
    const { PDFDocument } = PDFLib;
    const timbradoInput = document.getElementById('timbrado');
    const timbradoFile = timbradoInput.files[0];

    let pdfDoc;
    
    // Cria um novo PDF ou carrega o timbrado
    if (timbradoFile) {
        const arrayBuffer = await timbradoFile.arrayBuffer();
        pdfDoc = await PDFDocument.load(arrayBuffer);
    } else {
        pdfDoc = await PDFDocument.create();
        pdfDoc.addPage([595.28, 841.89]); // Tamanho A4 padrão
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

    // Processar os dados do formulário
    const formData = {
        remetente: document.getElementById('remetente').value,
        destinatario: document.getElementById('destinatario').value,
        assunto: document.getElementById('assunto').value,
        conteudo: document.getElementById('conteudo').value
    };

    // Função para quebrar texto em linhas que cabem na largura da página
    function wrapText(text, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = font.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
            if (width <= maxWidth) {
                currentLine += ` ${word}`;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    // Função para adicionar texto com paginação automática
    async function addTextWithPagination(text, startY, page) {
        const maxWidth = page.getWidth() - margin.left - margin.right;
        const paragraphs = text.split('\n');
        let y = startY;

        for (const paragraph of paragraphs) {
            const lines = wrapText(paragraph, maxWidth);
            for (const line of lines) {
                if (y < margin.bottom) {
                    // Adiciona nova página
                    const newPage = pdfDoc.addPage([595.28, 841.89]);
                    y = newPage.getHeight() - margin.top;
                    page = newPage;
                }
                page.drawText(line, { x: margin.left, y, size: fontSize, font });
                y -= lineHeight;
            }
        }
        return y; // Retorna a última posição Y
    }

    // Processar cada campo
    let currentPage = pdfDoc.getPages()[0];
    let yPosition = currentPage.getHeight() - margin.top;

    // Remetente
    currentPage.drawText(formData.remetente, { x: margin.left, y: yPosition, size: fontSize, font });
    yPosition -= lineHeight * 2;

    // Destinatário
    currentPage.drawText(formData.destinatario, { x: margin.left, y: yPosition, size: fontSize, font });
    yPosition -= lineHeight * 2;

    // Assunto
    currentPage.drawText(formData.assunto, { x: margin.left, y: yPosition, size: fontSize, font });
    yPosition -= lineHeight * 2;

    // Conteúdo (com quebra de linha e paginação)
    yPosition = await addTextWithPagination(formData.conteudo, yPosition, currentPage);

    // Salvar e baixar o PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'documento_gerado.pdf';
    link.click();
}