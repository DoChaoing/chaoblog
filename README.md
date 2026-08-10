# Chao Blog

一个以 AI 应用开发实践为主题的中文静态博客。站点使用 Hexo 和 Reimu 主题构建，保留单一主题配置及站点自身的内容、图片和样式。

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

- `source/_posts/`：博客文章；新文章使用 `pnpm hexo new post <标题>` 创建。
- `source/`：独立页面、站点图片、样式与浏览器端脚本。
- `_config.yml`：Hexo 与部署配置。
- `_config.reimu.yml`：唯一启用的主题 Reimu 的覆盖配置。
- `scaffolds/`：文章、页面与草稿的 Front Matter 模板。

`public/`、`.deploy_git/` 和 `db.json` 均为本地生成文件，不纳入版本控制。

## 发布前检查

```bash
pnpm build
```

确认生成成功后，再执行 `pnpm deploy`。
