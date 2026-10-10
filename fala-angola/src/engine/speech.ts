// Voice. Teacher recordings come first: drop an MP3 into public/audio/ named
// after the phrase (see slug below) and the app plays it. Until a recording
// exists, the browser's Portuguese voice reads the text as a stand-in.

export const slug = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find((v) => v.lang === "pt-AO") ??
    voices.find((v) => v.lang === "pt-PT") ??
    voices.find((v) => v.lang.startsWith("pt"))
  );
}

function tts(text: string, rate: number) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-PT";
  u.rate = rate;
  const v = pickVoice();
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

export function speak(text: string, slow = false) {
  const audio = new Audio(`./audio/${slug(text)}.mp3`);
  audio.playbackRate = slow ? 0.75 : 1;
  audio.play().catch(() => tts(text, slow ? 0.65 : 0.9));
}

// Shadowing: record the learner, then play it back next to the model.
export async function record(ms = 4000): Promise<string | null> {
  if (!navigator.mediaDevices?.getUserMedia) return null;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    const done = new Promise<string>((resolve) => {
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        resolve(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType })));
      };
    });
    rec.start();
    setTimeout(() => rec.state !== "inactive" && rec.stop(), ms);
    return await done;
  } catch {
    return null;
  }
}
