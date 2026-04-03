const socket = io("http://10.1.0.172:5000");

let localStream
let peerConnection

const config = {
iceServers:[
{urls:"stun:stun.l.google.com:19302"}
]
}

let username=""

// ============================
// JOIN CLASSROOM
// ============================

function joinClass(){

username = prompt("Enter name")

if(!username) username="Student"

socket.emit("join",{name:username})

}

// ============================
// PARTICIPANTS LIST
// ============================

socket.on("participants",list=>{

const ul=document.getElementById("participantsList")

if(!ul) return

ul.innerHTML=""

list.forEach(p=>{
let li=document.createElement("li")
li.innerText=p
ul.appendChild(li)
})

})

// ============================
// START VIDEO
// ============================

async function startVideo(){

try{

localStream = await navigator.mediaDevices.getUserMedia({
video:true,
audio:true
})

const localVideo = document.getElementById("localVideo")

if(localVideo){
localVideo.srcObject = localStream
}

createPeerConnection()

}
catch(error){

alert("Camera or microphone permission denied")

}

}

// ============================
// CREATE PEER CONNECTION
// ============================

function createPeerConnection(){

peerConnection = new RTCPeerConnection(config)

localStream.getTracks().forEach(track=>{
peerConnection.addTrack(track,localStream)
})

// Receive remote stream
peerConnection.ontrack = event => {

const remoteVideo = document.getElementById("remoteVideo")

if(remoteVideo){
remoteVideo.srcObject = event.streams[0]
}

}

// Send ICE candidates
peerConnection.onicecandidate = event => {

if(event.candidate){
socket.emit("candidate",event.candidate)
}

}

createOffer()

}

// ============================
// CREATE OFFER
// ============================

async function createOffer(){

const offer = await peerConnection.createOffer()

await peerConnection.setLocalDescription(offer)

socket.emit("offer",offer)

}

// ============================
// RECEIVE OFFER
// ============================

socket.on("offer",async offer=>{

if(!peerConnection){
createPeerConnection()
}

await peerConnection.setRemoteDescription(offer)

const answer = await peerConnection.createAnswer()

await peerConnection.setLocalDescription(answer)

socket.emit("answer",answer)

})

// ============================
// RECEIVE ANSWER
// ============================

socket.on("answer",async answer=>{

if(peerConnection){
await peerConnection.setRemoteDescription(answer)
}

})

// ============================
// RECEIVE ICE CANDIDATE
// ============================

socket.on("candidate",async candidate=>{

try{

if(peerConnection){
await peerConnection.addIceCandidate(candidate)
}

}
catch(e){
console.log("ICE error",e)
}

})

// ============================
// MIC TOGGLE
// ============================

function toggleMic(){

if(!localStream) return

localStream.getAudioTracks().forEach(track=>{
track.enabled = !track.enabled
})

}

// ============================
// CAMERA TOGGLE
// ============================

function toggleCamera(){

if(!localStream) return

localStream.getVideoTracks().forEach(track=>{
track.enabled = !track.enabled
})

}