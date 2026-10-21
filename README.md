<div align="center">

# 💻 Portfólio em Terminal

**Um portfólio interativo no estilo CLI: digite comandos para conhecer meus projetos, skills e currículo.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Neon](https://img.shields.io/badge/Neon-Postgres-00E599?logo=postgresql&logoColor=white)](https://neon.tech)

[**🔗 Ver ao vivo**](https://SEU-SITE.vercel.app) · [Reportar um bug](../../issues) · [Sugerir uma ideia](../../issues)

<!-- Troque pelo print ou GIF do seu site. Dica: grave um GIF curto digitando "projects" e "skills". -->
<img src="docs/preview.gif" alt="Demonstração do portfólio em terminal" width="720" />

</div>

---

## ✨ Por que um terminal?

Portfólios costumam ser todos parecidos. Este aqui troca o menu por um **prompt de comando**: o visitante digita `projects`, `skills` ou `resume` e o site responde como um terminal de verdade. Por trás, é uma aplicação full stack completa, com banco de dados, autenticação e painel administrativo para editar tudo sem mexer no código.

## 🚀 Funcionalidades

**Para quem visita**
- Terminal interativo com **autocompletar (Tab)**, **histórico (↑/↓)** e **Ctrl+L** para limpar a tela
- Aliases em português: `projetos`, `tecnologias`, `curriculo`, `contato`, `sobre`
- Retrato em **ASCII art** gerado a partir da minha foto
- Formulário de contato direto no terminal
- Download do currículo em PDF
- Imagens de compartilhamento (Open Graph/Twitter), `sitemap` e `robots` gerados automaticamente

**Para quem administra (`/admin`)**
- Edição de perfil, skills, projetos e FAQ pela interface, sem precisar mexer no código
- Caixa de entrada com as mensagens do formulário de contato
- Conversor de foto para ASCII com prévia ao vivo (largura, zoom, contraste, brilho e estilo dos símbolos). A conversão roda no navegador e só o texto é salvo
- Avisos de novas mensagens por **e-mail (Resend)** e **WhatsApp (CallMeBot)**, ambos opcionais

## ⌨️ Comandos do terminal

| Comando    | O que faz                                  |
| ---------- | ------------------------------------------ |
| `help`     | Lista os comandos disponíveis              |
| `about`    | Quem sou eu                                |
| `skills`   | Tecnologias que domino, por categoria      |
| `projects` | Projetos que criei                         |
| `resume`   | Baixa o currículo em PDF                   |
| `faq`      | Perguntas frequentes                       |
| `contact`  | Envia uma mensagem para mim                |
| `links`    | GitHub, LinkedIn e e-mail                  |
| `clear`    | Limpa a tela                               |

## 🛠️ Stack

| Camada          | Tecnologias                                                |
| --------------- | ---------------------------------------------------------- |
| Framework       | Next.js 15 (App Router, Server Actions) e React 19         |
| Linguagem       | TypeScript                                                 |
| Estilo          | Tailwind CSS 3 e fonte JetBrains Mono                      |
| Banco de dados  | PostgreSQL serverless no [Neon](https://neon.tech)         |
| ORM             | Drizzle ORM e Drizzle Kit                                  |
| Autenticação    | JWT (HS256) com `jose` e senhas com `bcryptjs`             |
| Validação       | Zod                                                        |
| Deploy          | Vercel                                                     |

## 🔒 Segurança

- Sessão por **JWT em cookie `httpOnly`**, validado no `middleware` e de novo em cada página e Server Action do admin
- Senhas armazenadas com **bcrypt**
- URLs salvas pelo admin aceitam apenas `http(s)` (ou caminho local, no caso do currículo)
- Formulário de contato com **validação Zod** e campo **honeypot** contra bots
- Cabeçalhos de segurança (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)

## 📁 Estrutura

```
├── scripts/seed.ts          # cria o admin e o conteúdo de exemplo
├── public/curriculo.pdf     # currículo para download
└── src/
    ├── app/
    │   ├── admin/           # painel administrativo (login, perfil, skills, projetos, FAQ, mensagens)
    │   ├── actions/         # Server Actions públicas (contato)
    │   └── api/health/      # healthcheck
    ├── components/
    │   ├── terminal/        # o terminal: comandos, saídas, boot, formulário
    │   └── admin/           # formulários e editor de foto ASCII
    ├── db/                  # schema Drizzle e queries
    └── lib/                 # auth, JWT, ASCII, validadores, notificações
```

## 🧪 Rodando localmente

**Pré-requisitos:** Node.js 20+ e uma conta gratuita no [Neon](https://neon.tech).

```bash
# 1. Clone e instale
git clone https://github.com/SEU-USUARIO/portfolio-terminal.git
cd portfolio-terminal
npm install

# 2. Configure o ambiente
cp .env.example .env.local
# edite DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL e ADMIN_PASSWORD
# para gerar o segredo: openssl rand -base64 32

# 3. Crie as tabelas e o conteúdo de exemplo
npx drizzle-kit push
npm run db:seed

# 4. Inicie
npm run dev
```

- Site: <http://localhost:3000>
- Admin: <http://localhost:3000/admin> (use o e-mail e a senha do `.env.local`)

Depois de entrar no admin, personalize seu perfil, skills e projetos. Para trocar o currículo, substitua `public/curriculo.pdf` ou aponte outro link em `/admin/profile`.

### Variáveis de ambiente

| Variável                              | Obrigatória | Descrição                                          |
| ------------------------------------- | :---------: | -------------------------------------------------- |
| `DATABASE_URL`                        |     ✅      | Connection string do Neon                          |
| `AUTH_SECRET`                         |     ✅      | Segredo para assinar o JWT                         |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`      |     ✅      | Credenciais do primeiro admin (usadas pelo seed)   |
| `NEXT_PUBLIC_SITE_URL`                |  Produção   | URL pública do site                                |
| `RESEND_API_KEY` / `NOTIFY_EMAIL_TO`  |     ❌      | Aviso de novas mensagens por e-mail                |
| `CALLMEBOT_PHONE` / `CALLMEBOT_APIKEY`|     ❌      | Aviso de novas mensagens por WhatsApp              |

### Scripts úteis

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm run typecheck    # checagem de tipos
npm run db:generate  # gera migrações SQL
npm run db:migrate   # aplica migrações
npm run db:studio    # interface visual do banco
```

## ☁️ Deploy na Vercel

1. Importe o repositório na [Vercel](https://vercel.com).
2. Cadastre `DATABASE_URL` e `AUTH_SECRET` nas variáveis de ambiente do projeto.
3. Rode `npx drizzle-kit push` e `npm run db:seed` uma vez apontando para o banco de produção.

## 🗺️ Próximos passos

- [ ] Rate limit no formulário de contato (ex.: Upstash Ratelimit)
- [ ] Migrar `middleware.ts` para `proxy.ts` ao atualizar para o Next 16

## 🤝 Contribuindo

Sugestões e correções são bem-vindas. Abra uma [issue](../../issues) para conversar antes de enviar um pull request.

## 📬 Contato

- 🌐 Portfólio: [SEU-SITE.vercel.app](https://SEU-SITE.vercel.app)
- 💼 LinkedIn: [linkedin.com/in/SEU-USUARIO](https://www.linkedin.com/in/SEU-USUARIO)
- ✉️ E-mail: seu@email.com

---

<div align="center">

Se este projeto te ajudou ou inspirou, deixe uma ⭐ no repositório!

</div>
