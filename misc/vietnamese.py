import numpy as np
from random import shuffle
import math
import matplotlib.pyplot as plt

def F(a,b,c,d,e,f,g,h,i):
    return a + 13.*b/c + d + 12.*e - f + float(g)*h/i

x = range(1,10)

N = int(1e3)
k = 0
A = []
fac = math.factorial(9)

while k < N:
    tmp = 1
    counter = 0
    while tmp == 1:
        shuffle(x)
        a,b,c,d,e,f,g,h,i = x
        G = F(a,b,c,d,e,f,g,h,i)
        if G  == 87:
            tmp = 0
        counter += 1
    A.append(counter + counter*(1-(1 - 1./fac)**counter))
    k += 1

B = np.mean(A)
print "Number of tries : ", B
print "Approximate number of solutions : ", fac/B

X = range(N)
plt.plot(X,A,X,B*np.ones(N),'r-')
plt.show()
