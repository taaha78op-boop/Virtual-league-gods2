                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            files: {
                                'data.json': {
                                    content: JSON.stringify(app, null, 2)
                                }
                            }
                        })
                    }, 10000);
                    if (response.ok) {
                        serverSaved = true;
                        console.log('✓ داده‌ها در GitHub ذخیره شد');
                    }
                } else if (STORAGE_TYPE === 'jsonbin' && JSONBIN_ID && JSONBIN_ID !== 'YOUR_JSONBIN_ID_HERE' && JSONBIN_KEY && JSONBIN_KEY !== 'YOUR_JSONBIN_KEY_HERE') {
                    const response = await fetchWithTimeout(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Master-Key': JSONBIN_KEY
                        },
                        body: JSON.stringify(app)
                    }, 10000);
                    if (response.ok) {
                        serverSaved = true;
                        console.log('✓ داده‌ها در JSONBin ذخیره شد');
                    }
                }
            } catch (error) {
                console.warn('ذخیره در سرور ممکن نشد - فقط در localStorage ذخیره شد:', error.message);
            }
            
            return serverSaved;
        }

        loadData().then(() => {
            // تیم آزاد و جهانی را بساز اگر وجود ندارد
            if (!app.teams.find(t => t.name === 'آزاد و جهانی')) {
                // فقط در userTeams ثبت کن نه teams (جدول)
                if (!app.userTeams['آزاد و جهانی']) {
                    app.userTeams['آزاد و جهانی'] = { name: 'آزاد و جهانی', username: 'free', password: 'free123', isFreeTeam: true };
                    app.budgets.push({ team: 'آزاد و جهانی', budget: 999999999 });
                    saveData();
                }
            }
            applyStoredSettings();
            // طبق درخواست: هر بار که کسی وارد سایت می‌شود بخش ورود باز شود
            app.user = null;
            app.role = 'admin'; // تنظیم پیش‌فرض برای نمایش صفحه ورود
            renderApp();
        }).catch(() => {
            // حتی اگر خطا بود، صفحه باز شود
            applyStoredSettings();
            app.user = null;
            app.role = 'admin'; // تنظیم پیش‌فرض برای نمایش صفحه ورود
            renderApp();
        });

        function applyStoredSettings() {
            if (app.settings.bgImage) {
                document.body.style.backgroundImage = `url('${app.settings.bgImage}')`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundAttachment = 'fixed';
                document.body.style.backgroundPosition = 'center';
            } else if (app.settings.bgColor1 && app.settings.bgColor2) {
                document.body.style.background = `linear-gradient(135deg, ${app.settings.bgColor1} 0%, ${app.settings.bgColor2} 100%)`;
            }
        }

        function renderApp() {
            const root = document.getElementById('app');
            
            if (!app.user) {
                renderLogin(root);
            } else if (app.role === 'admin') {
                renderAdmin(root);
            } else if (app.role === 'team') {
                renderTeam(root);
            } else {
                renderViewer(root);
            }
        }

        function renderLogin(root) {
            const logoHtml = app.settings.logoImage ? 
                `<img src="${app.settings.logoImage}" style="width:100px;height:100px;object-fit:contain;margin:0 auto 15px;display:block;border-radius:50%;" alt="لوگو">` : 
                `<div style="font-size:4em;text-align:center;margin-bottom:10px;">⚽</div>`;
            root.innerHTML = `
                <div class="login-screen">
                    <div class="login-card">
                        ${logoHtml}
                        <h1 class="login-title">${app.settings.leagueName || 'لیگ فوتبال'}</h1>
                        <p class="login-subtitle">مدیریت حرفه‌ای لیگ فوتبال</p>
                        
                        <div class="role-selector">
                            <div class="role-btn ${app.role === 'admin' ? 'active' : ''}" onclick="selectRole('admin', event)">مدیر</div>
                            <div class="role-btn ${app.role === 'team' ? 'active' : ''}" onclick="selectRole('team', event)">تیم</div>
                            <div class="role-btn ${app.role === 'viewer' ? 'active' : ''}" onclick="selectRole('viewer', event)">روح</div>
                        </div>
                        
                        <div id="loginFields"></div>
                        
                        <button class="login-btn" type="button" onclick="login()">ورود</button>
                    </div>
                </div>
            `;
            
            updateLoginFields();
        }

        function selectRole(role, e) {
            app.role = role;
            const evt = e || window.event;
            document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
            if (evt && evt.target) {
                evt.target.classList.add('active');
            }
            updateLoginFields();
        }

        function updateLoginFields() {
            const container = document.getElementById('loginFields');
            if (!container) return;
            
            if (app.role === 'viewer') {
                container.innerHTML = `
                    <p style="text-align: center; color: #1eff00; margin: 20px 0;">
                        ورود مستقیم به حالت تماشاگر
                    </p>
                `;
            } else if (app.role === 'team') {
                // تیم آزاد و جهانی در لیست ورود تیم‌ها نشان داده نمی‌شه
                const teams = Object.keys(app.userTeams).filter(k => !app.userTeams[k].isFreeTeam);
                container.innerHTML = `
                    <div class="input-group">
                        <label>انتخاب تیم</label>
                        <div id="teamsList" style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto; padding-left:4px;">
                            ${teams.length === 0 ? '<p style="color:#b0b0b0; text-align:center;">هیچ تیمی ثبت نشده است</p>' : 
                                teams.map(teamKey => {
                                    const team = app.userTeams[teamKey];
                                    return `
                                        <button type="button" class="team-select-btn" data-team="${team.name}" onclick="selectTeam('${team.name}')">
                                            ${team.name}
                                        </button>
                                    `;
                                }).join('')
                            }
                        </div>
                    </div>
                    <div class="input-group">
                        <label>رمز عبور</label>
                        <input type="password" id="password" placeholder="رمز عبور خود را وارد کنید">
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="input-group">
                        <label>نام کاربری</label>
                        <input type="text" id="username" placeholder="نام کاربری خود را وارد کنید">
                    </div>
                    <div class="input-group">
                        <label>رمز عبور</label>
                        <input type="password" id="password" placeholder="رمز عبور خود را وارد کنید">
                    </div>
                `;
            }
        }

        function selectTeam(teamName) {
            document.querySelectorAll('.team-select-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            event.target.classList.add('selected');
            app.selectedTeam = teamName;
        }

        function login() {
            if (app.role === 'viewer') {
                app.user = 'viewer';
                app.team = null;
                renderApp();
                return;
            }

            const password = document.getElementById('password').value.trim();
            
            if (!password) {
                alert('لطفا رمز عبور را وارد کنید');
                return;
            }
            
            if (app.role === 'admin') {
                const username = document.getElementById('username').value.trim();
                if (!username) {
                    alert('لطفا نام کاربری را وارد کنید');
                    return;
                }
                if (username === 'admin' && password === 'admin123') {
                    app.user = username;
                    renderApp();
                } else {
                    alert('نام کاربری یا رمز عبور اشتباه است');
                }
            } else if (app.role === 'team') {
                if (!app.selectedTeam) {
                    alert('لطفا یک تیم را انتخاب کنید');
                    return;
                }
                
                const teamKey = Object.keys(app.userTeams).find(t => app.userTeams[t].name === app.selectedTeam);
                const team = app.userTeams[teamKey];
                
                if (team && team.password === password) {
                    app.user = team.username;
                    app.team = team.name;
                    renderApp();
                } else {
                    alert('رمز عبور اشتباه است');
                }
            }
        }

        function logout() {
            app.user = null;
            app.role = null;
            app.team = null;
            renderApp();
        }

        async function manualSave() {
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '⏳ در حال ذخیره...';
            btn.disabled = true;
            
            try {
                const saved = await saveData();
                if (saved) {
                    btn.innerHTML = '✅ ذخیره شد!';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 2000);
                } else {
                    btn.innerHTML = '⚠️ فقط در localStorage ذخیره شد';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 3000);
                }
            } catch (e) {
                btn.innerHTML = '❌ خطا در ذخیره';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            }
        }

        async function refreshData() {
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '⏳ در حال بارگذاری...';
            btn.disabled = true;
            
            try {
                await loadData();
                btn.innerHTML = '✅ بارگذاری شد!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    renderApp();
                }, 1000);
            } catch (e) {
                btn.innerHTML = '❌ خطا در بارگذاری';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            }
        }

        function renderAdmin(root) {
            const logoHtml = app.settings.logoImage ? 
                `<img src="${app.settings.logoImage}" style="width:50px;height:50px;object-fit:contain;border-radius:50%;margin-left:10px;" alt="لوگو">` : '';
            const pendingTrCount = (app.pendingTransfers || []).filter(t => t.status === 'pending').length;
            root.innerHTML = `
                <div class="container">
                    <div class="header">
                        <h1 class="header-title">${logoHtml}⚽ پنل مدیریت لیگ</h1>
                        <div class="user-info">
                            <button class="btn" onclick="refreshData()" style="margin-left: 15px; padding: 10px 20px;">🔄 بارگذاری مجدد</button>
                            <button class="btn" onclick="manualSave()" style="margin-left: 15px; padding: 10px 20px;">💾 ذخیره</button>
                            <span>مدیر: ${app.user}</span>
                            <button class="logout-btn" onclick="logout()">خروج</button>
                        </div>
                    </div>
                    
                    <div class="nav-tabs">
                        <div class="nav-tab active" onclick="showTab('teams')">تیم‌ها</div>
                        <div class="nav-tab" onclick="showTab('players')">بازیکنان</div>
                        <div class="nav-tab" onclick="showTab('matches')">مسابقات</div>
                        <div class="nav-tab" onclick="showTab('schedule')">برنامه هفته‌ها</div>
                        <div class="nav-tab" onclick="showTab('standings')">جدول</div>
                        <div class="nav-tab" onclick="showTab('budget')">بودجه</div>
                        <div class="nav-tab" onclick="showTab('transfers')">نقل و انتقالات</div>
                        <div class="nav-tab" onclick="showTab('pendingtransfers')">نقل‌های در انتظار ${pendingTrCount > 0 ? `<span class="pending-badge">${pendingTrCount}</span>` : ''}</div>
                        
                        <div class="nav-tab" onclick="showTab('notifications')">اعلان‌ها ${app.notifications.length > 0 ? `<span class="pending-badge">${app.notifications.length}</span>` : ''}</div>
                        <div class="nav-tab" onclick="showTab('settings')">تنظیمات</div>
                    </div>
                    
                    <div id="content"></div>
                </div>
            `;
            
            showTab('teams');
        }

        function renderTeam(root) {
            root.innerHTML = `
                <div class="container">
                    <div class="header">
                        <h1 class="header-title">⚽ پنل تیم</h1>
                        <div class="user-info">
                            <button class="btn" onclick="refreshData()" style="margin-left: 15px; padding: 10px 20px;">🔄 بارگذاری مجدد</button>
                            <span>تیم: ${app.team}</span>
                            <button class="logout-btn" onclick="logout()">خروج</button>
                        </div>
                    </div>
                    
                    <div class="nav-tabs">
                        <div class="nav-tab active" onclick="showTeamTab('myteam')">تیم من</div>
                        <div class="nav-tab" onclick="showTeamTab('lineup')">ترکیب بازیکنان</div>
                        <div class="nav-tab" onclick="showTeamTab('standings')">جدول</div>
                        <div class="nav-tab" onclick="showTeamTab('matches')">مسابقات</div>
                        <div class="nav-tab" onclick="showTeamTab('budget')">بودجه</div>
                        <div class="nav-tab" onclick="showTeamTab('transfers')">نقل و انتقالات</div>
                        <div class="nav-tab" onclick="showTeamTab('betting')">شرط‌بندی</div>
                        <div class="nav-tab" onclick="showTeamTab('assistant')">دستیار هوشمند</div>
                    </div>
                    
                    <div id="content"></div>
                </div>
            `;
            
            showTeamTab('myteam');
        }

        function renderViewer(root) {
            root.innerHTML = `
                <div class="container">
                    <div class="header">
                        <h1 class="header-title">⚽ مشاهده لیگ</h1>
                        <div class="user-info">
                            <button class="logout-btn" onclick="logout()">خروج</button>
                        </div>
                    </div>
                    
                    <div class="nav-tabs">
                        <div class="nav-tab active" onclick="showViewerTab('standings')">جدول</div>
                        <div class="nav-tab" onclick="showViewerTab('matches')">مسابقات</div>
                        <div class="nav-tab" onclick="showViewerTab('stats')">آمار</div>
                    </div>
                    
                    <div id="content"></div>
                </div>
            `;
            
            showViewerTab('standings');
        }

        function showTab(tab) {
            const evt = window.event;
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            if (evt && evt.target) {
                evt.target.classList.add('active');
            }
            
            const content = document.getElementById('content');
            
            switch(tab) {
                case 'teams': renderTeamsManager(content); break;
                case 'players': renderPlayersManager(content); break;
                case 'matches': renderMatchesManager(content); break;
                case 'schedule': renderScheduleManager(content); break;
                case 'standings': renderStandings(content); break;
                case 'budget': renderBudgetManager(content); break;
                case 'transfers': renderTransfersManager(content); break;
                case 'pendingtransfers': renderPendingTransfersManager(content); break;
                case 'notifications': renderNotifications(content); break;
                case 'settings': renderSettings(content); break;
            }
        }

        function showTeamTab(tab) {
            const evt = window.event;
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            if (evt && evt.target) {
                evt.target.classList.add('active');
            }
            
            const content = document.getElementById('content');
            
            switch(tab) {
                case 'myteam': renderMyTeam(content); break;
                case 'lineup': renderLineupEditor(content); break;
                case 'standings': renderStandings(content); break;
                case 'matches': renderMatchesView(content); break;
                case 'budget': renderBudgetView(content); break;
                case 'transfers': renderTransfersView(content); break;
                case 'betting': renderBettingView(content); break;
                case 'assistant': renderAIAssistant(content); break;
            }
        }

        function showViewerTab(tab) {
            const evt = window.event;
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            if (evt && evt.target) {
                evt.target.classList.add('active');
            }
            
            const content = document.getElementById('content');
            
            switch(tab) {
                case 'standings': renderStandings(content); break;
                case 'matches': renderMatchesView(content); break;
                case 'stats': renderStats(content); break;
            }
        }

        function renderTeamsManager(c) {
            // تیم‌هایی که در جدول هستند (بدون آزاد و جهانی)
            const leagueTeams = app.teams.filter(t => t.name !== 'آزاد و جهانی');
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">افزودن سریع تیم‌ها</h2>
                    <button class="btn" onclick="createSampleTeams()">🚀 ساخت ۴ تیم نمونه</button>
                    <p style="color:#b0b0b0;margin-top:10px;font-size:0.9em;">با یک کلیک ۴ تیم آماده با نام کاربری و رمز ایجاد می‌شود</p>
                </div>
                
                <div class="card">
                    <h2 class="card-title">افزودن تیم جدید</h2>
                    <div class="form-row">
                        <div class="form-group"><label>نام تیم</label><input type="text" id="teamName"></div>
                        <div class="form-group"><label>نام کاربری</label><input type="text" id="teamUser"></div>
                        <div class="form-group"><label>رمز عبور</label><input type="password" id="teamPass"></div>
                    </div>
                    <button class="btn" onclick="addTeam()">افزودن تیم</button>
                </div>
                
                <div class="card">
                    <h2 class="card-title">تیم‌های موجود (در جدول)</h2>
                    ${leagueTeams.length === 0 ? '<p style="color:#b0b0b0;">تیمی وجود ندارد</p>' : `
                        <table class="data-table">
                            <thead><tr><th>تیم</th><th>بازی</th><th>برد</th><th>مساوی</th><th>باخت</th><th>گل زده</th><th>گل خورده</th><th>امتیاز</th><th>عملیات</th></tr></thead>
                            <tbody>${leagueTeams.map(t => `
                                <tr>
                                    <td style="font-weight:600;">${t.name}</td>
                                    <td>${t.w + t.d + t.l}</td>
                                    <td>${t.w}</td>
                                    <td>${t.d}</td>
                                    <td>${t.l}</td>
                                    <td>${t.gf}</td>
                                    <td>${t.ga}</td>
                                    <td style="color:#1eff00;font-weight:700;">${t.p}</td>
                                    <td>
                                        <button class="btn btn-secondary" onclick="editTeam('${t.name}')" style="margin-left: 5px;">ویرایش</button>
                                        <button class="btn btn-danger" onclick="deleteTeam('${t.name}')">حذف</button>
                                    </td>
                                </tr>
                            `).join('')}</tbody>
                        </table>
                    `}
                </div>
                
                <div class="card" style="border-color:rgba(255,165,0,0.3);">
                    <h2 class="card-title" style="color:#ffa500;">🌍 تیم آزاد و جهانی</h2>
                    <p style="color:#b0b0b0;margin-bottom:15px;">این تیم در جدول و مسابقات حضور ندارد. فقط برای ساخت بازیکن و انتقال استفاده می‌شود.</p>
                    <p style="color:#888;">بازیکنان آزاد: ${app.players.filter(p => p.team === 'آزاد و جهانی').length} نفر</p>
                </div>
                
                <div class="card">
                    <h2 class="card-title">بازیکنان در انتظار تایید ${app.pendingPlayers.length > 0 ? `<span class="pending-badge">${app.pendingPlayers.length}</span>` : ''}</h2>
                    ${app.pendingPlayers.length === 0 ? '<p style="color:#b0b0b0;">بازیکنی در انتظار نیست</p>' : app.pendingPlayers.map(p => `
                        <div class="player-card">
                            <div class="player-info">
                                <div class="player-name">${p.name}</div>
                                <div class="player-details">${p.position} • ${p.team} • Overall: ${p.overall}</div>
                            </div>
                            <div class="action-btns">
                                <button class="btn" onclick="approvePlayer(${p.id})">تایید</button>
                                <button class="btn btn-danger" onclick="rejectPlayer(${p.id})">رد</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function createSampleTeams() {
            if (app.teams.length > 0) {
                if (!confirm('تیم‌هایی وجود دارد. آیا می‌خواهید تیم‌های جدید اضافه کنید؟')) return;
            }

            const sampleTeams = [
                { name: 'پرسپولیس', username: 'perspolis', password: '1234' },
                { name: 'استقلال', username: 'esteghlal', password: '1234' },
                { name: 'سپاهان', username: 'sepahan', password: '1234' },
                { name: 'تراکتور', username: 'tractor', password: '1234' }
            ];

            sampleTeams.forEach(team => {
                if (!app.teams.find(t => t.name === team.name)) {
                    app.teams.push({ name: team.name, w: 0, d: 0, l: 0, gf: 0, ga: 0, p: 0 });
                    app.userTeams[team.name] = team;
                    app.budgets.push({ team: team.name, budget: 50000000 });
                }
            });

            saveData();
            alert('✅ ۴ تیم با موفقیت ایجاد شد!\n\nاطلاعات ورود:\n• پرسپولیس: perspolis / 1234\n• استقلال: esteghlal / 1234\n• سپاهان: sepahan / 1234\n• تراکتور: tractor / 1234');
            showTab('teams');
        }

        function addTeam() {
            const name = document.getElementById('teamName').value.trim();
            const username = document.getElementById('teamUser').value.trim();
            const password = document.getElementById('teamPass').value.trim();
            
            if (!name || !username || !password) {
                alert('لطفا تمام فیلدها را پر کنید');
                return;
            }
            
            if (name === 'آزاد و جهانی') {
                alert('این نام رزرو شده است');
                return;
            }
            
            if (app.teams.find(t => t.name === name)) {
                alert('تیم با این نام وجود دارد');
                return;
            }
            
            app.teams.push({ name, w: 0, d: 0, l: 0, gf: 0, ga: 0, p: 0 });
            app.userTeams[name] = { name, username, password };
            app.budgets.push({ team: name, budget: 50000000 });
            
            saveData();
            showTab('teams');
        }

        function editTeam(oldName) {
            const team = app.teams.find(t => t.name === oldName);
            if (!team) return;
            
            const userTeam = app.userTeams[oldName];
            
            const newName = prompt('نام جدید تیم:', oldName);
            if (newName && newName.trim() !== '' && newName !== oldName) {
                // بررسی تکراری نبودن نام
                if (app.teams.find(t => t.name === newName)) {
                    alert('این نام قبلاً استفاده شده است');
                    return;
                }
                
                // تغییر نام در تیم‌ها
                team.name = newName;
                
                // تغییر نام در userTeams
                if (userTeam) {
                    app.userTeams[newName] = { ...userTeam, name: newName };
                    delete app.userTeams[oldName];
                }
                
                // تغییر نام در بازیکنان
                app.players.forEach(p => {
                    if (p.team === oldName) p.team = newName;
                });
                
                // تغییر نام در بودجه
                const budget = app.budgets.find(b => b.team === oldName);
                if (budget) budget.team = newName;
                
                // تغییر نام در ترکیب‌ها
                if (app.lineups[oldName]) {
                    app.lineups[newName] = app.lineups[oldName];
                    delete app.lineups[oldName];
                }
            }
            
            if (userTeam) {
                const newPassword = prompt('رمز عبور جدید (خالی بگذارید برای عدم تغییر):', '');
                if (newPassword && newPassword.trim() !== '') {
                    app.userTeams[newName || oldName].password = newPassword.trim();
                }
            }
            
            saveData();
            showTab('teams');
        }

        function deleteTeam(name) {
            if (!confirm(`آیا از حذف تیم ${name} مطمئن هستید؟`)) return;
            
            app.teams = app.teams.filter(t => t.name !== name);
            delete app.userTeams[name];
            app.players = app.players.filter(p => p.team !== name);
            app.budgets = app.budgets.filter(b => b.team !== name);
            
            saveData();
            showTab('teams');
        }

        function approvePlayer(id) {
            const player = app.pendingPlayers.find(p => p.id === id);
            if (!player) return;
            
            app.players.push(player);
            app.pendingPlayers = app.pendingPlayers.filter(p => p.id !== id);
            
            app.notifications.push({
                id: Date.now(),
                text: `بازیکن ${player.name} برای تیم ${player.team} تایید شد`,
                time: new Date().toLocaleString('fa-IR')
            });
            
            saveData();
            showTab('teams');
        }

        function rejectPlayer(id) {
            app.pendingPlayers = app.pendingPlayers.filter(p => p.id !== id);
            saveData();
            showTab('teams');
        }

        function renderPlayersManager(c) {
            // همه تیم‌ها شامل آزاد و جهانی برای ساخت بازیکن
            const allTeamsForPlayer = [...app.teams, { name: 'آزاد و جهانی' }].filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i);
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">افزودن سریع بازیکنان</h2>
                    <div class="form-group">
                        <label>انتخاب تیم برای افزودن بازیکنان نمونه</label>
                        <select id="bulkTeam">
                            <option value="">-- انتخاب کنید --</option>
                            ${allTeamsForPlayer.map(t => `<option value="${t.name}">${t.name}</option>`).join('')}
                        </select>
                    </div>
                    <button class="btn" onclick="createSamplePlayers()">🚀 ساخت ۱۱ بازیکن نمونه</button>
                    <p style="color:#b0b0b0;margin-top:10px;font-size:0.9em;">یک ترکیب کامل ۱۱ نفره برای تیم انتخابی ایجاد می‌شود</p>
                </div>
                
                <div class="card">
                    <h2 class="card-title">افزودن بازیکن</h2>
                    <div class="form-row">
                        <div class="form-group"><label>نام بازیکن</label><input type="text" id="playerName"></div>
                        <div class="form-group"><label>تیم</label><select id="playerTeam">${allTeamsForPlayer.map(t => `<option>${t.name}</option>`).join('')}</select></div>
                        <div class="form-group"><label>پست</label><select id="playerPos"><option>GK</option><option>DF</option><option>MF</option><option>FW</option></select></div>
                        <div class="form-group"><label>Overall</label><input type="number" id="playerOverall" min="1" max="99" value="75"></div>
                    </div>
                    <button class="btn" onclick="addPlayer()">افزودن بازیکن</button>
                </div>

                <div class="card">
                    <h2 class="card-title">افزودن چند بازیکن یکجا</h2>
                    <p style="color: #b0b0b0; margin-bottom: 15px;">فرمت: نام،اورال،پست (هر بازیکن در یک خط)</p>
                    <p style="color: #888; margin-bottom: 20px; font-size: 0.9em;">مثال:<br>محمد رضایی،85،GK<br>علی احمدی،78،MF<br>حسین کریمی،82،DF</p>
                    <div class="form-group">
                        <label>تیم</label>
                        <select id="multiPlayerTeam">
                            ${allTeamsForPlayer.map(t => `<option>${t.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>لیست بازیکنان</label>
                        <textarea id="multiPlayerList" rows="8" placeholder="نام،اورال،پست
نام،اورال،پست
..."></textarea>
                    </div>
                    <button class="btn" onclick="addMultiplePlayers()">افزودن همه بازیکنان</button>
                </div>
                
                <div class="card">
                    <h2 class="card-title">بازیکنان موجود</h2>
                    ${app.players.length === 0 ? '<p style="color:#b0b0b0;">بازیکنی وجود ندارد</p>' : app.players.map(p => `
                        <div class="player-card">
                            <div class="player-info">
                                <div class="player-name">${p.name}</div>
                                <div class="player-details">${p.position} • ${p.team}</div>
                            </div>
                            <div class="player-overall">${p.overall}</div>
                            <div class="action-btns">
                                <button class="btn btn-secondary" onclick="editPlayer(${p.id})">ویرایش</button>
                                <button class="btn btn-danger" onclick="deletePlayer(${p.id})">حذف</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function createSamplePlayers() {
            const teamName = document.getElementById('bulkTeam').value;
            
            if (!teamName) {
                alert('لطفا یک تیم انتخاب کنید');
                return;
            }

            const samplePlayers = [
                { name: 'علی رضایی', position: 'GK', overall: 82 },
                { name: 'محمد احمدی', position: 'DF', overall: 78 },
                { name: 'حسین محمدی', position: 'DF', overall: 80 },
                { name: 'رضا کریمی', position: 'DF', overall: 77 },
                { name: 'امیر حسینی', position: 'DF', overall: 79 },
                { name: 'مهدی صادقی', position: 'MF', overall: 81 },
                { name: 'سعید عزیزی', position: 'MF', overall: 83 },
                { name: 'علی اکبری', position: 'MF', overall: 80 },
                { name: 'حمید رحیمی', position: 'MF', overall: 78 },
                { name: 'کریم باقری', position: 'FW', overall: 85 },
                { name: 'یاسر اصغری', position: 'FW', overall: 84 }
            ];

            let addedCount = 0;
            samplePlayers.forEach(player => {
                app.players.push({
                    id: Date.now() + addedCount,
                    name: player.name,
                    team: teamName,
                    position: player.position,
                    overall: player.overall
                });
                addedCount++;
            });

            saveData();
            alert(`✅ ${addedCount} بازیکن برای تیم ${teamName} اضافه شد!`);
            showTab('players');
        }

        function addPlayer() {
            const name = document.getElementById('playerName').value.trim();
            const team = document.getElementById('playerTeam').value;
            const position = document.getElementById('playerPos').value;
