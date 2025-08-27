import { ARMEmulator } from "./ARMEmulator.ts";
import { Instruction, ThreeParameterInstruction, TwoParameterInstruction , BranchInst} from "./parameterClassDefinitions.ts";





export abstract class ThreeParameterExecutes{
    abstract Execute(ARM : ARMEmulator, Parameters : ThreeParameterInstruction) : void;
}
export class ADD extends ThreeParameterExecutes{

    Execute(ARM : ARMEmulator, Parameters : ThreeParameterInstruction) : void{
        ARM.setRegister(Parameters.getRd(), Parameters.getRn() + Parameters.getOperand2());
    }
}
export class SUB extends ThreeParameterExecutes{
    
    Execute(ARM : ARMEmulator, Parameters : ThreeParameterInstruction) : void{
        ARM.setRegister(Parameters.getRd(), Parameters.getRn() - Parameters.getOperand2());
    }
}
export class AND extends ThreeParameterExecutes{

    Execute(ARM : ARMEmulator, Parameters : ThreeParameterInstruction) : void{
        let tuple : [string, string] = Instruction.prepareForBinary(Parameters);
        let result : string = "";
        let RnBin : string = tuple[0];
        let Operand2Bin : string = tuple[1];
        for(let i : number = 0; i < RnBin.length; i++){
            result += RnBin.charAt(i) == '1' && Operand2Bin.charAt(i) == '1' ? '1' : '0'; 
        }
        let value : number= Instruction.toDenary(result.replace(/^0+/, ''));
        ARM.setRegister(Parameters.getRd(), value);
    }
}
export class ORR extends ThreeParameterExecutes{

    Execute(ARM : ARMEmulator, Parameters : ThreeParameterInstruction) : void{
        let tuple : [string, string] = Instruction.prepareForBinary(Parameters);
        let result : string = "";
        let RnBin : string = tuple[0];
        let Operand2Bin : string = tuple[1];
        for(let i : number = 0; i < RnBin.length; i++){
            result += RnBin.charAt(i) == '1' || Operand2Bin.charAt(i) == '1' ? '1' : '0'; 
        }
        let value : number = Instruction.toDenary(result.replace(/^0+/, ''));
        ARM.setRegister(Parameters.getRd(), value);
    }
}
export class EOR extends ThreeParameterExecutes{

    Execute(ARM : ARMEmulator, Parameters : ThreeParameterInstruction) : void{
        let tuple : [string, string] = Instruction.prepareForBinary(Parameters);
        let result : string = "";
        let RnBin : string = tuple[0];
        let Operand2Bin : string = tuple[1];
        for(let i : number = 0; i < RnBin.length; i++){
            result += (RnBin.charAt(i) == '1' && Operand2Bin.charAt(i) == '0' ) || (RnBin.charAt(i) == '0' && Operand2Bin.charAt(i) == '1' ) ? '1' : '0';
        }
        let value : number = Instruction.toDenary(result.replace(/^0+/, ''));
        ARM.setRegister(Parameters.getRd(), value);
    }
}
export class LSL extends ThreeParameterExecutes{

    Execute(ARM : ARMEmulator, Parameters : ThreeParameterInstruction) : void{
        let result : number = Parameters.getRn() <<  Parameters.getOperand2();
        ARM.setRegister(Parameters.getRd(), result);

    }
}
export class LSR extends ThreeParameterExecutes{

    Execute(ARM : ARMEmulator, Parameters : ThreeParameterInstruction) : void{
        let result : number = Parameters.getRn() >> Parameters.getOperand2();
        ARM.setRegister(Parameters.getRd(), result);
        
    }
}

export abstract class TwoParameterExecutes{
    abstract Execute(ARM : ARMEmulator, Parameters : TwoParameterInstruction) : void;
}
export class MOV extends TwoParameterExecutes{
    
    Execute(ARM : ARMEmulator, Parameters : TwoParameterInstruction) : void{
        ARM.setRegister(Parameters.getRd(), Parameters.getOperand2());
    }
}
export class MVN extends TwoParameterExecutes{
    
    Execute(ARM : ARMEmulator, Parameters : TwoParameterInstruction) : void{
        let initial : string = Instruction.toBinary(Parameters.getOperand2());
        let result : string = "";
        for(let i : number = 0; i < initial.length; i++){
            result+= initial.charAt(i) == '1' ? '0' : '1';
        }
        ARM.setRegister(Parameters.getRd(), Instruction.toDenary(result));
    }
}
export class LDR extends TwoParameterExecutes{
    
    Execute(ARM : ARMEmulator, Parameters : TwoParameterInstruction) : void{
        ARM.setRegister(Parameters.getRd(), Parameters.getOperand2());
    }
}
export class STR extends TwoParameterExecutes{
    
    Execute(ARM : ARMEmulator, Parameters : TwoParameterInstruction) : void{
        ARM.setMemory(Parameters.getOperand2(), ARM.getRegister(Parameters.getRd()));
    }
}
export class CMP extends TwoParameterExecutes{
    
    Execute(ARM: ARMEmulator, Parameters: TwoParameterInstruction): void {
        let value1 : number = ARM.getRegister(Parameters.getRd());
        let value2 : number = Parameters.getOperand2();
        let sr: string = (value1 == value2 ? 'EQ' : (value1 > value2 ? 'GT' : 'LT'));
        ARM.setSR(sr);
    }
}

export abstract class BranchExecutes{
    abstract Execute(ARM : ARMEmulator, Info : BranchInst) : void;
}
export class BEQ extends BranchExecutes{
    
    Execute(ARM: ARMEmulator, Info: BranchInst): void {
        ARM.getSR() == 'EQ' ? ARM.setPC(ARM.getLabelLocation(Info.getLabel())) : null;
    }
}
export class BLT extends BranchExecutes{
    
    Execute(ARM: ARMEmulator, Info: BranchInst): void {
        ARM.getSR() == 'LT' ? ARM.setPC(ARM.getLabelLocation(Info.getLabel())) : null;
    }
}
export class BGT extends BranchExecutes{
    
    Execute(ARM: ARMEmulator, Info: BranchInst): void {
        ARM.getSR() == 'GT' ? ARM.setPC(ARM.getLabelLocation(Info.getLabel())) : null;
    }
}
export class BNE extends BranchExecutes{
    
    Execute(ARM: ARMEmulator, Info: BranchInst): void {
        ARM.getSR() != 'EQ' ? ARM.setPC(ARM.getLabelLocation(Info.getLabel())) : null;
    }
}
export class BUC extends BranchExecutes{
    
    Execute(ARM: ARMEmulator, Info: BranchInst): void {
        ARM.setPC(ARM.getLabelLocation(Info.getLabel()));
    }
}