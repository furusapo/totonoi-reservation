exports.handler = async function(event) {
  try {
    const gasUrl = process.env.RESERVATION_API_URL;

    if (!gasUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          error: 'RESERVATION_API_URL が設定されていません'
        })
      };
    }

    const response = await fetch(gasUrl);
    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: text
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message
      })
    };
  }
};
