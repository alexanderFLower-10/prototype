import{
    getInstFromArr
} from './mainFunctions.ts';
import{
    ARMEmulator,
    HALTException
} from './ARMEmulator.ts'
import { Instruction } from './parameterClassDefinitions';
export const programInputArea : HTMLTextAreaElement = document.getElementById("IDE") as HTMLTextAreaElement;
export const errorBox : HTMLTextAreaElement = document.getElementById("errorBox") as HTMLTextAreaElement;
export const PC : HTMLInputElement = document.getElementById("PC") as HTMLInputElement;


/* eslint-disable @typescript-eslint/typedef */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/* eslint-enable @typescript-eslint/typedef */
interface NumMap<T> {
    [key: number]: T;
}


const executeButton : HTMLButtonElement = document.getElementById("executeButton") as HTMLButtonElement;
const filename : HTMLInputElement=  document.getElementById('filenNameInput') as HTMLInputElement;
const assembleButton : HTMLButtonElement = document.getElementById("assembleButton") as HTMLButtonElement;
const stepButton : HTMLButtonElement = document.getElementById("stepButton") as HTMLButtonElement;
const dissassembleButton : HTMLButtonElement = document.getElementById("disassembleButton") as HTMLButtonElement;
const stepBackButton : HTMLButtonElement = document.getElementById('stepBackButton') as HTMLButtonElement;
const logExecuteButton : HTMLButtonElement = document.getElementById('logExecuteButton') as HTMLButtonElement;
const logExecuteSlider : HTMLInputElement= document.getElementById('logExecuteSlider') as HTMLInputElement;
const r1 : HTMLInputElement = document.getElementById("R1") as HTMLInputElement;
const r2 : HTMLInputElement = document.getElementById("R2") as HTMLInputElement;
const r3 : HTMLInputElement = document.getElementById("R3") as HTMLInputElement;
const r4 : HTMLInputElement = document.getElementById("R4") as HTMLInputElement;
const r5 : HTMLInputElement = document.getElementById("R5") as HTMLInputElement;
const r6 : HTMLInputElement = document.getElementById("R6") as HTMLInputElement;
const r7 : HTMLInputElement = document.getElementById("R7") as HTMLInputElement;
const r8 : HTMLInputElement = document.getElementById("R8") as HTMLInputElement;
const SR : HTMLInputElement = document.getElementById("SR") as HTMLInputElement;
const m1 : HTMLInputElement = document.getElementById("M1") as HTMLInputElement;
const m2 : HTMLInputElement = document.getElementById("M2") as HTMLInputElement;
const m3 : HTMLInputElement = document.getElementById("M3") as HTMLInputElement;
const m4 : HTMLInputElement = document.getElementById("M4") as HTMLInputElement;
const m5 : HTMLInputElement = document.getElementById("M5") as HTMLInputElement;
const m6 : HTMLInputElement = document.getElementById("M6") as HTMLInputElement;
const m7 : HTMLInputElement = document.getElementById("M7") as HTMLInputElement;
const m8 : HTMLInputElement = document.getElementById("M8") as HTMLInputElement;
const m9 : HTMLInputElement = document.getElementById("M9") as HTMLInputElement;
const m10 : HTMLInputElement = document.getElementById("M10") as HTMLInputElement; 
export const RegisterInputs : HTMLInputElement[] = [r1, r2, r3, r4, r5, r6, r7, r8];
export const MemoryInputs : HTMLInputElement[] = [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10];







let ARM : ARMEmulator = new ARMEmulator([],[]);
let assembled : boolean = false;
let breakpoint : NumMap<string> = [];
intiliaseEventListeners();

export function dissassemble(){
    programInputArea.readOnly = false; 
    programInputArea.value = ARM.getRawInst().join('\n');
    ARM = new ARMEmulator([], []);
    resetMemory();
    resetRegisters();
}
function checkAssembledStatus() : boolean{
    if(assembled) return true;
    alert("Please assemble program first"); return false;
}
function modifyField(event : Event){
    const field : HTMLInputElement = event.target as HTMLInputElement;
    let num : number = Number(field.id.substring(1))

    switch(field.id.charAt(0)){
    case 'R':
        ARM.setRegister(num, Number(field.value)); break;
    case 'M':
        ARM.setMemory(num, Number(field.value)); break;
    case 'P': 
        ARM.setPC(Number(field.value)); break;
    case 'S':
        ARM.setSR(field.value);
    }
}
function stepBack(){
    if(!assembled){
        alert("Please assemble before stepping back"); return;
    }
    ARM.loadState(ARM.popState());
    updateMemory();
    updatRegisters();

}
function resetMemory(){
    for(let i : number = 0; i < MemoryInputs.length; i++){
        MemoryInputs[i].value ='0';
    }
}
function resetRegisters(){
    for(let i : number = 0; i < RegisterInputs.length; i++){
        RegisterInputs[i].value =  '0';
    }
    PC.value = "0";
    SR.value = "N/A";

}
function updateMemory(){
    for(let i : number = 0; i < MemoryInputs.length; i++){
        MemoryInputs[i].value = String(ARM.getMemory(i));
    }
}
function updatRegisters(){
    for(let i : number = 0; i < RegisterInputs.length; i++){
        RegisterInputs[i].value =  String(ARM.getRegister(i));
    }
    PC.value = String(ARM.getPC());
    SR.value = String(ARM.getSR());

}

function assembleProgram(){
    resetRegisters();
    resetMemory();
    let value: string = programInputArea.value;
    if(value == "") throw new Error("No code to be assembled");
    let array : string[] = value.split("\n");
    let instList : Instruction[] = getInstFromArr(array);    
    ARM = new ARMEmulator(instList, array);
    programInputArea.readOnly = true;
    breakpoint = [];
    for(let i : number = 0; i < instList.length; i++){
        breakpoint[i] = '';
    }
    assembled = true;
} 
function Step(){
    assembled ? ARM.Step() : alert("Please assemble before stepping");
}
function Execute(){
    if(!assembled){
        alert("Assemble before executing"); return;
    }
    while(!ARM.isHalted()){
        ARM.Step();
    }
}
function saveAsm(){

}
async function logExecute(){
    if(!assembled){ alert("Assemble before executing"); return;}
    let interval : number = Number(logExecuteSlider.value)*10;
    while(!ARM.isHalted()){
        await sleep(interval);
        ARM.logStep();
    }
}
function init(){

}
function intiliaseEventListeners(){
    r1.addEventListener("input", modifyField);
    r2.addEventListener("input", modifyField);
    r3.addEventListener("input", modifyField);
    r4.addEventListener("input", modifyField);
    r5.addEventListener("input", modifyField);
    r6.addEventListener("input", modifyField);
    r7.addEventListener("input", modifyField);
    r8.addEventListener("input", modifyField);
    PC.addEventListener("input", modifyField);
    SR.addEventListener("input", modifyField);
    m1.addEventListener("input", modifyField);
    m2.addEventListener("input", modifyField);
    m3.addEventListener("input", modifyField);
    m4.addEventListener("input", modifyField);
    m5.addEventListener("input", modifyField);
    m6.addEventListener("input", modifyField);
    m7.addEventListener("input", modifyField);
    m8.addEventListener("input", modifyField);
    m9.addEventListener("input", modifyField);
    m10.addEventListener("input", modifyField);
    assembleButton.addEventListener("click", assembleProgram);
    stepButton.addEventListener("click", Step);
    dissassembleButton.addEventListener("click", dissassemble);
    executeButton.addEventListener("click", Execute);
    stepBackButton.addEventListener("click", stepBack);
    logExecuteButton.addEventListener("click", logExecute);
}


