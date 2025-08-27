import { getInstFromArr } from "./mainFunctions.js";
import { ARMEmulator } from "./ARMEmulator.js";
export const programInputArea = document.getElementById("IDE");
export const errorBox = document.getElementById("errorBox");
export const PC = document.getElementById("PC");
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const executeButton = document.getElementById("executeButton");
const filename = document.getElementById('filenNameInput');
const assembleButton = document.getElementById("assembleButton");
const stepButton = document.getElementById("stepButton");
const dissassembleButton = document.getElementById("disassembleButton");
const stepBackButton = document.getElementById('stepBackButton');
const logExecuteButton = document.getElementById('logExecuteButton');
const logExecuteSlider = document.getElementById('logExecuteSlider');
const r1 = document.getElementById("R1");
const r2 = document.getElementById("R2");
const r3 = document.getElementById("R3");
const r4 = document.getElementById("R4");
const r5 = document.getElementById("R5");
const r6 = document.getElementById("R6");
const r7 = document.getElementById("R7");
const r8 = document.getElementById("R8");
const SR = document.getElementById("SR");
const m1 = document.getElementById("M1");
const m2 = document.getElementById("M2");
const m3 = document.getElementById("M3");
const m4 = document.getElementById("M4");
const m5 = document.getElementById("M5");
const m6 = document.getElementById("M6");
const m7 = document.getElementById("M7");
const m8 = document.getElementById("M8");
const m9 = document.getElementById("M9");
const m10 = document.getElementById("M10");
export const RegisterInputs = [r1, r2, r3, r4, r5, r6, r7, r8];
export const MemoryInputs = [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10];
let ARM = new ARMEmulator([], []);
let assembled = false;
let breakpoint = [];
intiliaseEventListeners();
export function dissassemble() {
    programInputArea.readOnly = false;
    programInputArea.value = ARM.getRawInst().join('\n');
    ARM = new ARMEmulator([], []);
    resetMemory();
    resetRegisters();
}
function checkAssembledStatus() {
    if (assembled)
        return true;
    alert("Please assemble program first");
    return false;
}
function modifyField(event) {
    const field = event.target;
    let num = Number(field.id.substring(1));
    switch (field.id.charAt(0)) {
        case 'R':
            ARM.setRegister(num, Number(field.value));
            break;
        case 'M':
            ARM.setMemory(num, Number(field.value));
            break;
        case 'P':
            ARM.setPC(Number(field.value));
            break;
        case 'S':
            ARM.setSR(field.value);
    }
}
function stepBack() {
    if (!assembled) {
        alert("Please assemble before stepping back");
        return;
    }
    ARM.loadState(ARM.popState());
    updateMemory();
    updatRegisters();
}
function resetMemory() {
    for (let i = 0; i < MemoryInputs.length; i++) {
        MemoryInputs[i].value = '0';
    }
}
function resetRegisters() {
    for (let i = 0; i < RegisterInputs.length; i++) {
        RegisterInputs[i].value = '0';
    }
    PC.value = "0";
    SR.value = "N/A";
}
function updateMemory() {
    for (let i = 0; i < MemoryInputs.length; i++) {
        MemoryInputs[i].value = String(ARM.getMemory(i));
    }
}
function updatRegisters() {
    for (let i = 0; i < RegisterInputs.length; i++) {
        RegisterInputs[i].value = String(ARM.getRegister(i));
    }
    PC.value = String(ARM.getPC());
    SR.value = String(ARM.getSR());
}
function assembleProgram() {
    resetRegisters();
    resetMemory();
    let value = programInputArea.value;
    if (value == "")
        throw new Error("No code to be assembled");
    let array = value.split("\n");
    let instList = getInstFromArr(array);
    ARM = new ARMEmulator(instList, array);
    programInputArea.readOnly = true;
    breakpoint = [];
    for (let i = 0; i < instList.length; i++) {
        breakpoint[i] = '';
    }
    assembled = true;
}
function Step() {
    assembled ? ARM.Step() : alert("Please assemble before stepping");
}
function Execute() {
    if (!assembled) {
        alert("Assemble before executing");
        return;
    }
    while (!ARM.isHalted()) {
        ARM.Step();
    }
}
function saveAsm() {
}
async function logExecute() {
    if (!assembled) {
        alert("Assemble before executing");
        return;
    }
    let interval = Number(logExecuteSlider.value) * 10;
    while (!ARM.isHalted()) {
        await sleep(interval);
        ARM.logStep();
    }
}
function init() {
}
function intiliaseEventListeners() {
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
