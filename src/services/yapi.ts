import axios, { AxiosError } from "axios";

export interface ApiInterface {
  _id: string;
  title: string;
  path: string;
  method: string;
  req_params: any[];
  req_body_form: any[];
  req_headers: any[];
  req_query: any[];
  req_body_type: string;
  res_body_type: string;
  res_body: string;
  desc: string;
  markdown: string;
}

export interface ProjectInfo {
  _id: string;
  name: string;
  basepath: string;
  desc: string;
}

export interface Category {
  _id: string;
  name: string;
  desc: string;
}

export interface ApiListItem {
  _id: string;
  title: string;
  projectId: string;
}

export interface ApiMenu {
  _id: string;
  name: string;
  desc: string;
  list: ApiListItem[];
}

export interface BaseResponse {
  errcode: number;
  errmsg: string;
}

export interface GetApiResponse extends BaseResponse {
  data: ApiInterface;
}

export interface GetProjectResponse extends BaseResponse {
  data: ProjectInfo;
}

export interface GetCatMenuResponse extends BaseResponse {
  data: Category[];
}

export interface ListCatResponse extends BaseResponse {
  data: {
    count: number;
    total: number;
    list: ApiListItem[];
  };
}

export interface ListResponse extends BaseResponse {
  data: {
    count: number;
    total: number;
    list: ApiListItem[];
  };
}

export interface ListMenuResponse extends BaseResponse {
  data: ApiMenu[];
}

export interface SearchProjectResponse extends BaseResponse {
  data: ProjectInfo[];
}

export interface SearchResponse extends BaseResponse {
  data: {
    project: ProjectInfo[];
    interface: ApiListItem[];
  };
}

export class YApiService {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly cookie: string;

  constructor(baseUrl: string, token: string, cookie: string) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.cookie = cookie;
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      console.log(`调用 ${this.baseUrl}${endpoint}`);
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params: {
          ...params,
          ...(this.token ? { token: this.token } : {}),
        },
        headers: {
          Cookie: `${this.cookie}`, // 将token作为Cookie发送
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw {
          status: error.response.status,
          message: error.response.data.errmsg || "未知错误",
        };
      }
      throw new Error("与YApi服务器通信失败");
    }
  }

  async getApiInterface(id: string): Promise<ApiInterface> {
    try {
      // 根据YApi文档，接口需要传递id参数
      const response = await this.request<GetApiResponse>("/api/interface/get", { id });

      // YApi接口返回errcode为0表示成功
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取API接口失败");
      }

      return response.data;
    } catch (error) {
      console.error("获取API接口失败:", error);
      throw error;
    }
  }

  /**
   * 获取项目基本信息
   * 路径: /api/project/get
   */
  async getProjectInfo(): Promise<ProjectInfo> {
    try {
      const response = await this.request<GetProjectResponse>("/api/project/get");

      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取项目信息失败");
      }

      return response.data;
    } catch (error) {
      console.error("获取项目信息失败:", error);
      throw error;
    }
  }

  /**
   * 获取菜单列表
   * 路径: /api/interface/getCatMenu
   * 参数: project_id (必填)
   */
  async getCatMenu(project_id: string): Promise<Category[]> {
    try {
      const response = await this.request<GetCatMenuResponse>("/api/interface/getCatMenu", {
        project_id,
      });

      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取菜单列表失败");
      }

      return response.data;
    } catch (error) {
      console.error("获取菜单列表失败:", error);
      throw error;
    }
  }

  /**
   * 获取某个分类下接口列表
   * 路径: /api/interface/list_cat
   * 参数: catid (必填), page (选填，默认1), limit (选填，默认10)
   */
  async getInterfaceListByCat(
    catid: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ count: number; total: number; list: ApiListItem[] }> {
    try {
      const response = await this.request<ListCatResponse>("/api/interface/list_cat", {
        catid,
        page,
        limit,
      });

      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取分类接口列表失败");
      }

      return response.data;
    } catch (error) {
      console.error("获取分类接口列表失败:", error);
      throw error;
    }
  }

  /**
   * 获取接口列表数据
   * 路径: /api/interface/list
   * 参数: project_id (必填), page (必填), limit (必填，默认10)
   */
  async getInterfaceList(
    project_id: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ count: number; total: number; list: ApiListItem[] }> {
    try {
      const response = await this.request<ListResponse>("/api/interface/list", {
        project_id,
        page,
        limit,
      });

      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取接口列表失败");
      }

      return response.data;
    } catch (error) {
      console.error("获取接口列表失败:", error);
      throw error;
    }
  }

  /**
   * 获取接口菜单列表
   * 路径: /api/interface/list_menu
   * 参数: project_id (必填)
   */
  async getInterfaceMenu(project_id: string): Promise<ApiMenu[]> {
    try {
      const response = await this.request<ListMenuResponse>("/api/interface/list_menu", {
        project_id,
      });

      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取接口菜单列表失败");
      }

      return response.data;
    } catch (error) {
      console.error("获取接口菜单列表失败:", error);
      throw error;
    }
  }

  /**
   * 搜索项目和接口
   * 路径: /api/project/search
   * 参数: q (必填, 搜索关键词)
   */
  async searchProjects(q: string): Promise<{ project: ProjectInfo[]; interface: ApiListItem[] }> {
    try {
      const response = await this.request<SearchResponse>("/api/project/search", {
        q,
      });

      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "搜索项目和接口失败");
      }

      return response.data;
    } catch (error) {
      console.error("搜索项目和接口失败:", error);
      throw error;
    }
  }
}
