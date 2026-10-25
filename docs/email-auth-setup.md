# Вход и регистрация по ссылке из email

Coffetea использует Firebase Authentication passwordless email link. Firebase отправляет письмо, а пользователь нажимает ссылку, чтобы подтвердить email и войти. Resend, Cloud Functions и Cloud Firestore для отправки этой ссылки не нужны.

## 1. Включите вход по ссылке в Firebase

1. Откройте Firebase Console → **Authentication** → **Sign-in method**.
2. Включите провайдера **Email/Password**, затем включите вариант **Email link (passwordless sign-in)** и сохраните изменения.
3. В **Authentication** → **Settings** → **Authorized domains** добавьте `localhost` для локальной разработки. Домен указывается без номера порта. Для опубликованного сайта добавьте домен нового проекта, например `cfteasite.web.app`.
4. В **Authentication** → **Templates** → **Email address verification** настройте тему и текст письма. Firebase автоматически добавляет ссылку для входа.

## 2. Настройте Web App

1. В настройках Firebase-проекта найдите конфигурацию Web App: `apiKey`, `authDomain`, `projectId` и `appId`.
2. Создайте в корне проекта `.env.local` на основе `.env.example` и вставьте значения. Этот файл исключён из Git.
3. Перезапустите Vite после изменения `.env.local`:

   ```powershell
   npm.cmd run dev
   ```

## 3. Проверьте вход

1. Откройте сайт на `http://localhost:5173`, выберите роль и введите email, доступ к которому у вас есть.
2. Откройте письмо и нажмите ссылку. Лучше открыть её в том же браузере, где запущен сайт. Если ссылка открылась на другом устройстве или в другом браузере, приложение попросит повторно указать email.

Для этого сценария нужен только Firebase Authentication. Создавать базу Firestore, подключать биллинг, Resend или Cloud Functions для отправки письма не требуется.

Профили, меню и заказы Coffetea пока хранятся в `localStorage` конкретного браузера. Firebase Auth подтверждает email и создаёт аккаунт, но данные приложения автоматически между устройствами не переносятся.
