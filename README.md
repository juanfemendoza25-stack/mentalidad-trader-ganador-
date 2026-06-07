# Psycho Trading · El Trader Sólido

Journal de psicología del trading basado en Mark Douglas (Trading in the Zone).

## Stack
- **Frontend:** HTML/CSS/JS puro (sin frameworks)
- **Backend:** Node.js + Express (proxy seguro para Claude API)
- **IA:** Claude claude-sonnet-4-5 vía Anthropic API

## Setup local

```bash
npm install
cp .env.example .env
# Edita .env y pega tu ANTHROPIC_API_KEY
npm start
# Abre http://localhost:3000
```

## Deploy en Render

1. Conecta este repo en [render.com](https://render.com)
2. **Build command:** `npm install`
3. **Start command:** `node server.js`
4. Agrega variable de entorno: `ANTHROPIC_API_KEY=sk-ant-...`

## Funcionalidades
- Dashboard con curva de equity, winrate y métricas de disciplina
- Ritual diario de apertura (5 pasos)
- Las 5 verdades fundamentales de Mark Douglas
- Trabajo de identidad "Yo Soy" con diario
- Tracker de los 4 miedos del trader
- Log de trades con análisis psicológico por IA
- Historial con mood pre/post trade
- Trading plan editable con análisis por IA
- Racha de identidad 21 días
