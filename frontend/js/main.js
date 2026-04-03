// ============================
// TAB SYSTEM
// ============================

function showTab(tab){

let sections = document.getElementsByClassName("tabContent")

for(let i = 0; i < sections.length; i++){
sections[i].style.display = "none"
}

let activeTab = document.getElementById(tab)

if(activeTab){
activeTab.style.display = "block"
}

}



// ============================
// PAGE LOAD
// ============================

window.onload = function(){

// open live tab first
showTab("live")

// start camera
if(typeof startVideo === "function"){
startVideo()
}

// join classroom
if(typeof joinClass === "function"){
joinClass()
}

// start fetching teacher speech
startSpeechListener()

}



// ============================
// LIVE TEACHER SPEECH
// ============================

function startSpeechListener(){

setInterval(getTeacherSpeech,2000)

}



// ============================
// FETCH TEACHER SPEECH + AUTO TRANSLATE
// ============================

async function getTeacherSpeech(){

try{

const res = await fetch("http://192.168.1.9:5000/get_text")

const data = await res.json()

const speechBox = document.getElementById("teacherSpeech")

if(speechBox){

speechBox.innerText = data.text

// 🔥 AUTO TRANSLATE HERE
autoTranslate(data.text)

}

}
catch(err){
console.log("Speech fetch error",err)
}

}



// ============================
// AUTO TRANSLATION (NEW 🔥)
// ============================

async function autoTranslate(text){

if(!text) return

let language = document.getElementById("speechLanguage")?.value

if(!language) return

try{

const res = await fetch("http://10.1.0.172:5000/translate",{

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

const translatedBox = document.getElementById("translatedSpeech")

if(translatedBox){
translatedBox.innerText = data.translated || ""
}

}
catch(err){

console.log("Auto translation error",err)

}

}



// ============================
// MANUAL TRANSLATE (OPTIONAL)
// ============================

async function translateSpeech(){

let text = document.getElementById("teacherSpeech").innerText

if(!text){
alert("No speech detected yet")
return
}

let language = document.getElementById("speechLanguage").value

try{

const res = await fetch("http://192.168.1.9:5000/translate",{

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

document.getElementById("translatedSpeech").innerText = data.translated

}
catch(err){

console.log("Translation error",err)

}

}