#control flow is the logic that we write to control how our code run
#for a control flow codewe  has conditional statement
#conditional statement use only when the one block is true or false 
#loops are used for repetative process until the condition is met 

#tools

#statements 
# to make decisions we use if else elif
# to repeat the tasks we use for ,while loops
# to control we use break,pass,continue

#booblean experessions 
#true or false 
#functions bool(),any(),all(),isinstance()
#comparison operators 
#logical operators 
#membership and identity operators 

#boolean values
# True when it has some value and non zero 
# False when it is empty or zero

# print(bool(123)) -true
# print(bool())-false
#print(bool(""))-false

#here we use any(),all(),any will return any one is true and all will return all the values are true 

# email="aaa@gmail.com"
# phone=""
# username=""
# print(any([email,phone,username]))
# print(all([email,phone,username]))

#comparison operators 
#it compares the two values and return true or false 
# print(10==10)
# print(10!=10)
# print(7>3)
# print(7 <= 6)
# print("a" < "b") #based on alphabetically 
# print("a" == "A") #FALSE DUE TO PYTHON IS CASE SENTITIVE 

#chained comparison 
#print(1<4<8) #checks from left side to right 
# age=20
# print(18<=age<=30)

#Logical operators 
# use to combine multiple boolean expersions 
# print(2<1 and 5==5)
# and is used when the both the conditions are true 
#or is used any one of the condition  is true 

#checks the system is under prseeur 
# cpu=70
# memory=95
# print(cpu>90 or memory>90)
#check the suer credentials 
# email=True
# password=False
# print(email and password )

#flips the true and false 
# print(5==8) #false
# print(not 5==8) #true

# name="" #false 
# print(not name) #true

#execution order we use () to which will excute first
#allow only if user is logged 
#or theya re guest but they must not be banned 

# is_logged=True
# is_guest=True
# is_banned=False

# print(is_logged or is_guest and not is_banned) #gfirst priorty is for and 

# #memebership operator in or not in 
# print("a" in "data")

#validate that the domain is not in banned list 
# domain="gamil.com"
# banned=["spam.com","aaa.com","ddd.com"]
# print(domain in banned)

# #identity operatoor is and is not 
# print("z" is not"z")

# a=[1,2,3]
# b=[1,2,3]
# c=a
# print(a is b) #returns false due to memory storage is differnet for differnet variable '
# print(a is c) #True
# a=5  #both having same value and same id 
# b=5
# print(a==b) #compare values 
# print(a is b) #compares id 
# we use is instead of == when checking for none


#challenges 
# username="bbbb"
# age=45
# print(username != "" and age >=45)

# password="12344556  "
# print(len(password))
# print(len(password)>=8 and password !=" ")

# email="aaa@gmail.com"
# print(email.endswith(".com"))
# print("@"in email)

# username="aaa88aa"
# print(isinstance(username,str))
# print(username is not None )
# print(len(username)>5)

# user="swkdjekdj"
# admin=["wdefrf","defref"]
# moderator=["swkdjekdj","dwcdcdec"]
# print(user in admin or user in moderator)
