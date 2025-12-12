// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { useState, useEffect, useMemo } from 'react';
import { Button, Table, Space, Select, message, Popconfirm, Input, Card, Statistic, Row, Col, Modal, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, ExportOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { lineAPI, providerAPI } from '../lib/api';
import type { CDNLine, CDNProvider } from '../lib/api';
import LineForm from '../components/LineForm';

const { Search } = Input;

export default function LinesPage() {
  const [lines, setLines] = useState<CDNLine[]>([]);
  const [filteredLines, setFilteredLines] = useState<CDNLine[]>([]);
  const [providers, setProviders] = useState<CDNProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLine, setEditingLine] = useState<CDNLine | null>(null);
  const [viewingLine, setViewingLine] = useState<CDNLine | null>(null);
  const [filterProviderId, setFilterProviderId] = useState<number | undefined>(undefined);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    loadProviders();
    loadLines();
  }, []);

  useEffect(() => {
    loadLines();
  }, [filterProviderId]);

  useEffect(() => {
    filterLines();
  }, [searchText, lines]);

  const loadProviders = async () => {
    try {
      const data = await providerAPI.getAll();
      setProviders(data || []);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载失败 providers');
      setProviders([]);
    }
  };

  const loadLines = async () => {
    try {
      setLoading(true);
      const data = await lineAPI.getAll(filterProviderId);
      setLines(data || []);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载失败 lines');
      setLines([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLines = () => {
    let filtered = lines || [];

    if (searchText.trim()) {
      filtered = filtered.filter(
        (line) =>
          line.name.toLowerCase().includes(searchText.toLowerCase()) ||
          line.display_name.toLowerCase().includes(searchText.toLowerCase()) ||
          line.provider?.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredLines(filtered);
  };

  const handleCreate = () => {
    setEditingLine(null);
    setShowForm(true);
  };

  const handleEdit = (line: CDNLine) => {
    setEditingLine(line);
    setShowForm(true);
  };

  const handleView = async (id: number) => {
    try {
      const line = await lineAPI.getById(id);
      setViewingLine(line);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载失败 line details');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await lineAPI.delete(id);
      message.success('Line 删除成功');
      await loadLines();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || '删除失败 line';
      message.error(errorMsg);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一条线路');
      return;
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const key of selectedRowKeys) {
      try {
        await lineAPI.delete(Number(key));
        successCount++;
      } catch (err: any) {
        failCount++;
        const errorMsg = err.response?.data?.message || '删除失败';
        errors.push(`ID ${key}: ${errorMsg}`);
      }
    }

    if (successCount > 0) {
      message.success(`成功删除 ${successCount} 条线路`);
    }
    if (failCount > 0) {
      message.error(`删除失败 ${failCount} 条线路：${errors.join('; ')}`);
    }

    setSelectedRowKeys([]);
    await loadLines();
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingLine(null);
    await loadLines();
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Display Name', 'Name', 'Provider', 'Created At', '更新时间'].join(','),
      ...filteredLines.map((l) =>
        [
          l.id,
          `"${l.display_name}"`,
          `"${l.name}"`,
          `"${l.provider?.name || 'Unknown'}"`,
          new Date(l.created_at).toISOString(),
          new Date(l.updated_at).toISOString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cdn-lines-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Data 导出成功');
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  const columns: ColumnsType<CDNLine> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: '显示名称',
      dataIndex: 'display_name',
      key: 'display_name',
      sorter: (a, b) => a.display_name.localeCompare(b.display_name),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '厂商',
      key: 'provider',
      render: (_, record) => record.provider?.name || 'Unknown',
      filters: providers.map((p) => ({ text: p.name, value: p.id })),
      onFilter: (value, record) => record.provider_id === value,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除线路"
            description={`确定要删除 "${record.display_name}" (${record.name})?`}
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = useMemo(() => {
    return {
      total: lines.length,
      filtered: filteredLines.length,
      byProvider: filterProviderId
        ? lines.filter((l) => l.provider_id === filterProviderId).length
        : undefined,
    };
  }, [lines.length, filteredLines.length, filterProviderId, lines]);

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="线路总数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="筛选结果" value={stats.filtered} />
          </Card>
        </Col>
        {stats.byProvider !== undefined && (
          <Col span={6}>
            <Card>
              <Statistic title="Filtered by Provider" value={stats.byProvider} />
            </Card>
          </Col>
        )}
      </Row>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>CDN 线路</h2>
        <Space>
          <Search
            placeholder="搜索 name, display name or provider"
            allowClear
            style={{ width: 280 }}
            prefix={<SearchOutlined />}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="筛选 Provider"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => setFilterProviderId(value)}
            value={filterProviderId}
          >
            {providers.map((provider) => (
              <Select.Option key={provider.id} value={provider.id}>
                {provider.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadLines}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
            disabled={filteredLines.length === 0}
          >
            导出
          </Button>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`删除 ${selectedRowKeys.length} 线路?`}
              description="此操作无法撤销."
              onConfirm={handleBatchDelete}
              okText="是"
              cancelText="否"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />}>
                删除 Selected ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            创建 Line
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredLines || []}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条线路`,
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

      {showForm && (
        <LineForm
          line={editingLine}
          providers={providers}
          lines={lines}
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingLine(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      <Modal
        title="线路详情"
        open={viewingLine !== null}
        onCancel={() => setViewingLine(null)}
        footer={[
          <Button key="close" onClick={() => setViewingLine(null)}>
            关闭
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              if (viewingLine) {
                setViewingLine(null);
                handleEdit(viewingLine);
              }
            }}
          >
            编辑
          </Button>,
        ]}
        width={600}
      >
        {viewingLine && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{viewingLine.id}</Descriptions.Item>
            <Descriptions.Item label="显示名称">{viewingLine.display_name}</Descriptions.Item>
            <Descriptions.Item label="名称">{viewingLine.name}</Descriptions.Item>
            <Descriptions.Item label="厂商">
              {viewingLine.provider?.name || 'Unknown'} ({viewingLine.provider?.code || 'N/A'})
            </Descriptions.Item>
            <Descriptions.Item label="Provider ID">{viewingLine.provider_id}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(viewingLine.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(viewingLine.updated_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
