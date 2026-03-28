const unitOptions = {
    Length: ['feet', 'inches', 'yards', 'centimeters'],
    Weight: ['kilograms', 'grams', 'pounds'],
    Temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
    Volume: ['litres', 'millilitres', 'gallons']
};

const categoryMapping = {
    Length: 'LENGTH',
    Weight: 'WEIGHT',
    Temperature: 'TEMPERATURE',
    Volume: 'VOLUME'
};

let currentType = 'Length';
let currentAction = 'Conversion';
let currentOperation = 'Add';
let user = null;

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
        window.location.href = '/login.html';
        return;
    }
    
    user = JSON.parse(storedUser);
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    
    // Initialize event listeners
    initEventListeners();
    initUnitSelectors();
    updateLayout();
});
// Check if API is reachable
async function checkBackendConnection() {
    try {
        const response = await fetch('http://localhost:5000/api/v1/Auth/status');
        if (!response.ok) {
            throw new Error('Backend not responding');
        }
        return true;
    } catch (error) {
        console.error('Backend connection failed:', error);
        showAlert('errorAlert', 'Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000');
        return false;
    }
}
function initEventListeners() {
    // Type buttons
    document.querySelectorAll('[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.dataset.type;
            initUnitSelectors();
            updateLayout();
        });
    });
    
    // Action buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-action]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAction = btn.dataset.action;
            updateLayout();
        });
    });
    
    // Operation buttons
    document.querySelectorAll('[data-op]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-op]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentOperation = btn.dataset.op;
            document.getElementById('operationSymbol').textContent = currentOperation === 'Add' ? '+' : 
                                                                     currentOperation === 'Subtract' ? '-' : '÷';
        });
    });
    
    // Perform operation button
    document.getElementById('performBtn').addEventListener('click', performOperation);
    
    // New operation button
    document.getElementById('newOperationBtn').addEventListener('click', () => {
        document.getElementById('resultSection').classList.add('hidden');
        document.getElementById('fromValue').value = '';
        document.getElementById('value1').value = '';
        document.getElementById('value2').value = '';
        document.getElementById('arithValue1').value = '';
        document.getElementById('arithValue2').value = '';
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await authService.logout();
    });
}

function initUnitSelectors() {
    const units = unitOptions[currentType];
    
    // Update conversion units
    const fromUnitSelect = document.getElementById('fromUnit');
    const toUnitSelect = document.getElementById('toUnit');
    
    if (fromUnitSelect) {
        fromUnitSelect.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    }
    if (toUnitSelect) {
        toUnitSelect.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    }
    
    // Update comparison units
    const unit1Select = document.getElementById('unit1');
    const unit2Select = document.getElementById('unit2');
    
    if (unit1Select) {
        unit1Select.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    }
    if (unit2Select) {
        unit2Select.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    }
    
    // Update arithmetic units
    const arithUnit1Select = document.getElementById('arithUnit1');
    const arithUnit2Select = document.getElementById('arithUnit2');
    
    if (arithUnit1Select) {
        arithUnit1Select.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    }
    if (arithUnit2Select) {
        arithUnit2Select.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    }
}

function updateLayout() {
    const conversionLayout = document.getElementById('conversionLayout');
    const comparisonLayout = document.getElementById('comparisonLayout');
    const arithmeticLayout = document.getElementById('arithmeticLayout');
    const arithmeticSection = document.getElementById('arithmeticSection');
    const tempWarning = document.getElementById('tempWarning');
    
    // Hide all layouts first
    conversionLayout.classList.add('hidden');
    comparisonLayout.classList.add('hidden');
    arithmeticLayout.classList.add('hidden');
    arithmeticSection.classList.add('hidden');
    tempWarning.classList.add('hidden');
    
    if (currentAction === 'Conversion') {
        conversionLayout.classList.remove('hidden');
        document.getElementById('valueUnit').textContent = document.getElementById('fromUnit').value;
    } else if (currentAction === 'Comparison') {
        comparisonLayout.classList.remove('hidden');
    } else if (currentAction === 'Arithmetic') {
        if (currentType === 'Temperature') {
            tempWarning.classList.remove('hidden');
        } else {
            arithmeticLayout.classList.remove('hidden');
            arithmeticSection.classList.remove('hidden');
        }
    }
    
    // Update value unit on unit change
    const fromUnitSelect = document.getElementById('fromUnit');
    if (fromUnitSelect) {
        fromUnitSelect.addEventListener('change', () => {
            document.getElementById('valueUnit').textContent = fromUnitSelect.value;
        });
    }
}

async function performOperation() {
    hideAlert('errorAlert');
    const performBtn = document.getElementById('performBtn');
    performBtn.disabled = true;
    performBtn.innerHTML = '<span class="loader"></span> Processing...';
    
    try {
        let response;
        const category = categoryMapping[currentType];
        
        if (currentAction === 'Conversion') {
            const fromValue = document.getElementById('fromValue').value;
            const fromUnit = document.getElementById('fromUnit').value;
            const toUnit = document.getElementById('toUnit').value;
            
            if (!fromValue || parseFloat(fromValue) <= 0) {
                throw new Error('Please enter a valid source value');
            }
            
            response = await quantitiesService.convert({
                source: { value: parseFloat(fromValue), unit: fromUnit, category },
                targetUnit: toUnit
            });
            
        } else if (currentAction === 'Comparison') {
            const value1 = document.getElementById('value1').value;
            const value2 = document.getElementById('value2').value;
            const unit1 = document.getElementById('unit1').value;
            const unit2 = document.getElementById('unit2').value;
            
            if (!value1 || !value2 || parseFloat(value1) <= 0 || parseFloat(value2) <= 0) {
                throw new Error('Please enter valid values for comparison');
            }
            
            response = await quantitiesService.compare({
                firstQuantity: { value: parseFloat(value1), unit: unit1, category },
                secondQuantity: { value: parseFloat(value2), unit: unit2, category }
            });
            
        } else if (currentAction === 'Arithmetic') {
            if (currentType === 'Temperature') {
                throw new Error('Temperature does not support arithmetic operations');
            }
            
            const value1 = document.getElementById('arithValue1').value;
            const value2 = document.getElementById('arithValue2').value;
            const unit1 = document.getElementById('arithUnit1').value;
            const unit2 = document.getElementById('arithUnit2').value;
            
            if (!value1 || !value2 || parseFloat(value1) <= 0 || parseFloat(value2) <= 0) {
                throw new Error('Please enter valid values for arithmetic');
            }
            
            const requestData = {
                firstQuantity: { value: parseFloat(value1), unit: unit1, category },
                secondQuantity: { value: parseFloat(value2), unit: unit2, category }
            };
            
            if (currentOperation === 'Add') {
                response = await quantitiesService.add(requestData);
            } else if (currentOperation === 'Subtract') {
                response = await quantitiesService.subtract(requestData);
            } else {
                response = await quantitiesService.divide(requestData);
            }
        }
        
        // Display result
        displayResult(response);
        
    } catch (error) {
        showAlert('errorAlert', error.message || 'Operation failed');
    } finally {
        performBtn.disabled = false;
        performBtn.innerHTML = 'Perform Operation';
    }
}

function displayResult(result) {
    const resultSection = document.getElementById('resultSection');
    const resultValue = document.getElementById('resultValue');
    const resultUnit = document.getElementById('resultUnit');
    const formattedResultDiv = document.getElementById('formattedResult');
    
    resultValue.textContent = result.value || result.result?.toFixed(4) || '0';
    resultUnit.textContent = result.unit || result.resultUnit || '';
    
    if (result.formattedResult) {
        formattedResultDiv.textContent = result.formattedResult;
        formattedResultDiv.classList.remove('hidden');
    } else {
        formattedResultDiv.classList.add('hidden');
    }
    
    resultSection.classList.remove('hidden');
}