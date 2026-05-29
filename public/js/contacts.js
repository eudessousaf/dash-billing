function normalizarNomeContato(nome) {
  return (nome || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizarTelefoneWhatsApp(telefone) {
  let numero = (telefone || '').toString().replace(/\D/g, '');

  if (!numero) return '';

  // Se vier só DDD + número, adiciona Brasil 55.
  // Exemplo: 85999999999 vira 5585999999999
  if (numero.length === 11) {
    numero = `55${numero}`;
  }

  return numero;
}

async function carregarContatosSheet() {
  const sheetName = CONFIG.CONTACTS_SHEET_NAME || 'Contatos';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${encodeURIComponent(sheetName)}`;

  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await resp.json();

  if (!resp.ok) {
    console.error('Erro ao carregar contatos:', data);
    throw new Error('Erro ao carregar contatos');
  }

  const rows = data.values || [];

  // Remove cabeçalho
  return rows.slice(1).filter(row => row[0] && row[1]);
}

async function buscarContatoCliente(nomeCliente) {
  const nomeNormalizado = normalizarNomeContato(nomeCliente);
  const contatos = await carregarContatosSheet();

  const contato = contatos.find(row => {
    const cliente = normalizarNomeContato(row[0]);
    return cliente === nomeNormalizado;
  });

  if (!contato) return null;

  return {
    cliente: contato[0],
    telefone: normalizarTelefoneWhatsApp(contato[1]),
    criadoEm: contato[2] || '',
    atualizadoEm: contato[3] || '',
    origem: contato[4] || ''
  };
}

function obterDataHoraBR() {
  return new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Fortaleza'
  });
}

async function salvarContatoCliente(nomeCliente, telefone) {
  const sheetName = CONFIG.CONTACTS_SHEET_NAME || 'Contatos';
  const telefoneNormalizado = normalizarTelefoneWhatsApp(telefone);

  if (!nomeCliente || !telefoneNormalizado) {
    throw new Error('Cliente ou telefone inválido');
  }

  const agora = obterDataHoraBR();

  const values = [
    [
      nomeCliente,
      telefoneNormalizado,
      agora,
      agora,
      'dashboard'
    ]
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${encodeURIComponent(sheetName)}!A:E:append?valueInputOption=USER_ENTERED`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values
    })
  });

  const data = await resp.json();

  if (!resp.ok) {
    console.error('Erro ao salvar contato:', data);
    throw new Error('Erro ao salvar contato');
  }

  return {
    cliente: nomeCliente,
    telefone: telefoneNormalizado,
    criadoEm: agora,
    atualizadoEm: agora,
    origem: 'dashboard'
  };
}