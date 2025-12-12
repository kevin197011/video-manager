// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { streamAPI } from '../lib/api';
import type { Stream } from '../lib/api';

interface StreamFormProps {
  stream: Stream | null;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function StreamForm({ stream, open, onClose, onSubmit }: StreamFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (stream) {
        form.setFieldsValue({
          name: stream.name,
          code: stream.code,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, stream, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (stream) {
        await streamAPI.update(stream.id, values);
        message.success('视频流区域更新成功');
      } else {
        await streamAPI.create(values);
        message.success('视频流区域创建成功');
      }

      onSubmit();
      onClose();
    } catch (err: any) {
      if (err.errorFields) {
        // Form validation errors
        return;
      }
      message.error(err.response?.data?.message || '保存失败视频流区域');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={stream ? '编辑视频流区域' : '创建视频流区域'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText="保存"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="名称"
          rules={[
            { required: true, message: '请输入视频流区域名称' },
            { min: 1, message: '名称不能为空' },
            { max: 255, message: '名称不能超过255个字符' },
            { whitespace: true, message: '名称不能仅为空白字符' },
          ]}
        >
          <Input placeholder="输入 stream name (e.g., Asia Region)" showCount maxLength={255} />
        </Form.Item>

        <Form.Item
          name="code"
          label="代码"
          rules={[
            { required: true, message: '请输入视频流区域代码' },
            { min: 1, message: '代码不能为空' },
            { max: 100, message: '代码不能超过100个字符' },
            { pattern: /^[a-zA-Z0-9_-]+$/, message: '代码只能包含字母、数字、下划线和连字符' },
            { whitespace: true, message: '代码不能仅为空白字符' },
          ]}
        >
          <Input placeholder="输入 stream code (e.g., kkw, eu2, eu3)" showCount maxLength={100} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

