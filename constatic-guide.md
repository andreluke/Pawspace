# Guia — Framework Constatic

> Framework TypeScript para criação de bots de Discord modernos, gerado via CLI (`constatic`).  
> Repositório: [rinckodev/constatic](https://github.com/rinckodev/constatic) | Docs: https://constatic-docs.vercel.app/pt/docs

---

## 1. Visão Geral

O **Constatic** é uma CLI que gera projetos estruturados de bots para Discord com:

- Sistema de **Comandos** (slash, contexto, autocomplete)
- Sistema de **Eventos** (ouvintes de eventos do Discord.js)
- Sistema de **Responders** (botões, selects, modais via `customId`)
- Integrações opcionais com **bancos de dados** e **servidores de API**
- Ambiente **TypeScript** totalmente configurado com path aliases

**Requisito mínimo:** Node.js >= 20.11

---

## 2. Criando um Projeto

```bash
npx constatic@latest
```

A CLI apresenta um menu interativo para configurar:

- Nome do projeto
- Banco de dados (MongoDB, MySQL/MariaDB, Firestore, Prisma, QuickDB)
- Servidor de API (Fastify, Express, Elysia, Hono)
- Recursos adicionais

---

## 3. Estrutura do Projeto Gerado

```
src/
├── index.ts                  # Entry point — chama bootstrap()
├── settings/
│   ├── index.ts              # Exporta utilitários e configurações
│   └── global.ts             # Variáveis e funções globais
└── discord/
    ├── base/
    │   ├── base.command.ts   # Lógica de registro e handler de comandos
    │   ├── base.creators.ts  # Funções createCommand, createEvent, createResponder
    │   └── base.types.d.ts   # Tipos TypeScript do framework
    ├── commands/
    │   └── public/           # Comandos públicos (ex: ping.ts, counter.ts)
    ├── events/               # Ouvintes de eventos
    └── responders/           # Handlers de componentes interativos
```

**Path aliases disponíveis (tsconfig):**

| Alias | Aponta para |
|-------|-------------|
| `#base` | `src/discord/base` |
| `#settings` | `src/settings` |

---

## 4. Bootstrap

O `src/index.ts` deve apenas chamar a função de inicialização:

```typescript
import { bootstrap } from "#base";
bootstrap();
```

O `bootstrap` registra comandos, conecta eventos, inicializa responders e sobe o client do Discord.js automaticamente.

---

## 5. Comandos

### 5.1 Criando um Slash Command

```typescript
import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";

createCommand({
    name: "ping",           // SlashName: lowercase, sem espaços
    description: "Responde com pong 🏓",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        await interaction.reply({ content: "Pong 🏓" });
    }
});
```

> **Regra:** `name` deve ser lowercase e sem espaços (tipo `SlashName<S>` garante isso em compile time).

### 5.2 Slash Command com Opções

```typescript
createCommand({
    name: "greet",
    description: "Cumprimenta um usuário",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "Usuário a cumprimentar",
            type: ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    async run(interaction) {
        const user = interaction.options.getUser("user", true);
        await interaction.reply({ content: `Olá, ${user}!` });
    }
});
```

### 5.3 Context Menu Command

```typescript
import { ApplicationCommandType } from "discord.js";

createCommand({
    name: "Ver Perfil",     // ContextName: pode ter espaços e maiúsculas
    type: ApplicationCommandType.User,
    async run(interaction) {
        const target = interaction.targetUser;
        await interaction.reply({ content: `Usuário: ${target.tag}` });
    }
});
```

### 5.4 Autocomplete

```typescript
createCommand({
    name: "search",
    description: "Busca algo",
    type: ApplicationCommandType.ChatInput,
    options: [/* ... opção com autocomplete: true */],
    async run(interaction) { /* ... */ },
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const choices = ["opção1", "opção2"].filter(c => c.startsWith(focused));
        await interaction.respond(choices.map(c => ({ name: c, value: c })));
    }
});
```

### 5.5 Configuração do Sistema de Comandos (`setupCreators`)

```typescript
setupCreators({
    commands: {
        guilds: ["ID_DO_SERVIDOR"],       // comandos não-globais
        verbose: true,                    // log detalhado no registro
        defaultMemberPermissions: "0",   // permissão padrão
        async middleware(interaction) {
            // executado antes de cada comando
        },
        async onNotFound(interaction) {
            await interaction.reply({ content: "Comando não encontrado." });
        },
        async onError(error, interaction) {
            console.error(error);
        }
    }
});
```

---

## 6. Eventos

```typescript
import { createEvent } from "#base";

createEvent({
    name: "messageCreate",
    async run(message) {
        if (message.author.bot) return;
        console.log(`Mensagem recebida: ${message.content}`);
    }
});
```

> Qualquer evento do Discord.js pode ser ouvido. O `name` deve corresponder ao nome do evento (`messageCreate`, `guildMemberAdd`, `ready`, etc.).

---

## 7. Responders

Responders tratam interações de **botões**, **select menus** e **modais** via correspondência de `customId`.

### 7.1 Botão

```typescript
import { createResponder, ResponderType } from "#base";

createResponder({
    customId: "confirm-action",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        await interaction.update({ content: "Ação confirmada!", components: [] });
    }
});
```

### 7.2 Responder com Parâmetros Dinâmicos

O `customId` suporta **segmentos de parâmetro** com a sintaxe `/:param`:

```typescript
// Criando o botão no comando:
const button = new ButtonBuilder()
    .setCustomId(`counter/${currentValue}`)
    .setLabel("+1")
    .setStyle(ButtonStyle.Primary);

// Responder que captura o parâmetro:
createResponder({
    customId: "counter/:current",
    types: [ResponderType.Button],
    cache: "cached",
    parse: params => ({ current: Number.parseInt(params.current) }),
    async run(interaction, { current }) {
        await interaction.update(counterMenu(current + 1));
    }
});
```

### 7.3 Select Menu

```typescript
createResponder({
    customId: "select-role",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        const [selected] = interaction.values;
        await interaction.reply({ content: `Você selecionou: ${selected}` });
    }
});
```

### 7.4 Modal

```typescript
createResponder({
    customId: "feedback-modal",
    types: [ResponderType.ModalSubmit],
    cache: "cached",
    async run(interaction) {
        const text = interaction.fields.getTextInputValue("feedback");
        await interaction.reply({ content: `Feedback recebido: ${text}` });
    }
});
```

---

## 8. Scripts NPM Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento |
| `npm run build` | Compila o TypeScript |
| `npm run watch` | Recompila ao salvar |
| `npm start` | Executa o bot compilado |

---

## 9. Integrações de Banco de Dados

Selecionáveis no momento da geração do projeto via CLI:

| Banco | Biblioteca |
|-------|-----------|
| MongoDB | Mongoose |
| MySQL / MariaDB | Driver SQL direto |
| Firestore | Typesaurus ou Firelord |
| Prisma ORM | PostgreSQL, MySQL ou SQLite |
| QuickDB | JSON-based (simples) |

A conexão é inicializada dentro do `bootstrap` ou em um arquivo dedicado em `src/settings/`.

---

## 10. Integrações de Servidor de API

| Framework | Observação |
|-----------|-----------|
| Fastify | Alta performance, recomendado |
| Express | Popular, amplamente documentado |
| Elysia | Otimizado para Bun |
| Hono | Leve, multi-runtime |

O servidor sobe junto com o bot no bootstrap. As rotas ficam em `src/api/` ou equivalente gerado.

---

## 11. Ferramenta de Emojis (CLI)

Gerenciada pela própria CLI Constatic (não pelo código do bot):

```bash
npx constatic@latest
# → Selecionar "Emoji Tool"
```

Operações disponíveis:
- **Upload** — enviar imagens como emojis de aplicação
- **Listar** — ver todos os emojis com suas informações
- **Gerar arquivo** — exportar JSON com os emojis prontos para uso no código
- **Deletar** — remover emojis selecionados ou todos de uma vez

---

## 12. Regras e Convenções Importantes

1. **Nomes de slash commands** devem ser `lowercase` e **sem espaços**.
2. **Context menu commands** podem ter espaços e maiúsculas no nome.
3. Todos os arquivos de comandos, eventos e responders são **auto-importados** pelo bootstrap — basta criar o arquivo na pasta correta.
4. Use os **path aliases** (`#base`, `#settings`) em vez de caminhos relativos longos.
5. O `customId` de responders aceita **parâmetros dinâmicos** no formato `/:param` — use `parse` para tipar os valores.
6. Interações de componentes devem usar `cache: "cached"` na maioria dos casos (garante acesso ao guild/member).

---

## 13. VSCode Snippets Incluídos

| Snippet | O que gera |
|---------|-----------|
| `new.command` | Slash Command básico |
| `new.command.options` | Slash Command com opções |
| `new.command.user` | User Context Command |
| `new.command.message` | Message Context Command |

---

## 14. Checklist para Implementar uma Feature

- [ ] Criar arquivo em `src/discord/commands/public/` (ou subpasta adequada)
- [ ] Usar `createCommand` com `type` correto
- [ ] Se usar componentes interativos, criar `createResponder` com `customId` matching
- [ ] Se precisar de evento, criar `createEvent` em `src/discord/events/`
- [ ] Testar localmente com `npm run dev`
- [ ] Build final com `npm run build` + `npm start`
