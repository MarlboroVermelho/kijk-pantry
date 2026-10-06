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

    const botaoHistorico =
        document.getElementById("botaoHistorico");

    const botaoLimpar =
        document.getElementById("botaoLimpar");

    const botaoLimparHistorico =
        document.getElementById("botaoLimparHistorico");

    const areaProdutos =
        document.getElementById("areaProdutos");

    const areaHistorico =
        document.getElementById("areaHistorico");

    const produtosBox =
        document.getElementById("produtosBox");

    const historicoBox =
        document.getElementById("historicoBox");

    const scannerModal =
        document.getElementById("scannerModal");

    const botaoFecharScanner =
        document.getElementById("botaoFecharScanner");

    const toast =
        document.getElementById("toast");


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


    // ==========================================
    // MENSAGENS
    // ==========================================

    let timerToast;


    function mostrarMensagem(texto) {

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


    function atualizarHistorico() {

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
                        ? `<span class="evento-quantidade">
                               x${evento.quantidade}
                           </span>`
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
    );


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


    // ==========================================
    // SCANNER
    // ==========================================

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
                // Ignora.
            }
        }


        scanner = null;

        scannerModal.hidden =
            true;
    }


    // ==========================================
    // OUTROS CONTROLES
    // ==========================================

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

        const abrir =
            areaProdutos.hidden;


        areaProdutos.hidden =
            !abrir;


        botaoProdutos.textContent =
            abrir
                ? "Ocultar produtos cadastrados"
                : "Produtos cadastrados";


        if (abrir) {

            atualizarProdutos();

            areaHistorico.hidden =
                true;

            botaoHistorico.textContent =
                "Histórico";
        }
    }


    function alternarHistorico() {

        const abrir =
            areaHistorico.hidden;


        areaHistorico.hidden =
            !abrir;


        botaoHistorico.textContent =
            abrir
                ? "Ocultar histórico"
                : "Histórico";


        if (abrir) {

            atualizarHistorico();

            areaProdutos.hidden =
                true;

            botaoProdutos.textContent =
                "Produtos cadastrados";
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
    }


    // ==========================================
    // EVENTOS
    // ==========================================

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


    botaoHistorico.addEventListener(
        "click",
        alternarHistorico
    );


    botaoLimpar.addEventListener(
        "click",
        limparLista
    );


    botaoLimparHistorico.addEventListener(
        "click",
        limparHistorico
    );


    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    carregarDados();

    atualizarLista();
    atualizarProdutos();
    atualizarHistorico();

});