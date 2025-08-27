import { ADD, AND, BEQ, BGT, BLT, BNE, BUC, CMP, EOR, LDR, LSL, LSR, MOV, MVN, ORR, STR, SUB } from "./instructionExecutes.js";
import { dissassemble, errorBox, PC, programInputArea, RegisterInputs } from "./main.js";
import { BranchInst, HALT, Label, ThreeParameterInstruction, TwoParameterInstruction } from "./parameterClassDefinitions.js";
export class ARMEmulator {
    registers;
    memory;
    PC;
    SR;
    instList;
    Regcap;
    stateHistory;
    labelMap;
    ThreeParameterInstructionMap;
    TwoParameterInstructionMap;
    BranchesInstructionMap;
    PCDisplay;
    rawInstWithLn;
    InstDisplay;
    rawInst;
    Memcap;
    HALTED;
    constructor(instList, rawInst) {
        this.HALTED = (instList.length == 0) ? true : false;
        this.rawInst = rawInst;
        this.rawInstWithLn = [];
        this.InstDisplay = programInputArea;
        this.PCDisplay = PC;
        this.stateHistory = new Stack();
        this.instList = instList;
        this.Regcap = 8;
        this.Memcap = 10;
        this.registers = Array(this.Regcap).fill(0);
        this.memory = Array(this.Memcap).fill(0);
        this.PC = 0;
        this.SR = 'N/A';
        this.labelMap = this.initalPassMap();
        this.ThreeParameterInstructionMap = {
            'ADD': ADD,
            'SUB': SUB,
            'AND': AND,
            'ORR': ORR,
            'EOR': EOR,
            'LSL': LSL,
            'LSR': LSR,
        };
        this.TwoParameterInstructionMap = {
            'MOV': MOV,
            'MVN': MVN,
            'LDR': LDR,
            'STR': STR,
            'CMP': CMP,
        };
        this.BranchesInstructionMap = {
            'EQ': BEQ,
            'GT': BGT,
            'LT': BLT,
            'NE': BNE,
            'UC': BUC,
        };
        if (!(instList.length == 0)) {
            this.rawInstWithLn = [];
            for (let i = 0; i < rawInst.length; i++) {
                this.rawInstWithLn[i] = (i + "   " + rawInst[i]);
            }
            let temp = this.rawInstWithLn.join('\n');
            this.InstDisplay.value = temp;
            this.tick();
        }
    }
    isHalted() { return this.HALTED; }
    initalPassMap() {
        let result = {};
        for (let i = 0; i < this.instList.length; i++) {
            if (this.instList[i] instanceof Label) {
                let temp = this.instList[i];
                result[temp.getLabel()] = i;
            }
        }
        return result;
    }
    Step() {
        try {
            this.stateHistory.Push(this.getState());
            if (this.instList[this.PC] instanceof ThreeParameterInstruction) {
                let currentInst = this.instList[this.PC].clone();
                currentInst.initialiseOperand2(this);
                currentInst.initialiseRn(this);
                let executable = new this.ThreeParameterInstructionMap[currentInst.getInstType()]();
                executable.Execute(this, currentInst);
                RegisterInputs[currentInst.getRd()].value = String(this.registers[currentInst.getRd()]);
            }
            else if (this.instList[this.PC] instanceof TwoParameterInstruction) {
                let currentInst = this.instList[this.PC];
                currentInst.initialiseOperand2(this);
                let executable = new this.TwoParameterInstructionMap[currentInst.getInstType()]();
                executable.Execute(this, currentInst);
                if (!(executable instanceof STR)) {
                    RegisterInputs[currentInst.getRd()].value = String(this.registers[currentInst.getRd()]);
                }
                else {
                    RegisterInputs[currentInst.getOperand2()].value = String(this.registers[currentInst.getOperand2()]);
                }
            }
            else if (this.instList[this.PC] instanceof BranchInst) {
                let currentInst = this.instList[this.PC];
                let executable = new this.BranchesInstructionMap[currentInst.getCondition()]();
                executable.Execute(this, currentInst);
            }
            else if (this.instList[this.PC] instanceof HALT) {
                this.HALT();
            }
            this.PC++;
            this.PCDisplay.value = String(this.PC);
            this.tick();
        }
        catch (error) {
            errorBox.value = error.message;
            dissassemble();
        }
    }
    logStep() {
        this.Step();
    }
    tick() {
        let rawInstructionsClone = Array.from(this.rawInstWithLn);
        rawInstructionsClone[this.PC] = this.PC + "  " + '>' + this.rawInst[this.PC];
        this.InstDisplay.value = rawInstructionsClone.join('\n');
    }
    StepBack() {
        this.loadState(this.stateHistory.Pop());
    }
    HALT() {
        this.HALTED = true;
        throw new HALTException("Program Halted");
    }
    getRegCap() { return this.Regcap; }
    getMemCap() { return this.Memcap; }
    getRawInst() {
        return this.rawInst;
    }
    getPC() { return this.PC; }
    getSR() { return this.SR; }
    getRegister(index) {
        if (index > this.Regcap)
            throw new Error("Register out of bounds (does not exist) on line " + this.PC);
        return this.registers[index];
    }
    getMemory(index) {
        if (index > this.Memcap)
            throw new Error("Memory Address out of bounds (does not exist) on line " + this.PC);
        return this.memory[index];
    }
    popState() {
        return this.stateHistory.Pop();
    }
    getState() {
        return new ARMEmulatorState(this);
    }
    getLabelLocation(label) {
        if (label in this.labelMap)
            return this.labelMap[label];
        else
            throw Error("Label " + label + " does not exist");
    }
    setRegister(index, value) {
        if (typeof value === "number") {
            if (index > this.Regcap)
                throw new Error("Register out of bounds (does not exist) on line " + this.PC);
            this.registers[index] = value;
        }
    }
    setMemory(index, value) {
        if (index > this.Memcap)
            throw new Error("Memory Address out of bounds (does not exist) on line " + this.PC);
        if (typeof value === "number") {
            this.memory[index] = value;
        }
    }
    setPC(value) {
        if (typeof value === "number")
            this.PC = value;
    }
    setSR(value) {
        if (value == 'GT' || value == 'EQ' || value == 'LT')
            this.SR = value;
    }
    loadState(state) {
        this.memory = state.getAllMemory();
        this.registers = state.getAllRegisters();
        this.PC = state.getPC();
        this.SR = state.getSR();
        this.tick();
    }
}
class Stack {
    stack;
    front;
    length;
    constructor() {
        this.stack = [];
        this.front = -1;
        this.length = 0;
    }
    Push(value) {
        this.front++;
        this.stack[this.front] = value;
        this.length++;
    }
    Pop() {
        if (this.length == 0)
            throw new Error("Cannot step back anymore");
        let temp = this.stack[this.front];
        this.front--;
        this.length--;
        return temp;
    }
}
class ARMEmulatorState {
    registers;
    memory;
    PC;
    SR;
    constructor(ARM) {
        this.registers = [];
        this.memory = [];
        for (let i = 0; i < ARM.getRegCap(); i++) {
            this.registers[i] = ARM.getRegister(i);
            this.memory[i] = ARM.getMemory(i);
        }
        for (let i = ARM.getRegCap() - 1; i < ARM.getMemCap(); i++) {
            this.memory[i] = ARM.getMemory(i);
        }
        this.PC = ARM.getPC();
        this.SR = ARM.getSR();
    }
    getAllRegisters() {
        return this.registers;
    }
    getAllMemory() {
        return this.memory;
    }
    getPC() {
        return this.PC;
    }
    getSR() {
        return this.SR;
    }
}
export class HALTException extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, HALTException.prototype);
    }
}
