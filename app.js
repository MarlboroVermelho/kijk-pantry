const botaoAdicionar = document.getElementById("botaoAdicionar");
const lista = document.getElementById("lista");

let itens = [];

function atualizarLista() {
    if (itens.length === 0) {
        lista.innerHTML = "<p>Lista vazia.</p>";
        return;
    }

    lista.innerHTML = "";

    itens.forEach((item, indice) => {
        const elemento = document.createElement("p");

        elemento.textContent = `${indice + 1}. ${item}`;

        lista.appendChild(elemento);
    });
}

botaoAdicionar.addEventListener("click", () => {
    const nome = prompt("Nome do produto:");

    if (!nome) {
        return;
    }

    itens.push(nome);

    atualizarLista();
});
