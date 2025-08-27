export class Instruction {
    static numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    static toBinary(n) {
        if (n == 0)
            return '';
        return this.toBinary(Math.floor(n / 2)) + (n % 2);
    }
    static toDenary(binaryNumber) {
        let total = 0;
        for (let i = 0; i < binaryNumber.length; i++) {
            if (binaryNumber.charAt(i) == '1') {
                total += Math.pow(2, binaryNumber.length - (i + 1));
            }
        }
        return total;
    }
    static initRegVal(RdRaw) {
        if (RdRaw.charAt(0) != 'R')
            throw new Error("Register should be used for the first parameter of this instrution");
        RdRaw = RdRaw.substring(1, RdRaw.length);
        for (let i = 0; i < (RdRaw).length; i++) {
            if (!(ThreeParameterInstruction.numbers.includes(RdRaw.charAt(i))))
                throw new Error("Rd value of instruction is not valid");
        }
        return Number(RdRaw);
    }
    static returnAddressingType(rawOperand2) {
        let addressingType;
        let unfetchedOperand2;
        if (rawOperand2.charAt(0) == 'R') {
            addressingType = "DR";
            unfetchedOperand2 = rawOperand2.substring(1);
        }
        else if (rawOperand2.charAt(0) == '#') {
            addressingType = "IM";
            unfetchedOperand2 = rawOperand2.substring(1);
        }
        else {
            addressingType = "DM";
            unfetchedOperand2 = rawOperand2;
        }
        for (let i = 0; i < unfetchedOperand2.length; i++) {
            if (!ThreeParameterInstruction.numbers.includes(unfetchedOperand2.charAt(i)))
                throw new Error("Operand2 value of instruction is not valid");
        }
        return [addressingType, Number(unfetchedOperand2)];
    }
    static prepareForBinary(Parameters) {
        let RnBin = Instruction.toBinary(Parameters.getRn());
        let Operand2Bin = Instruction.toBinary(Parameters.getOperand2());
        let max = Math.max(RnBin.length, Operand2Bin.length);
        RnBin = RnBin.padStart(max, '0');
        Operand2Bin = Operand2Bin.padStart(max, '0');
        return [RnBin, Operand2Bin];
    }
    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}
export class ThreeParameterInstruction extends Instruction {
    InstType;
    Rd;
    addressingType;
    unfetchedOperand2;
    Instructions;
    Rn;
    operand2;
    constructor(InstType, Rd, Rn, rawOperand2) {
        super();
        this.operand2 = -1;
        let placeholder;
        this.Instructions = ['ADD', 'SUB', 'AND', 'ORR', 'EOR', 'LSL', 'LSR'];
        if (!this.Instructions.includes(InstType))
            throw new Error(`Instruction type ${InstType} does not exist`);
        this.InstType = InstType;
        this.Rd = Instruction.initRegVal(Rd);
        this.Rn = Instruction.initRegVal(Rn);
        let tuple = Instruction.returnAddressingType(rawOperand2);
        this.addressingType = tuple[0];
        this.unfetchedOperand2 = tuple[1];
    }
    getInstType() {
        return this.InstType;
    }
    getRd() {
        return this.Rd;
    }
    getRn() {
        return this.Rn;
    }
    getAddressingType() {
        return this.addressingType;
    }
    getOperand2() {
        return this.operand2;
    }
    initialiseOperand2(ARM) {
        if (this.addressingType == 'DM') {
            this.operand2 = ARM.getMemory(this.unfetchedOperand2);
        }
        else if (this.addressingType == 'DR') {
            this.operand2 = ARM.getRegister(this.unfetchedOperand2);
        }
        else if (this.addressingType == 'IM') {
            this.operand2 = this.unfetchedOperand2;
        }
    }
    initialiseRn(ARM) {
        this.Rn = ARM.getRegister(this.Rn);
    }
}
export class TwoParameterInstruction extends Instruction {
    InstType;
    Rd;
    addressingType;
    unfetchedOperand2;
    Instructions;
    operand2;
    constructor(InstType, Rd, rawOperand2) {
        super();
        let placeholder;
        this.operand2 = -1;
        this.Instructions = ['ADD', 'SUB', 'AND', 'ORR', 'EOR', 'LSL', 'LSR'];
        if (!this.Instructions.includes(InstType))
            throw new Error(`Instruction type ${InstType} does not exist`);
        this.InstType = InstType;
        this.Rd = Instruction.initRegVal(Rd);
        let tuple = Instruction.returnAddressingType(rawOperand2);
        this.addressingType = tuple[0];
        this.unfetchedOperand2 = tuple[1];
    }
    getInstType() {
        return this.InstType;
    }
    getRd() {
        return this.Rd;
    }
    getAddressingType() {
        return this.addressingType;
    }
    getOperand2() {
        return this.operand2;
    }
    initialiseOperand2(ARM) {
        if (this.InstType != 'STR') {
            if (this.addressingType == 'DM') {
                this.operand2 = ARM.getMemory(this.unfetchedOperand2);
            }
            else if (this.addressingType == 'DR') {
                this.operand2 = ARM.getRegister(this.unfetchedOperand2);
            }
            else if (this.addressingType == 'IM') {
                this.operand2 = this.unfetchedOperand2;
            }
        }
        else
            this.operand2 = this.unfetchedOperand2;
    }
}
export class BranchInst extends Instruction {
    conditions = ['EQ', 'NE', 'LT', 'GT'];
    condition;
    label;
    constructor(BCondition, Label) {
        super();
        this.label = Label;
        this.condition = this.initCondition(BCondition);
    }
    initCondition(BCondition) {
        let condition = BCondition.substring(1);
        if ((!this.conditions.includes(condition))) {
            if (condition.length == 0) {
                this.condition = "UC";
            }
            else {
                throw new Error(`Condition ${condition} does not exist`);
            }
        }
        return condition;
    }
    getCondition() {
        return this.condition;
    }
    getLabel() {
        return this.label;
    }
}
export class WhiteSpace extends Instruction {
    constructor() {
        super();
    }
}
export class Label extends Instruction {
    label;
    constructor(line) {
        super();
        if (line.charAt(line.length - 1) != ":")
            throw new Error("Instruction not identified, did you use a colon at the end of your label?");
        this.label = line.substring(0, line.length - 1);
    }
    getLabel() {
        return this.label;
    }
}
export class HALT extends Instruction {
    constructor() {
        super();
    }
}
