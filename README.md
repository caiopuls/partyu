# PartyU - Plataforma de Vendas e Revenda de Ingressos

MVP profissional de uma plataforma de vendas de ingressos de eventos, shows e festas com foco em revenda segura. Desenvolvido com Next.js, Supabase, Tailwind CSS e integração com Pagar.me para pagamentos PIX.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Supabase** - Backend (Auth, Database, RLS)
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI baseados em Radix
- **Pagar.me** - Gateway de pagamento PIX
- **Zod** - Validação de dados
- **date-fns** - Manipulação de datas

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase
- Conta no Pagar.me (para pagamentos)

## 🛠️ Configuração

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd partyu
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com o conteúdo abaixo e preencha com seus valores:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...  # necessário para operações server-side

# Pagar.me
PAGARME_API_KEY=YOUR_PAGARME_API_KEY

# Pagar.me Recipients (para split rules)
# - PartyU (plataforma)
PAGARME_PARTYU_RECIPIENT_ID=re_XXXXXXXXXXXXXXXX
# - Organizador padrão (caso não tenha recipient específico por organizador)
PAGARME_ORGANIZER_DEFAULT_RECIPIENT_ID=re_YYYYYYYYYYYYYYYYYYYY
# - Revendedor padrão (opcional; pode ser o mesmo do organizador, se desejar outro fluxo)
PAGARME_RESELLER_DEFAULT_RECIPIENT_ID=re_ZZZZZZZZZZZZZZZZZZZZ
```

**Importante:** O arquivo `.env.local` não deve ser commitado no Git (já está no `.gitignore`).

### 4. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. No SQL Editor, execute as migrations em `supabase/migrations/20240101000000_initial_schema.sql`
3. Configure os provedores de autenticação (Email/Password, Google, Apple) nas configurações do projeto
4. Configure as URLs de redirecionamento OAuth:
   - `http://localhost:3000/auth/callback` (desenvolvimento)
   - `https://seu-dominio.com/auth/callback` (produção)

### 5. Configure o Pagar.me

1. Crie uma conta no [Pagar.me](https://pagar.me)
2. Obtenha sua API Key nas configurações
3. Configure o webhook para receber notificações de pagamento:
   - URL: `https://seu-dominio.com/api/payments/webhook`
   - Eventos: `transaction.status_changed`

### 6. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
partyu/
├── src/
│   ├── app/                    # Rotas Next.js (App Router)
│   │   ├── (auth)/            # Rotas de autenticação
│   │   ├── api/               # API Routes
│   │   ├── eventos/           # Páginas de eventos
│   │   ├── meus-ingressos/    # Página de ingressos do usuário
│   │   ├── minha-carteira/    # Página de carteira
│   │   └── anunciar/           # Página de anúncio de revenda
│   ├── components/            # Componentes React
│   │   ├── layout/           # Header, Footer
│   │   ├── ui/               # Componentes shadcn/ui
│   │   ├── payment/          # Componentes de pagamento
│   │   └── resale/           # Componentes de revenda
│   ├── lib/                  # Utilitários e helpers
│   │   ├── supabase/         # Clientes Supabase
│   │   ├── payments/         # Integração Pagar.me
│   │   └── utils.ts          # Funções utilitárias
│   ├── hooks/                # React Hooks
│   ├── types/                # Tipos TypeScript
│   └── middleware.ts         # Middleware Next.js
├── supabase/
│   └── migrations/          # Migrations SQL
└── public/                  # Arquivos estáticos
```

## 🎯 Funcionalidades Principais

### Autenticação
- ✅ Login com e-mail/senha
- ✅ Registro de conta
- ✅ Recuperação de senha
- ✅ Login social (Google, Apple)
- ✅ Proteção de rotas sensíveis

### Eventos
- ✅ Listagem de eventos por região
- ✅ Página de detalhes do evento
- ✅ Slider de banners e categorias
- ✅ Busca e filtros

### Compra de Ingressos
- ✅ Compra de ingressos oficiais
- ✅ Compra de ingressos de revenda
- ✅ Pagamento via PIX (Pagar.me)
- ✅ QR Code e código PIX
- ✅ Confirmação automática de pagamento

### Revenda
- ✅ Anúncio de ingressos para revenda
- ✅ Definição de preço com validações
- ✅ Cálculo automático de comissão
- ✅ Listagem de ingressos de revenda
- ✅ Transferência automática de propriedade

### Carteira
- ✅ Saldo da carteira
- ✅ Histórico de transações
- ✅ Crédito automático ao vender ingressos
- ✅ Débito de comissão da plataforma

## 🔒 Segurança

- **Row Level Security (RLS)** - Políticas de segurança no Supabase
- **Validação Zod** - Validação de dados em todas as APIs
- **Service Role Key** - Usado apenas no servidor, nunca no cliente
- **Middleware** - Proteção de rotas sensíveis
- **Idempotência** - Prevenção de processamento duplicado de pagamentos

## 📝 Migrations

As migrations SQL estão em `supabase/migrations/`. Execute-as no SQL Editor do Supabase na ordem:

1. `20240101000000_initial_schema.sql` - Schema inicial com todas as tabelas e RLS

## 🧪 Testes

Para testar o fluxo completo:

1. **Criar conta** - `/criar-conta`
2. **Explorar eventos** - Home page
3. **Comprar ingresso** - `/eventos/[id]` → Comprar → Pagar com PIX
4. **Anunciar para revenda** - `/meus-ingressos` → Anunciar
5. **Comprar ingresso de revenda** - `/eventos/[id]` → Comprar revenda
6. **Verificar carteira** - `/minha-carteira`

## 🚢 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 📄 Licença

Este projeto é um MVP desenvolvido para demonstração.

## 🤝 Contribuindo

Este é um projeto MVP. Para contribuições, abra uma issue ou pull request.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
