// templates.js - Armazena os modelos de documentos

const templates = {
    "inicial_trab": {
        "name": "Reclamação Trabalhista Inicial",
        "content": `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DO TRABALHO DA {{VARA_TRABALHO}} VARA DO TRABALHO DE {{CIDADE_UF}}

{{RECLAMANTE_NOME}}, {{RECLAMANTE_NACIONALIDADE}}, {{RECLAMANTE_ESTADO_CIVIL}}, {{RECLAMANTE_PROFISSAO}}, portador do RG nº {{RECLAMANTE_RG}}, CPF nº {{RECLAMANTE_CPF}}, CTPS nº {{RECLAMANTE_CTPS}}, PIS nº {{RECLAMANTE_PIS}}, nascido(a) em {{RECLAMANTE_DATA_NASC}}, filho(a) de {{RECLAMANTE_MAE}}, residente e domiciliado(a) em {{RECLAMANTE_ENDERECO}}, por seu advogado infra-assinado, conforme procuração em anexo, vem, respeitosamente, propor a presente

RECLAMAÇÃO TRABALHISTA

em face de {{RECLAMADA_NOME}}, pessoa jurídica de direito privado, inscrita no CNPJ nº {{RECLAMADA_CNPJ}}, com sede em {{RECLAMADA_ENDERECO}}, pelos fatos e fundamentos a seguir expostos:

1. DOS FATOS

O Reclamante foi admitido pela Reclamada em {{DATA_ADMISSAO}} para exercer a função de {{RECLAMANTE_CARGO}}, percebendo como última remuneração o valor de R$ {{RECLAMANTE_SALARIO}}. Seu contrato foi rescindido em {{DATA_RESCISAO}}, sob a alegação de {{TIPO_RESCISAO}}.

Entretanto, a Reclamada não pagou corretamente as verbas rescisórias, deixando de quitar {{VERBAS_NAO_PAGAS}}. Além disso, {{OUTRAS_IRREGULARIDADES}}.

Diante disso, o Reclamante não teve outra alternativa senão buscar a tutela jurisdicional para garantir seus direitos.

2. DO DIREITO

2.1. Do Não Pagamento das Verbas Rescisórias

Conforme os artigos 477 e 478 da CLT, o empregador deve pagar as verbas rescisórias no prazo de 10 dias, sob pena de multa. No caso em tela, a Reclamada não efetuou corretamente os pagamentos devidos, sendo cabível a condenação ao pagamento integral das verbas rescisórias, acrescidas das multas legais.

2.2. Do Aviso Prévio

Nos termos do artigo 487 da CLT, o aviso prévio deve ser concedido ao empregado em caso de dispensa sem justa causa. No entanto, a Reclamada não concedeu o aviso prévio, devendo ser condenada ao pagamento da indenização correspondente.

2.3. Do Fundo de Garantia por Tempo de Serviço (FGTS) e Multa de 40%

O Reclamante não teve os depósitos do FGTS realizados corretamente ao longo do contrato. Nos termos do artigo 18, §1º, da Lei nº 8.036/1990, a Reclamada deve ser condenada a regularizar os depósitos e a pagar a multa de 40% sobre o saldo do FGTS.

2.4. Do Dano Moral (se aplicável)

Caso tenha havido assédio moral, atraso de salários ou outras condutas abusivas, é possível pleitear indenização por dano moral, conforme os artigos 186 e 927 do Código Civil.

3. DOS PEDIDOS

Diante dos fatos e fundamentos expostos, requer:

a) O reconhecimento da rescisão contratual e a condenação da Reclamada ao pagamento das seguintes verbas:
- Saldo de salário (R$ {{VALOR_SALDO_SALARIO}});
- Férias proporcionais + 1/3 (R$ {{VALOR_FERIAS}});
- 13º salário proporcional (R$ {{VALOR_13_SALARIO}});
- Aviso prévio indenizado (R$ {{VALOR_AVISO_PREVIO}});
- Multa do artigo 477 da CLT (R$ {{VALOR_MULTA_477}});
- Multa do FGTS – 40% (R$ {{VALOR_MULTA_FGTS}});

b) A regularização dos depósitos do FGTS e a liberação do saldo para saque;

c) O pagamento de indenização por danos morais no valor de R$ {{VALOR_DANO_MORAL}} (se aplicável);

d) A condenação da Reclamada ao pagamento de honorários advocatícios, nos termos do artigo 791-A da CLT;

e) A aplicação de juros e correção monetária sobre todas as verbas devidas.

4. DOS REQUERIMENTOS

Diante do exposto, requer:

- A citação da Reclamada para apresentar defesa, sob pena de revelia;
- A produção de todas as provas admitidas em direito, em especial testemunhal e documental;
- A realização de audiência conciliatória, nos termos do artigo 764 da CLT;
- A procedência dos pedidos, condenando a Reclamada ao pagamento das verbas trabalhistas indicadas.

Dá-se à causa o valor de R$ {{VALOR_CAUSA}}, para os efeitos legais.

Termos em que,  
Pede deferimento.

{{CIDADE_DATA}}

____________________________________________  
{{ADVOGADO_NOME}}  
OAB/{{ADVOGADO_UF}} nº {{ADVOGADO_OAB}}`,
        "fields": [
            // Dados do processo
            { "id": "VARA_TRABALHO", "label": "Vara do Trabalho", "type": "text" },
            { "id": "CIDADE_UF", "label": "Cidade/UF", "type": "text" },
            { "id": "VALOR_CAUSA", "label": "Valor da Causa", "type": "text" },
            
            // Dados do reclamante
            { "id": "RECLAMANTE_NOME", "label": "Nome do Reclamante", "type": "text" },
            { "id": "RECLAMANTE_NACIONALIDADE", "label": "Nacionalidade", "type": "text" },
            { "id": "RECLAMANTE_ESTADO_CIVIL", "label": "Estado Civil", "type": "select", "options": ["solteiro(a)", "casado(a)", "divorciado(a)", "viúvo(a)", "união estável"] },
            { "id": "RECLAMANTE_PROFISSAO", "label": "Profissão", "type": "text" },
            { "id": "RECLAMANTE_RG", "label": "RG", "type": "text" },
            { "id": "RECLAMANTE_CPF", "label": "CPF", "type": "text" },
            { "id": "RECLAMANTE_CTPS", "label": "CTPS", "type": "text" },
            { "id": "RECLAMANTE_PIS", "label": "PIS", "type": "text" },
            { "id": "RECLAMANTE_DATA_NASC", "label": "Data de Nascimento", "type": "date" },
            { "id": "RECLAMANTE_MAE", "label": "Nome da Mãe", "type": "text" },
            { "id": "RECLAMANTE_ENDERECO", "label": "Endereço Completo", "type": "textarea" },
            { "id": "RECLAMANTE_CARGO", "label": "Cargo/Função", "type": "text" },
            { "id": "RECLAMANTE_SALARIO", "label": "Último Salário", "type": "text" },
            
            // Dados da reclamada
            { "id": "RECLAMADA_NOME", "label": "Nome da Empresa Reclamada", "type": "text" },
            { "id": "RECLAMADA_CNPJ", "label": "CNPJ da Reclamada", "type": "text" },
            { "id": "RECLAMADA_ENDERECO", "label": "Endereço da Reclamada", "type": "textarea" },
            
            // Dados do contrato
            { "id": "DATA_ADMISSAO", "label": "Data de Admissão", "type": "date" },
            { "id": "DATA_RESCISAO", "label": "Data de Rescisão", "type": "date" },
            { "id": "TIPO_RESCISAO", "label": "Tipo de Rescisão", "type": "select", "options": ["dispensa sem justa causa", "dispensa por justa causa", "pedido de demissão", "comum acordo", "término de contrato"] },
            
            // Detalhes da reclamação
            { "id": "VERBAS_NAO_PAGAS", "label": "Verbas Não Pagas", "type": "textarea" },
            { "id": "OUTRAS_IRREGULARIDADES", "label": "Outras Irregularidades", "type": "textarea" },
            
            // Valores pleiteados
            { "id": "VALOR_SALDO_SALARIO", "label": "Valor do Saldo de Salário", "type": "text" },
            { "id": "VALOR_FERIAS", "label": "Valor das Férias Proporcionais", "type": "text" },
            { "id": "VALOR_13_SALARIO", "label": "Valor do 13º Salário", "type": "text" },
            { "id": "VALOR_AVISO_PREVIO", "label": "Valor do Aviso Prévio", "type": "text" },
            { "id": "VALOR_MULTA_477", "label": "Valor da Multa do Art. 477", "type": "text" },
            { "id": "VALOR_MULTA_FGTS", "label": "Valor da Multa do FGTS", "type": "text" },
            { "id": "VALOR_DANO_MORAL", "label": "Valor do Dano Moral", "type": "text" },
            
            // Dados do advogado
            { "id": "CIDADE_DATA", "label": "Cidade e Data", "type": "text", "placeholder": "Rio de Janeiro, 12 de março de 2025" },
            { "id": "ADVOGADO_NOME", "label": "Nome do Advogado", "type": "text" },
            { "id": "ADVOGADO_UF", "label": "UF da OAB", "type": "text" },
            { "id": "ADVOGADO_OAB", "label": "Número da OAB", "type": "text" }
        ]
    },
    // Você pode adicionar mais modelos aqui


    // Aqui inicia o template da procuração 
    
    "procuracao": {
        "name": "Procuração",
        "content": `PROCURAÇÃO AD JUDICIA E EXTRAJUDICIA

OUTORGANTE:

{{RECLAMANTE_NOME}}, {{RECLAMANTE_NACIONALIDADE}}, {{RECLAMANTE_ESTADO_CIVIL}}, {{RECLAMANTE_PROFISSAO}}, portador do RG nº {{RECLAMANTE_RG}}, inscrito no CPF sob o nº {{RECLAMANTE_CPF}}, residente e domiciliado em {{RECLAMANTE_ENDERECO}}.

OUTORGADO:

{{ADVOGADO_NOME}}, {{ADVOGADO_NACIONALIDADE}}, {{ADVOGADO_ESTADO_CIVIL}}, advogado regularmente inscrito na Ordem dos Advogados do Brasil, Seccional {{ADVOGADO_UF}}, sob o nº {{ADVOGADO_OAB}}, com endereço profissional em {{ADVOGADO_ENDERECO}}.

Por meio do presente instrumento particular de procuração, o OUTORGANTE nomeia e constitui como seu bastante procurador o OUTORGADO, conferindo-lhe plenos poderes para representá-lo(a), ativa e passivamente, em juízo e fora dele, perante quaisquer repartições públicas, autarquias, empresas privadas, bancos, órgãos administrativos e judiciais, de qualquer instância ou jurisdição, podendo, para tanto, praticar todos os atos necessários à defesa de seus interesses, incluindo, mas não se limitando a:

1. Poderes gerais:

{{PODERES_GERAIS}} ! provavelmente ele escrevera um texto antes e depois deste  comunicado ! Propor, acompanhar e interpor ações, defesas, recursos, exceções, contestações, impugnações, alegações finais, memoriais, razões e contrarrazões em qualquer instância judicial ou administrativa.</textarea>  
2. Poderes específicos:

<textarea>Firmar compromissos, assinar petições, receber citações e intimações, transigir, desistir, reconhecer pedidos, firmar acordos, levantar valores e dar quitação, requerer certidões e documentos, praticando todos os atos inerentes ao fiel cumprimento deste mandato.</textarea>  
3. Poderes especiais:

<textarea>Receber valores, assinar recibos e dar quitação, firmar contratos, solicitar restituições, propor ações de qualquer natureza, representá-lo(a) perante órgãos públicos e privados, ingressar com ações revisionais, execuções, inventários, separações e divórcios, bem como renunciar a direitos e impetrar habeas corpus e mandado de segurança.</textarea>  
4. Poder de substabelecer:

<textarea>Com ou sem reserva de poderes, no todo ou em parte, a terceiros, para os fins que se fizerem necessários.</textarea>  

Esta procuração é concedida em caráter irrevogável e irretratável, salvo manifestação expressa em contrário pelo OUTORGANTE, e terá validade até a conclusão dos atos para os quais foi concedida ou até sua revogação expressa.

{{CIDADE_DATA}}

____________________________________________
{{RECLAMANTE_NOME}}`,
        "fields": [
        // Dados do Outorgante
        { "id": "RECLAMANTE_NOME", "label": "Nome Completo do Outorgante", "type": "text" },
        { "id": "RECLAMANTE_NACIONALIDADE", "label": "Nacionalidade", "type": "text" },
        { "id": "RECLAMANTE_ESTADO_CIVIL", "label": "Estado Civil", "type": "select", "options": ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"] },
        { "id": "RECLAMANTE_PROFISSAO", "label": "Profissão", "type": "text" },
        { "id": "RECLAMANTE_RG", "label": "RG", "type": "text" },
        { "id": "RECLAMANTE_CPF", "label": "CPF", "type": "text" },
        { "id": "RECLAMANTE_ENDERECO", "label": "Endereço Completo", "type": "textarea" },

        // Dados do Outorgado (Advogado)
        { "id": "ADVOGADO_NOME", "label": "Nome Completo do Advogado", "type": "text" },
        { "id": "ADVOGADO_NACIONALIDADE", "label": "Nacionalidade", "type": "text" },
        { "id": "ADVOGADO_ESTADO_CIVIL", "label": "Estado Civil", "type": "select", "options": ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"] },
        { "id": "ADVOGADO_OAB", "label": "Número da OAB", "type": "text" },
        { "id": "ADVOGADO_UF", "label": "Seccional da OAB (UF)", "type": "text" },
        { "id": "ADVOGADO_ENDERECO", "label": "Endereço Profissional Completo", "type": "textarea" },

        // Poderes
        { "id": "CIDADE_DATA", "label": "Cidade e Data", "type": "text", "placeholder": "Rio de Janeiro, 12 de março de 2025" },    
        { "id": "PODERES_GERAIS", "label": "Poderes Gerais", "type": "textarea", "default": "Propor, acompanhar e interpor ações, defesas, recursos, exceções, contestações, impugnações, alegações finais, memoriais, razões e contrarrazões em qualquer instância judicial ou administrativa." },
        { "id": "PODERES_ESPECIFICOS", "label": "Poderes Específicos", "type": "textarea", "default": "Firmar compromissos, assinar petições, receber citações e intimações, transigir, desistir, reconhecer pedidos, firmar acordos, levantar valores e dar quitação, requerer certidões e documentos, praticando todos os atos inerentes ao fiel cumprimento deste mandato." },
        { "id": "PODERES_ESPECIAIS", "label": "Poderes Especiais", "type": "textarea", "default": "Receber valores, assinar recibos e dar quitação, firmar contratos, solicitar restituições, propor ações de qualquer natureza, representá-lo(a) perante órgãos públicos e privados, ingressar com ações revisionais, execuções, inventários, separações e divórcios, bem como renunciar a direitos e impetrar habeas corpus e mandado de segurança." },
        { "id": "PODER_SUBSTABELECER", "label": "Poder de Substabelecer", "type": "textarea", "default": "Com ou sem reserva de poderes, no todo ou em parte, a terceiros, para os fins que se fizerem necessários." }

         
        ]
    }
};

// Exporta os templates para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = templates;
}
