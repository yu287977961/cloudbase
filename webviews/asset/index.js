const cloudId = 'env-wosjodal';//云开发环境ID
const cloud = tcb.init({
	env: cloudId
})
const auth = cloud.auth();

let initFlag = false;//云开发初始状态
let uid = null;//云开发唯一用户id
let imagearray = {};//选择的图片
let pushinarray = {};//已经渲染处理的图片，用于图片渲染
let maxlength = 5;//最大图片上传数量
let submitflag = false;//提交状态，防止重复点击
let advicelist = {};//意见列表

init();

function init(){
    signInAnonymously();
}

/**
 * 初始化云开发：匿名登录
 */
function signInAnonymously() {
    auth.anonymousAuthProvider().signIn()
    .then((res)=>{
        // console.log(res);
        // let loginState = auth.hasLoginState();
        // uid = loginState.user.uid;
        uid = JSON.parse(window.localStorage.getItem('anonymous_uuid_'+cloudId)).content;
        initFlag = true;
        initlist();
    })
}

/**
 * 加载意见列表（调用云函数：init）
 */
function initlist(){
    // cloud.callFunction({
    //     name: 'init'
    // })
    // .then((res) => {
    //     refreshlist(res.result.list);
    // });
    cloud.database().collection('advice').where({
        _openid:uid
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
 * 删除提出的意见
 * @param {*} id 意见id
 */
function deladvice(id){
    if(confirm('是否要删除这个意见？')){
        const tempimgs = advicelist[id].imgs;
        cloud.database().collection('advice').where({
            _id:id
        }).remove(
        function(err, res) {
            if(tempimgs!=null && tempimgs.length!=0){
                //删除图片
                cloud.deleteFile({
                    fileList: tempimgs
                  })
                  .then(res => {
                      alert('删除成功！');
                    //   initlist()
                  });
            }
            else{
                alert('删除成功！');
                // initlist();
            }
        });
    }
}

/**
 * 检查云开发有无初始化，通过initflag
 */
function cloudCheck(){
    if(initFlag == false){
        alert('云开发还未初始化，请稍后再试或刷新页面！');
    }
    return initFlag;
}

/**
 * 重新渲染意见列表
 * @param Array list 意见列表
 */
async function refreshlist(list){
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

        if(tempitem.retext!=null&&tempitem.retext!=""){
            let itemretext = document.createElement('div');
            itemretext.setAttribute('class','list-item-retext');
            itemretext.innerText = tempitem.retext;
            listitem.appendChild(itemretext);
        }

        if(tempitem.imgs!=null && tempitem.imgs.length!=0){
            let itemimages = document.createElement('div');
            itemimages.setAttribute('class','list-item-images');

            for(let n in tempitem.imgs){
                let img = document.createElement('img');
                img.src = await cloudtohttp(tempitem.imgs[n]);
                console.log(img.src)
                img.setAttribute('onclick','previewnetimg("'+img.src+'")');
                itemimages.appendChild(img);
            }
            listitem.appendChild(itemimages);
        }

        let itemdate = document.createElement('div');
        itemdate.setAttribute('class','list-item-date');
        itemdate.innerText = dateFormat("YYYY-mm-dd HH:MM",new Date(tempitem.adddue));
        listitem.appendChild(itemdate);

        let itemdel = document.createElement('div');
        itemdel.setAttribute('class','list-item-del');
        itemdel.setAttribute('onclick','deladvice("'+tempitem._id+'")');
        itemdel.innerText = '删除';
        listitem.appendChild(itemdel);
        
        el.appendChild(listitem);
    }
}

/**
 * 选择多个图片(UI上传自动触发，无需主动调用)
 * 维系全局变量：imagearray
 * @param files obj 
 */
function chooseimage(obj){
    let files = obj.files;
    let imageKeys = Object.keys(imagearray);
    let savenum = maxlength - imageKeys.length;
    if(savenum==0&&files.length!=0){
        alert('最多只能上传'+maxlength+'张图片')
    }
    savenum = files.length > savenum ? savenum : files.length;
    for (var i = 0; i < savenum; i++) {
        imagearray[files[i].lastModified]=files[i];
    }
    RefreshImage();
}

/**
 * 删除选择的单个图片（UI触发，无需js调用）
 * @param {*} id 图片的时间戳
 */
function deleteImg(id){
    delete imagearray[id];
    RefreshImage();
}

/**
 * 渲染选择的图片（chooseimage、deleteImg函数触发，无需其他调用）
 */
function RefreshImage() {
    let el = document.getElementById("imgcontent");
    for (let n in pushinarray){
        pushinarray[n].flag = false;
    }
    for (var i in imagearray) {
        if(pushinarray[i]==null){
            const tempimg = imagearray[i];
            pushinarray[i] = tempimg;
            pushinarray[i].flag = true;
            let imgcover = document.createElement('div');
            imgcover.setAttribute('class','imgcover');
            imgcover.setAttribute('id',i);

            let img = document.createElement('img');
            img.setAttribute('id',i+'-img');

            let delicon = document.createElement('div');
            delicon.setAttribute('onclick','deleteImg('+i+')');
            delicon.setAttribute('class','delicon');

            imgcover.appendChild(delicon);
            imgcover.appendChild(img);
            el.appendChild(imgcover);
            var reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
                img.setAttribute('onclick','previewnetimg("'+img.src+'")');
            }
            reader.readAsDataURL(tempimg);
        }
        else{
            pushinarray[i].flag = true;
        }
    }
    for (let n in pushinarray){
        if(pushinarray[n].flag == false){
            let idObject = document.getElementById(n);
            if (idObject != null) idObject.parentNode.removeChild(idObject);
        }
    }
}

/**
 * 意见提交执行
 */
function submit(){
    if(cloudCheck()){
        if(submitflag==false){
            let advicetext = document.getElementById('advicetext').value;
            
            if(advicetext.length>=20){
                refreshSubmitFlag();
                let imageKeys = Object.keys(imagearray);
                if(imageKeys.length==0){
                    submittext();
                }
                else{
                    for(let item in imagearray){
                        cloudupload(imagearray[item]);
                    }
                }
            }
            else{
                alert('建议至少需要20字才可提交！')
            }
        }
    }
}

/**
 * 提交状态切换（每次调用都会反转）
 */
function refreshSubmitFlag(){
    if(submitflag==false){
        submitflag = true;
        let submitbtn = document.getElementById('submitbtn')
        submitbtn.style="cursor:no-drop;";
        submitbtn.innerText="提交中";
    }
    else{
        submitflag = false;
        let submitbtn = document.getElementById('submitbtn')
        submitbtn.style="";
        submitbtn.innerText="提交反馈";
    }
}

/**
 * 重置意见编辑区
 */
function resetInput(){
    document.getElementById('number').value = "";
    document.getElementById('advicetext').value = "";
    document.getElementById('imgcontent').innerHTML="";
    imagearray = {};
    pushinarray = {};
}

/**
 * 意见提交发起函数
 * 注意：有图片时需要在每次图片传输后执行此函数
 * 先判断所有图片上传成功再继续执行
 */
function submittext(){
    let imgs=[];
    console.log(imagearray);
    for(let item in imagearray){
        if(imagearray[item].upload!=true){
            return;
        }
        imgs.push(imagearray[item].cloud);
    }
    let number = document.getElementById('number').value;
    let advicetext = document.getElementById('advicetext').value;
    console.log(advicetext,number);
    cloud.database().collection('advice').add({
        advice:advicetext,
        number:number,
        imgs:imgs,
        adddue:new Date()
    }, function(err, res) {
        resetInput();
        refreshSubmitFlag();
        // initlist();
        alert('意见提交成功！');
    });
}

/**
 * 图片上传执行函数
 * 注意：每次上传完毕后都执行submittext函数
 * @param {*} file 
 * @param {*} check 
 */
function cloudupload(file,check){
    cloud.uploadFile({
        cloudPath: 'advice/'+uid+'/'+file.lastModified+'-'+file.name,
        filePath: file
    },
    function(err, res){
        if(res){
            imagearray[file.lastModified].upload = true;
            imagearray[file.lastModified].cloud = res.fileID;
            submittext();
        }
    });
}