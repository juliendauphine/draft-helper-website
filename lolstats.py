import math

def f(a,b):
    #Compute the winrate gap
    return 100/( 1 + 10 ** ( math.log10((100/a)-1)-math.log10((100/b)-1) ) )

def g(a,b):
    return 100/( 1 + 10 ** ( math.log10((100/a)-1)+math.log10((100/b)-1) ) )

def mdelta2(w_ab,wa,wb,w_tier):
    wa -= (w_tier-50) #Rescale winrates using tier winrates
    wb -= (w_tier-50)
    w_ab -= (w_tier-50)
    #print(wa,wb,w_ab,f(wa,wb))
    return w_ab - f(wa,wb)

def sdelta2(w_ab,wa,wb,w_tier):#for synergies
    wa -= (w_tier-50) #Rescale winrates using tier winrates
    wb -= (w_tier-50)
    w_ab -= (w_tier-50)
    #print(wa,wb,w_ab,f(wa,wb))
    return w_ab - g(wa,wb)

def winrate2rating(w):
    try:
        v = -400 * math.log10(( 1 / w ) - 1)
    except:
        print(w)
    return -400 * math.log10(( 1 / w ) - 1)

def rating2winrate(r):
    return 1/(1+10**(-r/400))