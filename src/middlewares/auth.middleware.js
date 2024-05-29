import jwt from 'jsonwebtoken';
import {prisma} from '../utils/prisma/index.js';



// 1. 클라이언트로 부터 **쿠키(Cookie)**를 전달받습니다.
export default async function (req,res,next) {
    
    try {
    const {authorization}=req.cookies;

    

    const [tokenType,token]=authorization.split(' ');//문자열을 분리하여 타입과 토큰을 분리

    // 2. **쿠키(Cookie)**가 **Bearer 토큰** 형식인지 확인합니다.
    if (tokenType!=='Bearer') throw new Error('토큰 타입이 일치하지 않습니다.');

    // 3. 서버에서 발급한 **JWT가 맞는지 검증**합니다.
    const decodedToken = jwt.verify(token,'customized_secret_key'); //서버의 customized_secret_key와 대조

    // 4. JWT의 `userId`를 이용해 사용자를 조회합니다.
    const userId=decodedToken.userId;
    const User=await prisma.users.findFirst({
        where: {
            userid:+userId
        }
    });
    
    if (!User) {
        res.clearCookie('authorization');
        throw new Error("존재하지 않는 사용자");
    }
    
    req.user=User;  //req.body에 User값을 넣었다.

    // 6. 다음 미들웨어를 실행합니다.
    next();
    }
    catch (error) { 
        res.clearCookie('authorization');        //쿠키를 삭제시킨다.
        switch(error.name) {
            case 'TokenExpiredError':   //토큰이 만료되었을 때 발생
                return res.status(401).json({message:"토큰이 만료되었습니다."});
            case 'JsonWebTokenError':   //토큰에 검증이 실패했었을 때 발생
                return res.status(401).json({message:"토큰 검증이 실패했습니다"});
            default:
                return res.status(401).json({message: error.message?? "비 정상적인 요청입니다."});
        }
    }

    
}






// 5. `req.user` 에 조회된 사용자 정보를 할당합니다.
