// index script: отображает rounds из data.json, вычисляет победителей из очков и подсвечивает
async function init() {
  try {
    const r = await fetch('data.json?nocache=' + Date.now());
    const data = await r.json();
    renderRounds(data.rounds);
  } catch (e) {
    const bracket = document.getElementById('bracket');
    bracket.innerHTML = '<p style="color:#ff7777">Ошибка загрузки data.json</p>';
    console.error(e);
  }
}

function renderRounds(rounds){
  const bracket = document.getElementById('bracket');
  const champEl = document.getElementById('champion');
  bracket.innerHTML = '';
  champEl.textContent = '';

  // compute winners from each round to propagate to next rounds when placeholders exist
  const winnersByRound = [];

  rounds.forEach((round, rIdx) => {
    const roundEl = document.createElement('div'); roundEl.className='round';
    const title = document.createElement('h3'); title.textContent = round.name; roundEl.appendChild(title);

    round.matches.forEach((m, mi) => {
      // if this is not the first round and teams are placeholders, try to fill from previous winners
      if(rIdx > 0){
        const prevWinners = winnersByRound[rIdx - 1] || [];
        // mapping: for 6->3, map pairs (0,1)->0, (2,3)->1, (4,5)->2
        const pairIndex = Math.floor(mi*2); // not used directly
        // compute expected mapping: teamA from prevWins[mi*2], teamB from prevWins[mi*2+1]
        const a = prevWinners[mi*2];
        const b = prevWinners[mi*2+1];
        if(a) m.teamA = m.teamA && m.teamA.toLowerCase().includes('побед') ? a : m.teamA;
        if(b) m.teamB = m.teamB && m.teamB.toLowerCase().includes('побед') ? b : m.teamB;
      }

      const matchEl = document.createElement('div'); matchEl.className='match';
      const teamA = document.createElement('div'); teamA.className='team'; teamA.textContent = `${m.teamA} (${m.scoreA})`;
      const teamB = document.createElement('div'); teamB.className='team'; teamB.textContent = `${m.teamB} (${m.scoreB})`;

      // highlight winner
      if(typeof m.scoreA === 'number' && typeof m.scoreB === 'number'){
        if(m.scoreA > m.scoreB) teamA.classList.add('winner');
        else if(m.scoreB > m.scoreA) teamB.classList.add('winner');
      }

      matchEl.appendChild(teamA); matchEl.appendChild(teamB); roundEl.appendChild(matchEl);
    });

    // compute winners of this round for propagation
    const winners = round.matches.map(m => {
      if(m.scoreA > m.scoreB) return m.teamA;
      if(m.scoreB > m.scoreA) return m.teamB;
      return null;
    });
    winnersByRound.push(winners);

    bracket.appendChild(roundEl);
  });

  // determine final champion (from final round first match)
  const finalRound = rounds[rounds.length -1];
  if(finalRound && finalRound.matches && finalRound.matches[0]){
    const fm = finalRound.matches[0];
    if(fm.scoreA > fm.scoreB) document.getElementById('champion').textContent = `— ${fm.teamA} 🏆`;
    else if(fm.scoreB > fm.scoreA) document.getElementById('champion').textContent = `— ${fm.teamB} 🏆`;
  }
}

document.addEventListener('DOMContentLoaded', init);
