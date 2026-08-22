# Family Health Tracker — Social Ad

## Extended cut (20s) — used for the assembled video

| Time | Visual | VO |
|---|---|---|
| 0:00–0:03 | Logo mark + tagline card | "Heart rate. Sleep. Meds. Labs." |
| 0:03–0:08 | Dashboard screenshot | "Your whole family's health — in one place." |
| 0:08–0:13 | Family comparison + Labs screenshots | "And it never leaves your phone." |
| 0:13–0:17 | Privacy/shield card | "Not to us. Not to anyone." |
| 0:17–0:20 | Logo + "Free on Google Play" card | "Family Health Tracker. Free. Private. Yours." |

Full VO (read time ≈ 18–20s at a relaxed, confident pace):

> "Heart rate. Sleep. Meds. Labs. Your whole family's health — in one place. And it never leaves your phone. Not to us. Not to anyone. Family Health Tracker. Free. Private. Yours."

## Core cut (12–15s) — trim for feed placements where the first 2 seconds matter most

> "Heart rate. Sleep. Meds. Labs. All your family's health — private, on your phone. Family Health Tracker. Free on Google Play."

Cut by dropping the 0:08–0:13 beat above and tightening the close.

## Suno AI prompt (instrumental — no lyrics)

Turn the **Instrumental** toggle on and leave the lyrics box empty, then use this as the style prompt:

> Uplifting corporate-wellness underscore, instrumental only, no vocals. Warm acoustic piano and soft mallet percussion over a gentle pulsing synth bed, with a light string swell entering at the midpoint. Optimistic, clean, modern-tech-meets-caring tone — calm confidence, not hype. Steady 100 BPM, 4/4, major key with a soft major-7th color. Structure: intimate, sparse open (0:00–0:05) → gradual build with added strings and warm bass (0:05–0:13) → a bright, hopeful lift at the reveal (0:13–0:17) → settle to a warm resolved chord with a soft plucked-string tag (0:17–0:20). Nothing percussive harder than a brush or shaker — no aggressive drops, no corporate-cliché "epic" brass. Should feel private, trustworthy, human.

For the 12–15s core cut, ask Suno for the same description capped at 15 seconds, or just use the first 15 seconds of the 20s render — the build/reveal/tag structure trims cleanly at either point.

## Notes

- `marketing/ad-final.mp4` is the assembled rough cut: real app screenshots, the exact script above, correct 20s timing. Two pieces are placeholders, both for the same reason — this sandbox can generate through Higgsfield/Suno but can't download the resulting audio files from their hosting (a network policy block, same one that affects other CDN/blob-storage domains here):
  - **Narration**: a local text-to-speech read, not the polished Evie voice. The real Evie take (the one approved for use) is playable from the chat above — download it there and send the file back in this conversation, and it'll get spliced into the final cut in place of the placeholder.
  - **Music**: a plain synthesized tone bed, not the real Suno track. Generate the real track with the prompt above, then send that file back the same way.
- Once both real audio files are back in this conversation as attachments, re-run the assembly with them substituted for `narration_placeholder.wav` and `music_bed.wav` to produce the final version.
