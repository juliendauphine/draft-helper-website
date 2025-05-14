from analysis import get_patches_data, get_relevent_champions
from analysisv2 import get_true_winrate_per_patch
from analysisv2 import get_matchup_values
from analysisv2 import get_synergie_values
from analysis import get_overall_tier_winrate
from utils import LANES
import requests
import json
import os

def download_data_from_gdrive(file_id, output_path):
    # Check if the file already exists
    if os.path.exists(output_path):
        print(f"File already exists: {output_path}")
        return

    # Otherwise, download it from Google Drive
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    response = requests.get(url)
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded: {output_path}")
    else:
        print(f"Failed to download file ({response.status_code}): {output_path}")

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

FILES = {
    "1LQ2QIRBhmWnbFbhYEVBad8rpQBXvatSW": "lolalytics_data_15.1_emerald_plus_all.json",
    "1JCROLg--z3sCcGKuRy3WXo1MAxr-tVFL": "lolalytics_data_15.2_emerald_plus_all.json",
    "1-aU4jBkx5nj1QJoDmwUggcqMHecsJQXr": "lolalytics_data_15.3_emerald_plus_all.json",
    "1EDAQnlRNmyVu4VGL4vcS5n23c3mgBnfe": "lolalytics_data_15.4_emerald_plus_all.json",
    "1YB9wDmzJrf4OKTfRluDwL84U08e2jx20": "lolalytics_data_15.5_emerald_plus_all.json",
    "1eSeDp_Amyd7EBbPLpxRa3Hjf0fmZdaxR": "lolalytics_data_15.6_emerald_plus_all.json",
    "1Ot3GmOLQecbdCXMQgHaNykqf1ODxWQFt": "lolalytics_data_15.7_emerald_plus_all.json",
    "16bmlC4OQsycyP4dIaP2OE0Tt9Z7kgezb": "lolalytics_data_15.8_emerald_plus_all.json",
    "1xUpsyqm4FElsNixb0uIJ-QhBHuREMBI9": "matchup_d2_data.json",
    "1WTi9Ubda_txMuHP33BD-hpO9xzDjNBAG": "synergie_d2_data.json",
}

for file_id, name in FILES.items():
    output_path = os.path.join(DATA_DIR, name)
    download_data_from_gdrive(file_id, output_path)


def list2dic(list,accepted_cpl):
    final_dic = {}
    for i,lane in enumerate(LANES):
        final_dic[lane] = {}
        for j,val in enumerate(list[i]):
            final_dic[lane][accepted_cpl[i][j][0]] = val
    return final_dic


url = "https://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/champion.json"
response = requests.get(url)
champion_data = response.json()

# Create a mapping: "name" -> "id"
name_to_id = {}
for champ_id, champ_info in champion_data['data'].items():
    name_to_id[champ_info['name']] = champ_info['id']

patches = ['15.8']

patches2 = ['15.8','15.7','15.6','15.5','15.4','15.3','15.2','15.1']

patches_data = get_patches_data(patches2)

accepted_cpl = get_relevent_champions(patches2,patches_data,min_playrate=0.2,patch_penality=0)

champ_wr_pp =  get_true_winrate_per_patch(patches_data,patches,accepted_cpl)[0]

tier_wr_last_patch = get_overall_tier_winrate(patches,patches_data)
tier_delta = tier_wr_last_patch-50

possible_champs = [[c[0] for c in accepted_cpl[i]] for i in range(len(LANES))]


with open('data/synergie_d2_data.json', 'r') as f:
    synergie_d2_dic = json.load(f)

with open('data/matchup_d2_data.json', 'r') as f:
    matchup_d2_dic = json.load(f)


