import { Request, Response } from 'express'
import { IControllerRoutes, IController } from 'types'
import { Ok, UnAuthorized } from 'utils'
import { Users } from 'model'
import bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { authMiddleware } from 'middleware'
import nodemailer from 'nodemailer'

export class AuthController implements IController {
     public routes: IControllerRoutes[] = []

     constructor() {
          this.routes.push({
               path: '/sign-up',
               handler: this.signup,
               method: 'POST',
               middleware: [authMiddleware],
          })

          this.routes.push({
               path: '/sign-in',
               handler: this.signin,
               method: 'POST'
          })

          this.routes.push({
               path: '/reset-password',
               handler: this.resetPassword,
               method: 'POST'
          })

          this.routes.push({
               path: '/signout',
               handler: this.signout,
               method: 'GET',
          })

          // this.routes.push({
          //      path: '/update-password',
          //      handler: this.updatePassword,
          //      method: 'PUT'
          // })

     }

     public async signup(req: Request, res: Response) {
          try {

               const { email, password } = req.body

               const userExist = await Users.findOne({ email })

               if (userExist) {
                    return UnAuthorized(res, "User is already registered with us!")
               }

               const hashPassword = bcrypt.hashSync(password, 10)

               const token = jwt.sign({
                    email: email,
               }, "JSONWEBTOKENSECRET")

               const expires = Date.now() + 9999
               res.cookie(token, { expires })

               const user = await new Users({
                    email: email,
                    password: hashPassword
               }).save();

               return Ok(res, token)

          } catch (err) {
               console.log(err)
          }
     }

     public async signin(req: Request, res: Response) {
          try {
               const { email, password } = req.body

               const userExist = await Users.findOne({ email })
               console.log(email)

               if (!userExist) {
                    console.log('No user found')
                    return UnAuthorized(res, "No user with this email is registered with us")
               }

               if (!bcrypt.compareSync(password, userExist.password)) {
                    console.log('wrong password')
                    return UnAuthorized(res, "You have entered wrong password!")
               }

               const token = jwt.sign({
                    _id: userExist._id,
               }, "JSONWEBTOKENSECRET")

               const expires = Date.now() + 9999
               res.cookie(token, { expires })

               return Ok(res, token)

          } catch (err) {
               console.log(err)
          }
     }

     public async signout(req: Request, res: Response) {
          res.clearCookie("token")
          return Ok(res, { message: "User signout successfull" })
     }

     public async resetPassword(req: Request, res: Response) {
          const { email } = req.body

          const ifUserExist = await Users.findOne({ email })
          console.log(email)

          if (!ifUserExist) {
               console.log('No user found')
               return UnAuthorized(res, "No user with this email is registered with us")
          }

          const token = jwt.sign({
               email: email
          }, 'jsonwebtoken', { expiresIn: '900s' })

          let transporter = await nodemailer.createTransport({
               host: 'smtp.gmail.com',
               port: 465,
               auth: {
                    user: 'teamviewer993@gmail.com',
                    pass: '22558800Aa@'
               }
          });

          let mailOptions = {
               to: email,
               subject: "Password reset link for Black pearl authentication",
               text: `Hey, \n \n this is mail from BLACK PEARL AUTHENTICATION you are requested for the reseting password for your app,
               \n \n that's recently noticed... \n http://localhost:3000/new-password?token=${token} \n click on this link and reset your password \n THANK YOU`
          };
          transporter.sendMail(mailOptions, (error, info) => {
               if (error) {
                    return console.log(error);
               }
               return Ok(res, "mail has been send to your email")
          });
     }

     // public async updatePassword(req: Request, res: Response) {
     //      const getToken = req.query.
     //           jwt.verify(token, 'jsonwebtoken')
     //      return Ok(res, "Updating password")
     // }

}