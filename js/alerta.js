document.addEventListener('DOMContentLoaded', async function() {
    verificarAutenticacao();
    carregarNomeUsuario();
    await carregarProdutosOdinLine(); // Novo: Busca produtos da API
    exibirAlertas();
    setInterval(monitorarAlertas, 60000);
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

// ===== NOVA FUNÇÃO: CARREGAR PRODUTOS DA ODINLINE =====
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
            option.value = produto.id; // Usa o ID como valor
            option.textContent = `${produto.descricao} (R$ ${produto.valor})`;
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

    // Validação
    if (!produtoId || valorDesejado <= 0) {
        alert("Selecione um produto e insira um valor válido!");
        return;
    }

    // Obtém o nome do produto selecionado
    const selectProduto = document.getElementById('produtoId');
    const produtoNome = selectProduto.options[selectProduto.selectedIndex].text.split(' (R$')[0];

    const novoAlerta = {
        id: Date.now(),
        produtoId,
        produtoNome, // Adiciona o nome para exibir na tabela
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

// ===== FUNÇÕES AUXILIARES =====
function removerAlerta(id) {
    if (!confirm("Deseja realmente remover este alerta?")) return;
    let alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    alertas = alertas.filter(a => a.id !== id);
    localStorage.setItem('alertas', JSON.stringify(alertas));
    exibirAlertas();
}

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
                    registrarCompra(alerta);
                }
                removerAlerta(alerta.id);
            }
        } catch (error) {
            console.error(`Erro ao verificar o produto ${alerta.produtoId}:`, error);
        }
    }
}

function registrarCompra(alerta) {
    const compra = {
        produtoId: alerta.produtoId,
        produtoNome: alerta.produtoNome,
        valor: alerta.valorDesejado,
        data: new Date().toLocaleString('pt-BR')
    };
    let compras = JSON.parse(localStorage.getItem('compras')) || [];
    compras.push(compra);
    localStorage.setItem('compras', JSON.stringify(compras));
}

window.sair = function() {
    localStorage.removeItem('usuarioAutenticado');
    window.location.href = "index.html";
};