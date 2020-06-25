const tcb = require("@cloudbase/node-sdk");

const cloud = tcb.init({
  env: "env-wosjodal",
});
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  let res = {};
  const auth = cloud.auth().getUserInfo();
  const uid = auth.customUserId;
  if(uid!=null){
    const ids = (await db.collection('admin').where({
        _id:uid
      }).get()).data;
      if(ids.length!=0){
        console.log(ids[0]);
        console.log(event.id,event.retext);
        await db.collection('advice').where({
            _id:event.id
        }).update({
            retext:event.retext
        });
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