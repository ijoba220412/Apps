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
        const page = pdfDoc.addPage([595.28, 841.89]); // Tamanho A4
    }

    pdfDoc.registerFontkit(fontkit);
    const page = pdfDoc.getPages()[0];

    // Coleta dados do formulário
    const formData = {
        remetente: document.getElementById('remetente').value,
        destinatario: document.getElementById('destinatario').value,
        assunto: document.getElementById('assunto').value,
        conteudo: document.getElementById('conteudo').value
    };

    // Adiciona texto ao PDF
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    
    // Coordenadas (ajuste conforme necessário)
    page.drawText(formData.remetente, { x: 100, y: 700, size: 12, font });
    page.drawText(formData.destinatario, { x: 100, y: 650, size: 12, font });
    page.drawText(formData.assunto, { x: 100, y: 600, size: 12, font });

    // Conteúdo com quebras de linha
    const lines = formData.conteudo.split('\n');
    let yPosition = 550;
    lines.forEach(line => {
        page.drawText(line, { x: 100, y: yPosition, size: 12, font });
        yPosition -= 20;
    });

    // Gera e baixa o PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'documento_gerado.pdf';
    link.click();
}
