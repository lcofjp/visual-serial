
## 如何运行最新版最新版软件

### 1. 安装Node.js
下载地址：[https://nodejs.org/](https://nodejs.org/)

### 2. 克隆代码到本地
使用Git方式或者https方式克隆代码：
* HTTPS: `git clone https://github.com/lcofjp/visual-serial.git`
* Git: `git clone git@github.com:lcofjp/visual-serial.git`

### 3. 安装依赖包
* 进入代码目录：`cd visual-serial/app`
* 执行命令：`npm install`

### 4. 编译serialport模块
* 进入目录: `cd visual-serial/app/node_modules/serialport`
* 执行命令: `../.bin/electron-rebuild`

### 5. 运行程序
* 切换到`visual-serial/app`目录
* 执行命令：`npm start`

--------------------

### 致谢：
* 感谢[strong161](http://home.eeworld.com.cn/space-uid-631109.html)网友为本项目捐赠30E金币
