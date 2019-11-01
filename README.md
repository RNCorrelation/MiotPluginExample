环境配置

安装node,版本9.0+
通过homebrew 安装

brew node

如果没有安装  homebrew ，终端安装命令如下：

ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" 

命令npm -v、node -v，能正确显示版本号即表示node安装成功，如果是通过homebrew安装的，下发命令brew list会显示node。
项目初始化

直接运行目录下init.sh脚本安装所有依赖（包括submodules更新）或按照以下步骤安装依赖

将本仓库克隆到在miot-plugin-sdk仓库的projects目录下

在Mijia-Hub-Plugin目录执行npm install

进入相应的设备插件目录执行 npm install

运行调试

在miot-plugin-sdk目录下运行 npm start --reset-cache

查看本机IP地址

    ifconfig en0
    
**注意** 请确保电脑与手机处在同一局域网内，不然无法调试。
