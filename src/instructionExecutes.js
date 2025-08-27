import { Instruction } from "./parameterClassDefinitions.js";
export class ThreeParameterExecutes {
}
export class ADD extends ThreeParameterExecutes {
    Execute(ARM, Parameters) {
        ARM.setRegister(Parameters.getRd(), Parameters.getRn() + Parameters.getOperand2());
    }
}
export class SUB extends ThreeParameterExecutes {
    Execute(ARM, Parameters) {
        ARM.setRegister(Parameters.getRd(), Parameters.getRn() - Parameters.getOperand2());
    }
}
export class AND extends ThreeParameterExecutes {
    Execute(ARM, Parameters) {
        let tuple = Instruction.prepareForBinary(Parameters);
        let result = "";
        let RnBin = tuple[0];
        let Operand2Bin = tuple[1];
        for (let i = 0; i < RnBin.length; i++) {
            result += RnBin.charAt(i) == '1' && Operand2Bin.charAt(i) == '1' ? '1' : '0';
        }
        let value = Instruction.toDenary(result.replace(/^0+/, ''));
        ARM.setRegister(Parameters.getRd(), value);
    }
}
export class ORR extends ThreeParameterExecutes {
    Execute(ARM, Parameters) {
        let tuple = Instruction.prepareForBinary(Parameters);
        let result = "";
        let RnBin = tuple[0];
        let Operand2Bin = tuple[1];
        for (let i = 0; i < RnBin.length; i++) {
            result += RnBin.charAt(i) == '1' || Operand2Bin.charAt(i) == '1' ? '1' : '0';
        }
        let value = Instruction.toDenary(result.replace(/^0+/, ''));
        ARM.setRegister(Parameters.getRd(), value);
    }
}
export class EOR extends ThreeParameterExecutes {
    Execute(ARM, Parameters) {
        let tuple = Instruction.prepareForBinary(Parameters);
        let result = "";
        let RnBin = tuple[0];
        let Operand2Bin = tuple[1];
        for (let i = 0; i < RnBin.length; i++) {
            result += (RnBin.charAt(i) == '1' && Operand2Bin.charAt(i) == '0') || (RnBin.charAt(i) == '0' && Operand2Bin.charAt(i) == '1') ? '1' : '0';
        }
        let value = Instruction.toDenary(result.replace(/^0+/, ''));
        ARM.setRegister(Parameters.getRd(), value);
    }
}
export class LSL extends ThreeParameterExecutes {
    Execute(ARM, Parameters) {
        let result = Parameters.getRn() << Parameters.getOperand2();
        ARM.setRegister(Parameters.getRd(), result);
    }
}
export class LSR extends ThreeParameterExecutes {
    Execute(ARM, Parameters) {
        let result = Parameters.getRn() >> Parameters.getOperand2();
        ARM.setRegister(Parameters.getRd(), result);
    }
}
export class TwoParameterExecutes {
}
export class MOV extends TwoParameterExecutes {
    Execute(ARM, Parameters) {
        ARM.setRegister(Parameters.getRd(), Parameters.getOperand2());
    }
}
export class MVN extends TwoParameterExecutes {
    Execute(ARM, Parameters) {
        let initial = Instruction.toBinary(Parameters.getOperand2());
        let result = "";
        for (let i = 0; i < initial.length; i++) {
            result += initial.charAt(i) == '1' ? '0' : '1';
        }
        ARM.setRegister(Parameters.getRd(), Instruction.toDenary(result));
    }
}
export class LDR extends TwoParameterExecutes {
    Execute(ARM, Parameters) {
        ARM.setRegister(Parameters.getRd(), Parameters.getOperand2());
    }
}
export class STR extends TwoParameterExecutes {
    Execute(ARM, Parameters) {
        ARM.setMemory(Parameters.getOperand2(), ARM.getRegister(Parameters.getRd()));
    }
}
export class CMP extends TwoParameterExecutes {
    Execute(ARM, Parameters) {
        let value1 = ARM.getRegister(Parameters.getRd());
        let value2 = Parameters.getOperand2();
        let sr = (value1 == value2 ? 'EQ' : (value1 > value2 ? 'GT' : 'LT'));
        ARM.setSR(sr);
    }
}
export class BranchExecutes {
}
export class BEQ extends BranchExecutes {
    Execute(ARM, Info) {
        ARM.getSR() == 'EQ' ? ARM.setPC(ARM.getLabelLocation(Info.getLabel())) : null;
    }
}
export class BLT extends BranchExecutes {
    Execute(ARM, Info) {
        ARM.getSR() == 'LT' ? ARM.setPC(ARM.getLabelLocation(Info.getLabel())) : null;
    }
}
export class BGT extends BranchExecutes {
    Execute(ARM, Info) {
        ARM.getSR() == 'GT' ? ARM.setPC(ARM.getLabelLocation(Info.getLabel())) : null;
    }
}
export class BNE extends BranchExecutes {
    Execute(ARM, Info) {
        ARM.getSR() != 'EQ' ? ARM.setPC(ARM.getLabelLocation(Info.getLabel())) : null;
    }
}
export class BUC extends BranchExecutes {
    Execute(ARM, Info) {
        ARM.setPC(ARM.getLabelLocation(Info.getLabel()));
    }
}
