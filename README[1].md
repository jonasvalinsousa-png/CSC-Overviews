
# CSC Relatórios - Render (Gratuito)

Este pacote traz:
- **server.js** (API Node.js/Express com SQLite)
- **schema.sql** (estrutura da tabela)
- **public/index.html** (relatório com formulário + envio)
- **public/dashboard.html** (lista simples para visualização)
- **.env.sample** (modelo de variáveis de ambiente)

## Passo a passo (Render)
1. Crie conta no Render: https://render.com
2. Crie conta no GitHub: https://github.com
3. Suba este projeto no seu repositório GitHub.
4. No Render, **New + → Web Service** → conecte ao repositório.
5. Configure:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
6. Em **Environment Variables**, adicione:
   - `API_KEY` = um segredo forte (ex.: `MINHA-CHAVE-ULTRA-SECRETA`)
   - `PORT` (Render define automaticamente; seu código já usa `process.env.PORT`).
7. Deploy. O Render criará uma URL pública.
8. Acesse `https://sua-url.onrender.com` para o relatório.
9. Acesse `https://sua-url.onrender.com/dashboard.html` para visualizar.

### Editando o segredo localmente
Crie um arquivo `.env` na raiz com:
```
API_KEY=troque-este-segredo
PORT=3000
```

### Observações
- O **SQLite** salva os dados em `data/data.db`. Em hospedagem gratuita, pode ser reiniciado; para persistência robusta, migre para **PostgreSQL** (Render tem plano grátis).
- **Segurança:** o front envia `x-api-key` para proteger a API.
- **Sem custo:** Render oferece plano gratuito; seu time não precisa se cadastrar, apenas usar o link.
