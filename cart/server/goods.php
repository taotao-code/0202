<?php
//导入mysql文件
include("./mysql.php");
//获取ajax的请求方法
$fn=$_GET["fn"];
$fn();
function lst(){
    $sql="select*from product";//查询数据库数据
    $data=select($sql);
// print_r($data);

echo json_encode([
    'stateCode'=>200,
    'state'=>'success',
    'data'=>$data
  ]);

}

//添加的方法
function add(){
  $userId=$_POST["userId"];
  $gId=$_POST["gId"];
  $gNum=$_POST["gNum"];

  $sql="insert into cart(userId,productId,num,size) values('$userId','$gId','$gNum',40) on duplicate key update num=num+$gNum";
  //  echo $sql;die;
  $res=query($sql);
  if($res==1){
    echo json_encode([
      'stateCode'=>200,
      'state'=>'success',
      'data'=>''
    ]);
  }else{
    echo json_encode([
      'stateCode'=>201,
      'state'=>'error',
      'data'=>''
    ]);
  }

}




?>