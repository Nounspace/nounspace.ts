import neynar from "@/common/data/api/neynar";

const VENICE_API_KEY = process.env.VENICE_API_KEY;

const SYSTEM_PROMPT = `You are a social media expert.
# Task:
Your task is to generate a new tweet or improve a given tweet preserving its original meaning and intent.
Consider <post_examples> for voice tone.
Respond only with the improved tweet text, without any introduction, explanation, or formatting.

# Guidelines:
DO NOT add new context, opinions, or unrelated details.
DO NOT include quotes in the response.
Use the <post_examples> tweets strictly as a reference for voice tone.
`;

const ENHANCE_PROMPT = `
# Task: Enhance this tweet for maximum engagement:
# INSTRUCTIONS:
- Make it concise and attention-grabbing.
- Include a call-to-action.
- Ensure it resonates with <post_examples> keeping it authentic.
- Avoid clickbait—focus on delivering value or sparking conversation.
- DO NOT use hashtags, mentions, or emojis, unless they are part of the original tweet.

# TWEET:`;

const CREATE_PROMPT = `Create a new creative and engaging tweet.
# Guidelines:
DO NOT add new context, opinions, or unrelated details.
DO NOT include quotes in the response.
Use the <post_examples> tweets strictly as a reference for voice tone.
`;


export async function POST(request: Request) {
  if (!VENICE_API_KEY) {
    return new Response("API key is missing", { status: 400 });
  }

  const res = await request.json();

  const userCast = res.text;
  if (!userCast) {
    // return new Response("Text is missing", { status: 400 });
    // if no input, create a new cast from thin air
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
      // exampleCastsText += `Text: ${cast.text}\nLikes: ${likesCount}\nRecasts: ${recastsCount}\n\n`;
      exampleCastsText += `Text: ${cast.text}`;
    });
  }

  try {
    let PROMPT = ENHANCE_PROMPT;
    if(userCast.trim().length === 0) {
      PROMPT = CREATE_PROMPT;
    }

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + VENICE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.2-3b",
        // model: "deepseek-r1-671b",
        temperature: 0.6,     // close to 0.00 is more deterministic, close to 1.00 is more creative
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT, // system prompt
          },
          {
            role: "assistant",      // assistant prompt
            content: `
User bio: ${userBio}
<post_examples>
${exampleCastsText}
</post_examples>`,
          },
          {
            role: "user",
            content: PROMPT + userCast, // user prompt
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
