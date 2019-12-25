"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const userwallet_1 = require("./routers/userwallet");
// Creates and configures an ExpressJS web server.
class App {
    //Run configuration methods on the Express instance.
    constructor() {
        this.express = express_1.default();
        this.middleware();
        this.express.use(body_parser_1.default.urlencoded({
            extended: true
        }));
        this.express.use(body_parser_1.default.json());
        this.routes();
    }
    // Configure Express middleware.
    middleware() { }
    // Configure API endpoints.
    routes() {
        this.express.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        this.express.use('/', userwallet_1.userWalletRouter);
    }
}
exports.default = new App().express;
