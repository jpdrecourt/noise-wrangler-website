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
    this.addFlourInput('strong-white', 50);
    this.addFlourInput('whole-wheat', 25);
    this.addFlourInput('whole-rye', 25);
  }

  addFlourInput(defaultType = '', defaultPercentage = 0) {
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

    // Create percentage input
    const percentGroup = document.createElement('div');
    percentGroup.className = 'input-group';

    const percentLabel = document.createElement('label');
    percentLabel.textContent = 'Percentage (%):';
    const percentInput = document.createElement('input');
    percentInput.type = 'number';
    percentInput.className = 'flour-percentage';
    percentInput.min = '0';
    percentInput.max = '100';
    percentInput.step = '1';
    percentInput.value = defaultPercentage;

    percentGroup.appendChild(percentLabel);
    percentGroup.appendChild(percentInput);

    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      flourRow.remove();
    });

    flourRow.appendChild(typeGroup);
    flourRow.appendChild(percentGroup);
    flourRow.appendChild(removeBtn);

    flourInputsDiv.appendChild(flourRow);
  }

  loadDefaultValues() {
    document.getElementById('total-flour').value = this.config.defaults.totalFlour;
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

    // Hide recipe output
    document.getElementById('recipe-output').style.display = 'none';
  }

  getFlourComposition() {
    const flourRows = document.querySelectorAll('.flour-row');
    const composition = [];
    let totalPercentage = 0;

    flourRows.forEach(row => {
      const type = row.querySelector('.flour-type').value;
      const percentage = parseFloat(row.querySelector('.flour-percentage').value) || 0;

      if (percentage > 0) {
        composition.push({
          type,
          percentage,
          data: this.config.flourTypes[type],
        });
        totalPercentage += percentage;
      }
    });

    return { composition, totalPercentage };
  }

  calculateHydration(flourComposition, baseHydration) {
    let adjustedHydration = baseHydration;

    flourComposition.forEach(flour => {
      const weightedAdjustment = (flour.data.adjustment * flour.percentage) / 100;
      adjustedHydration += weightedAdjustment;
    });

    return Math.round(adjustedHydration);
  }

  calculateIngredients() {
    const totalFlour = parseFloat(document.getElementById('total-flour').value);
    const baseHydration = parseFloat(document.getElementById('base-hydration').value);
    const saltPercentage = parseFloat(document.getElementById('salt-percentage').value);
    const starterPercentage = parseFloat(document.getElementById('starter-percentage').value);

    const { composition, totalPercentage } = this.getFlourComposition();

    // Validate flour percentages
    if (Math.abs(totalPercentage - 100) > 0.1) {
      alert(`Flour percentages must add up to 100%. Current total: ${totalPercentage}%`);
      return null;
    }

    // Calculate adjusted hydration
    const adjustedHydration = this.calculateHydration(composition, baseHydration);

    // Calculate flour amounts
    const flours = composition.map(flour => ({
      ...flour,
      weight: Math.round((totalFlour * flour.percentage) / 100),
    }));

    // Calculate other ingredients
    const water = Math.round((totalFlour * adjustedHydration) / 100);
    const reserveWater = Math.round(water * 0.065); // ~6.5% reserve
    const initialWater = water - reserveWater;

    const salt = Math.round((totalFlour * saltPercentage) / 100);
    const starter = Math.round((totalFlour * starterPercentage) / 100);

    return {
      flours,
      totalFlour,
      water,
      initialWater,
      reserveWater,
      salt,
      starter,
      adjustedHydration,
      starterPercentage,
    };
  }

  formatPomodoro(pomodoros) {
    if (pomodoros < 0) {
      return `${Math.abs(pomodoros).toFixed(1)} ${this.config.pomodoro.pluralLabel} before start`;
    }
    return `${pomodoros.toFixed(1)} ${pomodoros === 1 ? this.config.pomodoro.label : this.config.pomodoro.pluralLabel}`;
  }

  formatTime(pomodoros) {
    const minutes = Math.round(pomodoros * this.config.pomodoro.duration);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  }

  generateProtocolSteps(ingredients) {
    const steps = [];

    // Step -24h: Feed starter
    steps.push({
      title: 'POMODORO -38.4 - Feed Your Starter',
      timing: this.formatPomodoro(-38.4),
      activeTime: '2 minutes',
      description: `
        <p>Rehydrate your starter with 100g water.</p>
      `,
    });

    // Step 0: Autolyse
    steps.push({
      title: 'POMODORO 0 - Autolyse',
      timing: 'Start (0.0 pomodoros)',
      activeTime: '2 minutes',
      description: `
        <p><strong>Everything happens in the bowl. No kneading, no mess.</strong></p>
        <ul>
          <li>In your bowl: ${ingredients.totalFlour}g flour + ${ingredients.initialWater}g water (reserve ${ingredients.reserveWater}g)</li>
          <li>Mix with wet hands until no dry bits remain</li>
          <li>Cover and rest 4 pomodoros (100 minutes)</li>
        </ul>
      `,
    });

    // Step 1.5: Mix
    steps.push({
      title: 'POMODORO 4 - Mix',
      timing: this.formatPomodoro(4),
      activeTime: '3 minutes',
      description: `
        <p><strong>Stay in the bowl.</strong></p>
        <ul>
          <li>Add ${ingredients.starter}g starter, ${ingredients.salt}g salt, ${ingredients.reserveWater}g water</li>
          <li>Pinch and fold in the bowl until incorporated</li>
          <li>Cover</li>
          <li>Refill starter jar with 100g flour + water, return to fridge</li>
        </ul>
      `,
    });

    // Stretch & Fold sets
    const foldStarts = [5, 6, 7, 8];
    foldStarts.forEach((start, index) => {
      steps.push({
        title: `POMODORO ${start} - Stretch & Fold ${index + 1}`,
        timing: this.formatPomodoro(start),
        activeTime: '1 minute',
        description: `
          <p><strong>In the bowl:</strong> wet hands, grab edge, stretch up, fold to center. Rotate bowl, repeat 4 times. Cover.</p>
          ${index === 3 ? '<div class="step-notes"><strong>Last fold. Now hands off.</strong></div>' : ''}
        `,
      });
    });

    // Bulk Fermentation
    steps.push({
      title: 'POMODOROS 9-29 - Bulk Fermentation',
      timing: '12-29 pomodoros (5-12 hours)',
      activeTime: '0 minutes',
      description: `
        <p>Room temp (18-22°C): 5-7 hours until 30-40% larger with surface bubbles.</p>
        <p>OR cold (3-5°C): 8-12 hours in fridge.</p>
      `,
    });

    // Shape
    steps.push({
      title: 'POMODORO ~30 - Shape',
      timing: 'After bulk fermentation',
      activeTime: '3 minutes',
      description: `
        <ul>
          <li>Flour counter, turn out dough gently</li>
          <li>Shape with surface tension, into banneton seam-up</li>
        </ul>
      `,
    });

    // Final Proof
    steps.push({
      title: 'POMODORO ~31 - Final Proof',
      timing: '5-38 pomodoros (2-16 hours)',
      activeTime: '0 minutes',
      description: `
        <p>Room temp: 2-3 hours until jiggly and domed.</p>
        <p>OR cold: 8-16 hours in fridge.</p>
      `,
    });

    // Bake
    steps.push({
      title: 'POMODORO ~35-70 - Bake',
      timing: 'After final proof',
      activeTime: '3 minutes',
      description: `
        <ul>
          <li>Preheat oven + Dutch oven to 250°C (1 pomodoro)</li>
          <li>Score loaf, bake covered 1 pomodoro at 250°C</li>
          <li>Uncover, drop to 230°C, bake 1-2 pomodoros until deep brown</li>
        </ul>
      `,
    });

    return steps;
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

    // Generate protocol steps
    this.renderProtocol(ingredients);

    // Show recipe output
    document.getElementById('recipe-output').style.display = 'block';

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

  renderProtocol(ingredients) {
    const protocolDiv = document.getElementById('protocol-steps');
    const steps = this.generateProtocolSteps(ingredients);

    let html = '';
    steps.forEach(step => {
      html += `
        <div class="protocol-step">
          <div class="step-header">
            <div class="step-title">${step.title}</div>
            <div class="step-timing">${step.timing}</div>
          </div>
          ${step.activeTime ? `<div class="step-active-time">⏱️ ${step.activeTime}</div>` : ''}
          <div class="step-description">${step.description}</div>
        </div>
      `;
    });

    protocolDiv.innerHTML = html;
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BreadCalculator();
});
