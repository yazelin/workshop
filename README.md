# 森之召喚師工坊 · The Forest Summoner's Workshop

> 召喚師 Yaze 與契約精靈 Mori 的魔道具工坊。
> 沉浸式、遊戲感、零框架、零後端。

## 本地預覽

```bash
# 最簡：任何一個靜態伺服器都能跑
cd workshop
python3 -m http.server 8000
# 打開 http://localhost:8000
```

或用 `npx serve`、`caddy file-server`、VSCode Live Server 都可以。
**直接雙擊 `index.html` 在某些瀏覽器也能跑**（但建議用 http 起服務以避免 file:// 限制）。

## 部署到 GitHub Pages

1. 把此資料夾推到 `github.com/yazelin/workshop`
2. Settings → Pages → Source: `main` branch, root
3. 等 1-3 分鐘 → `https://yazelin.github.io/workshop/` 就會 live

完全沒有 build step。你 push 什麼，GitHub Pages 就 serve 什麼。

## 技術堆疊

| 項目 | 選擇 | 為什麼 |
|---|---|---|
| 框架 | 無 | Vanilla HTML/CSS/JS，永遠不用擔心升級破壞 |
| Build | 無 | 推啥就 serve 啥 |
| 後端 | 無 | 全靜態 |
| 字體 | Google Fonts | Cinzel / Cormorant Garamond / Noto Serif TC |
| 音訊 | Web Audio API | 即時生成 drone，零音檔下載 |
| 動畫 | 純 CSS + requestAnimationFrame | 無外部動畫庫 |

## Scene 結構

```
Boot (1.8s 黑屏)
  ↓
Title (標題畫面 + 森林背景 parallax)
  ↓ (點「推門而入」)
Forest Path (穿越森林 5 秒轉場)
  ↓
Door (門前 / 推開門動畫)
  ↓ (點「推開門」)
Workshop Interior (12 魔道具格網)
  ↓ (點任一魔道具)
Artifact Detail Modal (卷軸風格)
```

## 檔案結構

```
workshop/
├── index.html              ← 單頁入口，所有 scene
├── assets/
│   ├── style.css           ← 全部樣式（scoped 變數）
│   ├── app.js              ← Scene 管理、互動、音訊、Mori 游標
│   └── artifacts.js        ← 12 件魔道具資料
└── README.md
```

## 自訂 / 擴充

### 加新魔道具
編輯 `assets/artifacts.js`，在陣列加一個物件：

```js
{
  id: 'your-artifact',
  icon: '✨',
  nameZh: '你的魔道具名',
  nameEn: 'Your Artifact',
  school: '召喚系',  // 召喚/幻術/創造/煉金/次元/通靈/聲術
  schoolEn: 'Summoning',
  repo: 'yazelin/your-repo',
  lore: '典故文字...',
  effect: '實際效能描述',
  actions: [
    { label: 'Try', url: '...', primary: true },
    { label: 'Source', url: '...' },
  ],
}
```

### 改視覺色系
`assets/style.css` 開頭的 `:root` 變數區域：
- `--forest-*`：森林綠色系
- `--parchment-*`：羊皮紙
- `--gold-*`：金色強調

### 換字體
`index.html` 的 Google Fonts `<link>` + `style.css` 的 `--serif-*` 變數。

### 加 Email 收集（真的送到後端）
`app.js` 裡的 `registerForm submit` handler 改成 POST 到：
- [Formspree](https://formspree.io)（零後端、免費 50 封/月）
- [ConvertKit](https://convertkit.com) embed
- [Buttondown](https://buttondown.email)

## 未來擴充可能

- [ ] BGM（載入環境音音檔）
- [ ] 3D 魔道具展示（Three.js）
- [ ] 已收集狀態（LocalStorage 記錄看過哪些）
- [ ] 通關成就（看完 12 件才顯示隱藏邀請）
- [ ] 多語言切換（中/英/日）
- [ ] NPC 對話（Mori 偶爾在角落出現說話）
- [ ] 連結到獨立的「學徒入會頁」（課程 landing）

## License

MIT — 自由 fork 改成你自己的工坊。
