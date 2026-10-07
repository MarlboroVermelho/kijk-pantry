const VERSAO = "1.4";

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

function registrarEvento(
    tipo,
    nome,
    ean = null,
    quantidade = 1
) {

    historico.push({

        id: Date.now(),

        tipo: tipo,

        nome: nome,

        ean: ean,

        quantidade: quantidade,

        data: new Date().toISOString()
    });


    salvarHistorico();

    atualizarHistorico();
    atualizarResumo();
    atualizarPrevisoes();
    atualizarProdutos();
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


        const classeTipo =
            evento.tipo === "acabou"
                ? "acabou"
                : "comprado";


        const textoTipo =
            evento.tipo === "acabou"
                ? "ACABOU"
                : "COMPRADO";


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


function calcularResumoProduto(produto) {

    const eventos =
        eventosDoProduto(produto);


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

            duracoes.push(
                diferencaDias(
                    atual.data,
                    proximo.data
                )
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
            ? eventos[eventos.length - 1]
            : null;


    return {

        duracaoMedia:
            media(duracoes),

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
// PREVISÕES
// ==================================================

function calcularPrevisao(produto) {

    const resumo =
        calcularResumoProduto(produto);


    if (
        resumo.duracaoMedia === null ||
        !resumo.ultimoEvento
    ) {

        return null;
    }


    if (
        resumo.ultimoEvento.tipo !==
        "comprado"
    ) {

        return {

            produto: produto,

            situacao: "acabou",

            diasRestantes: 0,

            dataPrevista: null,

            duracaoMedia:
                resumo.duracaoMedia
        };
    }


    const dataCompra =
        new Date(
            resumo.ultimoEvento.data
        );


    const milissegundosDuracao =
        resumo.duracaoMedia *
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
            resumo.duracaoMedia *
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
            resumo.duracaoMedia
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

function adicionarPrevisaoALista(produto) {

    if (!produto) {
        return;
    }


    const existente =
        itens.find(item => {

            if (
                produto.ean &&
                item.ean
            ) {

                return (
                    String(produto.ean) ===
                    String(item.ean)
                );
            }


            return (
                String(item.nome)
                    .toLowerCase() ===
                String(produto.nome)
                    .toLowerCase()
            );
        });


    if (existente) {

        existente.quantidade++;

        salvarLista();

        atualizarLista();
        atualizarPrevisoes();

        mostrarMensagem(
            `${produto.nome} já estava na lista. Quantidade aumentada.`
        );

        return;
    }


    itens.push({

        nome:
            produto.nome,

        quantidade:
            1,

        ean:
            produto.ean || null
    });


    salvarLista();


    registrarEvento(
        "acabou",
        produto.nome,
        produto.ean || null,
        1
    );


    atualizarLista();
    atualizarPrevisoes();


    mostrarMensagem(
        `${produto.nome} adicionado à lista`
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


    if (previsoes.length === 0) {

        previsoesBox.innerHTML = `
            <div class="estado-previsao-vazio">

                Ainda preciso observar pelo menos um ciclo

                <strong>
                    comprado → acabou
                </strong>

                para começar a prever.

            </div>
        `;

        return;
    }


    previsoes.sort(
        (a, b) => {

            if (
                a.situacao === "acabou" &&
                b.situacao !== "acabou"
            ) {
                return -1;
            }


            if (
                b.situacao === "acabou" &&
                a.situacao !== "acabou"
            ) {
                return 1;
            }


            return (
                a.diasRestantes -
                b.diasRestantes
            );
        }
    );


    previsoes
        .slice(0, 5)
        .forEach(previsao => {

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


            info.appendChild(
                nome
            );

            info.appendChild(
                detalhe
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


            /*
                Só oferecemos adicionar automaticamente
                quando realmente há uma previsão acionável.
            */

            if (
                previsao.situacao ===
                "atencao" ||

                previsao.situacao ===
                "provavel"
            ) {

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
        });
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

            ultimoTexto =
                resumo.ultimoEvento.tipo ===
                "acabou"
                    ? "ACABOU"
                    : "COMPRADO";
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
                        Duração média
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


function adicionarItem(
    nome,
    ean = null,
    registrar = true
) {

    nome =
        nome.trim();


    const existente =
        itens.find(
            item =>
                item.nome
                    .toLowerCase() ===
                nome
                    .toLowerCase()
        );


    if (existente) {

        existente.quantidade++;


        if (
            !existente.ean &&
            ean
        ) {

            existente.ean =
                ean;
        }

    } else {

        itens.push({

            nome:
                nome,

            quantidade:
                1,

            ean:
                ean
        });
    }


    salvarLista();


    if (registrar) {

        registrarEvento(
            "acabou",
            nome,
            ean,
            1
        );
    }


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


    if (acao === "mais") {

        item.quantidade++;
    }


    if (acao === "menos") {

        item.quantidade--;


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

    atualizarLista();
    atualizarPrevisoes();
}


function limparLista() {

    if (
        itens.length === 0
    ) {

        return;
    }


    const confirmar =
        confirm(
            "Limpar toda a lista?"
        );


    if (!confirmar) {
        return;
    }


    itens = [];


    salvarLista();

    atualizarLista();
    atualizarPrevisoes();
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
            el("areaProdutos")
    };


    const botoes = {

        resumo:
            el("botaoResumo"),

        historico:
            el("botaoHistorico"),

        produtos:
            el("botaoProdutos")
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
        ]
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