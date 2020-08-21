/*********获取购物车数据进行渲染************/

class Cart{
    constructor(){
        this.list();
        //给全选按钮绑定事件
        all(".check-all")[0].addEventListener("click",this.checkAll);
        all(".check-all")[1].addEventListener("click",this.checkAll);
    }

/*******购物车列表*******/
list(){
    //根据购物状态获取商品
    let userId=localStorage.getItem("userId");
    //声明保存购物车商品id的变量
    let cartGoodsId="";
    if(userId){
        //2存在则去cart中获取id,设置get请求
        ajax.get("./server/cart.php",{fn:"getGoodsId",userId:userId}).then(res=>{
            // console.log(res);
           let {data,stateCode}=JSON.parse(res);
           if(stateCode==200){
            //    console.log(data)
               //购物车数据为空则停止
               if(!data)return;
               //将商品id和数量保存为对象
             let cartIdNum={};
             data.forEach(ele => {
                 cartGoodsId+=ele.productId+",";//取出productId的值用,进行拼接
                 cartIdNum[ele.productId]=ele.num;

             })
             //根据id获取商品信息
            //  console.log(cartIdNum);
            // console.log(cartGoodsId);
            Cart.getCartGoods(cartGoodsId,cartIdNum)
           }         
        })
    }else{
        //未登录就去获取浏览器数据
        let cartGoods=localStorage.getItem("carts");
        //3-1为空则停止
        if(!cartGoods)return;
        cartGoods=JSON.parse(cartGoods);
        // console.log(cartGoods);
        //3-2循环遍历,获取商品id
        for(let gId in cartGoods){
            // console.log(gId);
            cartGoodsId+=gId+","
        }
        // console.log(cartGoods)
        Cart.getCartGoods(cartGoodsId)
    }

}
/*******根据购物车商品id,去商品表获取商品信息*********/
static getCartGoods(gId,cartIds=""){
    // console.log(gId);
    //如果是登录状态,商品数量从cartIds,未登录从浏览器
    cartIds=cartIds||JSON.parse(localStorage.getItem("carts"));
    // console.log(cartIds)
    // //请求数据
    ajax.post("./server/cart.php?fn=lst",{goodsId:gId}).then(res=>{
        // console.log(res);
        // 1.转化数据,获取data
        let{data,stateCode}=JSON.parse(res);
        if(stateCode==200){
            let str="";
            data.forEach(ele=>{
                // console.log(ele)

                //追加到页面上
                str += `<tr>
                <td class="checkbox"><input class="check-one check" type="checkbox"/ onclick="Cart.goodsCheck(this)"></td>
                <td class="goods"><img src="${ele.goodsImg}" alt=""/><span>${ele.goodsName}</span></td>
                <td class="price">${ele.price}</td>
                <td class="count">
                    <span class="reduce" onclick="Cart.decGoodsNum(this,${ele.id})">-</span>
                    <input class="count-input" type="text" value="${cartIds[ele.id]}"/>
                    <span class="add" onclick="Cart.addGoodsNum(this,${ele.id})">+</span></td>
                <td class="subtotal">${(ele.price * cartIds[ele.id]).toFixed(2)}</td>
                <td class="operation"><span class="delete" onclick='Cart.delGoods(this,${ele.id})'>删除</span></td>
            </tr>`
            })
            $("tbody").innerHTML=str;
        }
    })
}
/********商品的删除********/
static delGoods(eleobj,gId){
    let userId=localStorage.getItem("userId");
    if(userId){
        ajax.get("./server/cart.php",{fn:"delete",goodsId:gId,userId:userId}).then(res=>{
            // console.log(res);

        })
    }else{
        //从浏览器取出购物车数据
        let cartGoods=JSON.parse(localStorage.getItem("carts"));
        // console.log(cartGoods);
        delete cartGoods[gId];
        // console.log(cartGoods);
        localStorage.setItem("cats",JSON.stringify(cartGoods));
    }
    eleobj.parentNode.parentNode.remove();
    Cart.cpCount();
}
/******价格和数量计算******/
static cpCount(){
    //1获取页面上的所有check-one
    let checkOne=all(".check-one");
    let count=0;
    let xj=0;
    checkOne.forEach(ele=>{
        if(ele.checked){
            // console.log(ele);
            //找到当前input对应的tr
            let trobj=ele.parentNode.parentNode;
            //4获取数量和小计
            let tmpCount=trobj.getElementsByClassName("count-input")[0].value;
            let tmpxj=trobj.getElementsByClassName("subtotal")[0].innerHTML;
            count=tmpCount-0+count;
            xj=tmpxj-0+xj;

        }
    })
// console.log(count,xj)

    //放到页面中
    $("#selectedTotal").innerHTML=count;
    $("#priceTotal").innerHTML=parseInt(xj*100)/100;
}


/*******数据数量的增加********/
static addGoodsNum(eleobj,gId){
    //1.修改input的数量
    // console.log(eleobj);
    let inputNumObj=eleobj.previousElementSibling;
    // console.log(inputNumObj)
     inputNumObj.value=inputNumObj.value-0+1;
     //2判断登录的状态,修改数据库或浏览器的数量
     if(localStorage.getItem("user")){
        Cart.updateCart(gId,inputNumObj.value);

     }else{
         Cart.updateLocal(gId,inputNumObj.value)
     }
    //3 实现小计的计算
    //3-1获取价格的节点
    let priceobj=eleobj.parentNode.previousElementSibling;

    eleobj.parentNode.nextElementSibling.innerHTML=(priceobj.innerHTML*inputNumObj.value).toFixed(2);
    Cart.cpCount();


}
/*********cart中修改数量***********/
static updateCart(gId,gNum){
    let id=localStorage.getItem("userId");
    ajax.get("./server/cart.php",{fn:"update",goodsId:gId,goodsNum:gNum,userId:id}).then(res=>{
        console.log(res)
    })
}
/******浏览器中数据的修改******/
static updateLocal(gId,gNum){
    let cartGoods=JSON.parse(localStorage.getItem("carts"));
    cartGoods[gId]=gNum;
    localStorage.setItem("carts",JSON.stringify(cartGoods))
}




/*********实现全选**********/
checkAll(){
    // console.log(this)
    let state=this.checked;//checked是input的状态
    // console.log(state)
  //让两个全选按钮绑定
    all(".check-all")[this.getAttribute("all-key")].checked=state;//给全选按钮添加一个all-key的标签.赋值为选中等于点击的状态.
  //让所有的标签选中
let checkGoods=all(".check-one");
checkGoods.forEach(ele=>{
    // console.log(ele)
    ele.checked=state;
})
Cart.cpCount();
}
/******实现单选********/
static goodsCheck(eleobj){
    // console.log(eleobj);
    let state=eleobj.checked;
    if(!state){
        all(".check-all")[0].checked=false;
        all(".check-all")[1].checked=false;
    }else{
        //所有单选选中之后,全选也选上
        //2-1获取所有的单选框
        let checkOne=all(".check-one");
        let len=checkOne.length;

        //2-2计算选中的单选框
        let checkCount=0;
        checkOne.forEach(ele=>{
            ele.checked&&checkCount++
        })
        //2-3单个选中的个数等于数据的长度,则全选选上
        if(len==checkCount){
            all(".check-all")[0].checked=true;
            all(".check-all")[1].checked=true;
        }

    }
    Cart.cpCount();
}

/******数量的减少********/
static decGoodsNum(eleobj,gId){
    //修改input的数量
    // console.log(eleobj);
    let inputNumObj=eleobj.nextElementSibling;
    // console.log(inputNumObj)
    inputNumObj.value=inputNumObj.value-0-1;
    if(localStorage.getItem("user")){
        Cart.updateCart(gId, inputNumObj.value);
    }else {
        Cart.updateLocal(gId, inputNumObj.value)
      }
       // 3 实现小计的计算
    //  3-1 获取价格的节点
    let priceObj = eleobj.parentNode.previousElementSibling;
    eleobj.parentNode.nextElementSibling.innerHTML = (priceObj.innerHTML * inputNumObj.value).toFixed(2);

    // 计算价格和数量
    Cart.cpCount();
}


}


new Cart;