# Private configuration and publication

- API keys stay on the Python server. Configure them with the host-only Settings form or the hosting provider secret environment variables. Never paste a real key into source, a README, browser JavaScript, an issue or a chat.
- `.local/api-config.json` stores local settings with owner-only file permissions. It is outside the static web directory and excluded by both Git and Docker build context rules. The API returns only connection metadata, never the key.
- `.env` files, common private-key files, logs and local virtual environments are excluded. `.env.example` contains blank placeholders only and is not loaded automatically.
- Camera input is local preview only, with no upload or image analysis. Goals, profile, conversation and session history live in browser local storage. User messages and study goals are sent to the selected model when AI replies or task plans are requested.
- A pattern scan is not proof that every possible secret is absent. Review staged files before publishing; if a key is exposed, revoke or rotate it at the provider. Deleting text from the latest commit does not remove earlier copies.
- This development server is for trusted local-network use. A hidden key does not stop public visitors from spending shared API quota. Before internet deployment, add authenticated access and request limits, adapt HTTPS origin checks, and use production hosting.
- For a future GitHub publication, use a new source snapshot and a GitHub no-reply identity if the GitLab author/computer metadata should remain private. Keep the original GitLab history unchanged.
