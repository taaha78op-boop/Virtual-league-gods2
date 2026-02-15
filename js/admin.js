            const overall = parseInt(document.getElementById('playerOverall').value);
            
            if (!name || !team) {
                alert('لطفا نام و تیم را وارد کنید');
                return;
            }
            
            app.players.push({ id: Date.now(), name, team, position, overall });
            saveData();
            showTab('players');
        }

        function addMultiplePlayers() {
            const team = document.getElementById('multiPlayerTeam').value;
            const list = document.getElementById('multiPlayerList').value.trim();
            
            if (!team) {
                alert('لطفا تیم را انتخاب کنید');
                return;
            }
            
            if (!list) {
                alert('لطفا لیست بازیکنان را وارد کنید');
                return;
            }
            
            const lines = list.split('\n').filter(line => line.trim());
            let successCount = 0;
            let errorLines = [];
            
            lines.forEach((line, index) => {
                const parts = line.split('،').map(p => p.trim());
                
                if (parts.length !== 3) {
                    errorLines.push(`خط ${index + 1}: فرمت نادرست - باید سه بخش باشد (نام،اورال،پست)`);
                    return;
                }
                
                const [name, overallStr, position] = parts;
                const overall = parseInt(overallStr);
                
                if (!name) {
                    errorLines.push(`خط ${index + 1}: نام بازیکن خالی است`);
                    return;
                }
                
                if (isNaN(overall) || overall < 1 || overall > 99) {
                    errorLines.push(`خط ${index + 1}: اورال باید عدد بین 1 تا 99 باشد`);
                    return;
                }
                
                const validPositions = ['GK', 'DF', 'MF', 'FW'];
                if (!validPositions.includes(position)) {
                    errorLines.push(`خط ${index + 1}: پست باید یکی از GK، DF، MF، FW باشد`);
                    return;
                }
                
                app.players.push({
                    id: Date.now() + index,
                    name,
                    team,
                    position,
                    overall
                });
                
                successCount++;
            });
            
            if (successCount > 0) {
                saveData();
            }
            
            if (errorLines.length > 0) {
                alert(`${successCount} بازیکن با موفقیت اضافه شد.\n\nخطاها:\n${errorLines.join('\n')}`);
            } else {
                alert(`✅ ${successCount} بازیکن با موفقیت اضافه شد`);
            }
            
            if (successCount > 0) {
                showTab('players');
            }
        }

        function editPlayer(id) {
            const player = app.players.find(p => p.id === id);
            if (!player) return;
            
            const newName = prompt('نام جدید:', player.name);
            const newOverall = prompt('Overall جدید:', player.overall);
            
            if (newName) player.name = newName;
            if (newOverall) player.overall = parseInt(newOverall);
            
            saveData();
            showTab('players');
        }

        function deletePlayer(id) {
            if (!confirm('آیا از حذف این بازیکن مطمئن هستید؟')) return;
            
            app.players = app.players.filter(p => p.id !== id);
            saveData();
            showTab('players');
        }

        function renderMatchesManager(c) {
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">افزودن مسابقه</h2>
                    <div class="form-row">
                        <div class="form-group"><label>تیم میزبان</label><select id="homeTeam">${app.teams.map(t => `<option>${t.name}</option>`).join('')}</select></div>
                        <div class="form-group"><label>تیم مهمان</label><select id="awayTeam">${app.teams.map(t => `<option>${t.name}</option>`).join('')}</select></div>
                        <div class="form-group"><label>گل میزبان</label><input type="number" id="homeScore" min="0" value="0"></div>
                        <div class="form-group"><label>گل مهمان</label><input type="number" id="awayScore" min="0" value="0"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>گلزنان میزبان</label><input type="text" id="homeScorers" placeholder="نام گلزنان را با ویرگول جدا کنید"></div>
                        <div class="form-group"><label>گلزنان مهمان</label><input type="text" id="awayScorers" placeholder="نام گلزنان را با ویرگول جدا کنید"></div>
                        <div class="form-group"><label>ضریب شرط (برای تعیین تعداد گل — توسط ادمین)</label><input type="number" id="goalOddsMultiplier" min="1" value="2"></div>
                    </div>
                    <button class="btn" onclick="addMatch()">افزودن مسابقه</button>
                </div>
                
                <div class="card">
                    <h2 class="card-title">مسابقات ثبت شده</h2>
                    ${app.matches.length === 0 ? '<p style="color:#b0b0b0;">مسابقه‌ای وجود ندارد</p>' : app.matches.map((m, idx) => `
                        <div class="match-card">
                            <div class="match-teams">
                                <span class="team-name">${m.home}</span>
                                <span class="match-score">${m.homeScore} - ${m.awayScore}</span>
                                <span class="team-name">${m.away}</span>
                            </div>
                            ${m.scorers ? `<div style="color:#b0b0b0;margin-top:10px;">گلزنان: ${m.scorers}</div>` : ''}
                            <div class="action-btns">
                                <button class="btn btn-secondary" onclick="editMatch(${idx})">ویرایش گلزنان</button>
                                <button class="btn btn-danger" onclick="deleteMatch(${idx})">حذف</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function addMatch() {
            const home = document.getElementById('homeTeam').value;
            const away = document.getElementById('awayTeam').value;
            const homeScore = parseInt(document.getElementById('homeScore').value);
            const awayScore = parseInt(document.getElementById('awayScore').value);
            const homeScorers = document.getElementById('homeScorers').value.trim();
            const awayScorers = document.getElementById('awayScorers').value.trim();
            
            if (home === away) {
                alert('تیم‌ها نباید یکسان باشند');
                return;
            }
            
            let scorers = '';
            if (homeScorers) scorers += `${home}: ${homeScorers}`;
            if (awayScorers) scorers += (scorers ? ' | ' : '') + `${away}: ${awayScorers}`;
            
            const goalOddsMultiplier = parseFloat(document.getElementById('goalOddsMultiplier') ? document.getElementById('goalOddsMultiplier').value : 2) || 2;
            app.matches.push({ home, away, homeScore, awayScore, scorers, goalOddsMultiplier });
            
            const homeTeam = app.teams.find(t => t.name === home);
            const awayTeam = app.teams.find(t => t.name === away);
            
            if (homeTeam && awayTeam) {
                homeTeam.gf += homeScore;
                homeTeam.ga += awayScore;
                awayTeam.gf += awayScore;
                awayTeam.ga += homeScore;
                
                if (homeScore > awayScore) {
                    homeTeam.w++;
                    homeTeam.p += 3;
                    awayTeam.l++;
                } else if (homeScore < awayScore) {
                    awayTeam.w++;
                    awayTeam.p += 3;
                    homeTeam.l++;
                } else {
                    homeTeam.d++;
                    awayTeam.d++;
                    homeTeam.p++;
                    awayTeam.p++;
                }
            }
            
            saveData();
            // Resolve bets related to this newly added match (last index)
            processBetsForMatch(app.matches.length - 1);
            showTab('matches');
        }

        function editMatch(idx) {
            const match = app.matches[idx];
            if (!match) return;
            
            const homeScorers = prompt(`گلزنان ${match.home}:`, '');
            const awayScorers = prompt(`گلزنان ${match.away}:`, '');
            
            let scorers = '';
            if (homeScorers) scorers += `${match.home}: ${homeScorers}`;
            if (awayScorers) scorers += (scorers ? ' | ' : '') + `${match.away}: ${awayScorers}`;
            
            match.scorers = scorers;
            
            saveData();
            // Resolve bets related to this newly added match (last index)
            processBetsForMatch(app.matches.length - 1);
            showTab('matches');
        }

        function deleteMatch(idx) {
            if (!confirm('آیا از حذف این مسابقه مطمئن هستید؟')) return;
            
            app.matches.splice(idx, 1);
            saveData();
            // Resolve bets related to this newly added match (last index)
            processBetsForMatch(app.matches.length - 1);
            showTab('matches');
        }

        function renderBudgetManager(c) {
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">مدیریت بودجه تیم‌ها</h2>
                    ${app.budgets.length === 0 ? '<p style="color:#b0b0b0;">بودجه‌ای وجود ندارد</p>' : `
                        <table class="data-table">
                            <thead><tr><th>تیم</th><th>بودجه فعلی (یورو)</th><th>عملیات</th></tr></thead>
                            <tbody>${app.budgets.map((b, idx) => `
                                <tr>
                                    <td>${b.team}</td>
                                    <td>${b.budget.toLocaleString()}</td>
                                    <td><button class="btn btn-secondary" onclick="editBudget(${idx})">ویرایش</button></td>
                                </tr>
                            `).join('')}</tbody>
                        </table>
                    `}
                </div>
            `;
        }

        function editBudget(idx) {
            const budget = app.budgets[idx];
            if (!budget) return;
            
            const newBudget = prompt(`بودجه جدید ${budget.team} (یورو):`, budget.budget);
            if (newBudget) {
                budget.budget = parseInt(newBudget.replace(/,/g, ''));
                saveData();
                showTab('budget');
            }
        }

        function renderTransfersManager(c) {
            // همه تیم‌ها شامل آزاد و جهانی
            const allTeams = [...app.teams.map(t => t.name), 'آزاد و جهانی'];
            const uniqueTeams = [...new Set(allTeams)];
            
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">افزودن نقل و انتقال (ادمین)</h2>
                    <div class="form-row">
                        <div class="form-group">
                            <label>بازیکن</label>
                            <select id="transferPlayer">
                                <option value="">-- انتخاب بازیکن --</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>از تیم</label>
                            <select id="transferFrom">
                                <option value="">-- تیم مبدأ --</option>
                                ${uniqueTeams.map(t => `<option value="${t}">${t}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>به تیم</label>
                            <select id="transferTo">
                                <option value="">-- تیم مقصد --</option>
                                ${uniqueTeams.map(t => `<option value="${t}">${t}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>مبلغ (یورو)</label><input type="number" id="transferAmount" min="0"></div>
                        <div class="form-group"><label>مدت قرارداد (سال)</label><input type="number" id="transferDuration" min="1" max="10" value="3"></div>
                        <div class="form-group"><label>تصویر (URL)</label><input type="url" id="transferImg"></div>
                    </div>
                    <button class="btn" onclick="addTransfer()">افزودن و انتقال بازیکن</button>
                </div>
                
                <div class="card">
                    <h2 class="card-title">نقل و انتقالات ثبت شده</h2>
                    ${app.transfers.length === 0 ? '<p style="color:#b0b0b0;">نقل و انتقالی وجود ندارد</p>' : app.transfers.map((tr, idx) => `
                        <div class="transfer-card">
                            ${tr.img ? `<img src="${tr.img}" class="transfer-image" alt="${tr.player}">` : ''}
                            <div class="transfer-details">
                                <div class="transfer-player">${tr.player}</div>
                                <div class="transfer-route">${tr.from} → ${tr.to}</div>
                                <div class="transfer-price">${(tr.amount||0).toLocaleString()} یورو • ${tr.duration} سال</div>
                            </div>
                            <div class="action-btns">
                                <button class="btn btn-secondary" onclick="editTransfer(${idx})">ویرایش</button>
                                <button class="btn btn-danger" onclick="deleteTransfer(${idx})">حذف</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // وقتی تیم مبدأ انتخاب می‌شه فقط بازیکنان همان تیم نشان داده شوند
            function populateTransferPlayersByFrom() {
                const from = document.getElementById('transferFrom').value;
                const playerSelect = document.getElementById('transferPlayer');
                // reset
                playerSelect.innerHTML = '<option value="">-- انتخاب بازیکن --</option>';
                if (!from) return;
                // add players that belong to the selected 'from' team
                app.players.filter(p => p.team === from).forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.name;
                    opt.setAttribute('data-id', p.id);
                    opt.setAttribute('data-team', p.team);
                    opt.textContent = `${p.name} (${p.team})`;
                    playerSelect.appendChild(opt);
                });
            }
            document.getElementById('transferFrom').addEventListener('change', populateTransferPlayersByFrom);
            // populate initially based on current value (if any)
            populateTransferPlayersByFrom();
        }

        function addTransfer() {
            const playerSelect = document.getElementById('transferPlayer');
            const playerName = playerSelect.value;
            const playerId = playerSelect.options[playerSelect.selectedIndex].getAttribute('data-id');
            const from = document.getElementById('transferFrom').value;
            const to = document.getElementById('transferTo').value;
            const amount = parseInt(document.getElementById('transferAmount').value) || 0;
            const duration = parseInt(document.getElementById('transferDuration').value) || 1;
            const img = document.getElementById('transferImg').value.trim();
            
            if (!playerName || !from || !to) {
                alert('لطفا بازیکن، تیم مبدأ و تیم مقصد را انتخاب کنید');
                return;
            }
            
            if (from === to) {
                alert('تیم مبدأ و مقصد نباید یکسان باشند');
                return;
            }
            
            // کم کردن بودجه از تیم مقصد
            if (to !== 'آزاد و جهانی' && amount > 0) {
                const destBudget = app.budgets.find(b => b.team === to);
                if (destBudget) {
                    if (destBudget.budget < amount) {
                        if (!confirm(`بودجه تیم ${to} کافی نیست (${destBudget.budget.toLocaleString()} یورو). آیا ادامه می‌دهید؟`)) return;
                    }
                    destBudget.budget -= amount;
                }
                // اضافه کردن به بودجه تیم مبدأ (اگر آزاد نیست)
                if (from !== 'آزاد و جهانی') {
                    const srcBudget = app.budgets.find(b => b.team === from);
                    if (srcBudget) srcBudget.budget += amount;
                }
            }
            
            // انتقال بازیکن به تیم مقصد
            if (playerId) {
                const player = app.players.find(p => p.id === parseInt(playerId));
                if (player) {
                    player.team = to;
                    console.log(`✓ بازیکن ${playerName} از ${from} به ${to} منتقل شد`);
                } else {
                    console.error(`! بازیکن با ID ${playerId} یافت نشد`);
                    alert(`⚠️ خطا: بازیکن با ID ${playerId} در سیستم یافت نشد. نقل و انتقال ثبت می‌شود اما بازیکن منتقل نمی‌شود.`);
                }
            } else {
                // اگر playerId نداریم، با نام بازیکن جستجو می‌کنیم
                const player = app.players.find(p => p.name === playerName && p.team === from);
                if (player) {
                    player.team = to;
                    console.log(`✓ بازیکن ${playerName} از ${from} به ${to} منتقل شد (با نام)`);
                } else {
                    console.error(`! بازیکن ${playerName} در تیم ${from} یافت نشد`);
                    alert(`⚠️ خطا: بازیکن ${playerName} در تیم ${from} یافت نشد. لطفا مطمئن شوید بازیکن وجود دارد.`);
                    return;
                }
            }
            
            app.transfers.push({ player: playerName, playerId: parseInt(playerId), from, to, amount, duration, img });
            
            app.notifications.push({
                id: Date.now(),
                text: `✅ انتقال رسمی: ${playerName} از ${from} به ${to} به مبلغ ${amount.toLocaleString()} یورو`,
                time: new Date().toLocaleString('fa-IR')
            });
            
            saveData();
            showTab('transfers');
        }

        function deleteTransfer(idx) {
            if (!confirm('آیا از حذف این نقل و انتقال مطمئن هستید؟')) return;
            
            app.transfers.splice(idx, 1);
            saveData();
            showTab('transfers');
        }

        function editTransfer(idx) {
            const tr = app.transfers[idx];
            if (!tr) return;
            
            const newAmount = prompt('مبلغ جدید (یورو):', tr.amount || 0);
            const newDuration = prompt('مدت قرارداد جدید (سال):', tr.duration || 3);
            const newImg = prompt('آدرس تصویر جدید (URL):', tr.img || '');
            
            if (newAmount !== null && newAmount.trim() !== '') {
                tr.amount = parseInt(newAmount) || 0;
            }
            if (newDuration !== null && newDuration.trim() !== '') {
                tr.duration = parseInt(newDuration) || 1;
            }
            if (newImg !== null) {
                tr.img = newImg.trim();
            }
            
            saveData();
            showTab('transfers');
        }

        // ------- شرط‌بندی (اضافه‌شده طبق درخواست) -------
        function computeTeamStrength(teamName) {
            const players = app.players.filter(p => p.team === teamName);
            if (!players || players.length === 0) {
                const t = app.teams.find(x => x.name === teamName);
                return (t && t.overall) ? t.overall : 75;
            }
            const avg = players.reduce((s,p) => s + (p.overall||75), 0) / players.length;
            return avg;
        }

        function computeOdds(home, away, matchObj) {
            const hStr = computeTeamStrength(home) || 75;
            const aStr = computeTeamStrength(away) || 75;
            const homeOdd = Math.max(1.2, parseFloat(((aStr / hStr) * 1.5).toFixed(2)));
            const awayOdd = Math.max(1.2, parseFloat(((hStr / aStr) * 1.5).toFixed(2)));
            const drawOdd = 2.5;
            return { home: homeOdd, away: awayOdd, draw: drawOdd };
        }

        function renderBettingView(c) {
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">شرط‌بندی روی مسابقات</h2>
                    <p style="color:#b0b0b0;">شما می‌توانید روی برنده مسابقه یا تعداد گل (اگر ادمین ضریب تعیین کرده) شرط ببندید. مبلغ شرط هنگام ثبت از بودجه کسر می‌شود.</p>
                    <div id="betsArea"></div>
                </div>
            `;
            const betsArea = document.getElementById('betsArea');
            const matches = app.matches || [];
            if (matches.length === 0) {
                betsArea.innerHTML = '<p style="color:#b0b0b0;">مسابقه‌ای ثبت نشده</p>';
                return;
            }
            betsArea.innerHTML = matches.map((m, idx) => {
                const odds = computeOdds(m.home, m.away, m);
                const gmult = m.goalOddsMultiplier ? `• ضریب گل: ${m.goalOddsMultiplier}` : '';
                return `
                    <div style="padding:12px;margin-bottom:10px;background:rgba(255,255,255,0.03);border-radius:10px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div style="font-weight:700;">مسابقه ${idx+1}: ${m.home} VS ${m.away}</div>
                            <div style="font-weight:700;color:#1eff00;">${m.homeScore ?? 0} - ${m.awayScore ?? 0}</div>
                        </div>
                        <div style="margin-top:8px;color:#b0b0b0;">
                            ضرایب: برد میزبان: ${odds.home} — مساوی: ${odds.draw} — برد مهمان: ${odds.away} ${gmult}
                        </div>
                        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            <input type="number" id="betAmount_${idx}" placeholder="مبلغ شرط (یورو)" style="padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);width:160px;">
                            <select id="betType_${idx}" style="padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);">
                                <option value="home">برد ${m.home}</option>
                                <option value="draw">مساوی</option>
                                <option value="away">برد ${m.away}</option>
                            </select>
                            ${m.goalOddsMultiplier ? `<input type="number" id="betExactGoals_${idx}" placeholder="تعداد گل دقیق (مجموع)" style="padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);width:200px;">` : ''}
                            <button class="btn" onclick="placeBet(${idx})">ثبت شرط</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function placeBet(matchIdx) {
            const amountEl = document.getElementById('betAmount_' + matchIdx);
            const typeEl = document.getElementById('betType_' + matchIdx);
            const exactGoalsEl = document.getElementById('betExactGoals_' + matchIdx);
            const stake = parseInt(amountEl ? amountEl.value : 0) || 0;
            const betType = typeEl ? typeEl.value : 'home';
            const match = app.matches[matchIdx];
            if (!match) { alert('مسابقه نامعتبر است'); return; }
            if (stake <= 0) { alert('مبلغ شرط باید بیشتر از 0 باشد'); return; }
            const bettor = app.team;
            const budgetObj = app.budgets.find(b => b.team === bettor);
            if (!budgetObj || budgetObj.budget < stake) { alert('بودجه کافی نیست'); return; }
            const odds = computeOdds(match.home, match.away, match);
            let chosenOdd = odds[betType];
            if (exactGoalsEl && exactGoalsEl.value.trim() !== '') {
                const g = parseInt(exactGoalsEl.value);
                if (isNaN(g)) { alert('تعداد گل نامعتبر است'); return; }
                const mult = match.goalOddsMultiplier || 2;
                chosenOdd = chosenOdd * mult;
            }
            budgetObj.budget -= stake;
            const bet = {
                id: Date.now(),
                bettor,
                matchIdx,
                betType,
                stake,
                odds: parseFloat(chosenOdd.toFixed(2)),
                exactGoals: exactGoalsEl && exactGoalsEl.value.trim() !== '' ? parseInt(exactGoalsEl.value) : null,
                placedAt: new Date().toLocaleString('fa-IR'),
                resolved: false,
                won: false,
                payout: 0
            };
            app.bets = app.bets || [];
            app.bets.push(bet);
            app.notifications.push({ id: Date.now(), text: `شرط ثبت شد: تیم ${bettor} روی مسابقه ${match.home} vs ${match.away} مبلغ ${stake} یورو`, time: new Date().toLocaleString('fa-IR') });
            saveData();
            alert('✅ شرط شما ثبت شد. در صورت برنده شدن، مبلغ به بودجه اضافه می‌شود.');
            renderBettingView(document.getElementById('content'));
        }

        function processBetsForMatch(matchIdx) {
            app.bets = app.bets || [];
            const match = app.matches[matchIdx];
            if (!match) return;
            app.bets.forEach(bet => {
                if (bet.matchIdx !== matchIdx || bet.resolved) return;
                let won = false;
                if (bet.betType === 'home' && match.homeScore > match.awayScore) won = true;
                if (bet.betType === 'away' && match.awayScore > match.homeScore) won = true;
                if (bet.betType === 'draw' && match.homeScore === match.awayScore) won = true;
                if (bet.exactGoals !== null && match.goalOddsMultiplier) {
                    const totalGoals = (match.homeScore || 0) + (match.awayScore || 0);
                    if (totalGoals === bet.exactGoals) {
                        won = true;
                    } else {
                        won = false;
                    }
                }
                bet.resolved = true;
                bet.won = won;
                if (won) {
                    const payout = Math.round(bet.stake * bet.odds);
                    bet.payout = payout;
                    const bud = app.budgets.find(b => b.team === bet.bettor);
                    if (bud) bud.budget += payout;
                    app.notifications.push({ id: Date.now(), text: `🏆 شرط برنده شد: تیم ${bet.bettor} مبلغ ${payout.toLocaleString()} یورو دریافت کرد.`, time: new Date().toLocaleString('fa-IR') });
                } else {
                    app.notifications.push({ id: Date.now(), text: `❌ شرط باخته: تیم ${bet.bettor} روی مسابقه ${match.home} vs ${match.away}`, time: new Date().toLocaleString('fa-IR') });
                }
            });
            saveData();
        }

        function renderNotifications(c) {
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">اعلان‌های دریافتی</h2>
                    ${app.notifications.length === 0 ? '<p style="color:#b0b0b0;">اعلانی وجود ندارد</p>' : app.notifications.map((n, idx) => {
                        // Check if this is a player addition request
                        const isPlayerRequest = n.text.includes('درخواست افزودن بازیکن');
                        const pendingPlayer = isPlayerRequest ? app.pendingPlayers.find(p => n.text.includes(p.name)) : null;
                        
                        // Check if this is a transfer request
                        const isTransferRequest = n.text.includes('درخواست نقل و انتقال');
                        const pendingTransfer = isTransferRequest ? (app.pendingTransfers || []).find(t => t.status === 'pending' && n.text.includes(t.playerName)) : null;
                        
                        return `
                            <div class="notification-item">
                                <div>${n.text}</div>
                                <div class="notification-time">${n.time}</div>
                                ${pendingPlayer ? `
                                    <div class="action-btns">
                                        <button class="btn" onclick="approvePlayerFromNotif(${pendingPlayer.id}, ${idx})">✅ تایید</button>
                                        <button class="btn btn-danger" onclick="rejectPlayerFromNotif(${pendingPlayer.id}, ${idx})">❌ رد</button>
                                    </div>
                                ` : pendingTransfer ? `
                                    <div class="action-btns">
                                        <button class="btn" onclick="approvePendingTransfer(${pendingTransfer.id})">✅ تأیید انتقال</button>
                                        <button class="btn btn-danger" onclick="rejectPendingTransfer(${pendingTransfer.id})">❌ رد انتقال</button>
                                    </div>
                                ` : `
                                    <button class="btn btn-danger" style="margin-top:10px;" onclick="deleteNotification(${idx})">حذف</button>
                                `}
                            </div>
                        `;
                    }).join('')}
                    ${app.notifications.length > 0 ? '<button class="btn btn-danger" onclick="clearAllNotifications()">پاک کردن همه</button>' : ''}
                </div>
            `;
        }

        function approvePlayerFromNotif(playerId, notifIdx) {
            const player = app.pendingPlayers.find(p => p.id === playerId);
            if (!player) return;
            
            app.players.push(player);
            app.pendingPlayers = app.pendingPlayers.filter(p => p.id !== playerId);
            
            // Update notification text
            app.notifications[notifIdx].text = `✅ بازیکن ${player.name} برای تیم ${player.team} تایید شد`;
            
            saveData();
            showTab('notifications');
            alert('بازیکن تایید شد!');
        }

        function rejectPlayerFromNotif(playerId, notifIdx) {
            const player = app.pendingPlayers.find(p => p.id === playerId);
            if (!player) return;
            
            app.pendingPlayers = app.pendingPlayers.filter(p => p.id !== playerId);
            
            // Update notification text
            app.notifications[notifIdx].text = `❌ درخواست بازیکن ${player.name} برای تیم ${player.team} رد شد`;
            
            saveData();
            showTab('notifications');
            alert('درخواست رد شد!');
        }

        function deleteNotification(idx) {
            app.notifications.splice(idx, 1);
            saveData();
            showTab('notifications');
        }

        function clearAllNotifications() {
            if (!confirm('آیا از پاک کردن تمام اعلان‌ها مطمئن هستید؟')) return;
            
            app.notifications = [];
            saveData();
            showTab('notifications');
        }

        function renderScheduleManager(c) {
            const leagueType = app.leagueType || 'league';
            const leagueTeams = app.teams.filter(t => t.name !== 'آزاد و جهانی');
            
            c.innerHTML = `
                <div class="card">
                    <h2 class="card-title">📅 مدیریت برنامه هفته‌ها</h2>
                    
                    <div class="settings-section">
                        <div class="settings-title">نوع رقابت</div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>نوع جدول / رقابت</label>
                                <select id="leagueTypeSelect" onchange="updateLeagueType()">
                                    <option value="league" ${leagueType === 'league' ? 'selected' : ''}>لیگ و جام حذفی و سوپرکاپ</option>
                                    <option value="cup" ${leagueType === 'cup' ? 'selected' : ''}>جام حذفی و گروهی</option>
                                </select>
                            </div>
                        </div>
                        <p style="color:#b0b0b0;font-size:0.9em;">نوع رقابت انتخاب‌شده: <strong style="color:#1eff00;">${leagueType === 'league' ? 'لیگ و جام حذفی و سوپرکاپ' : 'جام حذفی و گروهی'}</strong></p>
                    </div>
                    
                    <div class="settings-section">
                        <div class="settings-title">🎯 مدیریت جام حذفی و گروهی</div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>تعداد گروه‌ها</label>
                                <input type="number" id="groupsCount" min="1" max="16" value="2">
                            </div>
                            <div class="form-group">
                                <label>تعداد تیم‌های صعودکننده از هر گروه</label>
                                <input type="number" id="advancePerGroup" min="1" max="8" value="2">
                            </div>
                        </div>
                        <p style="color:#b0b0b0;font-size:0.9em;">برای قرعه‌کشی گروهی دکمه زیر را بزنید. بعد از قرعه‌کشی می‌توانید با زدن دکمه "صعود ۲ تیم اول" تیم‌های صعودکننده را مشخص کنید.</p>
                        <div style="display:flex;gap:10px;margin-top:10px;"><button class="btn" onclick="runGroupDraw()">قرعه‌کشی گروهی</button><button class="btn" onclick="advanceFromGroups()">صعود ۲ تیم اول</button></div>
                        <div id="groupsArea" style="margin-top:15px;color:#b0b0b0;"></div>
                    </div>
    
                    
                    <div class="settings-section">
                        <div class="settings-title">ساخت خودکار هفته‌ها</div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>نوع برنامه</label>
                                <select id="scheduleType">
                                    <option value="home_away">رفت و برگشت (دو دور)</option>
                                    <option value="home_only">فقط رفت (یک دور)</option>
