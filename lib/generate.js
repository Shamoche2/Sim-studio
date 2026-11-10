import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.SIM_MODEL || "claude-opus-5-5";

/** Errors whose message is safe and useful to show a teacher. */
export class UserFacingError extends Error {}

export function hasCredentials() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client;
function getClient() {
  client ??= new Anthropic();
  return client;
}

export const GRADES = {
  elementary: "elementary school (ages 6-11): very simple words, big friendly visuals, no formulas",
  middle: "middle school (ages 11-14): plain language, introduce key terms, simple formulas only if essential",
  high: "high school (ages 14-18): correct terminology and standard formulas, quantitative readouts",
  university: "university level: rigorous model, equations shown, precise units",
};

const SYSTEM_PROMPT = `You are an expert educational simulation designer and front-end engineer. A teacher gives you a topic and a grade level; you produce one complete, self-contained HTML document containing an interactive simulation that helps students understand the topic in class.

Output format
- Output ONLY the HTML document: start with <!DOCTYPE html> and end with </html>. No markdown fences, no commentary before or after.

Hard technical constraints (the page runs in a sandboxed iframe with all network access blocked)
- All CSS inline in <style>, all JavaScript inline in <script>. No external scripts, stylesheets, fonts, images, fetch/XHR, or localStorage.
- Draw with <canvas> (scale for devicePixelRatio and resize with the container) or inline SVG.
- Animate with requestAnimationFrame; clamp inputs so nothing produces NaN, Infinity, or runaway loops. No console errors.

What the page should contain
- A clear title and one or two sentences explaining what students are looking at.
- The simulation itself as the visual focus.
- A controls panel: every slider/input has a visible label, current value, and unit. Include Play/Pause and Reset when time evolves.
- Live readouts of the key quantities so students can connect the visual to the numbers.
- A short "Try this" section with 2-3 guided experiments or questions.
- If you simplify the real science, add a one-line note saying what was simplified.

Quality bar
- Scientifically and factually correct: real formulas, realistic default values, correct units.
- Language and complexity matched to the grade level given.
- Readable on a phone (360px wide) and on a classroom projector: large text, high contrast, a clean modern look, keyboard-operable controls.
- Keep the document focused: well under 700 lines.
- If the topic is not naturally a simulation (for example, a historical event or a grammar rule), build the closest useful interactive model: an explorable diagram, timeline, sorter, or step-through visual.`;

function buildMessages({ topic, grade, previousHtml, changeRequest, retryNote }) {
  const level = GRADES[grade] ?? GRADES.high;
  const request = `Topic: ${topic}\nGrade level: ${level}`;
  if (previousHtml && changeRequest) {
    return [
      { role: "user", content: request },
      { role: "assistant", content: previousHtml },
      {
        role: "user",
        content: `The teacher wants this change: ${changeRequest}\n\nReturn the full updated HTML document.${retryNote ?? ""}`,
      },
    ];
  }
  return [{ role: "user", content: request + (retryNote ?? "") }];
}

/** Pull the HTML document out of the model's text, tolerating stray fences. */
export function extractHtml(text) {
  const start = text.search(/<!DOCTYPE html|<html[\s>]/i);
  const end = text.toLowerCase().lastIndexOf("</html>");
  if (start === -1 || end === -1 || end < start) return null;
  return text.slice(start, end + "</html>".length);
}

/**
 * Generate (or revise) a simulation. Streams so long outputs don't time out;
 * onProgress receives the number of characters written so far.
 */
export async function generateSimulation({ topic, grade, previousHtml, changeRequest, onProgress, signal }) {
  let retryNote;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const stream = getClient().beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 64000,
        // If a safety classifier declines, the API re-runs on a suitable fallback model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "medium" },
        system: SYSTEM_PROMPT,
        messages: buildMessages({ topic, grade, previousHtml, changeRequest, retryNote }),
      },
      { signal },
    );

    let chars = 0;
    stream.on("text", (delta) => {
      chars += delta.length;
      onProgress?.(chars);
    });

    let message;
    try {
      message = await stream.finalMessage();
    } catch (err) {
      throw toUserFacing(err);
    }

    if (message.stop_reason === "refusal") {
      throw new UserFacingError(
        "This topic couldn't be turned into a simulation. Try rewording it or choosing a related topic.",
      );
    }

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    const html = extractHtml(text);
    if (html && message.stop_reason !== "max_tokens") {
      return { html, model: message.model, usage: message.usage };
    }
    retryNote = "\n\n(Your previous attempt was incomplete. Keep the document more compact and make sure it ends with </html>.)";
  }
  throw new UserFacingError("The simulation came back incomplete twice. Please try again or simplify the topic.");
}

function toUserFacing(err) {
  if (err instanceof Anthropic.AuthenticationError) {
    return new UserFacingError("The Claude API key is invalid. Check ANTHROPIC_API_KEY in your .env file.");
  }
  if (err instanceof Anthropic.RateLimitError) {
    return new UserFacingError("Too many requests right now. Wait a minute and try again.");
  }
  if (err instanceof Anthropic.APIUserAbortError) {
    return new UserFacingError("Generation was cancelled.");
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return new UserFacingError("Couldn't reach the Claude API. Check your internet connection.");
  }
  if (err instanceof Anthropic.APIError) {
    return new UserFacingError(`The Claude API returned an error (${err.status ?? "unknown"}). Please try again.`);
  }
  return err;
}
