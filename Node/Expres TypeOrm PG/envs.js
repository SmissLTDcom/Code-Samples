const fs = require('fs');
const colors = require('bumburum');

let envFilePath;
let color;

switch (process.env.NODE_ENV) {
    case ("production"):
        envFilePath = './.env';
        color='Green';
        break;
    case ("test"):
        envFilePath = './.env.test';
        color='Yellow';
        break;
    default:
        envFilePath = './.env.dev';
        color='Blue';
}

if(!fs.existsSync(envFilePath)) {
    throw new Error(envFilePath + 'file not exist');
}

console.info(`config mode: ${colors.font[color]}`, (process.env.NODE_ENV || 'development').toUpperCase());
const dotenv = require('dotenv');
dotenv.config({ path: envFilePath });
