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
const { Sider, Content } = Layout

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
  let componentInfo = info.find((it: any) => it.displayName === componentName)

  // 如果根据组件名搜索不到，再根据组件文件路径搜索
  if (!componentInfo) {
    componentInfo = info.find((it: any) => {
      const keys = Object.keys(it.props)
      return componentPath && it.props[keys[0]].parent.fileName.split('src')[1] === componentPath
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
  des
}: { children: any, code?: string, title: string, des?: string }) => {
  return (
    <>
      <div style={{ fontSize: '16px', lineHeight: '22px', color: '#2E3846', fontWeight: 600, marginTop: '55px' }}
      >{ title }</div>
      {
        des &&
          <div style={{ fontSize: '14px', lineHeight: '20px', color: '#575D6C', marginTop: '14px' }}>{ des }</div>
      }
      <div style={{ marginTop: '15px', borderRadius: '2px', boxShadow: '2px 2px 10px 0px rgba(100, 124, 153, 0.21), 0px 0px 0px 1px rgba(81, 94, 111, 0.04)' }}>
        <div style={{ padding: '20px' }}>
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
      <Sider
        width="256"
        style={{ height: '100%', background: '#fff' }}
      >
        <Menu
          style={{ width: 256 }}
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
      <Layout style={{ background: '#fff' }}>
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
  )
}

export default componentsPage