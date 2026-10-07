# AutoAccessibility · 无障碍开机自启

一个基于 **KernelSU** 的 Android 模块：**开机自动启用指定 App 的无障碍服务**，内置 **Miuix 风格的 WebUI**，可视化搜索、勾选要开机自启的无障碍应用。

适用于 ColorOS / 一加（OPlus）等机型的 Root 用户，无需 LSPosed，仅开机执行一次、不后台驻留、省电。

---

## ✨ 功能特性

- **开机自动启用无障碍**：等待系统完全启动后，自动启用配置列表中列出的无障碍服务（`service.sh` 开机执行，仅一次，不驻留）
- **内置 WebUI（在 KernelSU 管理器中直接打开）**：
  - 展示全部已安装应用：**图标 + 名称 + 包名 + 系统应用标记**
  - **搜索**：按应用名称或包名实时过滤
  - **显示/隐藏系统应用**开关
  - **下拉刷新**：重新读取应用与授权状态
  - **勾选即生效**：点击开关立即写入配置，开机脚本读取生效
  - **一键授权跳转**：未授权应用点击「授权」，直达系统无障碍设置页
  - 智能排序：**已勾选 → 已授权 → 未授权**
- **多应用管理**：`config/acc.conf` 支持多行，每行一个完整无障碍服务，可无限添加
- **状态栏配色同步**：WebUI 开启 edge-to-edge，状态栏与页面背景融合
- **Miuix 设计风格**：小米橙强调色、圆角卡片、Material 开关、浅灰背景
- **无需 LSPosed / Xposed**

---

## 📦 模块结构

```
autoacc/
├── module.prop          # 模块信息（中文名、作者、版本）
├── customize.sh         # 安装时自动设置脚本 755 权限
├── service.sh           # 开机脚本：等待启动完成 → 启用无障碍
├── config/
│   └── acc.conf         # 无障碍服务配置列表（每行一个，可自定义）
├── tools/
│   └── list.sh          # 查看当前已开启的无障碍服务（便于复制）
└── webroot/             # KernelSU WebUI 界面
    ├── index.html       # Miuix 风格页面
    ├── kernelsu.js      # KSU 原生桥接封装
    └── app.js           # 业务逻辑
```

---

## 🔧 安装要求

| 要求 | 说明 |
|---|---|
| Root | KernelSU（推荐）、Magisk 部分版本支持 |
| Android | Android 11+（在 ColorOS / 一加 15 上测试） |
| 管理器 | KernelSU Manager（需支持 WebUI） |
| 无需 | LSPosed / Xposed 框架 |

### 安装步骤

1. 在 **Releases** 页面下载最新版 `AutoAccessibility.zip`
2. KernelSU Manager → **模块** → **从本地安装** → 选择 zip
3. 重启手机
4. 打开 KernelSU Manager → 模块 → 找到「无障碍开机自启」→ **打开界面**（WebUI）

---

## 🚀 使用教程

### 1. 勾选要开机自启的应用

打开 WebUI 后：

1. **搜索**要找的 App，或直接浏览列表
2. **已授权**的应用：直接点右侧开关 **勾选** → 写入配置，开机自动启用 ✅
3. **未授权**的应用：点击右侧橙色 **「授权」** 按钮 → 直达系统无障碍设置 → 手动开启一次 → 返回 WebUI **下拉刷新** → 变已授权 → 再勾选

### 2. 手动编辑配置（可选）

配置文件位于：`/data/adb/modules/autoacc/config/acc.conf`

```
# 每行一个完整无障碍服务名：包名/服务类名
com.example.app/com.example.app.MyAccessibilityService
```

`#` 开头为注释，空行自动忽略。

### 3. 查看已开启的无障碍服务

终端执行：

```sh
sh /data/adb/modules/autoacc/tools/list.sh
```

输出当前系统已开启的无障碍服务，每行一个，可直接复制到配置。

### 4. 调整开机等待时间

`service.sh` 中 `sleep 10`（系统启动完成后额外等待秒数），ColorOS 加载偏慢可调大到 `15`。

---

## ⚠️ 已知限制（请先阅读）

> **重要**：**Android 无障碍服务需要至少一次系统用户手动授权**，这是谷歌的强制安全机制（防止恶意 App 伪装无障碍）。**Root 命令也无法绕过**。

- ❌ **无法「纯 WebUI 一键首次授权」**：从未在系统设置手动开启过的无障碍服务，WebUI 无法直接激活，需先通过「授权」按钮在系统里开启一次
- ✅ **授权一次后**：后续每次开机，模块脚本可自动启用，无需再手动
- ⚠️ **手动在系统设置关闭无障碍后**：系统会移除授权记录，脚本无法强制重新打开，需重新授权一次
- ColorOS「权限监控」可能清除无障碍授权，建议：设置 → 开发者选项 → 关闭「权限监控」

---

## 🗂️ 更新日志

### v4.2
- 新增 WebUI **下拉刷新**
- 未授权应用新增 **「授权」一键跳转**（直达系统无障碍设置）
- 未授权应用由灰色禁用改为可操作

### v4.1
- WebUI 状态栏与页面背景颜色同步（edge-to-edge）
- 列表智能排序：已勾选 → 已授权 → 未授权

### v4.0
- 新增 **KernelSU WebUI**：可视化搜索、勾选管理无障碍，Miuix 风格

### v3.0
- 修复开机不生效：改用 `service.sh`，等待系统完全启动后再启用

### v2.0
- 新增 `config/` 配置目录与 `tools/list.sh`，支持多应用
- 修复安装权限：`customize.sh` 强制 755

### v1.0
- 初版：开机自动启用单个 App 无障碍

---

## 📄 开源协议

本项目使用 [MIT License](LICENSE)。作者：Github@[tankui666](https://github.com/tankui666)。

---

## 🤝 贡献 & 反馈

欢迎提交 Issue 或 Pull Request。反馈时请附上：手机型号、ColorOS 版本、KernelSU 版本。
