import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { transcribeAudio, synthesizeSpeech } from "../services/voice.js";

const router = Router();

// POST /api/voice/stt — Speech-to-Text
router.post("/voice/stt", requireAuth, async (req: AuthRequest, res) => {
  try {
    const audioData = req.body?.audio;
    if (!audioData) { res.status(400).json({ error: "Audio data is required" }); return; }

    const buffer = Buffer.from(audioData, "base64");
    const text = await transcribeAudio(buffer);
    res.json({ text });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message ?? "STT failed" });
  }
});

// POST /api/voice/tts — Text-to-Speech (returns MP3 audio)
router.post("/voice/tts", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { text } = req.body as { text: string };
    if (!text?.trim()) { res.status(400).json({ error: "Text is required" }); return; }

    const audio = await synthesizeSpeech(text);
    res.set("Content-Type", "audio/mpeg");
    res.set("Content-Length", String(audio.length));
    res.send(audio);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message ?? "TTS failed" });
  }
});

export default router;
