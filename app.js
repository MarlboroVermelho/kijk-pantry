const VERSAO = "0.9";

const CHAVE_LISTA = "kijkPantryLista";
const CHAVE_PRODUTOS = "kijkPantryProdutos";

let itens = [];
let produtos = [];

let scanner = null;
let scannerAtivo = false;


document.addEventListener("DOMContentLoaded", () => {

    const lista =
        document.getElementById("lista");

    const contador =
        document.getElementById("contador");

    const botaoAdicionar =
        document.getElementById("botaoAdicionar");

    const botaoCodigo =
        document.getElementById("botaoCodigo");

    const botaoScanner =
        document.getElementById("botaoScanner");

    const botaoProdutos =
        document.getElementById("botaoProdutos");

    const botaoLimpar =
        document.getElementById("botaoLimpar");

    const areaProdutos =
        document.getElementById("areaProdutos");

    const produtosBox =
        document.getElementById("produtosBox");

    const scannerModal =
        document.getElementById("scannerModal");

    const botaoFecharScanner =
        document.getElementById("botaoFecharScanner");


    // ==========================
    // DADOS
    // ==========================

    function carregarDados() {

        try {

            const listaSalva =
                localStorage.getItem(CHAVE_LISTA);

            const produtosSalvos =
                localStorage.getItem(CHAVE_PRODUTOS);

            itens = listaSalva
                ? JSON.parse(listaSalva)
                : [];

            produtos = produtosSalvos
                ? JSON.parse(produtosSalvos)
                : [];

        } catch (erro) {

            console.error(
                "Erro ao carregar dados:",
                erro
            );

            itens = [];
            produtos = [];
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


    // ==========================
    // LISTA
    // ==========================

    function totalItens() {

        return itens.reduce(
            (total, item) =>
                total + item.quantidade,
            0
        );
    }


    function atualizarLista() {

        lista.innerHTML = "";

        contador.textContent =
            totalItens();

        if (itens.length === 0) {

            lista.innerHTML = `
                <div class="estado-vazio">
                    Nenhum item na lista
                </div>
            `;

            return;
        }

        itens.forEach((item, indice) => {

            const linha =
                document.createElement("div");

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


    function adicionarItem(nome) {

        nome = nome.trim();

        const existente =
            itens.find(
                item =>
                    item.nome.toLowerCase() ===
                    nome.toLowerCase()
            );

        if (existente) {

            existente.quantidade++;

        } else {

            itens.push({
                nome: nome,
                quantidade: 1
            });
        }

        salvarLista();
        atualizarLista();
    }


    lista.addEventListener(
        "click",
        event => {

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

            if (acao === "mais") {
                itens[indice].quantidade++;
            }

            if (acao === "menos") {

                itens[indice].quantidade--;

                if (
                    itens[indice].quantidade <= 0
                ) {

                    itens.splice(
                        indice,
                        1
                    );
                }
            }

            if (acao === "comprado") {

                itens.splice(
                    indice,
                    1
                );
            }

            salvarLista();
            atualizarLista();
        }
    );


    // ==========================
    // PRODUTOS / EAN
    // ==========================

    function buscarProdutoPorEAN(ean) {

        return produtos.find(
            produto =>
                produto.ean === ean
        );
    }


    function processarEAN(ean) {

        ean =
            String(ean)
                .replace(/\D/g, "");

        if (!ean) {

            alert(
                "Código inválido."
            );

            return;
        }

        const produto =
            buscarProdutoPorEAN(ean);

        if (produto) {

            adicionarItem(
                produto.nome
            );

            alert(
                `${produto.nome} adicionado à lista.`
            );

            return;
        }

        const nome = prompt(
            `Código ${ean} ainda não cadastrado.\n\nNome do produto:`
        );

        if (
            !nome ||
            !nome.trim()
        ) {
            return;
        }

        produtos.push({
            ean: ean,
            nome: nome.trim()
        });

        salvarProdutos();
        atualizarProdutos();

        adicionarItem(
            nome.trim()
        );

        alert(
            `${nome.trim()} cadastrado e adicionado.`
        );
    }


    function adicionarPorCodigo() {

        const entrada = prompt(
            "Digite o código de barras (EAN):"
        );

        if (!entrada) {
            return;
        }

        processarEAN(
            entrada
        );
    }


    function atualizarProdutos() {

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


    // ==========================
    // SCANNER
    // ==========================

    async function abrirScanner() {

        if (
            typeof Html5Qrcode ===
            "undefined"
        ) {

            alert(
                "O leitor de código de barras não foi carregado."
            );

            return;
        }

        scannerModal.hidden = false;

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

                    if (!scannerAtivo) {
                        return;
                    }

                    scannerAtivo = false;

                    await fecharScanner();

                    processarEAN(
                        decodedText
                    );
                },

                () => {
                    // Ignora frames sem código.
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
                "Não foi possível abrir a câmera.\n\nVerifique a permissão de câmera do KIJK Pantry."
            );
        }
    }


    async function fecharScanner() {

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

        scannerModal.hidden = true;
    }


    // ==========================
    // OUTROS BOTÕES
    // ==========================

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
            nome
        );
    }


    function alternarProdutos() {

        const oculto =
            areaProdutos.hidden;

        areaProdutos.hidden =
            !oculto;

        botaoProdutos.textContent =
            oculto
                ? "Ocultar produtos cadastrados"
                : "Produtos cadastrados";

        if (oculto) {
            atualizarProdutos();
        }
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


    // ==========================
    // EVENTOS
    // ==========================

    botaoAdicionar.addEventListener(
        "click",
        adicionarManualmente
    );

    botaoCodigo.addEventListener(
        "click",
        adicionarPorCodigo
    );

    botaoScanner.addEventListener(
        "click",
        abrirScanner
    );

    botaoFecharScanner.addEventListener(
        "click",
        fecharScanner
    );

    botaoProdutos.addEventListener(
        "click",
        alternarProdutos
    );

    botaoLimpar.addEventListener(
        "click",
        limparLista
    );


    // ==========================
    // INÍCIO
    // ==========================

    carregarDados();

    atualizarLista();
    atualizarProdutos();

});