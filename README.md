# Nudge

Nudge is a pixel-art study companion that turns a focus session into a cozy simulated stream. Its audience, gifts and stars are virtual; there is no real broadcast or payment.

- Break a study goal into editable small tasks and check them off during a timed session.
- Chat with simulated viewers and receive brief model-generated replies when AI is connected; demo replies are clearly labeled.
- Track study time, virtual earnings, quests and past sessions on the dashboard. Session data stays in the browser.
- Customize the room with a background image, optional ambient audio and a local-only camera preview.
- Enjoy simulated audience activity and celebrations, with controls for activity frequency and reduced motion.

Audio sources and licenses are listed in [AUDIO_CREDITS.md](AUDIO_CREDITS.md).


Nudge — Turn Focus into a Show.
Inspiration
We've all experienced the struggle of staying focused. Whether it's studying for an exam, working on a project, or simply trying to get things done, motivation often fades, distractions take over, and studying alone can feel isolating.

We wondered: What if studying felt less like sitting alone at a desk and more like hosting your own livestream?

Inspired by livestream culture, virtual communities, and gamified simulation games, we created Nudge — an AI-powered virtual livestream experience that turns everyday study sessions into interactive experiences.

Instead of simply tracking how long you study, Nudge makes you the streamer, surrounded by a virtual audience that cheers you on, celebrates your milestones, and gently nudges you when you lose momentum.

What It Does
Nudge transforms studying into a virtual livestream where users can:

Create Their Own Stream: Set study goals and break them down into manageable tasks.
Build a Virtual World: Study as a customizable avatar in a cozy, game-inspired virtual room — no camera required.
Interact with AI Audiences: Receive contextual chat messages, encouragement, and virtual gifts from simulated viewers.
Get Intelligent Nudges: Receive timely, personalized support based on multiple behavioural signals, including page activity, task progress, and self-reported feedback.
Review Their Performance: Explore engagement insights, completed milestones, and personalized suggestions in an end-of-session report.
How We Built It
We approached Nudge as more than a productivity tracker. Our goal was to create an experience that combines gamification, social presence, and AI-driven behavioural support.

The application consists of several interconnected components:

Frontend: React and TypeScript power the interactive interface, virtual streaming room, avatar states, audience chat, and reward animations.
Backend: Python and FastAPI manage study sessions, behavioural events, task progress, and reward logic.
AI Layer: A local language model supports contextual audience interactions, personalized encouragement, and post-session insights.
Behaviour Engine: A multi-signal system combines observable page activity, task progression, and user feedback to estimate engagement and determine when an intervention may be helpful.
Data & Analytics: Session events are used to generate engagement timelines and personalized session reports.
We deliberately separated deterministic application logic from AI-generated responses. Timers, task completion, behavioural state transitions, and rewards are handled by programmatic rules, while the language model focuses on generating context-aware interactions.

Challenges We Faced
One of our biggest challenges was balancing engagement with concentration.

A virtual audience can make studying more enjoyable, but too many notifications and interactions could become distractions themselves. We therefore designed different interaction states and aimed to make AI interventions contextual rather than constant.

Another challenge was evaluating engagement meaningfully. Mouse and keyboard activity alone cannot reliably represent attention — someone reading a document might not interact with the page for several minutes. We addressed this by combining multiple signals and incorporating direct user feedback, rather than treating inactivity as proof of distraction.

We also faced the challenge of building a cohesive experience within a limited hackathon timeframe. Integrating the visual interface, event-driven interactions, behavioural analysis, and local AI required us to prioritize a complete working experience over an unnecessarily large feature set.

What We Learned
Building Nudge taught us that effective AI products are not necessarily those that use AI everywhere.

Sometimes, the most valuable application of AI is knowing when to intervene, what kind of support to offer, and when to stay quiet.

We also learned the importance of designing AI around real user needs, combining deterministic systems with generative capabilities, and balancing an engaging experience with practical functionality.

What's Next
We envision Nudge evolving into a personalized virtual productivity world where users can customize their rooms, develop their streamer identities, build long-term habits, and discover the environments and encouragement styles that help them work best.

Nudge isn't here to watch you work. It's here to help you keep going.

Built With
apis
css
html
python
Try it out
[ nudge-xbg3.onrender.com](https://nudge-xbg3.onrender.com/)
