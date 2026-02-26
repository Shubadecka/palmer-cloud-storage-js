document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const container = document.querySelector('.container');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Here you would typically make an API call to verify credentials
        // For now, we'll just simulate a successful login
        if (username && password) {
            // Create main page content
            const mainPage = document.createElement('div');
            mainPage.className = 'main-page';
            mainPage.innerHTML = `
                <h1>Palmer Cloud Storage</h1>
                <div class="nav-buttons">
                    <button onclick="window.location.href='file-storage.html'">File Storage</button>
                    <button onclick="window.location.href='llm.html'">LLM</button>
                    <button onclick="window.location.href='admin-tools.html'">Admin Tools</button>
                </div>
            `;

            // Clear container and show main page
            container.innerHTML = '';
            container.appendChild(mainPage);
            mainPage.style.display = 'block';
        }
    });
}); 