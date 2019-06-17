### 运行监控

#### 功能: 监控规则列表

#### 对应按钮: 无

#### 请求地址: http://api_server_ip:4000/v1_1/rules

#### 请求方法: GET

#### 请求参数: NULL

#### 返回类型: JSON

```json
{
  "code": 0, //  [number] 返回结果(0为正常)
  "data": [
    {
      "_id": "unwritable_files", //  [string] 规则对应参数列表
      "_score": 0, //  [number] 规则编号
      "_source": {
        "rulename": "Write sensitive files" //  [string] 规则名
      },
      "ctnGroups": [] //  [array] 规则适用容器组
    }
  ],
  "message": "ok"
}
```

---

#### 功能: 获取规则参数列表

#### 对应按钮: 规则列表-对应规则

#### 请求地址: http://api_server_ip:4000/v1_1/rules/:rulename

#### 请求方法: GET

#### 请求参数: string

对应上一个 API 中\_id 参数

#### 返回类型: JSON

```json
{
  "code": 0, //  [number] 返回结果(0为正常)
  "data": {
    "rulename": "Rename sensitive files", //  [string] 对应规则名, 弃用参数
    "items": [
      //  [array] 规则参数列表
      { "data": "/tmp/d.txt" },
      { "data": "/tmp/d1.txt" },
      { "data": "/tmp/d11.txt" }
    ],
    "list": "unrename_files", // [string] 列表名
    "ctnGroup": ["DeepDefense"]
  },
  "message": "ok"
}
```

---

#### 功能: 修改参数列表

#### 对应按钮: 无

#### 请求地址: http://api_server_ip:4000/v1_1/rules/:rulename

#### 请求方法: PUT

#### 请求参数: JSON

```json
{
  "iterm": ["/tmp/d.txt", "/tmp/d1.txt"]
}
```

#### 返回类型: JSON

```json
{
  "code": 0, //  [number] 返回结果(0为正常)
  "data": {
    "rulename": "Rename sensitive files", //  [string] 对应规则名, 弃用参数
    "items": [
      //  [array] 规则参数列表
      "/tmp/d.txt",
      "/tmp/d1.txt"
    ],
    "list": "unrename_files" // [string] 列表名
  },
  "message": "ok"
}
```

---

#### 功能: 获取容器组列表

#### 对应按钮: 无

#### 请求地址: http://api_server_ip:4000/v1_1/container

#### 请求方法: GET

#### 请求参数: NULL

#### 返回类型: JSON

```json
{
  "code": 0, //  [number] 返回结果(0为正常)
  "data": [
    //  [array] 容器组列表
    {
      "members": [
        //  [array] 容器组成员
        "deepdefense-monitor",
        "deepdefense-scanner",
        "scanner-api-server"
      ],
      "groupname": "Defense" //  [string] 容器组名
    }
  ],
  "message": "ok"
}
```

---

#### 功能: 添加容器组

#### 对应按钮: 无

#### 请求地址: http://api_server_ip:4000/v1_1/container

#### 请求方法: POST

#### 请求参数: JSON

```json
{
  "members": [
    //  [array] 容器组成员
    "deepdefense-monitor",
    "deepdefense-scanner",
    "scanner-api-server"
  ],
  "groupname": "Defense" //  [string] 容器组名
}
```

#### 返回类型: JSON

```json
{
  "code": 0, //  [number] 返回结果(0为正常)
  "data": [
    //  [array] 容器组列表
    {
      "members": [
        //  [array] 容器组成员
        "deepdefense-monitor",
        "deepdefense-scanner",
        "scanner-api-server"
      ],
      "groupname": "Defense" //  [string] 容器组名
    }
  ],
  "message": "ok"
}
```

---

#### 功能: 修改容器组

#### 对应按钮: 无

#### 请求地址: http://api_server_ip:4000/v1_1/container

#### 请求方法: PUT

#### 请求参数: JSON

```json
{
  "members": [
    //  [array] 容器组成员
    "deepdefense-monitor",
    "deepdefense-scanner"
  ],
  "groupname": "Defense" //  [string] 容器组名
}
```

#### 返回类型: JSON

```json
{
  "code": 0, //  [number] 返回结果(0为正常)
  "data": [
    //  [array] 容器组列表
    {
      "members": [
        //  [array] 容器组成员
        "deepdefense-monitor",
        "deepdefense-scanner"
      ],
      "groupname": "Defense" //  [string] 容器组名
    }
  ],
  "message": "ok"
}
```

---

#### 功能: 删除容器组

#### 对应按钮: 无

#### 请求地址: http://api_server_ip:4000/v1_1/container/:groupname

#### 请求方法: DELETE

#### 请求参数: STRING

groupname 参照获取容器组列表中参数 groupname

#### 返回类型: JSON

```json
{
  "code": 0, //  [number] 返回结果(0为正常)
  "data": [
    //  [array] 容器组列表
    {
      "members": [
        //  [array] 容器组成员
        "deepdefense-monitor",
        "deepdefense-scanner"
      ],
      "groupname": "Defense" //  [string] 容器组名
    }
  ],
  "message": "ok"
}
```

---

#### 功能: 配置规则适用容器组

#### 对应按钮: 无

#### 请求地址: http://api_server_ip:4000/v1_1/rules

#### 请求方法: PUT

#### 请求参数: JSON

```json
{
  "list": "unwritable_files", //  [string] 规则对应参数列表
  "ctnGroups": ["DeepDefense"] //  [array] 规则适用容器组
}
```

#### 返回类型: JSON

```json
{
  "code": 0, //  [number] 返回结果(0为正常)
  "data": {
    "list": "unwritable_files", //  [string] 规则对应参数列表
    "rulename": "Write sensitive files", //  [string] 规则名
    "ctnGroups": ["DeepDefense"] //  [array] 规则适用容器组
  },
  "message": "ok"
}
```

---

#### 功能: 生效规则配置

#### 对应按钮: 无

#### 请求地址: http://api_server_ip:4000/v1_1/enable

#### 请求方法: PUT

#### 请求参数: NULL

#### 返回类型: JSON

```json
{
  "code": 0, //  [number] 返回结果(0为正常)
  "data": "enable rules complete",
  "message": "ok"
}
```

---
