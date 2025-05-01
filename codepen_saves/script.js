const draftData = [
  { lane: 'Top', champion: 'Ahri', winrate: '52%', championImageName: 'Ahri' },
  { lane: 'Jungle', champion: 'Lee Sin', winrate: '54%', championImageName: 'LeeSin' },
  { lane: 'Middle', champion: 'Zed', winrate: '48%', championImageName: 'Zed' },
  { lane: 'Bottom', champion: 'Jhin', winrate: '56%', championImageName: 'Jhin' },
  { lane: 'Support', champion: 'Lulu', winrate: '50%', championImageName: 'Lulu' },
  
  // Added 10 more elements
  { lane: 'Top', champion: 'Riven', winrate: '49%', championImageName: 'Riven' },
  { lane: 'Jungle', champion: 'Elise', winrate: '53%', championImageName: 'Elise' },
  { lane: 'Middle', champion: 'Lux', winrate: '50%', championImageName: 'Lux' },
  { lane: 'Bottom', champion: 'Kai\'Sa', winrate: '55%', championImageName: 'Kaisa' },
  { lane: 'Support', champion: 'Nami', winrate: '52%', championImageName: 'Nami' },
  { lane: 'Top', champion: 'Fiora', winrate: '51%', championImageName: 'Fiora' },
  { lane: 'Jungle', champion: 'Kayn', winrate: '54%', championImageName: 'Kayn' },
  { lane: 'Middle', champion: 'Akali', winrate: '47%', championImageName: 'Akali' },
  { lane: 'Bottom', champion: 'Miss Fortune', winrate: '57%', championImageName: 'MissFortune' },
  { lane: 'Support', champion: 'Thresh', winrate: '50%', championImageName: 'Thresh' },
  { lane: 'Top', champion: 'Malphite', winrate: '50%', championImageName: 'Malphite' }
];


// Mapping of lane types to their corresponding SVGs
const laneSvgs = {
  'Top': `<svg viewBox="0 0 31 31" class="h-7"><g fill="currentColor" fill-rule="evenodd" transform="rotate(-180 13.25 13.25)"><polygon points="22.063 3 22.063 21.969 3 21.969 7.053 17.936 18.063 17.969 17.999 7.044"></polygon><polygon fill-opacity=".3" points="0 0 14.593 0 19.109 0 15.089 4.011 4.002 4 4.002 15.076 0 19.07 0 14.491"></polygon><rect width="6" height="6" x="8" y="8" fill-opacity=".3"></rect></g></svg>`,
  'Jungle': `<svg viewBox="0 0 31 31" class="h-7"><g fill="currentColor" fill-rule="evenodd" transform="translate(4 3)"><path d="M11.5565033 25.2593129L3.71050008 17.007843C3.53174845 13.6218567 2.29491509 10.7161679 0 8.29077657 3.7954305 10.8023461 6.10286289 13.0322181 6.92229716 14.9803925 6.50825161 8.81697083 5.33232795 3.82350667 3.39452616 0 8.87327915 7.71470812 11.7037862 13.5908949 11.8860474 17.6285604 12.0683085 21.6662259 11.9584605 24.20981 11.5565033 25.2593129zM14.653773 21.2846629C14.9109039 14.93976 17.4729716 10.187166 22.339976 7.0268809 19.9557631 10.6189931 18.8951467 14.045261 19.1581268 17.3056844L14.653773 21.2846629zM13.429067 14.4254201L12.0960337 8.97735596C13.4903276 6.05259874 15.7644196 3.11883375 18.9183095.176060994 16.7638533 4.16490512 15.401769 7.34258185 14.8320567 9.70909119 14.2623444 12.0756005 13.7946811 13.6477102 13.429067 14.4254201z"></path></g></svg>`,
  'Middle': `<svg viewBox="0 0 31 31" class="h-7"><g fill="currentColor" fill-rule="evenodd" transform="translate(4.5 4.5)"><polygon fill-opacity=".3" points="0 0 14.519 0 10.484 4 3.997 4 3.997 10.523 0 14.491"></polygon><polygon fill-opacity=".3" points="7.5 7.5 22.019 7.5 17.984 11.5 11.497 11.5 11.497 18.023 7.5 21.991" transform="rotate(-180 14.76 14.746)"></polygon><polygon points="18 0 22 0 22 4 4 22 0 22 0 18"></polygon></g></svg>`,
  'Bottom': `<svg viewBox="0 0 31 31" class="h-7"><g fill="currentColor" fill-rule="evenodd" transform="translate(4.5 4.5)"><polygon points="22.063 3 22.063 21.969 3 21.969 7.053 17.936 18.063 17.969 17.999 7.044"></polygon><polygon fill-opacity=".3" points="0 0 14.593 0 19.109 0 15.089 4.011 4.002 4 4.002 15.076 0 19.07 0 14.491"></polygon><rect width="6" height="6" x="8" y="8" fill-opacity=".3"></rect></g></svg>`,
  'Support': `<svg viewBox="0 0 31 31" class="h-7"><g fill="currentColor" fill-rule="evenodd" transform="translate(1.5 4)"><polygon points="14.089 22.953 18.041 19.779 14.089 9.976 10.121 19.779"></polygon><polygon points="8.841 13.988 11.786 8.453 9.102 6 0 6 7.895 9.466 5.868 11.388"></polygon><polygon points="25.341 13.988 28.286 8.453 25.602 6 16.5 6 24.395 9.466 22.368 11.388" transform="matrix(-1 0 0 1 44.786 0)"></polygon><polygon points="13.992 7.007 18.044 2.955 16.04 .951 12.009 .951 10.025 2.934"></polygon></g></svg>`
};


const picks = document.querySelectorAll('.team-item:not(.header)');

picks.forEach(pick => {
  pick.addEventListener('click', () => {
    if (pick.style.backgroundImage) {
      // If the pick already has a champion, don't allow selection (exit the function)
      return;
    }
    // Remove 'selected' from all picks
    picks.forEach(p => p.classList.remove('selected'));
    
    // Add 'selected' to the clicked pick
    pick.classList.add('selected');
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

// When the input is focused, add the 'focused' class to the search bar
searchInput.addEventListener("focus", () => {
searchBar.classList.add("focused");
});

// When the input is blurred (focus lost), remove the 'focused' class
searchInput.addEventListener("blur", () => {
searchBar.classList.remove("focused");
});

// Show the clear icon when there is text in the input
searchInput.addEventListener("input", () => {
if (searchInput.value) {
  clearIcon.style.display = "inline-block";
} else {
  clearIcon.style.display = "none";
}
});

// Clear the input when the clear icon is clicked
clearIcon.addEventListener("click", () => {
searchInput.value = ""; // Clear the text
clearIcon.style.display = "none"; // Hide the clear icon
searchInput.focus(); // Keep the focus on the input
});


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
}

// Event listeners for position buttons
topBtn.addEventListener('click', () => togglePositionButton(topBtn));
jungleBtn.addEventListener('click', () => togglePositionButton(jungleBtn));
midBtn.addEventListener('click', () => togglePositionButton(midBtn));
botBtn.addEventListener('click', () => togglePositionButton(botBtn));
supportBtn.addEventListener('click', () => togglePositionButton(supportBtn));


window.addEventListener('DOMContentLoaded', () => {
  const firstPick = document.querySelector('.team-item:not(.header)');
  if (firstPick) {
    firstPick.classList.add('selected');
  }
});


//TEST

// const tableRows = document.querySelectorAll('.draft-table tbody tr');

// tableRows.forEach(row => {
//   row.addEventListener('click', () => {
//     // Get the champion name (you need to store it somehow in each <tr>)
//     const championName = row.getAttribute('data-champion');
//     const laneType = row.getAttribute('data-lane');
    
//     // Find the currently selected pick
//     const selectedPick = document.querySelector('.team-item.selected');

//     if (championName && selectedPick) {
//       // Set the background image
//       const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`;
//       selectedPick.style.backgroundImage = `linear-gradient(rgba(25, 25, 25, 0.8) 0%, rgba(0, 0, 0, 0) 50%, rgba(25, 25, 25, 0.8) 100%), url('${splashUrl}')`;
//       selectedPick.style.backgroundSize = 'cover';
//       selectedPick.style.backgroundPosition = 'center 20%';
//       selectedPick.style.backgroundRepeat = 'no-repeat';

//       // Update the text inside the pick
//       const pickLabel = selectedPick.querySelector('.pick-label'); // assuming your text is inside a span or div with class "pick-label"
//       if (pickLabel) {
//         pickLabel.textContent = championName;
//       }
//       addLaneIcon(laneType, selectedPick);
      
//       picks.forEach(p => p.classList.remove('selected'));
//       const isAlly = selectedPick.classList.contains('ally');
//       selectNextAvailablePick(isAlly);
//     }
//   });
// });

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
  });
  picks.forEach(p => p.classList.remove('selected'));
  const isAlly = teamType == 'ally';
  selectNextAvailablePick(isAlly);
}

// Add event listeners for reset buttons
document.getElementById('reset-ally').addEventListener('click', () => {
  resetTeam('ally');
});

document.getElementById('reset-opponent').addEventListener('click', () => {
  resetTeam('opponent');
});

function selectNextAvailablePick(isAlly) {
    // First, try to find the next empty ally pick if it's an ally team
  if (isAlly) {
    const allyTeamItems = document.querySelectorAll('.team-item.ally');
    for (let i = 0; i < allyTeamItems.length; i++) {
      // Check if the pick doesn't already have a background image, meaning it's empty
      if (!allyTeamItems[i].style.backgroundImage) {
        // Found the next empty ally pick, return it
        allyTeamItems[i].classList.add('selected');
        return allyTeamItems[i];
      }
    }
  }

  // If no empty ally pick is found, or it's not an ally, try the opponent team
  const opponentTeamItems = document.querySelectorAll('.team-item.opponent');
  for (let i = 0; i < opponentTeamItems.length; i++) {
    // Check if the pick doesn't already have a background image, meaning it's empty
    if (!opponentTeamItems[i].style.backgroundImage) {
      // Found the next empty opponent pick, return it
      opponentTeamItems[i].classList.add('selected');
      return opponentTeamItems[i];
    }
  }

  // If there are no empty picks left (ally and opponent), return null
  return null;
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
  laneIcon.innerHTML = laneSvgs[laneType] || '';

  // Append the lane icon to the selected pick
  selectedPick.appendChild(laneIcon);
}

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
    championImage.src = `https://ddragon.leagueoflegends.com/cdn/11.24.1/img/champion/${item.championImageName}.png`;
    championImage.alt = item.champion;
    championImage.classList.add('champion-image');
    
    const championText = document.createTextNode(item.champion);
    championCell.appendChild(championImage);
    championCell.appendChild(championText);

    // Create the winrate cell
    const winrateCell = document.createElement('td');
    winrateCell.textContent = item.winrate;

    // Append cells to the row
    row.appendChild(laneCell);
    row.appendChild(championCell);
    row.appendChild(winrateCell);

    row.addEventListener('click', () => {
      // Get the champion name (you need to store it somehow in each <tr>)
      const championName = row.getAttribute('data-champion');
      const laneType = row.getAttribute('data-lane');
      
      // Find the currently selected pick
      const selectedPick = document.querySelector('.team-item.selected');
  
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
          pickLabel.textContent = championName;
        }
        addLaneIcon(laneType, selectedPick);
        
        picks.forEach(p => p.classList.remove('selected'));
        const isAlly = selectedPick.classList.contains('ally');
        selectNextAvailablePick(isAlly);
      }
    });

    // Append the row to the table body
    tableBody.appendChild(row);
  });
}

populateDraftTable(draftData);