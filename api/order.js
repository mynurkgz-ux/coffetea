// Отправляет уведомление о новом заказе в Telegram.
// Токен и chat id берутся из переменных окружения Vercel: BOT_TOKEN и CHAT_ID.
const clean = (value, max = 200) => String(value ?? '').slice(0, max);

function buildText(body) {
  // Старый формат запроса (один товар) тоже поддерживается.
  const items = Array.isArray(body.items)
    ? body.items.slice(0, 50)
    : body.product
      ? [{ name: body.product, qty: body.qty, price: body.price, currency: 'сом' }]
      : [];

  const lines = items.map(item => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    return `• ${clean(item.name, 100)} × ${qty} — ${(qty * price).toLocaleString('ru-RU')} ${clean(item.currency || 'сом', 10)}`;
  });

  const total = body.total
    ? clean(body.total, 100)
    : items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0), 0) + ' сом';

  return [
    '🛎 Новый заказ CoffeTea',
    `Код: ${clean(body.code, 20)}`,
    body.venue ? `Заведение: ${clean(body.venue, 100)}` : null,
    `Покупатель: ${clean(body.buyerContact, 100) || 'не указан'}`,
    '',
    ...lines,
    '',
    `Итого: ${total}`,
  ].filter(line => line !== null).join('\n').slice(0, 4000);
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'use POST' });

    const body = req.body || {};
    const hasItems = Array.isArray(body.items) ? body.items.length > 0 : Boolean(body.product);
    if (!hasItems || !body.code) return res.status(400).json({ error: 'bad data' });

    if (!process.env.BOT_TOKEN || !process.env.CHAT_ID) {
      return res.status(500).json({ error: 'BOT_TOKEN or CHAT_ID is not set on Vercel' });
    }

    const r = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.CHAT_ID, text: buildText(body) }),
    });
    const data = await r.json();
    if (!data.ok) return res.status(500).json({ telegram_error: data });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
