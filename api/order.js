export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "use POST" });

    const body = req.body || {};
    const product = body.product;
    const qty = Number(body.qty);
    const price = Number(body.price);
    const code = body.code;
    if (!product || !qty || !price || !code) return res.status(400).json({ error: "bad data" });

    const text =
      "Новый заказ\n\n" +
      "Товар: " + product + "\n" +
      "Количество: " + qty + "\n" +
      "Цена: " + price + " сом\n" +
      "Сумма: " + (qty * price) + " сом\n" +
      "Код: " + code;

    const r = await fetch("https://api.telegram.org/bot" + process.env.BOT_TOKEN + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: text,
        reply_markup: {
          inline_keyboard: [[{ text: "Подтвердить", callback_data: ("ok:" + code).slice(0, 64) }]],
        },
      }),
    });
    const data = await r.json();
    if (!data.ok) return res.status(500).json({ telegram_error: data });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}