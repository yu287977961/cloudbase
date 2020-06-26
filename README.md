# 第四章作业
思路：把云函数调用修改成数据库实时监听，任务二把admin里面的100条数据读取和promiseall拉取过来

```
let res = {};
  const auth = cloud.auth().getUserInfo();
  const uid = auth.customUserId;
  if(uid!=null){
    const ids = (await db.collection('admin').where({
        _id:uid
      }).get()).data;
      if(ids.length!=0){
        console.log(ids[0]);
        const countResult = await db.collection('advice').count();
        const total = countResult.total;
        const batchTimes = Math.ceil(total / 100);
        const tasks = []
        for (let i = 0; i < batchTimes; i++) {
          const promise = await db.collection('advice').skip(i * MAX_LIMIT).limit(MAX_LIMIT).orderBy('adddue', 'desc').get();
          tasks.push(promise);
        }
        res.list = (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data),
            errMsg: acc.errMsg,
          }
        }).data;
        res.code = 0;
      }
      else{
        res.code = 1;
      }
  }
  else{
    res.code = 404;
  }
  return res;
  ```


  # 第五章作业

思路：按照文档把util的cloudtohttp改成异步，并且将index当中的refresh改成异步即可