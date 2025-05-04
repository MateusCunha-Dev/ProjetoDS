document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacao();
    carregarNomeUsuario();
    exibirAlertas();
});

// Funções de autenticação
function verificarAutenticacao() {
    if (!localStorage.getItem('usuarioAutenticado')) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "index.html";
    }
}

function carregarNomeUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuarioAutenticado'));
    if (usuario && document.getElementById('nomeUsuario')) {
        document.getElementById('nomeUsuario').textContent = usuario.nome;
    }
}

// Funções de alerta
function cadastrarAlerta() {
    // Captura segura dos valores com tratamento de vírgula
    const produtoId = document.getElementById('produtoId').value.trim();
    const produtoNome = document.getElementById('produtoNome').value.trim();
    const valorAtual = parseFloat(document.getElementById('valorAtual').value.replace(',', '.')) || 0;
    const valorDesejado = parseFloat(document.getElementById('valorDesejado').value.replace(',', '.')) || 0;
    const acao = document.getElementById('acao').value;

    // Validação reforçada
    if (!produtoId || !produtoNome || valorAtual <= 0 || valorDesejado <= 0) {
        alert("Preencha todos os campos corretamente com valores positivos!");
        return;
    }

    if (valorDesejado >= valorAtual) {
        alert("O valor desejado deve ser MENOR que o valor atual!");
        return;
    }

    // Criação do alerta com valores garantidos como números
    const novoAlerta = {
        id: Date.now(),
        produtoId,
        produtoNome,
        valorAtual: Number(valorAtual),
        valorDesejado: Number(valorDesejado),
        acao,
        status: "ativo",
        dataCriacao: new Date().toLocaleString('pt-BR')
    };

    // Armazenamento
    let alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    alertas.push(novoAlerta);
    localStorage.setItem('alertas', JSON.stringify(alertas));

    // Atualização
    exibirAlertas();
    document.getElementById('formAlerta').reset();
    alert("Alerta cadastrado com sucesso!");
}

function exibirAlertas() {
    const alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    const container = document.getElementById('alertasContainer');

    container.innerHTML = alertas.length > 0 ? `
        <table class="tabela-alertas">
            <thead>
                <tr>
                    <th>ID</th><th>Descrição</th><th>Valor</th>
                    <th>Valor Desejado</th><th>Ação</th><th>Cancelar</th>
                </tr>
            </thead>
            <tbody>
                ${alertas.map(alerta => `
                    <tr>
                        <td>${alerta.produtoId || 'N/A'}</td>
                        <td>${alerta.produtoNome || 'N/A'}</td>
                        <td>R$ ${Number(alerta.valorAtual || 0).toFixed(2)}</td>
                        <td>R$ ${Number(alerta.valorDesejado || 0).toFixed(2)}</td>
                        <td>${alerta.acao === 'notificar' ? 'Notificação' : 'Comprar'}</td>
                        <td><button onclick="removerAlerta(${alerta.id})">Cancelar</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p class="sem-alertas">Nenhum alerta cadastrado.</p>';
}

function removerAlerta(id) {
    if (!confirm("Remover este alerta?")) return;
    let alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    alertas = alertas.filter(a => a.id !== id);
    localStorage.setItem('alertas', JSON.stringify(alertas));
    exibirAlertas();
}

// Logout global
window.sair = function() {
    localStorage.removeItem('usuarioAutenticado');
    window.location.href = "index.html";
};