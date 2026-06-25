const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event) {
  const signature = event.headers['stripe-signature'];

  let stripeEvent;

  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;

    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (error) {
    console.error('Webhook署名検証エラー:', error.message);

    return {
      statusCode: 400,
      body: `Webhook Error: ${error.message}`
    };
  }

  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      const meta = session.metadata || {};

      const reservationData = {
        reservationId: meta.reservationId || '',
        paymentIntentId: session.payment_intent || '',
        checkoutSessionId: session.id || '',
        email: meta.email || session.customer_email || '',
        name: meta.name || '',
        phone: meta.phone || '',
        menu: meta.menu || '',
        room: meta.room || '',
        date: meta.date || '',
        startTime: meta.startTime || '',
        endTime: meta.endTime || '',
        people: meta.people || '',
        amount: session.amount_total || '',
        paymentStatus: session.payment_status || 'paid',
        reservationStatus: 'confirmed',
        memo: meta.memo || ''
      };

      const gasUrl = process.env.RESERVATION_API_URL;

      if (!gasUrl) {
        throw new Error('RESERVATION_API_URL が設定されていません');
      }

      const response = await fetch(gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
      });

      const resultText = await response.text();

      console.log('GAS保存結果:', resultText);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Webhook処理エラー:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Webhook処理に失敗しました',
        details: error.message
      })
    };
  }
};
