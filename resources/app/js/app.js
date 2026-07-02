document.addEventListener("DOMContentLoaded",()=>{

    console.log("Math Genius v2.0 Loaded");

    const header = document.getElementById("header");

    if(header){

        fetch("components/header.html")
            .then(response => response.text())
            .then(html => {

                header.innerHTML = html;

            });

    }

});