const {
    express,
    mongoose,
    PORT,
    HospitalController,
    PatientController
} = require("./imports.js");


const dotenv = require("dotenv");
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const fs = require('fs')


const app = express();

//use the middleware of bodyParser
app.use(bodyParser.urlencoded({extended:true}))


dotenv.config();

app.use(express.json());
console.log(__dirname);


app.use('/api/hospitals',HospitalController);
app.use('/api/patients',PatientController);



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// app.use("*/static/", express.static(__dirname + '/public/static/'));

app.use(express.static(__dirname+"/public"));
