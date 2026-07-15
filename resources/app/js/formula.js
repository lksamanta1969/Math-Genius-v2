"use strict";

/* ==========================================
   Math Genius
   Formula Library
========================================== */

let formulaDatabase = null;

async function loadFormulaDatabase() {

    console.log("Loading Formula Database...");

    const response = await fetch("../data/formula-library.json");

    console.log(response);

    formulaDatabase = await response.json();

    console.log(formulaDatabase);

}

/* ==========================================
   Global
========================================== */

let allFormulas = [];
/* ==========================================
   Prepare Formula List
========================================== */

function prepareFormulaList() {

    allFormulas = [];

    formulaDatabase.categories.forEach(category => {

        category.formulas.forEach(formula => {

            allFormulas.push({

                ...formula,

                category: category.title,
                icon: category.icon

            });

        });

    });

}
/* ==========================================
   Get Elements
========================================== */

const categoryContainer = document.getElementById("categoryList");
const formulaContainer = document.getElementById("formulaList");
const searchInput = document.getElementById("searchInput");
const showAllButton = document.getElementById("showAllBtn");
/* ==========================================
   Render Categories
========================================== */

function renderCategories() {

    if (!categoryContainer) return;

    categoryContainer.innerHTML = "";

    formulaDatabase.categories.forEach(category => {

        const button = document.createElement("button");

        button.className = "category-btn";

        button.innerHTML = `${category.icon} ${category.title}`;

        button.onclick = () => {

            renderFormulaCards(category.formulas);

        };

        categoryContainer.appendChild(button);

    });

}
/* ==========================================
   Render Formula Cards
========================================== */

function renderFormulaCards(formulas) {

    if (!formulaContainer) return;

    formulaContainer.innerHTML = "";

    formulas.forEach(item => {

        const card = document.createElement("div");

        card.className = "formula-card";

        card.innerHTML = `

            <h3>${item.name}</h3>

            <p><strong>Formula:</strong></p>

            <div class="formula-text">

                ${item.formula}

            </div>

            <small>${item.description}</small>

        `;

        formulaContainer.appendChild(card);

    });

}
/* ==========================================
   Show All
========================================== */

function showAllFormulas() {

    prepareFormulaList();

    renderFormulaCards(allFormulas);

}
/* ==========================================
   Search
========================================== */

function searchFormula(keyword) {

    const text = keyword.toLowerCase();

    const filtered = allFormulas.filter(item => {

        return (
            item.name.toLowerCase().includes(text) ||
            item.formula.toLowerCase().includes(text) ||
            item.description.toLowerCase().includes(text)
        );

    });

    renderFormulaCards(filtered);

}
/* ==========================================
   Start
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    await loadFormulaDatabase();

    prepareFormulaList();

    renderCategories();

    showAllFormulas();

    if (searchInput) {

        searchInput.addEventListener("input", e => {

            searchFormula(e.target.value);

        });

    }

    if (showAllButton) {

        showAllButton.addEventListener("click", () => {

            showAllFormulas();

        });

    }

});
