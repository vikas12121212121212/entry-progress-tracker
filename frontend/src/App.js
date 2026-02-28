import { useEffect, useState } from "react";

function App() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const API_BASE = "http://localhost:5000"; // your backend URL

  // Create a new entry
  const createEntry = async () => {
    if (!title.trim()) return alert("Please enter a title");

    try {
      const res = await fetch(`${API_BASE}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create entry");
      setTitle(""); // reset input
      await loadEntries(); // refresh table
    } catch (err) {
      console.error(err);
      alert("Error creating entry");
    }
  };

  // Load all entries
  const loadEntries = async () => {
    try {
      const res = await fetch(`${API_BASE}/entries`);
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error("Error fetching entries:", err);
    }
  };

  useEffect(() => {
    loadEntries();
    const interval = setInterval(loadEntries, 2000); // poll every 2s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Entry Tracker</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter entry title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "8px", width: "300px", marginRight: "10px" }}
        />
        <button onClick={createEntry} style={{ padding: "8px 16px" }}>
          Create Entry
        </button>
      </div>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Title</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Progress</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{e.id}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{e.title}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{e.status}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                <progress max="100" value={e.progress} style={{ width: "100%" }}></progress>{" "}
                {e.progress}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;