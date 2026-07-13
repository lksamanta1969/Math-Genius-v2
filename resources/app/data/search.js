const searchInput = document.querySelector(".header-center input");

let searchData = [];

fetch("../data/search.json")
  .then(res => res.json())
  .then(data => {
    searchData = data;
  });

searchInput.addEventListener("input", function () {

    const value = this.value.trim().toLowerCase();

    console.clear();

    if(value==="") return;

    const result = searchData.filter(item=>{

        return (
            item.title.toLowerCase().includes(value) ||

            item.category.toLowerCase().includes(value) ||

            item.keywords.some(k=>k.toLowerCase().includes(value))
        );

    });

    console.table(result);

});