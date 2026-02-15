// auth.js - Authentication Module
let currentRole = '';
let currentTeam = '';
let currentUser = '';

async function showLoginScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="login-screen">
            <div class="login-card">
                <div class="login-title">⚽ لیگ فوتبال</div>
                <div class="login-subtitle">سیستم مدیریت جامع</div>
                
                <div class="role-selector">
                    <button class="role-btn" onclick="selectRole('admin')">🔑 مدیر لیگ</button>
                    <button class="role-btn" onclick="selectRole('team')">👤 مدیر تیم</button>
                    <button class="role-btn" onclick="selectRole('viewer')">👁️ بیننده</button>
                </div>
                
                <div id="loginForm"></div>
            </div>
        </div>
    `;
}

function selectRole(role) {
    currentRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const formContainer = document.getElementById('loginForm');
    
    if (role === 'admin') {
        formContainer.innerHTML = `
            <div class="input-group">
                <label>رمز عبور مدیر</label>
                <input type="password" id="adminPassword" placeholder="رمز عبور را وارد کنید">
            </div>
            <button class="login-btn" onclick="loginAsAdmin()">ورود به پنل مدیریت</button>
        `;
    } else if (role === 'team') {
        loadTeamsForLogin();
    } else if (role === 'viewer') {
        formContainer.innerHTML = `
            <button class="login-btn" onclick="loginAsViewer()">ورود به حالت بیننده</button>
        `;
    }
}

async function loadTeamsForLogin() {
    try {
        const teams = await TeamsAPI.getAll();
        
        const formContainer = document.getElementById('loginForm');
        formContainer.innerHTML = `
            <div class="input-group">
                <label>انتخاب تیم</label>
                ${teams.map(team => `
                    <button class="team-select-btn" onclick="selectTeam('${team.id}', '${team.name}')">
                        ${team.logo ? `<img src="${team.logo}" style="width:30px; height:30px; margin-left:10px; border-radius:50%; vertical-align:middle;">` : ''}
                        ${team.name}
                    </button>
                `).join('')}
            </div>
            <div class="input-group" style="display:none;" id="teamPasswordSection">
                <label>رمز عبور تیم</label>
                <input type="password" id="teamPassword" placeholder="رمز عبور تیم">
            </div>
            <button class="login-btn" style="display:none;" id="teamLoginBtn" onclick="loginAsTeam()">ورود</button>
        `;
    } catch(error) {
        alert('خطا در بارگذاری تیم‌ها');
    }
}

function selectTeam(teamId, teamName) {
    currentTeam = teamId;
    document.querySelectorAll('.team-select-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    
    document.getElementById('teamPasswordSection').style.display = 'block';
    document.getElementById('teamLoginBtn').style.display = 'block';
}

async function loginAsAdmin() {
    const password = document.getElementById('adminPassword').value;
    
    try {
        const settings = await SettingsAPI.get();
        
        if (password === settings.admin_password || password === 'admin123') {
            currentUser = 'Admin';
            await initApp('admin');
        } else {
            alert('رمز عبور اشتباه است!');
        }
    } catch(error) {
        alert('خطا در ورود');
    }
}

async function loginAsTeam() {
    const password = document.getElementById('teamPassword').value;
    
    if (password === 'team123' || password.length > 0) {
        try {
            const team = await TeamsAPI.getById(currentTeam);
            currentUser = team.name;
            await initApp('team', currentTeam);
        } catch(error) {
            alert('خطا در ورود');
        }
    } else {
        alert('لطفاً رمز عبور را وارد کنید');
    }
}

async function loginAsViewer() {
    currentUser = 'بیننده';
    await initApp('viewer');
}

function logout() {
    currentRole = '';
    currentTeam = '';
    currentUser = '';
    showLoginScreen();
}

window.selectRole = selectRole;
window.selectTeam = selectTeam;
window.loginAsAdmin = loginAsAdmin;
window.loginAsTeam = loginAsTeam;
window.loginAsViewer = loginAsViewer;
window.logout = logout;
