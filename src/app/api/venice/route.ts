import neynar from "@/common/data/api/neynar";

const DEBUG_PROMPTS = false;
const VENICE_API_KEY = process.env.VENICE_API_KEY;
var VENICE_MODEL = "llama-3.2-3b";
// var VENICE_MODEL = "deepseek-r1-671b";

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

Ensure the tweet is polished, powerful, and follows best practices for high-engagement tweets. Do not include any hashtags, usernames, or additional commentary—only the final tweet text as your output.
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
    if (userCast.trim().length === 0) {
      PROMPT = CREATE_PROMPT;
    }

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + VENICE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VENICE_MODEL,
        temperature: 0.6,     // close to 0.00 is more deterministic, close to 1.00 is more creative
        messages: [
          {
            role: "system",

            content: SYSTEM_PROMPT2
              .replace("{USER_BIO}", userBio)
              .replace("{USER_INPUT}", userCast)
              .replace("{USER_TWEETS}", exampleCastsText),

            //             content: SYSTEM_PROMPT + `
            // User bio: ${userBio}
            // <post_examples>
            //     ${exampleCastsText}
            // </post_examples>`,                   // system prompt
          },
          //           {
          //             role: "assistant",      // assistant prompt
          //             content: `
          // User bio: ${userBio}
          // <post_examples>
          // ${exampleCastsText}
          // </post_examples>`,
          //           },
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


    //
    // debug
    // ---
    //
    if (DEBUG_PROMPTS) {

      const options2 = {
        method: "POST",
        headers: {
          Authorization: "Bearer " + VENICE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: VENICE_MODEL,
          temperature: 0.6,     // close to 0.00 is more deterministic, close to 1.00 is more creative
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT + `
User bio: ${userBio}
<post_examples>
    ${exampleCastsText}
</post_examples>`,                   // system prompt
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

      const fetchResponse2 = await fetch(
        "https://api.venice.ai/api/v1/chat/completions",
        options2,
      );
      const result2 = await fetchResponse2.json();
      var choice = result2.choices[0].message.content;
      if ("deepseek-r1-671b" == VENICE_MODEL)
        choice = choice.replace(/<think>[\s\S]*?<\/think>\s*\n*/g, '');
      console.warn("\nchoice2: " + choice);

      //
      // debug
      // ---
      //
    }


    // console.dir("options", options.body);

    const fetchResponse = await fetch(
      "https://api.venice.ai/api/v1/chat/completions",
      options,
    );

    const result = await fetchResponse.json();
    var choice = result.choices[0].message.content;

    if ("deepseek-r1-671b" == VENICE_MODEL)
      choice = choice.replace(/<think>[\s\S]*?<\/think>\s*\n*/g, '');

    if(DEBUG_PROMPTS)
      console.log("\nchoice1: " + choice);

    return Response.json({ response: choice });
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data");
  }
}
