name=input("enter the name:")
age=int(input("enter the age:"))
city=input("enter the city name:")
height=float(input("enter the height:"))
print(name,age,city,height,sep=",",end="\n")


units=int(input("enter the number of units consumed:"))
price=6.50 
total_price=units*price
print(price)


dist=int(input("enter the distance :"))
fuel_efficiency=float(input("enter the fuel effienccy"))
fuelprice=int(input("enter the fuel price per litre:"))
total_fuel_cost=(dist/fuel_efficiency)*fuelprice
print(total_fuel_cost)



quant1,price=input("enter the quantity and the price:")
quant2,price2=input("enter the quantity and the price:")
print(f"{quant1*price+quant2*price2:.2f}")
