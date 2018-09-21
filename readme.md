### bs-keep-route

---
由于业务发展需要在两个不同的路由切换后保留之前页面的状态，但是react-route3是独占式路由：即渲染匹配的路由、卸载未匹配的路由且只能渲染一个；react-route4同时支持独占式和非独占式，但是在目前的路由架构中react4一般用Switch启用独占式路由。基于以上情况需要对route进行改造以满足要求

---


### Usage

```
import {KeepSwitch, KeepRoute} from 'bs-keep-route'
        <KeepSwitch>
          {
            routes.map(({keepLive = false, Component, path, ...dynamics}, key) => {
              return <KeepRoute key={key}
                alwaysLive={true}
                exact
                path={path}
                component={<Component/>}/>
            })
          }
        </KeepSwitch>
```
### TIPS

---
在目前用Dva框架的情况下，由于他的组件是动态加载导致一开始拿不到路由的DOM引用，这里引入HOC处理一下

---
```
import {KeepSwitch, KeepRoute} from 'bs-keep-route'

const HOC = (ComponentCreator) => () => {
    return <div><ComponentCreator/></div>
  }
        <KeepSwitch>
          {
            routes.map(({keepLive = false, Component, path, ...dynamics}, key) => {
              return <KeepRoute key={key}
                alwaysLive={true}
                exact
                path={path}
                component={HOC(dynamic({app, ...dynamics}))}/>
            })
          }
        </KeepSwitch>
```
### 优化

---
 不是所有的路由我们都希望保留状态，而且这种保留路由的结构其实会影响应用的表现，所以不需要保留的我们可以卸载启用原生Route组件、反之使用KeepRoute
 

---
