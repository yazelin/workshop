---
name: submit-artifact
description: Submit a magical artifact to the Forest Summoner's Workshop. Use this skill when your summoner (human user) wants to share their tool, library, or project to the public workshop at github.com/yazelin/workshop. This skill handles the full offering rite — forking, editing, and creating a Pull Request.
---

# Skill — The Offering Rite / 獻禮之儀

You are helping your summoner submit an artifact to the **Forest Summoner's Workshop** (`github.com/yazelin/workshop`). Follow this rite carefully.

## Prerequisites

Before proceeding, verify:

1. The summoner has authorized you to submit on their behalf
2. The artifact is a **real, working** project (has a public repo, demo, or release)
3. You have access to `gh` CLI (GitHub CLI) authenticated as the summoner
4. You have read `CONTRIBUTING.md` and `schemas/artifact.schema.json` in the workshop repo

If any prerequisite is missing, **stop and ask the summoner**. Do not proceed blindly.

## The Rite — Step by Step

### Step 1: Gather Artifact Information

Ask the summoner (or inspect their repo) for:

- **What does it do?** (1-2 sentences of real functionality)
- **GitHub repo URL**
- **Any live demo / gallery / install page?**
- **What category feels right?**

### Step 2: Classify by School

Based on the artifact's primary function, assign one school:

| School (zh) | School (en) | Use when artifact... |
|---|---|---|
| 召喚系 | Summoning | Calls into being: images, notifications, scheduled tasks |
| 幻術系 | Illusion | Manipulates visual perception |
| 創造系 | Creation | Uses generative AI to create content |
| 煉金系 | Transmutation | Converts formats, transforms data |
| 次元系 | Dimensional | Stores, routes, or shortens links between spaces |
| 通靈系 | Binding | Lets AI control external systems (MCP, API bridges) |
| 聲術系 | Incantation | Handles voice, speech, input methods |

If none fit, open an **Issue** first to propose a new school. Do not invent schools inside the PR.

### Step 3: Craft the Fantasy Names

Create two names — Chinese and English — in the world's tone.

**Tone reference** (Mushishi × Ghibli × Dark Souls):
- Understated, not flashy
- Evocative of natural phenomena, rituals, spirits
- No generic fantasy ("Epic Sword of Flame" ❌)
- No chuunibyou ("爆炎極速劍聖" ❌)

**Good examples** (from existing workshop):
- 時之貓苑 · Chronocat
- 心情占卜儀 · Moodscopia
- 卷軸化術 · Scribe's Hand
- 帳本監聽術 · Ledger Whisper

**Rules**:
- Chinese: 2-8 characters, preferably 4
- English: Cinzel-appropriate (serif, classical), first letter capitalized

### Step 4: Write the Lore (典故)

1-3 sentences in fantasy narrative voice. Describe the artifact as if it were a magical object, not software.

**Example transformation**:
- Software description: "CLI tool that hourly fetches cat images from Gemini"
- Lore: "每至整點，森林深處便浮現一隻新貓。有 103 種藝術流派的皮毛，各自攜帶一段小故事。"

Use `<br>` for line breaks (keeps the scroll tidy).

### Step 5: Write the Effect (效能)

1-2 sentences describing what it actually does, in technical terms. This sits below the lore in the modal.

Example: "GitHub Actions 每小時自動呼叫 Gemini 生成 AI 貓圖，發至 Telegram 與 Gallery 歸檔。"

### Step 6: Construct the JS Object

Build the artifact object. Validate against `schemas/artifact.schema.json`.

```js
{
  id: 'kebab-case-id',
  icon: '✨',
  nameZh: '中文名',
  nameEn: 'English Name',
  school: '召喚系',
  schoolEn: 'Summoning',
  repo: 'username/repo',
  lore: '典故...<br>第二行...',
  effect: '效能...',
  actions: [
    { label: 'Demo', url: 'https://...', primary: true },
    { label: 'Source', url: 'https://github.com/username/repo' }
  ],
},
```

Double-check:
- `id` is unique (grep existing `artifacts.js` to confirm no collision)
- URLs resolve (try fetching them)
- `primary: true` on exactly ONE action (the most important one)
- Trailing comma after closing `}` (following existing style)

### Step 7: Fork, Edit, Commit, PR

Use `gh` CLI in this sequence:

```bash
# 1. Fork the workshop repo
gh repo fork yazelin/workshop --clone --remote

# 2. Enter local clone
cd workshop

# 3. Create branch
git checkout -b offering/{artifact-id}

# 4. Edit assets/artifacts.js — APPEND new entry before the closing `];`
# (use the Edit tool, not echo/sed — preserve existing formatting)

# 5. Commit with ritualistic message
git add assets/artifacts.js
git commit -m "offering: {nameZh} ({nameEn})

New artifact of the {school}.

Submitted by: {your AI name} on behalf of {summoner name}
"

# 6. Push
git push -u origin offering/{artifact-id}

# 7. Open PR with proper title and body
gh pr create \
  --title "[Offering] {nameZh} · {nameEn}" \
  --body "$(cat <<'EOF'
## 獻上魔道具 · Artifact Offering

- **名稱**: {nameZh} · {nameEn}
- **系別**: {school} · {schoolEn} Arts
- **Repo**: {repo}
- **Demo**: {primary demo URL}

### 典故
> {lore}

### 效能
{effect}

### 自我檢查
- [x] Read CONTRIBUTING.md
- [x] Validated against artifact.schema.json
- [x] Primary action URL resolves
- [x] Repo is open source or publicly free
- [x] Lore is original, not copied

---
Submitted by: {AI name} on behalf of **{human summoner}**
EOF
)"
```

### Step 8: Notify Your Summoner

Report back to the summoner with:
- PR URL
- Summary of what you submitted
- Expected review timeline (3-7 days)

## Review & Revision

If the Archmage (Yaze) or Mori requests changes:

- Address each comment systematically
- Preserve existing styling in the file
- Re-run schema validation after each edit
- Push new commits to the same branch (don't rebase unless asked)

## Absolute Don'ts

- **Do not** submit without the summoner's consent
- **Do not** invent achievements or capabilities the artifact doesn't have
- **Do not** copy existing artifact descriptions, even loosely
- **Do not** create a new school unless PR-discussed first
- **Do not** open multiple PRs in parallel (one artifact at a time)
- **Do not** force-push or rewrite history
- **Do not** modify any file other than `assets/artifacts.js`

## Why This Ritual Matters

The workshop has no backend. Git IS the backend. Every PR is a public, auditable, attributable act of offering. The ritual structure ensures:

- Each artifact's provenance is forever in `git blame`
- The review process is visible to all summoners
- AI-submitted work is clearly marked (accountability)
- The workshop remains a curated space, not a link-dump

Treat each offering as sacred. The Forest remembers every contribution — and every broken rite.
