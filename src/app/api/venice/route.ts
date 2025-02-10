const VENICE_API_KEY = process.env.VENICE_API_KEY;

export async function POST(request: Request) {
  if (!VENICE_API_KEY) {
    return new Response("API key is missing", { status: 400 });
  }

  const res = await request.json();
  const prompt = res.prompt;
  if (!prompt) {
    return new Response("Prompt is missing", { status: 400 });
  }

  try {
    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + VENICE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-r1-671b",
        messages: [{ role: "user", content: prompt }],
      }),
    };

    const fetchResponse = await fetch(
      "https://api.venice.ai/api/v1/chat/completions",
      options,
    );
    const result = await fetchResponse.json();

    const choice = result.choices[0].message.content;
    return Response.json({ response: choice });
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data");
  }
}
