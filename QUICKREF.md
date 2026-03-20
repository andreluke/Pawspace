# Pawspace - Quick Reference

## Commands
```typescript
import { createCommand } from "#base";
import { ApplicationCommandType } from "discord.js";

createCommand({
    name: "nome-comando",
    description: "Descrição",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        await interaction.reply({ content: "Ok!" });
    }
});
```

## Events
```typescript
import { createEvent } from "#base";

createEvent({
    name: "messageCreate",
    async run(message) {
        if (message.author.bot) return;
    }
});
```

## Responders (Buttons)
```typescript
import { createResponder, ResponderType } from "#base";

createResponder({
    customId: "botao-id",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        await interaction.update({ content: "Ok!", components: [] });
    }
});
```

## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start in development |
| `npm run build` | Compile with tsup |
| `npm run watch` | Watch mode |
| `npm start` | Run compiled |

## Rules
- Slash commands: `lowercase`, no spaces
- Context menu: can have spaces
- Files auto-imported by bootstrap
