const cron = require('node-cron');
const moment = require('moment');
require('dotenv').config();

console.log("ABC ",process.env.RYAN)
// let postTask1 = cron.schedule("4 9 * * *", () => {
//     console.log("-------")
//     console.log("Test1");
//     console.log(new Date());
// })
let postTask2 = cron.schedule("* * * * *", () => {
    console.log("-------")
    console.log("Test1")
    console.log(moment().format("mm"))
})
let postTask3 = cron.schedule("* * * * *", () => {
    console.log("-------")
    console.log("Test2")
    console.log(moment().format("mm"))
})
let postTask4 = cron.schedule("* * * * *", () => {
    console.log("-------")
    console.log("Test3")
    console.log(moment().format("mm"))
})
console.log(postTask4.status)