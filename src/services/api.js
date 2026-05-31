export async function analyzeCV(cvText, jdText, templateText = "") {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cvText, jdText, templateText }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function checkHealth() {
  const response = await fetch("/api/health");
  return response.json();
}
