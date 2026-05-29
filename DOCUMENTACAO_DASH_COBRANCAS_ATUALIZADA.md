# Documentação do Dashboard de Cobranças

Esta documentação explica a estrutura atual do dashboard, como editar, testar, publicar e manter as principais funcionalidades.

---

## 1. Visão geral

O dashboard de cobranças é um projeto Node.js + HTML/CSS/JS que roda em uma VPS com Nginx e PM2.

Fluxo atual:

```txt
Google Sheets → Dashboard → Popup do cliente → WhatsApp
```

O projeto usa:

```txt
GitHub como base oficial
Branch main para produção
Branches feature/* para desenvolvimento
VPS puxando a main
PM2 mantendo o servidor online
Nginx apontando o domínio para o Node.js
```

Domínio de produção:

```txt
https://cobrancas.oneer.com.br
```

Pasta do projeto na VPS:

```txt
/var/www/dash-billing
```

---

## 2. Estrutura principal do projeto

```txt
dash-cobrancas/
├── public/
│   ├── index.html
│   ├── assets/
│   │   └── logo.png
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── config.js
│       ├── config.example.js
│       ├── config-loader.js
│       ├── state.js
│       ├── utils.js
│       ├── auth.js
│       ├── api.js
│       ├── contacts.js
│       ├── whatsapp.js
│       ├── whatsapp-queue.js
│       ├── detail.js
│       ├── table.js
│       ├── modal.js
│       └── app.js
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .env.example
├── .gitignore
└── README.md
```

---

## 3. Arquivos que não sobem para o GitHub

Estes arquivos ficam apenas no computador local e na VPS:

```txt
.env
public/js/config.js
node_modules/
```

Eles são ignorados pelo `.gitignore`.

O `.env` guarda dados sensíveis do backend, como webhook do n8n:

```env
N8N_WEBHOOK=https://n8n.oneer.com.br/webhook/cobrancas
PORT=3000
```

O `public/js/config.js` guarda configurações do front-end:

```js
window.APP_CONFIG = {
  SHEET_ID: 'ID_DA_PLANILHA',
  SHEET_NAME: 'Base',
  SHEET_DETAIL: 'Base',
  CONTACTS_SHEET_NAME: 'Contatos',
  GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
  INTERVALO_MS: 60000
};
```

---

## 4. Planilha principal: aba Base

A aba `Base` tem o seguinte esquema de colunas:

```txt
Data da Venda
IMEI
Produto
Cliente
Valor
Valor Recebido
Valor Pendente
Status
Vencimento 1
Forma de Pagamento 1
Pagamento 1
Vencimento 2
Forma de Pagamento 2
Pagamento 2
Vencimento 3
Forma de Pagamento 3
Pagamento 3
Vencimento 4
Forma de Pagamento 4
Pagamento 4
Observações
Vencimento Atual
.
Dias
```

Mapeamento usado no código:

```js
COL_DATA_VENDA = 0;
COL_IMEI = 1;
COL_PRODUTO = 2;
COL_CLIENTE = 3;
COL_VALOR = 4;
COL_RECEBIDO = 5;
COL_PENDENTE = 6;
COL_STATUS = 7;
COL_VENCIMENTO = 8;
```

Parcelas:

```js
paymentPairs = [
  { numero: 1, vencimentoCol: 8,  pagamentoCol: 10 },
  { numero: 2, vencimentoCol: 11, pagamentoCol: 13 },
  { numero: 3, vencimentoCol: 14, pagamentoCol: 16 },
  { numero: 4, vencimentoCol: 17, pagamentoCol: 19 }
];
```

---

## 5. Regra de vencimento atual

O dashboard considera como vencimento atual a **última data de vencimento informada**.

Prioridade:

```txt
Vencimento 4 > Vencimento 3 > Vencimento 2 > Vencimento 1
```

Exemplo:

```txt
Vencimento 1 = 10/05/2026
Vencimento 2 = 20/05/2026
Vencimento 3 = vazio
Vencimento 4 = vazio
```

O dash usa:

```txt
20/05/2026
```

Essa regra impacta:

```txt
Coluna Vencimento
Status vermelho/amarelo/verde
Filtro Vencidos
Filtro Hoje
Filtro Futuro
```

Importante: o filtro de vencidos deve considerar apenas a última data preenchida, e não qualquer vencimento antigo da linha.

Arquivo principal dessa regra:

```txt
public/js/utils.js
```

Funções importantes:

```js
getVencimentosLinha()
getVencimentoAtualLinha()
linhaTemVencimentoNoStatus()
statusDaLinha()
menorVencimentoTexto()
```

---

## 6. Aba Contatos

Foi criada uma aba chamada:

```txt
Contatos
```

Na mesma planilha do dashboard.

Cabeçalhos:

```txt
A1: Cliente
B1: Telefone
C1: Criado Em
D1: Atualizado Em
E1: Origem
```

Exemplo:

```txt
Cliente          Telefone        Criado Em             Atualizado Em         Origem
João Silva       5585999999999   29/05/2026 15:10      29/05/2026 15:10      dashboard
```

Arquivo responsável por ler e salvar contatos:

```txt
public/js/contacts.js
```

Funções principais:

```js
normalizarNomeContato(nome)
normalizarTelefoneWhatsApp(telefone)
carregarContatosSheet()
buscarContatoCliente(nomeCliente)
obterDataHoraBR()
salvarContatoCliente(nomeCliente, telefone)
```

---

## 7. Permissão do Google Sheets

Antes o dashboard usava apenas leitura:

```txt
https://www.googleapis.com/auth/spreadsheets.readonly
```

Agora, como ele salva telefones na aba `Contatos`, a permissão foi alterada para escrita:

```txt
https://www.googleapis.com/auth/spreadsheets
```

Arquivo:

```txt
public/js/auth.js
```

Após essa alteração, pode ser necessário sair e entrar novamente com Google no dashboard.

---

## 8. Botão Cobrar Cliente no popup

No popup do cliente, foi adicionado o botão:

```txt
Cobrar Cliente
```

Fluxo:

```txt
1. Clica em Cobrar Cliente
2. Sistema procura telefone na aba Contatos
3. Se encontrar telefone, abre WhatsApp direto
4. Se não encontrar, abre modal para informar número
5. Salva o número na aba Contatos
6. Abre WhatsApp com mensagem pronta
```

Arquivos envolvidos:

```txt
public/index.html
public/css/style.css
public/js/contacts.js
public/js/whatsapp.js
```

---

## 9. Mensagem do WhatsApp

A mensagem é gerada no arquivo:

```txt
public/js/whatsapp.js
```

Função:

```js
gerarMensagemWhatsappCliente(cliente)
```

Versão recomendada direta:

```js
function gerarMensagemWhatsappCliente(cliente) {
  const nome = cliente?.nome || 'cliente';
  const saudacao = gerarSaudacaoWhatsapp();

  return `${saudacao}, ${nome}!

Lembrete do Pix da pendência.

Pode fazer e me mandar o comprovante por aqui?`;
}

function gerarSaudacaoWhatsapp() {
  const hora = new Date().getHours();

  if (hora >= 5 && hora < 12) return 'Bom dia';
  if (hora >= 12 && hora < 18) return 'Boa tarde';
  return 'Boa noite';
}
```

O link é gerado assim:

```txt
https://wa.me/TELEFONE?text=MENSAGEM
```

Observação:

```txt
Com wa.me não é possível enviar figurinha automaticamente.
Com wa.me é possível enviar texto, inclusive chave Pix escrita.
```

---

## 10. Modal de telefone

Quando o cliente não possui telefone salvo, o dashboard abre um modal bonito para informar o número.

Arquivos:

```txt
public/index.html
public/css/style.css
public/js/whatsapp.js
```

IDs principais:

```txt
phone-overlay
phone-client-name
phone-input
```

Funções:

```js
abrirModalTelefone(cliente)
fecharModalTelefone()
salvarTelefoneModal()
```

Observação importante:

O modal de telefone precisa ter `z-index` maior que o modal da fila.

Recomendado:

```css
.phone-overlay {
  z-index: 700;
}

.queue-overlay {
  z-index: 600;
}
```

---

## 11. Fila de cobrança por WhatsApp

Foi iniciada a feature de fila para cobrar vários clientes selecionados.

Branch usada:

```txt
feature/whatsapp-queue
```

Objetivo:

```txt
Selecionar vários clientes
→ clicar em Cobrar Selecionados
→ abrir modal da fila
→ abrir WhatsApp de um cliente por vez
→ aguardar tempo aleatório
→ liberar o próximo cliente
```

Arquivos envolvidos:

```txt
public/index.html
public/css/style.css
public/js/whatsapp-queue.js
```

---

## 12. Modal da fila

HTML inserido no `public/index.html`:

```txt
queue-overlay
queue-modal
queue-counter
queue-status
queue-progress-bar
queue-client-name
queue-client-info
queue-wait-box
queue-main-btn
```

CSS inserido em:

```txt
public/css/style.css
```

Classes principais:

```txt
.queue-overlay
.queue-modal
.queue-header
.queue-body
.queue-client-card
.queue-wait-box
.queue-actions
.queue-btn-primary
.queue-btn-secondary
```

---

## 13. Lógica da fila

Arquivo:

```txt
public/js/whatsapp-queue.js
```

Variáveis principais:

```js
let filaCobranca = [];
let filaIndiceAtual = 0;
let filaAguardando = false;
```

Funções principais:

```js
iniciarFilaCobranca()
abrirModalFilaCobranca()
fecharFilaCobranca()
getClienteAtualFila()
renderizarFilaCobranca()
gerarTempoAleatorioFila()
abrirWhatsappFilaAtual()
iniciarContagemEsperaFila(tempoMs)
avancarFilaCobranca()
finalizarFilaCobranca()
```

Tempo aleatório atual:

```js
function gerarTempoAleatorioFila() {
  return Math.floor(Math.random() * 4000) + 3000;
}
```

Isso gera espera entre:

```txt
3 e 7 segundos
```

---

## 14. Botão Cobrar Selecionados

O botão da barra inferior foi alterado.

Antes:

```html
<button class="btn-disparar" id="btn-disparar" onclick="openModal()">
  <span>📲</span> Disparar Cobranças
</button>
```

Depois:

```html
<button class="btn-disparar" id="btn-disparar" onclick="iniciarFilaCobranca()">
  <span>💬</span> Cobrar Selecionados
</button>
```

Arquivo:

```txt
public/index.html
```

---

## 15. Tema claro/escuro

Foi adicionado botão para alternar tema claro/escuro.

Arquivo HTML:

```txt
public/index.html
```

Botão:

```html
<button class="theme-toggle" id="theme-toggle" onclick="toggleTheme()" title="Alternar tema">
  🌙 Escuro
</button>
```

Arquivo CSS:

```txt
public/css/style.css
```

Tema claro suave:

```css
body.light-theme {
  --bg: #e9edf3;
  --surface: #f5f7fa;
  --surface2: #edf1f6;
  --border: #cfd6e3;
  --accent: #00a879;
  --accent2: #e85f2f;
  --warn: #b88400;
  --text: #182033;
  --muted: #6b7487;
  --red: #d9364f;
  --green: #009b72;
  --yellow: #c69200;
}
```

Arquivo JS:

```txt
public/js/app.js
```

Funções:

```js
aplicarTemaSalvo()
toggleTheme()
```

A escolha fica salva no navegador usando:

```txt
localStorage
```

---

## 16. Logo no cabeçalho

O texto do cabeçalho pode ser substituído por logo.

Arquivo:

```txt
public/index.html
```

Exemplo:

```html
<div class="logo">
  <img src="assets/logo.png" alt="Rodrigo Iphones" class="logo-img">
  <span class="logo-section">/cobranças</span>
</div>
```

Arquivo CSS:

```txt
public/css/style.css
```

```css
.logo-img {
  height: 36px;
  width: auto;
  display: block;
  object-fit: contain;
}

.logo-section {
  color: var(--muted);
  font-weight: 400;
  font-size: 16px;
  font-family: var(--font-head);
}
```

A logo deve ficar em:

```txt
public/assets/logo.png
```

---

## 17. Powered by e versão

Rodapé adicionado:

```txt
Powered by oneer.com.br • v1.0.0
```

A versão vem do `package.json`.

Arquivo:

```txt
package.json
```

```json
"version": "1.0.0"
```

Rota no backend:

```txt
/api/version
```

Arquivo:

```txt
server.js
```

Exemplo:

```js
app.get('/api/version', (req, res) => {
  const packageJson = require('./package.json');

  res.json({
    version: packageJson.version || '1.0.0',
    name: packageJson.name || 'dash-cobrancas'
  });
});
```

Arquivo do front:

```txt
public/js/app.js
```

Função:

```js
carregarVersaoApp()
```

---

## 18. Segurança aplicada no Nginx

Domínio:

```txt
cobrancas.oneer.com.br
```

Arquivo Nginx:

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

Comandos para testar:

```bash
nginx -t
systemctl reload nginx
curl -I https://cobrancas.oneer.com.br
```

---

## 19. Rodar localmente

```bash
cd ~/Documentos/dash-cobrancas
npm run dev
```

Abrir:

```txt
http://localhost:3000
```

Parar:

```txt
Ctrl + C
```

---

## 20. Testes úteis no navegador

Testar versão:

```txt
http://localhost:3000/api/version
```

Testar arquivo JS:

```txt
http://localhost:3000/js/whatsapp.js
http://localhost:3000/js/whatsapp-queue.js
```

Console:

```js
typeof abrirWhatsappCliente
typeof iniciarFilaCobranca
```

Esperado:

```txt
'function'
```

Testar contato:

```js
buscarContatoCliente('TESTE CLIENTE').then(console.log).catch(console.error)
```

Testar salvar contato:

```js
salvarContatoCliente('CLIENTE TESTE SALVAR', '85988887777')
  .then(console.log)
  .catch(console.error)
```

---

## 21. Fluxo Git recomendado

Para criar uma feature:

```bash
git checkout main
git pull origin main
git checkout -b feature/nome-da-feature
```

Para salvar alterações:

```bash
git status
git add .
git commit -m "Describe the change"
git push -u origin feature/nome-da-feature
```

Para levar para produção:

```bash
git checkout main
git pull origin main
git merge feature/nome-da-feature
git push origin main
```

---

## 22. Atualizar VPS após push na main

Na VPS:

```bash
ssh root@167.99.15.95
cd /var/www/dash-billing
git checkout main
git pull origin main
npm install
pm2 restart dash-billing
pm2 status
```

Teste:

```bash
curl -I https://cobrancas.oneer.com.br
```

---

## 23. PM2

Ver status:

```bash
pm2 status
```

Reiniciar:

```bash
pm2 restart dash-billing
```

Salvar lista de processos:

```bash
pm2 save
```

Logs:

```bash
pm2 logs dash-billing
```

---

## 24. Checklist antes de publicar

Antes de fazer merge para `main`:

```txt
[ ] npm run dev funciona localmente
[ ] Login Google funciona
[ ] Tabela carrega
[ ] Popup abre
[ ] Cobrar Cliente abre WhatsApp
[ ] Cliente sem telefone abre modal
[ ] Telefone salva na aba Contatos
[ ] Cliente salvo não pede telefone de novo
[ ] Cobrar Selecionados abre fila
[ ] Modal de telefone aparece acima da fila
[ ] Console não mostra erro vermelho
[ ] git status está limpo após commit
```

---

## 25. Problemas comuns

### Função aparece como undefined

Exemplo:

```txt
typeof abrirWhatsappCliente → 'undefined'
```

Verificar:

```txt
1. Arquivo existe em public/js
2. Script foi adicionado no index.html
3. Ordem dos scripts está correta
4. Arquivo não tem erro de sintaxe
```

Comando:

```bash
node --check public/js/whatsapp.js
node --check public/js/whatsapp-queue.js
```

### Modal aparece por baixo

Ajustar `z-index`:

```css
.phone-overlay { z-index: 700; }
.queue-overlay { z-index: 600; }
```

### Google não salva contato

Verificar permissão:

```txt
public/js/auth.js
```

Deve usar:

```txt
https://www.googleapis.com/auth/spreadsheets
```

Depois sair e entrar novamente no Google.

### Porta 3000 ocupada localmente

```bash
sudo lsof -i :3000
kill -9 NUMERO_DO_PID
npm run dev
```

---

## 26. Próximas automações possíveis

Sugestões futuras:

```txt
Histórico de cobranças
Última cobrança enviada
Aviso se cliente já foi cobrado hoje
Filtro Cobrar Hoje
Observação interna por cliente
Botão Copiar Pix
Integração oficial WhatsApp Business Cloud API
```
