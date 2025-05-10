document.addEventListener('DOMContentLoaded', function() {

    if (!localStorage.getItem('usuarioAutenticado')) {
        window.location.href = "index.html";
        return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuarioAutenticado'));
    const elementoNome = document.getElementById('nomeUsuario');
    
    if (usuario && elementoNome) {
        elementoNome.textContent = usuario.nome;
    }


    window.sair = function() {
        localStorage.removeItem('usuarioAutenticado');
        window.location.href = "index.html";
    };
});