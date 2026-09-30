# SmartMoney AI

Розумний трекер особистих фінансів з AI-радником. React + TypeScript + Vite + Recharts.

```bash
npm install
npm run dev      # розробка
npm run build    # збірка у dist/
```

## Підключення будь-якого AI
Налаштування → «Підключення AI». Основний провайдер — Google Gemini. Можна змінити пресет (Gemini, OpenAI, Claude, OpenRouter, Groq, DeepSeek, Ollama)
або вкажіть власний OpenAI-сумісний Base URL, модель і ключ. Без ключа працює вбудований рушій.
Ключ зберігається лише в localStorage браузера. Для публічного продакшену використовуйте проксі на бекенді.

## Структура
`src/lib/finance.ts` — розрахунки · `src/services/aiService.ts` — AI-шар · `src/services/storage.ts` — сховище ·
`src/pages`, `src/components`, `src/hooks`, `src/data`, `src/types`.

## GitHub
```bash
git init && git add . && git commit -m "SmartMoney AI"
git branch -M main && git remote add origin <URL> && git push -u origin main
```

## Android APK
Push у `main` → GitHub → Actions → «Build Android APK» → Artifacts → SmartMoney-AI-apk.
