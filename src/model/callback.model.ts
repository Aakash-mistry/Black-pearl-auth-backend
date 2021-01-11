import Mongoose from 'mongoose'
import { Callback } from '../types'

type CallbackTypes = Callback & Mongoose.Document

const callbackSchema = new Mongoose.Schema({
     callbackURL: { type: Mongoose.Schema.Types.String, required: true }
})

export const CallbackModel = Mongoose.model<CallbackTypes>('callback', callbackSchema)