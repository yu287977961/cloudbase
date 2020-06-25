const cloudId = 'env-wosjodal';//云开发环境ID
const cloud = tcb.init({
	env: cloudId
})
const auth = cloud.auth({persistence: "session"});
let initFlag = false;//云开发初始状态
let uid = null;//云开发唯一用户id
let advicelist = {};//意见列表
const db = cloud.database();
const _ = db.command;
console.log(_)

init();

/**
 * 初始化（判断是否登录）
 */
function init(){
    //判断是否有登录
    const loginState = auth.hasLoginState();
    //未登录则进行自定义登录
    if(!loginState){
        let id = prompt("请输入管理ID","");
        if(id){
            let ik = prompt("请输入管理IK","");
            if(ik){
                //todo http请求拿到自定义登录的ticket
                calls({
                    url:'https://'+cloudId+'.service.tcloudbase.com/adminlogin',
                    data:{
                        ID:id,
                        IK:ik
                    },
                    success(res){
                        console.log(res);
                        if(res.code==0){
                            signInWithTicket(res.ticket);
                        }
                        else{
                            alert('身份验证错误，登录失败！');
                        }
                    },
                    fail(e){
                        console.log(e);
                    }
                })
            }
        }
    }
    else{
        initload();
    }
}

/**
 * 自定义登录执行函数
 * @param string ticket 
 */
function signInWithTicket(ticket) {
	auth.customAuthProvider().signIn(ticket)
    .then(() => {
        initload();
        uid = JSON.parse(window.localStorage.getItem('anonymous_uuid_'+cloudId)).content;
        console.log(uid)
        console.log('自定义登录成功！');
    })
}

/**
 * 执行初始化置位
 */
function initload(){
    initFlag = true;
    initlist();
}

/**
 * 意见列表的加载
 */
function initlist(){
    // cloud.callFunction({
    //     name: 'init-admin'
    // })
    // .then((res) => {
    //     refreshlist(res.result.list);
    // });
    cloud.database().collection('advice').where({
        _openid: _.neq("")
    }).watch({
        onChange:function(res){
            console.log(res)
            let list = res.docs.map(item=>{
                item.adddue = new Date(item.adddue.$date);
                return item;
            })
            refreshlist(list);
        },
        onError:function(err){
            console.log(err);
        }
    });
}

/**
 * 渲染意见列表
 * @param obj list 
 */
function refreshlist(list){
    let el = document.getElementById("list");
    el.innerHTML="";
    advicelist = {};
    for(let i in list){
        let tempitem = list[i];
        advicelist[tempitem._id] = tempitem;
        let listitem = document.createElement('div');
        listitem.setAttribute('class','list-item');
        listitem.setAttribute('id',tempitem._id);

        let itemadvice = document.createElement('div');
        itemadvice.setAttribute('class','list-item-advice');
        itemadvice.innerText = tempitem.advice;
        listitem.appendChild(itemadvice);

        let itemretext = document.createElement('div');
        itemretext.setAttribute('class','list-item-retext');
        itemretext.setAttribute('id',tempitem._id+'-retext');
        itemretext.innerText = tempitem.retext||'';
        listitem.appendChild(itemretext);

        if(tempitem.imgs!=null && tempitem.imgs.length!=0){
            let itemimages = document.createElement('div');
            itemimages.setAttribute('class','list-item-images');

            for(let n in tempitem.imgs){
                let img = document.createElement('img');
                img.src = cloudtohttp(tempitem.imgs[n]);
                img.setAttribute('onclick','previewnetimg("'+img.src+'")');
                itemimages.appendChild(img);
            }
            listitem.appendChild(itemimages);
        }

        let itemdate = document.createElement('div');
        itemdate.setAttribute('class','list-item-date');
        itemdate.innerText = dateFormat("YYYY-mm-dd HH:MM",new Date(tempitem.adddue));
        listitem.appendChild(itemdate);

        let itemre = document.createElement('div');
        itemre.setAttribute('class','list-item-re');
        itemre.setAttribute('onclick','readvice("'+tempitem._id+'")');
        itemre.innerText = '回复';
        listitem.appendChild(itemre);
        
        el.appendChild(listitem);
    }
}

/**
 * 创建回复的输入框和相关按钮
 * @param {*} id 
 */
function readvice(id){
    let remodel = document.getElementById(id+'-retext');
    remodel.innerHTML="";

    let reinput = document.createElement('textarea');
    reinput.setAttribute('id',id+'-input');
    reinput.value = advicelist[id].retext||'';
    remodel.appendChild(reinput);

    let resubmit = document.createElement('button');
    resubmit.setAttribute('onclick','submitretext("'+id+'")');
    resubmit.setAttribute('class','submit');
    resubmit.innerText="提交回复";
    remodel.appendChild(resubmit);

    let recancel = document.createElement('button');
    recancel.setAttribute('onclick','cancelretext("'+id+'")');
    recancel.innerText="取消回复";
    remodel.appendChild(recancel);
}

/**
 * 提交回复
 * @param  id 
 */
function submitretext(id){
    let retext = document.getElementById(id+'-input').value;
    cloud.callFunction({
        name: 'retext',
        data:{
            id:id,
            retext:retext
        }
    })
    .then((res) => {
        if(res.result.code==0){
            let remodel = document.getElementById(id+'-retext');
            remodel.innerText=retext;
        }
    });
}

/**
 * 取消置换的回复窗口
 * @param {} id 
 */
function cancelretext(id){
    let remodel = document.getElementById(id+'-retext');
    remodel.innerText=advicelist[id].retext||'';
}

/**
 * 封装的Http请求
 * @param {*} obj 
 */
function calls(obj) {
    let xml = new XMLHttpRequest();
    let url = obj.url + '?';
    for (let item in obj.data) {
        url += (item + '=' + obj.data[item] + '&');
    }
    xml.open('GET', url, true);
    xml.send();
    xml.onreadystatechange = function () {
        if (xml.readyState === 4 && xml.status === 200) {
            obj.success(JSON.parse(xml.responseText))
        } else {
            obj.fail(xml.status);
        }
    }
}