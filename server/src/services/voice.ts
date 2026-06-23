import { logger } from "../lib/logger";

const HAS_OPENAI = !!process.env.OPENAI_API_KEY;

let _openai: any = null;
async function getOpenAI(): Promise<any> {
  if (!HAS_OPENAI) {
    throw new Error("OPENAI_API_KEY is required for voice services");
  }
  if (!_openai) {
    const OpenAI = (await import("openai")).default;
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ── Speech-to-Text ─────────────────────────────────────────────────────
export async function transcribeAudio(_audioBuffer: Buffer): Promise<string> {
  if (!HAS_OPENAI) {
    logger.warn("STT unavailable: OPENAI_API_KEY not configured");
    return "Voice transcription unavailable. Please set OPENAI_API_KEY.";
  }
  const openai = await getOpenAI();
  const blob = new Blob([new Uint8Array(_audioBuffer)], { type: "audio/webm" });
  const file = new File([blob], "audio.webm", { type: "audio/webm" });

  const transcript = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file,
  });

  return transcript.text;
}

// ── Text-to-Speech ─────────────────────────────────────────────────────
export async function synthesizeSpeech(_text: string): Promise<Buffer> {
  if (!HAS_OPENAI) {
    logger.warn("TTS unavailable: OPENAI_API_KEY not configured");
    // Return a minimal valid MP3 silence frame
    return Buffer.from([]);
  }
  const openai = await getOpenAI();
  const resp = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: _text,
    response_format: "mp3",
  });

  const arrayBuffer = await resp.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
