# # #PYTHON INTRODUCTION
# # #a set of instructions which will help to understand by the computer is known as programming language 
# # #the interperter will convert the python code into low level machine code called byte code 
# # pep code -autopep8

# comments are notes in the code 
# python skips the comments 

# PRINT FUNCTION
# print() a function helps to print the output

#print("HI PYTHON") we can use single or double quotes to print the text inside it 
# print("             ___")
# print("           / __)")
# print("    .-^^^-/  / ")
# print("__/         /   ")
# print("<__.|_|- |_|    ")

# print("\"Loganath\\c\\drive\"")
# a=5
# b=10
#c=a+b
#d=a*b
print("python is a ""progsrmming language")

#special characters in the python (escape sequences )
# we need to use "" to express the escape sequences 
# \"-if we want a double quote for a text inside a print() we use \""
#example -print("hello "python") this will leads to error so we use \" print("hello \"python\"")
# \'-to display the single quotes we can use the \'
# \\-we use this because if we write print("path:c:\users\python") here the python think \is a special character 
#if we need \we want to use\\ to avoid the error
# \n -at the end of my message it will create a extra new line 
# \t - to add a tab space 

# print("mess\n\n\n")
# print("mess2") here output mess three line after mess2
#print("mess\nmess2") output mess next line mess2 

#here is the challenge use only one print()

# print("Your Learning Path:\n   -Python Basics\n   -Data Engineering\n   -AI")
# it has a large space we use another method using triple quotes 
# print("""Your Learning Path:
# \n   -Python Basics
# \n   -Data Engineering
# \n   -AI""") 

# #here there is a new extraline so we remove the /n 
# print("""Your Learning Path:
# \t-Python Basics
# \t-Data Engineering
# \t-AI""") 

#we use the triple quotes to add a mutiple statemnets inside a single print() to print one by one 

#real use of print()
#to print the results we use it 
#communicate ,debugg,test 



#VARIABLES 
#A variable is a name we used to create to store a value-it is like a box where we give name and the logic
#x=1 here x is variable name and 1 is the value 
# x=1
# print(x) now x value is 1 
# x=2 now the x value is changes to 2 the final assigning value is taken
# print(x)
#we can add the variable in first or at the end
# name="loganath "
# print("my name is",name)
# print(name,"is learning python ")

# name="loganath "
# language="python"
# print("my name is",name)
# print(name,"is learning",language)
# print(name,"to become a",language,"developer")

# variables are used to make teh program dynamic 
# name to store a Value
# resuble at anytime 

#variable challenge is to make one variable dynamic
# name="loganath"
# print("info@datawith",name,".com")
# print("support@datawith",name,".com")
# print("www.datawith",name,".com")

# INPUT FUNCTION 
# It is used to get the input from the User
# for example in linkedin or any social media app will get the email and password form us 
# and also in the chatgpt we type what we need in the chat box and it will give the output 

# input("enter your name:")
# it only reads the users response so we need a correct output we need to assign a variable 
# name=input("enter your name:")
# print(name)

# hardcoded and dynamic in input()
# name=input("enter your name:") it is a dynamic value we cahnge change at any time 
# country="india"  here the country is a hardcoded value it means unless we didnt chnage it remains same 
# print(name)

# examples using the above learned 

# x='A'
# print(x) here x is a hardcoded value 
# Y=input("enter value:")
# print(Y) here y is the dynamic value

#DATA TYPES 
#Python has a different container with many sizes based on the data type it will place in a correct box
# here is the example 
# a=10 the python choose the correct box and store the value 
# b="hello" again the python choose the correct box for the str data type
# a="good morning" here the python check the containers and a is already present and 
# value is stored then the python erase the container and pick a new box that suitable for the new value

# python automatically detect the data type 
# the data types in python is dynamic

# for example there are two values "hello " and 50 
# and we using upper() -the hello changes to HELLO but 50 not applicable to that function -not allowed
# so python find what data types can we used 

# types of datatypes 
# none-no value inside it ,it is used to show the absence of any data 

# single value data type 
# integers-a numbers 
# float-a numbers with decimal point 
# string-the characters enclosed with single or double quotes 
# boolean -true or false used to handle logic and decision making 

# multi value data type -data structures
# list-
# dict-
# tuple
# set
#array

# a=10    int 
# b=3.14    float
# c="hello"  str
# d="1234"  str
# f=True    bool
# g=False   bool
# h=None    None
# i=""      str with no space
# j=" "     str with empty space

# Functions and datatypes 
# do something to data 
# value---function---new value 

# three types of functions 
# standalone functions-print(),input()
# methods of class-upper(),replace()
# operations-merge methods- symbols +,or,in,/

# functions are built in ,user defined and 3rd party like numpy,pandas 

# functions are independent block of code 
# methods are the functions belong to objects /classes

# syntax of function 
# function_name(value) 
# example
# print("hello")
# type(50)

# syntax for methods
# value.method_name() 
# example
# 'hello'.upper()
#print(50 .bit_length())

# examples 

# text="hi"
# number=10

# print(text)
# print(number)

# type(text)
# type(number)  #it will not print anything so we  need print()
# print(type(text))
# print(type(number))

# print(len(text))
# #print(len(number)) #it will not work because it is an integer 

# print(text.upper())
# print(number .bit_length())

#challenge 
# x=19
# y=174.5
# name="loganath"
# c=True


# print(x,"\n",y,"\n",name,c)
# print(x,name,sep="\n")
x=79
y=87
z=65
print(x,y,sep="\n")

