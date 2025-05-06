document.addEventListener('DOMContentLoaded', async function() {
    verificarAutenticacao();
    carregarNomeUsuario();
    await carregarProdutosOdinLine();
    exibirAlertas();
    setInterval(monitorarAlertas, 30000);
});

// ===== FUNÇÕES DE AUTENTICAÇÃO ===== 
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

// ===== CARREGAR PRODUTOS DA ODINLINE =====
async function carregarProdutosOdinLine() {
    const usuario = JSON.parse(localStorage.getItem('usuarioAutenticado'));
    if (!usuario) return;

    try {
        const resposta = await fetch(`https://api-odinline.odiloncorrea.com/produto/${usuario.chave}/usuario`);
        const produtos = await resposta.json();
        
        const selectProduto = document.getElementById('produtoId');
        selectProduto.innerHTML = '<option value="">Selecione um produto</option>';
        
        produtos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.id;
            option.textContent = `${produto.descricao}`;
            selectProduto.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        alert("Não foi possível carregar os produtos. Preencha manualmente o ID.");
    }
}

// ===== FUNÇÕES DE ALERTAS =====
function cadastrarAlerta() {
    const produtoId = document.getElementById('produtoId').value;
    const valorDesejado = parseFloat(document.getElementById('valorDesejado').value.replace(',', '.')) || 0;
    const acao = document.getElementById('acao').value;

    if (!produtoId || valorDesejado <= 0) {
        alert("Selecione um produto e insira um valor válido!");
        return;
    }

    const selectProduto = document.getElementById('produtoId');
    const produtoNome = selectProduto.options[selectProduto.selectedIndex].text;

    const novoAlerta = {
        id: Date.now(),
        produtoId,
        produtoNome,
        valorDesejado: Number(valorDesejado),
        acao,
        status: "ativo",
        dataCriacao: new Date().toLocaleString('pt-BR')
    };

    let alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    alertas.push(novoAlerta);
    localStorage.setItem('alertas', JSON.stringify(alertas));

    exibirAlertas();
    document.getElementById('formAlerta').reset();
}

function exibirAlertas() {
    const alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    const container = document.getElementById('alertasContainer');

    container.innerHTML = alertas.length > 0 ? `
        <table class="tabela-alertas">
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Valor Desejado (R$)</th>
                    <th>Ação</th>
                    <th>Data</th>
                    <th>Cancelar</th>
                </tr>
            </thead>
            <tbody>
                ${alertas.map(alerta => `
                    <tr>
                        <td>${alerta.produtoNome || alerta.produtoId}</td>
                        <td>R$ ${alerta.valorDesejado.toFixed(2)}</td>
                        <td>${alerta.acao === 'notificar' ? 'Notificar' : 'Comprar'}</td>
                        <td>${alerta.dataCriacao}</td>
                        <td><button class="btn-cancelar" onclick="removerAlerta(${alerta.id})">X</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p class="sem-alertas">Nenhum alerta cadastrado.</p>';
}

function removerAlerta(id) {
    if (!confirm("Deseja realmente remover este alerta?")) return;
    let alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    alertas = alertas.filter(a => a.id !== id);
    localStorage.setItem('alertas', JSON.stringify(alertas));
    exibirAlertas();
}

// ===== MONITORAMENTO E REGISTRO DE COMPRAS (CORREÇÃO PRINCIPAL) =====
async function monitorarAlertas() {
    const alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    
    for (const alerta of alertas) {
        try {
            // Busca o valor ATUAL do produto na OdinLine
            const resposta = await fetch(`https://api-odinline.odiloncorrea.com/produto/${alerta.produtoId}`);
            const produto = await resposta.json();
            const valorAtual = parseFloat(produto.valor);

            if (valorAtual <= alerta.valorDesejado) {
                if (alerta.acao === 'notificar') {
                    alert(`ALERTA: ${alerta.produtoNome} atingiu R$ ${valorAtual.toFixed(2)} (valor desejado: R$ ${alerta.valorDesejado.toFixed(2)})!`);
                } else {
                    await registrarCompra(alerta, valorAtual); // Passa o valorAtual para a função
                }
                removerAlerta(alerta.id);
            }
        } catch (error) {
            console.error(`Erro ao verificar o produto ${alerta.produtoId}:`, error);
        }
    }
}

// Função corrigida para registrar o valor REAL do produto
async function registrarCompra(alerta, valorReal) {
    try {
        const compras = JSON.parse(localStorage.getItem('compras')) || [];
        
        // Verifica se já foi comprado recentemente (evita duplicatas)
        const compraRecente = compras.some(c => 
            c.produtoId === alerta.produtoId && 
            (new Date() - new Date(c.data)) < 300000 // 5 minutos
        );

        if (!compraRecente) {
            compras.push({
                produtoId: alerta.produtoId,
                produtoNome: alerta.produtoNome,
                valor: valorReal, // Usa o valor REAL, não o desejado
                data: new Date().toLocaleString('pt-BR')
            });
            localStorage.setItem('compras', JSON.stringify(compras));
            alert(`COMPRA REGISTRADA: ${alerta.produtoNome} por R$ ${valorReal.toFixed(2)} (valor desejado: R$ ${alerta.valorDesejado.toFixed(2)})`);
        }
    } catch (error) {
        console.error("Erro ao registrar compra:", error);
        alert("Falha ao registrar a compra. Tente novamente.");
    }
}

window.sair = function() {
    localStorage.removeItem('usuarioAutenticado');
    window.location.href = "index.html";
};