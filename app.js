const botaoAdicionar = document.getElementById("botaoAdicionar");
const lista = document.getElementById("lista");

const CHAVE = "kijkPantryListaV1";

let itens = [];


// =============================
// ARMAZENAMENTO
// =============================

function carregarDados() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE);

        console.log("Origem:", window.location.origin);
        console.log("Dados encontrados:", dadosSalvos);

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
        const dados = JSON.stringify(itens);

        localStorage.setItem(CHAVE, dados);

        // Confere imediatamente se realmente foi gravado.
        const conferencia = localStorage.getItem(CHAVE);

        console.log("Salvo:", dados);
        console.log("Conferência:", conferencia);

        return conferencia === dados;

    } catch (erro) {
        console.error("Erro ao salvar:", erro);
        return false;
    }
}


// =============================
// INTERFACE
// =============================

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
            <span>${item}</span>
            <button type="button" onclick="removerItem(${indice})">
                ✓
            </button>
        `;

        lista.appendChild(linha);
    });
}


function adicionarItem(nome) {
    itens.push(nome);

    const salvou = salvarDados();

    if (!salvou) {
        alert("ERRO: o celular não conseguiu salvar a lista.");
        itens.pop();
        return;
    }

    atualizarLista();
}


function removerItem(indice) {
    itens.splice(indice, 1);

    salvarDados();
    atualizarLista();
}


// =============================
// BOTÃO
// =============================

botaoAdicionar.addEventListener("click", () => {
    const nome = prompt("Nome do produto:");

    if (!nome || !nome.trim()) {
        return;
    }

    adicionarItem(nome.trim());
});


// =============================
// INICIALIZAÇÃO
// =============================

carregarDados();
atualizarLista();


// Solicita ao navegador armazenamento persistente,
// quando esse recurso estiver disponível.
if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist()
        .then(resultado => {
            console.log("Armazenamento persistente:", resultado);
        })
        .catch(erro => {
            console.log("Persistência não disponível:", erro);
        });
}