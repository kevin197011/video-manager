// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { domainAPI } from '../lib/api';
import type { Domain } from '../lib/api';

interface DomainFormProps {
  domain: Domain | null;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function DomainForm({ domain, open, onClose, onSubmit }: DomainFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (domain) {
        form.setFieldsValue({
          name: domain.name,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, domain, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (domain) {
        await domainAPI.update(domain.id, values);
        message.success('Domain 更新成功');
      } else {
        await domainAPI.create(values);
        message.success('Domain 创建成功');
      }

      onSubmit();
      onClose();
    } catch (err: any) {
      if (err.errorFields) {
        // Form validation errors
        return;
      }
      message.error(err.response?.data?.message || '保存失败 domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={domain ? '编辑 Domain' : '创建 Domain'}
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
          label="域名"
          rules={[
            { required: true, message: '请输入域名' },
            { min: 1, message: '域名不能为空' },
            { max: 255, message: '域名不能超过255个字符' },
            { whitespace: true, message: '域名不能仅为空白字符' },
            { pattern: /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/, message: '请输入有效的域名' },
          ]}
        >
          <Input placeholder="输入 domain name (e.g., a.com)" showCount maxLength={255} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

