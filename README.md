# bun
[![NPM version](https://img.shields.io/npm/v/bunjs.svg)](https://www.npmjs.com/package/bunjs)
[![NPM downloads](https://img.shields.io/npm/dm/bunjs.svg)](https://www.npmjs.com/package/bunjs)

bun是一款基于koa2的web框架，它拥有标准的mvc结构，你可以从任何server语言无缝迁移，它帮你实现了路由、日志、渲染等模块，给你最完美的开发体验。它可以轻松构建起一个企业级的web应用，即使你是从没有开发过服务端的前端人员，你也可以一键生成自己的应用并快速上手。
bun专门对ssr做了封装，提供配套的ssr工具，使得你可以一键生成一个ssr项目，目前已经支持vue，react的ssr。

bun取名传统美食：包子。寓意是希望包住所有干扰开发者的东西，让开发者更加专注于做自己的事情。

bun的核心功能：
- 开箱即用
- 约定高于配置
- 支持多个app统一部署，并互相独立
- 完整的开发日志（包含业务日志，报警日志，错误日志）
- 完整的MVC开发体验
- 全局的自动loader，更加简洁快速的开发
- 完善的cli命令工具和脚手架
- 统一的前端打包工具
- ssr

bun是一整套工具的合集
- bun-skin bun的核心node框架
- bun-cli bun的cli命令行工具
- bun-project bun的node工程模板
- bun-app bun的app模板
- bun-vueapp bun的vueapp模板
- bun-vueapp-ssr bun的vueapp的ssr模板
- bun-reactapp bun的reactapp的模板（包含ssr）
- bun-vuessr-plugin bun的vuessr插件
- bun-reactssr-plugin bun的reactssr插件

## 依赖

- [node](https://nodejs.org) (v6.0.0+)
- [koa](https://koa.bootcss.com) (v2.0.0+)
- [typescript](https://www.typescriptlang.org/) (v3.5.0+)

## 安装：

```
npm i -g bunjs
```
## 构建项目工程框架：

```
bun init project
```
根据提示输入名称,如myProject。
然后cd进入新创建的project目录，执行：

```
npm install
```
一个项目工程构建完成。
## 创建app
然后退回到上一级目录，并创建一个新的app：

```
cd ..
bun init app
```
根据提示输入app名称,如myapp。
然后cd进入新创建的app目录，执行：

```
npm install
```
## 编译部署
然后编译当前app内容到工程目录：

```
bun r -d -t ../myProject
```
开发环境下，可加上：

-d参数：使用开发模式打包编译（不会进行压缩等）

-w参数：实时监听文件修改，自动打包编译

## 启动项目
然后，回到project目录，启动项目：

```
cd myProject
bun run myProject
```
默认端口是8000，打开http://localhost:8000/myapp/home 即可看到示例页面

## 其它
工具内置了pm2作为进程保护，可以监听文件修改自动重新启动，你可以执行：

```
bun restart myProject //重启项目
bun stop myProject //停止项目
bun run myProject -w //自动重启项目
```
## vue
我们对react和vue等热门前端框架进行了支持，
如果你想使用vue，你可以这样创建app：

```
bun init vueapp
```
打开http://localhost:8000/myapp/ 即可看到示例页面

我们还对vue做了ssr支持，你需要创建一个新的vueappssr：
```
bun init vueappssr
```
你还需要引入一个ssr插件：
```
npm i --save bun-vuessr-plugin
```
然后在conf/plugins.js中做好声明即可使用：

```
exports.SSR = {
  enable: true,
  package: 'bun-vuessr-plugin'
};
```
插件的具体使用方法请移步这里：https://github.com/bunjs/bun-vuessr-plugin

## react
如果你想使用react，你可以这样创建app：

```
bun init reactapp
```
打开http://localhost:8000/myapp/ 即可看到示例页面

我们还对react做了ssr支持，
针对react，你不需要创建ssrapp，只需安装一个插件，你可以很方便在project目录下安装插件：

```
npm i --save bun-reactssr-plugin
```
然后在conf/plugins.js中做好声明即可使用：

```
exports.SSR = {
  enable: true,
  package: 'bun-reactssr-plugin'
};
```
插件的具体使用方法请移步这里：https://github.com/bunjs/bun-reactssr-plugin
