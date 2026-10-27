const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');

const telegramBotToken = defineSecret('TELEGRAM_BOT_TOKEN');
const telegramChatId = defineSecret('TELEGRAM_CHAT_ID');

function buildOrderMessage(orderId, order = {}) {
  const items = Array.isArray(order.items)
    ? order.items.map(item => {
      const quantity = Number(item.qty) || 0;
      const price = Number(item.price) || 0;
      const currency = String(item.currency || 'сом');
      return `• ${String(item.name || 'Товар')} × ${quantity} — ${(price * quantity).toLocaleString('ru-RU')} ${currency}`;
    })
    : [];

  return [
    '🛎 Новый заказ CoffeTea',
    `Заказ: ${String(order.code || orderId)}`,
    `Покупатель: ${String(order.buyerContact || 'не указан')}`,
    '',
    ...items,
    '',
    `Итого: ${String(order.total || 'не указано')}`,
    'Оплата: наличными на кассе'
  ].join('\n').slice(0, 4000);
}

exports.notifyTelegramOnSiteOrder = onDocumentCreated(
  {
    document: 'siteOrders/{orderId}',
    secrets: [telegramBotToken, telegramChatId],
    region: 'us-central1'
  },
  async event => {
    const order = event.data?.data();
    if (!order) {
      logger.error('Created site order has no document data.', {
        orderId: event.params.orderId
      });
      return;
    }

    const token = telegramBotToken.value();
    const chatId = telegramChatId.value();
    if (!token || !chatId) {
      logger.error('Telegram notification secrets are not configured.', {
        orderId: event.params.orderId
      });
      return;
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildOrderMessage(event.params.orderId, order)
      })
    });

    if (!response.ok) {
      const responseBody = await response.text();
      logger.error('Telegram rejected the new-order notification.', {
        orderId: event.params.orderId,
        status: response.status,
        response: responseBody.slice(0, 500)
      });
      throw new Error(`Telegram notification failed with HTTP ${response.status}.`);
    }

    logger.info('Sent Telegram notification for a new site order.', {
      orderId: event.params.orderId
    });
  }
);
