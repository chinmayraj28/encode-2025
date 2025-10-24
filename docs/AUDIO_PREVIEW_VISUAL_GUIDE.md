# 🎨 Audio Preview: Visual Guide

## What Buyers See

When viewing an audio asset, buyers will see:

```
┌─────────────────────────────────────────────────────────┐
│                    Asset Preview 🎵                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                        🎵                                │
│                                                          │
│    ┌──────────────────────────────────────────────┐    │
│    │  ⚠️ Preview Audio (Watermarked)               │    │
│    │  First 30 seconds only                        │    │
│    │  Beep watermarks every 5s • Mono quality      │    │
│    │  ✅ Purchase to get full, clean,              │    │
│    │     high-quality version                      │    │
│    └──────────────────────────────────────────────┘    │
│                                                          │
│    ┌──────────────────────────────────────────────┐    │
│    │  ▶️  ━━━━━━━━━━━━○───────────  0:15 / 0:30    │    │
│    │  🔊 ━━━━━━━━○──────                           │    │
│    └──────────────────────────────────────────────┘    │
│                    Audio Player                         │
│                                                          │
│    [🔗 Open Preview in IPFS]                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## What Buyers Hear

Timeline of a 30-second audio preview:

```
Time:  0s    3s    8s   13s   18s   23s   28s   30s
       │     │     │     │     │     │     │     │
Audio: ──────█─────█─────█─────█─────█─────█─────│
       Intro BEEP  BEEP  BEEP  BEEP  BEEP  BEEP  END
       
Legend:
──── = Original audio playing
█    = Beep watermark (800 Hz, 0.15s)
│    = End of preview
```

### What They Experience:

**0-3 seconds**: Clean intro
- Hear the beginning of the track
- No interruptions yet
- Get a feel for the style

**3 seconds**: First BEEP 🔔
- Short 800 Hz tone
- 0.15 seconds duration
- Clear indication it's a preview

**3-8 seconds**: Audio continues
- 5 seconds of clean audio
- Enough to evaluate quality
- Building interest

**8 seconds**: Second BEEP 🔔
- Reminder it's a preview
- Cannot be removed easily
- Makes commercial use impossible

**Pattern repeats** every 5 seconds...

**30 seconds**: Preview ENDS ✋
- Missing the rest of the track
- Left wanting more
- Clear need to purchase for full version

---

## Full Version (After Purchase)

What buyers get after purchasing:

```
┌─────────────────────────────────────────────────────────┐
│               ✅ You Own This Asset                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│    🔑 Access Granted!                                    │
│                                                          │
│    You have purchased this asset and can now            │
│    download the full, unencrypted version.              │
│                                                          │
│    [🔓 Download Full File]                              │
│                                                          │
│    Your Decryption Key:                                 │
│    a8f3e2b9c4d1f6e5a2c8b7d3e9f1a4b6...                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### What They Get:

```
Time:  0s ───────────────────────────────────────── 3:45
       │                                             │
Audio: ─────────────────────────────────────────────│
       Full track, no beeps, stereo, high quality
```

**Full Duration**: Complete 3:45 song (not just 30s)  
**No Beeps**: Clean audio throughout  
**High Quality**: Original 320kbps, stereo  
**Complete**: Intro, verse, chorus, bridge, outro - everything!

---

## Side-by-Side Comparison

### Preview vs. Full Version

| Feature | Preview (Free) | Full Version (Paid) |
|---------|---------------|---------------------|
| Duration | 0:30 | 3:45 (full length) |
| Watermarks | ✅ Beeps every 5s | ❌ None |
| Quality | Mono WAV | Stereo 320kbps |
| Can Use Commercially | ❌ No | ✅ Yes |
| File Size | ~2.6 MB | ~7.2 MB |
| Missing Content | Chorus, bridge, outro | Nothing |

---

## Audio Waveform Visualization

### Preview Waveform (with beeps):

```
Amplitude
    ↑
1.0 │     ▁▂▃▄▅█ BEEP           ▁▂▃▄▅█ BEEP
    │   ▁▂▃▄▅▆▇████▇▆▅▄▃▂▁    ▁▂▃▄▅▆▇████▇▆▅▄▃▂▁
0.5 │ ▁▂▃▄▅▆▇█████████████▇▆▅▄▃▂▁▂▃▄▅▆▇█████████████▇▆▅▄▃▂▁
    │▁▂▃▄▅▆▇█████████████████████▄▅▆▇█████████████████████
0.0 │───────────────────────────────────────────────────────→
    0s    3s    8s   13s   18s   23s   28s   30s
         ↑ Beep ↑ Beep ↑ Beep ↑ Beep ↑ Beep ↑ End
```

### Full Version Waveform (clean):

```
Amplitude
    ↑
1.0 │       ▁▂▃▄▅▆▇█        ▁▂▃▄▅▆▇█           ▁▂▃▄▅▆▇█
    │     ▁▂▃▄▅▆▇████▇▆▅▄▃▂▁▃▄▅▆▇████▇▆▅▄▃▂▁▂▃▄▅▆▇████▇▆▅▄
0.5 │   ▁▂▃▄▅▆▇█████████▇▆▅▄▃▂▁▂▃▄▅▆▇█████████▇▆▅▄▃▂▁▂▃▄▅▆▇█
    │ ▁▂▃▄▅▆▇████████████▇▆▅▄▃▂▁▂▃▄▅▆▇████████████▇▆▅▄▃▂▁▂▃▄
0.0 │───────────────────────────────────────────────────────→
    0s    30s   1:00  1:30  2:00  2:30  3:00  3:30  3:45
         Intro   Verse  Chorus Bridge  Verse  Chorus  Outro
```

---

## User Flow Diagram

```
                    User Visits Asset Page
                            │
                            ├─────────────────────┐
                            ↓                     ↓
                    Preview Available       No Preview
                            │                     │
                            ↓                     ↓
                    Plays Audio Player    Shows "No Preview"
                            │
                            ↓
              ┌─────────────┴─────────────┐
              ↓                           ↓
        Hears Beeps                 Only 30 seconds
        Every 5s                    (incomplete)
              │                           │
              └─────────────┬─────────────┘
                            ↓
                  "I need the full version"
                            │
                            ↓
                 Clicks "Purchase Asset"
                            │
                            ↓
                    MetaMask Payment
                            │
                            ↓
              Smart Contract Releases Key
                            │
                            ↓
            Event: DecryptionKeyReleased
                            │
                            ↓
              Frontend Receives Key
                            │
                            ↓
           "Download Full File" Button Appears
                            │
                            ↓
                  User Clicks Download
                            │
                            ↓
         Download Encrypted File from IPFS
                            │
                            ↓
              Decrypt with Key (AES-256)
                            │
                            ↓
          Download Clean, Full Audio File
                            │
                            ↓
                  ✅ Full Version Saved!
                  (No beeps, complete, high quality)
```

---

## Protection Effectiveness

### Why Buyers Can't Misuse Preview:

1. **30-Second Limit** ⛔
   - Missing 3:15 of content
   - Can't use incomplete audio professionally
   - Left wanting the full version

2. **Beep Watermarks** 🔔
   - 6 beeps throughout preview
   - Cannot be removed without degrading quality
   - Makes it obvious it's a preview
   - Unusable in any production

3. **Mono Quality** 🎧
   - Lost stereo imaging
   - Lower perceived quality
   - Professional work requires stereo

4. **Blockchain Proof** ⛓️
   - Creator ownership on-chain
   - Legal recourse if needed
   - DMCA protection

---

## Real Example

### Scenario: Music Producer Uploads Beat

**Original File:**
- Format: MP3
- Quality: 320 kbps
- Channels: Stereo
- Duration: 3:45
- Size: 7.2 MB
- Content: Intro → Verse → Chorus → Bridge → Verse → Chorus → Outro

**Generated Preview:**
- Format: WAV
- Quality: 16-bit PCM
- Channels: Mono
- Duration: 0:30 (first 30 seconds only)
- Size: 2.6 MB (64% smaller)
- Content: Intro → Verse (incomplete)
- Watermarks: 6 beeps at 3s, 8s, 13s, 18s, 23s, 28s

**What Buyer Hears:**
```
0:00 - Clean intro starts
0:03 - BEEP (first watermark)
0:04 - Back to music
0:08 - BEEP (reminder it's a preview)
0:09 - Verse continues
0:13 - BEEP
...continues...
0:30 - ENDS (before chorus!)
```

**Buyer Reaction:**
"The beat sounds great, but I need the full version without beeps to use in my project. Let me buy it!"

**After Purchase:**
- Gets full 3:45 track
- No beeps
- Stereo quality
- Complete with chorus, bridge, outro
- Can use commercially

---

## Summary

### 🎵 Audio Preview Strategy:

✅ **Strong Protection**: Truncation + beeps + mono  
✅ **Good UX**: Enough to evaluate quality  
✅ **Automatic**: No manual work  
✅ **Industry Standard**: Similar to Spotify, Apple Music  
✅ **Legal Safety**: Clear watermarks  
✅ **Revenue Protection**: Forces purchase for full version  

The beeps are **intentional** and **necessary** to protect creators while still allowing legitimate preview! 🎵🔒
