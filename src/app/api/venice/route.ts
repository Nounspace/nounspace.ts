import neynar from "@/common/data/api/neynar";

const VENICE_API_KEY = process.env.VENICE_API_KEY;

export async function POST(request: Request) {
  if (!VENICE_API_KEY) {
    return new Response("API key is missing", { status: 400 });
  }

  const res = await request.json();

  const userCast = res.text;
  if (!userCast) {
    return new Response("Text is missing", { status: 400 });
  }

  const userFid = res.fid;
  if (!userFid) {
    return new Response("User fid is missing", { status: 400 });
  }

  const userCasts = await neynar.fetchPopularCastsByUser(userFid);

  const userBio = userCasts.casts?.[0].author.profile.bio.text || "";

  let exampleCastsText = "";
  if (userCasts?.casts?.length) {
    userCasts.casts.forEach((cast: any) => {
      const likesCount = cast.reactions?.likes?.length || 0;
      const recastsCount = cast.reactions?.recasts?.length || 0;
      exampleCastsText += `Text: ${cast.text}\nLikes: ${likesCount}\nRecasts: ${recastsCount}\n\n`;
    });
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
          {
            role: "system",
            content: `You are a social media expert.

              **Task:**
              Your task is to improve the given tweet while preserving its original meaning and intent.
              Only enhance clarity, engagement, and style.
              Respond **only** with the improved tweet text, without any introduction, explanation, or formatting.
              Use the appended example tweets **strictly** as a reference.

              **Guidelines:**
              DO **NOT** add new context, opinions, or unrelated details.
              DO **NOT** include quotes in the response.
              DO **NOT** use hashtags, mentions, or emojis, unless they are part of the original tweet.`,
          },
          {
            role: "assistant",
            content: "\n\nUser example tweets:\n" + exampleCastsText,
          },
          {
            role: "assistant",
            content: "\n\nUser bio:\n" + userBio,
          },
          {
            role: "user",
            content: `\n\This is my tweet to be improved:\n ${userCast}`,
          },
        ],
        venice_parameters: {
          include_venice_system_prompt: false,
        },
      }),
    };

    console.log("options", options.body);

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
