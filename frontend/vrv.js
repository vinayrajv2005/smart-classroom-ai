let currentText = ""
let mode = "teacher"

const SERVER = "http://192.168.1.9:5000"


function showTab(tab){

let sections = document.getElementsByClassName("tabContent")

for(let i=0;i<sections.length;i++){
sections[i].style.display = "none"
}

document.getElementById(tab).style.display = "block"

}

window.onload = function(){
showTab("live")
}

// ============================
// MIC CONTROL
// ============================

async function startMic(){
await fetch(`${SERVER}/start_listening`)
}

async function stopMic(){
await fetch(`${SERVER}/stop_listening`)
}


// ============================
// CAMERA CONTROL (TEACHER)
// ============================

async function startCamera(){
await fetch(`${SERVER}/start_camera`)
}

async function stopCamera(){
await fetch(`${SERVER}/stop_camera`)
}


// ============================
// CAPTURE BOARD (TEACHER)
// ============================

async function captureBoard(){

const res = await fetch(`${SERVER}/capture_board`)
const data = await res.json()

if(document.getElementById("boardText")){
document.getElementById("boardText").innerText = data.text
}

if(document.getElementById("formulaText")){
document.getElementById("formulaText").innerText = data.formulas
}

if(document.getElementById("diagramText")){
document.getElementById("diagramText").innerText =
data.diagram ? "Diagram Detected" : "No Diagram"
}

}


// ============================
// VIDEO CALL
// ============================

const socket = io(SERVER)

let localStream
let peerConnection

const config = {
iceServers: [
{ urls: "stun:stun.l.google.com:19302" }
]
}

async function startVideo(){

localStream = await navigator.mediaDevices.getUserMedia({
video:true,
audio:true
})

const localVideo = document.getElementById("localVideo")

if(localVideo){
localVideo.srcObject = localStream
}

peerConnection = new RTCPeerConnection(config)

localStream.getTracks().forEach(track=>{
peerConnection.addTrack(track,localStream)
})

peerConnection.ontrack = event=>{
const remoteVideo = document.getElementById("remoteVideo")

if(remoteVideo){
remoteVideo.srcObject = event.streams[0]
}
}

peerConnection.onicecandidate = event=>{
if(event.candidate){
socket.emit("candidate",event.candidate)
}
}

const offer = await peerConnection.createOffer()

await peerConnection.setLocalDescription(offer)

socket.emit("offer",offer)

}

socket.on("offer",async offer=>{

peerConnection = new RTCPeerConnection(config)

localStream.getTracks().forEach(track=>{
peerConnection.addTrack(track,localStream)
})

await peerConnection.setRemoteDescription(offer)

const answer = await peerConnection.createAnswer()

await peerConnection.setLocalDescription(answer)

socket.emit("answer",answer)

})

socket.on("answer",async answer=>{
await peerConnection.setRemoteDescription(answer)
})

socket.on("candidate",async candidate=>{
try{
await peerConnection.addIceCandidate(candidate)
}catch(e){}
})

startVideo()


// ============================
// STUDENT PAGE LIVE BOARD TEXT
// ============================

async function getBoardLive(){

const res = await fetch(`${SERVER}/get_board_text`)
const data = await res.json()

if(!data.camera) return
if(!data.text) return

let language = "en"

const langBox = document.getElementById("language")

if(langBox){
language = langBox.value
}

const translate = await fetch(`${SERVER}/translate`,{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
text:data.text,
language:language
})

})

const translated = await translate.json()

if(document.getElementById("subtitleOverlay")){
document.getElementById("subtitleOverlay").innerText =
translated.translated
}

}


// ============================
// GET TEACHER SPEECH
// ============================

async function getTeacherText(){

if(mode !== "teacher") return

const res = await fetch(`${SERVER}/get_text`)
const data = await res.json()

currentText = data.text

if(document.getElementById("original")){
document.getElementById("original").innerText = currentText
}

autoTranslate()

}


// ============================
// TRANSLATE TEACHER SPEECH
// ============================

async function autoTranslate(){

if(mode !== "teacher") return

const langBox = document.getElementById("language")

let language = "en"
if(langBox) language = langBox.value

const res = await fetch(`${SERVER}/translate`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
text:currentText,
language:language
})

})

const data = await res.json()

if(document.getElementById("translated")){
document.getElementById("translated").innerText = data.translated
}

}


// ============================
// DOWNLOAD YOUTUBE AUDIO
// ============================

async function extractAudio(){

let link = document.getElementById("youtubeLink").value

await fetch(`${SERVER}/youtube_audio`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
url:link
})

})

}


// ============================
// TRANSCRIBE AUDIO
// ============================

async function transcribeAudio(){

mode = "video"

const res = await fetch(`${SERVER}/transcribe`)
const data = await res.json()

if(document.getElementById("lecture")){
document.getElementById("lecture").innerText = data.transcript
}

translateSubtitle(data.transcript)

}


// ============================
// TRANSLATE SUBTITLE
// ============================

async function translateSubtitle(text){

const langBox = document.getElementById("language")

let language = "en"
if(langBox) language = langBox.value

const res = await fetch(`${SERVER}/translate`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
text:text,
language:language
})

})

const data = await res.json()

if(document.getElementById("translated")){
document.getElementById("translated").innerText = data.translated
}

}


// ============================
// LOAD VIDEO
// ============================

function loadVideo(){

mode = "video"

let link = document.getElementById("youtubeLink").value

let videoId = ""

if(link.includes("watch?v=")){
videoId = link.split("watch?v=")[1].split("&")[0]
}

else if(link.includes("youtu.be/")){
videoId = link.split("youtu.be/")[1].split("?")[0]
}

else{
alert("Invalid YouTube Link")
return
}

document.getElementById("youtubePlayer").src =
"https://www.youtube.com/embed/" + videoId

document.getElementById("openYoutube").href = link
document.getElementById("openYoutube").style.display = "inline-block"

extractAudio()

setTimeout(()=>{

transcribeAudio()

setInterval(()=>{

transcribeAudio()

},5000)

},5000)

}


// ============================
// AI NOTES
// ============================

async function generateNotes(){

const lectureText = document.getElementById("lecture").innerText

const res = await fetch(`${SERVER}/summary`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
text:lectureText
})

})

const data = await res.json()

document.getElementById("notes").innerText = data.notes

}


// ============================
// STUDENT MIC CONTROL
// ============================

let micEnabled = true
let cameraEnabled = true

function toggleStudentMic(){

if(!localStream) return

localStream.getAudioTracks().forEach(track=>{
track.enabled = !track.enabled
})

micEnabled = !micEnabled

}


// ============================
// STUDENT CAMERA CONTROL
// ============================

function toggleStudentCamera(){

if(!localStream) return

localStream.getVideoTracks().forEach(track=>{
track.enabled = !track.enabled
})

cameraEnabled = !cameraEnabled

}


// ============================
// TEACHER MIC CONTROL
// ============================

function toggleTeacherMic(){

if(!localStream) return

localStream.getAudioTracks().forEach(track=>{
track.enabled = !track.enabled
})

}


// ============================
// DOWNLOAD PDF
// ============================

async function downloadPDF(){

await fetch(`${SERVER}/download_pdf`)

alert("PDF saved in backend folder")

}


// ============================
// AUTO REFRESH
// ============================

setInterval(()=>{
getTeacherText()
},2000)


// ============================
// LIVE BOARD SUBTITLE
// ============================

setInterval(()=>{
getBoardLive()
},2000)