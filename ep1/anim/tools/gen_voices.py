"""Generate the 9 placeholder voice lines with Gemini TTS.  Run:  python3 tools/gen_voices.py [v03 v07 ...]

Facts found by testing (Nov 2026; ai.google.dev is not reachable from the cloud session):
  * model gemini-3.8-flash-tts reads the text WORD FOR WORD: an English preamble
    ("Say calmly: ...") is spoken aloud.
  * it rejects systemInstruction ("Developer instruction is not enabled") and has no
    style field in speechConfig.
  * a leading [bracket tag] is NOT spoken: it steers the delivery. So the acting
    direction goes in one bracket tag, and the spoken words are exactly the script.
Every result is transcribed by gemini-3.5-transcribe; if any English (= the tag) is
heard, or Bangla words are missing, the line is regenerated (max 2 retries).
The API key is added by the network proxy (header x-goog-api-key), never stored here.
"""
import base64, json, os, re, subprocess, sys, time, urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
VOICES = os.path.abspath(os.path.join(HERE, '..', '..', 'voices'))
TMP = os.path.join(VOICES, '_tmp')
API = 'https://generativelanguage.googleapis.com/v1beta/models/'
TTS_MODEL = 'gemini-3.8-flash-tts'
STT_MODELS = ['gemini-3.5-transcribe', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest']

BASE = 'colloquial Dhaka street Bangla, not formal, 13-year-old boy, young light fast voice'
CAST = {
    'A': ('Puck', 'cocky, fast, teasing, loud'),
    'B': ('Fenrir', 'over-dramatic, whiny, comic'),
    'C': ('Charon', 'deadpan, flat, sarcastic'),
}
LINES = [
    ('v01_B', 'B', 'মাম্মা, এইডা কিডা!', 'stunned and dreamy, gasp first'),
    ('v02_C', 'C', 'ধুর হালা, ওইটা রাহুলের গার্লফ্রেন্ড।', "bored, can't be bothered"),
    ('v03_B', 'B', 'ধুর, এসব তো ঠিক না। এইসব বয়সে এইসব লুচ্চামি করে বেড়াইতেছে এরা। পাক্কা জাহান্নামী হালারা।', 'fake preachy like an old uncle giving a sermon, slower'),
    ('v04_C', 'C', 'তুই যে কত বড় লুচ্চা আমি ওইটা জানি।', 'slow, knowing, smug'),
    ('v05_A', 'A', 'বলদরা, পড়াশোনা করছস কিছু? আজকে সৌমিক স্যার কিন্তু ফাটাইব পড়া না পারলে।', 'shouting from a distance then urgent, stress ফাটাইব'),
    ('v06_C', 'C', 'আমি তো কিছুই পড়ি নাই।', 'totally calm, innocent lie'),
    ('v07_B', 'B', 'পড়াশোনা তো একটা দুর্লভ বিষয়, এটা তো আমি আর করি না, আমি তো সস্তা জিনিস করি।', 'proud and philosophical, slow, cheeky ending'),
    ('v08_A', 'A', 'যে একখান ছোট্ট ক্লাস পাইছি, এইটা দেখ, এইটা দেখলে বাঁচে যাইব।', 'confident whisper, sharing a secret, clear words: যে একখান ছোট্ট ক্লাস'),
    ('v09_BC', 'BC', 'শুরু কর বেটা, তাড়াতাড়ি কর।', 'desperate, rushed, loud'),
]


def post(model, body, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(API + model + ':generateContent', data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
            return json.load(urllib.request.urlopen(req, timeout=180))
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:200]
            if e.code in (401, 403):
                sys.exit(f'Gemini refused the key (HTTP {e.code}): {msg}')
            if e.code in (429, 500, 503) and i < tries - 1:
                time.sleep(4 * (i + 1)); continue
            raise RuntimeError(f'{model}: HTTP {e.code} {msg}')


def tts(voice, tag, text, out_wav):
    body = {'contents': [{'role': 'user', 'parts': [{'text': f'[{tag}] {text}'}]}],
            'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}}}}
    part = post(TTS_MODEL, body)['candidates'][0]['content']['parts'][0]['inlineData']
    raw = base64.b64decode(part['data'])
    src = out_wav + '.src'
    open(src, 'wb').write(raw)
    if 'wav' not in part['mimeType']:  # raw PCM: rate is in the mime type
        rate = re.search(r'rate=(\d+)', part['mimeType']).group(1)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', rate, '-ac', '1', '-i', src, '-ar', '44100', '-ac', '1', out_wav], check=True)
    else:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ar', '44100', '-ac', '1', out_wav], check=True)
    os.remove(src)


def transcribe(wav):
    data = base64.b64encode(open(wav, 'rb').read()).decode()
    body = {'contents': [{'parts': [{'inlineData': {'mimeType': 'audio/wav', 'data': data}},
                                    {'text': 'Transcribe exactly every word spoken in this audio, in the original script (Bangla or English). Output only the transcription.'}]}]}
    for m in STT_MODELS:
        try:
            return post(m, body)['candidates'][0]['content']['parts'][0]['text'].strip()
        except RuntimeError:
            continue
    return '?'


def norm(s):
    return re.sub(r'[\s,।?!.\'"“”‘’\-]', '', s)


def ok(transcript, text):
    if re.search(r'[A-Za-z]{3,}', transcript):  # English heard -> the tag was spoken
        return False
    a, b = norm(transcript), norm(text)
    return abs(len(a) - len(b)) <= max(4, len(b) * 0.25)  # allow spelling variants of dialect words


def trim(wav, out):
    """Trim leading/trailing silence, then leave exactly 0.1 s on each side."""
    f = ('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,'
         'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,'
         'adelay=100,apad=pad_dur=0.1')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', f, '-ar', '44100', '-ac', '1', out], check=True)


def to_mp3(wav, mp3):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ar', '44100', '-ac', '1', '-b:a', '192k', mp3], check=True)


def make(who, text, extra, out_wav):
    voice, base = CAST[who]
    tag = f'{BASE}, {base}, {extra}'
    last = None
    for attempt in range(1, 4):  # first try + max 2 regenerations
        raw = out_wav + '.raw.wav'
        tts(voice, tag, text, raw)
        tr = transcribe(raw)
        last = (attempt, tr)
        if ok(tr, text):
            trim(raw, out_wav); os.remove(raw)
            return voice, tag, attempt, tr
        print(f'    attempt {attempt} rejected, heard: {tr}')
        tag = f'{BASE}, {base}, {extra}, clear natural Dhaka pronunciation'
        os.remove(raw)
    # keep the last attempt anyway, but flag it
    tts(voice, tag, text, out_wav + '.raw.wav'); trim(out_wav + '.raw.wav', out_wav); os.remove(out_wav + '.raw.wav')
    return voice, tag, f'{last[0]} (FLAGGED)', last[1]


def dur(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)


def main():
    os.makedirs(TMP, exist_ok=True)
    only = set(sys.argv[1:])
    rep_path = os.path.join(VOICES, '_tts_report.json')
    report = {r['file']: r for r in json.load(open(rep_path))} if os.path.exists(rep_path) else {}
    for name, who, text, extra in LINES:
        if only and name.split('_')[0] not in only:
            continue
        print(f'{name} ...', flush=True)
        mp3 = os.path.join(VOICES, name + '.mp3')
        if who == 'BC':  # both shout together: B + C offset by 0.05 s
            vb, tagb, ab, trb = make('B', text, extra, os.path.join(TMP, 'v09_B.wav'))
            vc, tagc, ac, trc = make('C', text, extra, os.path.join(TMP, 'v09_C.wav'))
            mix = os.path.join(TMP, 'v09_BC.wav')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(TMP, 'v09_B.wav'), '-i', os.path.join(TMP, 'v09_C.wav'),
                            '-filter_complex', '[1]adelay=50[c];[0][c]amix=inputs=2:duration=longest:normalize=0,volume=0.8', '-ar', '44100', '-ac', '1', mix], check=True)
            to_mp3(mix, mp3)
            info = {'voice': f'{vb}+{vc}', 'tag': tagb, 'attempts': f'B:{ab} C:{ac}', 'transcript': f'B: {trb} | C: {trc}'}
        else:
            wav = os.path.join(TMP, name + '.wav')
            v, tag, a, tr = make(who, text, extra, wav)
            to_mp3(wav, mp3)
            info = {'voice': v, 'tag': tag, 'attempts': a, 'transcript': tr}
        report[name + '.mp3'] = {'file': name + '.mp3', **info, 'duration_s': round(dur(mp3), 2)}
        json.dump(list(report.values()), open(rep_path, 'w'), ensure_ascii=False, indent=1)
    print('\nFile            Voice          Dur(s)  Tries  Heard')
    for r in sorted(report.values(), key=lambda r: r['file']):
        print(f"{r['file']:<15} {r['voice']:<14} {r['duration_s']:>6}  {str(r['attempts']):<6} {r['transcript']}")


if __name__ == '__main__':
    main()
