# pawspace - Sistema de Bot Discord

## 📋 Tarefas (Tasks)

### Phase 1: Infraestrutura (Database)
- [x] 1.1 Instalar quick.db e better-sqlite3
- [x] 1.2 Criar estrutura de banco de dados em src/database
- [x] 1.3 Migrar TimelineConfig de JSON para QuickDB
- [x] 1.4 Atualizar imports nos arquivos existentes

### Phase 2: Daily Embed System
- [x] 2.1 Criar tipos para Daily Embed (src/types/daily-embed.ts)
- [x] 2.2 Criar sistema de clima dinâmico com pesos (src/functions/timeline/weather-system.ts)
- [x] 2.3 Criar funções de lógica do Daily Embed (src/functions/timeline/daily-embed.ts)
- [x] 2.4 Criar comando de configuração (/daily-config)
- [x] 2.5 Criar evento com cron para envios automáticos

### Phase 3: XP/Ranking System
- [ ] 3.1 Atualizar TimelineConfig para VerifiedUser[] com XP
- [ ] 3.2 Criar tracker.ts para rastrear bots com XP
- [ ] 3.3 Atualizar timeline-message.ts para adicionar XP
- [ ] 3.4 Criar comando /rank
- [ ] 3.5 Criar comando /top
- [ ] 3.6 Implementar sistema de badges (Bronze, Silver, Gold, Platinum)

### Phase 4: Bot Detection
- [ ] 4.1 Criar comando /bots com autocomplete e select menus
- [ ] 4.2 Implementar detecção automática de bots em categorias

### Phase 5: Config Export/Import
- [ ] 5.1 Criar comando /config para export/import
- [ ] 5.2 Implementar validação de JSON
- [ ] 5.3 Implementar migração de dados com confirmação do moderador

---

## 🎯 Features

### 1. Timeline Config
- Canal de timeline configurável
- Categorias de chat monitoradas
- Comando: `/timeline-config`

### 2. Verified Users
- Adicionar/remover/listar usuários verificados
- Scan automático para detectar bots em categorias
- Comando: `/verified-users`

### 3. Daily Embed (Sistema de Embed Diário)
- **Horários**: Até 4 horários configuráveis por servidor
- **Dias no servidor**: 1 dia real = X dias no servidor (default: 2)
- **Períodos**: Manhã (00-12), Tarde (12-18), Noite (18-00), Madrugada (00-06)
- **Clima dinâmico**: Sistema de pesos com recuperação e cansaço
- **Clima fixo**: Configurável manualmente até ser removido
- **Imagens locais**: Pasta assets/images/weather/
- **Comando**: `/daily-config`

### 4. Sistema de XP/Ranking
- XP automático para bots que postam (exceto spam)
- Níveis baseados em XP
- Badges: Bronze, Silver, Gold, Platinum
- Comandos: `/rank`, `/top`

### 5. Bot Detection
- Detecção automática de bots Tupperbox
- Histórico de bots vistos por categoria
- Listagem com autocomplete e select menus
- Comando: `/bots`

### 6. Config Export/Import
- Export: Embed com JSON + arquivo para download
- Import: Modal ou arquivo anexado
- Validação de dados
- Moderadores apenas
- Comando: `/config`

---

## 🏗️ Estrutura de Arquivos

```
src/
├── config/
│   └── timeline.ts          # TimelineConfig (em migração para DB)
├── database/
│   └── index.ts             # QuickDB setup
├── types/
│   ├── index.ts
│   ├── screenshot.ts
│   └── daily-embed.ts       # NOVO
├── functions/
│   ├── timeline/
│   │   ├── channel-monitor.ts
│   │   ├── message-detector.ts
│   │   ├── timeline-config.ts
│   │   ├── screenshot-handler.ts
│   │   ├── daily-embed.ts   # NOVO
│   │   ├── weather-system.ts # NOVO
│   │   └── tracker.ts      # NOVO (XP)
│   └── text/
│       ├── screenshot.ts
│       ├── username-parser.ts
│       └── ...
├── discord/
│   ├── commands/public/
│   │   ├── timeline-config.ts
│   │   ├── verified-users.ts
│   │   ├── daily-config.ts  # NOVO
│   │   ├── rank.ts          # NOVO
│   │   ├── top.ts           # NOVO
│   │   ├── bots.ts          # NOVO
│   │   └── config.ts        # NOVO
│   ├── events/
│   │   ├── timeline-message.ts
│   │   ├── timeline-reaction.ts
│   │   └── daily-embed.ts   # NOVO (cron)
│   └── responders/...
└── index.ts
```

---

## 🔧 Detalhes do Sistema de Clima

### Pesos Iniciais
| Clima | Peso |
|-------|------|
| Sol (☀️) | 40 |
| Chuva (🌧️) | 30 |
| Neblina (🌫️) | 20 |
| Neve (❄️) | 10 |

### Regras de Atualização
- **Cansaço**: Clima ativo perde -5 de peso
- **Recuperação**: Climas inativos ganham +2 de peso
- **Persistência**: Bônus para o clima atual continuar

### Transições Válidas (opicional)
- Sol → Neblina, Chuva
- Chuva → Neblina
- Neblina → qualquer um
- Neve → Neblina, Sol

---

## 📅 Estrutura do Daily Embed

```typescript
interface DailyEmbedConfig {
    guildId: string;
    channelId: string;
    startDay: number;        // Dia inicial do contador
    startMonth: number;     // Mês inicial
    startYear: number;      // Ano inicial
    dayMultiplier: number;  // 1 dia real = X dias servidor (default: 2)
    schedules: string[];    // ["08:00", "14:00", "20:00", "02:00"] - até 4
    weather: {
        mode: "dynamic" | "fixed";
        fixedType?: "sun" | "rain" | "snow" | "fog";
        weights: { sun: number; rain: number; fog: number; snow: number; };
    };
    enabled: boolean;
}
```

### Embed Enviado
```
📅 Dia 5 de Março - ☀️ Manhã

[Imagem baseada no clima]
```

---

## 🗃️ Estrutura do Banco de Dados

### Tabelas
1. **timeline_config** - Configurações de timeline por servidor
2. **verified_users** - Usuários verificados com XP
3. **daily_embed_config** - Configurações de daily embed
4. **bot_history** - Histórico de bots detectados
5. **weather_state** - Estado atual do clima por servidor

---

## ⚙️ Comandos

| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `/timeline-config` | Configurações de timeline | Moderador |
| `/verified-users` | Gerenciar usuários verificados | Moderador |
| `/daily-config` | Configurar embed diário | Moderador |
| `/rank` | Ver seu XP e nível | Todos |
| `/top` | Ranking de XP | Todos |
| `/bots` | Listar bots detectados | Todos |
| `/config` | Export/Importar config | Moderador |

---

## 🔄 Migração de Dados

Ao migrar de JSON para QuickDB:
1. Detectar arquivos JSON existentes
2. Mostrar preview ao moderador
3. Confirmar migração
4. Migrar dados
5. (Opcional) Remover arquivos JSON antigos