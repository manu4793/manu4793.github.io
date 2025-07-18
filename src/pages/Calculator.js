import React, { useState } from "react";
import { Button, Tab, Tabs, Form, InputGroup, Tooltip, OverlayTrigger } from "react-bootstrap";
import Plot from "react-plotly.js";

const BUTTONS = [
  "7", "8", "9", "/", "sin(", 
  "4", "5", "6", "*", "cos(", 
  "1", "2", "3", "-", "tan(", 
  "0", ".", ",", "(", ")", "^", "+", 
  "Math.PI", "Math.E", "Math.log(", "Math.sqrt("
];

function AdvancedCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");

  const calculateResult = () => {
    try {
      // eslint-disable-next-line no-new-func
      const res = new Function("return " + expression)();
      setResult(res);
    } catch {
      setResult("Error");
    }
  };

  const addToExpression = (val) => {
    setExpression(prev => prev + val);
    setResult("");
  };

  const clearExpression = () => {
    setExpression("");
    setResult("");
  };

  return (
    <div style={{ maxWidth: 360, margin: "auto", userSelect: "none" }}>
      <Form.Control
        type="text"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        placeholder="Enter expression"
        className="mb-2 text-end fs-4"
        spellCheck={false}
        autoComplete="off"
      />
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "10px",
          marginBottom: "12px",
          minHeight: "44px",
          fontWeight: "bold",
          fontSize: "1.25rem",
          textAlign: "right",
          borderRadius: "4px",
          border: "1px solid #ced4da",
        }}
      >
        {result !== "" ? `Result: ${result}` : "Result will appear here"}
      </div>
      <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
        {BUTTONS.map((btn) => (
          <OverlayTrigger
            key={btn}
            placement="top"
            overlay={<Tooltip id={`tooltip-${btn}`}>{btn.replace("Math.", "")}</Tooltip>}
          >
            <Button
              variant="outline-secondary"
              onClick={() => addToExpression(btn)}
              style={{ minWidth: 56, minHeight: 48, fontSize: "1.1rem" }}
            >
              {btn.replace("Math.", "")}
            </Button>
          </OverlayTrigger>
        ))}
      </div>
      <div className="d-flex justify-content-between">
        <Button variant="danger" onClick={clearExpression} style={{ minWidth: 100 }}>
          Clear
        </Button>
        <Button variant="success" onClick={calculateResult} style={{ minWidth: 100 }}>
          =
        </Button>
      </div>
    </div>
  );
}

function GraphingCalculator() {
  const [func, setFunc] = React.useState("");
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState(null);

  const buttons = [
    "7", "8", "9", "+", "-", 
    "4", "5", "6", "*", "/", 
    "1", "2", "3", "(", ")", 
    "0", ".", "x", "y", "^",
    "Math.sin(", "Math.cos(", "Math.tan(", "Math.log(", "Math.sqrt("
  ];

  const addToFunc = (val) => {
    setFunc(func + val);
    setError("");
  };

  const plotFunction = () => {
    setError("");
    try {
      const xValues = [];
      const yValues = [];
      for (let x = -10; x <= 10; x += 0.1) {
        xValues.push(x);
        const expression = func.replace(/y/g, "(0)");
        // eslint-disable-next-line
        const f = new Function("x", `return ${expression}`);
        const y = f(x);
        yValues.push(y);
      }
      setData([
        {
          x: xValues,
          y: yValues,
          type: "scatter",
          mode: "lines",
          marker: { color: "blue" },
        },
      ]);
    } catch {
      setError("Invalid expression");
      setData(null);
    }
  };

  const clearGraph = () => {
    setFunc("");
    setError("");
    setData(null);
  };

  return (
    <div style={{ maxWidth: 360, margin: "auto" }}>
      <InputGroup className="mb-3">
        <InputGroup.Text>f(x, y) =</InputGroup.Text>
        <Form.Control
          type="text"
          value={func}
          placeholder="Build function by clicking buttons"
          readOnly
          className="text-end"
        />
      </InputGroup>

      {/* Buttons laid out with flex-wrap and gap like AdvancedCalculator */}
      <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
        {buttons.map((btn) => (
          <Button
            key={btn}
            variant="outline-secondary"
            onClick={() => addToFunc(btn)}
            style={{ minWidth: 56, minHeight: 48, fontSize: "1.1rem" }}
          >
            {btn.replace("Math.", "")}
          </Button>
        ))}
        <Button
          variant="danger"
          onClick={clearGraph}
          style={{ minWidth: 120 }}
        >
          Clear
        </Button>
        <Button
          variant="success"
          onClick={plotFunction}
          style={{ minWidth: 120 }}
        >
          Plot
        </Button>
      </div>

      {error && <div className="text-danger mb-3">{error}</div>}
      {data && (
        <Plot
          data={data}
          layout={{ width: 580, height: 350, title: "Graph" }}
        />
      )}
    </div>
  );
}

export default function Calculator() {
  const [key, setKey] = useState("advanced");

  return (
    <div className="p-3" style={{ maxWidth: 600, margin: "auto" }}>
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3" fill>
        <Tab eventKey="advanced" title="Advanced Calculator">
          <AdvancedCalculator />
        </Tab>
        <Tab eventKey="graphing" title="Graphing Calculator">
          <GraphingCalculator />
        </Tab>
      </Tabs>
    </div>
  );
}
