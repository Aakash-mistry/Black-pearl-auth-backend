import { Request, Response } from 'express'
import { IControllerRoutes, IController, ResetTokenInfo } from 'types'
import { BadRequest, Ok, UnAuthorized } from 'utils'
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
               path: '/change-password',
               handler: this.changePassword,
               method: "PUT"
          })

          this.routes.push({
               path: '/verify-reset-token',
               handler: this.resetTokenVerify,
               method: 'GET'
          })

          this.routes.push({
               path: '/verify-token',
               handler: this.verifyingToken,
               method: 'GET'
          })

     }

     public async signup(req: Request, res: Response) {
          try {

               const { email, password } = req.body

               const userExist = await Users.findOne({ email })

               if (userExist) {
                    return UnAuthorized(res, "The email you are using is already registered with us.")
               }

               const hashPassword = bcrypt.hashSync(password, 10)

               const token = jwt.sign({
                    email: email
               }, 'jsonwebtoken', { expiresIn: '900s' })

               await new Users({
                    email: email,
                    password: hashPassword
               }).save();

               return Ok(res, token)

          } catch (err) {
               console.log(err)
               return err
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
                    email: email
               }, 'jsonwebtoken', { expiresIn: '900s' })

               const expires = Date.now() + 9999
               res.cookie(token, { expires })

               return Ok(res, token)

          } catch (err) {
               console.log(err)
          }
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

          await Users.updateOne({ email }, { $set: { resetToken: token } })
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

     public async changePassword(req: Request, res: Response) {
          const { password, token } = req.body;

          if (!token) {
               console.log("token is required")
               return BadRequest(res, 'Token is required')
          }

          let decodedToken = null;

          try {
               decodedToken = jwt.verify(token, "jsonwebtoken") as ResetTokenInfo;
          } catch (err) {
               console.log("token is invalid one")
               return BadRequest(res, 'Token is invalid')
          }

          if (!decodedToken) {
               console.log("token is invalid two")
               return BadRequest(res, 'Token is invalid')
          }

          const user = await Users.findOne({ resetToken: token });

          if (!user) {
               return BadRequest(res, 'Token is invalid')
          }

          await Users.updateOne({ resetToken: token }, {
               $set: {
                    password: bcrypt.hashSync(password, 10), resetToken: ''
               }
          })
          return Ok(res, "your password have been changed, now login and try your account")

     }

     public async resetTokenVerify(req: Request, res: Response) {
          const token = req.query.token as string
          const user = await Users.findOne({ resetToken: token })
          let tokenValid = false;
          if (user) {
               tokenValid = true
          }
          console.log(user, token)

          return Ok(res, { success: tokenValid });

     }

     public async verifyingToken(req: Request, res: Response) {
          const token = req.query.token as string
          if (token) {
               const success = await jwt.verify(token, 'jsonwebtoken')
               if (success) {
                    return Ok(res, "Token verified")
               } {
                    return UnAuthorized(res, 'Invalid token')
               }
          }
     }
}