const tcb = require("@cloudbase/node-sdk");

const cloud = tcb.init({
  env: "env-wosjodal",
});
const db = cloud.database();
const _ = db.command;
exports.main = async (event, context) => {
  // let res = {};
  // const auth = cloud.auth().getUserInfo();
  // const uid = auth.uid;
  // res.list = (await db.collection('advice').where({
  //   _openid:uid
  // }).get()).data;
  // res.code = 0;
  // return res;
  let res = {};
  const auth = cloud.auth().getUserInfo();
  const uid = auth.uid;
  if(uid!=null){
    const ids = (await db.collection('admin').where({
      _openid:uid
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
}; 