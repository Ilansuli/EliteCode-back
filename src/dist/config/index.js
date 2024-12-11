"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const prod_1 = require("./prod");
const dev_1 = require("./dev");
var config;
if (process.env.NODE_ENV === "production") {
    config = prod_1.prod;
}
else {
    config = dev_1.dev;
}
exports.default = config;
