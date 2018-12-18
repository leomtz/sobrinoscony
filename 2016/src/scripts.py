
s="[\n"
k=1
for i in range(27):
    for j in range(27):
        if k>=237:
            est="blue"
            est_tr=-0.5
        if k>=688:
            est="green"
            est_tr=0.5
        if k>=725:
            est="black"
            est_tr=1.5
        s+='    {{"x":{0},"y":{1},"est":"{2}","est_tr":{3}}},\n'.format(i,j,est,est_tr)
        k+=1
s=s[:-2]+"]"
f=open('pairs.json','w')
f.write(s)
f.close