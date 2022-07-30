# BTC-Application
Gets BTC/UAH excange rate and sends to emails

This project works locally and has 3 endpoints: /n
rate: uses external api to get exchange rate of BTC to UAH;
subscribe: receives email and adds it to the file with emails, unless it si already there;
sendEmails: uses mailtrap as a testing mail service solution to get exchange rate and send it to all the emails from the file
