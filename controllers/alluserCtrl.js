const Users = require('../models/alluserModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { create } = require('../models/alluserModel');
const asyncHandler = require('express-async-handler')

const isEmpty = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === 'object' && Object.keys(value).length === 0) ||
  (typeof value === 'string' && value.trim().length === 0)
//Filter, Sorting, and Pagination
class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;

  }

  filtering() {
    const queryObj = { ...this.queryString }
    console.log({ before: queryObj })  //before delete page
    const excludedFields = ['page', 'sort', 'limit']
    excludedFields.forEach(el => delete (queryObj[el]))
    console.log({ after: queryObj })//after delete page

    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match)
    console.log({ queryStr })
    this.query.find(JSON.parse(queryStr))
    this.query.find(JSON.parse(queryStr))
    return this;
  }


  sorting() {

    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join('')
      console.log(sortBy)
      this.query = this.query.sort(sortBy)
    }
    else {
      this.query = this.query.sort('-createdAt')
    }
    return this;

  }


  paginating() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 3
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit)
    return this;

  }

}

const alluserCtrl = {


  updatehistory: async (req, res) => {
    try {
      const { history } = req.body;

      //if(!image) return res.status(400).json({msg: "No image Upload"})
      await Users.findOneAndUpdate({ _id: req.params.id }, {
        history
      })
      res.json({ msg: "History a Users" })

    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }

  },


  
  logout: async (req, res) => {

    try {
      res.clearCookie('refreshtoken', { path: 'user/refresh_token' })
      return res.json({ msg: "Logged Out" })

    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }

  },

  getUserByName: async (req, res) => {

    try {

      const name = req.query.name;
      if (isEmpty(name)) {
        res.status(404);
        throw new Error("Empty Search Key");
      }
      const searchedName = await Users.find({ name: { $regex: name, $options: "i" } });

      if (!searchedName) {
        res.status(404);
        throw new Error("User not Found");
      }
      res.status(201).json(searchedName);
    } catch (error) {
      throw new Error(error);
    }
  },



  getLab: async (req, res) => {
    try {
      const lab = await Users.find({ role: 'Lab' }).count()
      res.json(lab);
      console.log(lab);
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getPharm: async (req, res) => {
    try {
      const pharm = await Users.find({ role: 'Pharmacist' }).count()
      res.json(pharm);
      console.log(pharm);
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  getCP: async (req, res) => {
    try {
      const lab = await Users.find({ role: 'CP' }).count()
      res.json(cp);
      console.log(cp);
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  getPat: async (req, res) => {
    try {
      const pat = await Users.find({ role: 'Patient' }).count()
      res.json(pat);
      console.log(pat);
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },


  /*
  const code = req.params.code
  await ToLabs.findOneAndRemove({code: code})
  await TPharm.findOneAndRemove({code: code})
  */

  getDoctors: async (req, res) => {
    try {
      const doc = await Users.find({ role: 'Doctor' }).count()
      res.json(doc);
      console.log(doc);
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  // resert password
  // oldpass
  // const isMatch = await bcrypt.compare(oldpass, user.password)
  // if ismatch
  //  const passwordHash = await bcrypt.hash(newpass, 10)
  //  await Users.findOneAndUpdate({ _id: user.id }, {
  // password: passwordHas
  //})

  changepassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body
      console.log(req.user)

      const user = await Users.findById(req.user.id)
      console.log(user)


      const isMatch = await bcrypt.compare(oldPassword, user.password)
      if (!isMatch) {
        res.status(401)
        return res.json({ msg: "Your Old Password is not correct" })
      }

      const passwordHash = await bcrypt.hash(newPassword, 10)

      var newPassUser = await Users.findOneAndUpdate({ _id: user.id }, {
        password: passwordHash
      });

      res.status(200)
      return res.json(newPassUser)
      //   const { email, password } = req.body;
      //  const user = await Users.findOne({ email })



    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }

  },



  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email })


      if (!user) return res.status(400).json({ msg: "User does not exist" })
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) return res.status(400).json({ msg: "Incorrect Password" })
      // If login success, create access token and refresh token

      const accesstoken = createAccessToken({ id: user._id })
      const refreshtoken = createRefreshToken({ id: user._id })
      // create jsonwebtoken 
      //res.json(newUser)
      // res.json({password,passwordHash })
      res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        path: '/user/refresh_token'
      })
      //res.json({accesstoken})
      //   user. = accesstoken
      //  user.refreshtoken = refreshtoken
      res.json({ user: user, accesstoken: accesstoken, refreshtoken: refreshtoken })
      //return res.redirect('/manager')

    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }

  },

  createUsers: async (req, res) => {
    try {
      const { password, firstname, lastname, email, address, contact, gender, role } = req.body;
      const usera = req.body;
      //if(!image) return res.status(400).json({msg: "No image Upload"})
      const user = await Users.findOne({ email })
      if (user) return res.status(400).json({ msg: "The email already exist" })
      if (password.length < 6)
        return res.status(400).json({ msg: "Password is at least 6 character" })
      // Password Encryption
      const passwordHash = await bcrypt.hash(password, 10)

      const newUser = new Users({
        firstname, lastname, address, contact, gender, role, email, password: passwordHash
      })

      //save mongo
      await newUser.save()
      //
      const accesstoken = createAccessToken({ id: newUser._id })
      const refreshtoken = createRefreshToken({ id: newUser._id })
      // create jsonwebtoken 
      //res.json(newUser)
      // res.json({password,passwordHash })
      res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        path: '/user/refresh_token'
      })
      // res.json({accesstoken})
      //  res.json({refreshtoken})
      res.json({ msg: "Register Success" })
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },





  getAllAdmins: asyncHandler(async (req, res) => {
    try {
      const patients = await Users.find({
        role: "Patient",
      }).sort({ createdAt: -1 });
      if (!patients) {
        res.status(404);
        throw new Error("Error fetching Patient");
      }
      res.status(201).json(patients);
    } catch (error) {
      throw new Error(error);
    }
  }),











  addpatient: async (req, res) => {
    try {
      const { password, code, firstname, lastname, email, address, department, age, contact, gender, role } = req.body;
      const usera = req.body;
      //if(!image) return res.status(400).json({msg: "No image Upload"})
      const user = await Users.findOne({ email })

      if (user) return res.status(400).json({ msg: "The Email Already Exist" })
      const cod = await Users.findOne({ code })
      if (cod) return res.status(400).json({ msg: "The Patient ID Already Exist" })


      // Users.find({role: 'doctor').count()
      //const pid = await Users.findOne({ username })
      // if (pid) return res.status(400).json({ msg: "The Username already exist" })

      if (password.length < 6)
        return res.status(400).json({ msg: "Password is at least 6 character" })
      if (contact.length < 10)
        return res.status(400).json({ msg: "Contact is at least 10 character" })


      // Password Encryption
      const passwordHash = await bcrypt.hash(password, 10)

      const newUser = new Users({
        password, code, firstname, lastname, email, address, department, age, contact, gender, role
      })

      //save mongo
      await newUser.save()
      //
      const accesstoken = createAccessToken({ id: newUser._id })
      const refreshtoken = createRefreshToken({ id: newUser._id })
      // create jsonwebtoken 
      //res.json(newUser)
      // res.json({password,passwordHash })
      res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        path: '/user/refresh_token'
      })
      // res.json({accesstoken})
      //  res.json({refreshtoken})
      res.json({ msg: "Register Success" })
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },


  getPatient: async (req, res) => {
    try {

      const user = await Users.find();
      res.json(user);
      //  console.log(req.query)
      // const featuers = new APIfeatures(Users.find(), req.query).filtering().sorting()
      // const users = await  featuers.query
      // res.json(users)
      ///res.json({            //status: 'success',
      // result: users.length,
      // users: users   })
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  getPatientById: async (req, res) => {
    try {

      const user = await Users.findById(req.params.id);
      res.json(user);
      //  console.log(req.query)
      // const featuers = new APIfeatures(Users.find(), req.query).filtering().sorting()
      // const users = await  featuers.query
      // res.json(users)
      ///res.json({            //status: 'success',
      // result: users.length,
      // users: users   })
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  deletePatient: async (req, res) => {
    try {
      await Users.findByIdAndDelete(req.params.id)
      res.json({ msg: "Deleted a Patient" })


    }
    catch (err) {
      return res.status(500).json({ msg: err.message })

    }
  },
  updatePatient: async (req, res) => {
    try {
      const { firstname, lastname, email, password, address, contact, gender, role } = req.body;

      //if(!image) return res.status(400).json({msg: "No image Upload"})
      await Users.findOneAndUpdate({ _id: req.params.id }, {
        firstname, lastname, email, password, address, contact, gender, role
      })
      res.json({ msg: "Updated a Patient" })

    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }

  },


  getUsers: async (req, res) => {
    try {

      const user = await Users.find();
      res.json(user);
      //  console.log(req.query)
      // const featuers = new APIfeatures(Users.find(), req.query).filtering().sorting()
      // const users = await  featuers.query
      // res.json(users)
      ///res.json({            //status: 'success',
      // result: users.length,
      // users: users   })
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getUserById: async (req, res) => {
    try {

      const user = await Users.findById(req.params.id);
      res.json(user);
      //  console.log(req.query)
      // const featuers = new APIfeatures(Users.find(), req.query).filtering().sorting()
      // const users = await  featuers.query
      // res.json(users)
      ///res.json({            //status: 'success',
      // result: users.length,
      // users: users   })
    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },


  deleteUsers: async (req, res) => {
    try {
      await Users.findByIdAndDelete(req.params.id)
      res.json({ msg: "Deleted a User" })


    }
    catch (err) {
      return res.status(500).json({ msg: err.message })

    }
  },





  
  updateUsers: async (req, res) => {
    try {
      const { firstname, lastname, email, password, address, contact, gender, role } = req.body;

      //if(!image) return res.status(400).json({msg: "No image Upload"})
      await Users.findOneAndUpdate({ _id: req.params.id }, {
        firstname, lastname, email, password, address, contact, gender, role
      })
      res.json({ msg: "Updated a Users" })

    }
    catch (err) {
      return res.status(500).json({ msg: err.message })
    }

  }
}

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}


const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}
module.exports = alluserCtrl
