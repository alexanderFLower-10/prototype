import { ADD, AND, BEQ, BGT, BLT, BNE, BranchExecutes, BUC, CMP, EOR, LDR, LSL, LSR, MOV, MVN, ORR, STR, SUB, ThreeParameterExecutes, TwoParameterExecutes } from "./instructionExecutes.ts";
import { dissassemble, errorBox, PC, programInputArea, RegisterInputs } from "./main.ts";
import { BranchInst, HALT, Instruction, Label, ThreeParameterInstruction, TwoParameterInstruction, WhiteSpace } from "./parameterClassDefinitions.ts";
interface StringMap<T> {
    [key: string]: T;
}

export class ARMEmulator {
    private registers: number[]; private memory: number[]; private PC: number; private SR: string; private instList: Instruction[]; private Regcap: number; private stateHistory: Stack<ARMEmulatorState>; private labelMap: StringMap<number>; private ThreeParameterInstructionMap: StringMap<new () => ThreeParameterExecutes>; private TwoParameterInstructionMap: StringMap<new () => TwoParameterExecutes>; private BranchesInstructionMap: StringMap<new () => BranchExecutes>; 
    private PCDisplay: HTMLInputElement; private readonly rawInstWithLn: string[]; private InstDisplay: HTMLTextAreaElement; private readonly rawInst : string[]; private Memcap : number;
    private HALTED : boolean;
    constructor(instList: Instruction[], rawInst: string[]) {
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
        }
        this.TwoParameterInstructionMap = {
            'MOV': MOV,
            'MVN': MVN,
            'LDR': LDR,
            'STR': STR,
            'CMP': CMP,
        }
        this.BranchesInstructionMap = {
            'EQ': BEQ,
            'GT': BGT,
            'LT': BLT,
            'NE': BNE,
            'UC': BUC,

        }
        // displays line numbers for user
        if (!(instList.length == 0)) {
            this.rawInstWithLn = [];
            for (let i : number = 0; i < rawInst.length; i++) {
                this.rawInstWithLn[i] = (i + "   " + rawInst[i])
            }
            let temp: string = this.rawInstWithLn.join('\n');
            this.InstDisplay.value = temp;
            this.tick();
        }
    }
    isHalted() : boolean{return this.HALTED;}

    private initalPassMap(): StringMap<number> {
        // maps line numbers to labels
        let result: StringMap<number> = {};
        for (let i : number = 0; i < this.instList.length; i++) {
            if (this.instList[i] instanceof Label) {
                let temp: Label = this.instList[i] as Label;
                result[temp.getLabel()] = i;
            }
        }
        return result;
    }
    Step(): void {
        try{
            this.stateHistory.Push(this.getState());
            if (this.instList[this.PC] instanceof ThreeParameterInstruction) {
                let currentInst: ThreeParameterInstruction = this.instList[this.PC].clone() as ThreeParameterInstruction;
                currentInst.initialiseOperand2(this);
                currentInst.initialiseRn(this);
                let executable: ThreeParameterExecutes = new this.ThreeParameterInstructionMap[currentInst.getInstType()]();
                executable.Execute(this, currentInst);
                RegisterInputs[currentInst.getRd()].value = String(this.registers[currentInst.getRd()]);
            }
            else if (this.instList[this.PC] instanceof TwoParameterInstruction) {
                let currentInst: TwoParameterInstruction = this.instList[this.PC] as TwoParameterInstruction;
                currentInst.initialiseOperand2(this);
                let executable : TwoParameterExecutes = new this.TwoParameterInstructionMap[currentInst.getInstType()]();
                executable.Execute(this, currentInst);


                if (!(executable instanceof STR)) {
                    RegisterInputs[currentInst.getRd()].value = String(this.registers[currentInst.getRd()]);
                }
                else {
                    RegisterInputs[currentInst.getOperand2()].value = String(this.registers[currentInst.getOperand2()]);
                }
            }

            else if (this.instList[this.PC] instanceof BranchInst) {
                let currentInst: BranchInst = this.instList[this.PC] as BranchInst;
                let executable : BranchExecutes = new this.BranchesInstructionMap[currentInst.getCondition()]();
                executable.Execute(this, currentInst);
            }
            else if (this.instList[this.PC] instanceof HALT) {
                this.HALT();
            }



            this.PC++;
            this.PCDisplay.value = String(this.PC);

            this.tick();
        }
        catch(error)
        {
            errorBox.value = (error as Error).message;
            dissassemble();
        }

    }

    logStep(): void{
        this.Step();
    }
    // tick displays line numbers
    tick(): void {
        let rawInstructionsClone : string[] = Array.from(this.rawInstWithLn);
        rawInstructionsClone[this.PC] = this.PC + "  " + '>' +  this.rawInst[this.PC];
        this.InstDisplay.value = rawInstructionsClone.join('\n');
    }
    StepBack(): void {
        this.loadState(this.stateHistory.Pop());
    }
    HALT(): void {
        this.HALTED = true;
        throw new HALTException("Program Halted");
    }
    getRegCap(){return this.Regcap;}
    getMemCap(){return this.Memcap;}
    getRawInst() : string[]{
        return this.rawInst;
    }
    getPC(): number { return this.PC; }
    getSR(): string { return this.SR; }
    getRegister(index: number): number {
        if (index > this.Regcap) throw new Error("Register out of bounds (does not exist) on line " + this.PC);
        return this.registers[index];
    }
    getMemory(index: number): number {
        if (index > this.Memcap) throw new Error("Memory Address out of bounds (does not exist) on line " + this.PC);
        return this.memory[index];
    }
    popState() : ARMEmulatorState{
        return this.stateHistory.Pop();
    }
    getState(): ARMEmulatorState {
        return new ARMEmulatorState(this);
    }
    getLabelLocation(label: string): number {
        if (label in this.labelMap) return this.labelMap[label];
        else throw Error("Label " + label + " does not exist")
    }
    setRegister(index: number, value: number) {
        if(typeof value === "number"){
            if (index > this.Regcap) throw new Error("Register out of bounds (does not exist) on line " + this.PC);
            this.registers[index] = value;
        }
    }
    setMemory(index: number, value: number) {
        if (index > this.Memcap) throw new Error("Memory Address out of bounds (does not exist) on line " + this.PC);
        if(typeof value === "number"){
            this.memory[index] = value;
        }   
        
    }
    setPC(value: any) {
        if(typeof value === "number")  this.PC = value;

    }
    setSR(value: string) {
        if(value == 'GT' || value == 'EQ' || value == 'LT') this.SR = value;
    }
    loadState(state: ARMEmulatorState) {
        this.memory = state.getAllMemory();
        this.registers = state.getAllRegisters();
        this.PC = state.getPC();
        this.SR = state.getSR();
        this.tick();
    }

}
class Stack<T> {
    stack: T[]; front : number; length : number;
    constructor() {
        this.stack = [];
        this.front = -1;
        this.length = 0;
    }
    Push(value: T) {
        this.front++;
        this.stack[this.front] = value;
        this.length++;
    }
    Pop(): T {
        if (this.length == 0) throw new Error("Cannot step back anymore");
        let temp: T = this.stack[this.front];
        this.front--;
        this.length--;
        return temp;


    }

}
class ARMEmulatorState {
    private registers: number[]; private memory: number[]; private PC: number; private SR: string;
    constructor(ARM: ARMEmulator) {
        this.registers = [];
        this.memory = [];
        for (let i : number= 0; i < ARM.getRegCap(); i++) {
            this.registers[i] = ARM.getRegister(i);
            this.memory[i] = ARM.getMemory(i);
        }
        for(let i : number = ARM.getRegCap()-1; i < ARM.getMemCap(); i++){
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

export class HALTException extends Error{
    constructor(msg : string){
        super(msg);
        Object.setPrototypeOf(this, HALTException.prototype);
    }
}