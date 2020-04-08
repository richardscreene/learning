curl localhost:3000/login -H "Content-Type: application/json" -d '{"email":"rich@rich.com","password":"arse"}'
curl localhost:3000/create -H "Content-Type: application/json" -d '{"email":"rich@rich.com","password":"arse","name":"RICH"}'



curl localhost:3000/forgot -H "Content-Type: application/json" -d '{"email":"rich@rich.com"}'



export JWT_SECRET = "THIS-IS-THE-KEY"

 mongod --dbpath /tmp
