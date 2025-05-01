$(document).ready(function() {
    $("#formulario-login").validate({
        rules: {
            usuario: { required: true },
            senha: { required: true }
        },
        messages: {
            usuario: "Campo obrigatório",
            senha: "Campo obrigatório"
        },
        submitHandler: function(form) {
            autenticar();
            return false; // Evita o submit tradicional
        }
    });
});

async function autenticar() {
    const login = $("#usuario").val();
    const senha = $("#senha").val();

    try {
        const resposta = await fetch(`https://api-odinline.odiloncorrea.com/usuario/${login}/${senha}/autenticar`);
        const usuario = await resposta.json();

        if (usuario.id > 0) {
            localStorage.setItem('usuarioAutenticado', JSON.stringify(usuario));
            window.location.href = "menu.html";
        } else {
            alert("Usuário ou senha inválidos.");
        }
    } catch (error) {
        alert("Erro na conexão com a API. Tente novamente.");
    }
}