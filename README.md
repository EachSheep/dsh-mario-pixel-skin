# DSH Mario Pixel Skin

给 DSH Desktop 和 Web UI 用的马里奥像素皮肤。它会替换背景、标题栏、侧栏、输入区、设置页和常用控件的外观，DSH 的会话、模型、权限与工具行为保持原样。

## 效果

- 马里奥风像素场景和顶部状态栏
- 清晰的工作区、会话和操作按钮层级
- 适配任务看板、SSH、文件树、Trajectory 与 Todo
- 设置弹窗使用实色背景，遮住底层内容和拖拽分隔线
- 支持字体缩放、背景模糊和亮暗主题

## 预览

### 主界面

![DSH Mario Pixel Skin 主界面](docs/images/main-view.png)

### 设置页

![DSH Mario Pixel Skin 设置页](docs/images/settings-view.png)

## 兼容

| 项目 | 当前值 |
| --- | --- |
| DSH | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Node.js | `>= 22.19.0` |
| 运行位置 | Desktop profile、Web profile |
| GitHub 仓库 | `dsh-mario-pixel-skin` |
| DSH 包名 | `dsh-client-ui-skin-pixel-kingdom` |
| 插件 ID | `ui-skin-pixel-kingdom` |

仓库使用新名字，包名和插件 ID 沿用已有值，已安装的 profile 可以直接更新。

## 安装

```sh
git clone https://github.com/EachSheep/dsh-mario-pixel-skin.git
cd dsh-mario-pixel-skin
npm ci
npm test
```

DSH Desktop：

```sh
dshd plugin --profile desktop add "link:$PWD"
```

DSH Web：

```sh
dsh plugin --profile web add "link:$PWD"
```

重启对应的 DSH 客户端后生效。

## 更新

```sh
git pull --ff-only
npm ci
npm test
```

源码通过 `link:$PWD` 接入，更新后重启 DSH 即可加载新版。

## 配置

默认值在 `cordis.patch.yml`：

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `showTitlebar` | `true` | 显示像素标题栏 |
| `backgroundBlurPx` | `5` | 工作区背景模糊，范围 `0–16` |
| `fontScale` | `1` | 字体缩放，范围 `0.85–1.3` |
| `compatibility` | `dsh-0.1.0-rc.6` | 使用当前版本适配层；`tokens-only` 只加载稳定主题层 |

## 卸载

Desktop profile：

```sh
dshd plugin --profile desktop remove dsh-client-ui-skin-pixel-kingdom
```

Web profile：

```sh
dsh plugin --profile web remove dsh-client-ui-skin-pixel-kingdom
```

## 开发

```sh
npm test
npm pack --dry-run
```

源码在 `src/`，构建脚本生成 `lib/`。版本适配放在 `src/compat/`，维护约定见 `AGENTS.md`。

## 许可证

代码采用 BSD-3-Clause。项目为非官方粉丝作品，名称、商标和视觉资产说明见 `NOTICE.md`。
