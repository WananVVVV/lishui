# city-safety-admin-front

溧水区城市安全电子“一张图”后台管理端前端项目。

当前实现：

- 事故类比排查防控列表页
- 事故类比排查详情页
- 详情页左侧对话容器
- 详情页右侧关联排查要素、关联单位、隐患排查表、专项任务提示函四个展示区域

## 项目路径

```bash
/Users/wangxin/项目/frontend/city-safety-admin-front
```

## 技术栈

- Vue 3
- Vite
- TypeScript
- Element Plus
- Pinia
- Vue Router
- SCSS

## 启动

```bash
cd /Users/wangxin/项目/frontend/city-safety-admin-front
pnpm install
pnpm dev
```

默认访问地址：

```text
http://localhost:5173/#/accidents
```

## 路由

```text
/#/accidents       事故报告列表
/#/accidents/:id   事故类比排查详情
```

项目当前使用 hash 路由，静态部署时不依赖 Nginx history fallback 配置。

## 常用命令

```bash
pnpm dev        # 本地开发
pnpm build      # 类型检查并打包
pnpm preview    # 预览打包产物
pnpm typecheck  # 仅执行类型检查
```

## 环境变量

开发环境配置在 `.env.development`，生产环境配置在 `.env.production`。

```dotenv
VITE_APP_TITLE=溧水区城市安全电子一张图
VITE_APP_BASE_URL=/
VITE_APP_API_BASE=/api
VITE_APP_SERVER=
```

说明：

- `VITE_APP_TITLE`：浏览器标题和系统名称配置。
- `VITE_APP_BASE_URL`：Vite 打包基础路径。根路径部署用 `/`；子路径部署可改为 `/city-safety-admin/`。
- `VITE_APP_API_BASE`：前端请求接口前缀，预留给后端接口接入。
- `VITE_APP_SERVER`：开发代理目标地址。为空时不启用代理。

## 打包输出

```bash
pnpm build
```

默认输出目录：

```text
dist
```

如部署到子路径，需要同步调整 `.env.production` 中的 `VITE_APP_BASE_URL`。
