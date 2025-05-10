document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacao();
    carregarNomeUsuario();
    exibirCompras();
});


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


function exibirCompras() {
    const usuario = JSON.parse(localStorage.getItem('usuarioAutenticado'));
    if (!usuario) {
        window.location.href = "index.html";
        return;
    }

    const chaveCompras = `compras_${usuario.id}`;
    const compras = JSON.parse(localStorage.getItem(chaveCompras)) || [];
    const corpoTabela = document.getElementById('corpoTabelaCompras');
    const mensagemSemCompras = document.getElementById('semCompras');

    corpoTabela.innerHTML = '';
    mensagemSemCompras.style.display = compras.length === 0 ? 'block' : 'none';


    compras.sort((a, b) => new Date(b.data) - new Date(a.data));

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


window.sair = function() {
    localStorage.removeItem('usuarioAutenticado');
    window.location.href = "index.html";
};