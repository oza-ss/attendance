# 工时记录与统计应用

个人工时追踪 Web 应用（Vue 3 + Vant 移动端），手机随时免费访问。

## 功能

- **打卡**：选择日期 + 上下班时间（精确到秒，默认 09:00 / 20:30）；**上下班时间必填**，保存时校验；当天工时在上下班都填好后计算（格式 `9.2h`）
  - 工时规则：7:00 起算（之前不计）；扣除午休 `12:30–14:00`、晚休 `18:00–18:30`；18:30 后加班计入；**次日 5:00 封顶**（超时按 5:00 计算，原始时间保留）
  - 支持跨午夜加班（下班时间早于上班时间视为次日凌晨）
- **录入**：录入任意日期区间的总工时 + 工作天数（公司发布的权威数据），平均工时自动算；日期区间不限范围（2000-2040）
- **总览（首页）**：本月达标推演（目标总工时 / 当前累计 / 月平均工时 / 当前剩余 / 剩余每天需要），以月平均 ≥ 9h 为目标
- **历史**：选年月看该月工作天数（已工作/应工作）、总工时、平均工时；**打卡记录**与**手工录入**用折叠面板展开查看当月明细，支持点击编辑、删除
- **工作日历**：内置 2026 年法定节假日（元旦/春节/清明/劳动节/端午/中秋/国庆），红色"休"= 节假日、灰色"休"= 周末；点击红色"休"显示假期名
- **最近记录**：打卡页、录入页底部各显示最近 15 条记录，点击编辑、带删除图标
- **访问密码**：前端密码门，防他人误改

## 技术栈

Vue 3 · Vite · TypeScript · Vant 4 · Pinia · Vue Router · Day.js · Supabase（云数据库）· Vitest

数据层为 `DataStore` 接口双实现：`.env` 中 `VITE_STORAGE=local` 强制用浏览器 localStorage（数据不上云）；留空且配置了 Supabase 环境变量则用云库。

## 页面结构（底部 4 个 Tab）

| 页面 | 路由 | 内容 |
|---|---|---|
| 总览 | `/` | 本月达标推演（含月平均工时） |
| 打卡 | `/attendance` | 选日期 + 上下班时间 + 当天工时 + 保存；最近 15 条打卡记录 |
| 录入 | `/summary` | 日期区间 + 总工时/工作天数/备注 + 录入/更新；最近 15 条手工录入 |
| 历史 | `/history` | 工作日历 + 该月工作天数/总工时/平均 + 打卡记录/手工录入折叠明细 |

## 本地开发

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest 单测（纯函数/数据层）
npm run build      # 类型检查 + 产物 dist/
npm run preview    # 本地预览构建产物
```

未配置 `.env` 时使用 localStorage，无需任何账号即可体验全部功能。

## 部署上线（手机访问）

> 需要 Supabase（云数据库）与网页托管平台（Vercel 或腾讯云 EdgeOne 等）免费账号。

### A. 创建 Supabase 项目并建表

1. 登录 [supabase.com](https://supabase.com) → New project → 命名（如 `attendance`）→ 选择区域 → 设置数据库密码。
2. 左侧 **SQL Editor** → New query → 粘贴 `supabase/schema.sql` 全部内容 → **Run**（创建 3 张表 + RLS 策略）。
3. 记下 **Project Settings → API** 中的 **Project URL**（形如 `https://xxx.supabase.co`）与 **anon public key**。

### B. 配置前端环境变量

4. 本地：复制 `.env.example` 为 `.env`（已被 gitignore，不会入库）：

   ```
   VITE_SUPABASE_URL=https://你的项目.supabase.co
   VITE_SUPABASE_ANON_KEY=你的匿名密钥
   VITE_ACCESS_PASSWORD=你的访问密码
   # 可选：VITE_STORAGE=local 强制本地存储（不上云）
   ```

5. 本地验证：`npm run dev` 录入一条打卡 → 打开 Supabase Dashboard 的 `daily_records` 表，能看到该行即说明云库生效。

### C. 部署到 Vercel

6. 安装并登录：`npm i -D vercel` → `npx vercel login`（或用 API Token：`npx vercel whoami` 验证）
7. 链接项目：`npx vercel link --yes`（首次会创建项目）
8. 配置生产环境变量（**云端存储时不要设 VITE_STORAGE=local**）：

   ```bash
   npx vercel env add VITE_SUPABASE_URL production --value "https://xxx.supabase.co" --visibility config --no-sensitive
   npx vercel env add VITE_SUPABASE_ANON_KEY production --value "eyJ..." --visibility config --no-sensitive
   npx vercel env add VITE_ACCESS_PASSWORD production --value "你的密码" --visibility config --no-sensitive
   ```

9. 部署：`npx vercel deploy --prod --yes`
10. 部署完成后获得 `https://xxx.vercel.app` 网址，手机浏览器（HTTPS）打开即可。`vercel.json` 已配好 SPA 重写，刷新/直达子页面不会 404。

> **注意**：若公司网络代理对上传有限制（如上传卡在 ~500KB 后失败），请改用**手机热点或家庭网络**执行部署。

### 部署到腾讯云 EdgeOne（国内访问更快，可选）

- 注册 [腾讯云](https://cloud.tencent.com) 并实名认证 → 开通 EdgeOne Pages → 上传 `dist/` 或连接仓库构建（Build command `npm run build`，输出 `dist`）
- 环境变量配置同 Supabase 三项（URL/anon key/密码）

### 注意事项

- `.env` 的 `VITE_` 变量仅在**构建时**注入，修改密钥后需在托管平台改环境变量并重新部署。
- 当前 RLS 为 allow-all，安全依赖前端访问密码（个人工具的防误改级别）；若数据更敏感，可自行收紧为按密码换取 token 或加鉴权函数。

## 验收自查

- 总览页：本月达标推演（目标/当前累计/月平均/当前剩余/剩余每天需要）
- 打卡页：选日期 + 上下班时间（必填）→ 当天工时正确（`9.2h`）；可补录历史日期；最近 15 条可编辑/删除
- 录入页：日期区间 + 总工时/工作天数 → 自动算平均；最近 15 条可编辑/删除
- 历史页：切换年月 → 工作天数（已工作/应工作）、总工时、平均工时；展开打卡记录/手工录入看明细、编辑、删除
- 工作日历：周末显示灰色"休"、节假日显示红色"休"，点击红色"休"显示假期名

## 目录结构

```
supabase/schema.sql     建表 + RLS（在 Supabase SQL Editor 执行）
vercel.json             Vercel SPA 重写配置
public/_redirects       Cloudflare 等平台 SPA 深链接兜底（随构建进 dist）
src/lib/                纯函数领域层（工时计算/周月统计/推演/工作日历）—— 全部有单测
src/data/               DataStore 接口 + localStorage/Supabase 双实现
src/stores/             Pinia 状态层
src/components/         打卡表单/汇总表单/推演卡片组件
src/views/              总览/打卡/录入/历史 四个页面
docs/superpowers/       设计文档与实现计划
```
