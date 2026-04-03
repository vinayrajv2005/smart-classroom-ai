async function getBoardLive(){

const res = await fetch("http://10.1.0.172:5000/get_board_text")

const data = await res.json()

if(!data.camera) return

document.getElementById("subtitleOverlay").innerText=data.text

}