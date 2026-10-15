const mysql = require('mysql12/promise');

const pool = mysql.createPool({
    host:'localhost',
    port: 3306,
    user:'root',
    password: 'n0m3l0',
    dtabase: 'cecyt9_local',
    dateStrings:true,
})