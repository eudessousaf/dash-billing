# Documentação completa — Dashboard de Cobranças

Esta documentação explica como o projeto está organizado, como rodar, onde alterar cada coisa e quais arquivos não devem ser enviados para o GitHub.

---

## 1. Visão geral do projeto

Este projeto é um dashboard de cobranças com:

- Login com Google.
- Leitura de dados do Google Sheets.
- Listagem de clientes com valores pendentes.
- Filtros por status: vencidos, vencem hoje e futuros.
- Tela de detalhes por cliente.
- Geração de texto de cobrança.
- Geração de imagem de cobrança.
- Envio/disparo das cobranças por webhook do n8n.
- Backend Node.js para esconder o webhook do n8n.

O projeto não deve mais ser aberto com Live Server. Ele deve rodar com Node.js.

---

## 2. Estrutura de pastas

```txt
 dash-cobrancas/
 ├── public/
 │   ├── index.html
 │   ├── css/
 │   │   └── style.css
 │   └── js/
 │       ├── app.js
 │       ├── api.js
 │       ├── auth.js
 │       ├── config.js
 │       ├── config.example.js
 │       ├── config-loader.js
 │       ├── detail.js
 │       ├── modal.js
 │       ├── state.js
 │       ├── table.js
 │       └── utils.js
 ├── server.js
 ├── package.json
 ├── package-lock.json
 ├── .env
 ├── .env.example
 ├── .gitignore
 └── README.md
```

---

## 3. O que cada arquivo faz

### `server.js`

É o servidor Node.js do projeto.

Ele faz duas coisas principais:

1. Abre o dashboard no navegador.
2. Recebe os disparos do front-end e repassa para o webhook do n8n.

A rota principal do servidor é:

```txt
http://localhost:3000
```

A rota usada para enviar cobrança é:

```txt
/api/cobrancas
```

Quando o front-end chama `/api/cobrancas`, o `server.js` envia os dados para o webhook real do n8n configurado no `.env`.

---

### `.env`

Arquivo local com informações sensíveis.

Este arquivo não deve ir para o GitHub.

Exemplo:

```env
N8N_WEBHOOK=https://n8n.seu-dominio.com.br/webhook/cobrancas
PORT=3000
```

Altere aqui quando quiser mudar:

- URL real do webhook do n8n.
- Porta local do projeto.

Se a porta 3000 estiver ocupada, troque para:

```env
PORT=3001
```

Depois acesse:

```txt
http://localhost:3001
```

---

### `.env.example`

É apenas um modelo do `.env`.

Esse arquivo pode ir para o GitHub porque não contém dados reais.

Quando alguém baixar o projeto, ela deve copiar:

```txt
.env.example
```

E criar:

```txt
.env
```

Depois preencher os dados reais.

---

### `.gitignore`

Controla o que não será enviado para o GitHub.

Ele deve conter pelo menos:

```gitignore
.env
.env.local
public/js/config.js
node_modules/
dist/
build/
.cache/
```

Arquivos importantes que não devem subir:

```txt
.env
public/js/config.js
node_modules/
```

---

### `package.json`

Arquivo de configuração do Node.js.

Aqui ficam os scripts do projeto e as dependências.

Para rodar o sistema, use:

```bash
npm run dev
```

Se quiser alterar o comando de inicialização, altere a seção `scripts`.

Exemplo:

```json
"scripts": {
  "dev": "node server.js",
  "start": "node server.js"
}
```

---

## 4. Arquivos da pasta `public`

A pasta `public` é a parte visual do sistema. Tudo dentro dela pode ser visto pelo navegador.

Por isso, não coloque webhook secreto, senha ou token privado dentro da pasta `public`.

---

## 5. Onde alterar as configurações principais

### Arquivo: `public/js/config.js`

Este arquivo tem as configurações públicas do front-end.

Exemplo:

```js
window.APP_CONFIG = {
  SHEET_ID: 'ID_DA_SUA_PLANILHA',
  SHEET_NAME: 'Base',
  SHEET_DETAIL: 'Base',
  GOOGLE_CLIENT_ID: 'SEU_GOOGLE_CLIENT_ID',
  INTERVALO_MS: 60000,
  API_COBRANCAS_URL: '/api/cobrancas'
};
```

Altere aqui:

| O que quer alterar | Onde alterar |
|---|---|
| ID da planilha | `SHEET_ID` |
| Nome da aba da planilha principal | `SHEET_NAME` |
| Nome da aba usada nos detalhes | `SHEET_DETAIL` |
| Client ID do Google Login | `GOOGLE_CLIENT_ID` |
| Tempo entre disparos | `INTERVALO_MS` |
| Rota usada para disparar cobranças | `API_COBRANCAS_URL` |

### Importante

`public/js/config.js` não deve subir para o GitHub.

O GitHub deve receber somente:

```txt
public/js/config.example.js
```

---

## 6. Como criar o `config.js` em uma máquina nova

Se você baixar o projeto do GitHub, o arquivo `public/js/config.js` não virá junto.

Faça assim:

```bash
cp public/js/config.example.js public/js/config.js
```

Depois abra:

```txt
public/js/config.js
```

E preencha seus dados reais.

---

## 7. Onde alterar as colunas da planilha

### Arquivo: `public/js/state.js`

Neste arquivo ficam os números das colunas da planilha.

O sistema usa contagem começando em zero:

```txt
A = 0
B = 1
C = 2
D = 3
E = 4
F = 5
G = 6
H = 7
I = 8
J = 9
K = 10
```

Configuração atual:

```js
let COL_DATA_VENDA = 0;    // A = Data da Venda
let COL_IMEI = 1;          // B = IMEI
let COL_PRODUTO = 2;       // C = Produto
let COL_CLIENTE = 3;       // D = Cliente
let COL_VALOR = 4;         // E = Valor
let COL_RECEBIDO = 5;      // F = Valor Recebido
let COL_PENDENTE = 6;      // G = Valor Pendente
let COL_STATUS = 7;        // H = Status
let COL_VENCIMENTO = 8;    // I = Vencimento 1
```

Se na sua planilha o cliente mudar da coluna D para a coluna E, por exemplo, altere:

```js
let COL_CLIENTE = 4;
```

---

## 8. Onde alterar a linha do cabeçalho e início dos dados

### Arquivo: `public/js/state.js`

Configuração atual:

```js
let DETAIL_HEADER_ROW = 1; // Linha 2 da planilha
let DATA_START_ROW = 2;    // Linha 3 da planilha
```

A contagem também começa em zero:

```txt
Linha 1 = 0
Linha 2 = 1
Linha 3 = 2
```

Se seus dados começarem na linha 4, use:

```js
let DATA_START_ROW = 3;
```

---

## 9. Onde alterar parcelas, vencimentos e pagamentos

### Arquivo: `public/js/state.js`

Configuração atual:

```js
let paymentPairs = [
  { numero: 1, vencimentoCol: 8,  pagamentoCol: 10 },
  { numero: 2, vencimentoCol: 11, pagamentoCol: 13 },
  { numero: 3, vencimentoCol: 14, pagamentoCol: 16 },
  { numero: 4, vencimentoCol: 17, pagamentoCol: 19 }
];
```

Explicando:

```txt
vencimentoCol = coluna da data de vencimento
pagamentoCol = coluna do valor pago
```

Exemplo:

```js
{ numero: 1, vencimentoCol: 8, pagamentoCol: 10 }
```

Significa:

```txt
Parcela 1:
Vencimento na coluna I
Pagamento na coluna K
```

Se você adicionar uma quinta parcela na planilha, pode acrescentar:

```js
{ numero: 5, vencimentoCol: 20, pagamentoCol: 22 }
```

Desde que essas colunas existam na planilha.

---

## 10. Onde alterar o nome do sistema, título e textos da tela

### Arquivo: `public/index.html`

Altere o título da aba do navegador aqui:

```html
<title>R.Iphones — Cobranças</title>
```

Altere o nome que aparece no topo aqui:

```html
Rodrigo Iphones <span>/cobranças</span>
```

Altere o texto da tela de login aqui:

```html
<div class="login-title">Cobranças Acumuladas</div>
<p class="login-sub">Acesse o painel de cobranças sua conta Google autorizada.</p>
```

Altere os nomes dos cards aqui:

```html
🔴 Vencidos
🟡 Hoje
🟢 Futuro
💰 Total em aberto
```

Altere o placeholder da busca aqui:

```html
placeholder="Buscar cliente..."
```

---

## 11. Onde alterar cores, fontes e visual

### Arquivo: `public/css/style.css`

As cores principais estão no começo do arquivo:

```css
:root {
  --bg: #0a0a0f;
  --surface: #111118;
  --surface2: #1a1a24;
  --border: #2a2a3a;
  --accent: #00e5a0;
  --accent2: #ff6b35;
  --warn: #ffd600;
  --text: #f0f0f8;
  --muted: #6b6b8a;
  --red: #ff4560;
  --green: #00e5a0;
  --yellow: #ffd600;
}
```

Altere aqui:

| O que quer mudar | Variável |
|---|---|
| Cor de fundo | `--bg` |
| Cor dos cards | `--surface` |
| Cor secundária dos cards | `--surface2` |
| Cor principal verde | `--accent` |
| Cor de alerta | `--yellow` |
| Cor de vencido | `--red` |
| Cor do texto | `--text` |
| Texto apagado/cinza | `--muted` |

Exemplo para mudar a cor principal para azul:

```css
--accent: #3b82f6;
--green: #3b82f6;
```

---

## 12. Onde alterar as fontes

### Arquivo: `public/index.html`

As fontes são carregadas aqui:

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet">
```

### Arquivo: `public/css/style.css`

As fontes são aplicadas aqui:

```css
--font-head: 'Syne', sans-serif;
--font-mono: 'DM Mono', monospace;
```

Se quiser trocar para Inter, por exemplo, você precisa alterar o link do Google Fonts e depois alterar as variáveis.

---

## 13. Onde alterar a tabela principal

### Arquivo: `public/index.html`

Cabeçalho da tabela:

```html
<th>Status</th>
<th>Cliente</th>
<th>Valor</th>
<th>Itens</th>
<th>Vencimento</th>
```

### Arquivo: `public/js/table.js`

Aqui fica a montagem dos dados na tabela.

Funções importantes:

```js
updateStats()
renderTable(rows)
filterTable()
setFilter(f, btn)
sortBy(col)
toggleRow(id, e)
toggleAll(cb)
clearSelection()
updateBottomBar()
```

Altere esse arquivo se quiser mudar:

- Como a tabela aparece.
- Como os clientes são filtrados.
- Como a busca funciona.
- Como os valores selecionados são calculados.
- Como ordenar por nome, valor ou vencimento.

---

## 14. Onde alterar as regras de vencido, hoje e futuro

### Arquivo: `public/js/utils.js`

Funções principais:

```js
statusDaLinha(r)
getVencimentoAtualLinha(r)
linhaTemVencimentoNoStatus(r, statusFiltro)
calcularResumoStatus(rows)
```

O sistema considera:

```txt
red = vencido
yellow = vence hoje
green = futuro
```

A regra principal é:

```js
if (vencAtual.data < hoje) return 'red';
if (mesmoDia(vencAtual.data, hoje)) return 'yellow';
return 'green';
```

Se quiser mudar a regra de cores, altere essa parte.

---

## 15. Onde alterar formatação de dinheiro

### Arquivo: `public/js/utils.js`

Função:

```js
function fmtBRL(v) {
  return (Number(v) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}
```

Essa função transforma número em moeda brasileira.

Exemplo:

```txt
1500.5 → R$ 1.500,50
```

---

## 16. Onde alterar leitura de valores da planilha

### Arquivo: `public/js/utils.js`

Função:

```js
parseValorBR(v)
```

Ela converte valores como:

```txt
R$ 1.500,50
1500,50
1500.50
```

Para número JavaScript.

Se a planilha começar a mandar valores em outro formato, revise essa função.

---

## 17. Onde alterar leitura de datas

### Arquivo: `public/js/utils.js`

Função:

```js
parseDataBR(v)
```

Ela lê datas no padrão:

```txt
dd/mm/aaaa
```

Exemplo:

```txt
28/05/2026
```

Se sua planilha passar a usar outro formato, altere essa função.

---

## 18. Onde alterar login do Google

### Arquivo: `public/js/auth.js`

Funções principais:

```js
signIn()
showDashboard(resp)
signOut()
```

O login usa este escopo:

```js
scope: 'https://www.googleapis.com/auth/spreadsheets.readonly'
```

Esse escopo permite apenas leitura da planilha.

Se quiser permitir edição da planilha, seria outro escopo, mas não é recomendado sem necessidade.

---

## 19. Onde alterar o Google Client ID

### Arquivo: `public/js/config.js`

Altere:

```js
GOOGLE_CLIENT_ID: 'SEU_GOOGLE_CLIENT_ID'
```

Também configure no Google Cloud as origens autorizadas:

```txt
http://localhost:3000
```

Se usar outra porta:

```txt
http://localhost:3001
```

Se publicar em um domínio:

```txt
https://seudominio.com.br
```

---

## 20. Onde alterar a busca da planilha

### Arquivo: `public/js/api.js`

Funções principais:

```js
loadSheetData()
loadDetailSheet()
```

A URL da API do Google Sheets é montada aqui:

```js
const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}`;
```

Altere este arquivo se quiser:

- Buscar outra aba.
- Buscar outro intervalo específico.
- Transformar os dados de outro jeito.
- Mudar a forma de agrupamento dos clientes.

---

## 21. Onde alterar o agrupamento por cliente

### Arquivo: `public/js/api.js`

O sistema agrupa linhas pelo nome do cliente.

Trecho importante:

```js
const nome = (r[COL_CLIENTE] || '').toString().trim();
const key = normalizarTexto(nome);
```

Isso significa que clientes com o mesmo nome são agrupados.

Se quiser agrupar por outro campo, por exemplo telefone ou CPF, altere essa parte para usar outra coluna.

---

## 22. Onde alterar o popup de detalhes do cliente

### Arquivo: `public/js/detail.js`

Funções principais:

```js
openDetailModal(nome, id)
renderDetailBody(nome, itens)
renderPerfilCliente(nome)
closeDetailModal(e)
navigateDetail(direction)
```

Altere esse arquivo se quiser mudar:

- Layout do popup.
- Dados exibidos no detalhe.
- Resumo do cliente.
- Perfil do cliente.
- Navegação entre clientes.
- Botão de copiar mensagem.
- Botão de gerar imagem.

---

## 23. Onde alterar a análise/perfil do cliente

### Arquivo: `public/js/detail.js`

Funções importantes:

```js
getPagamentosCliente(nome, rows)
getMetaPagamentoPorDivida(valorPendente)
analisarPerfilCliente(nome, rows)
renderPerfilCliente(nome)
```

Altere aqui se quiser mudar:

- Critérios de perfil.
- Quantidade esperada de pagamentos.
- Score do cliente.
- Texto explicativo do perfil.
- Métricas exibidas no card.

---

## 24. Onde alterar a mensagem de cobrança copiada

### Arquivo: `public/js/detail.js`

Função principal:

```js
gerarMensagemPorPerfil(nome, itens, perfil)
```

Essa função monta a mensagem que será copiada para o WhatsApp.

Altere aqui se quiser mudar:

- Saudação.
- Texto da cobrança.
- Tom da mensagem.
- Campos que aparecem.
- Inclusão ou remoção de produtos.
- Inclusão ou remoção do total.

Também existe a função:

```js
copiarMensagem()
```

Ela copia o texto para a área de transferência.

---

## 25. Onde alterar geração de imagem

### Arquivo: `public/js/detail.js`

Função principal:

```js
gerarImagem()
```

Altere essa função se quiser mudar:

- Tamanho da imagem.
- Informações que aparecem.
- Cores da imagem.
- Texto principal.
- Lista de itens.
- Total da dívida.

O botão fica no HTML:

```html
<button class="btn-imagem" id="btn-imagem" onclick="gerarImagem()">
```

---

## 26. Onde alterar o disparo de cobranças

### Arquivo: `public/js/modal.js`

Função principal:

```js
openModal()
```

Ela pega os clientes selecionados e envia um por um para a rota:

```txt
/api/cobrancas
```

Altere aqui se quiser mudar:

- Dados enviados para o n8n.
- Intervalo entre mensagens.
- Texto de progresso.
- Comportamento depois do envio.
- Validação antes de disparar.

---

## 27. Onde alterar o tempo entre disparos

### Arquivo: `public/js/config.js`

Configuração:

```js
INTERVALO_MS: 60000
```

Isso significa 60.000 milissegundos, ou seja, 1 minuto.

Exemplos:

```js
INTERVALO_MS: 30000  // 30 segundos
INTERVALO_MS: 60000  // 1 minuto
INTERVALO_MS: 120000 // 2 minutos
INTERVALO_MS: 300000 // 5 minutos
```

---

## 28. Onde alterar o webhook do n8n

### Arquivo: `.env`

Altere:

```env
N8N_WEBHOOK=https://seu-webhook-aqui
```

Depois reinicie o servidor:

```bash
Ctrl + C
npm run dev
```

Nunca coloque o webhook real dentro de arquivos da pasta `public`.

---

## 29. Como testar se o servidor está funcionando

Com o servidor rodando:

```bash
npm run dev
```

Abra:

```txt
http://localhost:3000/api/health
```

Se estiver funcionando, deve aparecer algo parecido com:

```json
{"ok":true,"service":"dash-cobrancas"}
```

---

## 30. Como rodar o projeto localmente

Dentro da pasta do projeto:

```bash
npm install
npm run dev
```

Depois abra:

```txt
http://localhost:3000
```

---

## 31. Como parar o servidor

No terminal onde o projeto está rodando, pressione:

```txt
Ctrl + C
```

---

## 32. Erro: porta 3000 ocupada

Erro comum:

```txt
Error: listen EADDRINUSE: address already in use :::3000
```

Significa que já existe algo usando a porta 3000.

Solução 1:

```bash
sudo lsof -i :3000
```

Depois mate o processo:

```bash
kill -9 NUMERO_DO_PID
```

Solução 2:

Troque a porta no `.env`:

```env
PORT=3001
```

Depois rode novamente:

```bash
npm run dev
```

E acesse:

```txt
http://localhost:3001
```

---

## 33. Erro no login Google

Se o login Google não abrir ou retornar erro, confira:

1. `GOOGLE_CLIENT_ID` está correto em `public/js/config.js`.
2. O domínio está autorizado no Google Cloud.
3. A origem autorizada contém exatamente:

```txt
http://localhost:3000
```

Se estiver usando porta 3001:

```txt
http://localhost:3001
```

---

## 34. Erro ao carregar planilha

Confira:

1. `SHEET_ID` está correto.
2. `SHEET_NAME` é exatamente o nome da aba.
3. A conta Google logada tem permissão de leitura na planilha.
4. A API Google Sheets está ativada no Google Cloud.
5. A linha do cabeçalho e início dos dados estão corretas em `state.js`.

---

## 35. Erro ao disparar cobrança

Confira:

1. O servidor está rodando.
2. O `.env` existe.
3. O `.env` tem `N8N_WEBHOOK` correto.
4. O workflow do n8n está ativo.
5. A rota `/api/cobrancas` está sendo chamada.

Teste a saúde do servidor:

```txt
http://localhost:3000/api/health
```

---

## 36. Como atualizar o GitHub depois de alterações

Sempre que alterar o projeto:

```bash
git status
git add .
git commit -m "Describe the change"
git push
```

Exemplo:

```bash
git status
git add .
git commit -m "Update billing message template"
git push
```

Antes de dar commit, sempre confira se não apareceu:

```txt
.env
public/js/config.js
node_modules/
```

Se aparecer, não prossiga.

---

## 37. Como adicionar esta documentação no GitHub

Salve este arquivo como:

```txt
DOCUMENTACAO_DASH_COBRANCAS.md
```

Depois rode:

```bash
git add DOCUMENTACAO_DASH_COBRANCAS.md
git commit -m "Add dashboard documentation"
git push
```

---

## 38. Checklist antes de subir para o GitHub

Antes de cada push, confira:

```bash
git status
```

Não podem aparecer:

```txt
.env
public/js/config.js
node_modules/
```

Podem aparecer:

```txt
README.md
DOCUMENTACAO_DASH_COBRANCAS.md
server.js
package.json
public/index.html
public/css/style.css
public/js/*.js
```

---

## 39. Resumo rápido: onde altero cada coisa

| Quero alterar | Arquivo |
|---|---|
| Nome do sistema | `public/index.html` |
| Título da aba | `public/index.html` |
| Textos da tela | `public/index.html` |
| Cores | `public/css/style.css` |
| Fontes | `public/index.html` e `public/css/style.css` |
| ID da planilha | `public/js/config.js` |
| Nome da aba da planilha | `public/js/config.js` |
| Google Client ID | `public/js/config.js` |
| Intervalo dos disparos | `public/js/config.js` |
| Webhook do n8n | `.env` |
| Porta local | `.env` |
| Colunas da planilha | `public/js/state.js` |
| Linha inicial dos dados | `public/js/state.js` |
| Regras de vencido/hoje/futuro | `public/js/utils.js` |
| Formatação de dinheiro | `public/js/utils.js` |
| Leitura de datas | `public/js/utils.js` |
| Login Google | `public/js/auth.js` |
| Busca no Google Sheets | `public/js/api.js` |
| Tabela e filtros | `public/js/table.js` |
| Popup de detalhes | `public/js/detail.js` |
| Mensagem do WhatsApp | `public/js/detail.js` |
| Imagem de cobrança | `public/js/detail.js` |
| Disparo para n8n | `public/js/modal.js` |
| Backend/proxy | `server.js` |
| Dependências e comandos | `package.json` |
| Arquivos ignorados pelo Git | `.gitignore` |

---

## 40. Recomendação de manutenção

Para evitar quebrar o projeto:

1. Sempre teste localmente antes de subir:

```bash
npm run dev
```

2. Depois abra:

```txt
http://localhost:3000
```

3. Só depois faça:

```bash
git add .
git commit -m "Describe the change"
git push
```

4. Nunca publique arquivos com credenciais.

5. Sempre mantenha `.env.example` e `config.example.js` atualizados quando adicionar novas configurações.

---

## 39. Atualização importante — regra da última data de vencimento informada

### Objetivo

A planilha `Base` possui vencimentos em até 4 parcelas. O dashboard deve considerar como vencimento principal **a última data preenchida** entre:

```txt
Vencimento 1
Vencimento 2
Vencimento 3
Vencimento 4
```

Ou seja, se a linha tiver:

```txt
Vencimento 1 = 18/04/2025
Vencimento 2 = 23/10/2025
Vencimento 3 = vazio
Vencimento 4 = vazio
```

O dashboard deve usar:

```txt
23/10/2025
```

E não mais o vencimento antigo `18/04/2025`.

### Arquivo alterado

```txt
public/js/utils.js
```

### Função responsável por escolher o vencimento atual

```js
function getVencimentoAtualLinha(r) {
  const vencs = getVencimentosLinha(r);

  if (!vencs.length) {
    return { data: null, texto: '—', numero: null };
  }

  // Regra atual:
  // usa sempre a última coluna de vencimento preenchida:
  // Vencimento 4 > Vencimento 3 > Vencimento 2 > Vencimento 1
  const ultimoInformado = vencs
    .sort((a, b) => b.numero - a.numero)[0];

  return ultimoInformado;
}
```

### Função responsável por mostrar a data na tabela

```js
function menorVencimentoTexto(rows) {
  const vencimentos = rows
    .map(r => getVencimentoAtualLinha(r))
    .filter(x => x && x.data);

  if (!vencimentos.length) return '—';

  // Para cliente com vários itens, mostra a data informada mais recente
  vencimentos.sort((a, b) => b.data - a.data);

  return vencimentos[0].texto || '—';
}
```

> Observação: o nome da função `menorVencimentoTexto` foi mantido para não quebrar chamadas existentes, mas a regra atual é mostrar a data mais recente entre os vencimentos atuais dos itens do cliente.

---

## 40. Correção do filtro de vencidos

### Problema encontrado

Alguns clientes apareciam no filtro **Vencidos** mesmo tendo a última data de vencimento no futuro.

Isso acontecia porque uma regra antiga verificava **qualquer vencimento antigo** da linha. Exemplo:

```txt
Vencimento 1 = 18/04/2025
Vencimento 2 = 23/10/2025
```

Antes, o filtro via o `Vencimento 1` antigo e classificava como vencido.

Agora o filtro deve olhar somente para a **última data de vencimento informada**.

### Arquivo alterado

```txt
public/js/utils.js
```

### Função corrigida

```js
function linhaTemVencimentoNoStatus(r, statusFiltro) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencAtual = getVencimentoAtualLinha(r);

  if (!vencAtual || !vencAtual.data) return false;

  if (statusFiltro === 'red') return vencAtual.data < hoje;
  if (statusFiltro === 'yellow') return mesmoDia(vencAtual.data, hoje);
  if (statusFiltro === 'green') return vencAtual.data > hoje;

  return true;
}
```

### Resultado esperado

```txt
Filtro Vencidos → considera somente a última data preenchida
Filtro Hoje     → considera somente a última data preenchida
Filtro Futuro   → considera somente a última data preenchida
```

Exemplo:

```txt
Vencimento 1 = 18/04/2025
Vencimento 2 = 23/10/2025
```

Se hoje for antes de `23/10/2025`, o cliente deve aparecer como **Futuro**, não como Vencido.

---

## 41. Esquema atual da aba Base

A aba `Base` está organizada neste padrão:

```txt
A  Data da Venda
B  IMEI
C  Produto
D  Cliente
E  Valor
F  Valor Recebido
G  Valor Pendente
H  Status
I  Vencimento 1
J  Forma de Pagamento 1
K  Pagamento 1
L  Vencimento 2
M  Forma de Pagamento 2
N  Pagamento 2
O  Vencimento 3
P  Forma de Pagamento 3
Q  Pagamento 3
R  Vencimento 4
S  Forma de Pagamento 4
T  Pagamento 4
U  Observações
V  Vencimento Atual
W  .
X  Dias
```

No código, a contagem começa em zero:

```txt
A = 0
B = 1
C = 2
D = 3
E = 4
F = 5
G = 6
H = 7
I = 8
J = 9
K = 10
L = 11
M = 12
N = 13
O = 14
P = 15
Q = 16
R = 17
S = 18
T = 19
U = 20
V = 21
W = 22
X = 23
```

### Configuração atual no código

Arquivo:

```txt
public/js/state.js
```

```js
let COL_DATA_VENDA = 0;    // A = Data da Venda
let COL_IMEI = 1;          // B = IMEI
let COL_PRODUTO = 2;       // C = Produto
let COL_CLIENTE = 3;       // D = Cliente
let COL_VALOR = 4;         // E = Valor
let COL_RECEBIDO = 5;      // F = Valor Recebido
let COL_PENDENTE = 6;      // G = Valor Pendente
let COL_STATUS = 7;        // H = Status
let COL_VENCIMENTO = 8;    // I = Vencimento 1
```

Parcelas:

```js
let paymentPairs = [
  { numero: 1, vencimentoCol: 8,  pagamentoCol: 10 },
  { numero: 2, vencimentoCol: 11, pagamentoCol: 13 },
  { numero: 3, vencimentoCol: 14, pagamentoCol: 16 },
  { numero: 4, vencimentoCol: 17, pagamentoCol: 19 }
];
```

---

## 42. Fluxo de branches recomendado

### Branch de produção

```txt
main
```

A VPS usa a branch `main`. Tudo que for para a `main` pode ir para produção.

### Branch de alteração/teste

Exemplo usado:

```txt
dash_mod
```

Para criar uma branch nova corretamente:

```bash
git checkout -b dash_mod
```

> Atenção: `git branch -b dash_mod` está errado. O correto é `git checkout -b dash_mod`.

### Subir alteração para a branch de teste

```bash
git status
git add .
git commit -m "Update due date logic"
git push -u origin dash_mod
```

### Mandar alteração para produção

No computador local:

```bash
git checkout main
git pull origin main
git merge dash_mod
git push origin main
```

Depois, na VPS:

```bash
cd /var/www/dash-billing
git checkout main
git pull origin main
npm install
pm2 restart dash-billing
```

---

## 43. Fluxo atual de atualização da VPS

Sempre que fizer `push` na `main`, atualize a VPS com:

```bash
ssh root@167.99.15.95
cd /var/www/dash-billing
git pull origin main
npm install
pm2 restart dash-billing
```

Depois confira:

```bash
pm2 status
curl -I https://cobrancas.oneer.com.br
```

Resultado esperado:

```txt
HTTP/2 200
x-powered-by: Express
```

---

## 44. Segurança aplicada no Nginx

O domínio `cobrancas.oneer.com.br` está apontando para o Node/PM2 por proxy reverso.

Arquivo:

```txt
/etc/nginx/sites-available/cobrancas
```

Headers adicionados:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

Para testar:

```bash
nginx -t
systemctl reload nginx
curl -I https://cobrancas.oneer.com.br
```

Resultado esperado no `curl -I`:

```txt
strict-transport-security: max-age=31536000; includeSubDomains
x-content-type-options: nosniff
x-frame-options: DENY
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(), microphone=(), camera=()
```

Sites úteis para testar:

```txt
https://www.ssllabs.com/ssltest/
https://developer.mozilla.org/en-US/observatory
https://securityheaders.com/
```

Resultado já observado:

```txt
SSL Labs: A
Mozilla Observatory: D- antes dos headers extras
```

Após adicionar os headers, o Observatory deve melhorar, mas pode ainda não chegar em A se não houver uma Content-Security-Policy completa.

---

## 45. Comandos rápidos para teste local

Dentro do projeto no computador:

```bash
cd ~/Documentos/dash-cobrancas
npm run dev
```

Abrir no navegador:

```txt
http://localhost:3000
```

Parar servidor local:

```txt
Ctrl + C
```

Se a porta 3000 estiver ocupada:

```bash
sudo lsof -i :3000
kill -9 NUMERO_DO_PID
```

---

## 46. Checklist após alterar regra de vencimento

Depois de alterar a lógica de vencimento, testar:

```txt
1. Cliente com apenas Vencimento 1 preenchido.
2. Cliente com Vencimento 1 antigo e Vencimento 2 futuro.
3. Cliente com Vencimento 1 e 2 antigos, mas Vencimento 3 futuro.
4. Cliente com Vencimento 4 preenchido.
5. Filtro Vencidos.
6. Filtro Hoje.
7. Filtro Futuro.
8. Contadores dos cards superiores.
9. Popup do cliente.
10. Mensagem/imagem gerada, se usar vencimento na cobrança.
```

Regra esperada:

```txt
A última data preenchida deve mandar no status do cliente.
```

