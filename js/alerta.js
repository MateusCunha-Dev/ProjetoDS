// ==============================================
// FUNÇÕES PRINCIPAIS
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
    exibirAlertas(); // Carrega alertas ao abrir a página
    verificarAutenticacao(); // Protege a página
    carregarNomeUsuario(); // Exibe o nome do usuário
});

// Cadastra um novo alerta
function cadastrarAlerta() {
    const produtoId = document.getElementById('produtoId').value.trim();
    const valorDesejado = parseFloat(document.getElementById('valorDesejado').value);
    const acao = document.getElementById('acao').value;

    // Validação
    if (!produtoId || isNaN(valorDesejado) || valorDesejado <= 0) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    const novoAlerta = {
        id: Date.now(), // ID único
        produtoId,
        valorDesejado,
        acao,
        status: "ativo",
        dataCriacao: new Date().toLocaleString('pt-BR')
    };

    // Salva no localStorage
    const alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    alertas.push(novoAlerta);
    localStorage.setItem('alertas', JSON.stringify(alertas));

    // Atualiza a UI
    exibirAlertas();
    document.getElementById('formAlerta').reset();

    alert("Alerta cadastrado com sucesso!");
}

// Exibe todos os alertas na tela
function exibirAlertas() {
    const alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    const container = document.getElementById('alertasContainer');

    if (alertas.length === 0) {
        container.innerHTML = "<p class='sem-alertas'>Nenhum alerta cadastrado.</p>";
        return;
    }

    let html = alertas.map(alerta => `
        <div class="alerta-item" data-id="${alerta.id}">
            <div class="alerta-info">
                <p><strong>Produto ID:</strong> ${alerta.produtoId}</p>
                <p><strong>Valor Desejado:</strong> R$ ${alerta.valorDesejado.toFixed(2)}</p>
                <p><strong>Ação:</strong> ${alerta.acao === 'notificar' ? '🔔 Notificar' : '🛒 Comprar'}</p>
                <p><strong>Criado em:</strong> ${alerta.dataCriacao}</p>
                <p><strong>Status:</strong> ${alerta.status === 'ativo' ? '🟢 Ativo' : '🔴 Acionado'}</p>
            </div>
            <button class="btn-remover" onclick="removerAlerta(${alerta.id})">
                🗑️ Remover
            </button>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Remove um alerta
function removerAlerta(id) {
    if (!confirm("Deseja realmente remover este alerta?")) return;

    let alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    alertas = alertas.filter(alerta => alerta.id !== id);
    localStorage.setItem('alertas', JSON.stringify(alertas));
    exibirAlertas();
}

// ==============================================
// INTEGRAÇÃO COM API DA ODINLINE
// ==============================================

// Busca um produto na API (simplificado)
async function buscarProdutoNaAPI(id) {
    try {
        const resposta = await fetch(`https://api-odinline.odiloncorrea.com/produto/${id}`);
        if (!resposta.ok) throw new Error("Produto não encontrado");
        return await resposta.json();
    } catch (error) {
        console.error("Erro na API:", error);
        return null;
    }
}

// Monitora preços periodicamente
async function monitorarPrecos() {
    const alertasAtivos = JSON.parse(localStorage.getItem('alertas'))?.filter(a => a.status === "ativo") || [];

    for (const alerta of alertasAtivos) {
        const produto = await buscarProdutoNaAPI(alerta.produtoId);
        if (!produto) continue;

        const valorAtual = parseFloat(produto.valor);
        if (valorAtual <= alerta.valorDesejado) {
            executarAcao(alerta, produto);
            atualizarStatusAlerta(alerta.id, "acionado");
        }
    }
}

// Executa a ação definida no alerta
function executarAcao(alerta, produto) {
    if (alerta.acao === "notificar") {
        // Exibe notificação
        alert(`🔔 ALERTA: O produto ${produto.descricao} atingiu R$ ${produto.valor}!`);
    } else {
        // Registra compra
        const compra = {
            produtoId: alerta.produtoId,
            valorPago: produto.valor,
            data: new Date().toLocaleString('pt-BR')
        };
        const compras = JSON.parse(localStorage.getItem('compras')) || [];
        compras.push(compra);
        localStorage.setItem('compras', JSON.stringify(compras));
        alert(`🛒 COMPRA REGISTRADA: ${produto.descricao} por R$ ${produto.valor}`);
    }
}

// Atualiza status do alerta
function atualizarStatusAlerta(id, status) {
    let alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    alertas = alertas.map(alerta => 
        alerta.id === id ? { ...alerta, status } : alerta
    );
    localStorage.setItem('alertas', JSON.stringify(alertas));
    exibirAlertas();
}

// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================

// Verifica se o usuário está autenticado
function verificarAutenticacao() {
    if (!localStorage.getItem('usuarioAutenticado')) {
        window.location.href = "index.html";
    }
}

// Exibe o nome do usuário logado
function carregarNomeUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuarioAutenticado'));
    if (usuario && document.getElementById('nomeUsuario')) {
        document.getElementById('nomeUsuario').textContent = usuario.nome;
    }
}

// ==============================================
// INICIALIZAÇÃO DO MONITORAMENTO
// ==============================================

// Verifica preços a cada 1 minuto (para testes)
// Em produção, use um intervalo maior (ex: 5-10 minutos)
setInterval(monitorarPrecos, 60000);

// Opcional: Forçar verificação manual via botão
window.verificarAgora = monitorarPrecos;