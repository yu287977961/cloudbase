/**
 * 隐藏全屏图片
 */
function hidepreview(){
    let preview = document.getElementById('preview');
    preview.src = "";
    preview.parentNode.style = "display:none;";
}
/**
 * 全屏展示图片
 * @param string id 
 */
function previewnetimg(src){
    let preview = document.getElementById('preview');
    preview.src = src;
    preview.parentNode.style = "";
}

function cloudtohttp(src) {
    if(src==""){
        return "";
    }
    let first=src.indexOf('.');
    let end=src.indexOf('/',first);
    return 'https://'+src.slice(first+1,end)+'.tcb.qcloud.la/'+src.slice(end+1,src.length);
}

function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}