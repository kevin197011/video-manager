// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { useState, useEffect, useMemo } from 'react';
import { Card, Statistic, Row, Col, Table, Spin, message, Switch, Space, Typography, Tag, Progress } from 'antd';
import {
  CloudServerOutlined,
  LinkOutlined,
  GlobalOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { statsAPI } from '../lib/api';

const { Title, Text } = Typography;

interface Stats {
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
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadStats();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsAPI.getStats();
      setStats(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const providerColumns: ColumnsType<Stats['lines_by_provider'][0]> = [
    {
      title: '厂商名称',
      dataIndex: 'provider_name',
      key: 'provider_name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '线路数量',
      dataIndex: 'line_count',
      key: 'line_count',
      sorter: (a, b) => a.line_count - b.line_count,
      render: (count: number) => {
        const total = stats?.lines || 1;
        const percentage = Math.round((count / total) * 100);
        return (
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
              {count}
            </Tag>
            <Progress percent={percentage} size="small" showInfo={false} strokeColor="#1890ff" />
          </Space>
        );
      },
    },
  ];

  const streamColumns: ColumnsType<Stats['endpoints_by_stream'][0]> = [
    {
      title: '视频流区域',
      key: 'stream',
      render: (_, record) => (
        <Text strong>{record.stream_name}</Text>
      ),
    },
    {
      title: '端点数量',
      dataIndex: 'endpoint_count',
      key: 'endpoint_count',
      sorter: (a, b) => a.endpoint_count - b.endpoint_count,
      render: (count: number) => {
        const total = stats?.endpoints || 1;
        const percentage = Math.round((count / total) * 100);
        return (
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
              {count}
            </Tag>
            <Progress percent={percentage} size="small" showInfo={false} strokeColor="#52c41a" />
          </Space>
        );
      },
    },
  ];

  const domainColumns: ColumnsType<Stats['endpoints_by_domain'][0]> = [
    {
      title: '域名',
      dataIndex: 'domain_name',
      key: 'domain_name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '端点数量',
      dataIndex: 'endpoint_count',
      key: 'endpoint_count',
      sorter: (a, b) => a.endpoint_count - b.endpoint_count,
      render: (count: number) => (
        <Tag color="cyan" style={{ fontSize: '14px', padding: '4px 12px' }}>
          {count}
        </Tag>
      ),
    },
  ];

  const enabledPercentage = useMemo(() => {
    if (!stats || stats.endpoints === 0) return 0;
    return Math.round((stats.endpoints_enabled / stats.endpoints) * 100);
  }, [stats]);

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">正在加载仪表板数据...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          仪表板
        </Title>
        <Space>
          <Space>
            <Text type="secondary">自动刷新：</Text>
            <Switch checked={autoRefresh} onChange={setAutoRefresh} />
          </Space>
          <Space>
            <Text type="secondary">间隔：</Text>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
              disabled={!autoRefresh}
            >
              <option value={10}>10秒</option>
              <option value={30}>30秒</option>
              <option value={60}>60秒</option>
              <option value={120}>2分钟</option>
            </select>
          </Space>
          <Space>
            <ClockCircleOutlined style={{ color: autoRefresh ? '#52c41a' : '#d9d9d9' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {autoRefresh ? `每 ${refreshInterval} 秒刷新一次` : '自动刷新已禁用'}
            </Text>
          </Space>
          <button
            onClick={loadStats}
            style={{
              padding: '4px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ReloadOutlined spin={loading} />
            刷新
          </button>
        </Space>
      </div>

      {/* Main Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>CDN 厂商</span>}
              value={stats?.providers || 0}
              prefix={<CloudServerOutlined style={{ color: '#fff' }} />}
              styles={{ content: { color: '#fff', fontSize: '32px', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>CDN 线路</span>}
              value={stats?.lines || 0}
              prefix={<LinkOutlined style={{ color: '#fff' }} />}
              styles={{ content: { color: '#fff', fontSize: '32px', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>域名</span>}
              value={stats?.domains || 0}
              prefix={<GlobalOutlined style={{ color: '#fff' }} />}
              styles={{ content: { color: '#fff', fontSize: '32px', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              border: 'none',
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>视频流区域</span>}
              value={stats?.streams || 0}
              prefix={<PlayCircleOutlined style={{ color: '#fff' }} />}
              styles={{ content: { color: '#fff', fontSize: '32px', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              border: 'none',
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>流路径</span>}
              value={stats?.stream_paths || 0}
              prefix={<FileTextOutlined style={{ color: '#fff' }} />}
              styles={{ content: { color: '#fff', fontSize: '32px', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
              border: 'none',
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>端点总数</span>}
              value={stats?.endpoints || 0}
              prefix={<ApiOutlined style={{ color: '#fff' }} />}
              styles={{ content: { color: '#fff', fontSize: '32px', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Endpoint Status Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
              border: 'none',
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>已启用端点</span>}
              value={stats?.endpoints_enabled || 0}
              prefix={<CheckCircleOutlined style={{ color: '#fff' }} />}
              styles={{ content: { color: '#fff', fontSize: '32px', fontWeight: 'bold' } }}
            />
            <Progress
              percent={enabledPercentage}
              strokeColor="#fff"
              showInfo={false}
              style={{ marginTop: 12 }}
            />
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', marginTop: 8, display: 'block' }}>
              占全部端点的 {enabledPercentage}%
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card
            hoverable
            style={{
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              border: 'none',
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>已禁用端点</span>}
              value={stats?.endpoints_disabled || 0}
              prefix={<CloseCircleOutlined style={{ color: '#fff' }} />}
              styles={{ content: { color: '#fff', fontSize: '32px', fontWeight: 'bold' } }}
            />
            <Progress
              percent={100 - enabledPercentage}
              strokeColor="#fff"
              showInfo={false}
              style={{ marginTop: 12 }}
            />
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', marginTop: 8, display: 'block' }}>
              占全部端点的 {100 - enabledPercentage}%
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ display: 'flex', alignItems: 'stretch' }}>
        <Col xs={24} lg={12} style={{ display: 'flex' }}>
          <Card
            title={
              <Space>
                <CloudServerOutlined style={{ color: '#667eea' }} />
                <Text strong>按厂商统计线路</Text>
              </Space>
            }
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '400px' } }}
          >
            <Table
              columns={providerColumns}
              dataSource={stats?.lines_by_provider || []}
              rowKey="provider_id"
              pagination={false}
              size="small"
              loading={loading}
              style={{ flex: 1 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12} style={{ display: 'flex' }}>
          <Card
            title={
              <Space>
                <PlayCircleOutlined style={{ color: '#43e97b' }} />
                <Text strong>按视频流区域统计端点</Text>
              </Space>
            }
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '400px' } }}
          >
            <Table
              columns={streamColumns}
              dataSource={stats?.endpoints_by_stream || []}
              rowKey="stream_id"
              pagination={false}
              size="small"
              loading={loading}
              style={{ flex: 1 }}
            />
          </Card>
        </Col>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <GlobalOutlined style={{ color: '#4facfe' }} />
                <Text strong>按域名统计端点</Text>
              </Space>
            }
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <Table
              columns={domainColumns}
              dataSource={stats?.endpoints_by_domain || []}
              rowKey="domain_id"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
