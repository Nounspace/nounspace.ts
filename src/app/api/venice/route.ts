import neynar from "@/common/data/api/neynar";

const DEBUG_PROMPTS = false;
const VENICE_API_KEY = process.env.VENICE_API_KEY;

const VENICE_MODEL = "llama-3.2-3b";
// var VENICE_MODEL = "deepseek-r1-671b";

const MODEL_TEMPERATURE_DETERMINISTIC = 0.2;
const MODEL_TEMPERATURE_CREATIVE = 0.6;
const MODEL_TEMPERATURE_ALUCINATE = 0.9;

const SYSTEM_PROMPT2 = `
You are a social media expert specializing in crafting highly engaging, concise Twitter posts (“banger tweets”). Review the following information:

User Bio (key points about the user's background, voice, or interests):
{USER_BIO}

User's last 5 tweets: {USER_TWEETS}

User Input (either the draft tweet to enhance and/or instructions):
{USER_INPUT}

Using the user's Bio and past tweets to inform style and voice, write a single tweet based on the User Input that:

1. Is at most 280 characters (including spaces).
2. Reflects the user's unique tone or perspective based on their bio.
3. Incorporates key ideas from the User Input.
4. Resonates with a broad audience and is likely to get high engagement (likes, retweets, comments).
5. Ensure the tweet is polished, powerful, and follows best practices for high-engagement tweets. Do not include any hashtags, usernames, or additional commentary—only the final tweet text as your output.

# Guidelines:
DO NOT add new context, opinions, or unrelated details.
DO NOT include quotes in the response.
`;

const SYSTEM_PROMPT = `You are a social media expert.
# Task:
Your task is to generate a new tweet or improve a given tweet preserving its original meaning and intent.
Match the tone and style of the provided <post_examples> to create a consistent brand voice.
Respond only with the improved tweet text, without any introduction, explanation, or formatting.

# Guidelines:
DO NOT add new context, opinions, or unrelated details.
DO NOT include quotes in the response.
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

# TWEET:`;


export async function POST(request: Request) {
  if (!VENICE_API_KEY) {
    return new Response("API key is missing", { status: 400 });
  }

  const res = await request.json();
  const userCast = res.text || "";
  const userFid = res.fid;

  if (!userFid) {
    return new Response("User fid is missing", { status: 400 });
  }

  const userCasts = await neynar.fetchPopularCastsByUser(userFid);
  const userBio = userCasts.casts?.[0].author.profile.bio.text || "";

  let exampleCastsText = userCasts.casts?.length
    ? userCasts.casts.map(cast => `Text: ${cast.text}`).join("\n")
    : "";

  try {
    const PROMPT = userCast.trim().length === 0 ? CREATE_PROMPT : ENHANCE_PROMPT;

    const getOptions = (messages: any) => ({
      method: "POST",
      headers: {
        Authorization: "Bearer " + VENICE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VENICE_MODEL,
        temperature: MODEL_TEMPERATURE_CREATIVE,
        messages,
        venice_parameters: {
          include_venice_system_prompt: false,
        },
      }),
    });

    const messages = [{
      role: "system",
      content: SYSTEM_PROMPT + `
          User bio: ${userBio}
          <post_examples>
            ${exampleCastsText}
          </post_examples>`,
    },
    {
      role: "user",
      content: PROMPT + userCast,
    }];

    const fetchResponse = await fetch(
      "https://api.venice.ai/api/v1/chat/completions",
      getOptions(messages),
    );

    const result = await fetchResponse.json();
    let choice = result.choices[0].message.content;

    // if (VENICE_MODEL === "deepseek-r1-671b")
    choice = choice.replace(/<\/think>.*?<\/think>/gs, '');

    if (DEBUG_PROMPTS) {
      const messages2 = [{
        role: "system",
        content: SYSTEM_PROMPT2
          .replace("{USER_BIO}", userBio)
          .replace("{USER_INPUT}", userCast)
          .replace("{USER_TWEETS}", exampleCastsText),
      },
      {
        role: "user",
        content: PROMPT + userCast,
      }];

      const fetchResponse2 = await fetch(
        "https://api.venice.ai/api/v1/chat/completions",
        getOptions(messages2),
      );

      const result2 = await fetchResponse2.json();
      let choice2 = result2.choices[0].message.content;

      // if (VENICE_MODEL === "deepseek-r1-671b")
      choice2 = choice2.replace(/<\/think>.*?<\/think>/gs, '');

      console.log("\nchoice1: " + choice);
      console.log("\nchoice2: " + choice2);
    }

    return Response.json({ response: choice });

  } catch (error) {
    // console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data: " + error);
  }
}