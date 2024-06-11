
const array3=[1,2,3,2,3,1,3,4,56]

// const uniqueArray=array.filter((item,index)=>array.indexOf(item)===index)
// const uniqueData=array.filter((item,index)=>{
//     return array.indexOf(item)===index
// })

const uniqueDataByReduce=array3.reduce((arr,num)=>{
   if(arr.indexOf(num)<0){
    arr.push(num)
   }
   return arr
},[])

const data3=array3.reduce((obj,num)=>{
    if(obj[num]){
    obj[num]++
    }else{
   obj[num]=1
    }
    return obj
},{})
console.log(uniqueDataByReduce,data3)


const array1=[25,52,15,11,10,21,0,6,0,52,25]

const array=[1,2,3,2,3,1,3,4,56]
// find unique element by set
// const uniqueElement=new Set([...array])
// console.log(uniqueElement)



// find number whose count is equal to 1 

let uniqueElements=array.reduce((obj,num)=>{
    
    if(obj[num]==1){
        obj[num]++
    }else{
        obj[num]=1
    }
return obj
},{})

console.log(uniqueElements)
console.log(Object.keys(uniqueElements))
const data=Object.keys(uniqueElements).filter((num,index)=>uniqueElements[num]==1)
console.log(data)

// remove duplcate element by only filter 
const data2=array.filter((num,index)=>{
    return array.indexOf(num)==index
})
console.log(data2)

let array5=[1]
console.log(array5?.[0])






