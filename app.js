const VERSAO = "0.6";
const CHAVE = "kijkPantryLista";

const botaoAdicionar = document.getElementById("botaoAdicionar");
const lista = document.getElementById("lista");

let itens = [];

function carregarDados() {
    const salvo = localStorage.getItem(CHAVE);

    if (salvo) {
        itens = JSON.parse(salvo);
    }
}

function salvarDados() {
    localStorage.setItem(CHAVE, JSON.stringify(itens));
}

function atualizarLista() {
    lista.innerHTML = "";

    if (itens.length === 0) {
        lista.innerHTML = "<p>Lista vazia.</p>";
        return;
    }

    itens.forEach((item, indice) => {
        const linha = document.createElement("div");
        linha.className = "item";

        linha.innerHTML = `
            <span>
                ${item.nome}
                ${item.quantidade > 1 ? `x${item.quantidade}` : ""}
            </span>

            <button onclick="marcarComprado(${indice})">
                ✓
            </button>
        `;

        lista.appendChild(linha);
    });
}

function adicionarItem(nome) {
    nome = nome.trim();

    const existente = itens.find(
        item => item.nome.toLowerCase() === nome.toLowerCase()
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

function marcarComprado(indice) {
    itens.splice(indice, 1);

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

carregarDados();
atualizarLista();

document.title = `KIJK Pantry V${VERSAO}`;