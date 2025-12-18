// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Table, Space, Select, message, Input, Card, Statistic, Row, Col, Modal, Descriptions, Tag, Switch } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined, ExportOutlined, PlayCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { videoStreamEndpointAPI, lineAPI, domainAPI, streamAPI, providerAPI } from '../lib/api';
import type { VideoStreamEndpoint, CDNLine, Domain, Stream, CDNProvider } from '../lib/api';
import flvjs from 'flv.js';

const { Search } = Input;

export default function VideoStreamEndpointsPage() {
  const [endpoints, setEndpoints] = useState<VideoStreamEndpoint[]>([]);
  const [filteredEndpoints, setFilteredEndpoints] = useState<VideoStreamEndpoint[]>([]);
  const [lines, setLines] = useState<CDNLine[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [providers, setProviders] = useState<CDNProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingEndpoint, setViewingEndpoint] = useState<VideoStreamEndpoint | null>(null);
  const [playingEndpoint, setPlayingEndpoint] = useState<VideoStreamEndpoint | null>(null);
  const [playModalVisible, setPlayModalVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const flvPlayerRef = useRef<flvjs.Player | null>(null);
  const [filterLineId, setFilterLineId] = useState<number | undefined>(undefined);
  const [filterDomainId, setFilterDomainId] = useState<number | undefined>(undefined);
  const [filterStreamId, setFilterStreamId] = useState<number | undefined>(undefined);
  const [filterProviderId, setFilterProviderId] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);
  const [filterTableId, setFilterTableId] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    load全部Data();
  }, []);

  useEffect(() => {
    loadEndpoints();
  }, [filterLineId, filterDomainId, filterStreamId, filterProviderId, filterStatus]);

  useEffect(() => {
    filterEndpoints();
  }, [searchText, endpoints, filterTableId]);

  const load全部Data = async () => {
    try {
      const [linesData, domainsData, streamsData, providersData] = await Promise.all([
        lineAPI.getAll(),
        domainAPI.getAll(),
        streamAPI.getAll(),
        providerAPI.getAll(),
      ]);
      setLines(linesData || []);
      setDomains(domainsData || []);
      setStreams(streamsData || []);
      setProviders(providersData || []);
      await loadEndpoints();
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载失败 data');
      // Set empty arrays on error to prevent null errors
      setLines([]);
      setDomains([]);
      setStreams([]);
      setProviders([]);
    }
  };

  const loadEndpoints = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterLineId) filters.line_id = filterLineId;
      if (filterDomainId) filters.domain_id = filterDomainId;
      if (filterStreamId) filters.stream_id = filterStreamId;
      if (filterProviderId) filters.provider_id = filterProviderId;
      if (filterStatus !== undefined) filters.status = filterStatus;

      const data = await videoStreamEndpointAPI.getAll(Object.keys(filters).length > 0 ? filters : undefined);
      setEndpoints(data || []);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载失败 endpoints');
      setEndpoints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      // 先调用 GenerateAll 重新生成所有 endpoints
      const result = await videoStreamEndpointAPI.generateAll();
      message.success(`已重新生成 ${result.count} 个端点`);
      // 然后刷新列表
      await loadEndpoints();
    } catch (err: any) {
      message.error(err.response?.data?.message || '重新生成端点失败');
      // 即使生成失败，也尝试加载现有数据
      await loadEndpoints();
    } finally {
      setLoading(false);
    }
  };

  const filterEndpoints = () => {
    const endpointsList = endpoints || [];
    let filtered = endpointsList;

    if (searchText.trim()) {
      filtered = filtered.filter(
        (endpoint) =>
          endpoint.full_url.toLowerCase().includes(searchText.toLowerCase()) ||
          endpoint.provider?.name.toLowerCase().includes(searchText.toLowerCase()) ||
          endpoint.provider?.code.toLowerCase().includes(searchText.toLowerCase()) ||
          endpoint.line?.name.toLowerCase().includes(searchText.toLowerCase()) ||
          endpoint.domain?.name.toLowerCase().includes(searchText.toLowerCase()) ||
          endpoint.stream?.name.toLowerCase().includes(searchText.toLowerCase()) ||
          endpoint.stream_path?.table_id?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterTableId) {
      filtered = filtered.filter(
        (endpoint) => endpoint.stream_path?.table_id === filterTableId
      );
    }

    setFilteredEndpoints(filtered);
  };


  const handleView = async (id: number) => {
    try {
      const endpoint = await videoStreamEndpointAPI.getById(id);
      setViewingEndpoint(endpoint);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载失败 endpoint details');
    }
  };

  const handlePlay = async (id: number) => {
    try {
      const endpoint = await videoStreamEndpointAPI.getById(id);
      if (!endpoint.full_url) {
        message.error('该端点没有有效的 URL');
        return;
      }
      setPlayingEndpoint(endpoint);
      setPlayModalVisible(true);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载失败 endpoint details');
    }
  };

  const handleClosePlayModal = () => {
    setPlayModalVisible(false);
    // 清理 FLV 播放器
    if (flvPlayerRef.current) {
      flvPlayerRef.current.pause();
      flvPlayerRef.current.unload();
      flvPlayerRef.current.detachMediaElement();
      flvPlayerRef.current.destroy();
      flvPlayerRef.current = null;
    }
    setPlayingEndpoint(null);
  };

  // 初始化 FLV 播放器
  useEffect(() => {
    if (!playModalVisible || !playingEndpoint) {
      return;
    }

    // 等待 Modal 完全打开后再初始化播放器
    const timer = setTimeout(() => {
      if (!videoRef.current || !flvjs.isSupported()) {
        if (!flvjs.isSupported()) {
          console.warn('FLV.js is not supported in this browser');
        }
        return;
      }

      const videoElement = videoRef.current;

      // 清理之前的播放器
      if (flvPlayerRef.current) {
        try {
          flvPlayerRef.current.pause();
          flvPlayerRef.current.unload();
          flvPlayerRef.current.detachMediaElement();
          flvPlayerRef.current.destroy();
        } catch (e) {
          console.error('Error destroying previous player:', e);
        }
        flvPlayerRef.current = null;
      }

      try {
        const player = flvjs.createPlayer({
          type: 'flv',
          url: playingEndpoint.full_url,
          isLive: true,
        }, {
          enableWorker: false,
          enableStashBuffer: false,
          stashInitialSize: 128,
          autoCleanupSourceBuffer: true,
        });

        player.attachMediaElement(videoElement);
        player.load();

        // 尝试自动播放
        const playPromise = player.play();
        if (playPromise !== undefined) {
          playPromise.catch((err: any) => {
            console.error('Play error:', err);
            message.warning('自动播放失败，请手动点击播放按钮');
          });
        }

        flvPlayerRef.current = player;

        // 错误处理
        player.on(flvjs.Events.ERROR, (errorType: any, errorDetail: any, errorInfo: any) => {
          console.error('FLV Player Error:', errorType, errorDetail, errorInfo);
          let errorMsg = '播放失败';
          if (errorType === flvjs.ErrorTypes.NETWORK_ERROR) {
            errorMsg = '网络错误，请检查流地址是否可访问';
          } else if (errorType === flvjs.ErrorTypes.MEDIA_ERROR) {
            errorMsg = '媒体格式错误，请检查流格式是否正确';
          }
          message.error(errorMsg);
        });

        // 监听加载完成
        player.on(flvjs.Events.LOADING_COMPLETE, () => {
          console.log('FLV stream loaded');
        });
      } catch (err) {
        console.error('Error creating FLV player:', err);
        message.error('创建播放器失败：' + (err instanceof Error ? err.message : String(err)));
      }
    }, 300); // 延迟 300ms 确保 DOM 已渲染

    return () => {
      clearTimeout(timer);
      if (flvPlayerRef.current) {
        try {
          flvPlayerRef.current.pause();
          flvPlayerRef.current.unload();
          flvPlayerRef.current.detachMediaElement();
          flvPlayerRef.current.destroy();
        } catch (e) {
          console.error('Error cleaning up player:', e);
        }
        flvPlayerRef.current = null;
      }
    };
  }, [playModalVisible, playingEndpoint]);


  const handleToggle状态 = async (id: number, current状态: number) => {
    try {
      const newStatus = current状态 === 1 ? 0 : 1;
      await videoStreamEndpointAPI.updateStatus(id, newStatus);
      message.success(`Endpoint ${newStatus === 1 ? 'enabled' : 'disabled'} successfully`);
      await loadEndpoints();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update status');
    }
  };


  const handleExport = () => {
    const csvContent = [
      ['编号', '完整URL', '厂商', '线路', '域名', '流区域', '桌台号', '路径', '状态', '创建时间'].join(','),
      ...(filteredEndpoints || []).map((e) =>
        [
          e.id,
          `"${e.full_url}"`,
          `"${e.provider?.name || 'Unknown'}"`,
          `"${e.line?.name || 'Unknown'}"`,
          `"${e.domain?.name || 'Unknown'}"`,
          `"${e.stream?.name || 'Unknown'}"`,
          `"${e.stream_path?.table_id || 'N/A'}"`,
          `"${e.stream_path?.full_path || 'Unknown'}"`,
          e.status === 1 ? '已启用' : '已禁用',
          new Date(e.created_at).toISOString(),
        ].join(',')
      ),
    ].join('\n');

    // Add UTF-8 BOM to fix Chinese character encoding issues in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `video-stream-endpoints-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Data 导出成功');
  };

  // Calculate unique table IDs for filters
  const tableIdFilters = useMemo(() => {
    const tableIds = new Set<string>();
    (endpoints || []).forEach((e) => {
      if (e.stream_path?.table_id) {
        tableIds.add(e.stream_path.table_id);
      }
    });
    return Array.from(tableIds).sort().map((id) => ({ text: id, value: id }));
  }, [endpoints]);

  const columns: ColumnsType<VideoStreamEndpoint> = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: '完整URL',
      dataIndex: 'full_url',
      key: 'full_url',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
      ellipsis: true,
    },
    {
      title: '厂商',
      key: 'provider',
      render: (_, record) => record.provider?.name || 'Unknown',
      filters: (providers || []).map((p) => ({ text: p.name, value: p.id })),
      onFilter: (value, record) => record.provider_id === value,
    },
    {
      title: '线路',
      key: 'line',
      render: (_, record) => record.line?.name || 'Unknown',
      filters: (lines || []).map((l) => ({ text: l.name, value: l.id })),
      onFilter: (value, record) => record.line_id === value,
    },
    {
      title: '域名',
      key: 'domain',
      render: (_, record) => record.domain?.name || 'Unknown',
      filters: (domains || []).map((d) => ({ text: d.name, value: d.id })),
      onFilter: (value, record) => record.domain_id === value,
    },
    {
      title: '视频流区域',
      key: 'stream',
      render: (_, record) => record.stream?.name || 'Unknown',
      filters: (streams || []).map((s) => ({ text: s.name, value: s.id })),
      onFilter: (value, record) => record.stream_id === value,
    },
    {
      title: '桌台号',
      key: 'table_id',
      render: (_, record) => record.stream_path?.table_id || 'N/A',
      filters: tableIdFilters,
      onFilter: (value, record) => record.stream_path?.table_id === value,
    },
    {
      title: '路径',
      key: 'path',
      render: (_, record) => record.stream_path?.full_path || 'Unknown',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '已启用' : '已禁用'}
        </Tag>
      ),
      filters: [
        { text: '已启用', value: 1 },
        { text: '已禁用', value: 0 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
            size="small"
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => handlePlay(record.id)}
            disabled={record.status === 0}
            size="small"
          >
            播放
          </Button>
          <Switch
            checked={record.status === 1}
            onChange={() => handleToggle状态(record.id, record.status)}
            size="small"
          />
        </Space>
      ),
    },
  ], [lines, domains, streams, providers, tableIdFilters]);

  const stats = useMemo(() => {
    const endpointsList = endpoints || [];
    const filteredList = filteredEndpoints || [];
    return {
      total: endpointsList.length,
      filtered: filteredList.length,
      enabled: endpointsList.filter((e) => e.status === 1).length,
      disabled: endpointsList.filter((e) => e.status === 0).length,
    };
  }, [endpoints, filteredEndpoints]);

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="端点总数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="筛选结果" value={stats.filtered} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已启用" value={stats.enabled} styles={{ content: { color: '#3f8600' } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已禁用" value={stats.disabled} styles={{ content: { color: '#cf1322' } }} />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>视频流端点</h2>
        <Space>
          <Search
            placeholder="搜索 URL、厂商、线路、域名或视频流区域"
            allowClear
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="筛选厂商"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilterProviderId(value)}
            value={filterProviderId}
          >
            {(providers || []).map((provider) => (
              <Select.Option key={provider.id} value={provider.id}>
                {provider.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="筛选厂商线路"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilterLineId(value)}
            value={filterLineId}
          >
            {(lines || []).map((line) => (
              <Select.Option key={line.id} value={line.id}>
                {line.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="筛选 Domain"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilterDomainId(value)}
            value={filterDomainId}
          >
            {(domains || []).map((domain) => (
              <Select.Option key={domain.id} value={domain.id}>
                {domain.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="筛选视频流区域"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilterStreamId(value)}
            value={filterStreamId}
          >
            {(streams || []).map((stream) => (
              <Select.Option key={stream.id} value={stream.id}>
                {stream.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="筛选 状态"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => setFilterStatus(value)}
            value={filterStatus}
          >
            <Select.Option value={1}>已启用</Select.Option>
            <Select.Option value={0}>已禁用</Select.Option>
          </Select>
          <Select
            placeholder="筛选桌台号"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilterTableId(value)}
            value={filterTableId}
          >
            {tableIdFilters.map((filter) => (
              <Select.Option key={filter.value} value={filter.value}>
                {filter.text}
              </Select.Option>
            ))}
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
            disabled={(filteredEndpoints || []).length === 0}
          >
            导出
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredEndpoints || []}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 个端点`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, size) => {
            setPagination({ current: page, pageSize: size });
          },
          onShowSizeChange: (_current, size) => {
            setPagination({ current: 1, pageSize: size });
          },
        }}
        scroll={{ x: 'max-content' }}
      />


      <Modal
        title="端点详情"
        open={viewingEndpoint !== null}
        onCancel={() => setViewingEndpoint(null)}
        footer={[
          <Button key="close" onClick={() => setViewingEndpoint(null)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {viewingEndpoint && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{viewingEndpoint.id}</Descriptions.Item>
            <Descriptions.Item label="完整URL">
              <a href={viewingEndpoint.full_url} target="_blank" rel="noopener noreferrer">
                {viewingEndpoint.full_url}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="厂商">
              {viewingEndpoint.provider?.name || 'Unknown'} ({viewingEndpoint.provider?.code || 'N/A'})
            </Descriptions.Item>
            <Descriptions.Item label="Line">
              {viewingEndpoint.line?.name || 'Unknown'} ({viewingEndpoint.line?.code || 'N/A'})
            </Descriptions.Item>
            <Descriptions.Item label="域名">{viewingEndpoint.domain?.name || 'Unknown'}</Descriptions.Item>
            <Descriptions.Item label="视频流区域">
              {viewingEndpoint.stream?.name || 'Unknown'} ({viewingEndpoint.stream?.code || 'N/A'})
            </Descriptions.Item>
            <Descriptions.Item label="Stream Path">
              {viewingEndpoint.stream_path?.full_path || 'Unknown'} ({viewingEndpoint.stream_path?.table_id || 'N/A'})
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={viewingEndpoint.status === 1 ? 'green' : 'red'}>
                {viewingEndpoint.status === 1 ? '已启用' : '已禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(viewingEndpoint.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(viewingEndpoint.updated_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 播放弹窗 */}
      <Modal
        title={`播放视频流区域 - ${playingEndpoint?.stream?.name || 'Unknown'}`}
        open={playModalVisible}
        onCancel={handleClosePlayModal}
        footer={[
          <Button key="close" onClick={handleClosePlayModal}>
            关闭
          </Button>,
        ]}
        width={800}
        afterOpenChange={(open) => {
          if (!open) {
            // Modal 关闭时清理播放器
            if (flvPlayerRef.current) {
              try {
                flvPlayerRef.current.pause();
                flvPlayerRef.current.unload();
                flvPlayerRef.current.detachMediaElement();
                flvPlayerRef.current.destroy();
              } catch (e) {
                console.error('Error destroying player on close:', e);
              }
              flvPlayerRef.current = null;
            }
          }
        }}
      >
        {playingEndpoint && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="URL">
                <a href={playingEndpoint.full_url} target="_blank" rel="noopener noreferrer">
                  {playingEndpoint.full_url}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="厂商">
                {playingEndpoint.provider?.name || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="线路">
                {playingEndpoint.line?.name || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="域名">
                {playingEndpoint.domain?.name || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="视频流区域">
                {playingEndpoint.stream?.name || 'Unknown'}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              {flvjs.isSupported() ? (
                <video
                  ref={videoRef}
                  controls
                  muted
                  style={{ width: '100%', maxHeight: '500px', backgroundColor: '#000', minHeight: '300px' }}
                  playsInline
                />
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  <p>您的浏览器不支持 FLV 播放</p>
                  <p>请使用 Chrome、Firefox 或 Edge 浏览器</p>
                  <p style={{ marginTop: 16 }}>
                    <a href={playingEndpoint.full_url} target="_blank" rel="noopener noreferrer">
                      点击这里在新窗口打开
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

