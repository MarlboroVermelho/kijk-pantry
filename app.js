const VERSAO = "1.0";

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


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    carregarDados();

    atualizarLista();
    atualizarProdutos();
    atualizarHistorico();

    configurarEventos();
});


// ==========================================
// ELEMENTOS
// ==========================================

function el(id) {
    return document.getElementById(id);
}


// ==========================================
// ARMAZENAMENTO
// ==========================================

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
        console.error("Erro ao carregar dados:", erro);

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


// ==========================================
// MENSAGENS
// ==========================================

function mostrarMensagem(texto) {
    const toast = el("toast");

    if (!toast) {
        return;
    }

    clearTimeout(timerToast);

    toast.textContent = texto;
    toast.hidden = false;

    timerToast = setTimeout(() => {
        toast.hidden = true;
    }, 2300);
}


// ==========================================
// HISTÓRICO
// ==========================================

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
}


function formatarData(dataISO) {
    const data = new Date(dataISO);

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


function atualizarHistorico() {
    const historicoBox = el("historicoBox");

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

    const eventos = [...historico].reverse();

    eventos.forEach(evento => {
        const linha = document.createElement("div");

        linha.className = "evento-historico";

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

        historicoBox.appendChild(linha);
    });
}


function alternarHistorico() {
    const areaHistorico = el("areaHistorico");
    const areaProdutos = el("areaProdutos");

    const botaoHistorico = el("botaoHistorico");
    const botaoProdutos = el("botaoProdutos");

    if (!areaHistorico) {
        return;
    }

    const abrir = areaHistorico.hidden;

    areaHistorico.hidden = !abrir;

    if (botaoHistorico) {
        botaoHistorico.textContent =
            abrir
                ? "Ocultar histórico"
                : "Histórico";
    }

    if (abrir) {
        atualizarHistorico();

        if (areaProdutos) {
            areaProdutos.hidden = true;
        }

        if (botaoProdutos) {
            botaoProdutos.textContent =
                "Produtos cadastrados";
        }
    }
}


function limparHistorico() {
    if (historico.length === 0) {
        return;
    }

    const confirmar = confirm(
        "Apagar todo o histórico?"
    );

    if (!confirmar) {
        return;
    }

    historico = [];

    salvarHistorico();
    atualizarHistorico();
}


// ==========================================
// LISTA
// ==========================================

function totalItens() {
    return itens.reduce(
        (total, item) =>
            total + item.quantidade,
        0
    );
}


function atualizarLista() {
    const lista = el("lista");
    const contador = el("contador");

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    if (contador) {
        contador.textContent = totalItens();
    }

    if (itens.length === 0) {
        lista.innerHTML = `
            <div class="estado-vazio">
                Nenhum item na lista
            </div>
        `;

        return;
    }

    itens.forEach((item, indice) => {
        const linha = document.createElement("div");

        linha.className = "item";

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

        lista.appendChild(linha);
    });
}


function adicionarItem(
    nome,
    ean = null,
    registrar = true
) {
    nome = nome.trim();

    const existente =
        itens.find(
            item =>
                item.nome.toLowerCase() ===
                nome.toLowerCase()
        );

    if (existente) {
        existente.quantidade++;

        if (!existente.ean && ean) {
            existente.ean = ean;
        }

    } else {
        itens.push({
            nome: nome,
            quantidade: 1,
            ean: ean
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

        if (item.quantidade <= 0) {
            itens.splice(
                indice,
                1
            );
        }
    }

    if (acao === "comprado") {
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
}


function limparLista() {
    if (itens.length === 0) {
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
}


// ==========================================
// PRODUTOS
// ==========================================

function buscarProdutoPorEAN(ean) {
    return produtos.find(
        produto =>
            produto.ean === ean
    );
}


function atualizarProdutos() {
    const produtosBox = el("produtosBox");

    if (!produtosBox) {
        return;
    }

    produtosBox.innerHTML = "";

    if (produtos.length === 0) {
        produtosBox.innerHTML = `
            <div class="estado-vazio">
                Nenhum produto cadastrado
            </div>
        `;

        return;
    }

    produtos.forEach(produto => {
        const linha =
            document.createElement("div");

        linha.className =
            "produto-cadastrado";

        linha.innerHTML = `
            <strong>
                ${produto.nome}
            </strong>

            <span>
                EAN ${produto.ean}
            </span>
        `;

        produtosBox.appendChild(
            linha
        );
    });
}


function processarEAN(ean) {
    ean =
        String(ean)
            .replace(/\D/g, "");

    if (!ean) {
        mostrarMensagem(
            "Código inválido"
        );

        return;
    }

    const produto =
        buscarProdutoPorEAN(ean);

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

    const nome = prompt(
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

    produtos.push({
        ean: ean,
        nome: nomeLimpo
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
    const entrada = prompt(
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
    const nome = prompt(
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


function alternarProdutos() {
    const areaProdutos =
        el("areaProdutos");

    const areaHistorico =
        el("areaHistorico");

    const botaoProdutos =
        el("botaoProdutos");

    const botaoHistorico =
        el("botaoHistorico");

    if (!areaProdutos) {
        return;
    }

    const abrir =
        areaProdutos.hidden;

    areaProdutos.hidden =
        !abrir;

    if (botaoProdutos) {
        botaoProdutos.textContent =
            abrir
                ? "Ocultar produtos cadastrados"
                : "Produtos cadastrados";
    }

    if (abrir) {
        atualizarProdutos();

        if (areaHistorico) {
            areaHistorico.hidden = true;
        }

        if (botaoHistorico) {
            botaoHistorico.textContent =
                "Histórico";
        }
    }
}


// ==========================================
// SCANNER
// ==========================================

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

    scannerModal.hidden = false;

    leituraEmAndamento = false;

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
        scannerAtivo = true;

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

        scannerAtivo = false;

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

    scannerAtivo = false;

    if (scanner) {
        try {
            scanner.clear();
        } catch {
            // Ignora
        }
    }

    scanner = null;

    if (scannerModal) {
        scannerModal.hidden =
            true;
    }
}


// ==========================================
// EVENTOS
// ==========================================

function configurarEventos() {
    const lista =
        el("lista");

    const botaoAdicionar =
        el("botaoAdicionar");

    const botaoCodigo =
        el("botaoCodigo");

    const botaoScanner =
        el("botaoScanner");

    const botaoFecharScanner =
        el("botaoFecharScanner");

    const botaoProdutos =
        el("botaoProdutos");

    const botaoHistorico =
        el("botaoHistorico");

    const botaoLimpar =
        el("botaoLimpar");

    const botaoLimparHistorico =
        el("botaoLimparHistorico");


    if (lista) {
        lista.addEventListener(
            "click",
            lidarCliqueLista
        );
    }


    if (botaoAdicionar) {
        botaoAdicionar.addEventListener(
            "click",
            adicionarManualmente
        );
    }


    if (botaoCodigo) {
        botaoCodigo.addEventListener(
            "click",
            adicionarPorCodigo
        );
    }


    if (botaoScanner) {
        botaoScanner.addEventListener(
            "click",
            abrirScanner
        );
    }


    if (botaoFecharScanner) {
        botaoFecharScanner.addEventListener(
            "click",
            fecharScanner
        );
    }


    if (botaoProdutos) {
        botaoProdutos.addEventListener(
            "click",
            alternarProdutos
        );
    }


    if (botaoHistorico) {
        botaoHistorico.addEventListener(
            "click",
            alternarHistorico
        );
    }


    if (botaoLimpar) {
        botaoLimpar.addEventListener(
            "click",
            limparLista
        );
    }


    if (botaoLimparHistorico) {
        botaoLimparHistorico.addEventListener(
            "click",
            limparHistorico
        );
    }
}


// ==========================================
// FUNÇÕES GLOBAIS
// ==========================================
// Deixo essas globais também, para evitar problema
// caso algum botão do HTML use onclick.

window.alternarHistorico =
    alternarHistorico;

window.alternarProdutos =
    alternarProdutos;