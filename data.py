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

patches = ['15.7']

patches2 = ['15.7','15.6','15.5','15.4','15.3','15.2','15.1','14.24','14.23']

patches_data = get_patches_data(patches2)

accepted_cpl = get_relevent_champions(patches2,patches_data,min_playrate=0.5,patch_penality=-100)

champ_wr_pp =  get_true_winrate_per_patch(patches_data,patches,accepted_cpl)[0]

tier_wr_last_patch = get_overall_tier_winrate([patches[0]],patches_data)
tier_delta = tier_wr_last_patch-50

possible_champs = [[c[0] for c in accepted_cpl[i]] for i in range(len(LANES))]

# matchup_dic = {lane:{} for lane in LANES}
# for i,lane in enumerate(LANES):
#     print(lane)
#     for j,champ_data in enumerate(accepted_cpl[i]):
#         champ_name = accepted_cpl[i][j][0]
#         lmv = get_matchup_values(accepted_cpl,patches,patches_data,lane,champ_name)
#         lmv = list2dic(lmv,accepted_cpl)
#         matchup_dic[lane][champ_name] = lmv

# synergie_dic = {lane:{} for lane in LANES}
# for i,lane in enumerate(LANES):
#     print(lane)
#     for j,champ_data in enumerate(accepted_cpl[i]):
#         champ_name = accepted_cpl[i][j][0]
#         lmv = get_synergie_values(accepted_cpl,patches,patches_data,lane,champ_name)
#         lmv = list2dic(lmv,accepted_cpl)
#         lmv[lane] = {}
#         synergie_dic[lane][champ_name] = lmv

# draft_data = []
# for i,lane in enumerate(LANES):
#     lane_name = lane.capitalize()
#     for j,champion_data in enumerate(accepted_cpl[i]):
#         champion_name = champion_data[0]
#         champion_line = {"lane":lane_name,"champion":champion_name,"winrate":"50%","championImageName": name_to_id[champion_name]}
#         draft_data.append(champion_line)


with open('data/synergie_d2_data.json', 'r') as f:
    synergie_d2_dic = json.load(f)

with open('data/matchup_d2_data.json', 'r') as f:
    matchup_d2_dic = json.load(f)


