// Pomodoro Bread Calculator - Main Logic

class BreadCalculator {
  constructor() {
    this.flourCount = 0;
    this.config = BREAD_CONFIG;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeFlourInputs();
    this.loadDefaultValues();
  }

  setupEventListeners() {
    document.getElementById('add-flour').addEventListener('click', () => this.addFlourInput());
    document.getElementById('calculate-recipe').addEventListener('click', () => this.calculateRecipe());
    document.getElementById('reset-calculator').addEventListener('click', () => this.resetCalculator());
    document.getElementById('print-recipe').addEventListener('click', () => window.print());
  }

  initializeFlourInputs() {
    // Start with 3 default flour types matching the original recipe
    this.addFlourInput('strong-white', 400);
    this.addFlourInput('whole-wheat', 200);
    this.addFlourInput('whole-rye', 200);
  }

  addFlourInput(defaultType = '', defaultWeight = 0) {
    const flourInputsDiv = document.getElementById('flour-inputs');
    const flourId = `flour-${this.flourCount++}`;

    const flourRow = document.createElement('div');
    flourRow.className = 'flour-row';
    flourRow.id = flourId;

    // Create flour type selector
    const typeGroup = document.createElement('div');
    typeGroup.className = 'input-group';

    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Flour type:';
    const typeSelect = document.createElement('select');
    typeSelect.className = 'flour-type';

    // Add options from config
    Object.entries(this.config.flourTypes).forEach(([key, flour]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = flour.name;
      if (key === defaultType) option.selected = true;
      typeSelect.appendChild(option);
    });

    typeGroup.appendChild(typeLabel);
    typeGroup.appendChild(typeSelect);

    // Create weight input
    const weightGroup = document.createElement('div');
    weightGroup.className = 'input-group';

    const weightLabel = document.createElement('label');
    weightLabel.textContent = 'Weight (g):';
    const weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.className = 'flour-weight';
    weightInput.min = '0';
    weightInput.max = '5000';
    weightInput.step = '10';
    weightInput.value = defaultWeight;

    weightGroup.appendChild(weightLabel);
    weightGroup.appendChild(weightInput);

    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      flourRow.remove();
    });

    flourRow.appendChild(typeGroup);
    flourRow.appendChild(weightGroup);
    flourRow.appendChild(removeBtn);

    flourInputsDiv.appendChild(flourRow);
  }

  loadDefaultValues() {
    document.getElementById('base-hydration').value = this.config.defaults.baseHydration;
    document.getElementById('salt-percentage').value = this.config.defaults.saltPercentage;
    document.getElementById('starter-percentage').value = this.config.defaults.starterPercentage;
  }

  resetCalculator() {
    // Clear flour inputs
    document.getElementById('flour-inputs').innerHTML = '';
    this.flourCount = 0;

    // Re-initialize
    this.initializeFlourInputs();
    this.loadDefaultValues();

    // Clear ingredients
    document.getElementById('ingredients-list').innerHTML = '';
  }

  getFlourComposition() {
    const flourRows = document.querySelectorAll('.flour-row');
    const composition = [];
    let totalWeight = 0;

    flourRows.forEach(row => {
      const type = row.querySelector('.flour-type').value;
      const weight = parseFloat(row.querySelector('.flour-weight').value) || 0;

      if (weight > 0) {
        composition.push({
          type,
          weight,
          data: this.config.flourTypes[type],
        });
        totalWeight += weight;
      }
    });

    return { composition, totalWeight };
  }

  calculateHydration(flourComposition, totalWeight, baseHydration) {
    let adjustedHydration = baseHydration;

    flourComposition.forEach(flour => {
      const percentage = (flour.weight / totalWeight) * 100;
      const weightedAdjustment = (flour.data.adjustment * percentage) / 100;
      adjustedHydration += weightedAdjustment;
    });

    return Math.round(adjustedHydration);
  }

  calculateIngredients() {
    const baseHydration = parseFloat(document.getElementById('base-hydration').value);
    const saltPercentage = parseFloat(document.getElementById('salt-percentage').value);
    const starterPercentage = parseFloat(document.getElementById('starter-percentage').value);

    const { composition, totalWeight } = this.getFlourComposition();

    // Validate that we have some flour
    if (totalWeight === 0) {
      alert('Please add at least one flour with a weight greater than 0.');
      return null;
    }

    // Calculate adjusted hydration
    const adjustedHydration = this.calculateHydration(composition, totalWeight, baseHydration);

    // Add percentage to each flour for display
    const flours = composition.map(flour => ({
      ...flour,
      percentage: Math.round((flour.weight / totalWeight) * 100),
    }));

    // Calculate other ingredients
    const water = Math.round((totalWeight * adjustedHydration) / 100);
    const reserveWater = Math.round(water * 0.065); // ~6.5% reserve
    const initialWater = water - reserveWater;

    const salt = Math.round((totalWeight * saltPercentage) / 100);
    const starter = Math.round((totalWeight * starterPercentage) / 100);

    return {
      flours,
      totalFlour: totalWeight,
      water,
      initialWater,
      reserveWater,
      salt,
      starter,
      adjustedHydration,
      starterPercentage,
    };
  }


  calculateRecipe() {
    const ingredients = this.calculateIngredients();

    if (!ingredients) {
      return; // Validation failed
    }

    // Update stats
    document.getElementById('total-time').textContent = '~15 hours';
    document.getElementById('active-work').textContent = '~17 minutes';

    // Generate ingredients list
    this.renderIngredients(ingredients);

    // Scroll to recipe
    document.getElementById('recipe-output').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  renderIngredients(ingredients) {
    const ingredientsDiv = document.getElementById('ingredients-list');

    let html = '<div class="ingredient-group">';
    html += '<h5>Flours</h5>';

    ingredients.flours.forEach(flour => {
      html += `
        <div class="ingredient-item">
          <span class="ingredient-name">${flour.data.name}</span>
          <span class="ingredient-amount">${flour.weight}g (${flour.percentage}%)</span>
        </div>
      `;
    });

    html += `
      <div class="ingredient-item" style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 2px solid #ddd;">
        <span class="ingredient-name"><strong>Total Flour</strong></span>
        <span class="ingredient-amount"><strong>${ingredients.totalFlour}g</strong></span>
      </div>
    `;
    html += '</div>';

    html += '<div class="ingredient-group">';
    html += '<h5>Other Ingredients</h5>';
    html += `
      <div class="ingredient-item">
        <span class="ingredient-name">Water</span>
        <span class="ingredient-amount">${ingredients.water}g (${ingredients.adjustedHydration}% hydration)</span>
      </div>
      <div class="ingredient-item">
        <span class="ingredient-name">Active Starter</span>
        <span class="ingredient-amount">${ingredients.starter}g (${ingredients.starterPercentage}% inoculation)</span>
      </div>
      <div class="ingredient-item">
        <span class="ingredient-name">Salt</span>
        <span class="ingredient-amount">${ingredients.salt}g (2%)</span>
      </div>
    `;
    html += '</div>';


    ingredientsDiv.innerHTML = html;
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BreadCalculator();
});
