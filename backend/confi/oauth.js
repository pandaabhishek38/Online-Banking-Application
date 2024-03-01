const { google } = require('googleapis');


    const client_id= process.env.CLIENT_ID;
    const client_secret= process.env.CLIENT_SECRET;
    const redirect_uri= 'http://localhost:8080/api/google-login-callback';
 
    const oauth2client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

    const SCOPES=['https://www.googleapis.com/auth/userinfo.email'];

    module.exports={
      oauth2client,
      SCOPES
    };
 