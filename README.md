This repo is the code generated while I have been learning typescript (on the backend),
redux (on the frontend) and terraform (for deployment).  It forms a user management
service that I was going to expand into something else when I got some inspiration...

It should be considered development code only.......

# AWS Deployment

Use the AWS CLI to login to your AWS account.
```
npm run deployment
```

Point your browser at the web_domain specified on the last line of the output.

# Local Installation

## Backend
To get reset password emails create a mailgun account and set the following
environment variables:
```
MAILGUN_API_KEY
MAILGUN_DOMAIN
```
If you do not set these then the email will not be sent, but an warning will
appear in the log showing the link that would be sent.

To use a mongodb instance set MONGO_URL environment variable to point to the instance.
If the URL is not defined then it will use the internal memory store.

Then run the servers:
```
cd backend/user
npm install
npm run dev

cd backend/chat
npm install
npm run dev
```

## Frontend
```
cd frontend
npm install
npm run dev
```
This will fire up a Chrome session.

# Usage

For admin rights use the default user bob@example.com (password 12345678).

# TODO

Lots more testing - particularly frontend.
Make GUI more appealing.
