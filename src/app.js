import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import goodsRouter from "./routes/goode.router.js"
//routes


//middlewares
import logMiddleware from "./middlewares/log.middleware.js";
import errorhandlermiddleware from './middlewares/errorhandler.middleware.js';

const app=express();
const PORT=3019;

//req.body에 접근해 body의 데이터로 사용하기 위함
app.use(express.json()); //백엔드의 방법
app.use(express.urlencoded({ extended: true })); //프론트엔드의 방법

app.get("/", (req, res) => {
    return res.json({ Message: "This mainpage" });
  });


app.use("/api",[goodsRouter]);


app.use(errorhandlermiddleware);

app.listen(PORT,()=>{
    console.log(`${PORT}번 포트로 서버가 열렸어요`);
})