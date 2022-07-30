'use strict'

const fs = require('fs');
const http = require('http');
const nodemailer = require('nodemailer');

const PORT = 3000;
const URL = "http://rest.coinapi.io/v1/exchangerate/BTC/UAH?apikey=B4D0DFC6-CD81-43B6-A3A9-B404F76763EB";


const callApi = (callback) => {
    http.get(URL, (response) => {
        let apiResponse = '';
        response.on("data", (chunk) => {
            apiResponse+=chunk;
        });
        response.on("end", () => {
            return callback(apiResponse);
        });
    }).on("error", (err) => {
        console.log(err.message);
    })
}

const checkEmail = (filePath, email) => {
    const file = fs.readFileSync(filePath, 'utf-8');
    const check = file.includes(email);
    return !check;
}

const sendEmails = (message, filePath) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "07270cc57ffa4c",
          pass: "1b83c5eed559b3"
        }
    });
    let data = fs.readFileSync(filePath, 'utf-8');
    data.split(/\r?\n/).forEach(email => {
        let mailOptions = {
            from: 'myemail@gmail.com',
            to: email, 
            subject: 'test',
            text: message
        };
    
        transporter.sendMail(mailOptions, (err, info) => {
            if(err) console.log(err);
            else console.log("sent" + info.response);
        });
    });
    
}

http.createServer((req, res) => {
    if(req.method === 'GET' && req.url === '/rate')
    {
        try{
            callApi((response) => {
                let parsedResponse = JSON.parse(response);
                let rate = Math.round(parsedResponse.rate);
                let responseText = "BTC IS " + rate.toString() + " UAH";
                res
                    .writeHead(200, {
                        'Content-Length': Buffer.byteLength(responseText),
                        'Content-Type': 'text/plain'
                    })
                    .end(responseText);
            });
        }
        catch(e){
            let responseText = "Invalid status value";
            res
                .writeHead(400, {
                    'Content-Length': Buffer.byteLength(responseText),
                    'Content-Type': 'text/plain'
                })
                .end(responseText);
        }
    }
    else if(req.method === "POST" && req.url === '/subscribe')
    {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            let decodedData = decodeURIComponent(data);
            let email = decodedData.substring((decodedData.indexOf('=')+1));
            if(checkEmail('./emails.txt', email))
            {
                fs.writeFile('./emails.txt', email +'\n', {flag: 'a+'}, err => {});
                let responseText = "Email is added";
                res
                    .writeHead(200, {
                        'Content-Length': Buffer.byteLength(responseText),
                        'Content-Type': 'text/plain'
                    })
                 
                   .end(responseText);
            }
            else 
            {
                let responseText = "Email already exists";
                res
                    .writeHead(200, {
                        'Content-Length': Buffer.byteLength(responseText),
                        'Content-Type': 'text/plain'
                    })
                 
                   .end(responseText);
            }
            console.log(decodedData);
        });
    }
    else if(req.method === "POST" && req.url === "/sendEmails")
    {
        callApi((response) => {
            let parsedResponse = JSON.parse(response);
            let rate = Math.round(parsedResponse.rate);
            let message = "BTC IS " + rate.toString() + " UAH";
            sendEmails(message, './emails.txt');
            let responseText = "Emails are sent";
            res
                .writeHead(200, {
                    'Content-Length': Buffer.byteLength(responseText),
                    'Content-Type': 'text/plain'
                })
                .end(responseText);
        });
    }
}).listen(PORT);