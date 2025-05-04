document.addEventListener('DOMContentLoaded', function() {
    // Verifica autenticação
    if (!localStorage.getItem('usuarioAutenticado')) {
        window.location.href = "index.html";
        return;
    }

    // Exibe o nome do usuário
    const usuario = JSON.parse(localStorage.getItem('usuarioAutenticado'));
    const elementoNome = document.getElementById('nomeUsuario');
    
    if (usuario && elementoNome) {
        elementoNome.textContent = usuario.nome;
    }

    // Função de logout (opcional, se não estiver no index.js)
    window.sair = function() {
        localStorage.removeItem('usuarioAutenticado');
        window.location.href = "index.html";
    };
});