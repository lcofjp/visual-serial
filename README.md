## 基本功能介绍
基本功能介绍：[https://lcofjp.github.io/visual-serial/](https://lcofjp.github.io/visual-serial/)
## 下载
百度云下载地址：[https://pan.baidu.com/s/1mhAt4Ju](https://pan.baidu.com/s/1mhAt4Ju)

注意：Linux系统可能需要root权限运行才能正常打开串口。


## 如何从源代码运行软件

### 1. 安装Node.js
下载地址：[https://nodejs.org/](https://nodejs.org/)

### 2. 克隆代码到本地
使用Git方式或者https方式克隆代码：
* HTTPS: `git clone https://github.com/lcofjp/visual-serial.git`
* Git: `git clone git@github.com:lcofjp/visual-serial.git`

### 3. 安装依赖包
* 进入代码目录：`cd visual-serial/app`
* 执行命令：`npm install`

### 4. 编译serialport模块 (需要有C++编译器)
* 执行命令: `./node_modules/.bin/electron-rebuild`

### 5. 运行程序
* 切换到`visual-serial/app`目录
* 执行命令：`npm start`

## 如何调试
运行软件，通过快捷键打开调试窗口(windows/linux: <kbd>ctrl+shift+i</kbd>,macOS: <kbd>command+option+i</kbd>)

## 交流反馈
QQ群：12602287

--------------------

### 致谢：
- 感谢网友strong161为本项目捐赠30E金币
- 感谢网友elvike资助500RMB
