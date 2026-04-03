let currentText=""

async function getTeacherText(){

const res = await fetch("http://10.1.0.172:5000/get_text")
const data = await res.json()

currentText=data.text

document.getElementById("original").innerText=currentText

autoTranslate()

}

async function autoTranslate(){

const language=document.getElementById("language").value

const res = await fetch("http://10.1.0.172:5000/translate",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
text:currentText,
language:language
})

})

const data=await res.json()

document.getElementById("translated").innerText=data.translated

}