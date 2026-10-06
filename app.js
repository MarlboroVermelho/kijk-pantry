const VERSAO = "0.8";

const CHAVE_LISTA = "kijkPantryLista";
const CHAVE_PRODUTOS = "kijkPantryProdutos";

let itens = [];
let produtos = [];


document.addEventListener("DOMContentLoaded", () => {

    const lista = document.getElementById("lista");
    const contador = document.getElementById("contador");

    const botaoAdicionar = document.getElementById("botaoAdicionar");
    const botaoCodigo = document.getElementById("botaoCodigo");
    const botaoProdutos = document.getElementById("botaoProdutos");
    const botaoLimpar = document.getElementById("botaoLimpar");

    const areaProdutos = document.getElementById("areaProdutos");
    const produtosBox = document.getElementById("produtosBox");


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
            console.error("Erro ao carregar dados:", erro);

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


    function totalItens() {
        return itens.reduce(
            (total, item) =>
                total + item.quantidade,
            0
        );
    }


    function atualizarLista() {

        lista.innerHTML = "";

        contador.textContent = totalItens();

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

            produtosBox.appendChild(linha);
        });
    }


    function adicionarItem(nome) {

        nome = nome.trim();

        const existente = itens.find(
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


    function adicionarManualmente() {

        const nome = prompt(
            "Nome do produto:"
        );

        if (!nome || !nome.trim()) {
            return;
        }

        adicionarItem(nome);
    }


    function buscarProdutoPorEAN(ean) {

        return produtos.find(
            produto =>
                produto.ean === ean
        );
    }


    function adicionarPorCodigo() {

        const entrada = prompt(
            "Digite o código de barras (EAN):"
        );

        if (!entrada) {
            return;
        }

        const ean =
            entrada.replace(/\D/g, "");

        if (!ean) {

            alert(
                "Digite um código de barras válido."
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
            "Código ainda não cadastrado.\n\nQual é o nome do produto?"
        );

        if (!nome || !nome.trim()) {
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


    function limparLista() {

        if (itens.length === 0) {
            return;
        }

        const confirmar = confirm(
            "Limpar toda a lista?"
        );

        if (!confirmar) {
            return;
        }

        itens = [];

        salvarLista();
        atualizarLista();
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

                itens[indice]
                    .quantidade++;

            }


            if (acao === "menos") {

                itens[indice]
                    .quantidade--;

                if (
                    itens[indice]
                        .quantidade <= 0
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


    botaoAdicionar.addEventListener(
        "click",
        adicionarManualmente
    );


    botaoCodigo.addEventListener(
        "click",
        adicionarPorCodigo
    );


    botaoProdutos.addEventListener(
        "click",
        alternarProdutos
    );


    botaoLimpar.addEventListener(
        "click",
        limparLista
    );


    carregarDados();
    atualizarLista();
    atualizarProdutos();

});