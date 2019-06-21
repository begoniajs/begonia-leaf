# begonia-leaf 介绍

`beleaf`(`begonia-leaf`)是配合begonia框架的状态管理库，仅用于小程序开发。

## 微信小程序基础库版本

```
^2.2.1
```

## 何时使用数据状态管理

当随着应用的规模扩大，数据状态管理将成为程序关注的重点，多个组件需要取得一致的状态时，为了更有利于开发、信息共享和管理，选择之一就是引入状态管理库。比如`redux`或者`mobX`。

```
                    Service
                    |  ^
                    v  |
View - ViewModel--->action--dispatch
            |               |
            |            reducers
            |               |
            getters--state--|

```

结合小程序开发的实际，我们希望可以有对象能时刻监控`state`的变化，将我们关注(订阅)的分支变化进行报告。
此外，我们还想有办法对更新后的数据进行加工，最后再进行`setData`生效。当然，如果能结合`begonia`所建立的`VMP`进行延迟提交，则更为有利。

因此，我们将进行如下变化:

```

  setData           Service
  |     ^            |  ^
  |     |            |  |
  |     VMP          |  |
  V     |            v  |
View---ViewModel--->action--->dispatch
        ^                        |
        |                     reducers
        |                        |
  WatchManager<-----------state<-|

```

这就是`beleaf`的内部结构：

- bex.js  beleaf模块的入口，以及主要api提供者，不仅提供装载到begonia上的方法，而且会将特殊的方法装饰到小程序实例和vmp实例上。
- ReduxLite.js 简版的redux实现
- WatchManager.js 通过对state变化的监控，提供订阅state某个分支变化的api，并为vmp实例提供类似观察者处理函数的功能，可以进行再加工。

## 快速使用

### 1. 安装

请在小程序项目的根目录下(即 `project.config.js` 中的 `miniprogramRoot` 字段)执行`npm`安装:

```
$ npm install beleaf
```

接下来，我们需要做的，就是使用微信开发者工具中的工具->构建npm命令，对已经安装好的npm模块进行构建。
关于如何使用微信开发者工具构建npm模块，你可以参考[官方文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)

### 2. 建立store目录和`store.js`文件

为了便于管理和维护，我们可以在项目开发根目录中建立一个`store`目录，将对beleaf模块的配置放入其中。

```
other dir
|
|-store
|   |-store.js  入口文件，配置bex
|   |-user.js   state分支文件，例如，处理用户信息的user.js
|   
|   
|
other dir

```

现在以一个`store.js`为例:

```js
// store.js
import BE from 'begoina';     //导入begonia入口模块
import bex from 'beleaf';     //导入beleaf的入口文件

import user from './user';      //导入分支文件user.js

//将beleaf装载到begoina的主模块上
BE.use(bex);

const SET_SYS_ID = 'setSysId';

//创建一个store实例
const store = bex.createStore({
  // 可以打开debug模式，查看输出
  debug: true,
  // 放置于此的state会被分配到root分支
  state: {
    sysId: 0
  },
  getters: {
    sysId: state => state.sysId
  },
  actions: {
    setSysId({ dispatch }, id = 0) {
      dispatch(SET_SYS_ID, 12345);
    }
  },
  reducers: {
    [SET_SYS_ID](state, data = 0) {
      state.data = data;
    }
  },
  //在modules字段下，装载定义的state分支对象
  modules:{
    user
  }
});

//导出store实例对象
export default store;

```
由于在上面例子中我们还导入了一个`user.js`作为state分支，下面我们来创建它。
这里以用户信息分支`user.js`为例，了解一下如何创建一个state分支：

```js
//user.js

/**
 * user state 相关
 */
//=====================================================
//导入用于远程加载用户信息的UserService
import UserService from '../services/UserService';
//=====================================================
//reducer名常量
const SET_USER = 'setUser';
const ADD_USERS = 'addUsers';

export default {
  //state分支对象
  state: {
    users:{},
    userId:0
  },
  //访问分支的getter方法
  getters: {
    userId: state => state.userId,
    currentUser: state => UserService.combineUserInfo(state.userId, state.users) 
  },
  //action函数集合
  actions: {
    /**
     * 启动登录
     */
    setupLogin({ dispatch }) {
      return UserService.setupLogin()
        .then(function(res) {
          let user = res.user;
          if(!user || !user.id){
            return;
          }
          //将用户对象加入state分支
          dispatch(ADD_USERS, {
              [user.id]:user
          });
          //设置当前的用户id
          dispatch(SET_USER, user.id);        
        })
        .catch(function(error) {
          console.error("In user state setupLogin,catch an error.", error);
        });
    }  
  },
  //修改分支的reducer函数，注意数据的不可变性
  reducers: {
    [ADD_USERS](state, data = {}){
      // 为保持数据的不可变性，创建一个新的对象
      state.users = Object.assign({}, state.users, data);
    },
    [SET_USER](state, data = 0){
      state.userId = +data;
    }
  }
};

```

请注意，在上面的例子中的`setupLogin()`方法中，我们对参数进行了解构，在函数的内部声明了`dispatch`。
其实方法的第一个参数是一个对象，它包含了一些与store映射的属性和方法，但它并不是store对象本身。
对象的结构如下：

```js
{
  dispatch: (type, payload) => {},
  actions: object,
  getters: object,
  state: object,
  rootState: object
}
```

### 3. 在小程序页面和组件实例中，订阅关注的state分支属性以及发出acton

当有关store和user分支都准备好后，我们来看如何在小程序的页面和组件实例中使用状态管理。
注意，虽然App实例(在`app.js`中定义的对象)不具有`setData`方法，我们仍然可以使用`beleaf`提供的方法，
订阅state分支属性变动。

```js
import BE from 'begonia';
import { mapActions } from 'beleaf';

Page(
  BE.page({
  /**
   * 页面的初始数据
   */
  data(){
    return {

    };
  },
  // beleaf专有的字段，内部会解析该对象，并为实例注册观察者
  observed: {
    userId:{
      // 当userId发生变化时，此函数将会被调用，其中this的引用为小程序页面实例
      update(value) {
        console.log('In vh page, get the userId----->', value);
      },
      // 设置不获取userId的初始值，只有当userId真正产生变化的时候
      // 才会得到响应，这项设置是可选的
      initGet: false
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //访问store实例
    let store = this.$store;
    //查看state状态树
    let state = this.$store.state;

    //通过getters对象访问具体的state属性
    let list = this.$getters.groupList;

    //发起一个action，引起状态变更
    this.setupLogin();
  },
  // ...
  ...mapActions(['setupLogin'])
  })
);

```

更多关于`beleaf`的使用细节，您可以访问模块的[GitHub项目仓库](https://github.com/begoniajs/begonia-leaf)，详细了解。

## 说明文档和开发文档

诚如所见，为方便使用，`beleaf`在API的名称设计上借鉴了很多[vuex框架](https://vuex.vuejs.org/zh/)的API名称，
不过内部实现和实际使用还是不同的。限于其使用的场景，beleaf追求够用即好。

如果想要具体了解各种使用方法，可以查看如下文档:

> 正在加紧撰写...

# 开源协议

MIT
