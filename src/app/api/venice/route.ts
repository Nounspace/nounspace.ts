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
        model: "llama-3.2-3b",
        messages: [
          { role: "user", content: prompt },
          {
            role: "system",
            content: `You are a social media expert.
               Your task is to improve the given tweet while preserving its original meaning and intent.
               Do not add new context, opinions, or unrelated details.
               Only enhance clarity, engagement, and style.
              Respond ** only ** with the improved tweet text, without any introduction, explanation, or formatting.
               Do not include quotes on the response.`
          },
        ],
        venice_parameters: {
          include_venice_system_prompt: false
        },
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
