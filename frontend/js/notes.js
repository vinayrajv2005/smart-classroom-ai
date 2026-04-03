async function generateNotes(){

const lectureBox = document.getElementById("lectureTranscript")
const notesBox = document.getElementById("notesBox")
const status = document.getElementById("notesStatus")

const lectureText = lectureBox.value

if(!lectureText){

alert("Generate subtitles first")

return

}

if(status){
status.innerText = "Generating AI notes... please wait..."
}

try{

const res = await fetch("http://10.1.0.172:5000/summary",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
text:lectureText
})

})

const data = await res.json()

notesBox.value = data.notes

if(status){
status.innerText = "AI notes generated successfully"
}

}
catch(error){

if(status){
status.innerText = "Error generating notes"
}

console.error(error)

}

}