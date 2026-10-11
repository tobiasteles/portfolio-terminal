# Portfólio em Terminal

Portfólio interativo no estilo CLI com painel admin.
Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS 3 · Drizzle ORM · Neon (Postgres serverless).

## Rodando localmente

1. Instale as dependências (Node 20+):

   ```bash
   npm install
   ```

2. Crie o banco no [Neon](https://neon.tech), copie a connection string e configure o ambiente:

   ```bash
   cp .env.example .env.local
   # edite DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL e ADMIN_PASSWORD
   # gerar segredo: openssl rand -base64 32
   ```

3. Crie as tabelas no Neon:

   ```bash
   npx drizzle-kit push
   ```

4. Crie o usuário admin e o conteúdo de exemplo (opcional, mas recomendado):

   ```bash
   npm run db:seed
   ```

5. Inicie:

   ```bash
   npm run dev
   ```

   - Site: <http://localhost:3000>
   - Admin: <http://localhost:3000/admin> (use o e-mail e a senha do `.env.local`)

6. Troque `public/curriculo.pdf` pelo seu PDF (ou aponte outro link em `/admin/profile`).

## Migrações versionadas (alternativa ao `push`)

```bash
npm run db:generate   # gera SQL em ./drizzle
npm run db:migrate    # aplica no Neon
npm run db:studio     # interface visual do Drizzle
```

## Deploy (Vercel)

Cadastre `DATABASE_URL` e `AUTH_SECRET` nas variáveis de ambiente do projeto.
Rode `npx drizzle-kit push` e `npm run db:seed` uma vez apontando para o banco de produção.

## Foto de perfil em ASCII

Em `/admin/profile` você informa uma URL ou envia uma imagem. A conversão acontece no seu navegador, com prévia ao vivo
(largura, zoom, contraste, brilho, estilo dos símbolos e inversão). Só o texto ASCII é salvo no banco; o arquivo enviado não é armazenado.
O retrato aparece ao lado dos seus dados nos comandos `about` e `whoami`.

- Pela URL, o site de origem precisa permitir uso em canvas (CORS). Avatares do GitHub (`https://github.com/usuario.png`) costumam funcionar; se der erro, baixe a foto e use o upload.
- Se você já tinha rodado o projeto antes desta versão, execute `npx drizzle-kit push` de novo para criar as colunas `photo_url` e `photo_ascii`.

## Avisos de novas mensagens (opcional)

Quando alguém envia o formulário, a mensagem é salva no banco e, se configurado, você recebe um aviso:

- **E-mail (Resend):** crie uma conta em resend.com, gere uma API key e preencha `RESEND_API_KEY` e `NOTIFY_EMAIL_TO`. O Reply-To já aponta para o visitante.
- **WhatsApp (CallMeBot):** ative o serviço seguindo as instruções em callmebot.com, que devolvem uma apikey no seu WhatsApp. Depois preencha `CALLMEBOT_PHONE` e `CALLMEBOT_APIKEY`.

Os dois canais são independentes e falhas de envio só aparecem nos logs do servidor; a mensagem continua salva e visível em `/admin/messages`.

## Segurança

- Sessão via JWT (HS256) em cookie `httpOnly`, validado no `middleware.ts` e de novo em cada página e Server Action do admin.
- Senhas com bcrypt. URLs salvas pelo admin só aceitam `http(s)` (ou caminho local no currículo).
- Formulário de contato com validação Zod e campo honeypot. Para produção com tráfego real, adicione rate limit (ex.: Upstash Ratelimit).
- No Next 16, renomeie `src/middleware.ts` para `src/proxy.ts` e a função exportada para `proxy`.

## Comandos do terminal

`help`, `about`, `skills`, `projects`, `resume`, `faq`, `contact`, `links`, `clear`
(aliases em português: `projetos`, `tecnologias`, `curriculo`, `contato`, `sobre`).
Tab completa, ↑/↓ percorrem o histórico, Ctrl+L limpa a tela.
