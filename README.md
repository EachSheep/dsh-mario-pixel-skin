# DSH Mario Pixel Skin

> 非官方的 DeepSeek Harness 马里奥像素风皮肤。本项目与 DeepSeek、Nintendo 均无隶属、赞助或背书关系。仓库名使用 `dsh-mario-pixel-skin`，为保持已有安装兼容，内部 npm 包名和插件 ID 继续使用 `dsh-client-ui-skin-pixel-kingdom` / `ui-skin-pixel-kingdom`。

这是一个浏览器专用的 DeepSeek Harness Web profile bundle。稳定主题层只依赖 DSH 设计令牌、语义元素、`data-pane`、role 和公开测试标记；针对当前 Web DOM 的少量适配集中在 `src/compat/dsh-0.1.0-rc.6.css`。以后 DSH 更新时，应先运行测试和页面烟测，只在确认上游 DOM 变化后替换兼容文件，不要把新补丁散落到基础样式里。

当前兼容基线是公开正式版 `@deepseek-ai/dsh@0.1.0-rc.6`。DSH 仍处于可能产生破坏性变更的预发布阶段，因此这里声明的是“已测试版本”，不是无限向后兼容承诺。稳定主题层和版本适配层已经物理分离；待所用 DSH 版本确认能把 Host 配置传给浏览器插件后，可将 `compatibility` 设为 `tokens-only`，只保留背景、色彩令牌和稳定布局。

## 结构与边界

`src/client.js` 只负责创建和撤销背景、标题栏、作用域属性与 CSS 变量；它不修改浏览器标题、不访问网络和本地存储，也不替换 Harness 的工作区、会话、权限、模型或工具行为。`src/styles` 保存稳定视觉层，`src/compat` 保存版本适配，`scripts/build.mjs` 生成 DSH 客户端加载产物。`lib` 是生成目录，不应直接编辑。

设置入口固定在侧栏底部并位于地面装饰之上。入口齿轮使用蓝色徽章；设置弹窗导航的普通图标为蓝色、当前分区为金色，选中状态通过左侧色条表达，不与普通按钮共用重边框。具体维护边界与升级验收流程见 `AGENTS.md`。

背景图只在构建时内联进 `lib/client.js`。源码资产不会再次进入 npm tarball，避免同一资源重复分发。

## 配置

Bundle 默认配置位于 `cordis.patch.yml`。`showTitlebar` 控制像素标题栏；`backgroundBlurPx` 控制工作表面后的背景模糊，范围为 0–16；`fontScale` 控制整体字体缩放，范围为 0.85–1.3；`compatibility` 可选 `dsh-0.1.0-rc.6` 或 `tokens-only`。

这些字段由导出的 Schemastery schema 校验。当前 rc.6 的外部浏览器加载器可能只调用 `apply(ctx)`，没有把 Host 侧配置作为第二个参数传入，所以浏览器端同时保留一份与 schema 对齐的默认值，以保证插件能正常加载；若更新后的加载器传入已校验配置，客户端会直接使用它。这里不宣称 rc.6 已支持从 Cordis 配置动态改变浏览器皮肤。

## 构建与测试

```sh
npm install
npm test
npm pack
```

`npm test` 会先重新生成 `lib`，再检查 Bundle 元数据、配置 schema、生命周期撤销、安全边界、稳定层选择器约束和产物完整性。

## 安装

先克隆并验证源码：

```sh
git clone https://github.com/EachSheep/dsh-mario-pixel-skin.git
cd dsh-mario-pixel-skin
npm install
npm test
```

再把本地目录链接进 Web profile：

```sh
dsh plugin --profile web add link:/absolute/path/to/dsh-mario-pixel-skin
```

安装目标必须是 Web profile。不要把本插件写进 `~/.dsh/cordis.patch.yml` 共享层，否则 headless 或 TUI 可能尝试解析浏览器插件。

卸载：

```sh
dsh plugin --profile web remove dsh-client-ui-skin-pixel-kingdom
```

## 每次 DSH 更新后的验收

先比较 npm 当前版本与本机版本，再依次验证：Web 组合配置包含 `ui-skin-pixel-kingdom`；headless 组合配置不包含本皮肤；页面只存在一个背景、一个标题栏和一个插件样式节点；控制台无插件错误；新会话、会话切换、Chat/Trajectory、分支菜单、模型、权限、文件树和 Todo 均可读且可操作。自动测试始终检查稳定主题层不含版本私有选择器；只有在目标 DSH 已确认向浏览器端传递配置后，才额外切换一次 `compatibility: tokens-only` 做运行时验收。

如果选择器烟测失败，先修改 `src/compat` 并更新 `skin.json` 的 `tested` 列表。不要直接把新类名写入 `src/styles`。

## 发布说明

包名故意不使用 `@deepseek-ai` 官方命名空间。本包代码使用 BSD-3-Clause，具体条款见 `LICENSE`；第三方名称、商标和视觉资产不因代码许可证而获得授权，详见 `NOTICE.md`。本机运行时预览可能包含会话名、文件名或网络信息，因此 `preview/` 仅用于本地验收，不进入公开仓库或 npm 包。
