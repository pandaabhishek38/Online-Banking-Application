const http=require('https')
const sendEmail=require('../config/email.js')
const {sendDiscordText} = require('../config/discord_text.js')

const alertController={
    alert: function(req,res){
        let data='';
        req.on('data',chunk=>{
            data+=chunk;
        });
        req.on('end',async()=>{
            try{
                const emailRequest=JSON.parse(data);
                if(!emailRequest.emailID || !emailRequest.subject || !emailRequest.body){
                    res.writeHead(400,{'Content-Type':'application/json'});
                    res.end(JSON.stringify({message:'Please provide email address, subject and body'}));
                    return;
                }else{
                    sendEmail(emailRequest.emailID,emailRequest.subject,emailRequest.body,(error)=>{
                        if(error){
                            console.log('Email sending failed 1:',error);
                            res.writeHead(500,{'Content-Type':'application/json'});
                            res.end(JSON.stringify({message:'Email sending failed',error}));
                            return;
                        }else{
                            res.writeHead(200,{'Content-Type':'application/json'});
                            res.end(JSON.stringify({message:'Email sent successfully'}));
                            return;
                        }
                    });
                }
            }catch(error){
                console.error('Email sending failed:',error);
                res.writeHead(500,{'Content-Type':'application/json'});
                res.end(JSON.stringify({message:'Email sending failed',error}));
                return;
            }
        });
    },
    discordtext:function(req,res){
        let data='';
        req.on('data',chunk=>{
            data+=chunk;
        });
        req.on('end',async()=>{
            try{
                const discordtext=JSON.parse(data);
                if(!discordtext.userId  || !discordtext.message){
                    res.writeHead(400,{'Content-Type':'application/json'});
                    res.end(JSON.stringify({message: 'Please provide a userId and message'}));
                    return;
                }
            else{
                try{
                await sendDiscordText(discordtext.userId,discordtext.message);
                        res.writeHead(200,{'Content-Type':'application/json'});
                        res.end(JSON.stringify({message:'Discord alert sent successfully'}));
                        return;
            }catch(error){
                        console.log('Sending discord text failed:',error.message);
                        res.writeHead(500,{'Content-Type':'application/json'});
                        res.end(JSON.stringify({message:'Sending discord text failed'}));
                        return;
            }
            }
             } catch(error){
                console.log('Error sending discord alert');
                res.writeHead(500,{'Content-Type':'application/json'});
                res.end(JSON.stringify({message:'Discord alert failed'}));
                return;
            }
        });
    }
}
module.exports=alertController;