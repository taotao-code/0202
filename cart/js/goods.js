class Goods{
    constructor(){
        this.list();
        //绑定登录按钮的节点
     $("#login").addEventListener("click",this.login);
     $("#exit").addEventListener("click",this.exit);

    }

//实现商品列表
list(){
//    1.发送ajax请求
ajax.get("./server/goods.php",{fn:"lst"}).then(res=>{
    // console.log(res);  
    let{stateCode,data}=JSON.parse(res);
// console.log(stateCode,data);
  let str="";
  data.forEach(ele => {
    //   console.log(ele);
    str+= `<div class="goodsCon"><a target = "_blank" >
    <img src="${ele.goodsImg}" class="icon"><h4 class="title">${ele.goodsName}</h4>
    <div class="info">限时抢购200条</div></a><div class="priceCon">
    <span class="price">￥${ele.price}</span>
    <span class="oldPrice">￥${(ele.price * 1.2).toFixed(2)}</span>
    <div><span class="soldText">已售${ele.num}%</span>
    <span class="soldSpan"><span style="width: 87.12px;">
    </span></span></div>
    <a class="button" target="_blank" onclick="Goods.addCart(${ele.id},1)">立即抢购</a></div></div >`;
  });

  //4获取divs,将数据追加到页面中
  $(".divs").innerHTML=str
})
}

/*****数据加入购物车******/
static addCart(goodsId,goodsNum){
    //判断当前用户是否登录
    if(localStorage.getItem("user")){
        // 2.登录则存入数据库
    Goods.setDataBase(goodsId, goodsNum)

    }else{//没有登录则存入浏览器
    Goods.setLocal(goodsId, goodsNum)
    }
}

/****存入数据库的方法*****/
static setDataBase(goodsId, goodsNum){
    //    1.获取当前用户的id
    let userId=localStorage.getItem("userId");
    // 2.发送ajax请求,进行储存
    ajax.post("./server/goods.php?fn=add",{userId:userId,gId:goodsId,gNum:goodsNum}).then(res=>{
        // console.log(res);
    });
}

/******存储到浏览器的方法*******/

static setLocal(goodsId, goodsNum){
    // 1.取出local中的数据
    let carts=localStorage.getItem("carts")
    // 2.判断是否有数据,存在则判断当前商品是否存在
    if(carts){
        console.log(carts);
    //   2-1转化为对象
    carts=JSON.parse(carts);
    //循环carts,判断当前商品是否存在,存在则数量增加
    for(var gId in carts){
        if(gId==goodsId){
            goodsNum=carts[gId]-0+goodsNum;
        }
    }
    // 2-3不存在就新增,存在就重新给数量
     carts[goodsId]=goodsNum;

     localStorage.setItem("carts",JSON.stringify(carts))
    }else{
        // 3没有数据就新增,保存商品id和数量
       let goodsCart={[goodsId]:goodsNum};
       //3-1转化为json进行储存
       goodsCart=JSON.stringify(goodsCart);
       localStorage.setItem("carts",goodsCart)
    
    }
}


/******登录按钮的实现********/
login(){
    // console.log(111)判断事件是否设置成功
localStorage.setItem("user","zs");
localStorage.setItem("userId",1);
}
/*****退出按钮*****/
exit(){
    // console.log(111)判断事件是否设置成功
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
}
}

new Goods;