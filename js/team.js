                                </select>
                            </div>
                        </div>
                        <button class="btn" onclick="generateSchedule()">🔄 ساخت خودکار برنامه</button>
                        ${app.schedule && app.schedule.length > 0 ? `<button class="btn btn-danger" style="margin-right:10px;" onclick="clearSchedule()">🗑️ پاک کردن برنامه</button>` : ''}
                    </div>
                    
                    ${app.schedule && app.schedule.length > 0 ? `
                        <div class="settings-section">
                            <div class="settings-title">برنامه مسابقات (${app.schedule.length} هفته)</div>
                            ${app.schedule.map((week, wi) => `
                                <div style="margin-bottom:20px;">
                                    <div style="color:#1eff00;font-weight:700;margin-bottom:10px;font-size:1.1em;">هفته ${wi + 1}</div>
                                    ${week.matches.map((m, mi) => {
                                        const played = app.matches.find(x => x.home === m.home && x.away === m.away);
                                        return `
                                        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 15px;background:rgba(255,255,255,0.05);border-radius:10px;margin-bottom:8px;gap:10px;">
                                            <span style="font-weight:600;min-width:80px;text-align:right;">${m.home}</span>
                                            ${played ? `
                                                <span style="color:#1eff00;padding:5px 15px;background:rgba(30,255,0,0.1);border-radius:8px;font-weight:700;">${played.homeScore} - ${played.awayScore}</span>
                                            ` : `
                                                <button class="btn btn-secondary" style="padding:6px 14px;font-size:0.85em;" onclick="openScheduleResult(${wi}, ${mi})">ثبت نتیجه</button>
                                            `}
                                            <span style="font-weight:600;min-width:80px;text-align:left;">${m.away}</span>
                                        </div>
                                        `;
                                    }).join('')}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color:#b0b0b0;margin-top:15px;">برنامه‌ای ساخته نشده. روی "ساخت خودکار برنامه" کلیک کنید.</p>'}

                    <div class="modal" id="scheduleResultModal">
                        <div class="modal-content">
                            <div class="modal-header">ثبت نتیجه مسابقه</div>
                            <div id="scheduleResultBody"></div>
                            <button class="modal-close" onclick="closeScheduleResultModal()">بستن</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function updateLeagueType() {
            app.leagueType = document.getElementById('leagueTypeSelect').value;
            saveData();
            renderScheduleManager(document.getElementById('content'));
        }

        function generateSchedule() {
            const leagueTeams = app.teams.filter(t => t.name !== 'آزاد و جهانی');
            if (leagueTeams.length < 2) {
                alert('حداقل ۲ تیم برای ساخت برنامه نیاز است');
                return;
            }
            
            const scheduleType = document.getElementById('scheduleType').value;
            const teams = leagueTeams.map(t => t.name);
            const schedule = [];
            
            // الگوریتم Round Robin
            const n = teams.length % 2 === 0 ? teams.length : teams.length + 1;
            const rounds = n - 1;
            const teamsArr = [...teams];
            if (teams.length % 2 !== 0) teamsArr.push('BYE');
            
            for (let r = 0; r < rounds; r++) {
                const weekMatches = [];
                for (let i = 0; i < n / 2; i++) {
                    const home = teamsArr[i];
                    const away = teamsArr[n - 1 - i];
                    if (home !== 'BYE' && away !== 'BYE') {
                        weekMatches.push({ home, away });
                    }
                }
                schedule.push({ matches: weekMatches });
                
                // چرخاندن تیم‌ها (ثابت نگه داشتن اول)
                const last = teamsArr.pop();
                teamsArr.splice(1, 0, last);
            }
            
            // اگه رفت و برگشت باشه، دور برگشت اضافه کن
            if (scheduleType === 'home_away') {
                const returnSchedule = schedule.map(week => ({
                    matches: week.matches.map(m => ({ home: m.away, away: m.home }))
                }));
                app.schedule = [...schedule, ...returnSchedule];
            } else {
                app.schedule = schedule;
            }
            
            saveData();
            renderScheduleManager(document.getElementById('content'));
            alert(`✅ برنامه ${app.schedule.length} هفته‌ای ساخته شد!`);
        }

        function clearSchedule() {
            if (!confirm('آیا از پاک کردن برنامه مطمئن هستید؟')) return;
            app.schedule = [];
            saveData();
            renderScheduleManager(document.getElementById('content'));
        }

        function openScheduleResult(wi, mi) {
            const m = app.schedule[wi].matches[mi];
            document.getElementById('scheduleResultBody').innerHTML = `
                <p style="margin-bottom:15px;color:#b0b0b0;">${m.home} در مقابل ${m.away}</p>
                <div class="form-row">
                    <div class="form-group">
                        <label>گل ${m.home}</label>
                        <input type="number" id="sr_homeScore" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label>گل ${m.away}</label>
                        <input type="number" id="sr_awayScore" min="0" value="0">
                    </div>
                </div>
                <div class="form-group">
                    <label>گلزنان ${m.home}</label>
                    <input type="text" id="sr_homeScorers" placeholder="مثال: علی، رضا">
                </div>
                <div class="form-group">
                    <label>گلزنان ${m.away}</label>
                    <input type="text" id="sr_awayScorers" placeholder="مثال: حسن، مهدی">
                </div>
                <button class="btn" onclick="submitScheduleResult('${m.home}', '${m.away}')">✅ ثبت نتیجه</button>
            `;
            document.getElementById('scheduleResultModal').classList.add('show');
        }

        function closeScheduleResultModal() {
            document.getElementById('scheduleResultModal').classList.remove('show');
        }

        function submitScheduleResult(home, away) {
            const homeScore = parseInt(document.getElementById('sr_homeScore').value) || 0;
            const awayScore = parseInt(document.getElementById('sr_awayScore').value) || 0;
            const homeScorers = document.getElementById('sr_homeScorers').value.trim();
            const awayScorers = document.getElementById('sr_awayScorers').value.trim();

            let scorers = '';
            if (homeScorers) scorers += `${home}: ${homeScorers}`;
            if (awayScorers) scorers += (scorers ? ' | ' : '') + `${away}: ${awayScorers}`;

            app.matches.push({ home, away, homeScore, awayScore, scorers, goalOddsMultiplier: 2 });

            const homeTeam = app.teams.find(t => t.name === home);
            const awayTeam = app.teams.find(t => t.name === away);
            if (homeTeam && awayTeam) {
                homeTeam.gf += homeScore; homeTeam.ga += awayScore;
                awayTeam.gf += awayScore; awayTeam.ga += homeScore;
                if (homeScore > awayScore) { homeTeam.w++; homeTeam.p += 3; awayTeam.l++; }
                else if (homeScore < awayScore) { awayTeam.w++; awayTeam.p += 3; homeTeam.l++; }
                else { homeTeam.d++; awayTeam.d++; homeTeam.p++; awayTeam.p++; }
            }

            processBetsForMatch(app.matches.length - 1);
            saveData();
            closeScheduleResultModal();
            renderScheduleManager(document.getElementById('content'));
        }

        function renderPendingTransfersManager(c) {
            const pending = (app.pendingTransfers || []).filter(t => t.status === 'pending');
            const history = (app.pendingTransfers || []).filter(t => t.status !== 'pending');
            
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">🔄 نقل و انتقالات در انتظار تأیید ${pending.length > 0 ? `<span class="pending-badge">${pending.length}</span>` : ''}</h2>
                    ${pending.length === 0 ? '<p style="color:#b0b0b0;">نقل و انتقالی در انتظار نیست</p>' : pending.map((tr, idx) => `
                        <div class="transfer-card" style="border-color:rgba(255,165,0,0.4);">
                            <div class="transfer-details" style="flex:1;">
                                <div class="transfer-player">🔄 ${tr.playerName}</div>
                                <div class="transfer-route">${tr.from} → ${tr.to}</div>
                                <div class="transfer-price">${(tr.amount||0).toLocaleString()} یورو • ${tr.duration || 1} سال</div>
                                <div style="color:#888;font-size:0.85em;margin-top:5px;">ارسال توسط: تیم ${tr.requestedBy} • ${tr.time}</div>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:10px;">
                                <button class="btn" onclick="approvePendingTransfer(${tr.id})">✅ تأیید</button>
                                <button class="btn btn-danger" onclick="rejectPendingTransfer(${tr.id})">❌ رد</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${history.length > 0 ? `
                <div class="card">
                    <h2 class="card-title">تاریخچه نقل و انتقالات</h2>
                    ${history.map(tr => `
                        <div class="transfer-card" style="border-color:${tr.status === 'approved' ? 'rgba(30,255,0,0.3)' : 'rgba(255,50,50,0.3)'};">
                            <div class="transfer-details">
                                <div class="transfer-player">${tr.status === 'approved' ? '✅' : '❌'} ${tr.playerName}</div>
                                <div class="transfer-route">${tr.from} → ${tr.to}</div>
                                <div style="color:#888;font-size:0.85em;">${tr.status === 'approved' ? 'تأیید شد' : 'رد شد'} • ${tr.time}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            `;
        }

        function approvePendingTransfer(id) {
            if (!app.pendingTransfers) return;
            const tr = app.pendingTransfers.find(t => t.id === id);
            if (!tr) return;
            
            tr.status = 'approved';
            
            // کم کردن بودجه از تیم مقصد
            if (tr.to !== 'آزاد و جهانی' && tr.amount > 0) {
                const destBudget = app.budgets.find(b => b.team === tr.to);
                if (destBudget) destBudget.budget -= tr.amount;
                if (tr.from !== 'آزاد و جهانی') {
                    const srcBudget = app.budgets.find(b => b.team === tr.from);
                    if (srcBudget) srcBudget.budget += tr.amount;
                }
            }
            
            // انتقال واقعی بازیکن
            const player = app.players.find(p => p.id === tr.playerId);
            if (player) player.team = tr.to;
            
            // اضافه به لیست رسمی
            app.transfers.push({ player: tr.playerName, playerId: tr.playerId, from: tr.from, to: tr.to, amount: tr.amount, duration: tr.duration || 1, img: tr.img || '' });
            
            app.notifications.push({
                id: Date.now(),
                text: `✅ انتقال تأیید شد: ${tr.playerName} از ${tr.from} به ${tr.to}`,
                time: new Date().toLocaleString('fa-IR')
            });
            
            saveData();
            renderAdmin(document.getElementById('app'));
            showTab('pendingtransfers');
        }

        function rejectPendingTransfer(id) {
            if (!app.pendingTransfers) return;
            const tr = app.pendingTransfers.find(t => t.id === id);
            if (!tr) return;
            
            tr.status = 'rejected';
            
            app.notifications.push({
                id: Date.now(),
                text: `❌ انتقال رد شد: ${tr.playerName} از ${tr.from} به ${tr.to}`,
                time: new Date().toLocaleString('fa-IR')
            });
            
            saveData();
            renderAdmin(document.getElementById('app'));
            showTab('pendingtransfers');
        }

        function renderSettings(c) {
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">تنظیمات ظاهری</h2>
                    
                    <div class="settings-section">
                        <div class="settings-title">🏆 اطلاعات لیگ</div>
                        <div class="form-group">
                            <label>نام لیگ</label>
                            <input type="text" id="leagueName" value="${app.settings.leagueName || 'لیگ فوتبال'}" placeholder="نام لیگ را وارد کنید">
                        </div>
                        <button class="btn" onclick="saveLeagueName()">ذخیره نام</button>
                    </div>
                    
                    <div class="settings-section">
                        <div class="settings-title">🖼️ لوگوی لیگ</div>
                        <div class="form-group">
                            <label>آدرس تصویر لوگو (URL)</label>
                            <input type="url" id="logoImg" value="${app.settings.logoImage || ''}" placeholder="https://example.com/logo.png">
                        </div>
                        ${app.settings.logoImage ? `<img src="${app.settings.logoImage}" style="width:80px;height:80px;object-fit:contain;border-radius:50%;margin:10px 0;display:block;">` : ''}
                        <button class="btn" onclick="applyLogo()">ذخیره لوگو</button>
                        ${app.settings.logoImage ? `<button class="btn btn-danger" style="margin-right:10px;" onclick="removeLogo()">حذف لوگو</button>` : ''}
                    </div>
                    
                    <div class="settings-section">
                        <div class="settings-title">رنگ دکمه‌ها</div>
                        <div class="color-picker-group">
                            <div class="form-group">
                                <label>رنگ اصلی دکمه</label>
                                <input type="color" id="btnColor1" value="${app.settings.buttonColor}">
                            </div>
                            <div class="form-group">
                                <label>رنگ ثانویه دکمه</label>
                                <input type="color" id="btnColor2" value="${app.settings.buttonSecondColor}">
                            </div>
                        </div>
                        <button class="btn" onclick="applyButtonColors()">اعمال رنگ‌ها</button>
                    </div>
                    
                    <div class="settings-section">
                        <div class="settings-title">🎨 پس‌زمینه</div>
                        <div class="form-group">
                            <label>آدرس تصویر پس‌زمینه (URL)</label>
                            <input type="url" id="bgImg" value="${app.settings.bgImage || ''}" placeholder="https://example.com/background.jpg">
                        </div>
                        <div class="form-row">
                            <div class="form-group"><label>رنگ 1 (اگه عکس نباشه)</label><input type="color" id="bgColor1" value="${app.settings.bgColor1 || '#0a0e27'}"></div>
                            <div class="form-group"><label>رنگ 2 (اگه عکس نباشه)</label><input type="color" id="bgColor2" value="${app.settings.bgColor2 || '#2a1f3a'}"></div>
                        </div>
                        <button class="btn" onclick="applyBg()">اعمال پس‌زمینه</button>
                        ${app.settings.bgImage ? `<button class="btn btn-danger" style="margin-right:10px;" onclick="removeBg()">حذف پس‌زمینه</button>` : ''}
                    </div>
                </div>
            `;
        }

        function saveLeagueName() {
            app.settings.leagueName = document.getElementById('leagueName').value.trim() || 'لیگ فوتبال';
            saveData();
            alert('نام لیگ ذخیره شد');
        }

        function applyLogo() {
            const logoUrl = document.getElementById('logoImg').value.trim();
            app.settings.logoImage = logoUrl;
            saveData();
            renderSettings(document.getElementById('content'));
            alert('لوگو ذخیره شد');
        }

        function removeLogo() {
            app.settings.logoImage = '';
            saveData();
            renderSettings(document.getElementById('content'));
        }

        function removeBg() {
            app.settings.bgImage = '';
            document.body.style.background = `linear-gradient(135deg, ${app.settings.bgColor1 || '#0a0e27'} 0%, ${app.settings.bgColor2 || '#2a1f3a'} 100%)`;
            saveData();
            renderSettings(document.getElementById('content'));
        }

        function applyButtonColors() {
            const color1 = document.getElementById('btnColor1').value;
            const color2 = document.getElementById('btnColor2').value;
            
            app.settings.buttonColor = color1;
            app.settings.buttonSecondColor = color2;
            
            const style = document.createElement('style');
            style.innerHTML = `
                .btn { background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%) !important; }
                .nav-tab.active { background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%) !important; }
                .role-btn.active { background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%) !important; }
                .login-btn { background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%) !important; }
            `;
            document.head.appendChild(style);
            
            saveData();
            alert('رنگ دکمه‌ها تغییر کرد');
        }

        function applyBg() {
            const img = document.getElementById('bgImg').value.trim();
            const c1 = document.getElementById('bgColor1').value;
            const c2 = document.getElementById('bgColor2').value;
            
            app.settings.bgImage = img;
            app.settings.bgColor1 = c1;
            app.settings.bgColor2 = c2;
            
            if (img) {
                document.body.style.backgroundImage = `url('${img}')`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundAttachment = 'fixed';
                document.body.style.backgroundPosition = 'center';
            } else {
                document.body.style.backgroundImage = '';
                document.body.style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
            }
            
            saveData();
            renderSettings(document.getElementById('content'));
            alert('پس‌زمینه تغییر کرد');
        }

        function renderStandings(c) {
            // تیم آزاد و جهانی در جدول نیست
            const allTeams = [...app.teams].filter(t => t.name !== 'آزاد و جهانی');
            
            // اگر گروه‌ها وجود دارند، جدول گروهی نشان بده
            if (app.groups && Object.keys(app.groups).length > 0) {
                let groupsHtml = '';
                Object.keys(app.groups).forEach(groupName => {
                    const groupTeamNames = app.groups[groupName];
                    const groupTeams = groupTeamNames.map(name => {
                        return allTeams.find(t => t.name === name) || { name, w:0, d:0, l:0, gf:0, ga:0, p:0 };
                    }).sort((a, b) => {
                        if (b.p !== a.p) return b.p - a.p;
                        const diffA = a.gf - a.ga;
                        const diffB = b.gf - b.ga;
                        if (diffB !== diffA) return diffB - diffA;
                        return b.gf - a.gf;
                    });
                    
                    groupsHtml += `
                        <div class="card" style="margin-bottom: 20px;">
                            <h3 style="color:#1eff00; margin-bottom:15px;">${groupName}</h3>
                            <div class="table-wrapper">
                                <table class="data-table">
                                    <thead><tr><th>رتبه</th><th>تیم</th><th>بازی</th><th>برد</th><th>مساوی</th><th>باخت</th><th>گل زده</th><th>گل خورده</th><th>تفاضل</th><th>امتیاز</th></tr></thead>
                                    <tbody>${groupTeams.map((t, i) => `
                                        <tr>
                                            <td>${i + 1}</td>
                                            <td style="text-align:right;font-weight:600;">${t.name}</td>
                                            <td>${t.w + t.d + t.l}</td>
                                            <td>${t.w}</td>
                                            <td>${t.d}</td>
                                            <td>${t.l}</td>
                                            <td>${t.gf}</td>
                                            <td>${t.ga}</td>
                                            <td style="color:${t.gf - t.ga > 0 ? '#1eff00' : t.gf - t.ga < 0 ? '#ff5050' : '#fff'}">${t.gf - t.ga > 0 ? '+' : ''}${t.gf - t.ga}</td>
                                            <td style="font-weight:700;color:#1eff00;">${t.p}</td>
                                        </tr>
                                    `).join('')}</tbody>
                                </table>
                            </div>
                        </div>
                    `;
                });
                
                c.innerHTML = `
                    <div class="card">
                        <h2 class="card-title">جدول رده‌بندی گروهی</h2>
                    </div>
                    ${groupsHtml}
                `;
            } else {
                // جدول عادی
                const sorted = allTeams.sort((a, b) => {
                    if (b.p !== a.p) return b.p - a.p;
                    const diffA = a.gf - a.ga;
                    const diffB = b.gf - b.ga;
                    if (diffB !== diffA) return diffB - diffA;
                    return b.gf - a.gf;
                });
                
                c.innerHTML = `
                    <div class="card">
                        <h2 class="card-title">جدول رده‌بندی</h2>
                        ${sorted.length === 0 ? '<p style="color:#b0b0b0;">تیمی وجود ندارد</p>' : `
                            <div class="table-wrapper">
                                <table class="data-table">
                                    <thead><tr><th>رتبه</th><th>تیم</th><th>بازی</th><th>برد</th><th>مساوی</th><th>باخت</th><th>گل زده</th><th>گل خورده</th><th>تفاضل</th><th>امتیاز</th></tr></thead>
                                    <tbody>${sorted.map((t, i) => `
                                        <tr>
                                            <td>${i + 1}</td>
                                            <td style="text-align:right;font-weight:600;">${t.name}</td>
                                        <td>${t.w + t.d + t.l}</td>
                                        <td>${t.w}</td>
                                        <td>${t.d}</td>
                                        <td>${t.l}</td>
                                        <td>${t.gf}</td>
                                        <td>${t.ga}</td>
                                        <td style="color:${t.gf - t.ga > 0 ? '#1eff00' : t.gf - t.ga < 0 ? '#ff5050' : '#fff'}">${t.gf - t.ga > 0 ? '+' : ''}${t.gf - t.ga}</td>
                                        <td style="font-weight:700;color:#1eff00;">${t.p}</td>
                                    </tr>
                                `).join('')}</tbody>
                            </table>
                            </div>
                        `}
                    </div>
                `;
            }
        }

        function renderMatchesView(c) {
            // محاسبه بازی‌های هفته
            const currentWeek = Math.floor(app.matches.length / (app.teams.length / 2)) + 1;
            const weekMatches = app.matches.filter((m, idx) => {
                const matchWeek = Math.floor(idx / (app.teams.length / 2)) + 1;
                return matchWeek === currentWeek;
            });
            
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">مسابقات</h2>
                    
                    ${weekMatches.length > 0 ? `
                        <div style="margin-bottom: 30px;">
                            <h3 style="color:#1eff00; margin-bottom:15px;">🏆 بازی‌های هفته ${currentWeek}</h3>
                            ${weekMatches.map(m => `
                                <div class="match-card">
                                    <div class="match-teams">
                                        <span class="team-name">${m.home}</span>
                                        <span class="match-score">${m.homeScore} - ${m.awayScore}</span>
                                        <span class="team-name">${m.away}</span>
                                    </div>
                                    ${m.scorers ? `<div style="color:#b0b0b0;margin-top:10px;">گلزنان: ${m.scorers}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <h3 style="color:#fff; margin-bottom:15px;">تمام مسابقات</h3>
                    ${app.matches.length === 0 ? '<p style="color:#b0b0b0;">مسابقه‌ای وجود ندارد</p>' : app.matches.map(m => `
                        <div class="match-card">
                            <div class="match-teams">
                                <span class="team-name">${m.home}</span>
                                <span class="match-score">${m.homeScore} - ${m.awayScore}</span>
                                <span class="team-name">${m.away}</span>
                            </div>
                            ${m.scorers ? `<div style="color:#b0b0b0;margin-top:10px;">گلزنان: ${m.scorers}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function renderBudgetView(c) {
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">بودجه تیم‌ها</h2>
                    ${app.budgets.length === 0 ? '<p style="color:#b0b0b0;">بودجه‌ای وجود ندارد</p>' : `
                        <table class="data-table">
                            <thead><tr><th>تیم</th><th>بودجه (یورو)</th></tr></thead>
                            <tbody>${app.budgets.map(b => `<tr><td>${b.team}</td><td>${b.budget.toLocaleString()}</td></tr>`).join('')}</tbody>
                        </table>
                    `}
                </div>
            `;
        }

        function renderTransfersView(c) {
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">نقل و انتقالات</h2>
                    ${app.transfers.length === 0 ? '<p style="color:#b0b0b0;">نقل و انتقالی وجود ندارد</p>' : app.transfers.map(tr => `
                        <div class="transfer-card">
                            ${tr.img ? `<img src="${tr.img}" class="transfer-image" alt="${tr.player}">` : ''}
                            <div class="transfer-details">
                                <div class="transfer-player">${tr.player}</div>
                                <div class="transfer-route">${tr.from} → ${tr.to}</div>
                                <div class="transfer-price">${tr.amount.toLocaleString()} یورو • ${tr.duration} سال</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function renderMyTeam(c) {
            const teamData = Object.values(app.userTeams).find(t => t.name === app.team);
            const teamPlayers = app.players.filter(p => p.team === app.team);
            const teamMatches = app.matches.filter(m => m.home === app.team || m.away === app.team).slice(-5);
            const teamBudget = app.budgets.find(b => b.team === app.team);
            // بازیکنان آزاد در تیم آزاد و جهانی
            const freePlayers = app.players.filter(p => p.team === 'آزاد و جهانی');
            // بازیکنان سایر تیم‌ها
            const otherPlayers = app.players.filter(p => p.team !== app.team && p.team !== 'آزاد و جهانی');
            const allTransferPlayers = [...freePlayers, ...otherPlayers];
            
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">تیم من: ${app.team}</h2>
                    <div class="stats-grid">
                        <div class="stat-box"><div class="stat-value">${teamPlayers.length}</div><div class="stat-label">بازیکنان</div></div>
                        <div class="stat-box"><div class="stat-value">${teamMatches.length}</div><div class="stat-label">مسابقات اخیر</div></div>
                        <div class="stat-box"><div class="stat-value">${teamBudget ? teamBudget.budget.toLocaleString() : '0'}</div><div class="stat-label">بودجه (یورو)</div></div>
                    </div>
                </div>
                
                <div class="card">
                    <h2 class="card-title">افزودن بازیکن جدید</h2>
                    <div class="form-row">
                        <div class="form-group"><label>نام بازیکن</label><input type="text" id="newPlayerName"></div>
                        <div class="form-group"><label>پست</label><select id="newPlayerPos"><option>GK</option><option>DF</option><option>MF</option><option>FW</option></select></div>
                        <div class="form-group"><label>Overall</label><input type="number" id="newPlayerOverall" min="1" max="99" value="75"></div>
                    </div>
                    <button class="btn" onclick="requestAddPlayer()">درخواست افزودن</button>
                </div>
                
                <div class="card" style="border-color:rgba(255,165,0,0.3);">
                    <h2 class="card-title" style="color:#ffa500;">🔄 درخواست نقل و انتقال (غیررسمی)</h2>
                    <p style="color:#b0b0b0;margin-bottom:15px;">درخواست شما به ادمین ارسال می‌شود و فقط پس از تأیید رسمی می‌شود.</p>
                    <div class="form-row">
                        <div class="form-group">
                            <label>بازیکن مورد نظر</label>
                            <select id="reqTransferPlayer">
                                <option value="">-- انتخاب بازیکن --</option>
                                ${allTransferPlayers.map(p => `<option value="${p.id}" data-name="${p.name}" data-team="${p.team}">${p.name} (${p.team})</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group"><label>مبلغ پیشنهادی (یورو)</label><input type="number" id="reqTransferAmount" min="0" value="0"></div>
                        <div class="form-group"><label>مدت قرارداد (سال)</label><input type="number" id="reqTransferDuration" min="1" max="10" value="3"></div>
                    </div>
                    <button class="btn" onclick="requestTransfer()">📤 ارسال درخواست به ادمین</button>
                    
                    ${(app.pendingTransfers || []).filter(t => t.requestedBy === app.team).length > 0 ? `
                        <div style="margin-top:20px;">
                            <strong style="color:#1eff00;">درخواست‌های من:</strong>
                            ${(app.pendingTransfers || []).filter(t => t.requestedBy === app.team).map(t => `
                                <div style="padding:10px;background:rgba(255,255,255,0.05);border-radius:10px;margin-top:10px;">
                                    <span>${t.playerName}</span> 
                                    <span style="color:#888;margin:0 10px;">→</span>
                                    <span style="color:#1eff00;">${app.team}</span>
                                    <span class="pending-badge" style="margin-right:10px;">${t.status === 'pending' ? 'در انتظار' : t.status === 'approved' ? '✅ تأیید' : '❌ رد'}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="card">
                    <h2 class="card-title">بازیکنان تیم</h2>
                    ${teamPlayers.length === 0 ? '<p style="color:#b0b0b0;">بازیکنی وجود ندارد</p>' : teamPlayers.map(p => `
                        <div class="player-card">
                            <div class="player-info">
                                <div class="player-name">${p.name}</div>
                                <div class="player-details">${p.position} • Overall: ${p.overall}</div>
                            </div>
                            <div class="player-overall">${p.overall}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="card">
                    <h2 class="card-title">تغییر تاکتیک</h2>
                    <div class="form-group"><label>چینش</label><select id="formation"><option>4-3-3</option><option>4-4-2</option><option>3-5-2</option><option>4-2-3-1</option></select></div>
                    <div class="form-group"><label>شیوه بازی</label><select id="tactics"><option>تهاجمی</option><option>متعادل</option><option>دفاعی</option></select></div>
                    <div class="form-group"><label>پیام تاکتیک</label><textarea id="tacticMsg" rows="4" placeholder="تغییرات تاکتیکی خود را شرح دهید"></textarea></div>
                    <button class="btn" onclick="submitTactics()">ارسال به ادمین</button>
                </div>
            `;
        }

        function requestAddPlayer() {
            const name = document.getElementById('newPlayerName').value.trim();
            const position = document.getElementById('newPlayerPos').value;
            const overall = parseInt(document.getElementById('newPlayerOverall').value);
            
            if (!name) {
                alert('لطفا نام بازیکن را وارد کنید');
                return;
            }
            
            app.pendingPlayers.push({
                id: Date.now(),
                name,
                team: app.team,
                position,
                overall
            });
            
            app.notifications.push({
                id: Date.now(),
                text: `درخواست افزودن بازیکن ${name} از تیم ${app.team}`,
                time: new Date().toLocaleString('fa-IR')
            });
            
            saveData();
            alert('درخواست شما برای ادمین ارسال شد');
            showTeamTab('myteam');
        }

        function requestTransfer() {
            const playerSelect = document.getElementById('reqTransferPlayer');
            const playerId = parseInt(playerSelect.value);
            const playerName = playerSelect.options[playerSelect.selectedIndex].getAttribute('data-name');
            const playerFromTeam = playerSelect.options[playerSelect.selectedIndex].getAttribute('data-team');
            const amount = parseInt(document.getElementById('reqTransferAmount').value) || 0;
            const duration = parseInt(document.getElementById('reqTransferDuration').value) || 1;
            
            if (!playerId || !playerName) {
                alert('لطفا بازیکن مورد نظر را انتخاب کنید');
                return;
            }
            
            if (!app.pendingTransfers) app.pendingTransfers = [];
            
            app.pendingTransfers.push({
                id: Date.now(),
                playerId,
                playerName,
                from: playerFromTeam,
                to: app.team,
                amount,
                duration,
                requestedBy: app.team,
                status: 'pending',
                time: new Date().toLocaleString('fa-IR')
            });
            
            app.notifications.push({
                id: Date.now(),
                text: `🔄 درخواست نقل و انتقال: تیم ${app.team} خواستار جذب ${playerName} (از ${playerFromTeam}) به مبلغ ${amount.toLocaleString()} یورو`,
                time: new Date().toLocaleString('fa-IR')
            });
            
            saveData();
            alert('درخواست نقل و انتقال به ادمین ارسال شد. منتظر تأیید باشید.');
            showTeamTab('myteam');
