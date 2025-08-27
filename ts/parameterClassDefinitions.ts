import { ARMEmulator } from "./ARMEmulator.ts";

export class Instruction{
    static readonly numbers : string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    static toBinary(n : number) : string{
        if(n == 0) return '';
        return this.toBinary(Math.floor(n/2)) + (n%2);
    }

    static toDenary(binaryNumber : string) : number{
        let total : number = 0;
        for(let i : number = 0; i < binaryNumber.length; i++){
            if(binaryNumber.charAt(i) == '1'){
                total += Math.pow(2, binaryNumber.length - (i+1));
            }
        }
        return total;
    }

    static initRegVal(RdRaw : string) : number{
        if(RdRaw.charAt(0) != 'R') throw new Error("Register should be used for the first parameter of this instrution")
        RdRaw = RdRaw.substring(1, RdRaw.length);
        for(let i : number = 0; i < (RdRaw).length; i++){
            if(!(ThreeParameterInstruction.numbers.includes(RdRaw.charAt(i)))) throw new Error("Rd value of instruction is not valid");
        }
        return Number(RdRaw);
    }

    static returnAddressingType(rawOperand2 : string) : [string, number]{
        let addressingType : string;
        let unfetchedOperand2 : string;
        if(rawOperand2.charAt(0) == 'R'){
            addressingType = "DR";
            unfetchedOperand2 = rawOperand2.substring(1);
        }
        else if(rawOperand2.charAt(0) == '#'){
            addressingType = "IM";
            unfetchedOperand2 = rawOperand2.substring(1);
        }
        else{
            addressingType = "DM";
            unfetchedOperand2 = rawOperand2;
        }
        
        for(let i : number= 0; i < unfetchedOperand2.length; i++){
            if(!ThreeParameterInstruction.numbers.includes(unfetchedOperand2.charAt(i))) throw new Error("Operand2 value of instruction is not valid");
        }
        
        return [addressingType, Number(unfetchedOperand2)];
    }

    static prepareForBinary(Parameters : ThreeParameterInstruction): [string, string]{
        let RnBin : string = Instruction.toBinary(Parameters.getRn());
        let Operand2Bin : string = Instruction.toBinary(Parameters.getOperand2());
        let max : number = Math.max(RnBin.length, Operand2Bin.length);
        RnBin = RnBin.padStart(max, '0');
        Operand2Bin = Operand2Bin.padStart(max, '0');
        return [RnBin, Operand2Bin];
    }
    clone() : this{
         return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}
export class ThreeParameterInstruction extends Instruction{
    private InstType : string;
    private Rd : number; private addressingType : string; private unfetchedOperand2 : number; private Instructions : string[]; private Rn: number; private operand2 : number;

    constructor(InstType : string, Rd : string, Rn : string, rawOperand2 : string){
        super();
        this.operand2 = -1;
        let placeholder : string;
        this.Instructions = ['ADD', 'SUB', 'AND', 'ORR', 'EOR', 'LSL', 'LSR']

        if(!this.Instructions.includes(InstType)) throw new Error(`Instruction type ${InstType} does not exist`);
        this.InstType = InstType;
        this.Rd = Instruction.initRegVal(Rd);
        this.Rn = Instruction.initRegVal(Rn);


        let tuple : [string, number] = Instruction.returnAddressingType(rawOperand2);
        this.addressingType = tuple[0];
        this.unfetchedOperand2 = tuple[1];
    }

    getInstType() : string{
        return this.InstType;
    }
    getRd() : number{
        return this.Rd;
    }
    getRn() : number{
        return this.Rn;
    }
    getAddressingType() : string{
        return this.addressingType;
    }
    getOperand2() : number{
        return this.operand2;
    }

    initialiseOperand2(ARM : ARMEmulator){
        if(this.addressingType == 'DM'){
            this.operand2 = ARM.getMemory(this.unfetchedOperand2);
        }
        else if(this.addressingType == 'DR'){
            this.operand2 = ARM.getRegister(this.unfetchedOperand2);
        }
        else if(this.addressingType == 'IM'){
            this.operand2 = this.unfetchedOperand2;
        }
        
    }
    initialiseRn(ARM : ARMEmulator){
        this.Rn = ARM.getRegister(this.Rn);
        
    }
}
export class TwoParameterInstruction extends Instruction{
    private InstType : string;
    private Rd : number; private addressingType : string; private unfetchedOperand2 : number; private Instructions : string[]; private operand2 : number;

    constructor(InstType : string, Rd : string, rawOperand2 : string){
        super();
        let placeholder : string;
        this.operand2 = -1;
        this.Instructions = ['ADD', 'SUB', 'AND', 'ORR', 'EOR', 'LSL', 'LSR']
        if(!this.Instructions.includes(InstType)) throw new Error(`Instruction type ${InstType} does not exist`);

        this.InstType = InstType;
        this.Rd = Instruction.initRegVal(Rd);


        let tuple : [string, number] = Instruction.returnAddressingType(rawOperand2);
        this.addressingType = tuple[0];
        this.unfetchedOperand2 = tuple[1];
    }
    getInstType() : string{
        return this.InstType;
    }
    getRd() : number{
        return this.Rd;
    }
    getAddressingType() : string{
        return this.addressingType;
    }
    getOperand2() : number{
        return this.operand2;
    }

    initialiseOperand2(ARM : ARMEmulator){
        // if it was STR then I need just the memory location to be parsed as operand 2 so I can store the data in that location
        if(this.InstType != 'STR'){
            if(this.addressingType == 'DM'){
                this.operand2 = ARM.getMemory(this.unfetchedOperand2);
            }
            else if(this.addressingType == 'DR'){
                this.operand2 = ARM.getRegister(this.unfetchedOperand2);
            }
            else if(this.addressingType == 'IM'){
                this.operand2 = this.unfetchedOperand2;
            }
        }
        else this.operand2 = this.unfetchedOperand2;

    }
    
}

export class BranchInst extends Instruction{
    private readonly conditions : string[] = ['EQ', 'NE', 'LT', 'GT'];
    private condition : string;  private label : string;
    constructor(BCondition : string, Label : string){
        super();
        this.label = Label;
        this.condition = this.initCondition(BCondition);
    }
    initCondition(BCondition : string) : string{
        let condition : string = BCondition.substring(1);
        if((!this.conditions.includes(condition))){
            if(condition.length == 0){
                // uncodintional
                this.condition = "UC";
            }
            else{
             throw new Error(`Condition ${condition} does not exist`);
            }
        }
        return condition;
    }
    getCondition() : string{
        return this.condition;
    }
    getLabel() : string{
        return this.label;
    }
}

export class WhiteSpace extends Instruction{
    constructor(){
        super();
    }
}

export class Label extends Instruction{
    label : string;
    constructor(line : string){
        super();
        if(line.charAt(line.length-1) != ":") throw new Error("Instruction not identified, did you use a colon at the end of your label?");
        this.label = line.substring(0, line.length-1);
    }
    getLabel() : string{
        return this.label;
    }
}

export class HALT extends Instruction{ 
    constructor() {
        super();
    }
}


