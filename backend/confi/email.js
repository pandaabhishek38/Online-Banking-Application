const nodemailer=require('nodemailer');

const sendEmail=async(to,subject,text,html)=>{
    const transporter=nodemailer.createTransport({
        host:'smtp.elasticemail.com',
        port:2525,
        secure:false,
        auth:{
            user:'BankingApp.SE567@proton.me',
            pass:process.env.EMAIL_PASS
        }
    });

    const mailOptions={
        from:'BankingApp.SE567@proton.me',
        to,
        subject,
        text,
        html
    };

    try{
        const info=await transporter.sendMail(mailOptions);
        console.log('Email sent:',info.response);
        return;
    }catch(error){
        console.error('Email sending failed:',error);
    }
};
module.exports=sendEmail;


// sendEmail(
//     'tanyasharma2614@gmail.com',
//     'Test',
//     'This is a test email'
// );