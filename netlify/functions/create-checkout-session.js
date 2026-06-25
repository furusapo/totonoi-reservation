const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }

    const data = JSON.parse(event.body || '{}');

    const {
      reservationId,
      name,
      email,
      phone,
      menu,
      room,
      date,
      startTime,
      endTime,
      people,
      amount
    } = data;

    if (!amount || Number(amount) < 100) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '金額が正しくありません' })
      };
    }

    const siteUrl = process.env.SITE_URL || 'http://localhost:8888';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `${menu || '予約'} ${room || ''}`,
              description: `${date || ''} ${startTime || ''}-${endTime || ''} / ${people || 1}名`
            },
            unit_amount: Number(amount)
          },
          quantity: 1
        }
      ],
      metadata: {
        reservationId: reservationId || '',
        name: name || '',
        email: email || '',
        phone: phone || '',
        menu: menu || '',
        room: room || '',
        date: date || '',
        startTime: startTime || '',
        endTime: endTime || '',
        people: String(people || '')
      },
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel.html`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };

  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Stripe Checkout Sessionの作成に失敗しました',
        details: error.message
      })
    };
  }
};
