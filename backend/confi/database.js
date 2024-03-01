const mysql=require('mysql');
require('dotenv').config();
const dbConfig={
    host:'127.0.0.1',
    user:'root',
    password: 'Bunty@7931',
    database:'bank'
};

const connection = mysql.createConnection(dbConfig);
connection.connect((err)=>{
    if(err){
        console.error('Error connecting to database:',err);
    }else{
        console.log('Connected to the database');
    }
});
module.exports=connection;