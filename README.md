# 📅 Agendador Novembro - Conciliação de Agendas em Grupo

Aplicação Full-Stack moderna, pronta para produção e prioritariamente otimizada para dispositivos móveis (**Mobile-First**, 320px a 430px) com layout responsivo adaptável para desktop, projetada para conciliar disponibilidades e encontrar as melhores datas em comum no mês de **Novembro**.

---

## 🎯 Regras Específicas do Grupo Aplicadas

Para tornar a experiência a mais rápida, leve e sem atrito possível (reduzindo a fadiga de decisão de 90 turnos para apenas **29 opções relevantes**):

1. **🚫 Domingos Removidos**: Por compromissos fixos do grupo na igreja.
2. **🚫 Sextas-feiras Removidas**: Compromissos fixos já existentes.
3. **🌙 Dias de Semana (Segunda a Quinta)**: Apenas a opção da **Noite (18h às 23h)**, pois todos trabalham durante o dia.
4. **☀️ Sábados Completos**: Opções de **Manhã (08h - 12h)**, **Tarde (12h - 18h)** e **Noite (18h - 23h)**.
5. **👤 Identificação sem Direcionamento**: Campo de texto aberto para que cada participante digite seu nome ou apelido livremente, sem sugestões ou filtros forçados.
6. **📱 Foco Visual Total no Mobile**: O painel de "Melhores Datas" inicia compacto/contraído para não empurrar os dias para baixo na tela do celular.

---

## 🚀 Destaques da Arquitetura & UX

### 1. Zero Atrito & Identificação Fluida
- **Sem senhas ou cadastros formais**: Entrada instantânea informando apenas o nome.
- **Persistência Dupla de Sessão**: Armazenamento sincronizado entre **LocalStorage** e **Cookies** (365 dias).
- **Cabeçalho Fixo no Topo**:
  - Exibe *"Preenchendo como: [Nome] (Editar)"* ou campo de inserção limpo.
  - Barra de progresso geral: `X de 16 pessoas já responderam`.

### 2. Módulo "Quem falta responder?" (Cobrança Ativa no WhatsApp)
- Carrossel horizontal de badges com **rolagem suave e scrollsnap**.
- **Badges de estado:**
  - 🟢 **Verde + Check**: Participante já respondeu.
  - 🟠 **Laranja Pulsante**: Participante pendente.
- Toque no participante pendente abre Bottom Sheet com o link direto `wa.me` contendo mensagem personalizada:
  > *"Fala [Nome]! Só falta você preencher sua disponibilidade de novembro pra gente fechar nosso encontro. Abre o link rapidinho: [URL]"*
- Permite copiar o texto com um toque ou digitar o telefone do contato diretamente.

### 3. Seletor de Novembro Otimizado (29 opções)
- Apenas os **21 dias elegíveis** aparecem na tela (Segunda a Quinta + Sábados).
- Botões grandes para o polegar com ciclo de toques:
  - **Neutro** ➔ 🟢 **Posso** ➔ 🟡 **Se necessário / Talvez** ➔ **Neutro**
- Feedback tátil em cada toque via `navigator.vibrate`.
- Ações rápidas no topo: *"Marcar Todas as Noites"*, *"Marcar Sábados"* e *"Limpar Mês"*.

### 4. Visão Coletiva & Heatmap (Mapa de Calor de Convergência)
- Toggle comutador: `[ Minha Agenda ]` | `[ Visão do Grupo ]`.
- Gradação cromática de convergência no heatmap:
  - 🌟 **100% de convergência**: Destaque verde esmeralda brilhante + ícone de fogo/estrela 🔥⭐.
  - 🟢 **70% - 99%**: Verde médio.
  - 🟡 **40% - 69%**: Amarelo / Dourado.
  - ⚪ **< 40%**: Neutro.
- Toque em qualquer turno abre o **Bottom Sheet Detalhado**:
  - ✅ **Podem ([X] pessoas)**: Lista nominal com badges verdes.
  - ⚠️ **Se necessário ([Y] pessoas)**: Lista nominal com badges amarelos.
  - ❌ **Não responderam / Não podem ([Z] pessoas)**: Lista nominal com atalho individual para cobrar no WhatsApp!

### 5. Algoritmo "Melhores Datas Em Comum"
- Cálculo dinâmico em tempo real de pontuação:
  $$\text{Score} = (\text{Pessoas que Podem} \times 2) + (\text{Pessoas Se Necessário} \times 1)$$
- Ranking em ordem decrescente exibindo os **Top 3 horários campeões**.
- Se houver convergência total (100% das 16 pessoas livres em um turno):
  - Banner comemorativo em gradiente vibrante.
  - Micro-animação com disparo de confetes (`canvas-confetti`).

### 6. Sistema de Notificação do Organizador
- **Organizador Configurado**: `pauloeduardo.braga@hotmail.com`
- **Meta do Grupo**: `16 pessoas`
- **Gatilhos Automáticos de Notificação**:
  1. Todos os 16 participantes preencherem suas agendas.
  2. Pelo menos 1 data/turno alcançar 100% de presença (todos os 16 podem!).
- Logs com visualizador HTML embutido e suporte a SMTP/Webhook.

---

## 💻 Como Rodar

```bash
npm install
npm run build
npm run start
```
Acesse `http://localhost:3000`.
