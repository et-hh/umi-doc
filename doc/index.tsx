// @ts-nocheck
import { MailOutlined, CaretDownOutlined, CopyOutlined } from '@ant-design/icons'
import { Menu, Layout, Collapse, Tooltip, message, Table, Tag } from 'antd'
// todo import docs
// import AvatarGroupDoc, { avatarGroupDocInfo } from 'avatarGroup/avatarGroup.doc'
// import ZzDoc, { zzDocInfo } from 'avatarGroup/zz.doc'
import _get from 'lodash/fp/get'
import React, { useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism'
import './index.css'


const { SubMenu } = Menu
const { Panel } = Collapse
const { Header, Sider, Content } = Layout

// eslint-disable-next-line prefer-const
let components: any[] = []
// eslint-disable-next-line prefer-const
let componentsMap = new Map()
// todo components def
// const components = [
//   avatarGroupDocInfo, zzDocInfo
// ]
// const componentsMap = new Map()
// componentsMap.set(avatarGroupDocInfo, <AvatarGroupDoc />)
// componentsMap.set(zzDocInfo, <ZzDoc />)

const ImportStatement = ({ text }: { text: string }) => {
  return (
    <>
    <div
      style={{ fontSize: '16px', lineHeight: '22px', color: '#2E3846', fontWeight: 600 }}>引入组件</div>
      <SyntaxHighlighter customStyle={{ textAlign: 'left' }} language="javascript" style={coy}>
        {text}
      </SyntaxHighlighter></>
  )
}

export const getProps = (info: any, componentPath: any, componentName: any) => {
  // 先根据组件名搜索
  let componentInfo = info.find((it: any) => it.displayName?.replace(/^(.)(.*)$/, function(str, firstChar, others) {
    return firstChar.toLowerCase() + others
  }) === componentName)

  // 如果根据组件名搜索不到，再根据组件文件路径搜索
  if (!componentInfo) {
    componentInfo = info.find((it: any) => {
      const keys = Object.keys(it.props)
      if (it.props[keys[0]].parent) {
        return componentPath && it.props[keys[0]].parent.fileName.split('src')[1] === componentPath
      } else {
        return componentPath && it.props[keys[0]].declarations[0]?.fileName.split('src')[1] === componentPath
      }
    })
  }

  const props = componentInfo ? componentInfo.props : {}
  const rs: any[] = []
  Object.keys(props).forEach((name, index) => {
    const prop = props[name]
    rs.push({
      key: index + 1,
      name,
      description: prop.description,
      type: prop.type?.name,
      required: prop.required,
      defaultValue: prop.defaultValue?.value,
    })
  })

  return rs
}

export const Props = ({ data, name }: { data?: any[], of?: any, name?: string | undefined }) => {
  const columns = [
    {
      title: '参数',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      render: (text: any, row: any) => {
        return (
          <>
            {
              row.description &&
                <span style={{ display: 'inline-block', marginRight: '6px' }}>{row.description}</span>
            }
            {
              row.required &&
                <Tag color="blue">required</Tag>
            }
          </>
        )
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
    }
  ]

  return (
    <>
      <div
        style={{ color: '#2E3846', fontSize: '18px', marginTop: '55px', marginBottom: '14px', fontWeight: 600 }}
      >{name || 'Attributes'}</div>
      <Table pagination={false} columns={columns} dataSource={data} />
    </>
  )
}

export const UseCase = ({
  children,
  code = '',
  title,
  des,
  wrapStyle = {}
}: { children: any, code?: string, title: string, des?: string, wrapStyle?: CSSProperties }) => {
  return (
    <>
      <div style={{ fontSize: '16px', lineHeight: '22px', color: '#2E3846', fontWeight: 600, marginTop: '55px' }}
      >{ title }</div>
      {
        des &&
          <div style={{ fontSize: '14px', lineHeight: '20px', color: '#575D6C', marginTop: '14px' }}>{ des }</div>
      }
      <div style={{ marginTop: '15px', borderRadius: '2px', boxShadow: '2px 2px 10px 0px rgba(100, 124, 153, 0.21), 0px 0px 0px 1px rgba(81, 94, 111, 0.04)' }}>
        <div style={{ padding: '20px', ...wrapStyle }}>
          { children }
        </div>

        <Collapse style={{ borderColor: '#F2F3F5', borderLeft: 'none', borderRight: 'none' }}>
          <Panel
            key={0}
            style={{ borderBottom: 'none', textAlign: 'center' }}
            showArrow={false}
            header={ <>
              <Tooltip title="收起/显示代码">
                <CaretDownOutlined style={{ color: '#575D6C' }} />
              </Tooltip>
              <Tooltip title="复制代码" onClick={(e: any) => e.stopPropagation()}>
                <CopyToClipboard
                  text={ code }
                  onCopy={() => message.success('复制成功')}
                  onClick={(e: any) => e.stopPropagation()}
                >
                  <CopyOutlined style={{ color: '#575D6C', marginLeft: '6px' }} onClick={e => e.stopPropagation()} />
                </CopyToClipboard>
              </Tooltip>
            </> }
          >
            <SyntaxHighlighter customStyle={{ textAlign: 'left' }} language="html" style={coy}>
              { code }
            </SyntaxHighlighter>
          </Panel>
        </Collapse>
      </div>
    </>
  )
}

const componentsPage = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [curComponent, setCurComponent] = useState(components[0])

  const handleSelectMenu = ({ key }: any) => {
    setCurComponent(components[key])
  }

  return (
    <Layout className="components-doc" style={{ height: '100%' }}>
      <Header style={{ background: '#3d4a73', color: '#fff', marginBottom: '26px', height: '56px', lineHeight: '56px', padding: '0 32px' }}>
        <img style={{ width: '36px', height: '36px', marginRight: '6px' }} src="data:image/png;base64,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" />
        组件库文档
      </Header>
      <Layout style={{ padding: '0 12px 0 12px' }}>
        <Sider
          width="256"
          style={{ height: '100%', background: '#fff', borderRadius: '6px 0 0 0' }}
        >
          <Menu
            style={{ width: 256, borderRadius: '6px 0 0 0' }}
            defaultSelectedKeys={['0']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            onSelect={handleSelectMenu}
          >
            <SubMenu key="sub1" icon={<MailOutlined />} title="全部组件">
              {
                components.map((component, index) => (
                  // <Menu.ItemGroup key="g1" title="Item 1">
                  // eslint-disable-next-line react/no-array-index-key
                  <Menu.Item key={ index }>{ component.title }</Menu.Item>
                    // <Menu.Item key="2">Option 2</Menu.Item>
                  // </Menu.ItemGroup>
                ))
              }
            </SubMenu>
          </Menu>
        </Sider>
        <Layout style={{ background: '#fff', borderRadius: '0 6px 0 0' }}>
          <Content style={{ padding: '20px' }}>
            <div style={{ fontSize: '26px', lineHeight: '32px', color: '#2E3846', fontWeight: 700 }}
            >{ curComponent.title }</div>
            <div style={{ fontSize: '14px', lineHeight: '20px', color: '#575D6C', marginBottom: '26px', marginTop: '2px' }}
            >{ curComponent.des }</div>

            <ImportStatement text={ curComponent.importStatement } />

            {/* <AvatarGroupDoc /> */}
            { componentsMap.get(curComponent) }
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default componentsPage