function gerarMensagemWhatsappCliente(cliente) {
  const nome = cliente?.nome || 'cliente';
  const valor = fmtBRL(cliente?.valor || 0);
  const vencimento = cliente?.data || '—';

  return `Olá, ${nome}! Tudo bem?

Identificamos uma pendência em aberto no valor de ${valor}, com vencimento em ${vencimento}.

Por gentileza, poderia verificar a regularização?

Caso já tenha realizado o pagamento, desconsidere esta mensagem.`;
}

function gerarLinkWhatsapp(telefone, mensagem) {
  const telefoneNormalizado = normalizarTelefoneWhatsApp(telefone);

  if (!telefoneNormalizado) {
    throw new Error('Telefone inválido');
  }

  const texto = encodeURIComponent(mensagem || '');

  return `https://wa.me/${telefoneNormalizado}?text=${texto}`;
}

async function abrirWhatsappCliente(cliente) {
  if (!cliente || !cliente.nome) {
    alert('Cliente inválido.');
    return;
  }

  try {
    const contato = await buscarContatoCliente(cliente.nome);

    let contatoFinal = contato;

if (!contatoFinal || !contatoFinal.telefone) {
const telefoneNormalizado = await abrirModalTelefone(cliente);

if (!telefoneNormalizado) {
  return;
}

contatoFinal = await salvarContatoCliente(cliente.nome, telefoneNormalizado);

  if (!telefoneNormalizado) {
    alert('Telefone inválido. Informe com DDD, exemplo: 85999999999');
    return;
  }

  contatoFinal = await salvarContatoCliente(cliente.nome, telefoneNormalizado);
}

    const mensagem = gerarMensagemWhatsappCliente(cliente);
const link = gerarLinkWhatsapp(contatoFinal.telefone, mensagem);
    window.open(link, '_blank');
  } catch (error) {
    console.error('Erro ao abrir WhatsApp:', error);
    alert('Não foi possível gerar o link do WhatsApp.');
  }
}
async function cobrarClienteAtual() {
  try {
    if (currentDetailIndex === null || currentDetailIndex < 0) {
      alert('Nenhum cliente selecionado.');
      return;
    }

    const cliente = filteredRows[currentDetailIndex];

    if (!cliente) {
      alert('Não foi possível identificar o cliente atual.');
      return;
    }

    await abrirWhatsappCliente(cliente);
  } catch (error) {
    console.error('Erro ao cobrar cliente atual:', error);
    alert('Não foi possível cobrar este cliente.');
  }
}

let clientePendenteTelefone = null;
let resolverModalTelefone = null;

function abrirModalTelefone(cliente) {
  clientePendenteTelefone = cliente;

  const overlay = document.getElementById('phone-overlay');
  const nomeEl = document.getElementById('phone-client-name');
  const input = document.getElementById('phone-input');

  if (nomeEl) {
    nomeEl.textContent = cliente?.nome || '—';
  }

  if (input) {
    input.value = '';
  }

  if (overlay) {
    overlay.classList.add('open');
  }

  setTimeout(() => {
    if (input) input.focus();
  }, 100);

  return new Promise((resolve) => {
    resolverModalTelefone = resolve;
  });
}

function fecharModalTelefone() {
  const overlay = document.getElementById('phone-overlay');

  if (overlay) {
    overlay.classList.remove('open');
  }

  if (resolverModalTelefone) {
    resolverModalTelefone(null);
  }

  clientePendenteTelefone = null;
  resolverModalTelefone = null;
}

function salvarTelefoneModal() {
  const input = document.getElementById('phone-input');
  const telefone = input ? input.value : '';

  const telefoneNormalizado = normalizarTelefoneWhatsApp(telefone);

  if (!telefoneNormalizado) {
    alert('Telefone inválido. Informe com DDD, exemplo: 85999999999');
    return;
  }

  const overlay = document.getElementById('phone-overlay');

  if (overlay) {
    overlay.classList.remove('open');
  }

  if (resolverModalTelefone) {
    resolverModalTelefone(telefoneNormalizado);
  }

  clientePendenteTelefone = null;
  resolverModalTelefone = null;
}