# Yapi MCP Server

```bash
pnpm install
pnpm run dev
```

## 环境配置

在项目根目录创建 `.env` 文件，并配置以下环境变量：

```env
# YApi配置
YAPI_TOKEN=your_yapi_token_here    # YApi平台的访问令牌
YAPI_BASE_URL=your_yapi_base_url_here    # YApi平台的基础URL地址

# 服务器配置
PORT=3334    # MCP服务器监听端口
```

## Available Tools

The server provides the following MCP tools:

### get_api_desc

获取指定的yapi接口详细信息。

参数：

- `apiId` (string): Yapi的接口ID

### get_project_info

获取YApi项目的基本信息。

参数：

- 无需额外参数，使用配置的token自动获取

### get_cat_menu

获取YApi项目的菜单列表。

参数：

- `projectId` (string): 项目ID

### get_cat_interface_list

获取YApi中某个分类下的接口列表。

参数：

- `catId` (string): 分类ID
- `page` (number, 可选): 页码，默认为1
- `limit` (number, 可选): 每页数量，默认为10

### get_interface_list

获取YApi项目的接口列表数据。

参数：

- `projectId` (string): 项目ID
- `page` (number, 可选): 页码，默认为1
- `limit` (number, 可选): 每页数量，默认为10

### get_interface_menu

获取YApi项目的接口菜单列表（包含分类及其下的接口）。

参数：

- `projectId` (string): 项目ID

#### 基础框架，参考

https://github.com/GLips/Figma-Context-MCP
