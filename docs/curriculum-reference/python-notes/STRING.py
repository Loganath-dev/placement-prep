#HOW TO WORK WITH DATA 
#STRING 
#text data is everywhere it holds some information 
#built in dunction type()
# name="Loganath"
# print(type(name))

# age=24
# print(type(age))
# print("Your age is:" + age) it will give the error 
# because the string concatenation is only between strings 
# to change we use str(value)
# age=24
# print(type(age))
# print("Your age is:" +str(age))
#str() is used to convert any datatype to the string 


#Math functions 
# password='123a'
# print(len(password))

# if len(password) < 8:
#    print("your password is too short ") 

# len() also calculates the space 

#count() - it is used to returns how often a word appears in the string 
#it is a str method and the output is integer
# text="""Python is easy to learn
# Python is very powerful"""
#print(count(python)) #it will be error because it is a methods 

# print(text.count("Python"))

 # python is a case sensitive 
# count() used to check how many unwanted characeters in the code 
 
#DATA TRANSFORMATION 

#replace()
#"2026/05/10"
#i want to change a / to -
# so we use replace()

# price="1234,56" #here i want to replace ,with .
# print(price.replace(",","."))

# phone_number="176-1234-56" #replace - to /
# print(phone_number.replace("-","/"))

# syntax of replace() is value.replace("old value","new value")
#to remove something we use this method 

# price="$1,299.99"
# print(price.replace("$","").replace(",","")) 
# each replace() runs on the result of one before it first replace the $ and comma next
# 
# challenge
# to convert the messy phone number 
# phone = "+49 (176) 123-4567"
# print(phone.replace("+","").replace("(","").replace(")","").replace("-","").replace(" ",""))

#Join strings 
# concatines

# firstname="loganath"
# lastname="M"
# print(firstname+" . "+lastname)

# use cases  
# foldername="C:/Users/Loganath"
# file="report.csv"
#to print the full path of the file

#f-string -it is modern,easy way to format and build strings
# f stands for the formatted 

# name="loganath"
# age=19
# is_student= False
# print("Myname is " +name +"i am"+age"years old and student status is"+is_student+".")
#  we not able to concate so we use formatted strings here
# the f strings will work with any kind of data types 
# print(f" Myname is {name},i am {age} years old and student status is {is_student}.")

# print(f"2+3={2+3}")

# print(f"{{this is me}}")

#split()
# "Adam-24-USA" spilting of one value to the three values
# stamp="2026-09-20 14:30"
# print(stamp.split(" "))  the result will be in the list format 
# we need to type what to be seperated in the split()

# stamp="2026-45-4"
# print(stamp.split("-")) 

# csvfile="1234,mac,usa,1974-67-5"
# print(csvfile.split(","))

# print("ha "*3) style the logs use the repated characters 
# print("#"*34)

#extraction indexing and slicing 
#in string each character has a position number called index value
#positive index starts from left to right(starts from 0 )
#negative index starts from right to left (starts from -1)

# text="python"
# # print(text[0:5]) #n-1
# print(text[-4:-1])
# print(text[0:3:2]) #here we need to use the start index like p is -5 from that it is the start 

#cleaning whitespaces -removing the spaces
# lstrip()-removes the space on leftside
# rstrip()-removes the space on the rightside
# without specify the left or right we use strip()-clean on both the sides 

# text=" engineering "
# print(text.lstrip())
# print(text.strip())
# it is used to remove the tabs and spaces 

# text="Data engineering".strip()
# print(text) #here the middle space is not removed 
# strip()not only remove the spaces but also any characters

# text="###sadc".strip("#")

# to check the unwanted spaces we first use the len() and after strip() to find the unwanted space

# text="  engineering "
# print(len(text))
# print(len(text.strip()))
# numbers of spaces =print(len(text)-len(text.strip()))

#case conversion 
#upper()
#lower()
# text="python-programming"
# print(text.upper())
# search=" Email".lower().strip()
# data="email".lower().strip()
# print(search == data )

#challenge 

# text="968-Maria, ( Data Engineer ) ;; 27y  "
# name=print(text[4:9])
# role=print(text[13:27])
# age=print(text[32:37])

#search for anything in string 
# phone="+49-176-12345"
# print(phone.startswith("+49"))
# print(phone.endswith("45"))
# email="loganth@gmail.com"
# print(email.endswith("@gmail.com"))

# #is email is valid and using @

# print("@"in email)
# phone1="+49-176-12345"
# phone2="48-654-15475"
# print(phone1[4:])
# print(phone2[3:]) #different countries has different length 

# print(phone1[phone1.find("-")+1:])

#string validation 
#for example the country only contains the letters not numbers 

# country=13
# # print(country.isalpha())
# print(country.isalpha())

# phone="1233455"
# print(phone.isnumeric())
# phone="1233-455" #is false due to a hyphen 

# name=input("enter the product name:")
# price=int(input("enter the product price:"))
# quantity=int(input("enter the product quantity:"))

# total=price*quantity
# discount=total*0.1
# print(f"product name:{name},total price:{total},discount:{discount},final price:{total-discount}")