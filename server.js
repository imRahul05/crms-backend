const express = require('express');
require('dotenv').config();
const cors = require("cors");
const userRouter = require('./routes/user.route');
const connectToDB = require('./configs/mongo.js');

const app = express();
const PORT = process.env.PORT;


app.use(express.json());
app.use(cors({
    origin: [
        "https://crms-frontend-theta.vercel.app",
        "http://localhost:5173"
    ],
    credentials: true,
}));
// app.options('*', cors());
app.use('/api/user',userRouter)

app.get('/test', (req, res) => {
    res.status(200).json({msg:'Server is running! testing success'});
});
app.use((req,res)=>{
    res.status(404).json({msg:'route not found'})
})

app.listen(PORT, () => {
    connectToDB();
    console.log(`Server started on port ${PORT}`);
});