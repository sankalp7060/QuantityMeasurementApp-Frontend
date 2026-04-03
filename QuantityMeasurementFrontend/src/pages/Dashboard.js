import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, api } from '../services/api';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { useAuth } from '../hooks/useAuth';

const unitOptions = {
  Length: ['feet', 'inches', 'yards', 'centimeters'],
  Weight: ['kilograms', 'grams', 'pounds'],
  Temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
  Volume: ['litres', 'millilitres', 'gallons'],
};

const categoryMapping = {
  Length: 'LENGTH',
  Weight: 'WEIGHT',
  Temperature: 'TEMPERATURE',
  Volume: 'VOLUME',
};

const typeIcons = { Length: '📏', Weight: '⚖️', Temperature: '🌡️', Volume: '🧪' };
const actionIcons = { Comparison: '≈', Conversion: '→', Arithmetic: '+' };

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [selectedType, setSelectedType] = useState('Length');
  const [selectedAction, setSelectedAction] = useState('Conversion');
  const [selectedArithmeticOp, setSelectedArithmeticOp] = useState('Add');

  const [fromValue, setFromValue] = useState('');
  const [fromUnit, setFromUnit] = useState('feet');
  const [toUnit, setToUnit] = useState('inches');

  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [unit1, setUnit1] = useState('feet');
  const [unit2, setUnit2] = useState('inches');

  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getOperationSymbol = (op) => {
    switch (op) {
      case 'Add':
        return '+';
      case 'Subtract':
        return '-';
      case 'Divide':
        return '÷';
      default:
        return '+';
    }
  };

  const handleArithmeticOperation = async () => {
    const category = categoryMapping[selectedType];
    let endpoint =
      selectedArithmeticOp === 'Subtract'
        ? '/Quantities/subtract'
        : selectedArithmeticOp === 'Divide'
        ? '/Quantities/divide'
        : '/Quantities/add';

    const requestBody = {
      firstQuantity: { value: parseFloat(value1), unit: unit1, category },
      secondQuantity: { value: parseFloat(value2), unit: unit2, category },
      targetUnit: unit1,
    };

    const response = await api.post(endpoint, requestBody);

    if (selectedArithmeticOp === 'Divide') {
      return {
        value: response.data.ratio?.toFixed(4) || response.data.result?.toFixed(4) || '0',
        unit: '',
        formattedResult:
          response.data.interpretation || response.data.formattedResult || response.data.message,
      };
    }

    return {
      value: response.data.result?.toFixed(4) || '0',
      unit: unit1,
      formattedResult: response.data.formattedResult || response.data.message,
    };
  };

  const handleComparisonOperation = async () => {
    const category = categoryMapping[selectedType];

    const requestBody = {
      firstQuantity: { value: parseFloat(value1), unit: unit1, category },
      secondQuantity: { value: parseFloat(value2), unit: unit2, category },
    };

    const response = await api.post('/Quantities/compare', requestBody);

    return {
      value: response.data.result === 1 ? 'Equal' : 'Not Equal',
      unit: '',
      formattedResult: response.data.formattedResult || response.data.message,
    };
  };

  const handleConversionOperation = async () => {
    const category = categoryMapping[selectedType];

    const requestBody = {
      source: { value: parseFloat(fromValue), unit: fromUnit, category },
      targetUnit: toUnit,
    };

    const response = await api.post('/Quantities/convert', requestBody);

    return {
      value: response.data.result?.toFixed(4) || '0',
      unit: toUnit,
      formattedResult: response.data.formattedResult || response.data.message,
    };
  };

  const handleOperation = async () => {
    setLoading(true);
    setError('');
    setShowResult(false);

    try {
      let responseData;

      if (selectedAction === 'Conversion') {
        if (!fromValue || parseFloat(fromValue) <= 0) {
          setError('Please enter a valid source value');
          setLoading(false);
          return;
        }
        responseData = await handleConversionOperation();
      } else if (selectedAction === 'Comparison') {
        if (!value1 || !value2 || parseFloat(value1) <= 0 || parseFloat(value2) <= 0) {
          setError('Please enter valid values for comparison');
          setLoading(false);
          return;
        }
        responseData = await handleComparisonOperation();
      } else if (selectedAction === 'Arithmetic') {
        if (selectedType === 'Temperature') {
          setError('Temperature does not support arithmetic operations');
          setLoading(false);
          return;
        }
        if (!value1 || !value2 || parseFloat(value1) <= 0 || parseFloat(value2) <= 0) {
          setError('Please enter valid values for arithmetic');
          setLoading(false);
          return;
        }
        responseData = await handleArithmeticOperation();
      }

      setResult(responseData);
      setShowResult(true);
    } catch (err) {
      console.error('Operation error:', err);
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const backendUrl = process.env.REACT_APP_API_URL || 'https://quantitymeasurementapp-k223.onrender.com';
        setError(
          `Cannot connect to backend server. Please make sure the backend is running on ${backendUrl}`
        );
      } else {
        setError(err.response?.data?.message || err.message || 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewOperation = () => {
    setShowResult(false);
    setResult(null);
    setError('');
    setFromValue('');
    setValue1('');
    setValue2('');
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    const newUnits = unitOptions[type];
    setFromUnit(newUnits[0]);
    setToUnit(newUnits[1] || newUnits[0]);
    setUnit1(newUnits[0]);
    setUnit2(newUnits[1] || newUnits[0]);
    setError('');
  };

  const isActionDisabled = (action) => selectedType === 'Temperature' && action === 'Arithmetic';

  if (!user) return <Loader fullScreen />;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}></div>
          <h1 style={styles.headerTitle}>
            <span style={styles.headerIcon}>→</span>
            Welcome To Quantity Measurement
          </h1>
          <div style={styles.userInfo}>
            <span style={styles.userName}>
              {user.firstName} {user.lastName}
            </span>
            <button onClick={logout} style={styles.logoutButton}>
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
      </header>

      <div style={styles.main}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>CHOOSE TYPE</h2>
          <div style={styles.buttonGrid4}>
            {['Length', 'Weight', 'Temperature', 'Volume'].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                style={{
                  ...styles.typeButton,
                  ...(selectedType === type
                    ? styles.typeButtonActive
                    : styles.typeButtonInactive),
                }}
              >
                <span>{typeIcons[type]}</span> {type}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>CHOOSE ACTION</h2>
          <div style={styles.buttonGrid3}>
            {['Comparison', 'Conversion', 'Arithmetic'].map((action) => (
              <button
                key={action}
                onClick={() => setSelectedAction(action)}
                disabled={isActionDisabled(action)}
                style={{
                  ...styles.actionButton,
                  ...(selectedAction === action
                    ? styles.actionButtonActive
                    : styles.actionButtonInactive),
                  ...(isActionDisabled(action) ? styles.disabledButton : {}),
                }}
              >
                <span>{actionIcons[action]}</span> {action}
              </button>
            ))}
          </div>
        </div>

        {selectedAction === 'Arithmetic' && selectedType !== 'Temperature' && (
          <div style={styles.section}>
            <h3 style={styles.sectionSubtitle}>CHOOSE OPERATION</h3>
            <div style={styles.buttonGroup}>
              {['Add', 'Subtract', 'Divide'].map((op) => (
                <button
                  key={op}
                  onClick={() => setSelectedArithmeticOp(op)}
                  style={{
                    ...styles.opButton,
                    ...(selectedArithmeticOp === op
                      ? styles.opButtonActive
                      : styles.opButtonInactive),
                  }}
                >
                  {getOperationSymbol(op)}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {selectedAction === 'Conversion' && (
          <div style={styles.conversionCard}>
            <div style={styles.row2}>
              <div>
                <label style={styles.inputLabel}>From</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  style={styles.select}
                >
                  {unitOptions[selectedType].map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.inputLabel}>To</label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  style={styles.select}
                >
                  {unitOptions[selectedType].map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={styles.inputLabel}>Value</label>
              <div style={styles.valueInputWrapper}>
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  placeholder="Enter value to convert"
                  style={styles.valueInput}
                  step="any"
                />
                <span style={styles.valueUnit}>{fromUnit}</span>
              </div>
            </div>
            <div style={styles.arrowContainer}>
              <div style={styles.arrowIcon}>→</div>
            </div>
          </div>
        )}

        {selectedAction === 'Comparison' && (
          <div style={styles.comparisonCard}>
            <div style={styles.row3}>
              <div style={styles.comparisonCol}>
                <label style={styles.inputLabel}>VALUE 1</label>
                <input
                  type="number"
                  value={value1}
                  onChange={(e) => setValue1(e.target.value)}
                  placeholder="Enter value"
                  style={styles.numberInput}
                  step="any"
                />
                <select
                  value={unit1}
                  onChange={(e) => setUnit1(e.target.value)}
                  style={styles.select}
                >
                  {unitOptions[selectedType].map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.comparisonCenter}>
                <div style={styles.comparisonSymbol}>≈</div>
              </div>
              <div style={styles.comparisonCol}>
                <label style={styles.inputLabel}>VALUE 2</label>
                <input
                  type="number"
                  value={value2}
                  onChange={(e) => setValue2(e.target.value)}
                  placeholder="Enter value"
                  style={styles.numberInput}
                  step="any"
                />
                <select
                  value={unit2}
                  onChange={(e) => setUnit2(e.target.value)}
                  style={styles.select}
                >
                  {unitOptions[selectedType].map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedAction === 'Arithmetic' && selectedType !== 'Temperature' && (
          <div style={styles.comparisonCard}>
            <div style={styles.row3}>
              <div style={styles.comparisonCol}>
                <label style={styles.inputLabel}>VALUE 1</label>
                <input
                  type="number"
                  value={value1}
                  onChange={(e) => setValue1(e.target.value)}
                  placeholder="Enter value"
                  style={styles.numberInput}
                  step="any"
                />
                <select
                  value={unit1}
                  onChange={(e) => setUnit1(e.target.value)}
                  style={styles.select}
                >
                  {unitOptions[selectedType].map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.comparisonCenter}>
                <div style={styles.comparisonSymbol}>
                  {getOperationSymbol(selectedArithmeticOp)}
                </div>
              </div>
              <div style={styles.comparisonCol}>
                <label style={styles.inputLabel}>VALUE 2</label>
                <input
                  type="number"
                  value={value2}
                  onChange={(e) => setValue2(e.target.value)}
                  placeholder="Enter value"
                  style={styles.numberInput}
                  step="any"
                />
                <select
                  value={unit2}
                  onChange={(e) => setUnit2(e.target.value)}
                  style={styles.select}
                >
                  {unitOptions[selectedType].map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedAction === 'Arithmetic' && selectedType === 'Temperature' && (
          <Alert
            type="warning"
            message="Arithmetic operations are not supported for Temperature. Please select Comparison or Conversion."
          />
        )}

        <div style={styles.buttonContainer}>
          <Button
            onClick={handleOperation}
            variant="primary"
            loading={loading}
            disabled={
              (selectedAction === 'Conversion' && (!fromValue || parseFloat(fromValue) <= 0)) ||
              ((selectedAction === 'Comparison' || selectedAction === 'Arithmetic') &&
                (!value1 || !value2 || parseFloat(value1) <= 0 || parseFloat(value2) <= 0)) ||
              (selectedAction === 'Arithmetic' && selectedType === 'Temperature')
            }
          >
            Perform Operation
          </Button>
        </div>

        {showResult && result && (
          <div style={styles.resultCard}>
            <h3 style={styles.resultTitle}>RESULT</h3>
            <div style={styles.resultGrid}>
              <div style={styles.resultValue}>
                <span style={styles.resultNumber}>{result.value}</span>
              </div>
              <div style={styles.resultUnit}>
                <span>{result.unit}</span>
              </div>
            </div>
            {result.formattedResult && (
              <div style={styles.formattedResult}>
                <p>{result.formattedResult}</p>
              </div>
            )}
            <div style={styles.newButtonContainer}>
              <Button onClick={handleNewOperation} variant="secondary">
                ⟳ New Operation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
  },
  header: {
    background: '#3b82f6',
    padding: '16px 24px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
  headerContent: {
    maxWidth: '1152px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    width: '80px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerIcon: {
    fontSize: '24px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
  },
  logoutButton: {
    background: 'white',
    color: '#3b82f6',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  main: {
    maxWidth: '1152px',
    margin: '0 auto',
    padding: '24px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: '12px',
    letterSpacing: '0.05em',
  },
  sectionSubtitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: '12px',
  },
  buttonGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  buttonGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  typeButton: {
    padding: '12px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  typeButtonActive: {
    background: '#3b82f6',
    color: 'white',
    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
    transform: 'scale(1.05)',
  },
  typeButtonInactive: {
    background: 'white',
    color: '#374151',
    border: '1px solid #e5e7eb',
  },
  actionButton: {
    padding: '12px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  actionButtonActive: {
    background: '#3b82f6',
    color: 'white',
    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
    transform: 'scale(1.05)',
  },
  actionButtonInactive: {
    background: 'white',
    color: '#374151',
    border: '1px solid #e5e7eb',
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  opButton: {
    padding: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    borderRadius: '8px',
    flex: 1,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  opButtonActive: {
    background: '#3b82f6',
    color: 'white',
    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
    transform: 'scale(1.05)',
  },
  opButtonInactive: {
    background: 'white',
    color: '#374151',
    border: '1px solid #e5e7eb',
  },
  conversionCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '24px',
  },
  comparisonCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '24px',
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    marginBottom: '24px',
  },
  row3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
    alignItems: 'center',
  },
  comparisonCol: {
    gridColumn: 'span 2',
  },
  comparisonCenter: {
    gridColumn: 'span 1',
    display: 'flex',
    justifyContent: 'center',
  },
  comparisonSymbol: {
    width: '64px',
    height: '64px',
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#3b82f6',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  inputLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: '8px',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
    background: 'white',
  },
  numberInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
    marginBottom: '8px',
  },
  valueInputWrapper: {
    position: 'relative',
  },
  valueInput: {
    width: '100%',
    padding: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '18px',
    color: '#374151',
  },
  valueUnit: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '14px',
    color: '#9ca3af',
  },
  arrowContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '8px',
  },
  arrowIcon: {
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '50%',
    padding: '8px',
    fontSize: '20px',
    color: '#3b82f6',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  resultCard: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
  },
  resultTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: '16px',
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    marginBottom: '16px',
  },
  resultValue: {
    background: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  resultNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  resultUnit: {
    background: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
  },
  formattedResult: {
    marginTop: '16px',
    padding: '12px',
    background: '#eff6ff',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#2563eb',
  },
  newButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '24px',
  },
};

export default Dashboard;