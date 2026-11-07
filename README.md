# Nudge

A pixel-art study stream simulator with fictional viewers, editable small tasks, a focus timer and virtual stars (also called coins). There is no real broadcast, human audience or real payment.

## Run

Python 3.9+; no third-party dependencies.

```sh
python3 app.py
```

Open http://127.0.0.1:8000. For a trusted local network:

```sh
HOST=0.0.0.0 PORT=8765 python3 app.py
```

Friends open `http://<host-local-IP>:8765`. All visitors to that server share its saved model configuration. Profiles, goals, backgrounds, chat and rewards remain independent browser-local data. This is not multiplayer. Another cloned server requires its own configuration. The development server has no authentication or HTTPS; do not expose it publicly.

## Shared AI configuration

On the host computer, open localhost → Settings → **Connect OpenAI**. Enter a new key in the masked field and click **Connect for everyone**. There is no model-selection page. The server fetches the accessible models and tries a small compatibility list in order: `gpt-4.1-mini`, `gpt-4o-mini`, `gpt-4.1`, `gpt-4o`. It tests text chat using a short text request before saving; unavailable or incompatible models are skipped. Authentication, billing and quota errors stop the operation and preserve the previous configuration. Testing and subsequent model requests can incur charges. LAN visitors cannot change the connection. Existing saved DeepSeek text connections remain usable until replaced with OpenAI.

Save persists the key and model in `.local/api-config.json` on the server, with owner-only file permissions. `.local/` is ignored by Git and is outside the served static directory. The key is never returned to visitors or stored in browser local storage. All visitors' model requests use the host's shared quota. Save survives reloads and server restarts. Disconnect shared AI disables the model for everyone. Do not copy the private configuration file when distributing the project. `OPENAI_API_KEY` and `OPENAI_MODEL` may supply initial configuration when no saved file exists.

Official endpoints are `https://api.openai.com/v1` and `https://api.deepseek.com`. Custom school proxies are not supported. Automatic connection verifies text chat at setup time; later quota or permission changes can still cause errors. Model errors are shown without stopping the timer, sound or simulated activity. Without a key, chat and task planning use clearly marked demo responses. Chat messages distinguish MODEL, DEMO and SIM events.

## Study flow

1. Enter a stream title and study goal. **Break into small steps** creates a suggested plan (a generic starter in demo mode). Edit one task per line. In the live room, tick off the checklist; the current unfinished task is included in model context.
2. Choose duration and sound, then start. Sound never autoplays; play/pause and volume controls are in the room. Included white noise, lo-fi, birds, stream and wind are CC0. See [audio credits](AUDIO_CREDITS.md). Ogg playback requires a compatible browser.
3. Checking off a task requests a short model reaction using the goal, completed task and recent conversation. Without a key, or if the request fails, the fallback is labeled DEMO; failed requests also show a system notice. Viewer replies appear after a variable delay and are prompted to be brief, casual English. Saying “I'm stuck” brings encouragement only. Explicitly asking for help or a hint permits one guiding question or hint, never assignment answers. Camera content is not included in text chat.
4. Every 10% of active study time, a simulated check-in offers a 30-second window. Reply while your selected state is Studying and with a positive progress message to receive 10 stars. This simple keyword rule is imperfect; no response is never treated as failure or distraction.
5. Set your state yourself. **On a break** pauses study time and clears the current check-in. Choose Studying to resume. Camera footage and lack of replies never determine state. End manually or let the countdown expire to see Stream Summary: actual timer study time, earned stars including quest rewards, and peak simulated audience. Paused time is excluded. Reload restores saved time without counting time while the page was closed.
6. Dashboard quests track three finished countdowns per local calendar day (+30 stars) and 200 recorded study minutes overall (+100 stars). Rewards are automatically credited to the coin balance after settlement; quest cards show progress, completion and credited status. Rewards are persistent and each is granted once per applicable scope. Dashboard reconciliation also credits any eligible previously settled records that have no reward ledger entry. Manual early endings add minutes but do not count as finished countdowns. Quests use session records created by this version; older chart totals are preserved but not converted into quest evidence. Records are local browser data, not verified attention measurements. Use one active tab per browser; cross-tab concurrency is not supported.

## Optional camera

Enable camera after starting a stream. Preview appears in the upper-right of the room background; it is local by default, with no audio, recording or ongoing upload. Disable it anytime. Leaving the room, hiding/leaving the page or ending the stream stops tracks . Permission denial and missing devices leave text chat usable. Browsers usually require localhost or HTTPS for camera access; plain HTTP LAN pages can still use text features.

The camera has only on/off controls. No snapshots, image upload, visual analysis or image API route are provided. AI chat receives text only.

## Atmosphere and accessibility

Joining/leaving changes the simulated audience count; likes, follows and gifts are local program events, never model calls. Decorative gifts do not add spendable stars. Choose Quiet, Normal, Lively or Paused activity. Breaks reduce activity and floating reactions. Reduce motion and the system reduced-motion preference suppress floating animation. Reactions cannot intercept chat clicks. Stream chat scrolls independently and preserves position when reading older messages. Conversation messages retain avatars and bubbles; joins, departures, likes, follows and gifts use compact icon-and-time event rows. Identical adjacent events within 30 seconds merge into a count without crossing a conversation. Pending check-ins no longer add filler at every milestone.

The Task panel has a draggable divider on desktop. Arrow keys adjust by 10 pixels, Shift by 50, Home/End select bounds and Enter resets. Width preferences persist in this browser; at 1100 pixels and below the divider hides and the responsive layout takes over.

Dashboard history shows saved session dates, goals, actual timer study time, stars and explicitly simulated peak audience. The latest session's unfinished checklist can be copied into a new stream plan. Legacy records without these details are marked unrecorded. Distinct generated pixel avatars map consistently to English viewer names. Ordinary student messages trigger 3–4 simulated reactions, task completion triggers 8–10, and stream settlement triggers a single confetti-and-emoji celebration. Live reactions are capped at 16 concurrent elements and settlement at 34. These effects never call the model, cannot intercept controls, and respect reduced-motion settings.

## Validation

```sh
PYTHONPATH=. PYTHONDONTWRITEBYTECODE=1 python3 tests/test_server.py
```

Optional JavaScript checks (Node.js required):

```sh
node --require ./static/session.js tests/session.test.js
node tests/ui.test.mjs
```

Server integration tests use fake providers and keys. They cover shared configuration, private persistence, LAN restrictions, task planning and provider errors. `tests/session.test.js` validates timer accounting and one-time rewards in a JavaScript runtime. Camera lifecycle tests use simulated media tracks. Browser checks verified editable tasks, delayed demo replies, break/resume, automatic summary and Dashboard progress, including a desktop layout without page overflow. Text-model auto-selection, error preservation and removal of the image API route are tested with fake keys and mocked providers. Real provider availability, camera hardware and browser permission prompts need manual verification. Do not commit credentials. Remove the development settings UI and add deployment authentication before a public release.
