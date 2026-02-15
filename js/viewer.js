        }

        function submitTactics() {
            const formation = document.getElementById('formation').value;
            const tactics = document.getElementById('tactics').value;
            const msg = document.getElementById('tacticMsg').value.trim();
            
            app.notifications.push({
                id: Date.now(),
                text: `تغییر تاکتیک ${app.team}: ${formation} - ${tactics}${msg ? ' - ' + msg : ''}`,
                time: new Date().toLocaleString('fa-IR')
            });
            
            saveData();
            alert('تغییرات به ادمین ارسال شد');
        }

        function renderAIAssistant(c) {
            const messages = app.chatHistory || [];
            
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">🤖 دستیار هوشمند لیگ</h2>
                    <p style="color:#b0b0b0;margin-bottom:20px;">سوالات خود درباره لیگ، تیم‌ها، بازیکنان و تاکتیک‌ها را بپرسید</p>
                    
                    <div class="chat-container">
                        <div class="chat-messages" id="chatMessages">
                            ${messages.map(m => `
                                <div class="chat-message ${m.role}">
                                    <strong>${m.role === 'user' ? 'شما' : 'دستیار هوشمند'}:</strong>
                                    <p style="margin-top:8px;">${m.text}</p>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="chat-input-area">
                            <input type="text" id="chatInput" class="chat-input" placeholder="سوال خود را بپرسید..." onkeypress="if(event.key==='Enter') sendMessage()">
                            <button class="btn" onclick="sendMessage()">ارسال</button>
                        </div>
                    </div>
                    
                    <div style="margin-top:20px;padding:20px;background:rgba(30,255,0,0.05);border-radius:15px;border:1px solid rgba(30,255,0,0.2);">
                        <strong style="color:#1eff00;">سوالات پیشنهادی:</strong>
                        <div style="margin-top:15px;display:grid;gap:10px;">
                            <button class="btn btn-secondary" onclick="askPredefined('وضعیت تیم من در جدول چگونه است؟')">وضعیت تیم من در جدول چگونه است؟</button>
                            <button class="btn btn-secondary" onclick="askPredefined('بهترین بازیکنان تیم من چه کسانی هستند؟')">بهترین بازیکنان تیم من چه کسانی هستند؟</button>
                            <button class="btn btn-secondary" onclick="askPredefined('چه تاکتیکی برای بازی بعدی پیشنهاد می‌کنی؟')">چه تاکتیکی برای بازی بعدی پیشنهاد می‌کنی؟</button>
                            <button class="btn btn-secondary" onclick="askPredefined('نقاط ضعف تیم من کجاست؟')">نقاط ضعف تیم من کجاست؟</button>
                            <button class="btn btn-secondary" onclick="askPredefined('آمار مسابقات اخیر من چطور بوده؟')">آمار مسابقات اخیر من چطور بوده؟</button>
                            <button class="btn btn-secondary" onclick="askPredefined('کدام پست نیاز به تقویت دارد؟')">کدام پست نیاز به تقویت دارد؟</button>
                            <button class="btn btn-secondary" onclick="askPredefined('برای صدرنشینی چه باید بکنم؟')">برای صدرنشینی چه باید بکنم؟</button>
                            <button class="btn btn-secondary" onclick="askPredefined('بودجه من چقدر است؟')">بودجه من چقدر است؟</button>
                            <button class="btn btn-secondary" onclick="askPredefined('مقایسه تیم من با حریفان')">مقایسه تیم من با حریفان</button>
                            <button class="btn btn-secondary" onclick="askPredefined('تحلیل بازیکن جدید برای خرید')">تحلیل بازیکن جدید برای خرید</button>
                            <button class="btn btn-secondary" onclick="askPredefined('استراتژی برد در بازی بعدی')">استراتژی برد در بازی بعدی</button>
                            <button class="btn btn-secondary" onclick="askPredefined('نقاط قوت تیم من')">نقاط قوت تیم من</button>
                            <button class="btn btn-secondary" onclick="askPredefined('پیش‌بینی نتیجه لیگ')">پیش‌بینی نتیجه لیگ</button>
                            <button class="btn btn-secondary" onclick="askPredefined('راهنمای مدیریت تیم')">راهنمای مدیریت تیم</button>
                            <button class="btn btn-secondary" onclick="askPredefined('تحلیل عملکرد فصل')">تحلیل عملکرد فصل</button>
                        </div>
                    </div>
                </div>
            `;
            
            scrollChatToBottom();
        }

        function sendMessage() {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            
            if (!message) return;
            
            if (!app.chatHistory) app.chatHistory = [];
            
            app.chatHistory.push({ role: 'user', text: message });
            input.value = '';
            
            const response = generateAIResponse(message);
            app.chatHistory.push({ role: 'ai', text: response });
            
            saveData();
            renderAIAssistant(document.getElementById('content'));
        }

        function askPredefined(question) {
            document.getElementById('chatInput').value = question;
            sendMessage();
        }

        function generateAIResponse(message) {
            const msg = message.toLowerCase();
            const myTeam = app.teams.find(t => t.name === app.team);
            const myPlayers = app.players.filter(p => p.team === app.team);
            const myMatches = app.matches.filter(m => m.home === app.team || m.away === app.team);
            const myBudget = app.budgets.find(b => b.team === app.team);
            
            const sorted = [...app.teams].sort((a, b) => b.p - a.p);
            const myRank = sorted.findIndex(t => t.name === app.team) + 1;
            
            if (msg.includes('جدول') || msg.includes('وضعیت') || msg.includes('رتبه')) {
                return `تیم ${app.team} در رتبه ${myRank} جدول قرار دارد با ${myTeam.p} امتیاز. شما ${myTeam.w} برد، ${myTeam.d} مساوی و ${myTeam.l} باخت داشته‌اید. تفاضل گل شما ${myTeam.gf - myTeam.ga} است.`;
            }
            
            if (msg.includes('بهترین بازیکن') || msg.includes('بازیکنان برتر')) {
                const topPlayers = myPlayers.sort((a, b) => b.overall - a.overall).slice(0, 3);
                return `بهترین بازیکنان شما: ${topPlayers.map(p => `${p.name} (${p.overall})`).join('، ')}. این بازیکنان ستون اصلی تیم شما هستند.`;
            }
            
            if (msg.includes('تاکتیک') || msg.includes('استراتژی')) {
                return `با توجه به ترکیب تیم شما، پیشنهاد می‌کنم از چینش 4-3-3 تهاجمی استفاده کنید. بازیکنان شما در خط حمله توانایی بالایی دارند. روی فشار بالا و بازی سریع تمرکز کنید.`;
            }
            
            if (msg.includes('نقطه ضعف') || msg.includes('ضعف')) {
                const positions = { GK: 0, DF: 0, MF: 0, FW: 0 };
                myPlayers.forEach(p => positions[p.position]++);
                const weak = Object.entries(positions).sort((a, b) => a[1] - b[1])[0];
                return `نقطه ضعف اصلی تیم شما کمبود در پست ${weak[0]} است. فقط ${weak[1]} بازیکن در این پست دارید. پیشنهاد می‌کنم در نقل و انتقالات آینده روی این پست تمرکز کنید.`;
            }
            
            if (msg.includes('مسابقات') || msg.includes('آمار')) {
                const recent = myMatches.slice(-3);
                const wins = recent.filter(m => 
                    (m.home === app.team && m.homeScore > m.awayScore) || 
                    (m.away === app.team && m.awayScore > m.homeScore)
                ).length;
                return `در ${recent.length} بازی اخیر، ${wins} برد کسب کرده‌اید. عملکرد شما ${wins > 1 ? 'خوب' : 'نیاز به بهبود دارد'}. در کل ${myMatches.length} مسابقه انجام داده‌اید.`;
            }
            
            if (msg.includes('پست') || msg.includes('تقویت')) {
                const avgByPos = {};
                ['GK', 'DF', 'MF', 'FW'].forEach(pos => {
                    const players = myPlayers.filter(p => p.position === pos);
                    avgByPos[pos] = players.length > 0 ? 
                        players.reduce((sum, p) => sum + p.overall, 0) / players.length : 0;
                });
                const weakPos = Object.entries(avgByPos).sort((a, b) => a[1] - b[1])[0];
                return `بر اساس تحلیل، پست ${weakPos[0]} با میانگین ${weakPos[1].toFixed(1)} نیاز به تقویت دارد. پیشنهاد می‌کنم بازیکنی با overall بالاتر از 80 در این پست جذب کنید.`;
            }
            
            if (msg.includes('صدرنشین') || msg.includes('قهرمان')) {
                const gap = sorted[0].p - myTeam.p;
                return gap === 0 ? 
                    'شما در صدر جدول هستید! برای حفظ این موقعیت، روی ثبات و عدم اشتباهات دفاعی تمرکز کنید.' :
                    `فاصله شما با صدر ${gap} امتیاز است. برای رسیدن به صدر باید در بازی‌های باقیمانده برد کسب کنید و امیدوار باشید صدرنشین امتیاز از دست بدهد.`;
            }
            
            if (msg.includes('بودجه') || msg.includes('پول')) {
                return `بودجه فعلی تیم شما ${myBudget.budget.toLocaleString()} یورو است. این بودجه را می‌توانید برای جذب بازیکنان جدید یا بهبود امکانات تیم استفاده کنید.`;
            }
            
            if (msg.includes('مقایسه') || msg.includes('حریف')) {
                const top3 = sorted.slice(0, 3);
                return `سه تیم برتر لیگ: ${top3.map((t, i) => `${i+1}. ${t.name} (${t.p} امتیاز)`).join('، ')}. ${
                    myRank <= 3 ? 'شما در بین تیم‌های برتر هستید!' : 
                    'برای رقابت با آن‌ها باید عملکرد خود را بهبود دهید.'
                }`;
            }
            
            if (msg.includes('خرید') || msg.includes('نقل و انتقال')) {
                return `برای خرید بازیکن، ابتدا نقاط ضعف تیم را شناسایی کنید. بازیکنانی با overall بالای 80 را هدف بگیرید. همچنین توجه داشته باشید که بودجه کافی داشته باشید.`;
            }
            
            if (msg.includes('برد') || msg.includes('پیروز')) {
                return `برای برد در بازی‌های آینده: 1) از بهترین ترکیب استفاده کنید 2) تاکتیک مناسب انتخاب کنید 3) روی نقاط قوت تمرکز کنید 4) از اشتباهات دفاعی بپرهیزید`;
            }
            
            if (msg.includes('نقطه قوت') || msg.includes('قوت')) {
                const bestPlayers = myPlayers.sort((a, b) => b.overall - a.overall).slice(0, 3);
                return `نقاط قوت تیم شما: بازیکنان کلیدی قوی (${bestPlayers.map(p => p.name).join('، ')})، تعداد بازیکنان کافی (${myPlayers.length} نفر)`;
            }
            
            if (msg.includes('پیش‌بینی') || msg.includes('آینده')) {
                return myRank <= 3 ? 
                    'با ادامه این روند، شانس خوبی برای قهرمانی یا کسب مدال دارید. حفظ ثبات کلید موفقیت است.' :
                    'برای بهبود رتبه، باید در بازی‌های باقیمانده نتایج بهتری کسب کنید. تمرکز روی جلوگیری از باخت مهم است.';
            }
            
            if (msg.includes('راهنما') || msg.includes('کمک')) {
                return `راهنمای مدیریت تیم: 1) بازیکنان با کیفیت جذب کنید 2) تاکتیک مناسب انتخاب کنید 3) بودجه را عاقلانه مدیریت کنید 4) عملکرد بازیکنان را زیر نظر بگیرید 5) با ادمین لیگ در ارتباط باشید`;
            }
            
            if (msg.includes('تحلیل') || msg.includes('عملکرد')) {
                const winRate = ((myTeam.w / (myTeam.w + myTeam.d + myTeam.l)) * 100).toFixed(1);
                return `تحلیل عملکرد: درصد برد ${winRate}%، تفاضل گل ${myTeam.gf - myTeam.ga}، رتبه ${myRank} از ${app.teams.length}. ${
                    winRate > 50 ? 'عملکرد خوبی دارید!' : 'نیاز به بهبود دارید.'
                }`;
            }
            
            return 'سوال جالبی است! می‌توانید سوالات مختلفی درباره تیم، بازیکنان، جدول، تاکتیک و بودجه بپرسید. از دکمه‌های پیشنهادی هم می‌توانید استفاده کنید.';
        }

        function scrollChatToBottom() {
            setTimeout(() => {
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }

        function renderStats(c) {
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">آمار کلی لیگ</h2>
                    <div class="stats-grid">
                        <div class="stat-box"><div class="stat-value">${app.teams.length}</div><div class="stat-label">تیم‌ها</div></div>
                        <div class="stat-box"><div class="stat-value">${app.players.length}</div><div class="stat-label">بازیکنان</div></div>
                        <div class="stat-box"><div class="stat-value">${app.matches.length}</div><div class="stat-label">مسابقات</div></div>
                        <div class="stat-box"><div class="stat-value">${app.transfers.length}</div><div class="stat-label">نقل و انتقالات</div></div>
                    </div>
                </div>
            `;
        }

        // Lineup Editor Functions
        const formations = {
            '4-4-2': [
                { pos: 'GK', x: 50, y: 95 },
                { pos: 'DF', x: 20, y: 75 },
                { pos: 'DF', x: 40, y: 75 },
                { pos: 'DF', x: 60, y: 75 },
                { pos: 'DF', x: 80, y: 75 },
                { pos: 'MF', x: 20, y: 50 },
                { pos: 'MF', x: 40, y: 50 },
                { pos: 'MF', x: 60, y: 50 },
                { pos: 'MF', x: 80, y: 50 },
                { pos: 'FW', x: 35, y: 20 },
                { pos: 'FW', x: 65, y: 20 }
            ],
            '4-3-3': [
                { pos: 'GK', x: 50, y: 95 },
                { pos: 'DF', x: 20, y: 75 },
                { pos: 'DF', x: 40, y: 75 },
                { pos: 'DF', x: 60, y: 75 },
                { pos: 'DF', x: 80, y: 75 },
                { pos: 'MF', x: 30, y: 50 },
                { pos: 'MF', x: 50, y: 50 },
                { pos: 'MF', x: 70, y: 50 },
                { pos: 'FW', x: 20, y: 20 },
                { pos: 'FW', x: 50, y: 20 },
                { pos: 'FW', x: 80, y: 20 }
            ],
            '3-5-2': [
                { pos: 'GK', x: 50, y: 95 },
                { pos: 'DF', x: 30, y: 75 },
                { pos: 'DF', x: 50, y: 75 },
                { pos: 'DF', x: 70, y: 75 },
                { pos: 'MF', x: 15, y: 50 },
                { pos: 'MF', x: 35, y: 50 },
                { pos: 'MF', x: 50, y: 50 },
                { pos: 'MF', x: 65, y: 50 },
                { pos: 'MF', x: 85, y: 50 },
                { pos: 'FW', x: 35, y: 20 },
                { pos: 'FW', x: 65, y: 20 }
            ],
            '5-4-1': [
                { pos: 'GK', x: 50, y: 95 },
                { pos: 'DF', x: 15, y: 75 },
                { pos: 'DF', x: 32, y: 75 },
                { pos: 'DF', x: 50, y: 75 },
                { pos: 'DF', x: 68, y: 75 },
                { pos: 'DF', x: 85, y: 75 },
                { pos: 'MF', x: 25, y: 45 },
                { pos: 'MF', x: 42, y: 50 },
                { pos: 'MF', x: 58, y: 50 },
                { pos: 'MF', x: 75, y: 45 },
                { pos: 'FW', x: 50, y: 20 }
            ],
            '3-4-3': [
                { pos: 'GK', x: 50, y: 95 },
                { pos: 'DF', x: 30, y: 75 },
                { pos: 'DF', x: 50, y: 75 },
                { pos: 'DF', x: 70, y: 75 },
                { pos: 'MF', x: 25, y: 50 },
                { pos: 'MF', x: 45, y: 50 },
                { pos: 'MF', x: 55, y: 50 },
                { pos: 'MF', x: 75, y: 50 },
                { pos: 'FW', x: 20, y: 20 },
                { pos: 'FW', x: 50, y: 15 },
                { pos: 'FW', x: 80, y: 20 }
            ],
            '4-5-1': [
                { pos: 'GK', x: 50, y: 95 },
                { pos: 'DF', x: 20, y: 75 },
                { pos: 'DF', x: 40, y: 75 },
                { pos: 'DF', x: 60, y: 75 },
                { pos: 'DF', x: 80, y: 75 },
                { pos: 'MF', x: 15, y: 45 },
                { pos: 'MF', x: 35, y: 50 },
                { pos: 'MF', x: 50, y: 48 },
                { pos: 'MF', x: 65, y: 50 },
                { pos: 'MF', x: 85, y: 45 },
                { pos: 'FW', x: 50, y: 20 }
            ]
        };

        let currentFormation = '4-4-2';
        let currentLineup = {};
        let selectedSlot = null;

        function renderLineupEditor(c) {
            if (!app.lineups[app.team]) {
                app.lineups[app.team] = { formation: '4-4-2', players: {} };
            }

            currentFormation = app.lineups[app.team].formation || '4-4-2';
            currentLineup = app.lineups[app.team].players || {};

            const teamPlayers = app.players.filter(p => p.team === app.team);

            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">⚽ ترکیب بازیکنان</h2>
                    
                    <div class="formation-selector">
                        <strong style="color:#1eff00;">انتخاب چینش:</strong>
                        ${Object.keys(formations).map(f => `
                            <div class="formation-btn ${f === currentFormation ? 'active' : ''}" onclick="changeFormation('${f}')">${f}</div>
                        `).join('')}
                    </div>

                    <div class="pitch-container" id="pitch">
                        <div class="pitch-lines">
                            <div class="halfway-line"></div>
                            <div class="center-circle"></div>
                            <div class="center-spot"></div>
                            <div class="penalty-box top"></div>
                            <div class="penalty-box bottom"></div>
                        </div>
                        ${renderPitchSlots()}
                    </div>

                    <div style="text-align:center; margin: 20px 0;">
                        <button class="btn" onclick="saveLineup()">💾 ذخیره ترکیب</button>
                        <button class="btn btn-secondary" onclick="clearLineup()">🗑️ پاک کردن همه</button>
                        <button class="btn btn-secondary" onclick="autoFillLineup()">🤖 پر کردن خودکار</button>
                    </div>

                    <div class="player-list-selector">
                        <h3 style="color:#1eff00; margin-bottom:15px;">بازیکنان موجود (${teamPlayers.length})</h3>
                        ${teamPlayers.length === 0 ? '<p style="color:#b0b0b0;">بازیکنی وجود ندارد</p>' : teamPlayers.map(p => {
                            const inLineup = Object.values(currentLineup).includes(p.id);
                            return `
                                <div class="player-item ${inLineup ? 'selected' : ''}" data-player-id="${p.id}">
                                    <div>
                                        <strong>${p.name}</strong>
                                        <span style="color:#b0b0b0; margin-left:10px;">${p.position} • ${p.overall}</span>
                                    </div>
                                    <div style="color:#1eff00; font-weight:700;">${p.overall}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="modal" id="playerModal">
                    <div class="modal-content">
                        <div class="modal-header">انتخاب بازیکن</div>
                        <div id="modalPlayerList"></div>
                        <button class="modal-close" onclick="closeModal()">بستن</button>
                    </div>
                </div>
            `;
        }

        function renderPitchSlots() {
            const slots = formations[currentFormation];
            return slots.map((slot, idx) => {
                const playerId = currentLineup[idx];
                const player = playerId ? app.players.find(p => p.id === playerId) : null;
                
                return `
                    <div class="player-slot ${player ? 'filled' : 'empty'}" 
                         style="left:${slot.x}%; top:${slot.y}%;"
                         onclick="openPlayerSelector(${idx}, '${slot.pos}')">
                        ${player ? `
                            <div class="player-number">${player.overall}</div>
                            <div class="player-short-name">${player.name.split(' ').pop()}</div>
                        ` : `
                            <div style="color:rgba(255,255,255,0.5); font-size:0.8em;">${slot.pos}</div>
                            <div style="color:rgba(255,255,255,0.3); font-size:0.7em;">+</div>
                        `}
                    </div>
                `;
            }).join('');
        }

        function changeFormation(formation) {
            currentFormation = formation;
            currentLineup = {};
            renderLineupEditor(document.getElementById('content'));
        }
        window.changeFormation = changeFormation;

        function openPlayerSelector(slotIdx, position) {
            selectedSlot = slotIdx;
            const modal = document.getElementById('playerModal');
            const teamPlayers = app.players.filter(p => p.team === app.team && p.position === position);
            
            const modalList = document.getElementById('modalPlayerList');
            modalList.innerHTML = teamPlayers.length === 0 ? 
                `<p style="color:#b0b0b0;">بازیکنی در پست ${position} وجود ندارد</p>` :
                teamPlayers.map(p => {
                    const inLineup = Object.values(currentLineup).includes(p.id);
                    return `
                        <div class="player-item ${inLineup ? 'selected' : ''}" onclick="selectPlayer(${p.id})">
                            <div>
                                <strong>${p.name}</strong>
                                <span style="color:#b0b0b0; margin-left:10px;">${p.position}</span>
                            </div>
                            <div style="color:#1eff00; font-weight:700;">${p.overall}</div>
                        </div>
                    `;
                }).join('');
            
            modal.classList.add('show');
        }
        window.openPlayerSelector = openPlayerSelector;

        function selectPlayer(playerId) {
            if (selectedSlot !== null) {
                // Remove player from other slots if exists
                Object.keys(currentLineup).forEach(key => {
                    if (currentLineup[key] === playerId) {
                        delete currentLineup[key];
                    }
                });
                
                currentLineup[selectedSlot] = playerId;
                closeModal();
                renderLineupEditor(document.getElementById('content'));
            }
        }
        window.selectPlayer = selectPlayer;

        function closeModal() {
            document.getElementById('playerModal').classList.remove('show');
            selectedSlot = null;
        }
        window.closeModal = closeModal;

        function saveLineup() {
            app.lineups[app.team] = {
                formation: currentFormation,
                players: { ...currentLineup }
            };
            
            app.notifications.push({
                id: Date.now(),
                text: `تیم ${app.team} ترکیب خود را با چینش ${currentFormation} ذخیره کرد`,
                time: new Date().toLocaleString('fa-IR')
            });
            
            saveData();
            alert('✅ ترکیب با موفقیت ذخیره شد!');
        }
        window.saveLineup = saveLineup;

        function clearLineup() {
            if (!confirm('آیا از پاک کردن تمام ترکیب مطمئن هستید؟')) return;
            
            currentLineup = {};
            renderLineupEditor(document.getElementById('content'));
        }
        window.clearLineup = clearLineup;

        function autoFillLineup() {
            const teamPlayers = app.players.filter(p => p.team === app.team);
            const slots = formations[currentFormation];
            
            currentLineup = {};
            
            slots.forEach((slot, idx) => {
                const availablePlayers = teamPlayers.filter(p => {
                    return p.position === slot.pos && !Object.values(currentLineup).includes(p.id);
                });
                
                if (availablePlayers.length > 0) {
                    // Sort by overall and pick the best
                    availablePlayers.sort((a, b) => b.overall - a.overall);
                    currentLineup[idx] = availablePlayers[0].id;
                }
            });
            
            renderLineupEditor(document.getElementById('content'));
            alert('ترکیب به صورت خودکار پر شد!');
        }
        window.autoFillLineup = autoFillLineup;
    </script>
