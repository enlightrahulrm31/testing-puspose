var socket;

var Name , Room;
function setup() {
    var cnv = createCanvas(820,650);;
    cnv.style('display', 'block');
    cnv.position(600,80); // positioning the canvas 
    background(51);
    socket = io.connect("http://localhost:3000"); // connecting the socket with the server 
    
     Name =  document.getElementById('username').value;
     Room  = document.getElementById('userroom').value;

    socket.on('connect', () => {
        //get the id from socket
        var data = {
            room : Room,
            name : Name
        };
        socket.emit('joined',data);
        console.log("socket id is  : " + Name + " " + socket.id);
    });


    socket.on('Activity',function(data,update){
        // console.log("recieving data !");
        if(update){
            // need to work
            var Messages = document.getElementById("Messages"); 
            var today = new Date();
            var time = "[" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() +"]";
            Messages.innerHTML = Messages.innerHTML + "<br>" + data.name + " left the room ! " + time + "<br>";
        }
        else{
            var Messages = document.getElementById("Messages"); 
            var today = new Date();
            var time = "[" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() +"]";
            if(data.name === Name){
                Messages.innerHTML = Messages.innerHTML + "<br>" + "Welcome " + data.name + " to the room ! " + time + "<br>";
            }
            else{
                Messages.innerHTML = Messages.innerHTML + "<br>" + data.name + " Joined the room ! " + time + "<br>";
            }
        }
    });

    socket.on('Users',function(data){
        var lastname = data[data.length-1];
        var ul = document.getElementById("list");
        console.log("server side : " + data);
        if(lastname === Name){
            for(var i=0;i<data.length;i++){
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(data[i]));
                ul.appendChild(li);
            }
        }
        else{
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(lastname));
            ul.appendChild(li);
        }
        
    });


    socket.on('Update',function(data){
        var ul = document.getElementById("list");
        ul.innerHTML = "";
        for(var i=0;i<data.length;i++){
            // working on clearing the list 
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(data[i]));
            ul.appendChild(li);
        }
        
    });
    



    socket.on('mouse',newDrawing);




    const btn = document.getElementById("LeaveButton");
    btn.addEventListener("click", function(){
        
        console.log("Button is Clicked !");
        var data = {
            room : Room,
            name : Name
        }

        socket.emit('Disconnect',data);  // telling the server to leave the present room 

        swal("Thanks for joining Room !", "Hope to see you again", "success").then((value) => { // using the external library where promise is beign used 
            location.href = "index.html";  // redirecting it to the index page on clicking 
          });
        // location.href = "index.html";
    });


}





function newDrawing(data){
    noStroke();
    fill(255 , 0, 100);
    ellipse(data.x,data.y,15,15);
}


function mouseDragged(){ // this is an event listner funtion in javascript 
    console.log("Sending : " + mouseX + "," + mouseY);

    noStroke(); // if we write nostroke , fill , ellipse in the draw function then as we will hover the mouse the it will draw
    fill(255); // but here if we put it in mouseDragged even function then it will only draw it when we will press then mouse and do movement 
    ellipse(mouseX,mouseY,15,15);
    
    var data = { // creating an object data where we are saving the coordinates of mouse and will pass it to the server 
        room : Room,
        x : mouseX,
        y : mouseY
    }
    
    socket.emit('mouse',data); // mouse is the name of message which we are emitting 

}
  
function draw() {

}
