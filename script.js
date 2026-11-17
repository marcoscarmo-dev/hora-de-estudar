const formulario = document.querySelector("#form-resumo");
const campoArquivo = document.querySelector("#arquivo-pdf");
const botao = formulario.querySelector("button");
const mensagem = document.querySelector("#mensagem-material");
const material = document.querySelector("#material-selecionado");

const chaveBiblioteca = "hora-de-estudar-biblioteca";
let biblioteca = [];
let resumoAtual = "";
let nomeAtual = "resumo";
let falhaLeitura = false;

// Recupera os estudos salvos
try {
    const dados = JSON.parse(localStorage.getItem(chaveBiblioteca) || "[]");

    if (!Array.isArray(dados)) {
        throw new Error("Biblioteca inválida");
    }

    biblioteca = dados.filter(item =>
        item &&
        typeof item.id === "string" &&
        typeof item.nome === "string" &&
        typeof item.resumo === "string" &&
        typeof item.data === "string"
    );

    // Aproveita o último resumo da versão anterior
    if (!biblioteca.length) {
        const anterior = localStorage.getItem(
            "hora-de-estudar-ultimo-resumo"
        );

        if (anterior) {
            biblioteca.push({
                id: crypto.randomUUID(),
                nome: "Meu primeiro resumo",
                resumo: anterior,
                data: new Date().toISOString()
            });
        }
    }
} catch {
    falhaLeitura = true;
    mensagem.textContent =
        "Não foi possível ler a biblioteca. " +
        "Você ainda pode gerar e baixar resumos.";
}

// Monta a área do resumo
material.replaceChildren();

const titulo = document.createElement("h3");
const baixar = document.createElement("button");
const conteudo = document.createElement("div");

baixar.type = "button";
baixar.textContent = "Baixar resumo (.txt)";
conteudo.className = "texto-resumo";

material.append(titulo, baixar, conteudo);

// Cria a biblioteca abaixo das duas colunas
const secaoBiblioteca = document.createElement("section");
secaoBiblioteca.className = "biblioteca";

const tituloBiblioteca = document.createElement("h2");
tituloBiblioteca.textContent = "Minha biblioteca";

const avisoBiblioteca = document.createElement("p");
avisoBiblioteca.className = "aviso-biblioteca";
avisoBiblioteca.textContent =
    "Resumos salvos neste navegador. " +
    "Baixe os importantes para ter uma cópia.";

const busca = document.createElement("input");
busca.type = "search";
busca.placeholder = "Buscar pelo nome do material";
busca.setAttribute("aria-label", "Buscar na biblioteca");

const listaBiblioteca = document.createElement("div");
listaBiblioteca.className = "lista-biblioteca";

secaoBiblioteca.append(
    tituloBiblioteca,
    avisoBiblioteca,
    busca,
    listaBiblioteca
);

document.querySelector("main").appendChild(secaoBiblioteca);

botao.textContent = "Gerar resumo";

document.querySelector("#aviso-pdf").textContent =
    "PDF de até 10 MB. Enviado ao Google Gemini para análise. " +
    "A faixa gratuita tem limites e pode usar os materiais " +
    "para melhorar os produtos do Google.";

// Salva somente os textos dos resumos, sem os PDFs
function salvarBiblioteca() {
    if (falhaLeitura) return false;

    try {
        localStorage.setItem(
            chaveBiblioteca,
            JSON.stringify(biblioteca)
        );
        return true;
    } catch {
        return false;
    }
}

// Insere negrito com segurança, sem executar HTML
function adicionarTexto(elemento, texto) {
    for (const parte of texto.split(/(\*\*[^*]+\*\*)/g)) {
        if (parte.startsWith("**") && parte.endsWith("**")) {
            const destaque = document.createElement("strong");
            destaque.textContent = parte.slice(2, -2);
            elemento.appendChild(destaque);
        } else {
            elemento.appendChild(document.createTextNode(parte));
        }
    }
}

function formatarResumo(texto) {
    conteudo.replaceChildren();

    const titulos = [
        "TEMA PRINCIPAL",
        "RESUMO PARA ESTUDAR",
        "CONCEITOS IMPORTANTES",
        "PONTOS PARA REVISAR",
        "TRÊS PERGUNTAS DE REVISÃO",
        "PERGUNTAS DE REVISÃO",
        "GABARITO"
    ];

    let listaAtual = null;

    for (const linha of texto.split(/\r?\n/)) {
        const limpa = linha.trim();

        if (!limpa) continue;

        if (/^([-*_])\1{2,}$/.test(limpa)) {
            listaAtual = null;
            continue;
        }

        const semMarcacao = limpa
            .replace(/^#{1,6}\s+/, "")
            .replace(/\*\*/g, "")
            .replace(/:$/, "")
            .trim();

        if (
            /^#{1,6}\s+/.test(limpa) ||
            titulos.includes(semMarcacao.toUpperCase())
        ) {
            const subtitulo = document.createElement("h4");
            subtitulo.textContent = semMarcacao;
            conteudo.appendChild(subtitulo);
            listaAtual = null;
            continue;
        }

        const item = limpa.match(/^([-*•]|\d+[.)])\s+(.+)$/);

        if (item) {
            const tipo = /^\d/.test(item[1]) ? "ol" : "ul";

            if (!listaAtual || listaAtual.localName !== tipo) {
                listaAtual = document.createElement(tipo);

                if (tipo === "ol") {
                    listaAtual.start = parseInt(item[1], 10);
                }

                conteudo.appendChild(listaAtual);
            }

            const elemento = document.createElement("li");
            adicionarTexto(elemento, item[2]);
            listaAtual.appendChild(elemento);
        } else {
            const paragrafo = document.createElement("p");
            adicionarTexto(paragrafo, limpa);
            conteudo.appendChild(paragrafo);
            listaAtual = null;
        }
    }
}

function mostrarResumo(estudo) {
    resumoAtual = estudo.resumo;
    nomeAtual = estudo.nome;
    titulo.textContent = estudo.nome;
    formatarResumo(estudo.resumo);
    material.hidden = false;
}

function renderizarBiblioteca() {
    listaBiblioteca.replaceChildren();

    const termo = busca.value.trim().toLocaleLowerCase("pt-BR");

    const encontrados = biblioteca.filter(estudo =>
        estudo.nome.toLocaleLowerCase("pt-BR").includes(termo)
    );

    if (!encontrados.length) {
        const vazio = document.createElement("p");
        vazio.textContent = biblioteca.length
            ? "Nenhum material encontrado."
            : "Seus resumos aparecerão aqui depois de gerar.";
        listaBiblioteca.appendChild(vazio);
        return;
    }

    for (const estudo of encontrados) {
        const cartao = document.createElement("article");
        cartao.className = "cartao-estudo";

        const nome = document.createElement("h3");
        nome.textContent = estudo.nome;

        const data = document.createElement("p");
        const instante = new Date(estudo.data);
        data.textContent = Number.isNaN(instante.getTime())
            ? "Data não disponível"
            : instante.toLocaleString("pt-BR");

        const acoes = document.createElement("div");
        acoes.className = "acoes-estudo";

        const abrir = document.createElement("button");
        abrir.type = "button";
        abrir.textContent = "Abrir resumo";
        abrir.addEventListener("click", () => {
            mostrarResumo(estudo);
            material.scrollIntoView({ block: "start" });
        });

        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.className = "botao-excluir";
        excluir.textContent = "Excluir";

        excluir.addEventListener("click", () => {
            if (!confirm('Excluir "' + estudo.nome + '" da biblioteca?')) {
                return;
            }

            const anterior = biblioteca;
            biblioteca = biblioteca.filter(item => item.id !== estudo.id);

            if (!salvarBiblioteca()) {
                biblioteca = anterior;
                alert("Não foi possível salvar a exclusão.");
                return;
            }

            renderizarBiblioteca();
        });

        acoes.append(abrir, excluir);
        cartao.append(nome, data, acoes);
        listaBiblioteca.appendChild(cartao);
    }
}

busca.addEventListener("input", renderizarBiblioteca);

baixar.addEventListener("click", () => {
    const arquivo = new Blob([resumoAtual], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    const nomeSeguro = nomeAtual
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
        .slice(0, 100);

    link.href = url;
    link.download = (nomeSeguro || "resumo") + ".txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
});

campoArquivo.addEventListener("change", () => {
    mensagem.hidden = false;
    mensagem.textContent = "PDF escolhido. Clique em Gerar resumo.";
});

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const arquivo = campoArquivo.files[0];
    mensagem.hidden = false;

    if (!arquivo || !arquivo.name.toLowerCase().endsWith(".pdf")) {
        mensagem.textContent = "Escolha um arquivo PDF.";
        return;
    }

    if (arquivo.size === 0 || arquivo.size > 10 * 1024 * 1024) {
        mensagem.textContent =
            "Escolha um PDF com conteúdo e de até 10 MB.";
        return;
    }

    const dados = new FormData();
    dados.append("pdf", arquivo);

    botao.disabled = true;
    campoArquivo.disabled = true;
    botao.textContent = "Gerando resumo…";
    mensagem.textContent = "Preparando seu guia de estudos…";

    try {
        const resposta = await fetch("/api/resumir", {
            method: "POST",
            body: dados
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Falha ao gerar resumo.");
        }

        if (typeof resultado.resumo !== "string" ||
            !resultado.resumo.trim()) {
            throw new Error("O servidor não retornou um resumo.");
        }

        const estudo = {
            id: crypto.randomUUID(),
            nome: arquivo.name.replace(/\.pdf$/i, ""),
            resumo: resultado.resumo,
            data: new Date().toISOString()
        };

        mostrarResumo(estudo);
        biblioteca.unshift(estudo);
        busca.value = "";

        const salvo = salvarBiblioteca();
        renderizarBiblioteca();

        mensagem.textContent = salvo
            ? "Resumo salvo na biblioteca! Confira no PDF original."
            : "Resumo disponível nesta sessão, mas não foi salvo. " +
              "Baixe uma cópia antes de fechar a página.";
    } catch (erro) {
        mensagem.textContent = erro instanceof TypeError
            ? "Não consegui acessar o servidor. Confira o terminal."
            : erro.message;
    } finally {
        botao.disabled = false;
        campoArquivo.disabled = false;
        botao.textContent = "Gerar resumo";
    }
});

// Persiste a migração antes de remover o registro antigo
if (!falhaLeitura && salvarBiblioteca()) {
    try {
        localStorage.removeItem("hora-de-estudar-ultimo-resumo");
    } catch {
        // A biblioteca continua disponível mesmo sem essa limpeza
    }
}

renderizarBiblioteca();