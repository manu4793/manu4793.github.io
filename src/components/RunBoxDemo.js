import React, { useState } from 'react';

function RunBoxDemo() {
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const runScript = async () => {
    setLoading(true);
    setOutput('');
    setError('');
    try {
      const response = await fetch('/api/portfolio/run-box-ecm/');
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      setOutput(data.output || 'No output.');
      if (data.error) setError(data.error);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="container my-4">
      <h2>Run Box ECM Demo</h2>
      <button onClick={runScript} disabled={loading} className="btn btn-primary mb-3">
        {loading ? 'Running...' : 'Run Script'}
      </button>
      {error && <div className="alert alert-danger">{error}</div>}
      {output && <pre className="bg-light p-3 rounded">{output}</pre>}
    </div>
  );
}

export default RunBoxDemo;
