"use strict";

/* ==========================================
   Math Genius
   Formula Library Database
========================================== */

const formulaDatabase = {

    categories: [

        {
            id: "number-system",
            title: "Number System",
            icon: "🔢",

            formulas: [

                {
                    id: 1,
                    name: "Natural Numbers",
                    formula: "N = {1,2,3,...}",
                    description: "Counting Numbers"
                },

                {
                    id: 2,
                    name: "Whole Numbers",
                    formula: "W = {0,1,2,3,...}",
                    description: "Whole Numbers including Zero"
                },

                {
                    id: 3,
                    name: "Integers",
                    formula: "Z = {...,-2,-1,0,1,2,...}",
                    description: "Positive and Negative Numbers"
                }

            ]

        },

        {
            id: "algebra",
            title: "Algebra",
            icon: "📘",

            formulas: [

                {
                    id: 101,
                    name: "Identity 1",
                    formula: "(a+b)² = a² + 2ab + b²",
                    description: "Algebraic Identity"
                },

                {
                    id: 102,
                    name: "Identity 2",
                    formula: "(a-b)² = a² - 2ab + b²",
                    description: "Algebraic Identity"
                },

                {
                    id: 103,
                    name: "Difference of Squares",
                    formula: "a² - b² = (a+b)(a-b)",
                    description: "Difference of Squares"
                }

            ]

        },

        {
            id: "geometry",
            title: "Geometry",
            icon: "📐",

            formulas: [

                {
                    id: 201,
                    name: "Pythagoras Theorem",
                    formula: "a² + b² = c²",
                    description: "Right Triangle"
                },

                {
                    id: 202,
                    name: "Area of Rectangle",
                    formula: "A = L × B",
                    description: "Rectangle Area"
                },

                {
                    id: 203,
                    name: "Area of Circle",
                    formula: "A = πr²",
                    description: "Circle Area"
                }

            ]

        }

    ]

};

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

document.addEventListener("DOMContentLoaded", () => {

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
