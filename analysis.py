from utils import LANES, LANE2INDEX
# from lolstats import sdelta2,mdelta2
import json

# from sklearn.decomposition import PCA
# from sklearn.manifold import TSNE
# import umap

# import hdbscan
# from sklearn.cluster import KMeans

# import matplotlib.pyplot as plt
# from adjustText import adjust_text
# import numpy as np



def get_patches_data(patches,region='all',rank='emerald_plus'):
    patches_data = {}

    for patch in patches:
        print(patch)
        with open(f'data/lolalytics_data_{patch}_{rank}_{region}.json', 'r', encoding='utf-8') as f:
            patch_data = json.load(f)
        patches_data[patch] = patch_data
        
    return patches_data

def get_relevent_champions(patches,patches_data,min_playrate=0.5,patch_min_playrate=1,champion2rem=[],patch_penality=-100):

    champions_per_lane = [set() for _ in LANES]
    for patch in patches:
        for i,l in enumerate(LANES):
            champions_per_lane[i].update(list(patches_data[patch][l].keys()))


    accepted_cpl = [[] for _ in LANES]

    for i,l in enumerate(LANES):
        for laner in champions_per_lane[i]:
            if laner in champion2rem:
                continue
            playrates = []
            for patch in patches:
                if laner in patches_data[patch][l]:
                    playrates.append(patches_data[patch][l][laner]['Pick_rate'])
                else:
                    #playrates.append(0.1)
                    playrates.append(patch_penality)#REMOVE CHAMPION WITH PLAYRATE TOO LOW ON ONE OF THE PATCH if -100
            moyenne = sum(playrates) / float(len(playrates))
            if moyenne>min_playrate or playrates[0]>patch_min_playrate:#if champ is relevent this patch #NEWADD
                accepted_cpl[i].append((laner,moyenne,playrates))

    for i,l in enumerate(LANES):
        #print(l)
        accepted_cpl[i] = sorted(accepted_cpl[i], key=lambda x: x[1], reverse=True)
        #print([a[0] for a in accepted_cpl[i]])
    return accepted_cpl

def get_champion_winrates(accepted_cpl,patches,patches_data):
    champ_winrates = {}
    for i,lane in enumerate(LANES):
        lcw = {}
        for laner,_,_ in accepted_cpl[i]:
            own_wr = 0
            own_ngames = 0
            for patch in patches:
                pdata = patches_data[patch][lane][laner]
                own_wr += pdata['Win_perc']*pdata['Games']
                own_ngames += pdata['Games']
            overall_winrate = own_wr/own_ngames
            lcw[laner] = overall_winrate
        champ_winrates[lane] = lcw

    return champ_winrates


def get_overall_tier_winrate(patches,patches_data):
    nw = 0
    ng = 0
    for patch in patches:#['patch_infos']
        #print(patches_data[patch]['patch_infos'])
        w = patches_data[patch]['patch_infos']['tier_win_rate']
        g = patches_data[patch]['patch_infos']['number_of_games']
        nw += w*g
        ng += g
    tier_winrate = nw/ng
    return tier_winrate

# def get_archetype_plot(lane,accepted_cpl,patches,patches_data,lane_synergies_2_consider = None,lane_matchups_2_consider=None,redux='UMAP',coloration='k-means',n_clusters=5,cluster_labels = None):
#     lane_index = LANE2INDEX[lane]
#     accepted_laners = accepted_cpl[lane_index]

#     if lane_synergies_2_consider is None:
#         lane_synergies_2_consider = ['top', 'jungle', 'middle', 'bottom', 'support']
#     else:
#         lane_synergies_2_consider = lane_synergies_2_consider.copy()  # Create a copy

#     if lane_matchups_2_consider is None:
#         lane_matchups_2_consider = ['top', 'jungle', 'middle', 'bottom', 'support']
#     else:
#         lane_matchups_2_consider = lane_matchups_2_consider.copy()  # Create a copy


#     if lane in lane_synergies_2_consider:#REMOVE LANE STUDIED FROM SYNERGIES STUDIED
#         lane_synergies_2_consider.remove(lane) #MAYBE THIS CAUSES THE PB

#     mvs = []

#     # accepted_cpl_wcl = [x for i, x in enumerate(accepted_cpl) if i != lane_index]
#     # lanes_wcl = [x for i, x in enumerate(LANES) if i != lane_index]

#     for i,a in enumerate(accepted_laners):

#         #matchups_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5)]#HERE
#         matchups_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in lane_matchups_2_consider]
#         matchups_ngames = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in lane_matchups_2_consider]#HERE
#         #synergies_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if i!=lane_index]#HERE
#         synergies_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in lane_synergies_2_consider]#HERE
#         synergies_ngames = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in lane_synergies_2_consider]#HERE

#         own_wr = 0
#         own_ngames = 0

#         laner,_,_ = a
#         n_patch = 0
        
#         for patch in patches:
#             pdata = patches_data[patch][lane][laner]

#             own_wr += pdata['Win_perc']*pdata['Games']
#             own_ngames += pdata['Games']

#             #MATCHUPS
#             #for k,accepted_champions in enumerate(accepted_cpl):#HERE
#             for k,mlane in enumerate(lane_matchups_2_consider):
#                 mdata = pdata['Matchups'][mlane]#HERE
#                 #mdata = pdata['Matchups'][LANES[k]]
#                 accepted_champions = accepted_cpl[LANE2INDEX[mlane]]#HERE
#                 for j,b in enumerate(accepted_champions):
#                     laner_vs,_,_ = b
#                     if laner == laner_vs:
#                         matchups_wr[k][j] = -1 #TREAT AT THE END
#                         matchups_ngames[k][j] = 1
#                         continue
#                     else:
#                         g = int(mdata[laner_vs]['games'])
#                         wr = float(mdata[laner_vs]['win_rate'])
#                         matchups_wr[k][j] += wr*g
#                         matchups_ngames[k][j] += g
            
#             #SYNERGIES
#             #for k,accepted_champions in enumerate(accepted_cpl_wcl):#HERE
#             for k,slane in enumerate(lane_synergies_2_consider):
#                 #lane2 = lanes_wcl[k]#HERE
#                 sdata = pdata['Synergies'][slane]#HERE
#                 accepted_champions = accepted_cpl[LANE2INDEX[slane]]
#                 for j,b in enumerate(accepted_champions):
#                     laner_with,_,_ = b
#                     if laner == laner_with:
#                         synergies_wr[k][j] = -1 #TREAT AT THE END
#                         synergies_ngames[k][j] = 1
#                         continue
#                     else:
#                         g = int(sdata[laner_with]['games'])
#                         wr = float(sdata[laner_with]['win_rate'])
#                         synergies_wr[k][j] += wr*g
#                         synergies_ngames[k][j] += g

#         overall_winrate = own_wr/own_ngames
#         # matchup_winrates = [[-1 if matchups_wr[k][j]==-1 else matchups_wr[k][j]/matchups_ngames[k][j] for j in range(len(accepted_cpl[k]))] for k in range(5)]#HERE
#         # synergies_winrates = [[-1 if synergies_wr[k][j]==-1 else synergies_wr[k][j]/synergies_ngames[k][j] for j in range(len(accepted_cpl_wcl[k]))] for k in range(4)]#HERE
#         matchup_winrates = [[-1 if matchups_wr[k][j]==-1 else matchups_wr[k][j]/matchups_ngames[k][j] for j in range(len(accepted_cpl[LANE2INDEX[mlane]]))] for k,mlane in enumerate(lane_matchups_2_consider)]
#         synergies_winrates = [[-1 if synergies_wr[k][j]==-1 else synergies_wr[k][j]/synergies_ngames[k][j] for j in range(len(accepted_cpl[LANE2INDEX[slane]]))] for k,slane in enumerate(lane_synergies_2_consider)]
#         mvs.append((a[0],overall_winrate,matchup_winrates,synergies_winrates))
    
#     fmvs = [0 for _ in mvs]
#     champ_winrates = get_champion_winrates(accepted_cpl,patches,patches_data)
#     tier_winrate = get_overall_tier_winrate(patches,patches_data)
#     for i,line in enumerate(mvs):
#         name, cwr, mwr,swr = line 
#         #print(name)

#         matchups_delta2s = []
#         for j,lane_mwr in enumerate(mwr):
#             for k,w_ab in enumerate(lane_mwr):
#                 if w_ab>0:
#                     #matchups_delta2s.append(round(mdelta2(w_ab,cwr,champ_winrates[LANES[j]][accepted_cpl[j][k][0]],tier_winrate),2))#HERE
#                     mlane = lane_matchups_2_consider[j]
#                     matchups_delta2s.append(round(mdelta2(w_ab,cwr,champ_winrates[mlane][accepted_cpl[LANE2INDEX[mlane]][k][0]],tier_winrate),2))#HERE
#                 else:
#                     matchups_delta2s.append(0)

#         synergies_delta2s = []
#         for j,lane_swr in enumerate(swr):
#             for k,w_ab in enumerate(lane_swr):
#                 if w_ab>0:
#                     slane = lane_synergies_2_consider[j]
#                     synergies_delta2s.append(round(sdelta2(w_ab,cwr,champ_winrates[slane][accepted_cpl[LANE2INDEX[slane]][k][0]],tier_winrate),2))#HERE
#                 else:
#                     synergies_delta2s.append(0)
#         #print(len(matchups_delta2s),len(synergies_delta2s))
#         fmvs[i] = (name,cwr,matchups_delta2s+synergies_delta2s)

#     # Step 1: Extract features and names
#     features = [entry[2] for entry in fmvs]
#     names = [entry[0] for entry in fmvs]

#     plt.figure(figsize=(10, 6))

#     if redux=='PCA':
#         # Step 2: Apply PCA
#         pca = PCA(n_components=2)  # Reduce to 2D for visualization
#         pca_result = pca.fit_transform(features)  # Shape: (num_samples, 2)
#         # Step 3: Plot or use result
#         x_coords, y_coords = pca_result[:, 0], pca_result[:, 1]

#         plt.title("PCA of Champion Features")
#         plt.xlabel("PC1")
#         plt.ylabel("PC2")

#     elif redux=='UMAP':
#         # Step 2: Apply UMAP
#         umap_model = umap.UMAP(n_components=2, random_state=42)
#         umap_result = umap_model.fit_transform(features)  # Shape: (num_samples, 2)

#         # Step 3: Plot results
#         x_coords, y_coords = umap_result[:, 0], umap_result[:, 1]

#         plt.title("UMAP of Champion Features")
#         plt.xlabel("UMAP1")
#         plt.ylabel("UMAP2")

#     elif redux=='T-SNE':
#         features_array = np.array(features)
#         # Step 1: Apply t-SNE
#         tsne_model = TSNE(n_components=2, random_state=42, perplexity=30, n_iter=1000)
#         tsne_result = tsne_model.fit_transform(features_array)  # Shape: (num_samples, 2)
#         # Step 2: Plot results
#         x_coords, y_coords = tsne_result[:, 0], tsne_result[:, 1]

#         plt.title("t-SNE of Champion Features")
#         plt.xlabel("t-SNE1")
#         plt.ylabel("t-SNE2")

    

#     if coloration=='k-means':
#         kmeans = KMeans(n_clusters=n_clusters, random_state=42)
#         cluster_labels = kmeans.fit_predict(umap_result)
#         scatter = plt.scatter(x_coords, y_coords, c=cluster_labels, cmap='viridis', s=50, alpha=0.7)
#     elif coloration=='hdbscan':
#         hdb = hdbscan.HDBSCAN(min_cluster_size=3)
#         cluster_labels = hdb.fit_predict(umap_result)
#         scatter = plt.scatter(x_coords, y_coords, c=cluster_labels, cmap='viridis', s=50, alpha=0.7)
#     elif coloration=='custom':
#         scatter = plt.scatter(x_coords, y_coords,c=cluster_labels, cmap='viridis', s=50, alpha=0.7)
#     else:#if coloration=='none'
#         scatter = plt.scatter(x_coords, y_coords)
#     texts = []
#     for i, name in enumerate(names):
#         text = plt.text(x_coords[i], y_coords[i], name, fontsize=9)
#         texts.append(text)
#     adjust_text(texts, x=x_coords, y=y_coords, expand_points=(1, 1),arrowprops=dict(arrowstyle='-', color='gray', lw=0.5),
#                     add_objects=scatter,prevent_crossings = True,ensure_inside_axes=True,time_lim=1)
#     plt.grid(True)
#     plt.tight_layout()
#     plt.show()
#     return names,features, cluster_labels

# def get_rafined_archetype_plot(lane,accepted_cpl,patches,patches_data,lane_synergies_2_consider = None,lane_matchups_2_consider=None,redux='UMAP',coloration='k-means',n_clusters=5,cluster_labels = None):
#     lane_index = LANE2INDEX[lane]
#     accepted_laners = accepted_cpl[lane_index]

#     if lane_synergies_2_consider is None:
#         lane_synergies_2_consider = ['top', 'jungle', 'middle', 'bottom', 'support']
#     else:
#         lane_synergies_2_consider = lane_synergies_2_consider.copy()  # Create a copy

#     if lane_matchups_2_consider is None:
#         lane_matchups_2_consider = ['top', 'jungle', 'middle', 'bottom', 'support']
#     else:
#         lane_matchups_2_consider = lane_matchups_2_consider.copy()  # Create a copy


#     if lane in lane_synergies_2_consider:#REMOVE LANE STUDIED FROM SYNERGIES STUDIED
#         lane_synergies_2_consider.remove(lane) #MAYBE THIS CAUSES THE PB

#     mvs = []

#     # accepted_cpl_wcl = [x for i, x in enumerate(accepted_cpl) if i != lane_index]
#     # lanes_wcl = [x for i, x in enumerate(LANES) if i != lane_index]

#     for i,a in enumerate(accepted_laners):

#         #matchups_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5)]#HERE
#         matchups_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in lane_matchups_2_consider]
#         matchups_ngames = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in lane_matchups_2_consider]#HERE
#         #synergies_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if i!=lane_index]#HERE
#         synergies_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in lane_synergies_2_consider]#HERE
#         synergies_ngames = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in lane_synergies_2_consider]#HERE

#         #matchups_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5)]#HERE
#         reversed_matchups_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in lane_matchups_2_consider]
#         reversed_matchups_ngames = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in lane_matchups_2_consider]#HERE
#         #synergies_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if i!=lane_index]#HERE
#         reversed_synergies_wr = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in lane_synergies_2_consider]#HERE
#         reversed_synergies_ngames = [[0 for _ in range(len(accepted_cpl[i]))] for i in range(5) if LANES[i] in lane_synergies_2_consider]#HERE

#         own_wr = 0
#         own_ngames = 0

#         laner,_,_ = a
#         n_patch = 0
        
#         for patch in patches:
#             pdata = patches_data[patch][lane][laner]

#             own_wr += pdata['Win_perc']*pdata['Games']
#             own_ngames += pdata['Games']

#             #MATCHUPS
#             #for k,accepted_champions in enumerate(accepted_cpl):#HERE
#             for k,mlane in enumerate(lane_matchups_2_consider):
#                 mdata = pdata['Matchups'][mlane]#HERE
#                 #mdata = pdata['Matchups'][LANES[k]]
#                 accepted_champions = accepted_cpl[LANE2INDEX[mlane]]#HERE
#                 for j,b in enumerate(accepted_champions):
#                     laner_vs,_,_ = b
#                     if laner == laner_vs:
#                         matchups_wr[k][j] = -1 #TREAT AT THE END
#                         matchups_ngames[k][j] = 1
#                         reversed_matchups_wr[k][j] = -1 #TREAT AT THE END
#                         reversed_matchups_ngames[k][j] = 1
#                         continue
#                     else:
#                         g = int(mdata[laner_vs]['games'])
#                         wr = float(mdata[laner_vs]['win_rate'])
#                         matchups_wr[k][j] += wr*g
#                         matchups_ngames[k][j] += g

#                         p2data = patches_data[patch][mlane][laner_vs]
#                         mdata2 = p2data['Matchups'][lane][laner]
#                         g2 = int(mdata2['games'])
#                         wr2 = float(mdata2['win_rate'])
#                         reversed_matchups_wr[k][j] += wr2*g2
#                         reversed_matchups_ngames[k][j] += g2
            
#             #SYNERGIES
#             #for k,accepted_champions in enumerate(accepted_cpl_wcl):#HERE
#             for k,slane in enumerate(lane_synergies_2_consider):
#                 #lane2 = lanes_wcl[k]#HERE
#                 sdata = pdata['Synergies'][slane]#HERE
#                 accepted_champions = accepted_cpl[LANE2INDEX[slane]]
#                 for j,b in enumerate(accepted_champions):
#                     laner_with,_,_ = b
#                     if laner == laner_with:
#                         synergies_wr[k][j] = -1 #TREAT AT THE END
#                         synergies_ngames[k][j] = 1
#                         reversed_synergies_wr[k][j] = -1 #TREAT AT THE END
#                         reversed_synergies_ngames[k][j] = 1
#                         continue
#                     else:
#                         g = int(sdata[laner_with]['games'])
#                         wr = float(sdata[laner_with]['win_rate'])
#                         synergies_wr[k][j] += wr*g
#                         synergies_ngames[k][j] += g

#                         p2data = patches_data[patch][slane][laner_with]
#                         mdata2 = p2data['Matchups'][lane][laner]
#                         g2 = int(mdata2['games'])
#                         wr2 = float(mdata2['win_rate'])
#                         reversed_synergies_wr[k][j] += wr2*g2
#                         reversed_synergies_ngames[k][j] += g2

#         overall_winrate = own_wr/own_ngames
#         # matchup_winrates = [[-1 if matchups_wr[k][j]==-1 else matchups_wr[k][j]/matchups_ngames[k][j] for j in range(len(accepted_cpl[k]))] for k in range(5)]#HERE
#         # synergies_winrates = [[-1 if synergies_wr[k][j]==-1 else synergies_wr[k][j]/synergies_ngames[k][j] for j in range(len(accepted_cpl_wcl[k]))] for k in range(4)]#HERE
#         matchup_winrates = [[-1 if matchups_wr[k][j]==-1 else matchups_wr[k][j]/matchups_ngames[k][j] for j in range(len(accepted_cpl[LANE2INDEX[mlane]]))] for k,mlane in enumerate(lane_matchups_2_consider)]
#         synergies_winrates = [[-1 if synergies_wr[k][j]==-1 else synergies_wr[k][j]/synergies_ngames[k][j] for j in range(len(accepted_cpl[LANE2INDEX[slane]]))] for k,slane in enumerate(lane_synergies_2_consider)]
#         reversed_matchup_winrates = [[-1 if reversed_matchups_wr[k][j]==-1 else reversed_matchups_wr[k][j]/reversed_matchups_ngames[k][j] for j in range(len(accepted_cpl[LANE2INDEX[mlane]]))] for k,mlane in enumerate(lane_matchups_2_consider)]
#         reversed_synergies_winrates = [[-1 if reversed_synergies_wr[k][j]==-1 else reversed_synergies_wr[k][j]/reversed_synergies_ngames[k][j] for j in range(len(accepted_cpl[LANE2INDEX[slane]]))] for k,slane in enumerate(lane_synergies_2_consider)]
        
#         mvs.append((a[0],overall_winrate,matchup_winrates,synergies_winrates,reversed_matchup_winrates,reversed_synergies_winrates))
    
#     fmvs = [0 for _ in mvs]
#     champ_winrates = get_champion_winrates(accepted_cpl,patches,patches_data)
#     tier_winrate = get_overall_tier_winrate(patches,patches_data)
#     for i,line in enumerate(mvs):
#         name, cwr, mwr,swr,rmwr,rswr = line 
#         #print(name)

#         matchups_delta2s = []
#         for j,lane_mwr in enumerate(mwr):
#             for k,w_ab in enumerate(lane_mwr):
#                 if w_ab>0:
#                     #matchups_delta2s.append(round(mdelta2(w_ab,cwr,champ_winrates[LANES[j]][accepted_cpl[j][k][0]],tier_winrate),2))#HERE
#                     mlane = lane_matchups_2_consider[j]
#                     d2 = mdelta2(w_ab,cwr,champ_winrates[mlane][accepted_cpl[LANE2INDEX[mlane]][k][0]],tier_winrate)
#                     rd2 = mdelta2(rmwr[j][k],champ_winrates[mlane][accepted_cpl[LANE2INDEX[mlane]][k][0]],cwr,tier_winrate)
#                     matchups_delta2s.append(round((d2-rd2)/2,2))#MEAN WITH OTHER CHAMPION TO HAVE BETTER IDEA ?
#                 else:
#                     matchups_delta2s.append(0)

#         synergies_delta2s = []
#         for j,lane_swr in enumerate(swr):
#             for k,w_ab in enumerate(lane_swr):
#                 if w_ab>0:
#                     slane = lane_synergies_2_consider[j]
#                     d2 = sdelta2(w_ab,cwr,champ_winrates[slane][accepted_cpl[LANE2INDEX[slane]][k][0]],tier_winrate)
#                     rd2 = sdelta2(rswr[j][k],champ_winrates[slane][accepted_cpl[LANE2INDEX[slane]][k][0]],cwr,tier_winrate)
#                     synergies_delta2s.append(round((d2+rd2)/2,2))#HERE
#                 else:
#                     synergies_delta2s.append(0)
#         #print(len(matchups_delta2s),len(synergies_delta2s))
#         fmvs[i] = (name,cwr,matchups_delta2s+synergies_delta2s)

#     # Step 1: Extract features and names
#     features = [entry[2] for entry in fmvs]
#     names = [entry[0] for entry in fmvs]

#     plt.figure(figsize=(10, 6))

#     if redux=='PCA':
#         # Step 2: Apply PCA
#         pca = PCA(n_components=2)  # Reduce to 2D for visualization
#         pca_result = pca.fit_transform(features)  # Shape: (num_samples, 2)
#         # Step 3: Plot or use result
#         x_coords, y_coords = pca_result[:, 0], pca_result[:, 1]

#         plt.title("PCA of Champion Features")
#         plt.xlabel("PC1")
#         plt.ylabel("PC2")

#     elif redux=='UMAP':
#         # Step 2: Apply UMAP
#         umap_model = umap.UMAP(n_components=2, random_state=42)
#         umap_result = umap_model.fit_transform(features)  # Shape: (num_samples, 2)

#         # Step 3: Plot results
#         x_coords, y_coords = umap_result[:, 0], umap_result[:, 1]

#         plt.title("UMAP of Champion Features")
#         plt.xlabel("UMAP1")
#         plt.ylabel("UMAP2")

#     elif redux=='T-SNE':
#         features_array = np.array(features)
#         # Step 1: Apply t-SNE
#         tsne_model = TSNE(n_components=2, random_state=42, perplexity=30, n_iter=1000)
#         tsne_result = tsne_model.fit_transform(features_array)  # Shape: (num_samples, 2)
#         # Step 2: Plot results
#         x_coords, y_coords = tsne_result[:, 0], tsne_result[:, 1]

#         plt.title("t-SNE of Champion Features")
#         plt.xlabel("t-SNE1")
#         plt.ylabel("t-SNE2")

    

#     if coloration=='k-means':
#         kmeans = KMeans(n_clusters=n_clusters, random_state=42)
#         cluster_labels = kmeans.fit_predict(umap_result)
#         scatter = plt.scatter(x_coords, y_coords, c=cluster_labels, cmap='viridis', s=50, alpha=0.7)
#     elif coloration=='hdbscan':
#         hdb = hdbscan.HDBSCAN(min_cluster_size=3)
#         cluster_labels = hdb.fit_predict(umap_result)
#         scatter = plt.scatter(x_coords, y_coords, c=cluster_labels, cmap='viridis', s=50, alpha=0.7)
#     elif coloration=='custom':
#         scatter = plt.scatter(x_coords, y_coords,c=cluster_labels, cmap='viridis', s=50, alpha=0.7)
#     else:#if coloration=='none'
#         scatter = plt.scatter(x_coords, y_coords)
#     texts = []
#     for i, name in enumerate(names):
#         text = plt.text(x_coords[i], y_coords[i], name, fontsize=9)
#         texts.append(text)
#     adjust_text(texts, x=x_coords, y=y_coords, expand_points=(1, 1),arrowprops=dict(arrowstyle='-', color='gray', lw=0.5),
#                     add_objects=scatter,prevent_crossings = True,ensure_inside_axes=True,time_lim=1)
#     plt.grid(True)
#     plt.tight_layout()
#     plt.show()
#     return names,features, cluster_labels
        
