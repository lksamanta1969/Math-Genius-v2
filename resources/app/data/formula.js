const formulaLibrary = {
  arithmetic: [
    {
      title: "Percentage",
      formula: "Percentage = (Value / Total) × 100",
      description: "Used to calculate percentage."
    },
    {
      title: "Profit",
      formula: "Profit = Selling Price − Cost Price",
      description: "Find profit amount."
    },
    {
      title: "Loss",
      formula: "Loss = Cost Price − Selling Price",
      description: "Find loss amount."
    },
    {
      title: "Simple Interest",
      formula: "SI = (P × R × T) / 100",
      description: "Simple Interest Formula."
    }
  ],

  algebra: [
    {
      title: "Quadratic Formula",
      formula: "x = (-b ± √(b²-4ac)) / 2a",
      description: "Roots of quadratic equation."
    },
    {
      title: "Identity",
      formula: "(a+b)² = a² + 2ab + b²",
      description: "Algebraic Identity."
    }
  ],

  geometry: [
    {
      title: "Area of Triangle",
      formula: "½ × Base × Height",
      description: "Triangle Area."
    },
    {
      title: "Area of Circle",
      formula: "πr²",
      description: "Circle Area."
    }
  ]
};

window.formulaLibrary = formulaLibrary;