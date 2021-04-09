## umi doc工具

配合`umi`框架使用的文档工具


### 安装

```javascript
yarn add umi-doc@~1.0.0
```


### 配置

在`.umirc.ts`中加上配置：
```javascript
plugins: [
  require.resolve('umi-doc')
]
```


### 运行

正常启动`umi`项目即可，该工具会为`umi`新增一个路由：`componentsPage`，访问此路由即可


### 编写组件文档

文档格式是`xx.doc.tsx`，并且必须编写在components文件夹下

比如有一个组件：`src\components\nameAndAge\index.tsx`
```javascript
type NameAndAgeProps = {
  name: string,
  age?: number
}

const NameAndAge = ({ name, age = 1 }: NameAndAgeProps) => {
  return <div>{name}的年龄是：{age}岁</div>
}

export default NameAndAge
```
编写对应文档：`src\components\nameAndAge\nameAndAge.doc.tsx`

```javascript
import { Props, UseCase } from '@@/doc'
import React from 'react'
import NameAndAge from './index'


// 此对象名称必须是：${文件名}DocInfo，比如nameAndAge.doc.tsx应该导出nameAndAgeDocInfo
export const nameAndAgeDocInfo = {
  title: 'NameAndAge 姓名和年龄',
  des: '显示客户的姓名和年龄',
  importStatement: `import NameAndAge from 'nameAndAge'`
}

export default () => {
  return (
    <>
      <UseCase
        title="基础用法"
        des="可以这么用"
      >
        <NameAndAge name='张三' />
      </UseCase>

      <UseCase
        title="另外的用法"
        des="也可以这么用"
      >
        <NameAndAge name='李四' age={26} />
      </UseCase>

      <Props of={ NameAndAge } />
    </>
  )
}
```

访问路由后会出现如下页面：

![https://ai-call-platform.oss-cn-hangzhou.aliyuncs.com/CompanyWebsite/OfficialWebsite/NewsPicture/ifSxfJDoGw_1617947761500_企业微信截图_16179476924001.png](https://ai-call-platform.oss-cn-hangzhou.aliyuncs.com/CompanyWebsite/OfficialWebsite/NewsPicture/ifSxfJDoGw_1617947761500_企业微信截图_16179476924001.png)

### 组件

#### Props
|  属性   | 描述  |
|  ----  | ----  |
| of  | 要解析的组件，必填 |
| name  | 属性表名（生成页面后显示在属性表上的标题） |

#### UseCase
|  属性   | 描述  |
|  ----  | ----  |
| title  | 用例标题，必填 |
| des  | 用例描述 |
