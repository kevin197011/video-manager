// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Table, Space, Select, message, Popconfirm, Input, Card, Statistic, Row, Col, Modal, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, ExportOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { streamPathAPI, streamAPI } from '../lib/api';
import type { StreamPath, Stream } from '../lib/api';
import StreamPathForm from '../components/StreamPathForm';

const { Search } = Input;

export default function StreamPathsPage() {
  const [paths, setPaths] = useState<StreamPath[]>([]);
  const [filteredPaths, setFilteredPaths] = useState<StreamPath[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPath, setEditingPath] = useState<StreamPath | null>(null);
  const [viewingPath, setViewingPath] = useState<StreamPath | null>(null);
  const [filterStreamId, setFilterStreamId] = useState<number | undefined>(undefined);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    loadStreams();
    loadPaths();
  }, []);

  const loadPaths = useCallback(async () => {
    try {
      setLoading(true);
      const data = await streamPathAPI.getAll(filterStreamId);
      setPaths(data || []);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载失败 stream paths');
      setPaths([]);
    } finally {
      setLoading(false);
    }
  }, [filterStreamId]);

  useEffect(() => {
    loadPaths();
  }, [loadPaths]);

  useEffect(() => {
    filterPaths();
  }, [searchText, paths]);

  const loadStreams = async () => {
    try {
      const data = await streamAPI.getAll();
      setStreams(data || []);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载失败 streams');
      setStreams([]);
    }
  };

  const filterPaths = () => {
    let filtered = paths || [];

    if (searchText.trim()) {
      filtered = filtered.filter(
        (path) =>
          path.table_id.toLowerCase().includes(searchText.toLowerCase()) ||
          path.full_path.toLowerCase().includes(searchText.toLowerCase()) ||
          path.stream?.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredPaths(filtered);
  };

  const handleCreate = () => {
    setEditingPath(null);
    setShowForm(true);
  };

  const handleEdit = useCallback((path: StreamPath) => {
    setEditingPath(path);
    setShowForm(true);
  }, []);

  const handleView = useCallback(async (id: number) => {
    try {
      const path = await streamPathAPI.getById(id);
      setViewingPath(path);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载失败 stream path details');
    }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    const loadPathsFn = async () => {
      try {
        setLoading(true);
        const data = await streamPathAPI.getAll(filterStreamId);
        setPaths(data || []);
      } catch (err: any) {
        message.error(err.response?.data?.message || '加载失败 stream paths');
        setPaths([]);
      } finally {
        setLoading(false);
      }
    };
    try {
      await streamPathAPI.delete(id);
      message.success('Stream path 删除成功');
      await loadPathsFn();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || '删除失败 stream path';
      message.error(errorMsg);
    }
  }, [filterStreamId]);

  const handleBatchDelete = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一个流路径');
      return;
    }

    const loadPathsFn = async () => {
      try {
        setLoading(true);
        const data = await streamPathAPI.getAll(filterStreamId);
        setPaths(data || []);
      } catch (err: any) {
        message.error(err.response?.data?.message || '加载失败 stream paths');
        setPaths([]);
      } finally {
        setLoading(false);
      }
    };

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const key of selectedRowKeys) {
      try {
        await streamPathAPI.delete(Number(key));
        successCount++;
      } catch (err: any) {
        failCount++;
        const errorMsg = err.response?.data?.message || '删除失败';
        errors.push(`ID ${key}: ${errorMsg}`);
      }
    }

    if (successCount > 0) {
      message.success(`成功删除 ${successCount} 个流路径`);
    }
    if (failCount > 0) {
      message.error(`删除失败 ${failCount} 个流路径：${errors.join('; ')}`);
    }

    setSelectedRowKeys([]);
    await loadPathsFn();
  }, [selectedRowKeys, filterStreamId]);

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingPath(null);
    await loadPaths();
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', '桌台号', 'Path', 'Stream', 'Created At', '更新时间'].join(','),
      ...filteredPaths.map((p) =>
        [
          p.id,
          `"${p.table_id}"`,
          `"${p.full_path}"`,
          `"${p.stream?.name || 'Unknown'}"`,
          new Date(p.created_at).toISOString(),
          new Date(p.updated_at).toISOString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stream-paths-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Data 导出成功');
  };

  const rowSelection = useMemo(() => ({
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  }), [selectedRowKeys]);

  const columns: ColumnsType<StreamPath> = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: '桌台号',
      dataIndex: 'table_id',
      key: 'table_id',
      sorter: (a, b) => a.table_id.localeCompare(b.table_id),
    },
    {
      title: '路径',
      dataIndex: 'full_path',
      key: 'full_path',
      sorter: (a, b) => a.full_path.localeCompare(b.full_path),
    },
    {
      title: '视频流区域',
      key: 'stream',
      render: (_, record) => record.stream?.name || 'Unknown',
      filters: (streams || []).map((s) => ({ text: s.name, value: s.id })),
      onFilter: (value, record) => record.stream_id === value,
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
            title="删除流路径"
            description={`确定要删除 "${record.table_id}" (${record.full_path})?`}
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
  ], [streams, handleView, handleEdit, handleDelete]);

  const stats = useMemo(() => {
    return {
      total: paths.length,
      filtered: filteredPaths.length,
      byStream: filterStreamId
        ? paths.filter((p) => p.stream_id === filterStreamId).length
        : undefined,
    };
  }, [paths.length, filteredPaths.length, filterStreamId, paths]);

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Paths" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="筛选结果" value={stats.filtered} />
          </Card>
        </Col>
        {stats.byStream !== undefined && (
          <Col span={6}>
            <Card>
              <Statistic title="按视频流区域筛选" value={stats.byStream} />
            </Card>
          </Col>
        )}
      </Row>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>流路径</h2>
        <Space>
          <Search
            placeholder="搜索桌台号、路径或视频流区域"
            allowClear
            style={{ width: 280 }}
            prefix={<SearchOutlined />}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="筛选视频流区域"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => setFilterStreamId(value)}
            value={filterStreamId}
          >
            {(streams || []).map((stream) => (
              <Select.Option key={stream.id} value={stream.id}>
                {stream.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadPaths}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
            disabled={filteredPaths.length === 0}
          >
            导出
          </Button>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`删除 ${selectedRowKeys.length} 流路径?`}
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
            创建 Path
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredPaths || []}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 个流路径`,
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
        <StreamPathForm
          path={editingPath}
          streams={streams}
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingPath(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      <Modal
        title="流路径详情"
        open={viewingPath !== null}
        onCancel={() => setViewingPath(null)}
        footer={[
          <Button key="close" onClick={() => setViewingPath(null)}>
            关闭
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              if (viewingPath) {
                setViewingPath(null);
                handleEdit(viewingPath);
              }
            }}
          >
            编辑
          </Button>,
        ]}
        width={600}
      >
        {viewingPath && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{viewingPath.id}</Descriptions.Item>
            <Descriptions.Item label="桌台号">{viewingPath.table_id}</Descriptions.Item>
            <Descriptions.Item label="路径">{viewingPath.full_path}</Descriptions.Item>
            <Descriptions.Item label="视频流区域">
              {viewingPath.stream?.name || 'Unknown'} ({viewingPath.stream?.code || 'N/A'})
            </Descriptions.Item>
            <Descriptions.Item label="Stream ID">{viewingPath.stream_id}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(viewingPath.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(viewingPath.updated_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

