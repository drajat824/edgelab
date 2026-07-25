export default function ScriptReference() {
  const variables = [
    {
      name: "cpu_temp",
      type: "float",
      description: "CPU Temperature (°C)",
    },
    {
      name: "camera_fps",
      type: "float",
      description: "Camera FPS",
    },
    {
      name: "inference_running",
      type: "bool",
      description: "AI inference status",
    },
  ];

  const functions = [
    {
      name: "set_frequency(x)",
      description: "Increase or decrease CPU frequency by x steps.",
    },
    {
      name: "hold_frequency()",
      description: "Keep the current frequency.",
    },
    {
      name: "set_min_frequency()",
      description: "Jump directly to minimum frequency.",
    },
    {
      name: "set_max_frequency()",
      description: "Jump directly to maximum frequency.",
    },
  ];

  return (
    <div className="w-fit flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--menu)]">Available Variables & Functions</h2>

        <p className="text-sm text-gray-500 mt-1">These variables and helper functions can be used inside the userspace script editor.</p>
      </div>

      {/* Variables */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <h3 className="font-semibold">Variables</h3>
        </div>

        <div className="space-y-3">
          {variables.map((item) => (
            <div key={item.name} className="rounded-xl border border-gray-200 p-4 bg-white">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <code className="font-semibold text-green-600">{item.name}</code>
                  <p className="text-sm text-gray-600 max-w-md">{item.description}</p>
                </div>
                <span className="ml-2 px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-600">{item.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Functions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h3 className="font-semibold">Functions</h3>
        </div>

        <div className="space-y-3">
          {functions.map((item) => (
            <div key={item.name} className="rounded-xl border border-gray-200 p-4 bg-white">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <code className="font-semibold text-green-600">{item.name}</code>
                  <p className="text-sm text-gray-600 max-w-md">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
