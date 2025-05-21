// Styles CSS de l'application
const styles = `
  .app-container {
    padding: 20px;
    color: black;
    background: var(--theme-menu-bg);
    border-radius: 8px;
    width: 300px;
    font-family: Arial, sans-serif;
  }
  .display {
    width: 100%;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
    font-size: 1.2em;
  }
  .button {
    padding: 10px;
    margin: 5px;
    width: 60px;
    background: var(--theme-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .button:hover {
    opacity: 0.9;
  }
  .buttons-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
`;

document.getElementById('app').innerHTML = `
  <style>${styles}</style>
  <div class="app-container">
    <input type="text" class="display" id="calculator-display" readonly />
    <div class="buttons-container">
      <button class="button" onclick="appendSymbol('7')">7</button>
      <button class="button" onclick="appendSymbol('8')">8</button>
      <button class="button" onclick="appendSymbol('9')">9</button>
      <button class="button" onclick="appendSymbol('/')">/</button>
      
      <button class="button" onclick="appendSymbol('4')">4</button>
      <button class="button" onclick="appendSymbol('5')">5</button>
      <button class="button" onclick="appendSymbol('6')">6</button>
      <button class="button" onclick="appendSymbol('*')">*</button>
      
      <button class="button" onclick="appendSymbol('1')">1</button>
      <button class="button" onclick="appendSymbol('2')">2</button>
      <button class="button" onclick="appendSymbol('3')">3</button>
      <button class="button" onclick="appendSymbol('-')">-</button>

      <button class="button" onclick="appendSymbol('0')">0</button>
      <button class="button" onclick="appendSymbol('.')">.</button>
      <button class="button" onclick="calculateResult()">=</button>
      <button class="button" onclick="appendSymbol('+')">+</button>

      <button class="button" onclick="clearDisplay()">C</button>
      <button class="button" onclick="appendSymbol('Math.sin(')">sin</button>
      <button class="button" onclick="appendSymbol('Math.cos(')">cos</button>
      <button class="button" onclick="appendSymbol('Math.log(')">log</button>
    </div>
  </div>
`;

// Fonction pour ajouter un symbole à l'affichage
function appendSymbol(symbol) {
  const display = document.getElementById('calculator-display');
  display.value += symbol;
}

// Fonction pour calculer le résultat
function calculateResult() {
  const display = document.getElementById('calculator-display');
  try {
    display.value = eval(display.value);
  } catch (error) {
    display.value = 'Erreur';
    weboardAPI.ui.showNotification('Erreur de calcul.');
  }
}

// Fonction pour effacer l'affichage
function clearDisplay() {
  document.getElementById('calculator-display').value = '';
}

// Fonction d'initialisation
async function initApp() {
  try {
    // D'autres initialisations peuvent être ajoutées ici
    console.log("Calculatrice initialisée");
  } catch (error) {
    console.error('Erreur:', error);
    weboardAPI.ui.showNotification('Erreur: ' + error.message);
  }
}

window.addEventListener('unload', () => {
  // Ajoutez des nettoyages ici si nécessaire
  console.log("Calculatrice désactivée");
});

// Démarrage de l'application
initApp();
