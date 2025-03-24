import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { YApiService } from "./services/yapi";
import express, { Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { IncomingMessage, ServerResponse } from "http";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

export class YapiMcpServer {
  private readonly server: McpServer;
  private readonly yapiService: YApiService;
  private sseTransport: SSEServerTransport | null = null;

  constructor(yapiBaseUrl: string, yapiToken: string, yapiCookie: string) {
    this.yapiService = new YApiService(yapiBaseUrl, yapiToken, yapiCookie);
    this.server = new McpServer({
      name: "Yapi MCP Server",
      version: "0.1.0",
    });

    this.registerTools();
  }

  private registerTools(): void {
    // Tool to get api interface information
    this.server.tool(
      "get_api_desc",
      "获取YApi中特定接口的详细信息",
      {
        apiId: z.string().describe("YApi接口的ID；如连接/project/1/interface/api/66，则ID为66"),
      },
      async ({ apiId }) => {
        const id = apiId;
        try {
          console.log(`获取API接口: ${id}`);
          const apiInterface = await this.yapiService.getApiInterface(id);
          console.log(`成功获取API接口: ${apiInterface.title || id}`);

          // 格式化返回数据，使其更易于阅读
          const formattedResponse = {
            基本信息: {
              接口ID: apiInterface._id,
              接口名称: apiInterface.title,
              接口路径: apiInterface.path,
              请求方式: apiInterface.method,
              接口描述: apiInterface.desc,
            },
            请求参数: {
              URL参数: apiInterface.req_params,
              查询参数: apiInterface.req_query,
              请求头: apiInterface.req_headers,
              请求体类型: apiInterface.req_body_type,
              表单参数: apiInterface.req_body_form,
            },
            响应信息: {
              响应类型: apiInterface.res_body_type,
              响应内容: apiInterface.res_body,
            },
            其他信息: {
              接口文档: apiInterface.markdown,
            },
          };

          return {
            content: [{ type: "text", text: JSON.stringify(formattedResponse, null, 2) }],
          };
        } catch (error) {
          console.error(`获取API接口 ${id} 时出错:`, error);
          return {
            content: [{ type: "text", text: `获取API接口出错: ${error}` }],
          };
        }
      },
    );

    // 获取项目基本信息
    this.server.tool("get_project_info", "获取YApi项目的基本信息", {}, async () => {
      try {
        console.log("获取项目基本信息");
        const projectInfo = await this.yapiService.getProjectInfo();
        console.log(`成功获取项目信息: ${projectInfo.name}`);

        const formattedResponse = {
          项目ID: projectInfo._id,
          项目名称: projectInfo.name,
          项目描述: projectInfo.desc,
          基础路径: projectInfo.basepath,
        };

        return {
          content: [{ type: "text", text: JSON.stringify(formattedResponse, null, 2) }],
        };
      } catch (error) {
        console.error("获取项目信息时出错:", error);
        return {
          content: [{ type: "text", text: `获取项目信息出错: ${error}` }],
        };
      }
    });

    // 获取菜单列表
    this.server.tool(
      "get_cat_menu",
      "获取YApi项目的菜单列表",
      {
        projectId: z.string().describe("项目ID"),
      },
      async ({ projectId }) => {
        try {
          console.log(`获取项目 ${projectId} 的菜单列表`);
          const catMenu = await this.yapiService.getCatMenu(projectId);
          console.log(`成功获取菜单列表，共 ${catMenu.length} 项`);

          const formattedResponse = catMenu.map((category) => ({
            分类ID: category._id,
            分类名称: category.name,
            分类描述: category.desc,
          }));

          return {
            content: [{ type: "text", text: JSON.stringify(formattedResponse, null, 2) }],
          };
        } catch (error) {
          console.error(`获取项目 ${projectId} 菜单列表时出错:`, error);
          return {
            content: [{ type: "text", text: `获取菜单列表出错: ${error}` }],
          };
        }
      },
    );

    // 获取某个分类下接口列表
    this.server.tool(
      "get_cat_interface_list",
      "获取YApi中某个分类下的接口列表",
      {
        catId: z.string().describe("分类ID"),
        page: z.number().optional().describe("页码，默认为1"),
        limit: z.number().optional().describe("每页数量，默认为10"),
      },
      async ({ catId, page = 1, limit = 10 }) => {
        try {
          console.log(`获取分类 ${catId} 下的接口列表`);
          const listResult = await this.yapiService.getInterfaceListByCat(catId, page, limit);
          console.log(
            `成功获取分类接口列表，共 ${listResult.total} 项，当前页 ${listResult.list.length} 项`,
          );

          const formattedResponse = {
            总数: listResult.total,
            当前页数量: listResult.count,
            接口列表: listResult.list.map((item) => ({
              接口ID: item._id,
              接口名称: item.title,
              接口路径: item.path,
              请求方式: item.method,
            })),
          };

          return {
            content: [{ type: "text", text: JSON.stringify(formattedResponse, null, 2) }],
          };
        } catch (error) {
          console.error(`获取分类 ${catId} 接口列表时出错:`, error);
          return {
            content: [{ type: "text", text: `获取分类接口列表出错: ${error}` }],
          };
        }
      },
    );

    // 获取接口列表数据
    this.server.tool(
      "get_interface_list",
      "获取YApi项目的接口列表数据",
      {
        projectId: z.string().describe("项目ID"),
        page: z.number().optional().describe("页码，默认为1"),
        limit: z.number().optional().describe("每页数量，默认为10"),
      },
      async ({ projectId, page = 1, limit = 10 }) => {
        try {
          console.log(`获取项目 ${projectId} 的接口列表`);
          const listResult = await this.yapiService.getInterfaceList(projectId, page, limit);
          console.log(
            `成功获取项目接口列表，共 ${listResult.total} 项，当前页 ${listResult.list.length} 项`,
          );

          const formattedResponse = {
            总数: listResult.total,
            当前页数量: listResult.count,
            接口列表: listResult.list.map((item) => ({
              接口ID: item._id,
              接口名称: item.title,
              接口路径: item.path,
              请求方式: item.method,
            })),
          };

          return {
            content: [{ type: "text", text: JSON.stringify(formattedResponse, null, 2) }],
          };
        } catch (error) {
          console.error(`获取项目 ${projectId} 接口列表时出错:`, error);
          return {
            content: [{ type: "text", text: `获取接口列表出错: ${error}` }],
          };
        }
      },
    );

    // 获取接口菜单列表
    this.server.tool(
      "get_interface_menu",
      "获取YApi项目的接口菜单列表（包含分类及其下的接口）",
      {
        projectId: z.string().describe("项目ID"),
      },
      async ({ projectId }) => {
        try {
          console.log(`获取项目 ${projectId} 的接口菜单列表`);
          const menuList = await this.yapiService.getInterfaceMenu(projectId);
          console.log(`成功获取接口菜单列表，共 ${menuList.length} 个分类`);

          const formattedResponse = menuList.map((menu) => ({
            分类ID: menu._id,
            分类名称: menu.name,
            分类描述: menu.desc,
            接口列表: menu.list.map((item) => ({
              接口ID: item._id,
              接口名称: item.title,
              接口路径: item.path,
              请求方式: item.method,
            })),
          }));

          return {
            content: [{ type: "text", text: JSON.stringify(formattedResponse, null, 2) }],
          };
        } catch (error) {
          console.error(`获取项目 ${projectId} 接口菜单列表时出错:`, error);
          return {
            content: [{ type: "text", text: `获取接口菜单列表出错: ${error}` }],
          };
        }
      },
    );

    // 搜索项目
    this.server.tool(
      "search_projects",
      "搜索YApi项目",
      {
        q: z.string().describe("搜索API关键词"),
      },
      async ({ q }) => {
        try {
          console.log(`搜索YApi项目: ${q}`);
          const projects = await this.yapiService.searchProjects(q);
          console.log(
            `成功获取搜索结果，共 ${projects.project.length} 个项目， ${projects.interface.length} 个接口`,
          );

          const formattedResponse = {
            项目列表: projects.project.map((project) => ({
              项目ID: project._id,
              项目名称: project.name,
            })),
            接口列表: projects.interface.map((item) => ({
              接口ID: item._id,
              接口路径: item.title,
              项目id: item.projectId,
            })),
          };

          return {
            content: [{ type: "text", text: JSON.stringify(formattedResponse, null, 2) }],
          };
        } catch (error) {
          console.error(`搜索YApi项目时出错:`, error);
          return {
            content: [{ type: "text", text: `搜索YApi项目出错: ${error}` }],
          };
        }
      },
    );

    // 注册单个通用API工具
    this.server.tool(
      "call_yapi",
      "调用YApi的任意接口",
      {
        endpoint: z.string().describe("YApi接口名称，如 getApiInterface"),
        params: z.record(z.any()).describe("接口所需的参数"),
      },
      async ({ endpoint, params }) => {
        try {
          console.log(`调用YApi接口: ${endpoint}，参数:`, params);

          if (!(endpoint in this.yapiService)) {
            return {
              content: [{ type: "text", text: `错误: 未找到API ${endpoint}` }],
            };
          }

          // @ts-ignore - 动态调用
          const result = await this.yapiService[endpoint](...Object.values(params));
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error) {
          return {
            content: [{ type: "text", text: `调用YApi接口出错: ${error}` }],
          };
        }
      },
    );
  }

  async connect(transport: Transport): Promise<void> {
    console.log("Connecting to transport...");
    await this.server.connect(transport);
    console.log("Server connected and ready to process requests");
  }

  async startHttpServer(port: number): Promise<void> {
    const app = express();

    app.get("/sse", async (req: Request, res: Response) => {
      console.log("New SSE connection established");
      this.sseTransport = new SSEServerTransport(
        "/messages",
        res as unknown as ServerResponse<IncomingMessage>,
      );
      await this.server.connect(this.sseTransport);
    });

    app.post("/messages", async (req: Request, res: Response) => {
      if (!this.sseTransport) {
        // @ts-expect-error Not sure why Express types aren't working
        res.sendStatus(400);
        return;
      }
      await this.sseTransport.handlePostMessage(
        req as unknown as IncomingMessage,
        res as unknown as ServerResponse<IncomingMessage>,
      );
    });

    app.listen(port, () => {
      console.log(`HTTP server listening on port ${port}`);
      console.log(`SSE endpoint available at http://localhost:${port}/sse`);
      console.log(`Message endpoint available at http://localhost:${port}/messages`);
    });
  }
}
