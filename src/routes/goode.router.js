import express from "express";
import bcrypt, { compareSync } from "bcrypt";
import {prisma} from '../utils/prisma/index.js';

console.log("<===Applyed goodsRouter===>");

const router=express();

router.get('/',(req,res)=>{return res.status(200).json({Message:"상품들의 모습입니다!"})});

//상품 생성
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

//상품 조회
router.get('/goods',async(req,res,next)=>{
    const goods=await prisma.goods.findMany({
        select: {
            goodsname:true,
            status:true
        }
    });
    return res.status(200).json({goods});
});

//상품 상세 조회
router.get('/goods/:goodsid',async(req,res)=>{
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

export default router;