import express from 'express';
import dotenv from 'dotenv';
import ip from 'ip';
import multer from 'multer';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
})


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, '')
//     },
//     // filename: function (req, file, cb) {
//     //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     //   cb(null, file.fieldname + '-' + uniqueSuffix)
//     // }
// })


const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '')
    },
    // filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //   cb(null, file.fieldname + '-' + uniqueSuffix)
    // }
})


const upload = multer({ storage: storage }).single('image')



app.post('/upload', upload, (req, res) => {
    console.log(req.file)
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1]
    // res.send({
    //     message: "Hello World"
    // })

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType}`,
        Body : req.file.buffer
    }

    s3.upload(params, (error, data) => {
        if(error) {
            res.status(500).send(error);
        }

        res.status(200).send(data);
    })
})




const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server Start At ${ip.address()}:${port}`);
})