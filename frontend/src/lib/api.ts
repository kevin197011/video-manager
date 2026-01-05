// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { auth } from './auth';

// Use /api for proxy (works in both dev and production via Nginx)
// In development, Vite dev server proxies /api to backend
// In production, Nginx proxies /api to backend container
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = auth.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      auth.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export type APIResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type CDNProvider = {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
};

export type CDNLine = {
  id: number;
  provider_id: number;
  provider?: CDNProvider;
  name: string;  // 名称 (原 display_name)
  code: string;  // 代码 (原 name)
  created_at: string;
  updated_at: string;
};

// CDN Provider API
export const providerAPI = {
  getAll: async (): Promise<CDNProvider[]> => {
    const response = await api.get<APIResponse<CDNProvider[]>>('/cdn-providers');
    return response.data.data;
  },
  getById: async (id: number): Promise<CDNProvider> => {
    const response = await api.get<APIResponse<CDNProvider>>(`/cdn-providers/${id}`);
    return response.data.data;
  },
  create: async (data: { name: string; code: string }): Promise<CDNProvider> => {
    const response = await api.post<APIResponse<CDNProvider>>('/cdn-providers', data);
    return response.data.data;
  },
  update: async (id: number, data: { name: string; code: string }): Promise<CDNProvider> => {
    const response = await api.put<APIResponse<CDNProvider>>(`/cdn-providers/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete<APIResponse<null>>(`/cdn-providers/${id}`);
  },
  getLines: async (id: number): Promise<CDNLine[]> => {
    const response = await api.get<APIResponse<CDNLine[]>>(`/cdn-providers/${id}/lines`);
    return response.data.data;
  },
};

// CDN Line API
export const lineAPI = {
  getAll: async (providerId?: number): Promise<CDNLine[]> => {
    const params = providerId ? { provider_id: providerId } : {};
    const response = await api.get<APIResponse<CDNLine[]>>('/cdn-lines', { params });
    return response.data.data;
  },
  getById: async (id: number): Promise<CDNLine> => {
    const response = await api.get<APIResponse<CDNLine>>(`/cdn-lines/${id}`);
    return response.data.data;
  },
  create: async (data: { provider_id: number; name: string; code: string }): Promise<CDNLine> => {
    const response = await api.post<APIResponse<CDNLine>>('/cdn-lines', data);
    return response.data.data;
  },
  update: async (id: number, data: { provider_id: number; name: string; code: string }): Promise<CDNLine> => {
    const response = await api.put<APIResponse<CDNLine>>(`/cdn-lines/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete<APIResponse<null>>(`/cdn-lines/${id}`);
  },
};

// Domain API
export type Domain = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export const domainAPI = {
  getAll: async (): Promise<Domain[]> => {
    const response = await api.get<APIResponse<Domain[]>>('/domains');
    return response.data.data;
  },
  getById: async (id: number): Promise<Domain> => {
    const response = await api.get<APIResponse<Domain>>(`/domains/${id}`);
    return response.data.data;
  },
  create: async (data: { name: string }): Promise<Domain> => {
    const response = await api.post<APIResponse<Domain>>('/domains', data);
    return response.data.data;
  },
  update: async (id: number, data: { name: string }): Promise<Domain> => {
    const response = await api.put<APIResponse<Domain>>(`/domains/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete<APIResponse<null>>(`/domains/${id}`);
  },
};

// Stream API
export type Stream = {
  id: number;
  name: string;
  code: string;
  provider_id?: number | null;
  provider?: CDNProvider;
  created_at: string;
  updated_at: string;
};

export const streamAPI = {
  getAll: async (): Promise<Stream[]> => {
    const response = await api.get<APIResponse<Stream[]>>('/stream-regions');
    return response.data.data;
  },
  getById: async (id: number): Promise<Stream> => {
    const response = await api.get<APIResponse<Stream>>(`/stream-regions/${id}`);
    return response.data.data;
  },
  create: async (data: { name: string; code: string; provider_id?: number | null }): Promise<Stream> => {
    const response = await api.post<APIResponse<Stream>>('/stream-regions', data);
    return response.data.data;
  },
  update: async (id: number, data: { name: string; code: string; provider_id?: number | null }): Promise<Stream> => {
    const response = await api.put<APIResponse<Stream>>(`/stream-regions/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete<APIResponse<null>>(`/stream-regions/${id}`);
  },
};

// Stream Path API
export type StreamPath = {
  id: number;
  stream_id: number;
  stream?: Stream;
  table_id: string;
  full_path: string;
  created_at: string;
  updated_at: string;
};

export const streamPathAPI = {
  getAll: async (streamId?: number): Promise<StreamPath[]> => {
    const params = streamId ? { stream_id: streamId } : {};
    const response = await api.get<APIResponse<StreamPath[]>>('/stream-paths', { params });
    return response.data.data;
  },
  getById: async (id: number): Promise<StreamPath> => {
    const response = await api.get<APIResponse<StreamPath>>(`/stream-paths/${id}`);
    return response.data.data;
  },
  create: async (data: { stream_id: number; table_id: string; full_path: string }): Promise<StreamPath> => {
    const response = await api.post<APIResponse<StreamPath>>('/stream-paths', data);
    return response.data.data;
  },
  update: async (id: number, data: { stream_id: number; table_id: string; full_path: string }): Promise<StreamPath> => {
    const response = await api.put<APIResponse<StreamPath>>(`/stream-paths/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete<APIResponse<null>>(`/stream-paths/${id}`);
  },
};

// Video Stream Endpoint API
export type Token = {
  id: number;
  user_id: number;
  name: string;
  never_expire: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoStreamEndpoint = {
  id: number;
  provider_id: number;
  provider?: CDNProvider;
  line_id: number;
  line?: CDNLine;
  domain_id: number;
  domain?: Domain;
  stream_id: number;
  stream?: Stream;
  stream_path_id: number;
  stream_path?: StreamPath;
  full_url: string;
  status: number;
  resolution?: string;
  created_at: string;
  updated_at: string;
};

export const videoStreamEndpointAPI = {
  getAll: async (filters?: { provider_id?: number; line_id?: number; domain_id?: number; stream_id?: number; status?: number; resolution?: string }): Promise<VideoStreamEndpoint[]> => {
    const params = filters || {};
    const response = await api.get<APIResponse<VideoStreamEndpoint[]>>('/video-stream-endpoints', { params });
    return response.data.data;
  },
  getById: async (id: number): Promise<VideoStreamEndpoint> => {
    const response = await api.get<APIResponse<VideoStreamEndpoint>>(`/video-stream-endpoints/${id}`);
    return response.data.data;
  },
  create: async (data: {
    provider_id: number;
    line_id: number;
    domain_id: number;
    stream_id: number;
    stream_path_id: number;
    status?: number;
  }): Promise<VideoStreamEndpoint> => {
    const response = await api.post<APIResponse<VideoStreamEndpoint>>('/video-stream-endpoints', data);
    return response.data.data;
  },
  update: async (id: number, data: {
    provider_id: number;
    line_id: number;
    domain_id: number;
    stream_id: number;
    stream_path_id: number;
    status?: number;
  }): Promise<VideoStreamEndpoint> => {
    const response = await api.put<APIResponse<VideoStreamEndpoint>>(`/video-stream-endpoints/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete<APIResponse<null>>(`/video-stream-endpoints/${id}`);
  },
  updateStatus: async (id: number, status: number): Promise<void> => {
    await api.patch<APIResponse<null>>(`/video-stream-endpoints/${id}/status`, { status });
  },
  generateAll: async (): Promise<{ message: string; count: number }> => {
    const response = await api.post<APIResponse<{ message: string; count: number }>>('/video-stream-endpoints/generate');
    return response.data.data;
  },
  testResolution: async (id: number): Promise<{ resolution: string; message: string }> => {
    const response = await api.post<APIResponse<{ resolution: string; message: string }>>(`/video-stream-endpoints/${id}/test-resolution`);
    return response.data.data;
  },
};

export const authAPI = {
  login: async (username: string, password: string): Promise<{
    token: string;
    username: string;
    is_admin: boolean;
  }> => {
    const response = await api.post<APIResponse<{
      token: string;
      username: string;
      is_admin: boolean;
    }>>('/auth/login', { username, password });
    return response.data.data;
  },
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post<APIResponse<null>>('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
  getCurrentUser: async (): Promise<{
    id: number;
    username: string;
    is_admin: boolean;
  }> => {
    const response = await api.get<APIResponse<{
      id: number;
      username: string;
      is_admin: boolean;
    }>>('/auth/me');
    return response.data.data;
  },
  getTokens: async (): Promise<Token[]> => {
    const response = await api.get<APIResponse<Token[]>>('/auth/tokens');
    return response.data.data;
  },
  getTokenInfo: async (): Promise<{
    user_id: number;
    username: string;
    is_admin: boolean;
    issued_at: string;
    expires_at: string;
    expires_in: number;
    issuer: string;
    subject: string;
  }> => {
    const response = await api.get<APIResponse<{
      user_id: number;
      username: string;
      is_admin: boolean;
      issued_at: string;
      expires_at: string;
      expires_in: number;
      issuer: string;
      subject: string;
    }>>('/auth/token-info');
    return response.data.data;
  },
  createToken: async (name: string, neverExpire: boolean, expiresIn?: number): Promise<{
    token: string;
    username: string;
    is_admin: boolean;
    name: string;
    never_expire: boolean;
  }> => {
    const response = await api.post<APIResponse<{
      token: string;
      username: string;
      is_admin: boolean;
      name: string;
      never_expire: boolean;
    }>>('/auth/tokens', {
      name,
      never_expire: neverExpire,
      expires_in: expiresIn,
    });
    return response.data.data;
  },
  deleteToken: async (id: number): Promise<void> => {
    await api.delete(`/auth/tokens/${id}`);
  },
};

export const statsAPI = {
  getStats: async (): Promise<{
    providers: number;
    lines: number;
    domains: number;
    streams: number;
    stream_paths: number;
    endpoints: number;
    endpoints_enabled: number;
    endpoints_disabled: number;
    lines_by_provider: Array<{
      provider_id: number;
      provider_name: string;
      line_count: number;
    }>;
    endpoints_by_stream: Array<{
      stream_id: number;
      stream_name: string;
      stream_code: string;
      endpoint_count: number;
    }>;
    endpoints_by_domain: Array<{
      domain_id: number;
      domain_name: string;
      endpoint_count: number;
    }>;
  }> => {
    const response = await api.get<APIResponse<any>>('/stats');
    return response.data.data;
  },
};

