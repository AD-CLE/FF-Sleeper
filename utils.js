// ── FF-Sleeper Shared Utilities ── v1.9.23-beta

// ── PLAYER LOOKUP ──

let playerLookupCache = {};

const defenseMap = {
    'ARZ':'Arizona Cardinals Defense','ATL':'Atlanta Falcons Defense','BAL':'Baltimore Ravens Defense',
    'BUF':'Buffalo Bills Defense','CAR':'Carolina Panthers Defense','CHI':'Chicago Bears Defense',
    'CIN':'Cincinnati Bengals Defense','CLE':'Cleveland Browns Defense','DAL':'Dallas Cowboys Defense',
    'DEN':'Denver Broncos Defense','DET':'Detroit Lions Defense','GB':'Green Bay Packers Defense',
    'HOU':'Houston Texans Defense','IND':'Indianapolis Colts Defense','JAX':'Jacksonville Jaguars Defense',
    'KC':'Kansas City Chiefs Defense','LAC':'Los Angeles Chargers Defense','LAR':'Los Angeles Rams Defense',
    'LV':'Las Vegas Raiders Defense','MIA':'Miami Dolphins Defense','MIN':'Minnesota Vikings Defense',
    'NE':'New England Patriots Defense','NO':'New Orleans Saints Defense','NYG':'New York Giants Defense',
    'NYJ':'New York Jets Defense','PHI':'Philadelphia Eagles Defense','PIT':'Pittsburgh Steelers Defense',
    'SF':'San Francisco 49ers Defense','SEA':'Seattle Seahawks Defense','TB':'Tampa Bay Buccaneers Defense',
    'TEN':'Tennessee Titans Defense','WAS':'Washington Commanders Defense'
};

async function loadPlayerLookup() {
    if (Object.keys(playerLookupCache).length > 0) return;
    try {
        const response = await fetch('players.json');
        if (!response.ok) throw new Error('players.json not found');
        const data = await response.json();
        const players = data.players || data;
        players.forEach(row => {
            const sleeperId = String(row['SLEEPER_ID']);
            playerLookupCache[sleeperId] = {
                playerName: row['PLAYER_NAME'],
                position: row['POSITION'],
                age: parseInt(row['AGE']) || 0,
                team: row['TEAM'],
                college: row['COLLEGE'] || '',
                depthChartPos: row['DEPTH_CHART_POS'],
                depthChartOrder: parseInt(row['DEPTH_CHART_ORDER']) || 0,
                yearsExp: parseInt(row['YEARS_EXP']) || 0,
                posRank: row['POS_RANK'],
                defaultRank: parseInt(row['DEFAULT_RANK']) || 9999  // NOTE: must match exact JSON field name
            };
        });
        console.log('players.json loaded:', Object.keys(playerLookupCache).length, 'players');
    } catch (e) {
        console.error('Could not load players.json:', e);
    }
}

function getPlayerData(sleeperId) {
    const s = String(sleeperId);
    if (playerLookupCache[s]) return playerLookupCache[s];
    if (defenseMap[s]) return { sleeperId: s, playerName: defenseMap[s], position: 'DEF', age: 'N/A', team: s, college: '', depthChartPos: 'DEF', depthChartOrder: 1, yearsExp: 0, posRank: 1, defaultRank: 9999 };
    return { sleeperId: s, playerName: `Unknown (${s})`, position: 'UNK', age: 'N/A', team: 'N/A', college: '', depthChartPos: 'N/A', depthChartOrder: 0, yearsExp: 0, posRank: 9999, defaultRank: 9999 };
}


// ── SCORING ENGINE ──

function getPosRankNum(posRank) {
    if (!posRank && posRank !== 0) return 9999;
    return parseInt(posRank) || 9999;
}

function cleanDepth(depth, exp, position) {
    if (depth === 0 || depth === null || isNaN(depth)) return exp === 0 ? 3 : 4;
    if (depth >= 5) return 4;
    return depth;
}

function getWRBaseScore(rank) {
    if (rank <= 12) return 99 - ((rank - 1) * (4/11));
    if (rank <= 18) return 94 - ((rank - 13) * (4/5));
    if (rank <= 24) return 88 - ((rank - 19) * (4/5));
    if (rank <= 36) return 82 - ((rank - 25) * (6/11));
    if (rank <= 48) return 75 - ((rank - 37) * (7/11));
    if (rank <= 60) return 67 - ((rank - 49) * (7/11));
    if (rank <= 78) return 50 - ((rank - 61) * (15/17));
    if (rank <= 125) return 32 - ((rank - 79) * (20/46));
    return 0;
}

function getWRExpDepthModifier(exp, depth) {
    const d = depth >= 4 ? 4 : depth;
    const matrix = {
        0: [1.00, 1.00, 0.90, 0.50],
        1: [1.05, 1.00, 0.95, 0.60],
        2: [1.00, 0.95, 0.75, 0.40],
        3: [0.85, 0.80, 0.60, 0.20]
    };
    let tier;
    if (exp === 0) tier = 0;
    else if (exp <= 3) tier = 1;
    else if (exp <= 7) tier = 2;
    else tier = 3;
    return matrix[tier][d - 1] || 0.20;
}

function getRBBaseScore(rank) {
    if (rank <= 6)   return 99 - ((rank - 1) * (4/5));
    if (rank <= 12)  return 94 - ((rank - 7) * (6/5));
    if (rank <= 24)  return 87 - ((rank - 13) * (9/11));
    if (rank <= 36)  return 77 - ((rank - 25) * (9/11));
    if (rank <= 48)  return 67 - ((rank - 37) * (12/11));
    if (rank <= 60)  return 54 - ((rank - 49) * (12/11));
    if (rank <= 85)  return 38 - ((rank - 61) * (20/24));
    if (rank <= 101) return 15 - ((rank - 86) * (10/15));
    return 0;
}

function getRBExpDepthModifier(exp, depth) {
    const d = depth >= 4 ? 4 : depth;
    const matrix = {
        0: [1.00, 1.00, 0.90, 0.40],
        1: [1.05, 1.00, 0.90, 0.50],
        2: [1.00, 0.90, 0.75, 0.25],
        3: [0.85, 0.70, 0.40, 0.10],
        4: [0.75, 0.40, 0.15, 0.05]
    };
    let tier;
    if (exp === 0) tier = 0;
    else if (exp <= 3) tier = 1;
    else if (exp <= 6) tier = 2;
    else if (exp <= 8) tier = 3;
    else tier = 4;
    return matrix[tier][d - 1] || 0.05;
}

function getTEBaseScore(rank) {
    if (rank <= 6)   return 99 - ((rank - 1) * (4/5));
    if (rank <= 12)  return 94 - ((rank - 7) * (6/5));
    if (rank <= 24)  return 87 - ((rank - 13) * (15/11));
    if (rank <= 36)  return 68 - ((rank - 25) * (18/11));
    if (rank <= 48)  return 45 - ((rank - 37) * (20/11));
    return 0;
}

function getTEExpDepthModifier(exp, depth) {
    const d = depth >= 4 ? 4 : depth;
    const matrix = {
        0: [1.00, 0.90, 0.60, 0.20],
        1: [1.05, 0.85, 0.55, 0.15],
        2: [1.00, 0.80, 0.45, 0.10],
        3: [0.80, 0.50, 0.20, 0.05]
    };
    let tier;
    if (exp === 0) tier = 0;
    else if (exp <= 3) tier = 1;
    else if (exp <= 9) tier = 2;
    else tier = 3;
    return matrix[tier][d - 1] || 0.05;
}

function getQBBaseScore(rank) {
    if (rank === 1)  return 99;
    if (rank <= 12)  return Math.round(99 - ((rank - 1) * (14/11)));
    if (rank <= 18)  return Math.round(85 - ((rank - 12) * (5/6)));
    if (rank <= 24)  return Math.round(80 - ((rank - 18) * (10/6)));
    if (rank <= 36)  return Math.round(70 - ((rank - 24) * (10/12)));
    if (rank <= 64)  return Math.round(60 - ((rank - 36) * (55/28)));
    return 0;
}

function getQBExpDepthModifier(exp, depth) {
    const d = depth >= 4 ? 4 : depth;
    const matrix = {
        0: [1.00, 0.95, 0.50, 0.20],
        1: [1.02, 0.90, 0.40, 0.15],
        2: [1.00, 0.80, 0.30, 0.10],
        3: [0.97, 0.60, 0.20, 0.05],
        4: [0.85, 0.30, 0.10, 0.02]
    };
    let tier;
    if (exp === 0) tier = 0;
    else if (exp <= 3) tier = 1;
    else if (exp <= 7) tier = 2;
    else if (exp <= 12) tier = 3;
    else tier = 4;
    return matrix[tier][d - 1] || 0.02;
}

function scorePlayer(playerData) {
    if (!playerData) return 0;
    const position = playerData.position;
    const posRank = getPosRankNum(playerData.posRank);
    const exp = playerData.yearsExp || 0;
    const rawDepth = playerData.depthChartOrder || 0;
    const depth = cleanDepth(rawDepth, exp, position);

    let base = 0;
    let modifier = 1.0;

    if (position === 'WR') {
        base = getWRBaseScore(posRank);
        modifier = getWRExpDepthModifier(exp, depth);
    } else if (position === 'RB') {
        base = getRBBaseScore(posRank);
        modifier = getRBExpDepthModifier(exp, depth);
    } else if (position === 'TE') {
        base = getTEBaseScore(posRank);
        modifier = getTEExpDepthModifier(exp, depth);
    } else if (position === 'QB') {
        base = getQBBaseScore(posRank);
        modifier = getQBExpDepthModifier(exp, depth);
    } else {
        return 0;
    }

    const score = Math.round(base * modifier);
    return Math.min(99, Math.max(0, score));
}



// ── TIER ──

function getTier(score) {
    if (score >= 90) return 1;
    if (score >= 60) return 2;
    if (score >= 35) return 3;
    if (score > 0)  return 4;
    return 0;
}

// ── ALLOCATION ──

function getStatusIcon(status) {
    if (status.includes('Starter') || status.includes('FLEX')) return '🎯';
    if (status === 'Bench') return '🪑';
    if (status === 'Trade') return '🔀';
    if (status === 'Cut') return '🗑️';
    return '';
}

function allocateRoster(roster, league, tepTier) {
    if (!roster.players || roster.players.length === 0) return {};
    const rosterSlots = {};
    league.roster_positions?.forEach(pos => { rosterSlots[pos] = (rosterSlots[pos] || 0) + 1; });
    const positionStarters = {
        'QB': (rosterSlots['QB'] || 0) + (rosterSlots['SUPER_FLEX'] || 0),
        'RB': rosterSlots['RB'] || 0, 'WR': rosterSlots['WR'] || 0,
        'TE': rosterSlots['TE'] || 0, 'K': rosterSlots['K'] || 0,
        'DEF': rosterSlots['DEF'] || 0, 'FLEX': rosterSlots['FLEX'] || 0,
        'SUPER_FLEX': rosterSlots['SUPER_FLEX'] || 0
    };
    const classified = { 'KEEP': [], 'Trade': [], 'Cut': [] };
    const allocation = {};

    roster.players.forEach(playerId => {
        const playerObj = getPlayerData(playerId);
        if (!playerObj) return;
        const position = playerObj.position;
        const defaultRank = playerObj.defaultRank;
        const posRank = playerObj.posRank || 0;
        const yearsExp = playerObj.yearsExp;
        const depthChartOrder = playerObj.depthChartOrder;
        const posRankNum = getPosRankNum(posRank);
        let classification = 'Trade';

        if (position === 'UNK') { classification = 'KEEP'; }
        else if (position === 'QB') {
            if (positionStarters['QB'] === 1) {
                const allQBs = roster.players
                    .map(id => ({ id, rank: getPlayerData(id)?.defaultRank || 9999, yearsExp: getPlayerData(id)?.yearsExp || 0 }))
                    .filter(q => getPlayerData(q.id)?.position === 'QB')
                    .sort((a, b) => a.rank - b.rank);
                const qbRankIndex = allQBs.findIndex(q => q.id === playerId);
                if (qbRankIndex <= 2) { classification = 'KEEP'; }
                else { classification = allQBs[qbRankIndex].yearsExp < 2 ? 'Trade' : 'Cut'; }
            } else {
                if (depthChartOrder === 1) classification = 'KEEP';
                else if (depthChartOrder === 2) classification = 'Trade';
                else if (depthChartOrder >= 3) classification = yearsExp < 4 ? 'Trade' : 'Cut';
                else classification = yearsExp === 0 ? 'Trade' : 'Cut';
            }
        } else if (position === 'RB' || position === 'TE') {
            if (depthChartOrder === 1) classification = 'KEEP';
            else if (depthChartOrder === 2) classification = yearsExp < 4 ? 'KEEP' : 'Trade';
            else if (depthChartOrder >= 3) { if (yearsExp < 2) classification = 'KEEP'; else if (defaultRank <= 300) classification = 'Trade'; else classification = 'Cut'; }
            else classification = yearsExp === 0 ? 'Trade' : 'Cut';
            if (position === 'TE' && tepTier === 'Off') {
                if (depthChartOrder === 1) { classification = 'KEEP'; }
                else { classification = posRankNum <= 2 ? 'KEEP' : (defaultRank <= 200 || yearsExp === 0 ? 'Trade' : 'Cut'); }
            }
        } else if (position === 'WR') {
            classification = (defaultRank > 120 && yearsExp > 4 && depthChartOrder > 3) ? 'Cut' : 'KEEP';
        } else if (position === 'K' || position === 'DEF') {
            if (depthChartOrder === 1) { classification = 'KEEP'; }
            else { classification = posRankNum <= 6 ? 'Bench' : 'Cut'; }
        }

        allocation[playerId] = { position, classification, defaultRank, posRank, yearsExp, depthChartOrder, finalStatus: null };
        classified[classification] = classified[classification] || [];
        classified[classification].push(playerId);
    });

    // Sort each bucket by score desc, posRank asc as tiebreaker
    Object.keys(classified).forEach(c => {
        classified[c].sort((a, b) => {
            const scoreA = scorePlayer(getPlayerData(a));
            const scoreB = scorePlayer(getPlayerData(b));
            if (scoreB !== scoreA) return scoreB - scoreA;
            return (getPosRankNum(getPlayerData(a)?.posRank) || 9999) - (getPosRankNum(getPlayerData(b)?.posRank) || 9999);
        });
    });

    const assigned = new Set();
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

    // Assign starters by position
    positions.forEach(pos => {
        const slots = positionStarters[pos] || 0;
        for (let i = 0; i < slots; i++) {
            const keepPlayer = classified['KEEP'].find(id => getPlayerData(id)?.position === pos && !assigned.has(id));
            if (keepPlayer) { allocation[keepPlayer].finalStatus = 'Starter'; assigned.add(keepPlayer); continue; }
            const tradePlayer = classified['Trade'].find(id => getPlayerData(id)?.position === pos && !assigned.has(id));
            if (tradePlayer) { allocation[tradePlayer].finalStatus = 'Starter'; assigned.add(tradePlayer); }
        }
    });

    // Assign FLEX slots
    const flexSlots = positionStarters['FLEX'] || 0;
    for (let i = 0; i < flexSlots; i++) {
        const flexEligible = ['RB', 'WR', 'TE'];
        const fp = classified['KEEP'].find(id => flexEligible.includes(getPlayerData(id)?.position) && !assigned.has(id));
        if (fp) { allocation[fp].finalStatus = 'FLEX'; assigned.add(fp); }
        else {
            const ft = classified['Trade'].find(id => flexEligible.includes(getPlayerData(id)?.position) && !assigned.has(id));
            if (ft) { allocation[ft].finalStatus = 'FLEX'; assigned.add(ft); }
        }
    }

    // Assign bench slots (total roster slots minus IR and TAXI)
    const nonBenchSlots = ['IR', 'TAXI'];
    const benchSlotCount = (league.roster_positions || []).filter(p => !nonBenchSlots.includes(p)).length;
    const benchSlots = Math.max(0, benchSlotCount - assigned.size);
    for (let i = 0; i < benchSlots; i++) {
        const bk = classified['KEEP'].find(id => !assigned.has(id));
        if (bk) { allocation[bk].finalStatus = 'Bench'; assigned.add(bk); continue; }
        const bt = classified['Trade'].find(id => !assigned.has(id));
        if (bt) { allocation[bt].finalStatus = 'Bench'; assigned.add(bt); }
    }

    // Remaining unassigned → Trade or Cut
    roster.players.forEach(playerId => {
        if (!assigned.has(playerId)) {
            const record = allocation[playerId];
            record.finalStatus = record.classification === 'Cut' ? 'Cut' : 'Trade';
        }
    });

    return allocation;
}


// ── SELL NOW SIGNAL ──

function getSellNowSignal(player) {
    const age = parseInt(player.age) || 0;
    const exp = parseInt(player.yearsExp) || 0;
    const score = scorePlayer(player);
    const depth = player.depthChartOrder || 0;
    const pos = player.position;

    // Only skill positions
    if (!['WR','RB','TE','QB'].includes(pos)) return null;

    // Only D1-D2 (job secure = better trade value to contenders)
    if (depth > 2 || depth === 0) return null;

    let hit = false;
    let urgency = 'MEDIUM';

    if (pos === 'WR') {
        if (score >= 55 && score <= 84 && age >= 27 && exp >= 6 && exp <= 10) {
            hit = true;
            urgency = (age >= 32 || exp >= 9) ? 'CRITICAL' : (age >= 30 || exp >= 7) ? 'HIGH' : 'MEDIUM';
        }
    } else if (pos === 'RB') {
        // Score 0 = cut, no trade value
        if (score === 0) return null;
        // Window 1 — Approaching cliff: exp 5-7, age 26-29, D1-D2
        const w1 = exp >= 5 && exp <= 7 && age >= 26 && age <= 29;
        // Window 2 — On the cliff: exp 8+, age 29+, D1-D2
        const w2 = exp >= 8 && age >= 29;
        if (w2) {
            hit = true;
            urgency = score >= 60 ? 'HIGH' : 'CRITICAL';
        } else if (w1) {
            hit = true;
            urgency = score >= 75 ? 'MEDIUM' : score >= 60 ? 'HIGH' : 'MEDIUM';
        }
    } else if (pos === 'TE') {
        if (score >= 55 && score <= 80 && age >= 30 && exp >= 9 && exp <= 12) {
            hit = true;
            urgency = (age >= 33 || exp >= 11) ? 'CRITICAL' : 'HIGH';
        }
    } else if (pos === 'QB') {
        if (score >= 55 && score <= 80 && age >= 35 && exp >= 10) {
            hit = true;
            urgency = 'CRITICAL';
        }
    }

    if (!hit) return null;
    return { signal: 'SELL_NOW', urgency, score, age, exp, depth };
}

function buildPickInventory(myRosterId, tradedPicks, rosterMap, totalTeams) {
    const years = ['2026','2027','2028'];
    const rounds = [1,2,3,4];
    const owned = {};
    for (let i = 1; i <= totalTeams; i++) {
        owned[i] = [];
        years.forEach(y => rounds.forEach(r => { owned[i].push({ season: y, round: r, originalRosterId: i, pickSlot: null }); }));
    }
    tradedPicks.forEach(tp => {
        if (parseInt(tp.season) < 2026) return;
        const origId = tp.roster_id;
        const newOwner = tp.owner_id;
        Object.keys(owned).forEach(rid => {
            owned[rid] = owned[rid].filter(p => !(p.season === tp.season && p.round === tp.round && p.originalRosterId === origId));
        });
        if (!owned[newOwner]) owned[newOwner] = [];
        owned[newOwner].push({ season: tp.season, round: tp.round, originalRosterId: origId, pickSlot: tp.pick_no || null });
    });
    return owned[myRosterId] || [];
}

function getTeamShortName(rosterId, rosterMap, userMap) {
    const roster = rosterMap[rosterId];
    if (!roster) return 'Team ' + rosterId;
    const user = userMap[roster.owner_id] || {};
    const n = (roster.metadata && roster.metadata.team_name) || (user.metadata && user.metadata.team_name) || user.display_name || ('Team ' + rosterId);
    return n.length > 14 ? n.split(' ')[0] : n;
}

function renderPickInventory(myRosterId, tradedPicks, rosterMap, userMap) {
    const total = Object.keys(rosterMap).length || 12;
    const picks = buildPickInventory(myRosterId, tradedPicks, rosterMap, total);
    const byYear = { '2026': [], '2027': [], '2028': [] };
    picks.forEach(p => { if (byYear[p.season]) byYear[p.season].push(p); });
    const rl = r => r===1?'1st':r===2?'2nd':r===3?'3rd':'4th';
    let html = '';
    ['2026','2027','2028'].forEach(yr => {
        const yp = byYear[yr];
        if (yp.length === 0) {
            html += '<div style="margin-bottom:0.4rem"><span style="color:#fbbf24;font-weight:600">' + yr + ':</span> <span style="color:#ef4444;font-size:0.8rem">No picks</span></div>';
            return;
        }
        yp.sort((a,b) => a.round !== b.round ? a.round-b.round : (a.pickSlot||99)-(b.pickSlot||99));
        const parts = yp.map(p => {
            const own = p.originalRosterId === myRosterId;
            const lbl = (yr==='2026' && p.pickSlot) ? (p.round+'.'+String(p.pickSlot).padStart(2,'0')) : rl(p.round);
            const sfx = own ? '' : ' <span style="color:#64748b;font-size:0.75rem">('+getTeamShortName(p.originalRosterId, rosterMap, userMap)+')</span>';
            const col = p.round===1?'#fbbf24':p.round===2?'#94a3b8':'#475569';
            return '<span style="color:'+col+'">'+lbl+'</span>'+sfx;
        }).join(' <span style="color:#334155">&middot;</span> ');
        html += '<div style="margin-bottom:0.4rem;line-height:1.8"><span style="color:#fbbf24;font-weight:600">'+yr+':</span> '+parts+'</div>';
    });
    return html || '<span style="color:#475569">No future picks</span>';
}
