# 发布到 GitHub Pages

## 第一次发布

1. 在 GitHub 新建一个**公开仓库**，例如 `echo`。
2. 可以自动创建 README；上传项目文件时会以本地版本为准。
3. 在本项目目录执行：

```bash
git init
git add .
git commit -m "Build Echo learning app"
git branch -M main
git remote add origin https://github.com/你的用户名/echo.git
git push -u origin main
```

4. 打开仓库的 **Settings → Pages**。
5. 在 **Build and deployment → Source** 选择 **GitHub Actions**。
6. 等待仓库的 **Actions** 页面显示绿色对勾。

地址通常是：

```text
https://你的用户名.github.io/echo/
```

## 之后更新

```bash
git add .
git commit -m "Update app"
git push
```

GitHub Actions 会自动重新发布。

## 免费范围

- 本项目只有静态文件，不需要服务器或数据库。
- 每位使用者的数据存储在其自己的浏览器，不占用你的数据库额度。
- 录音不会上传到 GitHub。
- GitHub Pages 适合前期小体量使用；如果以后访问量很大，再迁移也不迟。
