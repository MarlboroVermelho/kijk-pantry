const VERSAO = "0.7";
const CHAVE = "kijkPantryLista";

const botaoAdicionar = document.getElementById("botaoAdicionar");
const botaoLimpar = document.getElementById("botaoLimpar");
const lista = document.getElementById("lista");
const contador = document.getElementById("contador");

let itens = [];


function carregarDados() {
    const salvo = localStorage.getItem(CHAVE);

    if (salvo) {
        try {
            itens = JSON.parse(salvo);
        } catch {
            itens = [];
        }
    }
}


function salvarDados() {
    localStorage.setItem(
        CHAVE,
        JSON.stringify(itens)
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

    salvarDados();
    atualizarLista();
}


function aumentarQuantidade(indice) {
    itens[indice].quantidade++;

    salvarDados();
    atualizarLista();
}


function diminuirQuantidade(indice) {
    itens[indice].quantidade--;

    if (itens[indice].quantidade <= 0) {
        itens.splice(indice, 1);
    }

    salvarDados();
    atualizarLista();
}


function marcarComprado(indice) {
    itens.splice(indice, 1);

    salvarDados();
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

    salvarDados();
    atualizarLista();
}


botaoAdicionar.addEventListener("click", () => {
    const nome = prompt("Nome do produto:");

    if (!nome || !nome.trim()) {
        return;
    }

    adicionarItem(nome);
});


botaoLimpar.addEventListener("click", limparLista);


carregarDados();
atualizarLista();

document.title = `KIJK Pantry V${VERSAO}`;