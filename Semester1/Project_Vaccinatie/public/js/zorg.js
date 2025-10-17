document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Get email from the URL (e.g., zorg.html?email=test@zorg.com)
        const params = new URLSearchParams(window.location.search);
        const email = params.get("email");

        if (!email) {
            document.body.innerHTML += "<p>No email found in URL.</p>";
            return;
        }

        // Fetch data from your API
        const response = await fetch(`/api/zorg?email=${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();

        // Display JSON in a readable format
        const pre = document.createElement("pre");
        pre.textContent = JSON.stringify(data, null, 2);
        document.body.appendChild(pre);

    } catch (err) {
        console.error("Error loading zorg data:", err);
        document.body.innerHTML += `<p style="color:red;">Error loading zorg data</p>`;
    }
});
