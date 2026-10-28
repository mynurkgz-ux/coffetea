# Уведомления о заказах в Telegram

Cloud Functions отправляют сообщение в Telegram при создании заказа в каталоге (`siteOrders/{orderId}`) или при покупке из кабинета покупателя (`venues/{venueId}/orders/{orderId}`). Сообщение начинается с номера документа и кода заказа: `Заказ №<номер> код <код>`. Bot token и chat ID хранятся как Firebase Secret Manager secrets и не включаются в клиентскую сборку.

## Однократная настройка

Токен, ранее отправленный в чате, следует считать скомпрометированным. Сначала отзовите его через `@BotFather` (`/revoke`) и создайте новый. Не вставляйте токен в исходный код, `.env.local`, команды с открытым значением или сообщения.

Откройте PowerShell в папке проекта и сохраните **новый** токен: Firebase CLI запросит его интерактивно, значение не нужно добавлять в команду:

```powershell
firebase functions:secrets:set TELEGRAM_BOT_TOKEN --project cfteasite
```

Задайте chat ID в Secret Manager тем же способом:

```powershell
firebase functions:secrets:set TELEGRAM_CHAT_ID --project cfteasite
```

Затем разверните функцию:

```powershell
firebase deploy --only functions:notifyTelegramOnSiteOrder,functions:notifyTelegramOnVenueOrder --project cfteasite
```

Для приёма личных сообщений ботом сначала откройте с ним чат и отправьте `/start`. Для развёртывания Cloud Functions проект Firebase должен поддерживать используемый план оплаты и иметь включённые необходимые Google Cloud APIs.

После настройки создайте тестовый заказ любым способом: в каталоге или из кабинета покупателя. Уведомление содержит номер заказа, код, email покупателя, товары и сумму. Ошибки доставки записываются в Cloud Functions logs; заказ при этом остаётся созданным в Firestore.
