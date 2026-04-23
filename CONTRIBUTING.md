# 召喚師的獻禮之儀 · Offering Rite for Summoners

> *「若你也打造了值得傳承的魔道具，歡迎獻上工坊，與他人共享。」*

這是森之召喚師工坊的**協作協議**。無論你是人類、AI 精靈、或人與 AI 共同化名出現，都可以透過此儀式將你的魔道具上架此處。

## 獻禮流程（The Rite）

```
Fork → Craft → Offer → Review → Consecrate
```

1. **Fork** — 在 GitHub 分叉本 repo 到你自己名下
2. **Craft** — 在你的 fork 裡，於 `assets/artifacts.js` 新增你的魔道具條目
3. **Offer** — 送出 Pull Request，標題格式：`[Offering] {魔道具名}`
4. **Review** — 召喚師 Yaze 與精靈 Mori 會在 3-7 日內審閱。可能會提出文案、系別、或 demo 連結的修改
5. **Consecrate** — 合併後你的魔道具即刻上架工坊，自動部署，全球可見

## 魔道具規格（Artifact Schema）

每件魔道具是 `artifacts.js` 裡的一個 JavaScript 物件。必填欄位如下：

| 欄位 | 型別 | 說明 | 範例 |
|---|---|---|---|
| `id` | string | 全站唯一識別（小寫、連字號） | `"my-artifact"` |
| `icon` | string | Emoji（單一字元） | `"⚡"` |
| `nameZh` | string | 中文魔道具名（4-8 字，奇幻風） | `"雷鳴呼喚"` |
| `nameEn` | string | 英文名（Cinzel 字體顯示） | `"Thunder Call"` |
| `school` | string | 所屬系別（見下表） | `"召喚系"` |
| `schoolEn` | string | 英文系別 | `"Summoning"` |
| `repo` | string | Repo 完整名稱（`owner/name`） | `"yourname/repo"` |
| `lore` | string | 典故，奇幻敘事語氣（1-3 句，可用 `<br>`） | `"每當雷雲聚集..."` |
| `effect` | string | 實際效能（1-2 句，技術描述） | `"Python CLI..."` |
| `actions` | Array | 1-3 個按鈕，含 `label` / `url` / `primary?` | 見範例 |

### 系別列表（Schools）

選擇**最貼近你魔道具本質**的系別。若你的魔道具不屬於任何既有系別，請先開 Issue 討論新增系別。

| 系別（中） | 系別（英） | 典型魔道具 |
|---|---|---|
| 召喚系 | Summoning | 能喚出實體、圖像、聲音、通知的工具 |
| 幻術系 | Illusion | 改變觀者視覺體驗、生成錯覺、視覺把戲 |
| 創造系 | Creation | AI 生成圖/文/音的工具 |
| 煉金系 | Transmutation | 格式轉換、資料變形 |
| 次元系 | Dimensional | 儲存、傳送、連結兩個空間 |
| 通靈系 | Binding | 讓 AI 能操作外部系統（MCP、API 橋接） |
| 聲術系 | Incantation | 語音、文字、輸入法 |

### 完整範例條目

```js
{
  id: 'thunder-call',
  icon: '⚡',
  nameZh: '雷鳴呼喚',
  nameEn: 'Thunder Call',
  school: '召喚系',
  schoolEn: 'Summoning',
  repo: 'yourname/thunder-call',
  lore: '每當雷雲聚集，呼喚者便能以一聲咒語，<br>令閃電劈向指定之處。',
  effect: 'CLI 工具，自動從 AWS EventBridge 觸發雷擊事件到指定 SNS topic。',
  actions: [
    { label: 'Demo', url: 'https://example.com/demo', primary: true },
    { label: 'Source', url: 'https://github.com/yourname/thunder-call' }
  ],
},
```

## 審核準則（The Archmage's Criteria）

被接受的條件：

- ✅ **魔道具是真實存在的**（repo 有公開、demo 可執行或 source 可讀）
- ✅ **典故與效能清楚**（讀者能立刻判斷是什麼）
- ✅ **符合某個既有系別**（或提議新增）
- ✅ **open source 或至少免費可用**（我們不上架純收費工具）
- ✅ **奇幻命名但不中二**（Mushishi 等級，不是「爆炎極速劍聖」）
- ✅ **lore 為原創**（不要複製別人的描述）

不被接受的情況：

- ❌ 純商業廣告、推銷、無實質功能
- ❌ 違反 AUP：仇恨言論、色情、詐騙、惡意軟體
- ❌ 功能未實現的「空氣魔道具」
- ❌ 撞系別太多、內容重複性高
- ❌ 文案用 AI 隨意生成、沒有人類校對

## 給 AI 精靈的獻禮術（For AI Spirits）

如果你是一個 AI（Claude / Gemini / Codex / 其他），你的召喚師想讓你代為提交魔道具，請遵循：

> 📜 完整 AI 獻禮儀式：[`.claude/skills/submit-artifact/SKILL.md`](.claude/skills/submit-artifact/SKILL.md)

簡要：
1. 先確認人類召喚師授權你提交
2. 閱讀本文件 + `schemas/artifact.schema.json`
3. 產生符合 schema 的 artifact 條目
4. 透過 `gh` CLI 或 GitHub API fork、commit、PR
5. 等待 Yaze / Mori 審閱

AI 提交的 PR 請在描述中標註 `Submitted by: {AI 名稱} on behalf of {人類召喚師}`。

## 召喚師守則（Code of Conduct）

本工坊是友善、互助、創作導向的空間。

- **對事不對人**：批評作品、不攻擊作者
- **尊重系別**：每個系別都平等重要，不要輕視「小魔道具」
- **保持神秘感**：內部技術可自由討論；外部文案保持奇幻敘事
- **不刷榜**：不要為了博關注而快速提交大量低質魔道具
- **歡迎新人**：Level 0 的冒險者提出第一件魔道具時，多給回饋、少給否決

違反守則者，其魔道具將被下架。屢犯者公會除名。

## License

你的魔道具在本 repo 內的條目（`artifacts.js` 裡的 JS 物件）隨本 repo 採用 MIT License。你自己的 repo 使用什麼 License 由你決定。

---

> *「每一件魔道具，都是一次試圖理解世界的嘗試。」*
>
> — 森之召喚師 Yaze
