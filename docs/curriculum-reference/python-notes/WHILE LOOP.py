#while loop
#for loop has predefined sequence known times ,list,range 
#while loop we use our own condition ,unknown times 
#while condition 
#for while loop we need to initlize value 
#i=1
#while i<4:
 # print(i)  the while loop dont know what i is 
#so we need to declare the value i in top 
#it will print ion infinity so we need to update the valkue of i 
#i+=1

# i=1            #initilization
# while i<4:     #condition
#     print(i)   #print it in a infinity times 
#     i+=1       #update the value so the loop will ends 

#counter from 1 to 5  #hardcodfed code 
# count=1
# while count<=5:
#     print(count)
#     count+=2

#write a program that keeps asking do you agree
# answer=""
# while answer !="yes":
#     answer=input("do you agree?(yes/no)")
# print("thankyou")
# output
# do you agree?(yes/no)no   
# do you agree?(yes/no)no
# do you agree?(yes/no)yes
# thankyou


#while true 
#no condition and update only boolean vale True 
#while True:
#(do something)
#if true else again while loop starts
#break 

# while True:
#     x=input("type")   runs many times until user types stop till while loop will run infinity 
#     if x=="stop":
#         break

#it is very risky 

# while True:
#     answer=input("do you agree?(yes/no)")
#     if answer=="yes":
#         break
# print("thankyou")

#for vs while 
#for loop over  afixed sequence ,predefined condition no of iteration is known ,processing data,safe ,simple,clear
#while loop loop while condition is true,unknown iteration,my conditions,waiting fro  external event ,adavnced ,flexible,complex,risk

#challenge allow up to three attempts only not getting yes ,3 strikes you are out
# while True: #changing the condition attempts<3
#      answer=input("do you agree?(yes/no)")
#      if answer=="yes":
#          break
# print("thankyou")

# attempts=0
# while attempts<3:
#      answer=input("do you agree?(yes/no)")
#      if answer == "yes":
#           print("glad we are on the same page ")
#           break
#      attempts+=1
# print("3 strikes,you are out")
# else:
#     print("3 strikes,you are out")

#output
# do you agree?(yes/no)no
# do you agree?(yes/no)yes
# glad we are on the same page 
# 3 strikes,you are out    so we use the else statement 