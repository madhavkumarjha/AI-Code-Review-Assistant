# Demo Script

A short walkthrough for presenting the product (about 2 minutes).

## Intro (30 s)
> "Maine ek AI Code Review Assistant banaya hai. Yeh kuch seconds mein code analyze karta hai: bugs, performance, security aur suggestions deta hai, aur refactored code bhi."

## Live demo (1 min)
1. Click the **🐛 Buggy Async JS** preset
2. Click **Analyze Code**; point out the staged loader
3. Walk through the score, severity-tagged findings and tabs
4. Open **Refactored** (and **Diff** once released)
5. Show **Export PDF** and **Copy Markdown**

## Closing (30 s)
> "Manual review mein 30 minute lagte hain; yeh tool seconds mein first-pass review de deta hai. Code quality improve hoti hai aur delivery fast hoti hai. Yeh mera Quimora project ka next phase hai: AI agents ko production mein use karna."

## Tips
- Use a real `GROQ_API_KEY` for demos; fallback mode returns canned demo reviews.
- Pre-load the preset and warm the API (`/api/health`) before presenting; Render free instances may cold-start.
