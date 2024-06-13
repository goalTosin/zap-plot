const levelBox = document.getElementById('levels')

for (let i = 0; i < 3; i++) {
  levelBox.appendChild(str2elt(me('div', {class: 'level', 'data-levelId': i, onclick: `playLevel(${i + 1});levelBox.style.display = 'none'`}, (i + 1) + '')))
}

