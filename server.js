const express = require('express');
require('dotenv').config();
const cors = require("cors");
const userRouter = require('./routes/user.route');
const connectToDB = require('./configs/mongo.js');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const fs = require('fs');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT;

const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const accessLogStream = fs.createWriteStream('./access.log', { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
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