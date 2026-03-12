export async function onRequestPost(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  try {
    const request = context.request;
    const env = context.env;

    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const source = String(body.source || "alinaflux_popup").trim();
    const toolCode = String(body.tool_code || "").trim();
    const toolName = String(body.tool_name || "").trim();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: "Email is required." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid email address." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = env.MAILERLITE_API_KEY;
    const groupId = env.MAILERLITE_GROUP_ID;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing MailerLite API key." }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!groupId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing MailerLite group ID." }),
        { status: 500, headers: corsHeaders }
      );
    }

    const payload = {
      email,
      groups: [groupId],
      fields: {
        source,
        tool_code: toolCode,
        tool_name: toolName
      }
    };

    const mlResponse = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const responseText = await mlResponse.text();

    if (!mlResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "MailerLite request failed.",
          details: responseText
        }),
        { status: mlResponse.status, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscriber saved successfully."
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server error.",
        details: error.message || "Unknown error"
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
