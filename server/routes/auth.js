const authRoutes = require("express").Router();
const { User } = require("./../models/user");
const bcrypt = require("bcrypt");
const ldap = require('ldapjs');

authRoutes.post("/login", async (req, res) => {
  let { email, password } = { ...req.body };

  let response = await User.findOne({ email: email });
  if(response != null) {
    let bcryptRes = await bcrypt.compare(password, response.password);
    if (bcryptRes) {
      return res.status(200).json({ message: "User Login Successfully", user: response }).end();
    } else {
      return res.status(500).json({ message: "Email or Password Invalid" }).end();
    }
  } else {
    return res.status(500).json({ message: "User Not Found" }).end();
  }
});

// authRoutes.post('/login', (req, res) => {
//   let { email, password } = { ...req.body };
//   const client = ldap.createClient({
//     url: "ldap://auth.gndec.ac.in",
//     bindDN: `ou=people,dc=auth,dc=gndec,dc=ac,dc=in`,
//   });

//   client.bind(
//     `uid=${email},ou=people,dc=auth,dc=gndec,dc=ac,dc=in`,
//     password,
//     (error, response) => {
//       if(error) {
//         return res.status(500).json({ data: { ...error }, message: 'Error' }).end();
//       } else {
//         return res.status(200).json({ data: { ...response }, message: 'Successfull' }).end();
//       }
//     }
//   )
// });

module.exports = { authRoutes };
