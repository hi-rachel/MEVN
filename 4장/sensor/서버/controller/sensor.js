const Sensor = require('../models/sensor.js'); 
const _ = require("fxjs/Strict"); 
const save = async(data)=> {
    const ret = await Sensor.findOneAndUpdate({
        "cnt" : {
            $eq : data.cnt
        }}, {
            $set : data
        }, {
            upsert: true, 
            multi: true, 
            new : true, 
            setDefaultsOnInsert: true
        }
    ).lean()
    return ret;  
};
// 전역변수로 증가시키는 setNextData
let cnt = 0;   
const setType = data =>{
    for(let key in data){
        if(key == 'time')data[key] = new Date(data[key])
        else data[key] = Number(data[key])
    } 
    return data; 
}
const setNextData = (jsonArray) =>{
    const l = jsonArray.length;    
    let data = jsonArray[cnt];  
    data = {cnt : cnt, ...setType(data)} 
    cnt = (cnt + 1) % l; 
    return data;    
}  

// 이터레이터로도 만들 수 있다. 
function *setCntIterator() {  
    let cnt = 0; 
    while (true) {
        yield cnt;
        cnt = (cnt + 1);  
    }
} 

const iterator = setCntIterator(); 
const setNextDataIterator = (jsonArray) =>{
    const l = jsonArray.length;      
    const cnt = _.go(
        iterator, 
        _.take(1));
    let data = jsonArray[cnt % l]; 
    data = {cnt : cnt, ...setType(data)};
    return data;    
}


//testModule
exports.emitSensorAndSave = (io, jsonArray)=>{
    return new Promise((resolve, reject) =>{
        const data = setNextData(jsonArray) 
        //const data = setNextDataIterator(jsonArray) 
        io.emit("sensor", data); 
        //save(data); 
        resolve(data)
    }) 
} 
   

