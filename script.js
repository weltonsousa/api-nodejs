var area = document.getElementById('area')

function entrar() {
  var nome = prompt('Digite seu nome: ')
  if (nome == '' || nome === null) {
    alert('Ops, algo deu errado...')
  } else {
    area.innerHTML = 'Bem Vindo ' + nome + ' ';

    let botaoSair = document.createElement('button');
    botaoSair.innerHTML = 'Sair da conta';
    botaoSair.onclick = sair;
    area.appendChild(botaoSair);
  }
}

function sair() {
  alert('Até mais!');
  area.innerHTML = 'Você saiu!'
}