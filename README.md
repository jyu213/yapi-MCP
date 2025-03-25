# Yapi MCP Server

# serve 方式

```bash
pnpm install
pnpm run dev
```

## 环境配置

在项目根目录创建 `.env` 文件，并配置以下环境变量：

```env
# YApi配置
YAPI_TOKEN=your_yapi_token_here    # YApi平台的访问令牌
YAPI_COOKIE=your_yapi_cookie_here  # YApi平台的cookie(和 token 二选一，支持私部服务)
YAPI_BASE_URL=your_yapi_base_url_here    # YApi平台的基础URL地址

# 服务器配置
PORT=3334    # MCP服务器监听端口
```

# command 方式

```bash
# 配置对应 command
npx yapi-mcp --stdio --yapi-base-url your_yapi_base_url_here --yapi-token your_yapi_token_here
```

# 文档

## Available Tools

YApi MCP 服务器提供以下工具：

### get_api_desc

获取指定的 YApi 接口详细信息。

参数：

- `apiId` (string): Yapi的接口ID

### get_project_info

获取 YApi 项目的基本信息。

参数：

- `id` (string): 项目ID

返回数据：

- `_id`: 项目ID
- `name`: 项目名称
- `desc`: 项目描述
- `cat`: 分类列表

### get_cat_menu

获取 YApi 项目的菜单列表。

参数：

- `project_id` (string): 项目ID

返回数据：

- 分类列表数组，每个分类包含：
  - `_id`: 分类ID
  - `name`: 分类名称
  - `desc`: 分类描述
  - `list`: 接口列表

### get_cat_interface_list

获取 YApi 中某个分类下的接口列表。

参数：

- `catid` (string): 分类ID
- `page` (number, 可选): 页码，默认为1
- `limit` (number, 可选): 每页数量，默认为10

返回数据：

- `count`: 当前页数量
- `total`: 总数量
- `list`: 接口列表

### get_interface_list

获取 YApi 项目的接口列表数据。

参数：

- `project_id` (string): 项目ID
- `page` (number, 可选): 页码，默认为1
- `limit` (number, 可选): 每页数量，默认为10

返回数据：

- `count`: 当前页数量
- `total`: 总数量
- `list`: 接口列表

### get_interface_menu

获取 YApi 项目的接口菜单列表。

参数：

- `project_id` (string): 项目ID

返回数据：

- 菜单列表数组，每个菜单包含：
  - `_id`: 菜单ID
  - `name`: 菜单名称
  - `desc`: 菜单描述
  - `list`: 接口列表

### search_projects

搜索 YApi 项目和接口。

参数：

- `q` (string): 搜索关键词

返回数据：

- `project`: 匹配的项目列表
- `interface`: 匹配的接口列表

## 基础框架参考

https://github.com/GLips/Figma-Context-MCP
