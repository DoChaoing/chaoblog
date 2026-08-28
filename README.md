# Chao Blog

一个以 AI 应用开发实践为主题的中文静态博客。站点使用 Hexo 和 Cyberpunk 2077 主题构建，采用霓虹终端风格的响应式界面。

## 开发

```bash
pnpm install
pnpm server
```

本地服务默认运行在 `http://localhost:4000`。

## 常用命令

```bash
pnpm build    # 生成静态站点到 public/
pnpm clean    # 删除本地构建产物
pnpm deploy   # 部署到 _config.yml 中配置的远程仓库
```

## 内容与配置

- `source/start/`：新读者入口与目标分流。
- `source/series/`：AI 工程入门、RAG、Agent 和推理部署专题。
- `source/projects/`：项目进度、验证证据与复盘入口。
- `source/_posts/`：已经发布的技术文章。
- `source/`：其他独立页面与站点图片。
- `_config.yml`：Hexo 与部署配置。
- `_config.cyberpunk2077.yml`：Cyberpunk 2077 主题的站点覆盖配置。
- `themes/cyberpunk2077/`：当前唯一保留并启用的主题。
- `scaffolds/`：文章、页面与草稿的 Front Matter 模板。

`public/`、`.deploy_git/` 和 `db.json` 均为本地生成文件，不纳入版本控制。

## 发布前检查

```bash
pnpm build
```

确认生成成功后，再执行 `pnpm deploy`。
