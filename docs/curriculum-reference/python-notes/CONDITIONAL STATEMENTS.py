#it checks the condition if true runs the code else it skips 
#if else ,if it is true do this else do nothing 

# score=100
# if score >= 90:
#     print("A")
# else:
#     print("C")

#We need to use the indentation to understands the python which code belongs 

#else will run only if block is false 
#if else ,if condition is true-do this else-do that 

#elif 
#multiconditional statements 
#grading statements 

#elif rules 
# comes after if and we can use mutiple elifs and it must need the conditions 

# score=68
# if score >= 80:
#     print("A")
# elif score >= 70:
#     print("B")
# elif score >=60:
#     print("c")
# else:
#     print("d")

#nested if 
# if statement inside if statement
#we use if the if has a two conditions 
# score=87
# project=True
# if score >= 80:
#      if project: #for boolean value we dont need to specify it 
#           print("A+")
#      else:
#           print("A")
    
# elif score >= 70:
#      print("B")
# elif score >=60:
#      print("c")
# else:
#      print("d")

#indepentend if  two indepented if statemhts ,all conditions must else 
# score=50
# project=True
# if score>=90:
#   print("HiGH score")
# else:
#   print("low score")

# if project:
#   print("project is submitted ")
# else:
#   print("not submitted")

#inline if stored in variable and if ans else must be add in a single line
# DO A IF CONDITION ELSE DO B
# score=70
# print("a" if score >=90 else "B" if score >=80 else "G") #the condtion is like for if ,else 
#we ned top use ifelse only not elif 

#match case 
#evaluate a value against the mutiple values ,run the code of the first match 

#convert the full country name in two letter 

# country="india"
# if country == "india":
#     print("IN")
# elif country =="gremany":
#     print("GE")
# else:
#     print("unknown country")

# match country:
#     case "india"|"bharat": here | is known as pipe if has two name 
#         print("IN")
#     case "gremany":
#         print("GE")
#     case "egypt":
#         print("eg")
#     case _:
#         print("unkonwn country ")

#if else if used for flexible lof=gic and multiple conditions 
#match case used only for the matching values 

#CHALLENGE 1 
#VALIDATE THE QUALITY AND CORRECTNESS OF EMAIL VALUES 
#RULES MUST NOT BE EMPTY ,MUST CONTAIN '.' AND '@ AND MUST HAVE ONLY "@"
#MUST BE END WITH .COM,.NET,.ORG
#NOT LONGER THAN 254 CHARCTERES
#MUST START AWITH LETER OR DIGIT 

# email="loganth@gmail.com"
# #remove the spaces 
# if email == "":
#     print("email cannot be empty ")
# elif not('.'in email and "@" in email):
#     print("email is invalid")

# elif email.count("@")!=1:
#     print("must have one @")
# elif len(email)>254:
#     print("must less than 254 ")
# elif not email.endswith((".com",".net",".org")):
#     print("must have .com")
# elif not (email[0].isalnum() and email[-1].isalnum()):
#     print("must start and end with letter and idigt ")

# else:
#     print("email is valid")

#if wer want independent condituion want to work we can use if 

#challenge 2 
#to validate the correctness and quality of passwords 
#rules are must not be empty ,must be 8 characters,must have 1 uppercase ,1 lower case,must not same as email 

# email="loganath@gmail.com"
# password=""

# if password == "":
#      print("password cannot be empty ")
# if len(password)<8 :
#      print("password is len than 8")
# if  not any((password.upper()and password.lower())):
#       print("password must have one upper and lower case")
# if password == email:
#      print("password not same as email")
# else:
#     print("password is correct")  
