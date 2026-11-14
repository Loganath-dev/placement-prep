#integers are the whole number -2,4,-5,0
# float are the numbers with the decimal point,8.7,-7.4
# complex are the numbers to do advanced mathematical problems-3+4j

#types of a number 
# x=5
# y=5.7
# z=2+5j
# print(type(x))
# print(type(y))
# print(type(z))

# x="24"
# print(type(x))
# print(x*3)  #returns 242424 so we need to change the string to the integer
# x=int(x)
# print(type(x))
# print(x*3)  #returns 24*3=72

# x=3
# y=4
# print(complex(x,y))

#math operators 
# a=10
# b=2
# print(a+b)-12
# print(a-b)-8
# print(a*b)-20
# print(a**b)-100
# print(a/b)-5.0
# print(a//b)-5
# print(a%b) -0
#assignment operator
# x=2
# x+=3 x=x+3
# print(x)

#rounding numbers 

#measure distance 
# print(2-10) -(-8)
# to need  a positive value we can use abs(value)-return the absolute(nonnegative)value of a number
# print(abs(2-10))

# it use for mesaure the distance or size 

#rounding numbers 

# price=35.44452343
# print(round(price))
#to use floor(),ceil() we need to use import math
# import math
# price=35.44452343
# print(round(price,2)) #how many numbers need after the decimal point
# print(math.floor(price))  #need to use math because it is from math module 
# print(math.ceil(price)) #round to the upper value 
#so we dont need to round off and we need the same value only omiting the decimal part
#we can use math.trunc(x)
# import math
# x=7.23
# print(math.trunc(x))
#x=int(x)

#int() vs trunc()
#if we using math function we can use trunc else we can use int 
#round() used in data analysis 
#ceil() used for data engineering for the batches 

#advanced math
# import math 
# x=49
# print(math.sqrt(x))
# print(math.cos(x))
# print(math.sin(x))
# print(math.log(x))

#random use to generate the random numbers 
# import random 
# print(random.random())  generates the random float numbers 

# import random 
# print(random.randint(0,4)) #randint(start,end)
#it is used to generate the dummy data value 

# for age we can use randint(18,98) it will generate the different age for the people

#validation
# x=7.0
# print(x.is_integer())  it is  aobject of integer 


#to check which data type is 
# x=70
# print(isinstance(x,str))  #false 
# print(isinstance(x,int))  #true 


#challenge
#to generate the random integer between 1 to 100 and check if the result is an even number 
# import random
# x=random.randint(0,100)
# print(x)
# if x% 2==0:
#     print("random is even ")
# else:
#     print("random is odd")


