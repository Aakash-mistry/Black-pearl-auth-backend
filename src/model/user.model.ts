import Mongoose from 'mongoose'
import { User } from 'types'
import { v1 as uuidV1 } from 'uuid'
import * as crypto from 'crypto'

type UserTypes = User & Mongoose.Document

const UserSchema = new Mongoose.Schema({
     email: { type: Mongoose.Schema.Types.String, required: true },
     password: { type: Mongoose.Schema.Types.String, required: true },
}, {
     timestamps: true
})

export const Users = Mongoose.model<UserTypes>('User', UserSchema)