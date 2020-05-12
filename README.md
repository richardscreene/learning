This repo is the code generated while I have been learning typescript (on the backend) and
redux (on the frontend).  It forms a user management service that I was going to expand into
something else when I got some inspiration...

It should be considered development code only.......

# Installation

## Backend
To get reset password emails create a mailgun account and set the following
environment variables:
```
MAILGUN_API_KEY
MAILGUN_DOMAIN
```
If you do not set these then the email will not be sent, but an warning will
appear in the log showing the link that would be sent.

Install mongodb (
https://docs.mongodb.com/manual/administration/install-community/) and run it
on the default port (27017). 

Then run the server:
```
cd backend/user
npm install
npm run dev
```

## Frontend
```
cd frontend
npm install
npm run dev
```

# Usage

Frontend script will fire up a Chrome session.  For admin rights use the default user bob@example.com (password 12345678).

# TODO

Lots more testing - particularly frontend.
