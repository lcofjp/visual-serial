## 如何调试
运行软件，通过快捷键打开调试窗口(windows/linux: <kbd>ctrl+shift+i</kbd>,macOS: <kbd>command+option+i</kbd>)



## 如何从代码运行软件

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
* 执行命令: `./node_modules/.bin/electron-rebuild`

### 5. 运行程序
* 切换到`visual-serial/app`目录
* 执行命令：`npm start`

--------------------

### 致谢：
* 感谢[strong161](http://home.eeworld.com.cn/space-uid-631109.html)网友为本项目捐赠30E金币
- 感谢网友elvike资助500RMB
