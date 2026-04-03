let transcriptText = ""

const SERVER = "http://10.1.0.172:5000"


// ============================
// LOAD VIDEO
// ============================

function loadVideo(){

let link = document.getElementById("youtubeLink").value

let videoId = ""

if(link.includes("watch?v=")){
videoId = link.split("watch?v=")[1].split("&")[0]
}

else if(link.includes("youtu.be/")){
videoId = link.split("youtu.be/")[1].split("?")[0]
}

else{
alert("Invalid YouTube link")
return
}

document.getElementById("youtubePlayer").src =
"https://www.youtube.com/embed/" + videoId

document.getElementById("subtitleStatus").innerText =
"Video loaded. Click 'Generate Subtitles'."

}



// ============================
// GENERATE SUBTITLES
// ============================

async function generateSubtitles(){

const link = document.getElementById("youtubeLink").value

if(!link){
alert("Paste YouTube link first")
return
}

document.getElementById("subtitleStatus").innerText =
"Downloading audio from YouTube..."

await fetch(SERVER + "/youtube_audio",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({url:link})

})

document.getElementById("subtitleStatus").innerText =
"Generating subtitles... please wait"

const res = await fetch(SERVER + "/transcribe")

const data = await res.json()

transcriptText = data.transcript || ""

document.getElementById("originalSubtitle").innerText =
transcriptText

document.getElementById("subtitleStatus").innerText =
"Subtitles generated successfully"

}



// ============================
// TRANSLATE SUBTITLES
// ============================

async function translateSubtitle(){

if(!transcriptText){
alert("Generate subtitles first")
return
}

const language = document.getElementById("language").value

document.getElementById("subtitleStatus").innerText =
"Translating subtitles..."

try{

const res = await fetch(SERVER + "/translate",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

text: transcriptText,
language: language

})

})

const data = await res.json()

document.getElementById("translatedSubtitle").innerText =
data.translated

document.getElementById("subtitleStatus").innerText =
"Translation completed"

}

catch(error){

document.getElementById("subtitleStatus").innerText =
"Translation failed"

}

}