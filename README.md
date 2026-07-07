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
http://localhost:9100/accidents
```

## 路由

```text
/accidents       事故报告列表
/accidents/:id   事故类比排查详情
```

项目使用 history 路由，静态部署时需要 Nginx fallback 到入口 `index.html`。参考配置见 `devops/nginx.conf`。

## 常用命令

```bash
pnpm dev        # 本地开发
pnpm build      # 生产环境类型检查并打包
pnpm build:prod # 生产环境类型检查并打包
pnpm build:dev  # 开发环境类型检查并打包
pnpm preview    # 预览打包产物
pnpm typecheck  # 仅执行类型检查
```

## 环境变量

开发环境配置在 `.env.development`，生产环境配置在 `.env.production`。

```dotenv
VITE_APP_TITLE=溧水区城市安全电子一张图
VITE_APP_ENV=development
VITE_APP_CONTEXT_PATH=/
VITE_APP_BASE_API=/se/yyg-aqjc-api
VITE_APP_PORT=9100
```

说明：

- `VITE_APP_TITLE`：浏览器标题和系统名称配置。
- `VITE_APP_ENV`：当前环境标识。
- `VITE_APP_CONTEXT_PATH`：Vite 打包基础路径和 Vue Router history base。根路径部署用 `/`；子路径部署可改为 `/city-safety-admin/`。
- `VITE_APP_BASE_API`：业务接口前缀，开发代理会转发到 `http://empower-dev.tech.skytech.io/se/yyg-aqjc-api`。
- `VITE_APP_PORT`：本地开发服务端口。

## 打包输出

```bash
pnpm build
```

默认输出目录：

```text
dist/city-safety-admin-front
```

如部署到子路径，优先调整 `.env.production` 中的 `VITE_APP_CONTEXT_PATH`，并将 `devops/nginx.conf` 的 `location`、`alias`、`try_files` 路径改为同一个前缀。

如果生产环境由当前 Nginx 同时承接后端接口，需要在 `location /` 的 history fallback 前增加更具体的 `/se/yyg-aqjc-api`、`/agent` 反向代理配置，避免接口请求被回退到 `index.html`。

## 镜像配置

`devops/Dockerfile` 参考本地 `empower-iframe-front` 的静态前端镜像方式，将打包产物 `dist/city-safety-admin-front` 拷贝到容器内 `/empower/city-safety-admin-front`，并使用 `devops/nginx.conf` 启动 Nginx。
