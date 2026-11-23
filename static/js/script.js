let patch = '16.22'


// Mapping of lane types to their corresponding SVGs
const laneSvgs = {
  'Top': `<svg viewBox="0 0 31 31" class="h-7"><g fill="currentColor" fill-rule="evenodd" transform="rotate(-180 13.25 13.25)"><polygon points="22.063 3 22.063 21.969 3 21.969 7.053 17.936 18.063 17.969 17.999 7.044"></polygon><polygon fill-opacity=".3" points="0 0 14.593 0 19.109 0 15.089 4.011 4.002 4 4.002 15.076 0 19.07 0 14.491"></polygon><rect width="6" height="6" x="8" y="8" fill-opacity=".3"></rect></g></svg>`,
  'Jungle': `<svg viewBox="0 0 31 31" class="h-7"><g fill="currentColor" fill-rule="evenodd" transform="translate(4 3)"><path d="M11.5565033 25.2593129L3.71050008 17.007843C3.53174845 13.6218567 2.29491509 10.7161679 0 8.29077657 3.7954305 10.8023461 6.10286289 13.0322181 6.92229716 14.9803925 6.50825161 8.81697083 5.33232795 3.82350667 3.39452616 0 8.87327915 7.71470812 11.7037862 13.5908949 11.8860474 17.6285604 12.0683085 21.6662259 11.9584605 24.20981 11.5565033 25.2593129zM14.653773 21.2846629C14.9109039 14.93976 17.4729716 10.187166 22.339976 7.0268809 19.9557631 10.6189931 18.8951467 14.045261 19.1581268 17.3056844L14.653773 21.2846629zM13.429067 14.4254201L12.0960337 8.97735596C13.4903276 6.05259874 15.7644196 3.11883375 18.9183095.176060994 16.7638533 4.16490512 15.401769 7.34258185 14.8320567 9.70909119 14.2623444 12.0756005 13.7946811 13.6477102 13.429067 14.4254201z"></path></g></svg>`,
  'Middle': `<svg viewBox="0 0 31 31" class="h-7"><g fill="currentColor" fill-rule="evenodd" transform="translate(4.5 4.5)"><polygon fill-opacity=".3" points="0 0 14.519 0 10.484 4 3.997 4 3.997 10.523 0 14.491"></polygon><polygon fill-opacity=".3" points="7.5 7.5 22.019 7.5 17.984 11.5 11.497 11.5 11.497 18.023 7.5 21.991" transform="rotate(-180 14.76 14.746)"></polygon><polygon points="18 0 22 0 22 4 4 22 0 22 0 18"></polygon></g></svg>`,
  'Bottom': `<svg viewBox="0 0 31 31" class="h-7"><g fill="currentColor" fill-rule="evenodd" transform="translate(4.5 4.5)"><polygon points="22.063 3 22.063 21.969 3 21.969 7.053 17.936 18.063 17.969 17.999 7.044"></polygon><polygon fill-opacity=".3" points="0 0 14.593 0 19.109 0 15.089 4.011 4.002 4 4.002 15.076 0 19.07 0 14.491"></polygon><rect width="6" height="6" x="8" y="8" fill-opacity=".3"></rect></g></svg>`,
  'Support': `<svg viewBox="0 0 31 31" class="h-7"><g fill="currentColor" fill-rule="evenodd" transform="translate(1.5 4)"><polygon points="14.089 22.953 18.041 19.779 14.089 9.976 10.121 19.779"></polygon><polygon points="8.841 13.988 11.786 8.453 9.102 6 0 6 7.895 9.466 5.868 11.388"></polygon><polygon points="25.341 13.988 28.286 8.453 25.602 6 16.5 6 24.395 9.466 22.368 11.388" transform="matrix(-1 0 0 1 44.786 0)"></polygon><polygon points="13.992 7.007 18.044 2.955 16.04 .951 12.009 .951 10.025 2.934"></polygon></g></svg>`
};


let ind_winrate = {}
let closeHandler = undefined

const picks = document.querySelectorAll('.team-item:not(.header)');

picks.forEach(pick => {
  pick.addEventListener('click', () => {
    if (pick.style.backgroundImage) {
      // get the champion name and lane
      const pickLabel = pick.querySelector(".pick-label");
      const champion = pickLabel.textContent.trim();
      const champ_id = pickLabel.getAttribute('data-id');
      const laneIcon = pick.querySelector(".lane-icon");
      const lane = laneIcon.getAttribute('data-lane');
      //get the team + data
      if(pick.classList.contains('ally')){
        const team = 'blue';
        const data = ind_winrate['team1'][champion];
        //populate modal
        populateChampionModal(champion,champ_id,lane,team,data);

      }
      else{
        const team = 'red';
        const data = ind_winrate['team2'][champion];
        populateChampionModal(champion,champ_id,lane,team,data);
      }
      //open modal
      openModal();
      return;
    }
    // Remove 'selected' from all picks (and from the ban cards)
    clearBanSelection();
    picks.forEach(p => p.classList.remove('selected'));
    picks.forEach(p => p.classList.remove('blinking'));
    // Add 'selected' to the clicked pick
    pick.classList.add('selected');
    pick.classList.add('blinking');
    getRecos();
  });
});

const menuButtons = document.querySelectorAll('.menu');

menuButtons.forEach(button => {
button.addEventListener('click', (e) => {
  e.stopPropagation();
  const menuContent = button.parentElement.querySelector('.menu-content');

  // Close all other menus first
  document.querySelectorAll('.menu-content').forEach(menu => {
    if (menu !== menuContent) menu.style.display = 'none';
  });

  // Toggle the clicked one
  if (menuContent) {
    menuContent.style.display = (menuContent.style.display === 'block') ? 'none' : 'block';
  }
});
});

// Close the menu if clicking outside
document.addEventListener('click', () => {
document.querySelectorAll('.menu-content').forEach(menu => {
  menu.style.display = 'none';
});
});


//SEARCH BAR
const searchInput = document.getElementById("search-input");
const searchBar = document.querySelector(".search-bar");
const clearIcon = document.getElementById("clear-icon");
const laneToggles = document.querySelectorAll('#lane-toggle input[type="checkbox"]');

//TEAM WINRATES
const ally_winrate_div = document.getElementById("team1-winrate");
const opponent_winrate_div = document.getElementById("team2-winrate");


// Remove any existing event listeners
//searchInput.removeEventListener("focus", () => {});
//searchInput.removeEventListener("blur", () => {});

// Show the clear icon when there is text in the input
searchInput.addEventListener("input", () => {
  if (searchInput.value) {
    clearIcon.style.display = "inline-block";
  } else {
    clearIcon.style.display = "none";
  }
  filterTable();
});

function clear_search_input(){
  searchInput.value = ""; // Clear the text
  clearIcon.style.display = "none"; // Hide the clear icon
}

// Clear the input when the clear icon is clicked
clearIcon.addEventListener("click", () => {
  clear_search_input();
  searchInput.focus(); // Keep the focus on the input
  filterTable(); // Update the table
});

// Add this CSS to your stylesheet
// Replace the JavaScript-based focus handling with CSS
const style = document.createElement('style');
style.textContent = `
  .search-bar:has(input:focus) {
    /* Add your focused styles here */
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
    border-color: #3b82f6;
  }
  
  /* If the above doesn't work in all browsers, this is a fallback */
  #search-input:focus {
    outline: none;
  }
  
  #search-input:focus + .search-bar {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
    border-color: #3b82f6;
  }
`;
document.head.appendChild(style);


//TEAM TOGGLES
const allyBtn = document.getElementById('ally-btn');
const opponentBtn = document.getElementById('opponent-btn');

allyBtn.addEventListener('click', () => {
allyBtn.classList.add('active');
opponentBtn.classList.remove('active');
});

opponentBtn.addEventListener('click', () => {
opponentBtn.classList.add('active');
allyBtn.classList.remove('active');
});


//ROLE TOGGLES
// Handle toggling position buttons (Top, Jungle, Mid, Bot, Support)
const laneButtons = document.querySelectorAll('#lane-toggle button');
const topBtn = document.getElementById('top-btn');
const jungleBtn = document.getElementById('jungle-btn');
const midBtn = document.getElementById('mid-btn');
const botBtn = document.getElementById('bot-btn');
const supportBtn = document.getElementById('support-btn');

// Function to handle the position button selection
function togglePositionButton(button) {
  // Check if the clicked button is already active
  if (button.classList.contains('active')) {
    // If it is active, remove the active class (deselect it)
    button.classList.remove('active');
  } else {
    // If it is not active, select it and deselect the other buttons
    // Remove 'active' from all buttons
    topBtn.classList.remove('active');
    jungleBtn.classList.remove('active');
    midBtn.classList.remove('active');
    botBtn.classList.remove('active');
    supportBtn.classList.remove('active');
    
    // Add 'active' to the clicked button
    button.classList.add('active');
  }
  filterTable();
}

// Event listeners for position buttons
topBtn.addEventListener('click', () => togglePositionButton(topBtn));
jungleBtn.addEventListener('click', () => togglePositionButton(jungleBtn));
midBtn.addEventListener('click', () => togglePositionButton(midBtn));
botBtn.addEventListener('click', () => togglePositionButton(botBtn));
supportBtn.addEventListener('click', () => togglePositionButton(supportBtn));


function filterTable() {
  const searchText = searchInput.value.toLowerCase();

  const activeLanes = Array.from(laneButtons)
    .filter(btn => btn.classList.contains('active'))
    .map(btn => btn.value); // now using the value attribute!
  const rows = document.querySelectorAll('.draft-table tbody tr');
  rows.forEach(row => {
    const championCell = row.querySelector('td:nth-child(3)');
    const championLane = row.getAttribute("data-lane");
    if (championCell && championLane) {
      const championName = championCell.textContent.toLowerCase();
      const matchesSearch = championName.includes(searchText);
      const matchesLane = activeLanes.length === 0 || activeLanes.includes(championLane);
      if (matchesSearch && matchesLane) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  });
}


// At page load, store the original pick label
document.querySelectorAll('.team-item').forEach(pick => {
  const label = pick.querySelector('.pick-label');
  if (label) {
    pick.setAttribute('data-original-label', label.textContent.trim());
  }
});

// Reset function based on the team type (ally or opponent)
// At page load, store the original pick label
document.querySelectorAll('.team-item').forEach(pick => {
  const label = pick.querySelector('.pick-label');
  if (label) {
    pick.setAttribute('data-original-label', label.textContent.trim());
  }
});

// Reset function based on the team type (ally or opponent)
function resetTeam(teamType) {
  // Find all picks with the respective teamType class
  const teamItems = document.querySelectorAll(`.team-item.${teamType}`); 

  teamItems.forEach(pick => {
    // Remove background
    pick.style.backgroundImage = '';
    pick.style.backgroundSize = '';
    pick.style.backgroundPosition = '';
    pick.style.backgroundRepeat = '';

    // Reset the pick label
    const label = pick.querySelector('.pick-label');
    const originalText = pick.getAttribute('data-original-label');
    if (label && originalText) {
      label.textContent = originalText;
    }
    const existingLaneIcon = pick.querySelector('.lane-icon');
    if (existingLaneIcon) {
      existingLaneIcon.remove();
    }
    const existingIndWR = pick.querySelector('.ind-winrate');
      if (existingIndWR) {
        existingIndWR.remove();
      }
  });
  picks.forEach(p => p.classList.remove('selected'));
  picks.forEach(p => p.classList.remove('blinking'));
  const isAlly = teamType == 'ally';
  selectNextAvailablePick(isAlly);
  analyseTeams();
  getRecos();
}

// Add event listeners for reset buttons
document.getElementById('reset-ally').addEventListener('click', () => {
  resetTeam('ally');
});

document.getElementById('reset-opponent').addEventListener('click', () => {
  resetTeam('opponent');
});

function selectNextAvailablePick(isAlly) {
  const primaryTeam = document.querySelectorAll(`.team-item.${isAlly ? 'ally' : 'opponent'}`);
  const secondaryTeam = document.querySelectorAll(`.team-item.${isAlly ? 'opponent' : 'ally'}`);

  // Helper function to find and select the next empty pick
  function selectFromTeam(teamItems) {
    for (const item of teamItems) {
      if (!item.style.backgroundImage) {
        clearBanSelection();
        item.classList.add('selected', 'blinking');
        return item;
      }
    }
    return null;
  }

  // Try to find an empty slot in the primary team, then fallback to secondary
  return selectFromTeam(primaryTeam) || selectFromTeam(secondaryTeam);
}

function removeChamp(teamItem){
  const pickLabel = teamItem.querySelector('.pick-label');
    const pickImage = teamItem.style.backgroundImage;
    // Check if there's a champion picked
    if (pickImage) {
      // Reset background image
      teamItem.style.backgroundImage = '';
      teamItem.style.backgroundSize = '';
      teamItem.style.backgroundPosition = '';
      teamItem.style.backgroundRepeat = '';

      // Clear the pick label
      const originalText = teamItem.getAttribute('data-original-label');
      if (pickLabel) {
        pickLabel.textContent = originalText; // Reset the pick label text
      }
      const existingLaneIcon = teamItem.querySelector('.lane-icon');
      if (existingLaneIcon) {
        existingLaneIcon.remove();
      }
      const existingIndWR = teamItem.querySelector('.ind-winrate');
      if (existingIndWR) {
        existingIndWR.remove();
      }
      const isAlly = selectedPick.classList.contains('ally');
      // Remove 'selected' from all picks
      picks.forEach(p => p.classList.remove('selected'));
      picks.forEach(p => p.classList.remove('blinking'));
      selectNextAvailablePick(isAlly);
      analyseTeams();
      getRecos();
      closeHandler = undefined;

    }
}

function addChamp(row){
    // Get the champion name (you need to store it somehow in each <tr>)
    const championName = row.getAttribute('data-champion');
    const laneType = row.getAttribute('data-lane');
    const championId = row.getAttribute('data-id');
    
    // Find the currently selected pick
    const selectedPick = document.querySelector('.team-item.selected') || selectNextAvailablePick(true);

    if (championName && selectedPick) {
      // Set the background image
      const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`;
      selectedPick.style.backgroundImage = `linear-gradient(rgba(25, 25, 25, 0.8) 0%, rgba(0, 0, 0, 0) 50%, rgba(25, 25, 25, 0.8) 100%), url('${splashUrl}')`;
      selectedPick.style.backgroundSize = 'cover';
      selectedPick.style.backgroundPosition = 'center 20%';
      selectedPick.style.backgroundRepeat = 'no-repeat';

      // Update the text inside the pick
      const pickLabel = selectedPick.querySelector('.pick-label'); // assuming your text is inside a span or div with class "pick-label"
      if (pickLabel) {
        pickLabel.textContent = championId;
      }
      pickLabel.setAttribute('data-id',championName);
      addLaneIcon(laneType, selectedPick);
      addIndividualWinrate(50, selectedPick);
      
      picks.forEach(p => p.classList.remove('selected'));
      picks.forEach(p => p.classList.remove('blinking'));
      const isAlly = selectedPick.classList.contains('ally');
      selectNextAvailablePick(isAlly);
      topBtn.classList.remove('active');
      jungleBtn.classList.remove('active');
      midBtn.classList.remove('active');
      botBtn.classList.remove('active');
      supportBtn.classList.remove('active');
      
      if(selectedPick.classList.contains('ally')){
        const team = 'blue';
        //populate modal
        //populateChampionModal(championName,championId,laneType,team,data);
        analyseTeams(modalValues=[championName,championId,laneType,team,'team1',selectedPick]);

      }
      else{
        const team = 'red';
        //populateChampionModal(championName,championId,laneType,team,data);
        analyseTeams(modalValues=[championName,championId,laneType,team,'team2',selectedPick]);
      }
    }
}

function preview(row){
  addChamp(row);
}

// Reset champion (remove champion and background image)
document.querySelectorAll('.reset-champion').forEach(button => {
  button.addEventListener('click', () => {
    const teamItem = button.closest('.team-item');
    const pickLabel = teamItem.querySelector('.pick-label');
    const pickImage = teamItem.style.backgroundImage;

    // Check if there's a champion picked
    if (pickImage) {
      // Reset background image
      teamItem.style.backgroundImage = '';
      teamItem.style.backgroundSize = '';
      teamItem.style.backgroundPosition = '';
      teamItem.style.backgroundRepeat = '';

      // Clear the pick label
      const originalText = teamItem.getAttribute('data-original-label');
      if (pickLabel) {
        pickLabel.textContent = originalText; // Reset the pick label text
      }
      const existingLaneIcon = teamItem.querySelector('.lane-icon');
      if (existingLaneIcon) {
        existingLaneIcon.remove();
      }
      const existingIndWR = teamItem.querySelector('.ind-winrate');
      if (existingIndWR) {
        existingIndWR.remove();
      }
      analyseTeams();
      getRecos();
    }

    // Close the menu after resetting
    button.closest('.menu-content').classList.remove('show');
  });
});

// Function to set the lane icon on the team-item
function addLaneIcon(laneType, selectedPick) {
  // Remove any existing lane icon
  const existingLaneIcon = selectedPick.querySelector('.lane-icon');
  if (existingLaneIcon) {
    existingLaneIcon.remove();
  }

  // Create a new lane icon based on the lane type
  const laneIcon = document.createElement('div');
  laneIcon.classList.add('lane-icon');
  laneIcon.setAttribute('data-lane', laneType);
  laneIcon.innerHTML = laneSvgs[laneType] || '';

  // Append the lane icon to the selected pick
  selectedPick.appendChild(laneIcon);
}

function addIndividualWinrate(value, selectedPick){
  const existingIndWR = selectedPick.querySelector('.ind-winrate');
  if (existingIndWR) {
    //get previous value
    prev_ind_wr = parseFloat(existingIndWR.textContent);
    if(prev_ind_wr!=value){
      animateFloat({element: existingIndWR, startValue: prev_ind_wr, endValue: value, duration: 1500});
    }

  }
  else{
    const indwr = document.createElement('div');
    indwr.classList.add('ind-winrate');
    indwr.innerText = value.toFixed(2);;
    selectedPick.appendChild(indwr);
  }
  

}

function rgbString(rgbArray) {
  return `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
}

function getColorFromScore(score) {
  const gradient = [
    { score: 0, color: '#8B0000' },    // Dark Red
    { score: 10, color: '#FF0000' },   // Red
    { score: 30, color: '#FFA500' },   // Orange
    { score: 50, color: '#FFFFFF' },   // White
    { score: 60, color: '#008000' },   // Green
    { score: 80, color: '#32CD32' },   // Lime Green
    { score: 100, color: '#00FFFF' }   // Electric Blue
  ];

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Find two surrounding stops
  for (let i = 0; i < gradient.length - 1; i++) {
    const current = gradient[i];
    const next = gradient[i + 1];

    if (score >= current.score && score <= next.score) {
      const t = (score - current.score) / (next.score - current.score);
      const color = interpolateColor(current.color, next.color, t);
      return color;
    }
  }

  return '#000000'; // fallback
}

// Helper to interpolate two hex colors
function interpolateColor(hex1, hex2, t) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

// Convert hex to RGB
function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

const filledStar = '★';   // Unicode filled star
const emptyStar = '☆';    // Unicode empty star
const favoriteKey = 'favorites';

function populateDraftTable(draftData) {
  // const draftData = draftData.sort((a, b) => {
  //   const winrateA = parseFloat(a.winrate.replace('%', ''));
  //   const winrateB = parseFloat(b.winrate.replace('%', ''));
  //   return winrateB - winrateA;  // Sort in descending order
  // });
  // Get the tbody element where rows will be inserted
  const tableBody = document.querySelector('.draft-table tbody');

  // Clear any existing rows in the table
  tableBody.innerHTML = '';

  // Loop through the draftData array and create rows
  draftData.forEach(item => {
    // Create a new row with data attributes for champion and lane
    const row = document.createElement('tr');
    row.setAttribute('data-champion', item.championImageName);
    row.setAttribute('data-lane', item.lane);
    row.setAttribute('data-id', item.champion);

    

    const favoriteCell = document.createElement('td');
    const starSpan = document.createElement('span');
    starSpan.className = 'favorite-star';
    let favorites = JSON.parse(localStorage.getItem(favoriteKey)) || {};
    const favKey = `${item.championImageName}-${item.lane}`;
    starSpan.textContent = favorites[favKey] ? filledStar : emptyStar;  // default to not favorite
    starSpan.style.cursor = 'pointer';
    starSpan.style.fontSize = '24px';
    //starSpan.style.color = '#FFD700';  // gold color
    favoriteCell.appendChild(starSpan);

    // Toggle favorite status on click
    starSpan.addEventListener('click', (event) => {
      event.stopPropagation();
      const favorites = JSON.parse(localStorage.getItem(favoriteKey)) || {};
      const favKey = `${item.championImageName}-${item.lane}`;
    
      if (starSpan.textContent === emptyStar) {
        starSpan.textContent = filledStar;
        favorites[favKey] = true;
      } else {
        starSpan.textContent = emptyStar;
        delete favorites[favKey];
      }
    
      localStorage.setItem(favoriteKey, JSON.stringify(favorites));
    });

    // Create the lane icon cell (we'll add SVG based on the lane)
    const laneCell = document.createElement('td');
    const laneSvg = laneSvgs[item.lane] || '';  // Get the correct SVG for the lane

    // Wrap the SVG in a span and style it to control its size
    const spanWrapper = document.createElement('span');
    spanWrapper.style.display = 'inline-block';
    spanWrapper.style.width = '35px';  // Control width
    spanWrapper.style.height = '35px';  // Control height
    spanWrapper.innerHTML = laneSvg;  // Insert the SVG into the span

    laneCell.appendChild(spanWrapper);

    // Create the champion cell with image and name
    const championCell = document.createElement('td');
    const championImage = document.createElement('img');
    championImage.src = `https://ddragon.leagueoflegends.com/cdn/`+patch+`.1/img/champion/${item.championImageName}.png`;
    championImage.alt = item.champion;
    championImage.classList.add('champion-image');
    
    
    const championText = document.createTextNode(item.champion);
    championCell.appendChild(championImage);
    championCell.appendChild(championText);
    const infoSpan = document.createElement('span');
    infoSpan.className = 'info-icon';
    infoSpan.title = 'This is more information';
    infoSpan.textContent = 'i';
    infoSpan.addEventListener('click', (event) => {
      event.stopPropagation(); // prevents the event from reaching parent elements
      preview(row);
    });
    championCell.appendChild(infoSpan);

    //BlindabilityScore
    const mvarScore = item.matchupVarScore;
    const svarScore = item.synergieVarScore;
    const blindScore = Math.floor((mvarScore+svarScore)/2)
    const blindrCell = document.createElement('td');
    blindrCell.textContent = blindScore;
    blindrCell.style.color = getColorFromScore(blindScore);
    //Create Matchup variance cell
    
    const mvarCell = document.createElement('td');
    mvarCell.textContent = mvarScore;
    mvarCell.style.color = getColorFromScore(mvarScore);

    //Create Synergie variance cell
    const svarCell = document.createElement('td');
    svarCell.textContent = svarScore;
    svarCell.style.color = getColorFromScore(svarScore);

    // Create the winrate cell
    const winrate = item.winrate;
    const winrateCell = document.createElement('td');
    winrateCell.textContent = winrate;

    //pickrate cell
    const pickrate = item.pickrate;
    const pickrateCell = document.createElement('td');
    pickrateCell.textContent = pickrate;

    winrateCell.style.color = rgbString(winrate2color(parseFloat(winrate.slice(0, -1))));

    // Append cells to the row
    row.append(favoriteCell);
    row.appendChild(laneCell);
    row.appendChild(championCell);
    row.appendChild(blindrCell);
    row.appendChild(mvarCell);
    row.appendChild(svarCell);
    row.appendChild(winrateCell);
    row.appendChild(pickrateCell);

    row.addEventListener('click', () => {
      // Get the champion name (you need to store it somehow in each <tr>)
      const championName = row.getAttribute('data-champion');
      const laneType = row.getAttribute('data-lane');
      const championId = row.getAttribute('data-id');

      // A ban card is selected: ban this champion instead of picking it
      const selectedBan = document.querySelector('.card.selected');
      if (selectedBan && championName) {
        setBan(selectedBan, championId, championName);
        clear_search_input();
        getRecos();
        return;
      }
      
      // Find the currently selected pick
      const selectedPick = document.querySelector('.team-item.selected') || selectNextAvailablePick(true);
  
      if (championName && selectedPick) {
        // Set the background image
        const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`;
        selectedPick.style.backgroundImage = `linear-gradient(rgba(25, 25, 25, 0.8) 0%, rgba(0, 0, 0, 0) 50%, rgba(25, 25, 25, 0.8) 100%), url('${splashUrl}')`;
        selectedPick.style.backgroundSize = 'cover';
        selectedPick.style.backgroundPosition = 'center 20%';
        selectedPick.style.backgroundRepeat = 'no-repeat';
  
        // Update the text inside the pick
        const pickLabel = selectedPick.querySelector('.pick-label'); // assuming your text is inside a span or div with class "pick-label"
        if (pickLabel) {
          pickLabel.textContent = championId;
        }
        pickLabel.setAttribute('data-id',championName);
        addLaneIcon(laneType, selectedPick);
        addIndividualWinrate(50, selectedPick);
        
        picks.forEach(p => p.classList.remove('selected'));
        picks.forEach(p => p.classList.remove('blinking'));
        const isAlly = selectedPick.classList.contains('ally');
        selectNextAvailablePick(isAlly);
        topBtn.classList.remove('active');
        jungleBtn.classList.remove('active');
        midBtn.classList.remove('active');
        botBtn.classList.remove('active');
        supportBtn.classList.remove('active');

        clear_search_input();
        analyseTeams();
        getRecos();
      }
    });

    // Append the row to the table body
    tableBody.appendChild(row);
  });
  sortTable(6,change_order=false);
}

// FILTER SETTINGS (min playrate + Champion's Strength)
const minPlayrateInput = document.getElementById('min-playrate');
const strengthToggle = document.getElementById('strength-toggle');
const settingsKey = 'draftSettings';

function getSettings() {
  let minPlayrate = parseFloat(minPlayrateInput.value);
  if (isNaN(minPlayrate) || minPlayrate < 0) minPlayrate = 0;
  if (minPlayrate > 100) minPlayrate = 100;
  return {
    min_playrate: minPlayrate,
    use_champion_strength: strengthToggle.checked
  };
}

function saveSettings() {
  try {
    localStorage.setItem(settingsKey, JSON.stringify(getSettings()));
  } catch (e) { /* storage unavailable: ignore */ }
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey));
    if (saved) {
      minPlayrateInput.value = saved.min_playrate ?? 0;
      strengthToggle.checked = saved.use_champion_strength ?? true;
    }
  } catch (e) { /* corrupted storage: keep defaults */ }
}
loadSettings(); // before the first analyseTeams()/getRecos() call

// Playrate: wait for the user to stop typing before querying the server
let playrateTimer;
minPlayrateInput.addEventListener('input', () => {
  clearTimeout(playrateTimer);
  playrateTimer = setTimeout(() => {
    saveSettings();
    getRecos();
  }, 400);
});

// Champion's Strength: affects both the team analysis and the recommendations
strengthToggle.addEventListener('change', () => {
  saveSettings();
  analyseTeams();
  getRecos();
  const modalOverlayEl = document.getElementById('modalOverlay');
  if (modalOverlayEl && modalOverlayEl.style.display !== 'none') {
    updateGraph(); // refresh the open modal's graph too
  }
});

function getTeams(){
  const team1Items = document.querySelectorAll(".team-item.ally");
  const team2Items = document.querySelectorAll(".team-item.opponent");

  let selectedChampions = { team1: [], team2: [] };
  team1Items.forEach((item, index) => {
    const pickLabel = item.querySelector(".pick-label");
    if (pickLabel) {
      const champion = pickLabel.textContent.trim();
      if(!champion.startsWith('PICK')){
        const laneIcon = item.querySelector(".lane-icon");
        const lane = laneIcon.getAttribute('data-lane');
        selectedChampions.team1.push({ lane, champion });
      }
    }
  });

  team2Items.forEach((item, index) => {
    const pickLabel = item.querySelector(".pick-label");
    if (pickLabel) {
      const champion = pickLabel.textContent.trim();
      if(!champion.startsWith('PICK')){
        const laneIcon = item.querySelector(".lane-icon");
        const lane = laneIcon.getAttribute('data-lane');
        selectedChampions.team2.push({ lane, champion });
      }
    }
  });
  return selectedChampions
}

function analyseTeams(modalValues = undefined) {
  teams = getTeams();
  fetch('/analyse', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...teams, use_champion_strength: getSettings().use_champion_strength })
  })
  .then(response => response.json())
  .then(data => {
      new_team1_wr = data.team_1_winrate.toFixed(2);
      prev_team1_wr = parseFloat(ally_winrate_div.textContent);
      if(new_team1_wr!=prev_team1_wr){
        animateFloat({element: ally_winrate_div, startValue: prev_team1_wr, endValue: new_team1_wr, duration: 3000});
      }
      new_team2_wr = data.team_2_winrate.toFixed(2);
      prev_team2_wr = parseFloat(opponent_winrate_div.textContent);
      if(new_team2_wr!=prev_team2_wr){
        animateFloat({element: opponent_winrate_div, startValue: prev_team2_wr, endValue: new_team2_wr, duration: 3000});
      }
      //document.getElementById("team2-winrate").textContent = data.team_2_winrate.toFixed(2);
      ind_winrate = data.indiv_winrates;//
      update_indiv_winrates(ind_winrate);
      renderAnalysis(data);
      if (modalValues != undefined) {
        [championId, championName, laneType, team, team,selectedPick] = modalValues;
        const data = ind_winrate[team][championName];
        if (team == "team1"){
          team = "blue";
        }
        else{
          team = "red";
        }

        populateChampionModal(championName,championId,laneType,team,data);
        closeHandler = function() {removeChamp(selectedPick);}
        openModal();
      }
  });
}

function update_indiv_winrates(indiv_winrates){
  team1_wr = indiv_winrates['team1'];
  if(Object.keys(team1_wr).length != 0){
    const teamItems = document.querySelectorAll(`.team-item.ally`); 
    teamItems.forEach(pick => {
      // Reset the pick label
      const label = pick.querySelector('.pick-label').innerText;
      if(label in team1_wr){
        addIndividualWinrate(team1_wr[label]['ind_winrate'], pick);
      }
    });
  }
  team2_wr = indiv_winrates['team2'];
  if(Object.keys(team2_wr).length != 0){
    const teamItems = document.querySelectorAll(`.team-item.opponent`); 
    teamItems.forEach(pick => {
      // Reset the pick label
      const label = pick.querySelector('.pick-label').innerText;
      if(label in team2_wr){
        addIndividualWinrate(team2_wr[label]['ind_winrate'], pick);
      }
    });
  }

}

function getRecos() {
  teams = getTeams()
  const selectedPick = document.querySelector('.team-item.selected');
  const selectedBanCard = document.querySelector('.card.selected');
  if (selectedPick && selectedPick.classList.contains('ally')) {
    ispicking = true;
  } else if (!selectedPick && selectedBanCard && selectedBanCard.dataset.side === 'blue') {
    ispicking = true;
  } else{
    ispicking = false;
  }
  teams['team1ispicking'] = ispicking;
  fetch('/reco', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...teams, ...getSettings(), bans: getBans() })
  })
  .then(response => response.json())
  .then(data => {
      populateDraftTable(data.champion_list);
      filterTable();
  });
}

// Interpolate color with ease-out sine
function interpolateColorEaseOutSine(color1, color2, factor) {
  const result = color1.slice();
  const easedFactor = easeOutSine(factor); // Apply ease-out sine to factor

  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(color1[i] + easedFactor * (color2[i] - color1[i]));
  }
  return result;
}

function easeOutSine(t) {
  return Math.sin(t * (Math.PI / 2));
}

function winrate2color(winrate){
  let color;

  if (winrate === 50) {
    // If the value is exactly 50, show white
    color = [255, 255, 255];
  } else if (winrate < 50) {
    if(winrate<49.5){
      // For values below 50, transition from light red to red
      const t = (49.5 - winrate) / 49.5; // 0 to 1 range for white -> red
      const lightRed = [255, 76, 76]; // #FF746C
      const red = [255, 0, 0]; // #FF0000
      color = interpolateColorEaseOutSine(lightRed, red, t); // Apply ease-out sine interpolation
    }else{
      // For values below 50, transition from light red to red
      const t = (50 - winrate) / 0.5; // 0 to 1 range for white -> red
      const lightRed = [255, 76, 76]; // #FF746C
      const white = [255, 255, 255]; // #FF0000
      color = interpolateColorEaseOutSine(white, lightRed, t); // Apply ease-out sine interpolation
      }
    
  } else {
    if(winrate>50.5){
      // For values above 50, transition from light blue to blue
      const t = (winrate - 50.5) / (49.5); // 0 to 1 range for light blue -> blue
      const lightBlue = [119, 181, 254]; // #77B5FE
      const blue = [0, 0, 255]; // #0000FF
      color = interpolateColorEaseOutSine(lightBlue, blue, t); // Apply ease-out sine interpolation
    }else{
      // For values above 50, transition from light blue to blue
      const t = (winrate - 50) / (0.5); // 0 to 1 range for light blue -> blue
      const lightBlue = [119, 181, 254]; // #77B5FE
      const white = [255, 255, 255]; // #0000FF
      color = interpolateColorEaseOutSine(white, lightBlue, t); // Apply ease-out sine interpolation
    }
  }
  return color
}

function easeOutExpoStrong(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -12 * t);
}

function capitalizeFirstLetter(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

//YUGIOH ANIMATION :)
function animateFloat({element, startValue, endValue, duration = 3500}) {
  const animationStartTime = performance.now();

  function animate(currentTime) {
      const elapsed = currentTime - animationStartTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = easeOutExpoStrong(progress);
      const value = startValue + (endValue - startValue) * easedProgress;

      element.textContent = value.toFixed(2);

      // Determine color
      let color = winrate2color(value);
      element.style.color = rgbString(color);
      if (progress < 1) {
          requestAnimationFrame(animate);
      }
  }
  requestAnimationFrame(animate);
}

// BANS: 10 cards (5 per side). A card can be selected (blinking) like a pick,
// then a click on a champion in the table bans it. Click on a banned card to unban.
function getBans() {
  return Array.from(document.querySelectorAll('.card'))
    .filter(c => c.dataset.champion)
    .map(c => c.dataset.champion);
}

// Shown when every slot is filled: there is nowhere to put the clicked champion
function showDraftFullHint() {
  let el = document.getElementById('draft-hint');
  if (!el) {
    el = document.createElement('div');
    el.id = 'draft-hint';
    el.style.cssText = 'position:fixed;left:50%;bottom:30px;transform:translateX(-50%);background:#2a2a2c;color:#fff;border:1px solid #3a3a3c;border-radius:6px;padding:12px 18px;font-size:18px;z-index:2000;box-shadow:0 2px 10px rgba(0,0,0,.5)';
    document.body.appendChild(el);
  }
  el.textContent = 'All 10 slots are filled: remove a champion (\u22ee menu) to pick another one.';
  el.style.display = 'block';
  clearTimeout(showDraftFullHint.timer);
  showDraftFullHint.timer = setTimeout(() => { el.style.display = 'none'; }, 3500);
}

function clearBanSelection() {
  document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected', 'blinking'));
}

function selectBanCard(card) {
  clearBanSelection();
  // a ban card and a pick can't be selected at the same time
  picks.forEach(p => p.classList.remove('selected', 'blinking'));
  card.classList.add('selected', 'blinking');
}

// displayName: champion name as used everywhere else (e.g. "Vel'Koz"); imageName: ddragon id (e.g. "Velkoz")
function setBan(card, displayName, imageName) {
  card.dataset.champion = displayName;
  card.dataset.image = imageName;
  card.style.backgroundImage = `url('https://ddragon.leagueoflegends.com/cdn/${patch}.1/img/champion/${imageName}.png')`;
  card.style.backgroundSize = 'cover';
  card.style.backgroundPosition = 'center';
  card.style.backgroundRepeat = 'no-repeat';
  card.classList.add('has-ban');
  card.classList.remove('selected', 'blinking');
  card.title = `${displayName} - click to remove the ban`;

  // go on with the next empty ban card of the same side, otherwise with the next pick
  const side = card.dataset.side;
  const next = Array.from(document.querySelectorAll(`.card[data-side="${side}"]`)).find(c => !c.dataset.champion);
  if (next) {
    next.classList.add('selected', 'blinking');
  } else {
    selectNextAvailablePick(side === 'blue');
  }
}

function removeBan(card) {
  delete card.dataset.champion;
  delete card.dataset.image;
  card.style.backgroundImage = '';
  card.style.backgroundSize = '';
  card.style.backgroundPosition = '';
  card.style.backgroundRepeat = '';
  card.classList.remove('has-ban', 'selected', 'blinking');
  card.removeAttribute('title');
}

function handleBanCardClick(event) {
  const card = event.currentTarget;
  if (card.dataset.champion) {          // banned champion: unban it (back in the pool)
    removeBan(card);
    getRecos();
  } else if (card.classList.contains('selected')) {   // selected empty card: deselect
    card.classList.remove('selected', 'blinking');
  } else {
    selectBanCard(card);
  }
}

// ANALYSIS TAB (summary of each category + recap per champion)
const analysisIcons = {
  champion: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z"/></svg>`,
  matchup: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/></svg>`,
  duo: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.6 3-6 7-6s7 2.4 7 6z"/><circle cx="17" cy="9" r="2.8" fill-opacity=".7"/><path d="M17.5 14c2.8 0 4.5 2 4.5 5h-4.2c-.1-2-.8-3.6-2-4.6.5-.3 1-.4 1.7-.4z" fill-opacity=".7"/></svg>`,
  winrate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M6 16l4-5 3 3 5-7"/><path d="M15 7h3v3"/></svg>`
};

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function avgOf(values) {
  const v = values.filter(x => typeof x === 'number' && !isNaN(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function fmtWr(v) {
  return (typeof v === 'number' && !isNaN(v)) ? v.toFixed(2) : '—';
}

function wrColor(v) {
  return (typeof v === 'number' && !isNaN(v)) ? rgbString(winrate2color(v)) : '#aaa';
}

// Champions currently picked in a team (read from the pick cards, in display order)
function getPickedChampions(teamClass) {
  const out = [];
  document.querySelectorAll(`.team-item.${teamClass}`).forEach(item => {
    const label = item.querySelector('.pick-label');
    const laneIcon = item.querySelector('.lane-icon');
    if (!label || !laneIcon) return;
    const name = label.textContent.trim();
    if (name.startsWith('PICK')) return;
    out.push({ name, image: label.getAttribute('data-id'), lane: laneIcon.getAttribute('data-lane') });
  });
  return out;
}

let analysisMatchupMode = 'h2h'; // 'h2h' (same lane only) | 'all'
let lastAnalysisData = null;

// Head 2 Head / All toggle (event delegation: the tab content is re-rendered each time)
const analysisContentEl = document.getElementById('analysis-content');
if (analysisContentEl) {
  analysisContentEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-an-mode]');
    if (!btn) return;
    analysisMatchupMode = btn.getAttribute('data-an-mode');
    if (lastAnalysisData) renderAnalysis(lastAnalysisData);
  });
}

function laneSvgFor(lane) {
  return laneSvgs[capitalizeFirstLetter(String(lane || ''))] || '';
}

function champCellHtml(imageName, name) {
  const img = `https://ddragon.leagueoflegends.com/cdn/${patch}.1/img/champion/${encodeURIComponent(imageName || '')}.png`;
  return `<div class="an-champ-cell"><img src="${img}" alt="" /><span>${escHtml(name)}</span></div>`;
}

// Matchups: Blue Side champions (left) vs Red Side champions (right)
function buildMatchupsHtml(blue) {
  const mode = analysisMatchupMode;
  const laneOrder = lane => {
    const k = LANES.indexOf(String(lane).toLowerCase());
    return k < 0 ? 99 : k;
  };

  let body = '';
  let count = 0;
  blue.picks.forEach((p, i) => {
    const details = (blue.stats[i] || {}).matchup_details || {};
    Object.entries(details)
      .filter(([, d]) => typeof d.winrate === 'number' &&
        (mode === 'all' || String(d.lane).toLowerCase() === String(p.lane).toLowerCase()))
      .sort((a, b) => laneOrder(a[1].lane) - laneOrder(b[1].lane))
      .forEach(([oppName, d]) => {
        const wr = d.winrate;
        const cat = escHtml(d.matchup || '');
        count++;
        body += `
          <tr>
            <td class="an-role">${laneSvgFor(p.lane)}</td>
            <td class="an-champ">${champCellHtml(p.image, p.name)}</td>
            <td style="color:${wrColor(wr)}">${fmtWr(wr)}</td>
            <td class="an-cat ${cat}">${cat.toUpperCase()}</td>
            <td class="an-role">${laneSvgFor(d.lane)}</td>
            <td class="an-champ">${champCellHtml(d.name_id, oppName)}</td>
            <td style="color:${wrColor(100 - wr)}">${fmtWr(100 - wr)}</td>
          </tr>`;
      });
  });

  if (count === 0) {
    body = `<tr><td colspan="7" class="an-empty">No matchup yet</td></tr>`;
  } else {
    const left = blue.ov.matchups;
    if (typeof left === 'number') {
      const favored = left > 50;
      body += `
          <tr class="an-total-row">
            <td colspan="3" class="an-sum" style="color:${wrColor(left)}">${fmtWr(left)}</td>
            <td class="an-arrow ${favored ? 'loss-arrow' : 'win-arrow'}">${favored ? '←' : '→'}</td>
            <td colspan="3" class="an-sum" style="color:${wrColor(100 - left)}">${fmtWr(100 - left)}</td>
          </tr>`;
    }
  }

  const btn = (m, label) =>
    `<button type="button" class="an-mode-btn${mode === m ? ' active' : ''}" data-an-mode="${m}">${label}</button>`;

  return `
    <div class="an-section-header">
      <div>
        <h3 class="an-overview-title">Matchups</h3>
        <div class="an-section-sub">Champion winrates normalized</div>
      </div>
      <div class="an-mode-toggle">${btn('h2h', 'Head 2 Head')}${btn('all', 'All')}</div>
    </div>
    <table class="an-table an-matchups">
      <thead><tr><th>Role</th><th>Blue Side</th><th>Winrate</th><th>Matchup</th><th>Role</th><th>Red Side</th><th>Winrate</th></tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}

// Duos of one side (each pair listed once)
function buildDuosHtml(r) {
  const seen = new Set();
  let body = '';
  let count = 0;
  r.picks.forEach((p, i) => {
    const syn = (r.stats[i] || {}).synergie_details || {};
    Object.entries(syn).forEach(([partner, d]) => {
      const key = [p.name, partner].sort().join('|');
      if (seen.has(key) || typeof d.winrate !== 'number') return;
      seen.add(key);
      count++;
      body += `
          <tr>
            <td class="an-role">${laneSvgFor(p.lane)}</td>
            <td class="an-champ">${champCellHtml(p.image, p.name)}</td>
            <td class="an-role">${laneSvgFor(d.lane)}</td>
            <td class="an-champ">${champCellHtml(d.name_id, partner)}</td>
            <td style="color:${wrColor(d.winrate)}">${fmtWr(d.winrate)}</td>
          </tr>`;
    });
  });

  if (count === 0) {
    body = `<tr><td colspan="5" class="an-empty">No duo yet</td></tr>`;
  } else if (typeof r.ov.duos === 'number') {
    body += `
          <tr class="an-total-row">
            <td colspan="4"></td>
            <td class="an-sum-left" style="color:${wrColor(r.ov.duos)}">${fmtWr(r.ov.duos)}</td>
          </tr>`;
  }

  return `
      <div class="an-overview">
        <h3 class="an-overview-title">${r.title} Duos</h3>
        <div class="an-section-sub">Champion winrates normalized</div>
        <table class="an-table an-${r.color}">
          <thead><tr><th>Role</th><th>Champion</th><th>Role</th><th>Champion</th><th>Winrate</th></tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;
}

 
// ---------- START ----------
// SCALING: team winrate over game length. Points come from /analyse (data.scaling)
const SCALING_LABELS = ['0-15', '15-20', '20-25', '25-30', '30-35','35-40','40+'];
 
// Accepts [v1, ..., v5] or { "0-20": v1, "20-25": v2, ... }
function normalizeScaling(raw) {
  let labels, values;
  if (Array.isArray(raw)) {
    values = raw.map(Number);
    labels = values.map((_, i) => SCALING_LABELS[i] ?? String(i + 1));
  } else if (raw && typeof raw === 'object') {
    let keys = Object.keys(raw);
    // Flask sorts JSON keys alphabetically: put them back in game-length order
    if (keys.every(k => !isNaN(parseFloat(k)))) keys.sort((a, b) => parseFloat(a) - parseFloat(b));
    labels = keys;
    values = keys.map(k => Number(raw[k]));
  } else {
    return null;
  }
  return values.length && values.every(v => !isNaN(v)) ? { labels, values } : null;
}
 
function buildScalingHtml(data) {
  const sc = data.scaling || {};
  const ov = data.team_overview || {};
  const blue = normalizeScaling(sc.team1 ?? sc.team_1 ?? (ov.team1 || {}).scaling);
  const red = normalizeScaling(sc.team2 ?? sc.team_2 ?? (ov.team2 || {}).scaling);
  if (!blue && !red) return '';
 
  const series = [
    { s: blue, color: '#3b82f6', name: 'Blue Side' },
    { s: red, color: '#ef4444', name: 'Red Side' }
  ].filter(x => x.s);
 
  const labels = series.reduce((acc, x) => x.s.labels.length > acc.length ? x.s.labels : acc, []);
  const n = labels.length;
  const all = series.flatMap(x => x.s.values).concat(50);
  let yMin = Math.floor(Math.min(...all));
  let yMax = Math.ceil(Math.max(...all));
  if (yMax - yMin < 2) { yMin -= 1; yMax += 1; }
  const step = Math.ceil((yMax - yMin) / 8);
 
  const W = 620, H = 300, L = 44, R = 24, T = 16, B = 34;
  const pw = W - L - R, ph = H - T - B;
  const px = i => n === 1 ? L + pw / 2 : L + (i * pw) / (n - 1);
  const py = v => T + ph - ((v - yMin) / (yMax - yMin)) * ph;
 
  let grid = '';
  for (let v = yMin; v <= yMax; v += step) {
    const isMid = v === 50;
    grid += `<line x1="${L}" x2="${W - R}" y1="${py(v)}" y2="${py(v)}" stroke="${isMid ? '#ddd' : '#3a3a3c'}" stroke-width="1"/>`;
    grid += `<text x="${L - 8}" y="${py(v) + 6}" text-anchor="end" fill="#fff" font-size="18" font-weight="700">${v}</text>`;
  }
  labels.forEach((lab, i) => {
    grid += `<line x1="${px(i)}" x2="${px(i)}" y1="${T}" y2="${T + ph}" stroke="#3a3a3c" stroke-width="1"/>`;
    grid += `<text x="${px(i)}" y="${H - 8}" text-anchor="middle" fill="#fff" font-size="18" font-weight="700">${escHtml(lab)}</text>`;
  });
 
  const lines = series.map(({ s, color, name }) => {
    const pts = s.values.map((v, i) => `${px(i)},${py(v)}`).join(' ');
    const dots = s.values.map((v, i) =>
      `<circle cx="${px(i)}" cy="${py(v)}" r="10" fill="transparent"><title>${name} - ${escHtml(labels[i] ?? '')}: ${v.toFixed(2)}</title></circle>`
    ).join('');
    return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>${dots}`;
  }).join('');
 
  return `
    <div class="an-section-header">
      <div>
        <h3 class="an-overview-title">Scaling</h3>
        <div class="an-section-sub">Team winrate normalized</div>
      </div>
    </div>
    <div class="an-scaling">
      <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Team winrate by game length">${grid}${lines}</svg>
    </div>`;
}
 
// ---------- END ----------

// DAMAGE DISTRIBUTION: physical / magical / true damage share of each team (data.damage from /analyse)
const DAMAGE_TYPES = [
  { key: 'physical', label: 'Physical', aliases: ['physical', 'physical_damage', 'phys', 'ad'] },
  { key: 'magical',  label: 'Magical',  aliases: ['magical', 'magical_damage', 'magic', 'magic_damage', 'ap'] },
  { key: 'true',     label: 'True',     aliases: ['true', 'true_damage', 'truedamage'] }
];
 
// Accepts { physical, magical, true } (several key spellings) or [physical, magical, true].
// Values can be percentages, fractions or raw damage: they are re-scaled to sum to 100.
function normalizeDamage(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const values = DAMAGE_TYPES.map((t, i) => {
    if (Array.isArray(raw)) return Number(raw[i]);
    const alias = t.aliases.find(a => raw[a] !== undefined);
    return alias ? Number(raw[alias]) : NaN;
  });
  if (values.every(v => isNaN(v))) return null;
  const clean = values.map(v => (isNaN(v) || v < 0) ? 0 : v);
  const total = clean.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;
  return clean.map(v => (v / total) * 100);
}
 
function buildDamageHtml(data) {
  const dmg = data.damage ?? data.damage_distribution ?? {};
  const ov = data.team_overview || {};
  const t1 = ov.team1 || {}, t2 = ov.team2 || {};
  const blue = normalizeDamage(dmg.team1 ?? dmg.team_1 ?? t1.damage ?? t1.damage_distribution);
  const red = normalizeDamage(dmg.team2 ?? dmg.team_2 ?? t2.damage ?? t2.damage_distribution);
  if (!blue && !red) return '';
 
  const row = (title, color, pcts) => {
    if (!pcts) {
      return `<div class="an-damage-row"><div class="an-damage-team" style="color:${color}">${title}</div><div class="an-damage-bar an-damage-empty">No data</div></div>`;
    }
    const segs = DAMAGE_TYPES.map((t, i) => pcts[i] <= 0 ? '' : `
        <div class="an-damage-seg an-dmg-${t.key}" style="width:${pcts[i]}%" title="${t.label}: ${pcts[i].toFixed(1)}%">${pcts[i] >= 7 ? Math.round(pcts[i]) + '%' : ''}</div>`).join('');
    return `<div class="an-damage-row"><div class="an-damage-team" style="color:${color}">${title}</div><div class="an-damage-bar">${segs}</div></div>`;
  };
 
  const legend = DAMAGE_TYPES.map(t =>
    `<span><i class="an-legend-dot an-dmg-${t.key}"></i>${t.label}</span>`).join('');
 
  return `
    <div class="an-section-header">
      <div>
        <h3 class="an-overview-title">Damage Distribution</h3>
        <div class="an-section-sub">Share of each team's damage</div>
      </div>
    </div>
    <div class="an-damage">
      ${row('Blue Side', '#3b82f6', blue)}
      ${row('Red Side', '#ef4444', red)}
      <div class="an-damage-legend">${legend}</div>
    </div>`;
}


function renderAnalysis(data) {
  const target = document.getElementById('analysis-content');
  if (!target || !data || !data.indiv_winrates) return;
  lastAnalysisData = data;

  const sides = [
    { color: 'blue', title: 'Blue Side', teamClass: 'ally', indiv: data.indiv_winrates.team1 || {}, teamWr: data.team_1_winrate },
    { color: 'red',  title: 'Red Side',  teamClass: 'opponent', indiv: data.indiv_winrates.team2 || {}, teamWr: data.team_2_winrate }
  ];

  const rows = sides.map(side => {
    const picks = getPickedChampions(side.teamClass);
    const stats = picks.map(p => side.indiv[p.name] || {});
    // Team values sent by the server: data.team_overview.team1 / team2
    // ({champions, matchups, duos, total}). Falls back to the average of the picks
    // (and to team_X_winrate for the total) when a value is missing.
    const to = (data.team_overview || {})[side.color === 'blue' ? 'team1' : 'team2'] || {};
    const num = (v, fallback) => (typeof v === 'number' && !isNaN(v)) ? v : fallback;
    const avgBase = avgOf(stats.map(s => s.champ_winrate));
    const avgMatchup = avgOf(stats.map(s => s.matchups_winrate));
    const avgDuo = avgOf(stats.map(s => s.duos_winrate));
    
    return {
      ...side,
      picks,
      stats,
      // banner: Champions / Matchups / Duos / Winrate
      ov: {
        champions: num(to.champions, avgBase),
        matchups: num(to.matchups, avgMatchup),
        duos: num(to.duos, avgDuo),
        winrate: num(to.total, side.teamWr)
      },
      // last row of the table: Base / Matchup / Duo / Total (same team values)
      tot: {
        base: num(to.champions, avgBase),
        matchup: num(to.matchups, avgMatchup),
        duo: num(to.duos, avgDuo),
        total: num(to.total, side.teamWr)
      }
    };
  });

  const statBox = (icon, title, value) => `
    <div class="an-stat">
      <div class="an-stat-icon">${icon}</div>
      <div class="an-stat-text">
        <div class="an-stat-title">${title}</div>
        <div class="an-stat-value" style="color:${wrColor(value)}">${fmtWr(value)}</div>
      </div>
    </div>`;

  const summaryHtml = rows.map(r => `
    <div class="an-stats an-${r.color}">
      ${statBox(analysisIcons.champion, 'Champions', r.ov.champions)}
      ${statBox(analysisIcons.matchup, 'Matchups', r.ov.matchups)}
      ${statBox(analysisIcons.duo, 'Duos', r.ov.duos)}
      ${statBox(analysisIcons.winrate, 'Winrate', r.ov.winrate)}
    </div>`).join('');

  const overviewHtml = rows.map(r => {
    const body = r.picks.length === 0
      ? `<tr><td colspan="6" class="an-empty">No champion picked</td></tr>`
      : r.picks.map((p, i) => {
          const s = r.stats[i];
          return `
          <tr>
            <td class="an-role">${laneSvgs[p.lane] || ''}</td>
            <td class="an-champ">${champCellHtml(p.image, p.name)}</td>
            <td style="color:${wrColor(s.champ_winrate)}">${fmtWr(s.champ_winrate)}</td>
            <td style="color:${wrColor(s.matchups_winrate)}">${fmtWr(s.matchups_winrate)}</td>
            <td style="color:${wrColor(s.duos_winrate)}">${fmtWr(s.duos_winrate)}</td>
            <td style="color:${wrColor(s.ind_winrate)}">${fmtWr(s.ind_winrate)}</td>
          </tr>`;
        }).join('') + `
          <tr class="an-total-row">
            <td></td><td></td>
            <td style="color:${wrColor(r.tot.base)}">${fmtWr(r.tot.base)}</td>
            <td style="color:${wrColor(r.tot.matchup)}">${fmtWr(r.tot.matchup)}</td>
            <td style="color:${wrColor(r.tot.duo)}">${fmtWr(r.tot.duo)}</td>
            <td style="color:${wrColor(r.tot.total)}">${fmtWr(r.tot.total)}</td>
          </tr>`;
    return `
      <div class="an-overview">
        <h3 class="an-overview-title">${r.title} Overview</h3>
        <table class="an-table an-${r.color}">
          <thead><tr><th>Role</th><th>Champion</th><th>Base</th><th>Matchup</th><th>Duo</th><th>Total</th></tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;
  }).join('');

  const duosHtml = rows.map(buildDuosHtml).join('');

  target.innerHTML = `${summaryHtml}
    <div class="an-overviews">${overviewHtml}</div>
    ${buildMatchupsHtml(rows[0])}
    <div class="an-overviews an-duos">${duosHtml}</div>
    ${buildScalingHtml(data)}
    ${buildDamageHtml(data)}`;
    
}

//GESTION DES TABS
const tabDraft = document.getElementById('tab-draft');
const tabAnalysis = document.getElementById('tab-analysis');
const draftContent = document.getElementById('draft-content');
const analysisContent = document.getElementById('analysis-content');

tabDraft.addEventListener('click', () => {
  tabDraft.classList.add('active-tab');
  tabAnalysis.classList.remove('active-tab');
  draftContent.style.display = 'block';
  analysisContent.style.display = 'none';
});

tabAnalysis.addEventListener('click', () => {
  tabAnalysis.classList.add('active-tab');
  tabDraft.classList.remove('active-tab');
  draftContent.style.display = 'none';
  analysisContent.style.display = 'block';
});


//SORT TABLE
function sortTable(columnIndex,change_order=true) {
  const table = document.querySelector('.draft-table table');
  const rows = Array.from(table.rows).slice(1); // exclude header
  if (rows.length === 0) return; // nothing to sort (e.g. min playrate filtered everything out)
  // "10.25%" -> 10.25 ; returns null when the text is not a number (e.g. champion names)
  const toNum = text => {
    const n = parseFloat(String(text).replace('%', '').replace(',', '.'));
    return isNaN(n) ? null : n;
  };
  const isNumeric = toNum(rows[0].cells[columnIndex].innerText) !== null;
  const hasAttribute = table.hasAttribute(`data-sort-${columnIndex}`);
  if(change_order && !hasAttribute){
    change_order = false;
  }
  // Toggle sort direction
  const currentDirection = table.getAttribute(`data-sort-${columnIndex}`) || 'desc';
  const newDirection = change_order  ? (currentDirection === 'asc' ? 'desc' : 'asc')  : currentDirection;
  [...table.attributes].forEach(attr => {
    if (attr.name.startsWith('data-sort-')) {
      table.removeAttribute(attr.name);
    }
  });
  table.setAttribute(`data-sort-${columnIndex}`, newDirection);

  rows.sort((a, b) => {
    const aFav = a.cells[0].innerText.trim() === '★' ? 1 : 0;
    const bFav = b.cells[0].innerText.trim() === '★' ? 1 : 0;

    // First sort by favorite (descending: filled stars first)
    if (aFav !== bFav) {
      return bFav - aFav;
    }

    // Then sort by the selected column
    const aText = a.cells[columnIndex].innerText.trim();
    const bText = b.cells[columnIndex].innerText.trim();

    if (isNumeric) {
      const aNum = toNum(aText);
      const bNum = toNum(bText);
      // rows without a number always go last
      if (aNum === null || bNum === null) return (aNum === null) - (bNum === null);
      return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
    } else {
      return newDirection === 'asc'
        ? aText.localeCompare(bText)
        : bText.localeCompare(aText);
    }
  });

  // Re-insert sorted rows
  const tbody = table.tBodies[0];
  rows.forEach(row => tbody.appendChild(row));
}

const LANES = ['top','middle','jungle','bottom','support']

//MODAL
function populateChampionModal(championName,champ_id, championLane,champion_team, champion_data) {
  // Populate champion profile section
  document.querySelector('.champion-name').textContent = championName;
  document.querySelector('.champion-role').textContent = `${champion_team} ${championLane}`;
  
  const portraitImg = document.querySelector('.champion-portrait img');
  if (portraitImg) {
      portraitImg.src = `https://ddragon.leagueoflegends.com/cdn/`+patch+`.1/img/champion/${champ_id}.png`;
      portraitImg.alt = `${championName} Champion Portrait`;
  }

  const link_button = document.querySelector('.lolalytics-button');
  link_button.onclick = function() {window.open(`https://lolalytics.com/lol/${championName.toLowerCase()}/build/`, '_blank');};
  
  //TODO
  // if (championData.portraitBgColor) {
  //     const portrait = document.querySelector('.champion-portrait');
  //     portrait.style.backgroundColor = championData.portraitBgColor;
  //     portrait.style.borderColor = championData.portraitBgColor;
  // }
  
  // Populate stats section
  const statValues = document.querySelectorAll('.stat-value');
  const champion_winrate = champion_data.champ_winrate;
  statValues[0].textContent = champion_winrate.toFixed(2);
  statValues[0].style.color = rgbString(winrate2color(champion_winrate));
  const matchup_winrate = champion_data.matchups_winrate;
  statValues[1].textContent = matchup_winrate.toFixed(2);
  statValues[1].style.color = rgbString(winrate2color(matchup_winrate));
  const duo_winrate = champion_data.duos_winrate;
  statValues[2].textContent = duo_winrate.toFixed(2);
  statValues[2].style.color = rgbString(winrate2color(duo_winrate));
  const global_winrate = champion_data.ind_winrate;
  statValues[3].textContent = global_winrate.toFixed(2);
  statValues[3].style.color = rgbString(winrate2color(global_winrate));
  
  // Color the stats appropriately
  // We're using the existing CSS classes, but you could add logic to change colors based on values
  
  //TODO
  // Clear existing matchups table except header
  const tableBody = document.querySelector('.matchups-table tbody');
  tableBody.innerHTML = '';
  
  // Calculate summary values
  // let totalAllyWinrate = 0;
  // let totalOpponentWinrate = 0;

  const matchupsData = champion_data.matchup_details;
  for(let slane of LANES){
    for(let vs_champ in matchupsData){
      const matchupdata = matchupsData[vs_champ];//{'lane':lane2,'winrate':round(rating2winrate(matchup_rating/2)*100,2)}
      const lane = matchupdata.lane;
      const championImgName = matchupdata.name_id;
      if(lane!=slane){//ordering by lanes
        continue;
      }
      
      const row = document.createElement('tr');
      row.className = 'matchup-row';
      const winrate = matchupdata.winrate;
      const matchup_categorie = matchupdata.matchup;
      const isAllyFavored = winrate>50;

      const arrowDirection = !isAllyFavored ? '→' : '←';
      const arrowClass = !isAllyFavored ? 'win-arrow' : 'loss-arrow';

      row.innerHTML = `
            <td>
                <div class="role-icon">${laneSvgs[championLane]}</div>
            </td>
            <td>
                <div class="champion-cell">
                    <div class="champion-icon">
                        <img src="https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${champ_id}.png" alt="${championName}" />
                    </div>
                    <span class="champion-name">${championName}</span>
                </div>
            </td>
            <td>
                <div class="winrate" style="color: ${rgbString(winrate2color(winrate))};">${winrate.toFixed(2)}</div>
            </td>
            <td>
                <div class="matchup-indicator ${matchup_categorie}">${matchup_categorie.toUpperCase()}</div>
            </td>
            <td>
                <div class="role-icon">${laneSvgs[capitalizeFirstLetter(lane)]}</div>
            </td>
            <td>
                <div class="champion-cell">
                    <div class="champion-icon">
                        <img src="https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${championImgName}.png" alt="${vs_champ}" />
                    </div>
                    <span class="champion-name">${vs_champ}</span>
                </div>
            </td>
            <td>
                <div class="winrate" style="color: ${rgbString(winrate2color(100-winrate))};">${(100-winrate).toFixed(2)}</div>
            </td>
        `;
        
        tableBody.appendChild(row);
    }
  }
  
  // Add summary row
  const isOverallFavored = matchup_winrate > 50;
  
  const summaryRow = document.createElement('tr');
  summaryRow.className = 'summary-row';
  summaryRow.innerHTML = `
      <td colspan="3">
          <div class="summary-winrate" style="color: ${rgbString(winrate2color(matchup_winrate))};">${matchup_winrate.toFixed(2)}</div>
      </td>
      <td>
          <div class="winner-indicator ${!isOverallFavored ? 'win-arrow' : 'loss-arrow'}">${!isOverallFavored ? '→' : '←'}</div>
      </td>
      <td colspan="3">
          <div class="summary-winrate" style="color: ${rgbString(winrate2color(100-matchup_winrate))};">${(100-matchup_winrate).toFixed(2)}</div>
      </td>
  `;
  tableBody.appendChild(summaryRow);

  const tableBodyS = document.querySelector('.matchups-table.duo tbody');
  tableBodyS.innerHTML = '';

  const synergiesData = champion_data.synergie_details;
  for(let slane of LANES){
    for(let ally_champ in synergiesData){
      const synergiedata = synergiesData[ally_champ];//{'lane':lane2,'winrate':round(rating2winrate(matchup_rating/2)*100,2)}
      const lane = synergiedata.lane;
      const championImgName = synergiedata.name_id;
      if(lane!=slane){//ordering by lanes
        continue;
      }
      const row = document.createElement('tr');
      row.className = 'matchup-row';
      
      const winrate = synergiedata.winrate;
      const synergie_categorie = synergiedata.synergie;

      row.innerHTML = `
            <td>
                <div class="role-icon">${laneSvgs[championLane]}</div>
            </td>
            <td>
                <div class="champion-cell">
                    <div class="champion-icon">
                        <img src="https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${champ_id}.png" alt="${championName}" />
                    </div>
                    <span class="champion-name">${championName}</span>
                </div>
            </td>
            <td>
                <div class="matchup-indicator ${synergie_categorie}">${synergie_categorie.toUpperCase()}</div>
            </td>
            <td>
                <div class="role-icon">${laneSvgs[capitalizeFirstLetter(lane)]}</div>
            </td>
            <td>
                <div class="champion-cell">
                    <div class="champion-icon">
                        <img src="https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${championImgName}.png" alt="${ally_champ}" />
                    </div>
                    <span class="champion-name">${ally_champ}</span>
                </div>
            </td>
            <td>
                <div class="winrate" style="color: ${rgbString(winrate2color(winrate))};">${(winrate).toFixed(2)}</div>
            </td>
        `;
        
        tableBodyS.appendChild(row);
    }
  }
  const summaryRow2 = document.createElement('tr');
  summaryRow2.className = 'summary-row';
  summaryRow2.innerHTML = `
      <td colspan="6">
          <div class="summary-winrate" style="color: ${rgbString(winrate2color(duo_winrate))};">${duo_winrate.toFixed(2)}</div>
      </td>
  `;
  tableBodyS.appendChild(summaryRow2);

  const mbuttons = document.querySelectorAll('.matchup-synergy-btn');
  mbuttons[0].classList.remove('active');
  mbuttons[1].classList.remove('active');
  mbuttons[0].classList.add('active');
  selectButton(championLane);
}

const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
        
// Function to open modal
function openModal() {
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
    //updateGraph();
}

// Function to close modal
function closeModal() {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = 'auto'; // Enable scrolling again
    if(closeHandler){
      closeHandler();
    }
}

modalClose.addEventListener('click', closeModal);
        
// Close modal if clicking outside
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

window.addEventListener('DOMContentLoaded', () => {
  const firstPick = document.querySelector('.team-item:not(.header)');
  if (firstPick) {
    firstPick.classList.add('selected');
    firstPick.classList.add('blinking');
  }
});   // <-- AJOUTER cette fermeture ici



// Matchup/Synergy toggle logic
const modalmatchupButtons = document.querySelectorAll('.matchup-synergy-btn');
const modalroleButtons = document.querySelectorAll('.role-btn');

modalmatchupButtons.forEach(button => {
  button.addEventListener('click', () => {
    modalmatchupButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    if (button.id === "matchup-btn") {//matchups selected
      modalroleButtons.forEach(btn => btn.disabled = false);
    }
    else{//synergies selected
      const activeRoleButton = document.querySelector('.role-btn.active');
      const currentLane = activeRoleButton.textContent.toLowerCase();
      const championRoleDiv = document.querySelector('.champion-role');
      const championLane = championRoleDiv.innerText.split(' ')[1].toLowerCase();
      if(currentLane==championLane){
        activeRoleButton.classList.remove('active');
        for(let button of modalroleButtons){
          const btnlane = button.textContent.toLowerCase();
          if(btnlane!=championLane){
            button.classList.add('active');
            break;
          }
        }
      }
      const button2disable = document.querySelector(`#${championLane}-sbtn`);
      button2disable.disabled = true;
    }
    updateGraph();
    // Optional: Do something based on selected value
    //const selectedValue = button.textContent;
  });
});




modalroleButtons.forEach(button => {
  button.addEventListener('click', () => {
    modalroleButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    // Now update the graph
    updateGraph(); // Convert to lowercase for consistency
    });
});

function selectButton(lane){
  modalroleButtons.forEach(btn => btn.classList.remove('active'));
  switch (lane) {
    case 'Top':
      modalroleButtons[0].classList.add('active');
      break;
    case 'Jungle':
      modalroleButtons[1].classList.add('active');
      break;
    case 'Middle':
      modalroleButtons[2].classList.add('active');
      break;
    case 'Bottom':
      modalroleButtons[3].classList.add('active');
      break;
    default:
      modalroleButtons[4].classList.add('active');
      break;
  }
  updateGraph();
}


const modalImg = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');

function updateGraph() {
    // Optional: Do something based on selected role
    const button = document.querySelector('.role-btn.active');
    const lane2check = button.textContent.toLowerCase();

    //synergie or matchup
    const mbutton = document.querySelector('.matchup-synergy-btn.active');//Matchups
    const is_matchup = mbutton.textContent.toLowerCase() == "matchups";
    // Find champion name
    const champion = document.querySelector('.champion-header .champion-name').textContent.trim();

    // Find current lane
    const championRoleDiv = document.querySelector('.champion-role');
    const lane = championRoleDiv.innerText.split(' ')[1].toLowerCase(); // Assuming format like "Role Top"

    url = is_matchup ? '/matchup' : '/synergie'

    fetch(url, {
        method: 'POST',  // You are sending JSON, so POST is better than GET
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            lane: lane,
            champion: champion,
            lane2check: lane2check,
            use_champion_strength: getSettings().use_champion_strength
        })
    })
    .then(response => response.text())  // because Flask sends back plain text (base64)
    .then(base64Image => {
        const graphContainer = document.querySelector('.graph-container');
        graphContainer.innerHTML = `<img src="data:image/png;base64,${base64Image}" alt="Graph" style="max-width: 100%;height: auto; cursor:pointer">`;
        const garph_image = document.querySelector('.graph-container img'); // your graph image
        // When you click the graph image
        garph_image.addEventListener('click', () => {
            modalImg.style.display = 'flex';
            modalImage.src = garph_image.src; // Set the modal image to be the same
        });
    })
    .catch(error => {
        console.error('Error updating graph:', error);
    });
}

// When you click anywhere on the modal (to close it)
modalImage.addEventListener('click', () => {
  modalImg.style.display = 'none';
});



//GPT
// ======================================
// SHARE DRAFT
// ======================================

// Récupère les champions avec leur poste et leur image Data Dragon
function getTeamForShare(teamClass) {
    return Array.from(
        document.querySelectorAll(`.team-item.${teamClass}`)
    ).map(slot => {
        const label = slot.querySelector('.pick-label');
        const laneIcon = slot.querySelector('.lane-icon');

        if (!label || !laneIcon) return null;

        const champion = label.textContent.trim();
        const image = label.getAttribute('data-id');

        if (champion.startsWith('PICK') || !image) return null;

        return {
            champion: champion,
            image: image,
            lane: laneIcon.getAttribute('data-lane')
        };
    });
}

// Génère le lien de partage
async function shareDraft() {
    const draft = {
        version: 1,
        team1: getTeamForShare('ally'),
        team2: getTeamForShare('opponent')
    };

    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('draft', JSON.stringify(draft));

    try {
        await navigator.clipboard.writeText(url.toString());
        alert('Lien de la draft copié !');
    } catch (error) {
        window.prompt('Copie ce lien :', url.toString());
    }
}

// Remplit une équipe depuis les données du lien
function restoreTeamFromShare(teamClass, champions) {
    const slots = Array.from(
        document.querySelectorAll(`.team-item.${teamClass}`)
    );

    const validLanes = ['Top', 'Jungle', 'Middle', 'Bottom', 'Support'];

    champions.forEach((champ, index) => {
        if (!champ || index >= slots.length) return;

        if (
            typeof champ.champion !== 'string' ||
            typeof champ.image !== 'string' ||
            !/^[a-zA-Z0-9]+$/.test(champ.image) ||
            !validLanes.includes(champ.lane)
        ) return;

        const slot = slots[index];

        const splashUrl =
            `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.image}_0.jpg`;

        slot.style.backgroundImage =
            `linear-gradient(rgba(25,25,25,0.8) 0%, rgba(0,0,0,0) 50%, rgba(25,25,25,0.8) 100%), url('${splashUrl}')`;

        slot.style.backgroundSize = 'cover';
        slot.style.backgroundPosition = 'center 20%';
        slot.style.backgroundRepeat = 'no-repeat';

        const label = slot.querySelector('.pick-label');
        label.textContent = champ.champion;
        label.setAttribute('data-id', champ.image);

        addLaneIcon(champ.lane, slot);
        addIndividualWinrate(50, slot);
    });
}

// Charge une draft depuis l'URL
function loadDraftFromURL() {
    const params = new URLSearchParams(window.location.search);
    const rawDraft = params.get('draft');

    if (!rawDraft) return false;

    try {
        const draft = JSON.parse(rawDraft);

        if (
            draft.version !== 1 ||
            !Array.isArray(draft.team1) ||
            !Array.isArray(draft.team2)
        ) return false;

        restoreTeamFromShare('ally', draft.team1);
        restoreTeamFromShare('opponent', draft.team2);

        // Supprime les anciennes sélections
        picks.forEach(p => p.classList.remove('selected', 'blinking'));

        // Sélectionne le prochain emplacement disponible
        selectNextAvailablePick(true);

        // Nettoie l'URL après le chargement de la draft
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

        return true;

    } catch (error) {
        console.error('Erreur lors du chargement de la draft:', error);
        return false;
    }
}



window.addEventListener('DOMContentLoaded', () => {  
  // Create cards
  const blueContainer = document.getElementById('blue-side');
  const redContainer = document.getElementById('red-side');
  
  // Create 5 cards for blue side
  for (let i = 0; i < 5; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;
    card.dataset.side = 'blue';
    card.addEventListener('click', handleBanCardClick);
    blueContainer.appendChild(card);
  }
  
  // Create 5 cards for red side
  for (let i = 0; i < 5; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;
    card.dataset.side = 'red';
    card.addEventListener('click', handleBanCardClick);
    redContainer.appendChild(card);
  }
  
  // Restore shared draft before the initial analysis
  loadDraftFromURL();

  analyseTeams();
  getRecos();
});


window.addEventListener('DOMContentLoaded', () => {
  const badge = document.getElementById('patch-badge');
  if (badge) badge.textContent = `Patch ${patch}`;
});