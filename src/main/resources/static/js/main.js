const SERVER_URL = 'http://localhost:8080/api/v1/';
console.log("main js loaded")

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('form-songs').addEventListener('submit', getSongs);

});
async function getSongs(event) {
    event.preventDefault();
    console.log("form submittet")
    const URL = `${SERVER_URL}songs?artists=${document.getElementById('artists').value}`;
    const spinner = document.getElementById('spinner1');
    const result = document.getElementById('result');
    result.style.color = "black";
    try {
        spinner.style.display = "block";
        const response = await fetch(URL).then(handleHttpErrors)
        document.getElementById('result').innerText = response.answer;
    } catch (e) {
        result.style.color = "red";
        result.innerText = e.message;
    }
    finally {
        spinner.style.display = "none";
    }
}

async function handleHttpErrors(res) {
    if (!res.ok) {
        const errorResponse = await res.json();
        const msg = errorResponse.message ? errorResponse.message : "No error details provided"
        throw new Error(msg)
    }
    return res.json()
}