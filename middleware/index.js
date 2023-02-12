import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  try {
    let token = req.headers["auth-token"];

    let payload = jwt.verify(token, "zoheballadin");

    req.payload = payload
    next();

  } catch (error) {
    return res.status(401).json({message: "Invalid/ Expired Token"})
  }
};

var randomString = length =>{
    var alphanum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiJklmnopqrstuvwxyz0123456789";
  
      var str = "";
  
      for (var i = 0; i < length; i++) {
        var index = Math.floor(Math.random() * alphanum.length);
        str += alphanum[index];
      }
  
     return str
  
  }

export {verifyToken, randomString}