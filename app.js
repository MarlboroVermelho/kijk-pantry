const VERSAO = "2.2";

const CHAVE_LISTA = "kijkPantryLista";
const CHAVE_PRODUTOS = "kijkPantryProdutos";
const CHAVE_HISTORICO = "kijkPantryHistorico";

let itens = [];
let produtos = [];
let historico = [];

let scanner = null;
let scannerAtivo = false;
let leituraEmAndamento = false;

let timerToast = null;


// ==================================================
// INICIALIZAÇÃO
// ==================================================

document.addEventListener("DOMContentLoaded", () => {

    carregarDados();

    atualizarLista();
    atualizarProdutos();
    atualizarHistorico();
    atualizarResumo();
    atualizarPrevisoes();

    configurarEventos();
});


// ==================================================
// ELEMENTOS
// ==================================================

function el(id) {
    return document.getElementById(id);
}


// ==================================================
// ARMAZENAMENTO
// ==================================================

function carregarDados() {

    try {

        itens =
            JSON.parse(
                localStorage.getItem(CHAVE_LISTA)
            ) || [];

        produtos =
            JSON.parse(
                localStorage.getItem(CHAVE_PRODUTOS)
            ) || [];

        historico =
            JSON.parse(
                localStorage.getItem(CHAVE_HISTORICO)
            ) || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar dados:",
            erro
        );

        itens = [];
        produtos = [];
        historico = [];
    }
}


function salvarLista() {

    localStorage.setItem(
        CHAVE_LISTA,
        JSON.stringify(itens)
    );
}


function salvarProdutos() {

    localStorage.setItem(
        CHAVE_PRODUTOS,
        JSON.stringify(produtos)
    );
}


function salvarHistorico() {

    localStorage.setItem(
        CHAVE_HISTORICO,
        JSON.stringify(historico)
    );
}


// ==================================================
// MENSAGENS
// ==================================================

function mostrarMensagem(texto) {

    const toast = el("toast");

    if (!toast) {
        return;
    }

    clearTimeout(timerToast);

    toast.textContent = texto;
    toast.hidden = false;

    timerToast =
        setTimeout(() => {

            toast.hidden = true;

        }, 2300);
}


// ==================================================
// HISTÓRICO
// ==================================================

function gerarIdEvento() {

    return (
        `${Date.now()}-` +
        Math.random()
            .toString(16)
            .slice(2)
    );
}


function registrarEvento(
    tipo,
    nome,
    ean = null,
    quantidade = 1
) {

    const evento = {

        id:
            gerarIdEvento(),

        tipo:
            tipo,

        nome:
            nome,

        ean:
            ean,

        quantidade:
            quantidade,

        data:
            new Date().toISOString()
    };


    historico.push(
        evento
    );


    salvarHistorico();

    atualizarHistorico();
    atualizarResumo();
    atualizarPrevisoes();
    atualizarProdutos();


    return evento.id;
}


function formatarData(dataISO) {

    const data =
        new Date(dataISO);


    return data.toLocaleString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function formatarDataCurta(dataISO) {

    if (!dataISO) {
        return "Sem movimentação";
    }


    const data =
        new Date(dataISO);


    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


function atualizarHistorico() {

    const historicoBox =
        el("historicoBox");


    if (!historicoBox) {
        return;
    }


    historicoBox.innerHTML = "";


    if (historico.length === 0) {

        historicoBox.innerHTML = `
            <div class="estado-vazio">
                Nenhum evento registrado
            </div>
        `;

        return;
    }


    const eventos =
        [...historico].reverse();


    eventos.forEach(evento => {

        const linha =
            document.createElement("div");


        linha.className =
            "evento-historico";


        let classeTipo =
            "comprado";

        let textoTipo =
            "COMPRADO";


        if (
            evento.tipo === "acabou"
        ) {

            classeTipo =
                "acabou";

            textoTipo =
                "ACABOU";
        }


        if (
            evento.tipo === "previsto"
        ) {

            classeTipo =
                "previsto";

            textoTipo =
                "PREVISTO";
        }


        linha.innerHTML = `

            <div class="evento-principal">

                <span
                    class="evento-tipo ${classeTipo}"
                >
                    ${textoTipo}
                </span>

                <strong>
                    ${evento.nome}
                </strong>

                ${
                    evento.quantidade > 1
                        ? `
                            <span class="evento-quantidade">
                                x${evento.quantidade}
                            </span>
                          `
                        : ""
                }

            </div>

            <div class="evento-data">
                ${formatarData(evento.data)}
            </div>
        `;


        historicoBox.appendChild(
            linha
        );
    });
}


// ==================================================
// IDENTIFICAÇÃO
// ==================================================

function mesmoProduto(produto, evento) {

    if (
        produto.ean &&
        evento.ean
    ) {

        return (
            String(produto.ean) ===
            String(evento.ean)
        );
    }


    return (
        String(produto.nome || "")
            .toLowerCase() ===
        String(evento.nome || "")
            .toLowerCase()
    );
}


function eventosDoProduto(produto) {

    return historico
        .filter(
            evento =>
                mesmoProduto(
                    produto,
                    evento
                )
        )
        .sort(
            (a, b) =>
                new Date(a.data) -
                new Date(b.data)
        );
}


// ==================================================
// CÁLCULOS
// ==================================================

function diferencaDias(
    dataInicial,
    dataFinal
) {

    const inicio =
        new Date(dataInicial);

    const fim =
        new Date(dataFinal);


    return (
        fim - inicio
    ) /
    (
        1000 *
        60 *
        60 *
        24
    );
}


function media(valores) {

    if (valores.length === 0) {
        return null;
    }


    return (
        valores.reduce(
            (total, valor) =>
                total + valor,
            0
        ) /
        valores.length
    );
}

function mediana(valores) {

    if (!valores.length) {
        return null;
    }

    const ordenados =
        [...valores].sort(
            (a, b) => a - b
        );

    const meio =
        Math.floor(
            ordenados.length / 2
        );

    if (
        ordenados.length % 2 === 0
    ) {

        return (
            ordenados[meio - 1] +
            ordenados[meio]
        ) / 2;
    }

    return ordenados[meio];
}


function minimo(valores) {

    if (!valores.length) {
        return null;
    }

    return Math.min(...valores);
}


function maximo(valores) {

    if (!valores.length) {
        return null;
    }

    return Math.max(...valores);
}

function calcularResumoProduto(produto) {

    const eventos =
        eventosDoProduto(
            produto
        );


    const duracoes = [];
    const reposicoes = [];


    for (
        let i = 0;
        i < eventos.length - 1;
        i++
    ) {

        const atual =
            eventos[i];

        const proximo =
            eventos[i + 1];


        if (
            atual.tipo === "comprado" &&
            proximo.tipo === "acabou"
        ) {

            const diasLote =
                diferencaDias(
                    atual.data,
                    proximo.data
                );


            const quantidade =
                Math.max(
                    1,
                    Number(
                        atual.quantidade
                    ) || 1
                );


            /*
                O aprendizado passa a representar
                duração média POR UNIDADE.

                Exemplo:

                comprado x3
                acabou após 12 dias

                duração observada:
                4 dias por unidade
            */

            duracoes.push(
                diasLote /
                quantidade
            );
        }


        if (
            atual.tipo === "acabou" &&
            proximo.tipo === "comprado"
        ) {

            reposicoes.push(
                diferencaDias(
                    atual.data,
                    proximo.data
                )
            );
        }
    }


    const ultimoEvento =
        eventos.length
            ? eventos[
                eventos.length - 1
              ]
            : null;


    return {

        duracaoMedia:
            media(duracoes),

        duracaoMediana:
            mediana(duracoes),

        duracaoMinima:
            minimo(duracoes),

        duracaoMaxima:
            maximo(duracoes),

        reposicaoMedia:
            media(reposicoes),

        ciclosDuracao:
            duracoes.length,

        ciclosReposicao:
            reposicoes.length,

        ultimoEvento:
            ultimoEvento,

        totalEventos:
            eventos.length
    };
}


function formatarDuracao(dias) {

    if (
        dias === null ||
        dias === undefined
    ) {

        return "Sem dados suficientes";
    }


    if (dias < 1) {

        const horas =
            dias * 24;


        if (horas < 1) {

            const minutos =
                Math.max(
                    1,
                    Math.round(
                        horas * 60
                    )
                );


            return `${minutos} min`;
        }


        return `${horas.toFixed(1)} h`;
    }


    return `${dias.toFixed(1)} dias`;
}

function calcularDuracaoReferencia(resumo) {

    if (
        resumo.duracaoMediana !== null &&
        resumo.ciclosDuracao >= 3
    ) {

        return resumo.duracaoMediana;
    }

    return resumo.duracaoMedia;
}


// ==================================================
// PRODUTOS CONHECIDOS
// ==================================================

function obterProdutosConhecidos() {

    const resultado =
        produtos.map(
            produto => ({
                nome:
                    produto.nome,

                ean:
                    produto.ean || null
            })
        );


    historico.forEach(evento => {

        const existe =
            resultado.find(
                produto =>
                    mesmoProduto(
                        produto,
                        evento
                    )
            );


        if (!existe) {

            resultado.push({

                nome:
                    evento.nome,

                ean:
                    evento.ean || null
            });
        }
    });


    return resultado;
}

// ==================================================
// V1.5 - PAINEL RÁPIDO
// ==================================================

function totalCiclosObservados() {

    const produtosConhecidos =
        obterProdutosConhecidos();


    return produtosConhecidos.reduce(
        (total, produto) => {

            const resumo =
                calcularResumoProduto(
                    produto
                );


            return (
                total +
                resumo.ciclosDuracao
            );
        },
        0
    );
}


function atualizarPainelRapido() {

    const statusComprar =
        el("statusComprar");

    const statusProdutos =
        el("statusProdutos");

    const statusCiclos =
        el("statusCiclos");


    if (statusComprar) {

        statusComprar.textContent =
            totalItens();
    }


    if (statusProdutos) {

        statusProdutos.textContent =
            obterProdutosConhecidos()
                .length;
    }


    if (statusCiclos) {

        statusCiclos.textContent =
            totalCiclosObservados();
    }
}


// ==================================================
// V1.5 - CONFIANÇA DA PREVISÃO
// ==================================================

function calcularConfianca(produto) {

    const resumo =
        calcularResumoProduto(
            produto
        );


    const ciclos =
        resumo.ciclosDuracao;


    if (ciclos <= 1) {

        return {
            classe: "baixa",
            texto: "Poucos dados"
        };
    }


    if (ciclos <= 3) {

        return {
            classe: "media",
            texto: "Confiança média"
        };
    }


    return {
        classe: "alta",
        texto: "Boa confiança"
    };
}

// ==================================================
// PREVISÕES
// ==================================================

function calcularPrevisao(produto) {

    const resumo =
        calcularResumoProduto(
            produto
        );


    if (
        resumo.duracaoMedia === null ||
        !resumo.ultimoEvento
    ) {

        return null;
    }


    const duracaoReferencia =
        calcularDuracaoReferencia(
            resumo
        );


    /*
        ACABOU e PREVISTO significam
        que o produto já está na lista.

        PREVISTO, porém, NÃO entra
        no cálculo do ciclo de consumo.
    */

    if (
        resumo.ultimoEvento.tipo !==
        "comprado"
    ) {

        return {

            produto:
                produto,

            situacao:
                "acabou",

            diasRestantes:
                0,

            dataPrevista:
                null,

            duracaoMedia:
                resumo.duracaoMedia,

            duracaoReferencia:
                duracaoReferencia,

            quantidade:
                1
        };
    }


    const quantidadeComprada =
        Math.max(
            1,
            Number(
                resumo
                    .ultimoEvento
                    .quantidade
            ) || 1
        );


    const duracaoPrevista =
        duracaoReferencia *
        quantidadeComprada;


    const dataCompra =
        new Date(
            resumo
                .ultimoEvento
                .data
        );


    const milissegundosDuracao =
        duracaoPrevista *
        24 *
        60 *
        60 *
        1000;


    const dataPrevista =
        new Date(
            dataCompra.getTime() +
            milissegundosDuracao
        );


    const agora =
        new Date();


    const diasRestantes =
        (
            dataPrevista -
            agora
        ) /
        (
            1000 *
            60 *
            60 *
            24
        );


    let situacao =
        "normal";


    const limiteAtencao =
        Math.max(
            1,
            duracaoPrevista *
            0.20
        );


    if (
        diasRestantes <= 0
    ) {

        situacao =
            "provavel";

    } else if (
        diasRestantes <=
        limiteAtencao
    ) {

        situacao =
            "atencao";
    }


    return {

        produto:
            produto,

        situacao:
            situacao,

        diasRestantes:
            diasRestantes,

        dataPrevista:
            dataPrevista,

        duracaoMedia:
            resumo.duracaoMedia,

        duracaoReferencia:
            duracaoReferencia,

        duracaoPrevista:
            duracaoPrevista,

        quantidade:
            quantidadeComprada
    };
}


function textoPrevisao(previsao) {

    if (
        previsao.situacao ===
        "acabou"
    ) {

        return "Já está na lista de compras";
    }


    const dias =
        previsao.diasRestantes;


    if (dias <= 0) {

        const atraso =
            Math.abs(dias);


        if (atraso < 1) {

            return "Pode estar acabando hoje";
        }


        return (
            `Previsão vencida há ` +
            `${Math.round(atraso)} dia(s)`
        );
    }


    if (dias < 1) {

        return "Pode acabar hoje";
    }


    if (dias < 2) {

        return "Pode acabar amanhã";
    }


    return (
        `Estimativa: ${Math.ceil(dias)} dias`
    );
}


function tituloSituacao(situacao) {

    if (situacao === "acabou") {
        return "NA LISTA";
    }

    if (situacao === "provavel") {
        return "PROVÁVEL";
    }

    if (situacao === "atencao") {
        return "ATENÇÃO";
    }

    return "NORMAL";
}


// ==================================================
// ADICIONAR PREVISÃO À LISTA
// ==================================================

function adicionarPrevisaoALista(
    produto
) {

    if (!produto) {
        return;
    }


    adicionarItem(
        produto.nome,
        produto.ean || null,
        true,
        "previsto"
    );


    mostrarMensagem(
        `${produto.nome} adicionado preventivamente à lista`
    );
}


function atualizarPrevisoes() {

    const previsoesBox =
        el("previsoesBox");


    if (!previsoesBox) {
        return;
    }


    previsoesBox.innerHTML = "";


    const produtosConhecidos =
        obterProdutosConhecidos();


    const previsoes =
        produtosConhecidos
            .map(
                produto =>
                    calcularPrevisao(
                        produto
                    )
            )
            .filter(
                previsao =>
                    previsao !== null
            );


    if (
        previsoes.length === 0
    ) {

        previsoesBox.innerHTML = `
            <div class="estado-previsao-vazio">

                Ainda preciso observar pelo menos um ciclo

                <strong>
                    comprado → acabou
                </strong>

                para começar a prever.

            </div>
        `;

        atualizarPainelRapido();

        return;
    }


    /*
        Ordem:

        1. Já está na lista
        2. Provavelmente acabando
        3. Atenção
        4. Normal
    */

    const prioridade = {

        acabou: 0,

        provavel: 1,

        atencao: 2,

        normal: 3
    };


    previsoes.sort(
        (a, b) => {

            const diferencaPrioridade =

                prioridade[a.situacao] -
                prioridade[b.situacao];


            if (
                diferencaPrioridade !== 0
            ) {

                return diferencaPrioridade;
            }


            return (

                a.diasRestantes -
                b.diasRestantes
            );
        }
    );


    const principais =
        previsoes.slice(
            0,
            5
        );


    let quantidadeAcionavel =
        0;


    const produtosAcionaveis =
        [];


    principais.forEach(
        previsao => {

            const linha =
                document.createElement(
                    "div"
                );


            linha.className =
                "previsao-item";


            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "previsao-info";


            const nome =
                document.createElement(
                    "strong"
                );


            nome.textContent =
                previsao.produto.nome;


            const detalhe =
                document.createElement(
                    "span"
                );


            detalhe.textContent =
                textoPrevisao(
                    previsao
                );


            const confianca =
                calcularConfianca(
                    previsao.produto
                );


            const textoConfianca =
                document.createElement(
                    "div"
                );


            textoConfianca.className =
                `previsao-confianca ${confianca.classe}`;


            textoConfianca.textContent =
                confianca.texto;


            info.appendChild(
                nome
            );


            info.appendChild(
                detalhe
            );


            info.appendChild(
                textoConfianca
            );


            const ladoDireito =
                document.createElement(
                    "div"
                );


            ladoDireito.className =
                "previsao-lado";


            const status =
                document.createElement(
                    "span"
                );


            status.className =
                `previsao-status ${previsao.situacao}`;


            status.textContent =
                tituloSituacao(
                    previsao.situacao
                );


            ladoDireito.appendChild(
                status
            );


            if (
                previsao.situacao ===
                    "atencao" ||

                previsao.situacao ===
                    "provavel"
            ) {

                quantidadeAcionavel++;


                produtosAcionaveis.push(
                    previsao.produto
                );


                const botaoAdicionar =
                    document.createElement(
                        "button"
                    );


                botaoAdicionar.type =
                    "button";


                botaoAdicionar.className =
                    "botao-previsao";


                botaoAdicionar.textContent =
                    "Adicionar à lista";


                botaoAdicionar.addEventListener(
                    "click",
                    () => {

                        adicionarPrevisaoALista(
                            previsao.produto
                        );
                    }
                );


                ladoDireito.appendChild(
                    botaoAdicionar
                );
            }


            linha.appendChild(
                info
            );


            linha.appendChild(
                ladoDireito
            );


            previsoesBox.appendChild(
                linha
            );
        }
    );


    // ==========================================
    // ADICIONAR TODOS
    // ==========================================

    if (
    quantidadeAcionavel > 1
    ) {

    const botaoTodos =
        document.createElement(
            "button"
        );


    botaoTodos.type =
        "button";


    botaoTodos.className =
        "adicionar-todos";


    botaoTodos.textContent =
        `Adicionar ${quantidadeAcionavel} itens à lista`;


    botaoTodos.addEventListener(
        "click",
        () => {

            produtosAcionaveis.forEach(
                produto => {

                    const jaExiste =
                        itens.some(
                            item => {

                                if (
                                    produto.ean &&
                                    item.ean
                                ) {

                                    return (
                                        String(
                                            produto.ean
                                        ) ===
                                        String(
                                            item.ean
                                        )
                                    );
                                }


                                return (
                                    String(
                                        produto.nome
                                    ).toLowerCase() ===
                                    String(
                                        item.nome
                                    ).toLowerCase()
                                );
                            }
                        );


                    if (!jaExiste) {

                        adicionarItem(
                            produto.nome,
                            produto.ean || null,
                            true,
                            "previsto"
                        );
                    }
                }
            );


            atualizarLista();
            atualizarPrevisoes();


            mostrarMensagem(
                "Itens previstos adicionados à lista"
            );
        }
    );


    previsoesBox.appendChild(
        botaoTodos
    );
}


    atualizarPainelRapido();
}



// ==================================================
// RESUMO
// ==================================================

function atualizarResumo() {

    const resumoBox =
        el("resumoBox");


    if (!resumoBox) {
        return;
    }


    resumoBox.innerHTML = "";


    const produtosConhecidos =
        obterProdutosConhecidos();


    if (
        produtosConhecidos.length === 0
    ) {

        resumoBox.innerHTML = `
            <div class="estado-vazio">
                Ainda não há dados suficientes
            </div>
        `;

        return;
    }


    produtosConhecidos.forEach(produto => {

        const resumo =
            calcularResumoProduto(
                produto
            );


        const previsao =
            calcularPrevisao(
                produto
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "resumo-produto";


        let ultimoTexto =
            "Nenhum evento";


        if (resumo.ultimoEvento) {

            if (
                resumo.ultimoEvento.tipo ===
                "acabou"
            ) {

                ultimoTexto =
                    "ACABOU";

            } else if (
                resumo.ultimoEvento.tipo ===
                "previsto"
            ) {

                ultimoTexto =
                    "PREVISTO";

            } else {

                ultimoTexto =
                    "COMPRADO";
            }
        }


        let previsaoHTML = `

            <div class="previsao-resumo">
                Previsão ainda indisponível
            </div>
        `;


        if (previsao) {

            previsaoHTML = `

                <div class="previsao-resumo">
                    ${textoPrevisao(previsao)}
                </div>
            `;
        }

        let faixaTexto =
            "Sem faixa suficiente";


        if (
            resumo.duracaoMinima !== null &&
            resumo.duracaoMaxima !== null &&
            resumo.ciclosDuracao >= 2
        ) {

            faixaTexto =
                `${formatarDuracao(
                    resumo.duracaoMinima
                )} – ${formatarDuracao(
                    resumo.duracaoMaxima
                )}`;
        }

        card.innerHTML = `

            <div class="resumo-topo">

                <strong>
                    ${produto.nome}
                </strong>

                <span class="ultimo-evento">
                    ${ultimoTexto}
                </span>

            </div>


            <div class="metricas">

                <div class="metrica">

                    <span>
                        Duração média / unidade
                    </span>

                    <strong>
                        ${
                            formatarDuracao(
                                resumo.duracaoMedia
                            )
                        }
                    </strong>

                </div>

                <div class="metrica">

                    <span>
                        Faixa / unidade
                    </span>

                    <strong>
                        ${faixaTexto}
                    </strong>

                </div>

                <div class="metrica">

                    <span>
                        Reposição média
                    </span>

                    <strong>
                        ${
                            formatarDuracao(
                                resumo.reposicaoMedia
                            )
                        }
                    </strong>

                </div>

            </div>


            ${previsaoHTML}


            <div class="resumo-rodape">

                <span>
                    Ciclos de consumo:
                    ${resumo.ciclosDuracao}
                </span>

                <span>
                    Reposições medidas:
                    ${resumo.ciclosReposicao}
                </span>

            </div>
        `;


        resumoBox.appendChild(
            card
        );
    });
}


// ==================================================
// LISTA
// ==================================================

function totalItens() {

    return itens.reduce(
        (total, item) =>
            total + item.quantidade,
        0
    );
}


function atualizarLista() {

    const lista =
        el("lista");

    const contador =
        el("contador");


    if (!lista) {
        return;
    }


    lista.innerHTML = "";


    if (contador) {

        contador.textContent =
            totalItens();
    }


    if (itens.length === 0) {

        lista.innerHTML = `
            <div class="estado-vazio">
                Nenhum item na lista
            </div>
        `;

        return;
    }


    itens.forEach(
        (item, indice) => {

            const linha =
                document.createElement(
                    "div"
                );


            linha.className =
                "item";


            linha.innerHTML = `

                <div class="item-dados">

                    <span class="item-nome">
                        ${item.nome}
                    </span>

                    <span class="item-quantidade">
                        x${item.quantidade}
                    </span>

                </div>


                <div class="item-acoes">

                    <button
                        class="acao quantidade"
                        data-acao="menos"
                        data-indice="${indice}"
                    >
                        −
                    </button>

                    <button
                        class="acao quantidade"
                        data-acao="mais"
                        data-indice="${indice}"
                    >
                        +
                    </button>

                    <button
                        class="acao concluir"
                        data-acao="comprado"
                        data-indice="${indice}"
                    >
                        ✓
                    </button>

                </div>
            `;


            lista.appendChild(
                linha
            );
        }
    );
}

function prepararControleItem(
    item
) {

    if (
        !Array.isArray(
            item.eventosLista
        )
    ) {

        item.eventosLista =
            [];
    }


    return item;
}


function removerEventoHistoricoPorId(
    id
) {

    if (!id) {
        return false;
    }


    const indice =
        historico.findIndex(
            evento =>
                String(evento.id) ===
                String(id)
        );


    if (
        indice === -1
    ) {

        return false;
    }


    historico.splice(
        indice,
        1
    );


    return true;
}


function removerUltimoEventoDaLista(
    item
) {

    prepararControleItem(
        item
    );


    /*
        Primeiro tenta usar o vínculo
        criado pela V2.2.
    */

    if (
        item.eventosLista.length > 0
    ) {

        const id =
            item.eventosLista.pop();


        return (
            removerEventoHistoricoPorId(
                id
            )
        );
    }


    /*
        Compatibilidade com itens que já
        estavam na lista antes da V2.2.
    */

    for (
        let i =
            historico.length - 1;

        i >= 0;

        i--
    ) {

        const evento =
            historico[i];


        if (
            mesmoProduto(
                item,
                evento
            ) &&
            (
                evento.tipo ===
                    "acabou" ||

                evento.tipo ===
                    "previsto"
            )
        ) {

            historico.splice(
                i,
                1
            );


            return true;
        }
    }


    return false;
}

function adicionarItem(
    nome,
    ean = null,
    registrar = true,
    tipoEvento = "acabou"
) {

    nome =
        nome.trim();


    const existente =
        itens.find(
            item => {

                if (
                    ean &&
                    item.ean
                ) {

                    return (
                        String(item.ean) ===
                        String(ean)
                    );
                }


                return (
                    item.nome
                        .toLowerCase() ===
                    nome
                        .toLowerCase()
                );
            }
        );


    let item;


    if (existente) {

        item =
            existente;


        prepararControleItem(
            item
        );


        item.quantidade++;


        if (
            !item.ean &&
            ean
        ) {

            item.ean =
                ean;
        }

    } else {

        item = {

            nome:
                nome,

            quantidade:
                1,

            ean:
                ean,

            eventosLista:
                []
        };


        itens.push(
            item
        );
    }


    if (registrar) {

        const eventoId =
            registrarEvento(
                tipoEvento,
                nome,
                ean,
                1
            );


        item.eventosLista.push(
            eventoId
        );
    }


    salvarLista();

    atualizarLista();
    atualizarPrevisoes();
}


function lidarCliqueLista(event) {

    const botao =
        event.target.closest(
            "[data-acao]"
        );


    if (!botao) {
        return;
    }


    const indice =
        Number(
            botao.dataset.indice
        );


    const acao =
        botao.dataset.acao;


    const item =
        itens[indice];


    if (!item) {
        return;
    }


    prepararControleItem(
        item
    );


    if (
        acao === "mais"
    ) {

        item.quantidade++;
    }


    if (
        acao === "menos"
    ) {

        item.quantidade--;


        /*
            Só desfaz eventos quando existem
            mais eventos ligados à lista do que
            unidades restantes.

            Exemplo:

            scanner x2 -> 2 eventos
            remove 1   -> remove 1 evento

            scanner x1 + botão "+" -> 1 evento
            remove 1 quantidade    -> mantém evento
        */

        while (
            item.eventosLista.length >
            item.quantidade
        ) {

            removerUltimoEventoDaLista(
                item
            );
        }


        if (
            item.quantidade <= 0
        ) {

            itens.splice(
                indice,
                1
            );
        }
    }


    if (
        acao === "comprado"
    ) {

        registrarEvento(
            "comprado",
            item.nome,
            item.ean || null,
            item.quantidade
        );


        itens.splice(
            indice,
            1
        );


        mostrarMensagem(
            `${item.nome} marcado como comprado`
        );
    }


    salvarLista();
    salvarHistorico();

    atualizarLista();
    atualizarHistorico();
    atualizarResumo();
    atualizarPrevisoes();
    atualizarProdutos();
}


function limparLista() {

    if (
        itens.length === 0
    ) {

        return;
    }


    const confirmar =
        confirm(
            "Limpar toda a lista?\n\nAs inclusões ainda não compradas também serão removidas do histórico."
        );


    if (!confirmar) {
        return;
    }


    itens.forEach(
        item => {

            prepararControleItem(
                item
            );


            if (
                item.eventosLista.length
            ) {

                while (
                    item.eventosLista.length
                ) {

                    removerUltimoEventoDaLista(
                        item
                    );
                }

            } else {

                /*
                    Compatibilidade com lista
                    criada antes da V2.2.
                */

                removerUltimoEventoDaLista(
                    item
                );
            }
        }
    );


    itens = [];


    salvarLista();
    salvarHistorico();

    atualizarLista();
    atualizarHistorico();
    atualizarResumo();
    atualizarPrevisoes();
    atualizarProdutos();


    mostrarMensagem(
        "Lista limpa"
    );
}


// ==================================================
// PRODUTOS
// ==================================================

function buscarProdutoPorEAN(ean) {

    return produtos.find(
        produto =>
            String(produto.ean) ===
            String(ean)
    );
}


function obterProdutosFiltrados() {

    const busca =
        el("buscaProdutos");


    const termo =
        busca
            ? busca.value
                .trim()
                .toLowerCase()
            : "";


    if (!termo) {
        return [...produtos];
    }


    return produtos.filter(
        produto => {

            const nome =
                String(
                    produto.nome || ""
                ).toLowerCase();


            const ean =
                String(
                    produto.ean || ""
                ).toLowerCase();


            return (
                nome.includes(termo) ||
                ean.includes(termo)
            );
        }
    );
}


function editarProduto(produto) {

    if (!produto) {
        return;
    }


    const nomeAtual =
        String(
            produto.nome || ""
        );


    const novoNome =
        prompt(
            "Novo nome do produto:",
            nomeAtual
        );


    if (
        !novoNome ||
        !novoNome.trim()
    ) {

        return;
    }


    const nomeLimpo =
        novoNome.trim();


    if (
        nomeLimpo ===
        nomeAtual
    ) {

        return;
    }


    produto.nome =
        nomeLimpo;


    itens.forEach(item => {

        if (
            produto.ean &&
            item.ean &&
            String(item.ean) ===
            String(produto.ean)
        ) {

            item.nome =
                nomeLimpo;
        }
    });


    historico.forEach(evento => {

        if (
            produto.ean &&
            evento.ean &&
            String(evento.ean) ===
            String(produto.ean)
        ) {

            evento.nome =
                nomeLimpo;
        }
    });


    salvarProdutos();
    salvarLista();
    salvarHistorico();


    atualizarProdutos();
    atualizarLista();
    atualizarHistorico();
    atualizarResumo();
    atualizarPrevisoes();


    mostrarMensagem(
        `${nomeAtual} alterado para ${nomeLimpo}`
    );
}


function excluirProduto(produto) {

    if (!produto) {
        return;
    }


    const confirmar =
        confirm(
            `Excluir "${produto.nome}" dos produtos cadastrados?\n\nO histórico será mantido.`
        );


    if (!confirmar) {
        return;
    }


    const indice =
        produtos.indexOf(
            produto
        );


    if (indice === -1) {
        return;
    }


    produtos.splice(
        indice,
        1
    );


    salvarProdutos();


    atualizarProdutos();
    atualizarResumo();
    atualizarPrevisoes();


    mostrarMensagem(
        `${produto.nome} removido do cadastro`
    );
}


function atualizarProdutos() {

    const produtosBox =
        el("produtosBox");

    const contadorProdutos =
        el("contadorProdutos");


    if (!produtosBox) {
        return;
    }


    produtosBox.innerHTML = "";


    if (contadorProdutos) {

        contadorProdutos.textContent =
            produtos.length === 1
                ? "1 produto cadastrado"
                : `${produtos.length} produtos cadastrados`;
    }


    if (
        produtos.length === 0
    ) {

        produtosBox.innerHTML = `
            <div class="estado-vazio">
                Nenhum produto cadastrado
            </div>
        `;

        return;
    }


    const filtrados =
        obterProdutosFiltrados();


    if (
        filtrados.length === 0
    ) {

        produtosBox.innerHTML = `
            <div class="estado-vazio">
                Nenhum produto encontrado
            </div>
        `;

        return;
    }


    filtrados.forEach(produto => {

        const eventos =
            eventosDoProduto(
                produto
            );


        const ultimoEvento =
            eventos.length
                ? eventos[
                    eventos.length - 1
                  ]
                : null;


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "produto-card";


        const info =
            document.createElement(
                "div"
            );


        info.className =
            "produto-info";


        const nome =
            document.createElement(
                "strong"
            );


        nome.textContent =
            produto.nome ||
            "Produto sem nome";


        const ean =
            document.createElement(
                "div"
            );


        ean.className =
            "produto-ean";


        ean.textContent =
            produto.ean
                ? `EAN ${produto.ean}`
                : "Sem EAN";


        const estatisticas =
            document.createElement(
                "div"
            );


        estatisticas.className =
            "produto-estatisticas";


        const totalEventos =
            document.createElement(
                "span"
            );


        totalEventos.textContent =
            eventos.length === 1
                ? "1 evento"
                : `${eventos.length} eventos`;


        const ultimaMovimentacao =
            document.createElement(
                "span"
            );


        ultimaMovimentacao.textContent =
            ultimoEvento
                ? `Último: ${formatarDataCurta(
                    ultimoEvento.data
                  )}`
                : "Último: sem registro";


        estatisticas.appendChild(
            totalEventos
        );


        estatisticas.appendChild(
            ultimaMovimentacao
        );


        info.appendChild(
            nome
        );

        info.appendChild(
            ean
        );

        info.appendChild(
            estatisticas
        );


        const acoes =
            document.createElement(
                "div"
            );


        acoes.className =
            "produto-acoes";


        const botaoEditar =
            document.createElement(
                "button"
            );


        botaoEditar.type =
            "button";


        botaoEditar.className =
            "produto-botao editar";


        botaoEditar.textContent =
            "Editar";


        botaoEditar.addEventListener(
            "click",
            () => {

                editarProduto(
                    produto
                );
            }
        );


        const botaoExcluir =
            document.createElement(
                "button"
            );


        botaoExcluir.type =
            "button";


        botaoExcluir.className =
            "produto-botao excluir";


        botaoExcluir.textContent =
            "Excluir";


        botaoExcluir.addEventListener(
            "click",
            () => {

                excluirProduto(
                    produto
                );
            }
        );


        acoes.appendChild(
            botaoEditar
        );


        acoes.appendChild(
            botaoExcluir
        );


        card.appendChild(
            info
        );


        card.appendChild(
            acoes
        );


        produtosBox.appendChild(
            card
        );
    });
}


// ==================================================
// EAN
// ==================================================

function processarEAN(ean) {

    ean =
        String(ean)
            .replace(
                /\D/g,
                ""
            );


    if (!ean) {

        mostrarMensagem(
            "Código inválido"
        );

        return;
    }


    const produto =
        buscarProdutoPorEAN(
            ean
        );


    if (produto) {

        adicionarItem(
            produto.nome,
            ean
        );


        mostrarMensagem(
            `${produto.nome} adicionado`
        );


        return;
    }


    const nome =
        prompt(
            `Produto ainda não cadastrado.\n\nEAN: ${ean}\n\nNome do produto:`
        );


    if (
        !nome ||
        !nome.trim()
    ) {

        return;
    }


    const nomeLimpo =
        nome.trim();


    if (
        buscarProdutoPorEAN(ean)
    ) {

        mostrarMensagem(
            "Este EAN já está cadastrado"
        );

        return;
    }


    produtos.push({

        ean:
            ean,

        nome:
            nomeLimpo
    });


    salvarProdutos();

    atualizarProdutos();


    adicionarItem(
        nomeLimpo,
        ean
    );


    mostrarMensagem(
        `${nomeLimpo} cadastrado e adicionado`
    );
}


function adicionarPorCodigo() {

    const entrada =
        prompt(
            "Digite o código de barras:"
        );


    if (!entrada) {
        return;
    }


    processarEAN(
        entrada
    );
}


function adicionarManualmente() {

    const nome =
        prompt(
            "Nome do produto:"
        );


    if (
        !nome ||
        !nome.trim()
    ) {

        return;
    }


    adicionarItem(
        nome.trim(),
        null
    );
}

// ==================================================
// V2.0 - BACKUP E RESTAURAÇÃO
// ==================================================

function atualizarDadosBackup() {

    const backupLista =
        el("backupLista");

    const backupProdutos =
        el("backupProdutos");

    const backupEventos =
        el("backupEventos");


    if (backupLista) {

        backupLista.textContent =
            totalItens();
    }


    if (backupProdutos) {

        backupProdutos.textContent =
            produtos.length;
    }


    if (backupEventos) {

        backupEventos.textContent =
            historico.length;
    }
}


function criarBackup() {

    return {

        aplicativo:
            "KIJK Pantry",

        versao:
            VERSAO,

        exportadoEm:
            new Date().toISOString(),

        dados: {

            lista:
                itens,

            produtos:
                produtos,

            historico:
                historico
        }
    };
}


function exportarBackup() {

    const backup =
        criarBackup();


    const texto =
        JSON.stringify(
            backup,
            null,
            2
        );


    const blob =
        new Blob(
            [texto],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const agora =
        new Date();


    const data =
        agora
            .toISOString()
            .slice(0, 10);


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `kijk-pantry-backup-${data}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    mostrarMensagem(
        "Backup exportado"
    );
}


function validarBackup(backup) {

    if (
        !backup ||
        typeof backup !== "object"
    ) {

        return false;
    }


    if (
        !backup.dados ||
        typeof backup.dados !== "object"
    ) {

        return false;
    }


    if (
        !Array.isArray(
            backup.dados.lista
        )
    ) {

        return false;
    }


    if (
        !Array.isArray(
            backup.dados.produtos
        )
    ) {

        return false;
    }


    if (
        !Array.isArray(
            backup.dados.historico
        )
    ) {

        return false;
    }


    return true;
}


function solicitarImportacaoBackup() {

    const arquivoBackup =
        el("arquivoBackup");


    if (!arquivoBackup) {

        return;
    }


    arquivoBackup.value =
        "";


    arquivoBackup.click();
}


function importarBackup(event) {

    const arquivo =
        event.target.files[0];


    if (!arquivo) {

        return;
    }


    const leitor =
        new FileReader();


    leitor.onload = () => {

        try {

            const backup =
                JSON.parse(
                    leitor.result
                );


            if (
                !validarBackup(
                    backup
                )
            ) {

                alert(
                    "Este arquivo não parece ser um backup válido do KIJK Pantry."
                );

                return;
            }


            const confirmar =
                confirm(
                    "Restaurar este backup?\n\nOs dados atuais do Pantry serão substituídos."
                );


            if (!confirmar) {

                return;
            }


            itens =
                backup.dados.lista;


            produtos =
                backup.dados.produtos;


            historico =
                backup.dados.historico;


            salvarLista();
            salvarProdutos();
            salvarHistorico();


            atualizarLista();
            atualizarProdutos();
            atualizarHistorico();
            atualizarResumo();
            atualizarPrevisoes();
            atualizarPainelRapido();
            atualizarDadosBackup();


            mostrarMensagem(
                "Backup restaurado com sucesso"
            );


        } catch (erro) {

            console.error(
                "Erro ao importar backup:",
                erro
            );


            alert(
                "Não foi possível ler este arquivo de backup."
            );
        }
    };


    leitor.readAsText(
        arquivo
    );
}

// ==================================================
// PAINÉIS
// ==================================================

function fecharOutrosPaineis(
    excecao
) {

    const areas = {

    resumo:
        el("areaResumo"),

    historico:
        el("areaHistorico"),

    produtos:
        el("areaProdutos"),

    dados:
        el("areaDados")
    };


    const botoes = {

    resumo:
        el("botaoResumo"),

    historico:
        el("botaoHistorico"),

    produtos:
        el("botaoProdutos"),

    dados:
        el("botaoDados")
    };


    Object.keys(
        areas
    ).forEach(nome => {

        if (
            nome !== excecao &&
            areas[nome]
        ) {

            areas[nome].hidden =
                true;
        }
    });


    if (
        excecao !== "resumo" &&
        botoes.resumo
    ) {

        botoes.resumo.textContent =
            "Resumo de consumo";
    }


    if (
        excecao !== "historico" &&
        botoes.historico
    ) {

        botoes.historico.textContent =
            "Histórico";
    }


    if (
        excecao !== "produtos" &&
        botoes.produtos
    ) {

        botoes.produtos.textContent =
            "Produtos cadastrados";
    }

    if (
    excecao !== "dados" &&
    botoes.dados
    ) {

    botoes.dados.textContent =
        "Dados e backup";

    }  
} 

function alternarResumo() {

    const area =
        el("areaResumo");

    const botao =
        el("botaoResumo");


    if (!area) {
        return;
    }


    const abrir =
        area.hidden;


    area.hidden =
        !abrir;


    if (botao) {

        botao.textContent =
            abrir
                ? "Ocultar resumo"
                : "Resumo de consumo";
    }


    if (abrir) {

        fecharOutrosPaineis(
            "resumo"
        );

        atualizarResumo();
    }
}


function alternarHistorico() {

    const area =
        el("areaHistorico");

    const botao =
        el("botaoHistorico");


    if (!area) {
        return;
    }


    const abrir =
        area.hidden;


    area.hidden =
        !abrir;


    if (botao) {

        botao.textContent =
            abrir
                ? "Ocultar histórico"
                : "Histórico";
    }


    if (abrir) {

        fecharOutrosPaineis(
            "historico"
        );

        atualizarHistorico();
    }
}


function alternarProdutos() {

    const area =
        el("areaProdutos");

    const botao =
        el("botaoProdutos");


    if (!area) {
        return;
    }


    const abrir =
        area.hidden;


    area.hidden =
        !abrir;


    if (botao) {

        botao.textContent =
            abrir
                ? "Ocultar produtos cadastrados"
                : "Produtos cadastrados";
    }


    if (abrir) {

        fecharOutrosPaineis(
            "produtos"
        );

        atualizarProdutos();
    }
}

function alternarDados() {

    const area =
        el("areaDados");


    const botao =
        el("botaoDados");


    if (!area) {

        return;
    }


    const abrir =
        area.hidden;


    area.hidden =
        !abrir;


    if (botao) {

        botao.textContent =
            abrir
                ? "Ocultar dados e backup"
                : "Dados e backup";
    }


    if (abrir) {

        fecharOutrosPaineis(
            "dados"
        );


        atualizarDadosBackup();
    }
}

// ==================================================
// LIMPEZA
// ==================================================

function limparHistorico() {

    if (
        historico.length === 0
    ) {

        return;
    }


    const confirmar =
        confirm(
            "Apagar todo o histórico?"
        );


    if (!confirmar) {
        return;
    }


    historico = [];


    salvarHistorico();

    atualizarHistorico();
    atualizarResumo();
    atualizarPrevisoes();
    atualizarProdutos();
}


// ==================================================
// SCANNER
// ==================================================

async function abrirScanner() {

    const scannerModal =
        el("scannerModal");


    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        alert(
            "O leitor de código de barras não foi carregado."
        );

        return;
    }


    if (!scannerModal) {
        return;
    }


    scannerModal.hidden =
        false;


    leituraEmAndamento =
        false;


    scanner =
        new Html5Qrcode(
            "reader"
        );


    const configuracao = {

        fps: 10,

        qrbox: {

            width: 280,

            height: 140
        }
    };


    try {

        scannerAtivo =
            true;


        await scanner.start(

            {
                facingMode:
                    "environment"
            },

            configuracao,

            async decodedText => {

                if (
                    leituraEmAndamento
                ) {

                    return;
                }


                leituraEmAndamento =
                    true;


                if (
                    navigator.vibrate
                ) {

                    navigator.vibrate(
                        120
                    );
                }


                await fecharScanner();


                processarEAN(
                    decodedText
                );
            },

            () => {
                // Frame sem código.
            }
        );

    } catch (erro) {

        console.error(
            "Erro na câmera:",
            erro
        );


        scannerAtivo =
            false;


        scannerModal.hidden =
            true;


        alert(
            "Não foi possível abrir a câmera."
        );
    }
}


async function fecharScanner() {

    const scannerModal =
        el("scannerModal");


    if (
        scanner &&
        scannerAtivo
    ) {

        try {

            await scanner.stop();

        } catch (erro) {

            console.log(
                "Scanner já estava parado."
            );
        }
    }


    scannerAtivo =
        false;


    if (scanner) {

        try {

            scanner.clear();

        } catch {

            // Ignora
        }
    }


    scanner =
        null;


    if (scannerModal) {

        scannerModal.hidden =
            true;
    }
}


// ==================================================
// EVENTOS
// ==================================================

function configurarEventos() {

    const lista =
        el("lista");


    if (lista) {

        lista.addEventListener(
            "click",
            lidarCliqueLista
        );
    }


    const buscaProdutos =
        el("buscaProdutos");


    if (buscaProdutos) {

        buscaProdutos.addEventListener(
            "input",
            atualizarProdutos
        );
    }


    const eventos = [

        [
            "botaoAdicionar",
            adicionarManualmente
        ],

        [
            "botaoCodigo",
            adicionarPorCodigo
        ],

        [
            "botaoScanner",
            abrirScanner
        ],

        [
            "botaoFecharScanner",
            fecharScanner
        ],

        [
            "botaoResumo",
            alternarResumo
        ],

        [
            "botaoHistorico",
            alternarHistorico
        ],

        [
            "botaoProdutos",
            alternarProdutos
        ],

        [
            "botaoLimpar",
            limparLista
        ],

        [
            "botaoLimparHistorico",
            limparHistorico
        ],
        [
            "botaoDados",
            alternarDados
        ],

        [
            "botaoExportar",
            exportarBackup
        ],

        [
            "botaoImportar",
            solicitarImportacaoBackup
        ],
        ];


    eventos.forEach(
        ([id, funcao]) => {

            const elemento =
                el(id);


            if (elemento) {

                elemento.addEventListener(
                    "click",
                    funcao
                );
            }
        }
    );
            const arquivoBackup =
            el("arquivoBackup");


        if (arquivoBackup) {

            arquivoBackup.addEventListener(
                "change",
                importarBackup
            );
        }
}


// ==================================================
// GLOBAIS
// ==================================================

window.alternarResumo =
    alternarResumo;

window.alternarHistorico =
    alternarHistorico;

window.alternarProdutos =
    alternarProdutos;

window.alternarDados =
    alternarDados;