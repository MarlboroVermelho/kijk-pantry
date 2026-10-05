const botaoAdicionar = document.getElementById("botaoAdicionar");
const lista = document.getElementById("lista");

let db;

const request = indexedDB.open("kijkPantryDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;

    if (!db.objectStoreNames.contains("listaCompras")) {
        db.createObjectStore("listaCompras", {
            keyPath: "id",
            autoIncrement: true
        });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    carregarLista();
};

request.onerror = function() {
    console.error("Erro ao abrir IndexedDB");
};


function adicionarItem(nome) {
    const transaction = db.transaction(
        ["listaCompras"],
        "readwrite"
    );

    const store = transaction.objectStore("listaCompras");

    store.add({
        nome: nome,
        criadoEm: new Date().toISOString()
    });

    transaction.oncomplete = function() {
        carregarLista();
    };
}


function carregarLista() {
    const transaction = db.transaction(
        ["listaCompras"],
        "readonly"
    );

    const store = transaction.objectStore("listaCompras");

    const request = store.getAll();

    request.onsuccess = function() {
        const itens = request.result;

        lista.innerHTML = "";

        if (itens.length === 0) {
            lista.innerHTML = "<p>Lista vazia.</p>";
            return;
        }

        itens.forEach(item => {
            const linha = document.createElement("div");

            linha.className = "item";

            linha.innerHTML = `
                <span>${item.nome}</span>
                <button onclick="removerItem(${item.id})">
                    ✓
                </button>
            `;

            lista.appendChild(linha);
        });
    };
}


function removerItem(id) {
    const transaction = db.transaction(
        ["listaCompras"],
        "readwrite"
    );

    const store = transaction.objectStore("listaCompras");

    store.delete(id);

    transaction.oncomplete = function() {
        carregarLista();
    };
}


botaoAdicionar.addEventListener("click", () => {
    const nome = prompt("Nome do produto:");

    if (!nome || !nome.trim()) {
        return;
    }

    adicionarItem(nome.trim());
});