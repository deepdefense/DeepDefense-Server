###  安全评分
####  功能: 获取安全评分权重信息
####  对应按钮: 容器镜像扫描-安全评分-弹窗
####  请求地址: http://api_server_ip:4000/api/score
####  请求方法: GET
####  请求参数: NULL
####  返回类型: JSON  
```json
{
    "code": 0,  //  [number] 返回结果(0为正常)
    "data": {
        "high": 9,  //  [number] 高危漏洞权重
        "medium": 5,  //  [number] 中危漏洞权重
        "low": 3,  //  [number] 中危漏洞权重
        "negligible": 2,  //  [number] 低危漏洞权重
        "unknown": 1  //  [number] 未知漏洞权重
    },
    "message": "ok"
}
```
___
####  功能: 修改安全评分权重
####  对应按钮: 容器镜像扫描-安全评分-弹窗-保存
####  请求地址: http://api_server_ip:4000/api/score
####  请求方法: PUT
####  请求参数: JSON
```json
{
	"high": 9,  //  [number] 高危漏洞权重
    "medium": 5,  //  [number] 中危漏洞权重
    "low": 4,  //  [number] 中危漏洞权重
    "negligible": 2,  //  [number] 低危漏洞权重
    "unknown": 1  //  [number] 未知漏洞权重
}
```
####  返回类型: JSON  
```json
{
    "code": 0,  //  [number] 返回结果(0为正常)
    "data": {
        "high": 9,  //  [number] 高危漏洞权重
        "medium": 5,  //  [number] 中危漏洞权重
        "low": 4,  //  [number] 中危漏洞权重
        "negligible": 2,  //  [number] 低危漏洞权重
        "unknown": 1  //  [number] 未知漏洞权重
    },
    "message": "ok"
}
```
___
###  容器镜像扫描
####  功能: 获取指定仓库的列表分页
####  对应按钮: 容器镜像扫描-对应仓库列表
####  请求地址: http://api_server_ip:4000/api/scanner
####  请求方法: POST
####  请求参数: JSON
```json
{
    "repository": "192.168.10.118:5000",  //  [string] 仓库名
	"pagination": {
		"from": 0,  //  [number] 跳过条数
		"size": 5  //  [number] 分页大小
	},
	"sort": {
		"field": "created_at",  //  [string] 排序索引, 默认create_at, create_at|updated_at|score|image
		"order": "asc"  //  [string] 升序/降序 asc|dasc
	},
	"search": []  //  [array of string] 搜索关键词, 如果无, 则为空数组
}
```
####  返回类型: JSON  
```json
{
    "code": 0,
    "data": {
        "docs": [  //  [array] 分页数组
            {
                "repository": "192.168.10.118:5000",  //  [string] 仓库名
                "image": "ubuntu",  //  [string] 镜像名
                "tag": "16.04",  //  [string] 镜像标签
                "high": 0,  //  [number] 高危漏洞数量
                "low": 20,  //  [number] 低危漏洞数量
                "medium": 7,  //  [number] 中危漏洞数量
                "negligible": 16,  //  [number] 轻危漏洞数量
                "unknown": 0,  //  [number] 未知危漏洞数量
                "score": 0.1585518102372035,  //  [number] 安全评分
                "updated_at": "2019-04-12T03:25:46.326Z"  //  [string] 最后扫描时间
            }
        ],
        "count": 1  //  [number]  总计镜像数
    },
    "message": "ok"
}
```
___
####  功能: 获取指定仓库中指定镜像的信息
####  对应按钮: 容器镜像扫描-指定镜像
####  请求地址: http://api_server_ip:4000/api/scanner
####  请求方法: GET
####  请求参数: NULL
####  返回类型: JSON  
```json
{
    "code": 0,
    "data": {
        "repository": "192.168.10.118:5000",  //  [string] 仓库名
        "image": "ubuntu",  //  [string] 镜像名
        "namespace": "ubuntu:16.04",  //  [string] 操作系统
        "name": "192.168.10.118:5000/ubuntu:16.04",  //  [string] 镜像全称
        "tag": "16.04",  //  [string] 镜像标签
        "high": 0,  //  [number] 高危漏洞数量
        "low": 20,  //  [number] 低危漏洞数量
        "medium": 7,  //  [number] 中危漏洞数量
        "negligible": 16,  //  [number] 轻危漏洞数量
        "unknown": 0,  //  [number] 未知危漏洞数量
        "score": 0.1585518102372035,  //  [number] 安全评分
        "updated_at": "2019-04-12T03:25:46.326Z",  //  [string] 最后扫描时间
        "created_at": "2019-04-11T03:45:43.004Z"  //  [string] 首次扫描时间
    },
    "message": "ok"
}
```
___
####  功能: 获取指定镜像详细漏洞信息
####  对应按钮: 容器镜像扫描-对应仓库列表
####  请求地址: http://api_server_ip:4000/api/scanner/image
####  请求方法: POST
####  请求参数: JONS
```json
{
	"repository": "192.168.10.118:5000",  //  [string] 仓库名
	"image": "ubuntu",  //  [string] 镜像名
	"tag": "16.04",  //  [string] 标签名
	"pagination": {
		"from": 0,  //  [number] 跳过条数
		"size": 5  //  [number] 分页大小
	},
	"sort": {
		"field": "created_at",  //  [string] 排序索引, 默认created_at, created|cveID
		"order": "asc"  //  [string] 升序/降序, asc|dasc
	},
	"search": []  //  [array of string] 搜索关键词, 如果无, 则为空数组
}
```
####  返回类型: JSON  
```json
{
    "code": 0,
    "data": {
        "docs": [  //  [array] 当前分页
            {
                "description": "inffast.c in zlib 1.2.8 might allow context-dependent attackers to have unspecified impact by leveraging improper pointer arithmetic.",  //  [string] 漏洞描述
                "link": "http://people.ubuntu.com/~ubuntu-security/cve/CVE-2016-9841",  //  [string] 漏洞信息链接
                "level": "Low",  //  [string] 漏洞等级
                "type": "zlib",  //  [string] 漏洞类型
                "versionFormat": "dpkg",  //  [string] 漏洞软件包格式
                "version": "1:1.2.8.dfsg-2ubuntu4.1",  //  [string] 漏洞软件包版本号
                "repository": "192.168.10.118:5000",  //  [string] 漏洞仓库名
                "image": "ubuntu",  //  [string] 镜像名
                "tag": "16.04",  //  [string] 标签
                "cveId": "CVE-2016-9841",  //  [string] 漏洞ID
                "updated_at": "2019-04-12T03:25:46.433Z"  //  [string] 漏洞扫描时间
            }
        ],
        "count": 43  //  [number] 镜像漏洞总数
    },
    "message": "ok"
}
```
___
###  镜像仓库
####  功能: 获取镜像仓库
####  对应按钮: 容器镜像扫描-仓库管理
####  请求地址: http://api_server_ip:4000/api/repository
####  请求方法: GET
####  请求参数: NULL
####  返回类型: JSON  
```json
{
    "code": 0,
    "data": [
        {
            "port": 5000,  //  [number] 仓库端口
            "username": "abc",  //  [string] 认证用户
            "passwd": "abc123",  //  [string] 认证密码
            "isHttps": false,  //  [string] 是否使用https
            "isAuth": false,  //  [string] 是否启用认证
            "isConnect": true,  //  [string] 是否可以连接
            "_id": "5cada5df27a7f44fe82142b4",  //  无需使用
            "repository": "192.168.10.118",  //  [string] 仓库地址
            "__v": 0  //  无需使用
        }
    ],
    "message": "ok"
}
```
___
####  功能: 添加仓库
####  对应按钮: 容器镜像扫描-仓库管理
####  请求地址: http://api_server_ip:4000/api/repository
####  请求方法: POST
####  请求参数: JSON
```json
{
    "name": "test",  //  [string] 仓库别名
    "port": 5000,  //  [number] 仓库端口
    "username": "abc",  //  [string] 认证用户
    "passwd": "abc123",  //  [string] 认证密码
    "isHttps": false,  //  [string] 是否使用https
    "isAuth": false,  //  [string] 是否启用认证
    "isConnect": true,  //  [string] 是否可以连接
    "repository": "192.168.10.118",  //  [string] 仓库地址
}
```
####  返回类型: JSON  
```json
{
    "code": 0,
    "data": {
        "name": "test",  //  [string] 仓库别名
        "port": 5000,  //  [number] 仓库端口
        "username": "abc",  //  [string] 认证用户
        "passwd": "abc123",  //  [string] 认证密码
        "isHttps": false,  //  [string] 是否使用https
        "isAuth": false,  //  [string] 是否启用认证
        "isConnect": true,  //  [string] 是否可以连接
        "repository": "192.168.10.118",  //  [string] 仓库地址
    },
    "message": "ok"
}
```
___
####  功能: 修改仓库
####  对应按钮: 容器镜像扫描-仓库管理
####  请求地址: http://api_server_ip:4000/api/repository
####  请求方法: PUT
####  请求参数: JSON
```json
{
    "name": "test",  //  [string] 仓库别名
    "port": 5000,  //  [number] 仓库端口
    "username": "abc",  //  [string] 认证用户
    "passwd": "abc123",  //  [string] 认证密码
    "isHttps": false,  //  [string] 是否使用https
    "isAuth": false,  //  [string] 是否启用认证
    "isConnect": true,  //  [string] 是否可以连接
    "repository": "192.168.10.118",  //  [string] 仓库地址
}
```
####  返回类型: JSON  
```json
{
    "code": 0,
    "data": {
        "name": "test",  //  [string] 仓库别名
        "port": 5000,  //  [number] 仓库端口
        "username": "abc",  //  [string] 认证用户
        "passwd": "abc123",  //  [string] 认证密码
        "isHttps": false,  //  [string] 是否使用https
        "isAuth": false,  //  [string] 是否启用认证
        "isConnect": true,  //  [string] 是否可以连接
        "repository": "192.168.10.118",  //  [string] 仓库地址
    },
    "message": "ok"
}
```
___
####  功能: 删除仓库
####  对应按钮: 容器镜像扫描-仓库管理
####  请求地址: http://api_server_ip:4000/api/repository?repository={repository}
####  请求方法: DELETE
####  请求参数: NULL
####  返回类型: JSON  
```json
{
    "code": 0,
    "data": {
        "name": "test",  //  [string] 仓库别名
        "port": 5000,  //  [number] 仓库端口
        "username": "abc",  //  [string] 认证用户
        "passwd": "abc123",  //  [string] 认证密码
        "isHttps": false,  //  [string] 是否使用https
        "isAuth": false,  //  [string] 是否启用认证
        "isConnect": true,  //  [string] 是否可以连接
        "repository": "192.168.10.118",  //  [string] 仓库地址
    },
    "message": "ok"
}
```
___
####  功能: 测试仓库
####  对应按钮: 容器镜像扫描-仓库管理
####  请求地址: http://api_server_ip:4000/api/repository?repository={repository}
####  请求方法: PUT
####  请求参数: NULL
####  返回类型: JSON  
```json
{
    "code": 0,
    "data": {
        "name": "test",  //  [string] 仓库别名
        "port": 5000,  //  [number] 仓库端口
        "username": "abc",  //  [string] 认证用户
        "passwd": "abc123",  //  [string] 认证密码
        "isHttps": false,  //  [string] 是否使用https
        "isAuth": false,  //  [string] 是否启用认证
        "isConnect": true,  //  [string] 是否可以连接
        "repository": "192.168.10.118",  //  [string] 仓库地址
    },
    "message": "ok"
}
```
___
####  错误: JSON
```json
{
    "code": "5005",
    "data": "XXX",  //  [string] 详细错误信息
    "message": "dbException"  //  [string] 错误类型
}
```
|code|错误类型|
|:-|:-|
|5005|数据库错误, 读写数据库是发生的错误|
|5003|参数错误, 函数传入参数发生错误|
|5001|clair错误, 调用clair库发生错误|
___