const botaoAdicionar = document.getElementById("botaoAdicionar");
const lista = document.getElementById("lista");

let itens = JSON.parse(
    localStorage.getItem("kijkPantryLista")
) || [];


function salvar() {
    localStorage.setItem(
        "kijkPantryLista",
        JSON.stringify(itens)
    );
}


function carregarLista() {

    lista.innerHTML = "";

    if (itens.length === 0) {
        lista.innerHTML = "<p>Lista vazia.</p>";
        return;
    }

    itens.forEach((item, indice) => {

        const linha = document.createElement("div");

        linha.className = "item";

        linha.innerHTML = `
            <span>${item}</span>

            <button onclick="removerItem(${indice})">
                ✓
            </button>
        `;

        lista.appendChild(linha);
    });
}


function adicionarItem(nome) {

    itens.push(nome);

    salvar();
    carregarLista();
}


function removerItem(indice) {

    itens.splice(indice, 1);

    salvar();
    carregarLista();
}


botaoAdicionar.addEventListener("click", () => {

    const nome = prompt("Nome do produto:");

    if (!nome || !nome.trim()) {
        return;
    }

    adicionarItem(nome.trim());
});


carregarLista();