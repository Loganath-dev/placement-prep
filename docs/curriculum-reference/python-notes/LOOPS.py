#loops are control the flow of code 
#they repeat the block of code over and over until the condition is met 
#for loop

#go through a group of items one by one -for loop
#for i in (1,2,3)-sequence
#i is the loop variable
#python iterator will check what is already done and what is remaining 
# for i in (1,2,3):
#     print(i)
# for i in range(1,6):
#     print(f"Round:{i}") 
# Round:1
# Round:2
# Round:3
# Round:4
# Round:5
#  print("Round:",i)
# Round: 1
# Round: 2
# Round: 3
# Round: 4
# Round: 5

# items=[1,2,3,"hi"]
# for item in items:
#     print(f"Round:{item}")

# for sequence-range,string,list,tuple,file,dict,any thing that iterates

#range function -range(start,stop,step)
#stop-(n-1)
#step is used for the incrementation 
#range(0,10,2)=0,2,4,6,8 not 10 because 10 is our stop value
#range(1,10,2)=1,3,5,7,9

#data preperation ,cleaning ,liking summing ,counting,avergae we use for loop

# scores=[80,50,60,75]
# total=0
# for score in scores:
#     total+=score  #here scores is a error we need to use the variable only 
#     print("current total",total)
# print("final",total)
#data cleaning ,preperation 
# files=["report.csv  ",  "data.csv  ",  "final.txt "]
# #inconsistent casing and unnesscary spaces
# for file in files:
#     file=file.strip().lower().replace("txt","csv")
#     print(f"processing {file}") 

# #for loop to print 7th table 
# for i in range(1,11):
#     print(i,f"* 7={i*7}")

#to print a stars from left alinged to 6 
# for i in range(6,0,-1):
#    print("*"*i)

#control statements
#when to stop,continue,pass

#break 

#break is used to stop the loop immediately all remaining values are ingonered 
#we use in security issues 
# for i in range(1,6):
#     if i==3:
#         break
#     print(i) 

#continue is used to stop that particular value and again
#skip this value ,empty data,bad rows,empty file
# for i in range(1,6):
#      if i==3:
#          continue
#      print(i) 

# names=["gg","uu"," ","hhh"]
# for name in names:
#      if name==" ":
#           print("empty not acceptable")
#           break
#      print(name)

#pass is just like a placeholder nothing happens 
#keep doing dont stop and stop skip 
# for i in range(1,6):
#     if i==3:
#         pass
#     print(i) 

#we use pass as a placeholder 
#we use pass when we dont want to break or continue 

#real world examples 
#skips weekend in calender loop

# days=["mon",'sun','wed','tue']
#weekend=["sun","sat"]
# for day in days:
#     if day in["sat",'sun']:#weekend
#         continue
#     print(f"workday:{day}")


# emails=[
#     'data@gmail.com',
#     'aaa@outlook.de',
#     'DROP TABLE USERS;',#sql ingection could use hackers
#     'maria@gmail.com'
# ]
# for email in emails:
#     if ';' in email:
#         print("sql injection:hacker attack ")
#         break
#     print(f"processing email: {email}")

#else statement 
# for i in (1,2,3):
#     print(i)
# else:
#     print("end ") #excuted when we reach the last item 

# items=[1,4,6,5]
# for i in items:
#     print(i)
# else:  #useless here 
#     print("loop is completed ")

#we use else when we have break statement
# items=[1,5,3,7] 
# for i in items:
#     if i%2==0:
#         print("even nr,found",i)
#         break
#     print(i)
# else:
#     print("loop ids ended")  #here else will not run because the break will end when i==2

#for else use case
#to fidn bad value,data we use for else
#to find any missing values 

# names=["aaa","sss",None,"scdc"]

# for name in names:
#     if name==None:
#         print("found a missing name")
#         break
# else:
#     print("all names are available")

# here theoutput is found a missing name if we dont have any empty name and else statement will print

#check if all files are csv files 
# files=["sss.csv","qqq.csv","aaa.csv"]

# for file in files:
#     if not file.endswith(".csv"):
#         print(f"{file} is not a csv")
#         break
# else:
#     print("all the files are csv")

#we use else only with the break 


#check whether any filename appears more than once 
# files=['report.csv','data.csv','report.csv','summary.docx']

# for file in files:
#     if file.count("files"):
#         print("duplicate found")
#         break
# else:
#     print("all are unique")


#nested for loop 

#outer loop-innerloop-outer loop-inner loop this is the way nested will run 

# for x in (1,2,3):
#     for y in(1,2):
#         print(x,y)

# for x in range(3):
#     for y in range(2):
#         for z in range(2):
#          print(f"({x},{y},{z})")

#use case crossing data 

# colors=["red","blue","green"]
# sizes=['l','m','s']
# for color in colors:
#     for size in sizes:
#         print(color,size)

#different hiercachy 

# years=[2025,2026]
# months=["jan","feb"]
# days=range(1,30)
# for y in years:
#     for m in months:
#         for d in days:
#             print(y,m,d)

#table contains the rows and coloumn 
# tables=['customers','orders','products']
# columns=['id','create_date']
# for t in tables:
#     for c in columns:
#         print(f'SELECT count(*) FROM {t} WHERE {c} IS NULL;')


# #star problems
# for i in range(5, 0, -1):
#     print("*" * i)


# #nested loop 
# for i in range(1,6):
#     for j in range(1,i+1):
#      print("*",end="")
#     print()

for i in range(1,6):
    print(" "*(5-i),end="")
    for j in range(i):
        print("*",end="")
    print()

