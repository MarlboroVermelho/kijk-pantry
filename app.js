const VERSAO = "0.8";

const CHAVE_LISTA = "kijkPantryLista";
const CHAVE_PRODUTOS = "kijkPantryProdutos";

const botaoAdicionar = document.getElementById("botaoAdicionar");
const botaoCodigo = document.getElementById("botaoCodigo");
const botaoProdutos = document.getElementById("botaoProdutos");
const botaoLimpar = document.getElementById("botaoLimpar");

const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const produtosBox = document.getElementById("produtosBox");

let itens = [];
let produtos = [];


function carregarDados() {
    try {
        const listaSalva = localStorage.getItem(CHAVE_LISTA);
        const produtosSalvos = localStorage.getItem(CHAVE_PRODUTOS);

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
        (total, item) => total + item.quantidade,
        0
    );
}


function atualizarLista() {
    lista.innerHTML = "";

    contador.textContent = totalItens();

    if (itens.length === 0) {
        lista.innerHTML = `
            <div class="lista-vazia">
                <p>Sua lista está vazia.</p>
            </div>
        `;

        return;
    }

    itens.forEach((item, indice) => {
        const linha = document.createElement("div");

        linha.className = "item";

        linha.innerHTML = `
            <div class="item-info">
                <span class="item-nome">
                    ${item.nome}
                </span>

                <span class="item-quantidade">
                    x${item.quantidade}
                </span>
            </div>

            <div class="item-acoes">

                <button
                    class="botao-quantidade"
                    onclick="diminuirQuantidade(${indice})"
                >
                    −
                </button>

                <button
                    class="botao-quantidade"
                    onclick="aumentarQuantidade(${indice})"
                >
                    +
                </button>

                <button
                    class="botao-comprado"
                    onclick="marcarComprado(${indice})"
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
            <p class="lista-vazia">
                Nenhum produto cadastrado.
            </p>
        `;

        return;
    }

    produtos.forEach(produto => {
        const linha = document.createElement("div");

        linha.className = "produto-cadastrado";

        linha.innerHTML = `
            <span class="produto-nome">
                ${produto.nome}
            </span>

            <span class="produto-ean">
                ${produto.ean}
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


function aumentarQuantidade(indice) {
    itens[indice].quantidade++;

    salvarLista();
    atualizarLista();
}


function diminuirQuantidade(indice) {
    itens[indice].quantidade--;

    if (itens[indice].quantidade <= 0) {
        itens.splice(indice, 1);
    }

    salvarLista();
    atualizarLista();
}


function marcarComprado(indice) {
    itens.splice(indice, 1);

    salvarLista();
    atualizarLista();
}


function limparLista() {
    if (itens.length === 0) {
        return;
    }

    const confirmar = confirm(
        "Limpar toda a lista de compras?"
    );

    if (!confirmar) {
        return;
    }

    itens = [];

    salvarLista();
    atualizarLista();
}


function buscarProdutoPorEAN(ean) {
    return produtos.find(
        produto => produto.ean === ean
    );
}


function cadastrarProduto(ean, nome) {
    produtos.push({
        ean: ean,
        nome: nome
    });

    salvarProdutos();
    atualizarProdutos();
}


function adicionarPorCodigo() {
    const ean = prompt(
        "Digite o código de barras (EAN):"
    );

    if (!ean || !ean.trim()) {
        return;
    }

    const codigo = ean.trim();

    const produto = buscarProdutoPorEAN(codigo);

    if (produto) {
        adicionarItem(produto.nome);

        alert(
            `${produto.nome} adicionado à lista.`
        );

        return;
    }

    const nome = prompt(
        "Produto não cadastrado.\n\nDigite o nome do produto:"
    );

    if (!nome || !nome.trim()) {
        return;
    }

    cadastrarProduto(
        codigo,
        nome.trim()
    );

    adicionarItem(
        nome.trim()
    );

    alert(
        `${nome.trim()} cadastrado e adicionado à lista.`
    );
}


function adicionarManualmente() {
    const nome = prompt(
        "Nome do produto:"
    );

    if (!nome || !nome.trim()) {
        return;
    }

    adicionarItem(
        nome.trim()
    );
}


function alternarProdutos() {
    const estaOculto =
        produtosBox.parentElement.classList.contains(
            "oculto"
        );

    if (estaOculto) {
        produtosBox.parentElement.classList.remove(
            "oculto"
        );

        botaoProdutos.textContent =
            "Ocultar produtos";

        atualizarProdutos();

    } else {
        produtosBox.parentElement.classList.add(
            "oculto"
        );

        botaoProdutos.textContent =
            "Produtos cadastrados";
    }
}


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

document.title =
    `KIJK Pantry V${VERSAO}`;