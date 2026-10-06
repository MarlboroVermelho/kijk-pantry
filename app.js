const botaoAdicionar = document.getElementById("botaoAdicionar");
const lista = document.getElementById("lista");

const CHAVE = "kijkPantryListaV2";

let itens = [];


function carregarDados() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE);

        if (dadosSalvos) {
            itens = JSON.parse(dadosSalvos);
        } else {
            itens = [];
        }
    } catch (erro) {
        console.error("Erro ao carregar:", erro);
        itens = [];
    }
}


function salvarDados() {
    try {
        localStorage.setItem(
            CHAVE,
            JSON.stringify(itens)
        );

        return true;
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
        return false;
    }
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

        const quantidade =
            item.quantidade > 1
                ? ` x${item.quantidade}`
                : "";

        linha.innerHTML = `
            <span>
                ${item.nome}${quantidade}
            </span>

            <button
                type="button"
                onclick="marcarComprado(${indice})"
            >
                ✓
            </button>
        `;

        lista.appendChild(linha);
    });
}


function adicionarItem(nome) {
    const nomeNormalizado = nome.trim();

    const existente = itens.find(
        item =>
            item.nome.toLowerCase() ===
            nomeNormalizado.toLowerCase()
    );

    if (existente) {
        existente.quantidade += 1;
    } else {
        itens.push({
            nome: nomeNormalizado,
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