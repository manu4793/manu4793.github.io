import React from "react";
import { useNavigate } from "react-router-dom";

const tools = [
  {
    name: "Calculator",
    description: "A simple calculator for basic math operations.",
    tech: ["React"],
    image: "https://cdn-icons-png.flaticon.com/512/1006/1006551.png",
    route: "/tools/calculator"
  },
  {
    name: "Unit Converter",
    description: "Convert distance, temperature, volume, and mass units easily.",
    tech: ["React"],
    image: "https://cdn-icons-png.flaticon.com/512/561/561188.png",
    route: "/tools/converter"
  },
  {
    name: "Currency Converter",
    description: "Convert currencies including USD to Peso and more.",
    tech: ["React"],
    image: "https://cdn-icons-png.flaticon.com/512/3144/3144456.png",
    route: "/tools/currency-converter"
  },
];

export default function Tools() {
  const navigate = useNavigate();

  return (
    <div className="container my-4">
      <h1 className="my-4">Tools</h1>
      <div className="row">
        {tools.map((tool, idx) => (
          <div className="col-md-6 mb-4" key={idx}>
            <div className="card h-100 shadow-sm">
              {tool.image && (
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="card-img-top"
                  style={{ maxHeight: 220, objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h4 className="card-title">{tool.name}</h4>
                <p className="card-text">{tool.description}</p>
                <div className="mb-2">
                  {tool.tech?.map((t, i) => (
                    <span className="badge bg-secondary me-1" key={i}>
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate(tool.route)}
                >
                  Use
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}