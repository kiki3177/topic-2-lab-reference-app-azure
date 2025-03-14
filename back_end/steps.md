# Initialize Backend Environment

```shell
cd backend
npm init -y
npm install express

```





# Write code based on intro code

```javascript
// example intro code for app.js
const express = require("express");
const app = express();
 
//   处理请求
app.get("/list",(req,res)=>{
    let list = [
        {name:"张三",age:13},
        {name:"李四,age:33},
        {name:"王五",age:22}
    ];
    res.json(list);    //    将数据返回给服务端
});
app.listen("3000",()=>{
    console.log("=========服务启动了，在3000端口=========");
});
```


# run service

```shell
node app.js
```
