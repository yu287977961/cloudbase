const tcb = require("@cloudbase/node-sdk");

const cloud = tcb.init({
  env: "env-wosjodal",
  credentials: require('key.json')
});

const db = cloud.database();
const _ = db.command;
exports.main = async (event, context) => {
    let res = {};
    let ID = event.queryStringParameters.ID;
    let IK = event.queryStringParameters.IK;
    if(ID!=null&&IK!=null){
        const ids = (await db.collection('admin').where({
          ID:ID,
          IK:IK
        }).get()).data;
        if(ids.length!=0){
          res.ticket = cloud.auth().createTicket(ids[0]._id, {
            refresh: 10 * 60 * 1000
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