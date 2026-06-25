exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const phone = event.queryStringParameters && event.queryStringParameters.phone;
  if (!phone) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: 'phone parameter required' })
    };
  }

  const gasUrl = process.env.CUSTOMER_API_URL;
  if (!gasUrl) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: 'CUSTOMER_API_URL not configured' })
    };
  }

  try {
    const url = `${gasUrl}?action=getCustomerByPhone&phone=${encodeURIComponent(phone)}`;
    const res = await fetch(url);
    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
