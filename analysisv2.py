from utils import LANES, LANE2INDEX

def get_true_winrate_per_patch(patches_data,patches,accepted_cpl):
    true_winrate_per_patch = []
    for patch in patches:
        true_winrate_matrix = {}

        for lane in LANES:
            lane_results = {}

            for champ in patches_data[patch][lane]:
                champ_data = patches_data[patch][lane][champ]
                n_games = champ_data['Games']
                unadj_winrate = champ_data['Win_perc']

                matchup_diffs = []
                synergy_diffs = []

                aggregate_matchups = 0
                aggregate_synergies = 0

                # --- MATCHUPS ---
                for i, lane2face in enumerate(LANES):
                    adj_winrate = 0
                    playrate_sum = 0
                    for champ2face, _, _ in accepted_cpl[i]:
                        playrate = patches_data[patch][lane2face][champ2face]['Pick_rate']
                        if champ2face != champ and champ2face in champ_data['Matchups'][lane2face]:
                            matchup_winrate = float(champ_data['Matchups'][lane2face][champ2face]['win_rate'])
                            matchup_playrate = float(champ_data['Matchups'][lane2face][champ2face]['games']) / n_games
                            diff = (matchup_winrate - unadj_winrate) * (matchup_playrate - playrate) / 100
                        else:
                            continue
                        adj_winrate += matchup_winrate * playrate
                        playrate_sum += playrate

                        matchup_diffs.append(((champ2face, lane2face), diff, matchup_winrate - unadj_winrate))

                    if playrate_sum > 0:
                        adj_winrate /= playrate_sum
                        aggregate_matchups += unadj_winrate - adj_winrate

                # --- SYNERGIES ---
                for i, lanewith in enumerate(LANES):
                    if lanewith == lane:
                        continue
                    adj_winrate = 0
                    playrate_sum = 0
                    for allychamp, _, _ in accepted_cpl[i]:
                        playrate = patches_data[patch][lanewith][allychamp]['Pick_rate']
                        if allychamp != champ and allychamp in champ_data['Synergies'][lanewith]:
                            #print(champ,lane,lanewith,allychamp)
                            synergy_winrate = float(champ_data['Synergies'][lanewith][allychamp]['win_rate'])
                            synergy_playrate = float(champ_data['Synergies'][lanewith][allychamp]['games']) / n_games
                            diff = (synergy_winrate - unadj_winrate) * (synergy_playrate - playrate) / 100
                        else:
                            continue
                        adj_winrate += synergy_winrate * playrate
                        playrate_sum += playrate

                        synergy_diffs.append(((allychamp, lanewith), diff, synergy_winrate - unadj_winrate))

                    if playrate_sum > 0:
                        adj_winrate /= playrate_sum
                        aggregate_synergies += unadj_winrate - adj_winrate

                true_winrate = unadj_winrate - aggregate_matchups - aggregate_synergies

                # Store true winrate for (lane, champ)
                lane_results[champ] = true_winrate

            true_winrate_matrix[lane] = lane_results
        true_winrate_per_patch.append(true_winrate_matrix)
    return true_winrate_per_patch


def get_matchup_values(accepted_cpl,patches,patches_data,lane,champ):
    matchups_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in LANES]
    matchups_ngames = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in LANES]
    
    for patch in patches:
        pdata = patches_data[patch][lane][champ]
        for k,mlane in enumerate(LANES):
            mdata = pdata['Matchups'][mlane]#HERE
            #mdata = pdata['Matchups'][LANES[k]]
            accepted_champions = accepted_cpl[LANE2INDEX[mlane]]#HERE
            for j,b in enumerate(accepted_champions):
                laner_vs,_,_ = b
                if champ == laner_vs:
                    matchups_wr[k][j] = -1 #TREAT AT THE END
                    matchups_ngames[k][j] = 1
                    continue
                else:
                    g = int(mdata[laner_vs]['games'])
                    wr = float(mdata[laner_vs]['win_rate'])
                    matchups_wr[k][j] += wr*g
                    matchups_ngames[k][j] += g
    matchup_winrates = [[-1 if matchups_wr[k][j]==-1 else matchups_wr[k][j]/matchups_ngames[k][j] for j in range(len(accepted_cpl[LANE2INDEX[mlane]]))] for k,mlane in enumerate(LANES)]
    return matchup_winrates


def get_synergie_values(accepted_cpl,patches,patches_data,lane,champ):
    synergie_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in LANES]
    synergie_ngames = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in LANES]
    
    for patch in patches:
        pdata = patches_data[patch][lane][champ]
        for k,mlane in enumerate(LANES):
            if mlane != lane:
                mdata = pdata['Synergies'][mlane]#HERE
                #mdata = pdata['Matchups'][LANES[k]]
                accepted_champions = accepted_cpl[LANE2INDEX[mlane]]#HERE
                for j,b in enumerate(accepted_champions):
                    laner_vs,_,_ = b
                    if champ == laner_vs:
                        synergie_wr[k][j] = -1 #TREAT AT THE END
                        synergie_ngames[k][j] = 1
                        continue
                    else:
                        g = int(mdata[laner_vs]['games'])
                        wr = float(mdata[laner_vs]['win_rate'])
                        synergie_wr[k][j] += wr*g
                        synergie_ngames[k][j] += g
            else:
                for j in range(len(accepted_cpl[LANE2INDEX[mlane]])):
                    synergie_wr[k][j]==-1
    synergies_winrates = [[-1 if synergie_wr[k][j]==-1 else synergie_wr[k][j]/max(1,synergie_ngames[k][j]) for j in range(len(accepted_cpl[LANE2INDEX[mlane]]))] for k,mlane in enumerate(LANES)]
    return synergies_winrates

