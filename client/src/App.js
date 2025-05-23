import React, { useState } from 'react';

function App() {
  const [testResponse, setTestResponse] = useState('');

  const onTestButtonClick = async () => {
    try {
      const response = await fetch('/test');
      const data = await response.text();
      setTestResponse(data);
    } catch (error) {
      console.error('Invalid response: ', error);
      setTestResponse('Invalid response');
    }
  };

  return (
    <div>
      <button onClick={onTestButtonClick}>Click me!</button>
      <p>Response: {testResponse}</p>
    </div>
  );
}

export default App;
