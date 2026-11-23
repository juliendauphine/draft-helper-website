from lolstats import rating2winrate, winrate2rating
from data import tier_delta,champ_wr_pp, synergie_d2_dic, matchup_d2_dic,patches_data, patches, accepted_cpl,name_to_id#matchup_dic, synergie_dic,draft_data
from data import possible_champs, PATCH
from utils import LANES, LANE2INDEX
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

def weighted_variance(values, weights):
    if len(values) != len(weights):
        raise ValueError("Values and weights must have the same length")

    weighted_mean = sum(v * w for v, w in zip(values, weights)) / sum(weights)
    variance = sum(w * (v - weighted_mean) ** 2 for v, w in zip(values, weights)) / sum(weights)
    return variance

# Function to sort data by winrate
def sort_by_winrate(data):
    sorted_data = sorted(data, key=lambda x: float(x['winrate'].replace('%', '')), reverse=True)
    return sorted_data


def get_scaling_over_time(team):
    global_winrate_over_time = []
    if len(team)==0:
        return [50 for _ in range(7)]

    for i in range(len(patches_data[PATCH][team[0]['lane'].lower()][team[0]['champion']]['WR_vs_length'])):
        current_rating = 0
        
        for element in team:
            lane = element['lane'].lower()
            champion = element['champion']

            wr = patches_data[PATCH][lane][champion]['WR_vs_length'][i]

            champion_wr = champ_wr_pp[lane][champion]-tier_delta #true winrate
            lola_champion_wr = patches_data[PATCH][lane][champion]['Win_perc']
            delta_truth = champion_wr - lola_champion_wr
            winrate_over_time = wr['winrate'] - delta_truth -tier_delta
            ind_rating = winrate2rating(winrate_over_time/100)
            current_rating += ind_rating/5.0
        
        global_winrate_over_time.append(round(rating2winrate(current_rating)*100,2))
    return global_winrate_over_time
    
def get_damage_share(team):
    total_physical_damage = 0
    total_magic_damage = 0
    total_true_damage = 0

    for element in team:
        lane = element['lane'].lower()
        champion = element['champion']
        rs = patches_data[PATCH][lane][champion]['Raw_stats']
        total_physical_damage+=rs['Physical Damage'][0]
        total_magic_damage+=rs['Magic Damage'][0]
        total_true_damage+=rs['True Damage'][0]
    total_damage = total_physical_damage+total_magic_damage+total_true_damage
    if total_damage == 0:
        return [33,33,34]
    physical_damage_share = round((total_physical_damage/total_damage)*100,2)
    magic_damage_share = round((total_magic_damage/total_damage)*100,2)
    total_true_damage = 100-physical_damage_share-magic_damage_share
    return [physical_damage_share,magic_damage_share,total_true_damage]


# Extract the champions and lanes and calculate winrate for both teams
def calculate_team_winrate(team1,team2,use_champ_winrate=True):
    individual_winrates = {"team1":{},"team2":{}}
    team_overview = {"team1":{},"team2":{}}
    global_rating = 0

    current_rating = 0
    for i,element in enumerate(team1):
        lane = element['lane'].lower()
        champion = element['champion']
        try:
            champion_wr = champ_wr_pp[lane][champion]-tier_delta
        except Exception as e:
            print(lane, champion)
            raise e
        if use_champ_winrate:
            ind_rating = winrate2rating(champion_wr/100)
            global_rating+=ind_rating
            current_rating += ind_rating
            individual_winrates['team1'][champion] = {'ind_winrate':ind_rating, 'champ_winrate':champion_wr, 'duos_winrate':0, 'matchups_winrate':0, 'matchup_details':{},'synergie_details':{}}
        else:
            individual_winrates['team1'][champion] = {'ind_winrate': 0, 'champ_winrate':0, 'duos_winrate':0, 'matchups_winrate':0, 'matchup_details':{},'synergie_details':{}}
    team_overview["team1"]["champions"] = round(rating2winrate(current_rating)*100,2)

    
    current_rating = 0
    for i,element in enumerate(team2):
        lane = element['lane'].lower()
        champion = element['champion']
        if use_champ_winrate:
            champion_wr = champ_wr_pp[lane][champion]-tier_delta
            ind_rating = winrate2rating(champion_wr/100)
            individual_winrates['team2'][champion] = {'ind_winrate':ind_rating,'champ_winrate':champion_wr, 'duos_winrate':0, 'matchups_winrate':0, 'matchup_details':{},'synergie_details':{}}
            global_rating-=ind_rating
            current_rating += ind_rating
        else:
            individual_winrates['team2'][champion] = {'ind_winrate': 0, 'champ_winrate':0, 'duos_winrate':0, 'matchups_winrate':0, 'matchup_details':{},'synergie_details':{}}
    team_overview["team2"]["champions"] = round(rating2winrate(current_rating)*100,2)


    current_rating = 0
    current_rating2 = 0

    for i,element in enumerate(team1):
        lane = element['lane'].lower()
        champion = element['champion']
        #matchups
        for element2 in team2:
            lane2 = element2['lane'].lower()
            champion2 = element2['champion']
            d2 = matchup_d2_dic[lane][champion][lane2][champion2][0]
            w_matchup = d2+50#matchup_dic[lane][champion][lane2][champion2]-tier_delta
            matchup_rating = winrate2rating(w_matchup/100)
            global_rating+=matchup_rating
            current_rating+=matchup_rating
            individual_winrates['team1'][champion]['ind_winrate'] += matchup_rating/2
            individual_winrates['team1'][champion]['matchups_winrate'] += matchup_rating/2
            individual_winrates['team1'][champion]['matchup_details'][champion2] = {'name_id':name_to_id[champion2],'lane':lane2,'winrate':round(rating2winrate(matchup_rating)*100,2),'matchup':categorize(d2,p10,p30,p70,p90)}
            individual_winrates['team2'][champion2]['ind_winrate'] -= matchup_rating/2
            individual_winrates['team2'][champion2]['matchups_winrate'] -= matchup_rating/2
            individual_winrates['team2'][champion2]['matchup_details'][champion] = {'name_id':name_to_id[champion],'lane':lane,'winrate':round(rating2winrate(-matchup_rating)*100,2),'matchup':categorize(-d2,p10,p30,p70,p90)}
        
        #synergies
        for element2 in team1[i+1:]:
            lane2 = element2['lane'].lower()
            champion2 = element2['champion']
            #add
            d2 = synergie_d2_dic[lane][champion][lane2][champion2][0]
            #print(lane,champion,lane2,champion2)
            w_synergie = d2 +50#synergie_dic[lane][champion][lane2][champion2]-tier_delta
            synergie_rating = winrate2rating(w_synergie/100)
            global_rating+=synergie_rating
            current_rating2+=synergie_rating
            individual_winrates['team1'][champion]['ind_winrate'] += synergie_rating/2
            individual_winrates['team1'][champion]['duos_winrate'] += synergie_rating/2
            individual_winrates['team1'][champion]['synergie_details'][champion2] = {'name_id':name_to_id[champion2],'lane':lane2,'winrate':round(rating2winrate(synergie_rating)*100,2),'synergie':categorize(d2,sp10,sp30,sp70,sp90)}
            individual_winrates['team1'][champion2]['ind_winrate'] += synergie_rating/2
            individual_winrates['team1'][champion2]['duos_winrate'] += synergie_rating/2
            individual_winrates['team1'][champion2]['synergie_details'][champion] = {'name_id':name_to_id[champion],'lane':lane,'winrate':round(rating2winrate(synergie_rating)*100,2),'synergie':categorize(d2,sp10,sp30,sp70,sp90)}
    
    for i,element in enumerate(team2):
        lane = element['lane'].lower()
        champion = element['champion']
        #synergies
        for element2 in team2[i+1:]:
            lane2 = element2['lane'].lower()
            champion2 = element2['champion']
            #add
            #print(lane,champion,lane2,champion2)
            d2 = synergie_d2_dic[lane][champion][lane2][champion2][0]
            w_synergie = d2+50#synergie_dic[lane][champion][lane2][champion2]-tier_delta
            synergie_rating = winrate2rating(w_synergie/100)
            individual_winrates['team2'][champion]['ind_winrate'] += synergie_rating/2
            individual_winrates['team2'][champion]['duos_winrate'] += synergie_rating/2
            individual_winrates['team2'][champion]['synergie_details'][champion2] = {'name_id':name_to_id[champion2],'lane':lane2,'winrate':round(rating2winrate(synergie_rating)*100,2),'synergie':categorize(d2,sp10,sp30,sp70,sp90)}
            individual_winrates['team2'][champion2]['ind_winrate'] += synergie_rating/2
            individual_winrates['team2'][champion2]['duos_winrate'] += synergie_rating/2
            individual_winrates['team2'][champion2]['synergie_details'][champion] = {'name_id':name_to_id[champion],'lane':lane,'winrate':round(rating2winrate(synergie_rating)*100,2),'synergie':categorize(d2,sp10,sp30,sp70,sp90)}
            global_rating-= synergie_rating
    for team in individual_winrates:
        for champ in individual_winrates[team]:
            individual_winrates[team][champ]['ind_winrate']=round(rating2winrate(individual_winrates[team][champ]['ind_winrate'])*100,2)
            individual_winrates[team][champ]['matchups_winrate']=round(rating2winrate(individual_winrates[team][champ]['matchups_winrate'])*100,2)
            individual_winrates[team][champ]['duos_winrate']=round(rating2winrate(individual_winrates[team][champ]['duos_winrate'])*100,2)
    
    team_overview["team1"]["matchups"] = round(rating2winrate(current_rating)*100,2)
    team_overview["team2"]["matchups"] = round(rating2winrate(-current_rating)*100,2)

    team_overview["team1"]["duos"] = round(rating2winrate(current_rating2)*100,2)
    team_overview["team2"]["duos"] = round(rating2winrate(-current_rating2)*100,2)

    team_overview["team1"]["total"] = round(rating2winrate(global_rating)*100,2)
    team_overview["team2"]["total"] = round(rating2winrate(-current_rating2)*100,2)
    
    return round(rating2winrate(global_rating)*100,2), individual_winrates, team_overview


def get_champion_suggestions(ally_team,ennemy_team,min_playrate=0,use_champion_strength=True, bans=[]):
    lanes = LANES.copy()

    for element in ally_team:
        lane = element['lane'].lower()
        lanes.remove(lane)

    champ_used = []
    for element in ally_team:
        champion = element['champion']
        champ_used.append(champion)
    for element in ennemy_team:
        champion = element['champion']
        champ_used.append(champion)
    
    
    draft_data = []
    mvars = []
    svars = []
    for i,lane in enumerate(LANES):
        if not lane in lanes:
            continue
        lane_name = lane.capitalize()
        for j,champion_data in enumerate(accepted_cpl[i]):
            champion = champion_data[0]
            pick_rate = champion_data[1]
            if pick_rate<min_playrate:
                continue
            if champion in champ_used or champion in bans:
                continue
            new_ally_team = ally_team.copy()
            new_ally_team.append({"champion": champion, "lane": lane})
            new_team_winrate, _, _ = calculate_team_winrate(new_ally_team, ennemy_team,use_champ_winrate=use_champion_strength)
            #MATCHUP SCORE
            match_var = 0
            for k,lane2check in enumerate(LANES):
                champion_selected = None
                #CHECK IF LANE IS ALREADY SELECTED
                for element in ennemy_team:
                    slane = element['lane'].lower()
                    schampion = element['champion']
                    if slane == lane2check:
                        champion_selected = schampion
                        break
                d2m = []
                mweights = []
                if not champion_selected:#if selected no variance
                    for c2face,pr,_ in accepted_cpl[k]:
                        if c2face in champ_used or c2face==champion:
                            continue
                        try:
                            d2 = matchup_d2_dic[lane][champion][lane2check][c2face][0]
                        except Exception as e:
                            print(lane,champion,lane2check,c2face)
                            raise e
                        d2m.append(d2)
                        mweights.append(pr)
                    match_var += weighted_variance(d2m,mweights)
            match_var /= 5
            mvars.append(match_var)    

            #SYNERGIE SCORE
            syn_var = 0
            for k,lane2check in enumerate(LANES):
                if lane2check == lane:
                    continue
                champion_selected = None
                #CHECK IF LANE IS ALREADY SELECTED
                for element in ally_team:
                    slane = element['lane'].lower()
                    schampion = element['champion']
                    if slane == lane2check:
                        champion_selected = schampion
                        break
                d2s = []
                sweights = []
                if not champion_selected:#if selected no variance
                    for c2face,pr,_ in accepted_cpl[k]:
                        if c2face in champ_used or c2face==champion:
                            continue
                        d2 = synergie_d2_dic[lane][champion][lane2check][c2face][0]
                        d2s.append(d2)
                        sweights.append(pr)
                    syn_var += weighted_variance(d2s,sweights)#np.var(d2s)
            syn_var /= 4
            svars.append(syn_var)    

            champion_line = {"lane":lane_name,"champion":champion,"winrate":str(new_team_winrate)+"%","championImageName": name_to_id[champion],"matchupVarScore":match_var,"synergieVarScore":syn_var,"pickrate":round(pick_rate,2)}
            draft_data.append(champion_line)
    for line in draft_data:
        line["matchupVarScore"] = round((1 - (line["matchupVarScore"]/max(1,max(mvars))))*100)
        line["synergieVarScore"] = round((1 - (line["synergieVarScore"]/max(1,max(svars))))*100)
    return draft_data


#possible_champs = possible_champs if possible_champs is not None else []

def local_change(team1,team2,pick_is_team1,pick):
    #*(1 if pick_is_team1 else -1)
    local_rating = 0
    #champ strength
    lane = pick[0]
    champion = pick[1]
    champion_wr = champ_wr_pp[lane][champion]-tier_delta
    ind_wr = winrate2rating(champion_wr/100)
    local_rating+=ind_wr
    ally_team = team1 if pick_is_team1 else team2
    opp_team = team2 if pick_is_team1 else team1
    #synergies
    for element in ally_team:
        lane2 = element[0]
        champion2 = element[1]
        w_synergie =  synergie_d2_dic[lane][champion][lane2][champion2][0]+50#synergie_dic[lane][champion][lane2][champion2]-tier_delta
        synergie_rating = winrate2rating(w_synergie/100)
        local_rating+=synergie_rating
    #matchups
    for element2 in opp_team:
        lane2 = element2[0]
        champion2 = element2[1]
        w_matchup = matchup_d2_dic[lane][champion][lane2][champion2][0]+50#matchup_dic[lane][champion][lane2][champion2]-tier_delta
        matchup_rating = winrate2rating(w_matchup/100)
        local_rating+=matchup_rating
    return local_rating*(1 if pick_is_team1 else -1)


# Given thresholds
p10 = -1.7399902650781187
p30 = -0.633154595786145
p70 = 0.6891234380587233
p90 = 1.7836522382734787

sp10 = -0.7070919159024154
sp30 =  0.2591817171461583
sp70 = 1.280052810962039
sp90 = 2.099490883748117

  


category_colors = {
    'Excellent': 'blue',
    'Good': 'green',
    'Neutral': 'black',
    'Bad': 'darkorange',
    'Horrible': 'red',
}

# Category function
def categorize(mean,p10,p30,p70,p90):
    if mean >= p90:
        return 'Excellent'
    elif mean >= p70:
        return 'Good'
    elif mean >= p30:
        return 'Neutral'
    elif mean >= p10:
        return 'Bad'
    else:
        return 'Horrible'

def get_matchup_performance_graph(lane, champ, lane2check):
    twitch_d2_bottom = []
    for champ2face, pr, _ in accepted_cpl[LANE2INDEX[lane2check]]:
        if champ2face != champ:
            fmean, half_size = matchup_d2_dic[lane][champ][lane2check][champ2face]
            twitch_d2_bottom.append((f"{champ2face} {round(pr, 1)}%", fmean, half_size))

    # Sort by mean_d2 descending
    twitch_d2_bottom.sort(key=lambda x: -x[1])

    # Unpack
    champions, means, half_cis = zip(*twitch_d2_bottom)

    # Compute colors for each mean
    colors = [category_colors[categorize(mean,p10,p30,p70,p90)] for mean in means]

    # Create the plot
    fig, ax = plt.subplots(figsize=(12, 6))

    # Plot with colored markers
    for i, (champion, mean, ci, color) in enumerate(zip(champions, means, half_cis, colors)):
        ax.errorbar(
            i, mean,
            yerr=ci,
            fmt='o',
            color=color,
            ecolor='red',
            elinewidth=1,
            capsize=3,
            markersize=5,
        )

    # Highlight y=0
    ax.axhline(0, color='black', linestyle='--', linewidth=1)

    # Labeling
    ax.set_xticks(range(len(champions)))
    ax.set_xticklabels(champions, rotation=90, fontsize=8)

    # Color the x-tick labels
    for label, color in zip(ax.get_xticklabels(), colors):
        label.set_color(color)

    ax.set_xlabel("Champion", fontsize=10)
    ax.set_ylabel("Mean Performance", fontsize=10)
    ax.set_title(f"{champ}  ({lane})  Matchups Performance on {lane2check}", fontsize=12)

    legend_elements = [
        Line2D([0], [0], marker='o', color='w', label=cat, markersize=8, markerfacecolor=color)
        for cat, color in category_colors.items()
    ]
    ax.legend(handles=legend_elements, title="Categories", loc='upper right')

    fig.tight_layout()
    return fig

def get_synergie_performance_graph(lane,champ,lane2check):
    if lane == lane2check:
        print('can t have the same lane')
        return None

    twitch_d2_bottom = []

    for champ2face, pr, _ in accepted_cpl[LANE2INDEX[lane2check]]:
        if champ2face != champ:
            fmean, half_size = synergie_d2_dic[lane][champ][lane2check][champ2face]
            twitch_d2_bottom.append((f"{champ2face} {round(pr, 1)}%", fmean, half_size))

    # Sort by mean_d2 descending
    twitch_d2_bottom.sort(key=lambda x: -x[1])

    # Unpack
    champions, means, half_cis = zip(*twitch_d2_bottom)

    # Compute colors for each mean
    colors = [category_colors[categorize(mean,sp10,sp30,sp70,sp90)] for mean in means]

    # Create the plot
    fig, ax = plt.subplots(figsize=(12, 6))

    # Plot with colored markers
    for i, (champion, mean, ci, color) in enumerate(zip(champions, means, half_cis, colors)):
        ax.errorbar(
            i, mean,
            yerr=ci,
            fmt='o',
            color=color,
            ecolor='red',
            elinewidth=1,
            capsize=3,
            markersize=5,
        )

    # Highlight y=0
    ax.axhline(0, color='black', linestyle='--', linewidth=1)

    # Labeling
    ax.set_xticks(range(len(champions)))
    ax.set_xticklabels(champions, rotation=90, fontsize=8)

    # Color the x-tick labels
    for label, color in zip(ax.get_xticklabels(), colors):
        label.set_color(color)

    ax.set_xlabel("Champion", fontsize=10)
    ax.set_ylabel("Mean Performance", fontsize=10)
    ax.set_title(f"{champ} ({lane}) Synergies Performance with {lane2check} with Confidence Intervals")

    legend_elements = [
        Line2D([0], [0], marker='o', color='w', label=cat, markersize=8, markerfacecolor=color)
        for cat, color in category_colors.items()
    ]
    ax.legend(handles=legend_elements, title="Categories", loc='upper right')

    fig.tight_layout()
    return fig

def get_synergie_performance_data(lane, champ, lane2check):
    if lane == lane2check:
        print('can\'t have the same lane')
        return None
    
    synergy_data = []
    for champ2face, pr, *_ in accepted_cpl[LANE2INDEX[lane2check]]:
        if champ2face != champ:
            fmean, half_size = synergie_d2_dic[lane][champ][lane2check][champ2face]
            synergy_data.append({
                "champion": f"{champ2face} {round(pr, 1)}%",
                "mean": round(fmean, 2),
                "ci": round(half_size, 2),
                "category": categorize(fmean, sp10, sp30, sp70, sp90)
            })
    
    # Sort by mean descending
    synergy_data.sort(key=lambda x: -x["mean"])
    
    # Return a dictionary with all needed data
    return {
        "synergies": synergy_data,
        "title": f"{champ} ({lane}) Synergies Performance with {lane2check}",
        "categories": {cat: color for cat, color in category_colors.items()}
    }

class DraftState:
    def __init__(self, team1=None, team2=None, picked_champs=None,remaininglanes1=None,remaininglanes2=None, turn=0, global_rating=0.0):
        self.team1 = team1 if team1 is not None else []  # List of (lane, champ) tuples
        self.team2 = team2 if team2 is not None else []  # List of (lane, champ) tuples
        self.picked_champs = picked_champs if picked_champs is not None else []
        
        if remaininglanes1:
            self.remaininglanes1 = remaininglanes1
        else:
            self.remaininglanes1 = LANES.copy()
            for pick in self.team1:
                self.remaininglanes1.remove(pick[0])
        if remaininglanes2:
            self.remaininglanes2 = remaininglanes2
        else:
            self.remaininglanes2 = LANES.copy()
            for pick in self.team2:
                self.remaininglanes2.remove(pick[0])
        self.turn = turn  # Int: turn number
        self.global_rating = global_rating  # Float: score of the draft

    def pick_team(self):
        """
        Returns 0 or 1 depending on the turn number.
        Groups of 2 picks alternate between 0 and 1.
        """
        return ((self.turn+1) // 2) % 2

    def make_pick(self, pick):
        """
        Simulate picking a champion.
        
        Args:
            pick (tuple): (lane, champ) tuple to pick.
        
        Returns:
            DraftState: new state after the pick.
        """
        # Remove the picked champ from the available pool
        if pick[1] in self.picked_champs:
            raise ValueError(f"Pick {pick} not available in remaining champs.")

        #new_team1 = self.team1.copy()
        #new_team2 = self.team2.copy()
        #new_picked_champs = self.picked_champs.copy()

        # Decide which team picks based on turn
        pick_is_team1 = self.pick_team() == 0

        local_score = local_change(self.team1,self.team2,pick_is_team1,pick)

        if pick_is_team1:
            self.team1.append(pick)
            #new_remaininglanes1 = self.remaininglanes1.copy()
            self.remaininglanes1.remove(pick[0])
            #new_remaininglanes2 = self.remaininglanes2
        else:
            self.team2.append(pick)
            #new_remaininglanes2 = self.remaininglanes2.copy()
            self.remaininglanes2.remove(pick[0])
            #new_remaininglanes1 = self.remaininglanes1
        
        self.picked_champs.append(pick[1])

        self.global_rating = self.global_rating + local_score
        self.turn+=1
        return local_score
        # Create the new DraftState
        #new_state = DraftState(team1=new_team1, team2=new_team2, picked_champs=new_picked_champs,remaininglanes1=new_remaininglanes1,remaininglanes2=new_remaininglanes2, turn=self.turn+1, global_rating=new_global_rating)

        #return new_state

    def undo_pick(self,pick,local_score):
        self.turn-=1
        pick_is_team1 = self.pick_team() == 0
        if pick_is_team1:
            self.team1.pop()
            #new_remaininglanes1 = self.remaininglanes1.copy()
            self.remaininglanes1.append(pick[0])
            #new_remaininglanes2 = self.remaininglanes2
        else:
            self.team2.pop()
            #new_remaininglanes2 = self.remaininglanes2.copy()
            self.remaininglanes2.append(pick[0])
            #new_remaininglanes1 = self.remaininglanes1
        self.global_rating = self.global_rating - local_score
        self.picked_champs.pop()

    def draft_finished(self):
        """
        Check if the draft is complete (no remaining picks).
        
        Returns:
            bool: True if draft is done, False otherwise.
        """
        return self.turn == 10

    def __repr__(self):
        return (f"DraftState(turn={self.turn}, "
                f"team1={self.team1}, "
                f"team2={self.team2}, "
                f"picked_champs={len(self.picked_champs)} picked, "
                f"global_rating={self.global_rating:.2f})")

def available_picks(draft_state:DraftState):
    is_team1_picking = draft_state.pick_team() == 0
    possible_picks = []
    if is_team1_picking:
        for i,lane in enumerate(draft_state.remaininglanes1):
            for champ in possible_champs[LANE2INDEX[lane]]:
                if not champ in draft_state.picked_champs:
                    possible_picks.append((lane,champ))
    else:
        for i,lane in enumerate(draft_state.remaininglanes2):
            for champ in possible_champs[LANE2INDEX[lane]]:
                if not champ in draft_state.picked_champs:
                    possible_picks.append((lane,champ))
    return possible_picks

def score_pick(draft_state: DraftState, pick, is_team1_picking):
    """
    Quickly estimate how good a pick is locally.
    """
    return local_change(draft_state.team1, draft_state.team2, is_team1_picking, pick)

def alpha_beta(draft_state:DraftState, depth, alpha, beta):
    if depth == 0 or draft_state.draft_finished():
        return draft_state.global_rating, None
    
    best_pick = None

    is_team1_picking = draft_state.pick_team()==0
    picks = available_picks(draft_state)
    #picks.sort(key=lambda pick: score_pick(draft_state, pick, is_team1_picking), reverse=is_team1_picking)
    if is_team1_picking:
        value = -float('inf')
        for pick in picks:
            local_score = draft_state.make_pick(pick)
            next_value, _ = alpha_beta(draft_state, depth-1, alpha, beta)
            draft_state.undo_pick(pick,local_score)
            if next_value > value:
                value = next_value
                best_pick = pick
            #value = max(value, alpha_beta(next_state, depth-1, alpha, beta))
            alpha = max(alpha, value)
            if alpha >= beta:
                break  # Beta cut-off
    else:
        value = float('inf')
        for pick in picks:
            local_score = draft_state.make_pick(pick)
            next_value, _ = alpha_beta(draft_state, depth-1, alpha, beta)
            draft_state.undo_pick(pick,local_score)
            if next_value < value:
                value = next_value
                best_pick = pick
            beta = min(beta, value)
            if beta <= alpha:
                break  # Alpha cut-off
    
    return value,best_pick




#MCTS
import math
import random
from collections import defaultdict

class MCTSNode:
    def __init__(self, draft_state: DraftState, parent=None, pick=None):
        self.draft_state = draft_state
        self.parent = parent
        self.pick = pick  # The pick that led to this node
        self.children = []
        self.visits = 0
        self.value = 0.0
        self.untried_picks = available_picks(draft_state)

    def is_fully_expanded(self):
        return len(self.untried_picks) == 0

    def best_child(self, c_param=1.4):
        # UCB1 formula: exploitation + exploration
        choices = [
            (child.value / child.visits) + c_param * math.sqrt(2 * math.log(self.visits) / child.visits)
            for child in self.children
        ]
        return self.children[choices.index(max(choices))]

    def expand(self):
        pick = self.untried_picks.pop()
        #print(pick)
        #local_score = self.draft_state.make_pick(pick)
        #next_state = self.draft_state.make_pick(pick)
        child_node = MCTSNode(self.draft_state, parent=self, pick=pick)
        #child_node.local_score = local_score
        self.children.append(child_node)
        return child_node

    def backpropagate(self, result):
        self.visits += 1
        self.value += result
        if self.parent:
            self.parent.backpropagate(result)

    def is_terminal_node(self):
        return self.draft_state.draft_finished()

    def rollout(self):
        current_state = self.draft_state
        history = []  # To undo the picks after simulation
        while not current_state.draft_finished():
            picks = available_picks(current_state)
            pick = random.choice(picks)
            local_score = current_state.make_pick(pick)
            history.append((pick, local_score))
            #current_state = current_state.make_pick(pick)
        result = current_state.global_rating
        #print('history',history)
        for pick, local_score in reversed(history):
            current_state.undo_pick(pick, local_score)
        return result  # Final evaluation after full draft
    
def mcts(draft_state, n_simulations):
    root = MCTSNode(draft_state)

    for _ in range(n_simulations):
        node = root
        # Selection
        while not node.is_terminal_node() and node.is_fully_expanded():
            node = node.best_child()

        # Expansion
        if not node.is_terminal_node():
            node = node.expand()

        # Simulation
        pick = node.pick
        local_score = draft_state.make_pick(pick)
        result = node.rollout()
        draft_state.undo_pick(pick, local_score)

        # Backpropagation
        node.backpropagate(result)

    # Pick the most visited child (not the one with highest value!)
    best_child = max(root.children, key=lambda c: c.visits)
    return best_child.pick