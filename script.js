const analyzeBtn = document.getElementById("analyzeBtn");
const noteInput = document.getElementById("noteInput");
const noteOutput = document.getElementById("noteOutput");
const voiceBtn = document.getElementById("voiceBtn");
const exportPDF = document.getElementById("exportPDF");

// Subjects with keywords
const SUBJECTS = {
  "History": ["history", "empire", "king", "war", "revolution", "movement"],
  "Geography": ["river", "mountain", "ocean", "climate", "continent", "country"],
  "Polity": ["constitution", "government", "policy", "law", "parliament", "state"],
  "Economics": ["economy", "inflation", "market", "trade", "finance", "GDP"],
  "Physics": ["force", "energy", "mass", "motion", "quantum", "relativity"],
  "Chemistry": ["atom", "molecule", "reaction", "compound", "element", "acid"],
  "Biology": ["cell", "organism", "species", "DNA", "evolution", "genetics"],
  "Mathematics": ["algebra", "geometry", "calculus", "equation", "formula", "theorem"],
  "Literature": ["poem", "novel", "story", "author", "prose", "literature"]
};

// Voice Input
voiceBtn.addEventListener("click", () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Voice recognition not supported in this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    noteInput.value += " " + transcript;
  };

  recognition.onerror = (event) => {
    console.error("Voice recognition error", event);
  };

  recognition.start();
});

// Analyze text
analyzeBtn.addEventListener("click", () => {
  const text = noteInput.value.trim();
  if (!text) return alert("Please enter some text!");

  // Detect subject
  let detectedSubject = "General";
  for (const [subject, keywords] of Object.entries(SUBJECTS)) {
    for (const kw of keywords) {
      if (text.toLowerCase().includes(kw)) {
        detectedSubject = subject;
        break;
      }
    }
  }

  // Keyword frequency analysis
  const words = text.match(/\b\w{4,}\b/g) || [];
  const freq = {};
  words.forEach(w => freq[w.toLowerCase()] = (freq[w.toLowerCase()] || 0) + 1);

  const topWords = Object.entries(freq)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 15)
    .map(w => w[0]);

  // Bold top words in text
  let processedText = text;
  topWords.forEach(word => {
    const re = new RegExp("\\b" + word + "\\b", "gi");
    processedText = processedText.replace(re, `<strong>${word}</strong>`);
  });

  // Simple summary: first 3 sentences
  const sentences = text.split(/(?<=[.?!])\s+/);
  const summary = sentences.slice(0, 3).join(' ');

  // Display result
  noteOutput.innerHTML = `
    <h3>Subject: ${detectedSubject}</h3>
    <p>${processedText}</p>
    <h4>📝 Summary:</h4>
    <p>${summary}</p>
  `;
});

// Export to PDF
exportPDF.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(noteOutput.innerText, 10, 10);
  doc.save("Urvi_Note.pdf");
});
    
