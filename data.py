from analysis import get_patches_data, get_relevent_champions
from analysisv2 import get_true_winrate_per_patch
from analysisv2 import get_matchup_values
from analysisv2 import get_synergie_values
from analysis import get_overall_tier_winrate
from utils import LANES
import requests
import json

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


