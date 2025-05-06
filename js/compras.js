document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacao();
    carregarNomeUsuario();
    exibirCompras();
});

// ===== FUNÇÕES COMPARTILHADAS =====
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

// ===== FUNÇÃO PRINCIPAL (EXIBIR COMPRAS) =====
function exibirCompras() {
    const compras = JSON.parse(localStorage.getItem('compras')) || [];
    const corpoTabela = document.getElementById('corpoTabelaCompras');
    const mensagemSemCompras = document.getElementById('semCompras');

    // Limpa a tabela e mensagem
    corpoTabela.innerHTML = '';
    mensagemSemCompras.style.display = compras.length === 0 ? 'block' : 'none';

    // Preenche as linhas
    compras.forEach(compra => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${compra.produtoNome}</td>
            <td>R$ ${compra.valor.toFixed(2)}</td>
            <td>${compra.data}</td>
        `;
        corpoTabela.appendChild(linha);
    });
}

// ===== LOGOUT =====
window.sair = function() {
    localStorage.removeItem('usuarioAutenticado');
    window.location.href = "index.html";
};