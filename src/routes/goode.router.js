import express from "express";
import bcrypt, { compareSync } from "bcrypt";
import {prisma} from '../utils/prisma/index.js';

console.log("<===Applyed goodsRouter===>");

const router=express();

router.get('/',(req,res)=>{return res.status(200).json({Message:"상품들의 모습입니다!"})});
try {
//상품 생성 API
router.post('/goods',async(req,res,next)=>{
    const {goodsname,goodsinfo,password,manager,status}=req.body;

    if (!goodsname|!goodsinfo|!password) {
        return res.status(200).json({ErrorMessage:"제시한 정보가 완벽하지 않습니다!"});
    }

    const hashedpassword=await bcrypt.hash(password,10);

    const goods=await prisma.goods.create({
        data:{
            goodsname,goodsinfo,password:hashedpassword,manager,status
        }
    });

    return res.json({Message:"상품이 성공적으로 생성되었습니다"});
});

//상품 조회  API=========================
router.get('/goods',async(req,res,next)=>{
    const goods=await prisma.goods.findMany({
        select: {
            goodsname:true,
            status:true
        }
    });
    return res.status(200).json({goods});
});

//상품 상세 조회 API
router.get('/goods/:goodsid',async(req,res,next)=>{
    const goodsid=req.params.goodsid;
    const good=await prisma.goods.findFirst({
        where: {
            goodsid:+goodsid
        },select: {
            goodsid:true,goodsname:true,goodsinfo:true,manager:true,status:true,createdAt:true,updatedAt:true
        }
    });
    return res.status(200).json({good});
});

//상품 수정 API=========================
router.put('/goods/:goodsid',async(req,res,next)=>{
    const goodsid=req.params.goodsid;

    const {goodsinfo,password}=req.body;
    if (!goodsinfo||!password) return res.status(401).json({ErrorMessage:"비밀번호나 수정할 데이터가 없습니다."});
    
    const goodspassword=await prisma.goods.findFirst({
        where:{goodsid:+goodsid},select: {
            password:true
        }
    });
    
    console.log(await bcrypt.hash(password,10));
    console.log(goodspassword.password);

    if (!(await bcrypt.compare(password,goodspassword.password))) {

        return res.status(401).json({ErrorMessage:"존재하지 않는 비밀번호입니다!"});
    }
    const updatedGoods = await prisma.goods.update({
        where: { goodsid: +goodsid },
        data: { goodsinfo: goodsinfo }
    });
    return res.status(200).json({Message:"성공적으로 수정되었습니다."})
});

//상품 삭제 API=========================
router.delete('/goods/:goodsid',async(req,res,next)=>{
    const {password}=req.body;
    const goodsid=req.params.goodsid;
    const good=await prisma.goods.findFirst({
        where: {
            goodsid:+goodsid
        }

    });
    if (!good) return res.status(404).json({ErrorMessage:"존재하지 않는 상품입니다!"});
    //return res.status(200).json({"Message":"코드가 성공적으로 실행되었습니다"});
    if (!(await bcrypt.compare(password,good.password))) {{
        return res.status(401).json({ErrorMessage:"존재하지 않는 비밀번호입니다!"});
    }};

    const deleteGoods=await prisma.goods.delete({
        where:{
            goodsid:+goodsid
        }
    })
    return res.status(200).json({Message:"성공적으로 상품정보가 삭제되었습니다."})
});
}catch(err) {
    next(err);
}

export default router;