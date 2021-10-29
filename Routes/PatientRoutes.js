const router = require("express").Router();
const multer = require("multer");
const File = require("../models/file");
const User = require("../models/users");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const Hospital = require("../models/hospital");
const verify = require("../verifyToken");

router.get("/", (req, res) => {
  res.json({ status: "patient done" });
});

//Register
router.post("/register", async (req, res) => {
    try {
      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(
          req.body.password,
          process.env.SECRET_KEY
        ).toString(),
      });
  
      const user = await newUser.save();
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  //login
  router.post("/login", async (req, res) => {
      try {
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(401).json("Wrong password or username!");
     
        const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
        console.log(user._id)
    
        originalPassword !== req.body.password &&
          res.status(401).json("Wrong password or username!");
    
        const accessToken = jwt.sign(
          {},
          process.env.SECRET_KEY,
          { expiresIn: "1d" }
        );
    
        const { password, ...info } = user._doc;
    
        res.status(200).json({ ...info, accessToken });
      } catch (err) {
        res.status(500).json(err);
      }
    });

const storage = multer.diskStorage({
  //destination for files
  destination: function (request, file, callback) {
    callback(null, "uploads");
  },

  //add back the extension
  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

//upload parameters for multer
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

router.post("/upload", upload.single("image"), async (request, response) => {
  console.log(request.file);
  console.log(request.body);
  const file = new File({
    name: request.file.filename,
  });

  try {
    file = await file.save();
    console.log("File uploaded successfully")

    response.status(200).json("File uploaded successfully");
  } catch (error) {
    response.status(500).send(error)
  }
});

//get all hospitals

router.get("/hospitals", verify, async (req, res) => {
  const query = req.query.new;
    try {
      
      const hospitals = query
        ? await Hospital.find().sort({ _id: -1 }).limit(5)
        : await Hospital.find({}, "-password" );
        
      res.status(200).json(hospitals);
    } catch (err) {
      console.log(err)
      res.status(500).send(err);
    }
  } 
);

module.exports = router;
