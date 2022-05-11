const express = require("express");
const bodyParser = require("body-parser");
const mongoose  = require('mongoose');
const { render } = require("ejs");

const app = express();

app.set("view engine","ejs"); // this tell our app to use ejs 

app.use(bodyParser.urlencoded({extended:true}));

// app.use(express.static("public")); // to use the public section we have to inherit it 

app.use(express.static(__dirname + '/public'));


// mongoose.connect("mongodb://localhost:27017/CollaborativeBoardDB" , function(){
//     console.log("Conneted to local Database !");
// });  // connecting it with the local database 

// the below code i am checking for atlas 
mongoose.connect("mongodb+srv://Admin-RahulRameshMahant:ICPC-2020@cluster0.lw7t1.mongodb.net/CollaborativeBoardDB" , function(){
    console.log("Conneted to cloud Database !");
});  // connecting it with the local database 



const userSchema = new mongoose.Schema({ // this is the schema of the data which we want to save
    name: String,
    room: String
});


const User = mongoose.model("User",userSchema); // this model is for users 


const server = app.listen(3000,function(){
    console.log("Server Started Successfully !");
});

app.get("/" , function(req,res){
    res.sendFile('index.html');
});

var roomName , personName;

app.post("/",function(req,res){ // getting the data from the form 
    roomName = req.body.RoomName;
    personName = req.body.PersonName;

    // const newUser = new User({  // creating new entry for user 
    //     name : personName ,
    //     room : roomName
    // });

    // newUser.save(function(){    // saving the entry to the database 
    //     console.log("New user is added ! ");
    // });

    // User.find({},function(err,data){ // searching all the user with same room and adding them to the list 
    //     // console.log(data);
    //     // here data is an array of all elemets 
    //     for(var i =0;i<data.length;i++){
    //         console.log(data[i].name);
    //         if(data[i].room === roomName){
    //             list.push(data[i].name);
    //         }
    //     }
    // });

    // console.log(roomName);
    res.render("list",{roomname: roomName , personname: personName});
});


var socket = require("socket.io"); // requiring the socket which we installed using npm 

var io = socket(server); // creating the object for the socket where we are passing server as a argument

io.sockets.on('connection' , newConnection);

function newConnection(socket){   // we have to an argument to newConnectio funtion 
    // console.log("new connection : " + socket.id);
    socket.on('mouse',mouseMsg);

    function mouseMsg(data){
        // socket.broadcast.emit('mouse',data); // this will emit to the all other clients except the one which is present 
        // io.sockets.to(data.room).emit('mouse',data); // this will emit to the all of clients of the given room and itself
        socket.to(data.room).emit('mouse',data); // this will emit to all of clients of the given room except itself 
        // io.sockets.emit('mouse',data); // this will emit to the all other clients and  the itself as well 
        console.log(data.x+"," + data.y);
    }

    socket.on('joined',function(data){

        var Room = data.room;
        var Name = data.name;

        socket.join(Room);

        const newUser = new User({  // creating new entry for user 
            name : Name ,
            room : Room
        });

        var list = [];
    
        newUser.save(function(){    // saving the entry to the database 
            console.log("New user is added ! ");
            User.find({},function(err,dataa){ // searching all the user with same room and adding them to the list 
                console.log(dataa);
                // here data is an array of all elemets 
                for(var i =0;i<dataa.length;i++){
                    // console.log(data[i].name);
                    if(dataa[i].room === Room){
                        // console.log("check : " + dataa[i].name);
                        list.push(dataa[i].name);
                    }
                }
                io.sockets.to(Room).emit('Users',list);
            });
        });

        io.sockets.to(Room).emit('Activity',data,false); // this will emit to the all other clients and  the itself as well 
        // socket.to(room).emit('Activity',data);  // this will emit to the all other clients except the one which is present 

        // socket.emit('Activity',name); // emitting to all the rooms 
    });

    socket.on('Disconnect', function(info){
        console.log("One person removed from room : " + info.room);
        socket.leave(info.room);
        User.findOneAndDelete({name:info.name , room: info.room},function(err,data){
            if(!err){
                console.log("User Removed Successfully !!");
                var NewList = [];
                User.find({},function(err,dataa){
                    for(var i =0;i<dataa.length;i++){
                        if(dataa[i].room === info.room){
                            NewList.push(dataa[i].name);
                        }
                    }
                    io.sockets.to(info.room).emit('Update',NewList);
                    io.sockets.to(info.room).emit('Activity',info,true);
                });

            }
        });

    });


    // console.log(socket);
}


