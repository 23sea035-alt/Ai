// Push-to-talk dictation over expo-speech-recognition (on-device SFSpeechRecognizer / Android
// SpeechRecognizer). Streams interim transcripts via onPartial and reports the final transcript +
// persisted audio clip URI via onFinal. The audio is captured (recordingOptions.persist) so it can
// hang off Message.audioUri while Message.content stays the canonical text.
//
// NOTE: native module — requires a dev/custom build (not Expo Go) to actually run.
import { useCallback, useRef, useState } from 'react';

import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

interface DictationCallbacks {
  onPartial: (transcript: string) => void;
  onFinal: (info: { transcript: string; audioUri?: string }) => void;
}

interface Dictation {
  listening: boolean;
  start: () => Promise<void>;
  stop: () => void;
}

export function useDictation({ onPartial, onFinal }: DictationCallbacks): Dictation {
  const [listening, setListening] = useState(false);
  const transcriptRef = useRef('');
  const audioUriRef = useRef<string | undefined>(undefined);

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript ?? '';
    transcriptRef.current = transcript;
    onPartial(transcript);
  });

  useSpeechRecognitionEvent('audioend', (event) => {
    if (event.uri) audioUriRef.current = event.uri;
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
    onFinal({ transcript: transcriptRef.current, audioUri: audioUriRef.current });
  });

  useSpeechRecognitionEvent('error', () => {
    setListening(false);
  });

  const start = useCallback(async () => {
    const perms = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perms.granted) return;
    transcriptRef.current = '';
    audioUriRef.current = undefined;
    setListening(true);
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
      // false = allow Apple's server-based recognition (better accuracy on long/noisy speech).
      // Set true for strictly on-device (offline + private, slightly lower accuracy).
      requiresOnDeviceRecognition: false,
      recordingOptions: { persist: true }, // emits { uri } on 'audioend' -> Message.audioUri
    });
  }, []);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return { listening, start, stop };
}
