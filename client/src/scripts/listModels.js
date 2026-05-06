
async function listModels() {
  const API_KEY = "AIzaSyCJGwzTVZupdnoqUJvBoTahVWk6xT5NGck";
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    console.log("Available Models:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("List Models Failed:", err);
  }
}
listModels();
