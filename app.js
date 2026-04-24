// Função para alternar entre as telas (Minha Viagem, Contato, etc.)
function mostrarTela(nomeTela) {
  const telas = document.querySelectorAll('.tela');
  telas.forEach(tela => {
    tela.classList.remove('ativa');
  });

  const telaSelecionada = document.getElementById(`tela-${nomeTela}`);
  if (telaSelecionada) {
    telaSelecionada.classList.add('ativa');
  }
}
