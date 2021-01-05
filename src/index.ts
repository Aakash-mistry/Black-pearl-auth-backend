import bodyParser from "body-parser";
import express, { Express } from "express";
import mongoose from "mongoose";
import config from "config";
import cors from "cors";
import morgan from 'morgan'

import { errorHandler, notFoundMiddleware } from "./middleware";
import { registerRoutesV1 } from "api";

class App {
     express: Express;

     constructor() {
          this.express = express();
          this.middleware();
          this.connectDb();
          this.routes();
          this.useErrorHandler();
          this.useNotFoundMiddleware();
     }

     // Configure Express middleware.
     private middleware(): void {
          this.express.use(bodyParser.json());
          this.express.use(bodyParser.urlencoded({ extended: true }));
          this.express.use(cors());
          this.express.use(morgan('dev'))
          this.express.use(cors())
     }

     private useErrorHandler() {
          this.express.use(errorHandler);
     }

     private useNotFoundMiddleware() {
          this.express.use(notFoundMiddleware);
     }


     private routes(): void {
          registerRoutesV1(this.express);
     }

     private async connectDb() {
          await mongoose.connect(process.env.DB_PATH || config.get("DB_PATH"), {
               useNewUrlParser: true,
               useUnifiedTopology: true,
          });
     }
}

const app = new App();
const server = app.express;

export default server;